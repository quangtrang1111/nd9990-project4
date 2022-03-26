import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('helpers/todosAcess')

export class TodosAccess {
  constructor(
    private readonly documentClient = new DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.TODOS_INDEX_CREATED_AT
  ) {
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }).promise()

    logger.info("Got Todos with count", { count: result.Count })
    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(newTodoItem: TodoItem): Promise<TodoItem> {
    await this.documentClient
      .put({
        TableName: this.todosTable,
        Item: newTodoItem
      }).promise()

    logger.info("Created a new Todo", { newTodoItem })

    return newTodoItem
  }

  async deleteTodo(todoId: string, userId: string) {
    const deleteItem = await this.documentClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId, userId },
        ReturnValues: "ALL_OLD"
      }).promise()

    const deletedTodo = deleteItem.Attributes

    logger.info("Deleted a Todo", { deletedTodo })
  }

  async updateTodo(todoId: string, userId: string, updatedProperties: TodoUpdate) {
    const updateItem = await this.documentClient
      .update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: 'set #name = :name, #dueDate = :duedate, #done = :done',
        ExpressionAttributeValues: {
          ':name': updatedProperties.name,
          ':duedate': updatedProperties.dueDate,
          ':done': updatedProperties.done
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        }
      }).promise()

    const updatedTodo = updateItem.Attributes

    logger.info("Updated a Todo", { updatedTodo })
  }

  async updateAttachmentUrl(attachmentUrl: string, todoId: string, userId: string) {
    const updateItem = await this.documentClient
      .update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        },
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        }
      }).promise()

    const updatedTodo = updateItem.Attributes

    logger.info("Updated attachment url of a Todo", { updatedTodo })
  }
}
