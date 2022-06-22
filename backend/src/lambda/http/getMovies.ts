import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getMovies } from '../../businessLogic/movie'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('getMovies')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing getMovies event', { event })

  const userId = getUserId(event)

  const items = await getMovies(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
