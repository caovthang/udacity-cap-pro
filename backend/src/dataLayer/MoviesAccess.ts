import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const AWSXRay = require('aws-xray-sdk')

import { MovieItem } from '../models/MovieItem'
import { MovieUpdate } from '../models/MovieUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('moviesAccess')

const XAWS = AWSXRay.captureAWS(AWS)

export class MoviesAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly moviesTable = process.env.MOVIES_TABLE,
    private readonly moviesByUserIndex = process.env.MOVIES_BY_USER_INDEX
  ) {}

  async movieItemExists(movieId: string): Promise<boolean> {
    const item = await this.getMovieItem(movieId)
    return !!item
  }

  async getMovieItems(userId: string): Promise<MovieItem[]> {
    logger.info(`Getting all movies for user ${userId} from ${this.moviesTable}`)

    const result = await this.docClient.query({
      TableName: this.moviesTable,
      IndexName: this.moviesByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items

    logger.info(`Found ${items.length} movies for user ${userId} in ${this.moviesTable}`)

    return items as MovieItem[]
  }

  async getMovieItem(movieId: string): Promise<MovieItem> {
    logger.info(`Getting movie ${movieId} from ${this.moviesTable}`)

    const result = await this.docClient.get({
      TableName: this.moviesTable,
      Key: {
        movieId
      }
    }).promise()

    const item = result.Item

    return item as MovieItem
  }

  async createMovieItem(movieId: MovieItem) {
    logger.info(`Putting movie ${movieId} into ${this.moviesTable}`)

    await this.docClient.put({
      TableName: this.moviesTable,
      Item: movieId,
    }).promise()
  }

  async updateMovieItem(movieId: string, movieUpdate: MovieUpdate) {
    logger.info(`Updating movie item ${movieId} in ${this.moviesTable}`)

    await this.docClient.update({
      TableName: this.moviesTable,
      Key: {
        movieId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": movieUpdate.name,
        ":publishedDate": movieUpdate.publishedDate,
        ":done": movieUpdate.done
      }
    }).promise()   
  }

  async deleteMovieItem(movieId: string) {
    logger.info(`Deleting movie item ${movieId} from ${this.moviesTable}`)

    await this.docClient.delete({
      TableName: this.moviesTable,
      Key: {
        movieId
      }
    }).promise()    
  }

  async updateAttachmentUrl(movieId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL for movie ${movieId} in ${this.moviesTable}`)

    await this.docClient.update({
      TableName: this.moviesTable,
      Key: {
        movieId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

}
