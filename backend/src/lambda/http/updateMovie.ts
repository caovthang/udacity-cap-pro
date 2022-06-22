import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { updateMovie } from '../../businessLogic/movie'
import { UpdateMovieRequest } from '../../requests/UpdateMovieRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('updateMovie')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing updateMovie event', { event })

  const userId = getUserId(event)
  const movieId = event.pathParameters.movieId
  const updatedMovie: UpdateMovieRequest = JSON.parse(event.body)

  await updateMovie(userId, movieId, updatedMovie)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
