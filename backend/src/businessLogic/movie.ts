import 'source-map-support/register'

import * as uuid from 'uuid'

import { MoviesAccess } from '../dataLayer/MoviesAccess'
import { MoviesStorage } from '../dataLayer/MoviesStorage'
import { MovieItem } from '../models/MovieItem'
import { MovieUpdate } from '../models/MovieUpdate'
import { CreateMovieRequest } from '../requests/CreateMovieRequest'
import { UpdateMovieRequest } from '../requests/UpdateMovieRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('movies')

const moviesAccess = new MoviesAccess()
const moviesStorage = new MoviesStorage()

export async function getMovies(userId: string): Promise<MovieItem[]> {
  logger.info(`Retrieving all movies for user ${userId}`, { userId })

  return await moviesAccess.getMovieItems(userId)
}

export async function createMovie(userId: string, createMovieRequest: CreateMovieRequest): Promise<MovieItem> {
  const movieId = uuid.v4()

  const newItem: MovieItem = {
    userId,
    movieId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createMovieRequest
  }

  logger.info(`Creating Movie ${movieId} for user ${userId}`, { userId, movieId, movieItem: newItem })

  await moviesAccess.createMovieItem(newItem)

  return newItem
}

export async function updateMovie(userId: string, movieId: string, updateMovieRequest: UpdateMovieRequest) {
  logger.info(`Updating movie ${movieId} for user ${userId}`, { userId, movieId, movieUpdate: updateMovieRequest })

  const item = await moviesAccess.getMovieItem(movieId)

  if (!item)
    throw new Error('Item not found') 

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update movie ${movieId}`)
    throw new Error('User is not authorized to update item')
  }

  moviesAccess.updateMovieItem(movieId, updateMovieRequest as MovieUpdate)
}

export async function deleteMovie(userId: string, movieId: string) {
  logger.info(`Deleting movie ${movieId} for user ${userId}`, { userId, movieId })

  const item = await moviesAccess.getMovieItem(movieId)

  if (!item)
    throw new Error('Item not found')

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to delete movie ${movieId}`)
    throw new Error('User is not authorized to delete item')
  }

  moviesAccess.deleteMovieItem(movieId)
}

export async function updateAttachmentUrl(userId: string, movieId: string, attachmentId: string) {
  logger.info(`Generating attachment URL for attachment ${attachmentId}`)

  const attachmentUrl = await moviesStorage.getAttachmentUrl(attachmentId)

  logger.info(`Updating movie ${movieId} with attachment URL ${attachmentUrl}`, { userId, movieId })

  const item = await moviesAccess.getMovieItem(movieId)

  if (!item)
    throw new Error('Item not found')

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update movie ${movieId}`)
    throw new Error('User is not authorized to update item')
  }

  await moviesAccess.updateAttachmentUrl(movieId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
  logger.info(`Generating upload URL for attachment ${attachmentId}`)

  const uploadUrl = await moviesStorage.getUploadUrl(attachmentId)

  return uploadUrl
}
