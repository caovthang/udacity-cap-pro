import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as uuid from 'uuid'

import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/movie'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing generateUploadUrl event', { event })

  const userId = getUserId(event)
  const movieId = event.pathParameters.movieId
  const attachmentId = uuid.v4()

  const uploadUrl = await generateUploadUrl(attachmentId)

  await updateAttachmentUrl(userId, movieId, attachmentId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}
