import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteMovie } from '../../businessLogic/movie'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('deleteMovie')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing deleteMovie event', { event })

  const userId = getUserId(event)
  const movieId = event.pathParameters.movieId

  await deleteMovie(userId, movieId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
