import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'

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
    await deleteTodo(todoId, userId)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({})
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
