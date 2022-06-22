import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createMovie } from '../../businessLogic/movie'
import { CreateMovieRequest } from '../../requests/CreateMovieRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('createMovie')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing createMovie event', { event })

  const userId = getUserId(event)
  const newMovie: CreateMovieRequest = JSON.parse(event.body)

  const newItem = await createMovie(userId, newMovie)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
