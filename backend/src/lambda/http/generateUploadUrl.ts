import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getSignedUrl, updateAttachmentUrl } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing todoId in the request' })
      }
    }

    const userId = getUserId(event)
    const signedUrl: string = await getSignedUrl(todoId)
    await updateAttachmentUrl(signedUrl, todoId, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ uploadUrl: signedUrl })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
