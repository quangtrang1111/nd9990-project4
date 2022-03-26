import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('helpers/todo')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Get Todos with user Id', { userId })

  return await todosAccess.getTodos(userId)
}

export async function createTodo(newTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
  const todoId = uuid.v4()
  logger.info('Create a Todo with generated Id', { todoId })

  const newTodoItem: TodoItem = {
    ...newTodoRequest,
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false
  }

  return await todosAccess.createTodo(newTodoItem)
}

export async function deleteTodo(todoId: string, userId: string) {
  logger.info('Delete a Todo with Id', { todoId })

  return await todosAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(todoId: string, userId: string, updatedProperties: UpdateTodoRequest) {
  logger.info('Update a Todo with Id', { userId })

  return await todosAccess.updateTodo(todoId, userId, updatedProperties)
}

export async function getSignedUrl(todoId: string): Promise<string> {
  logger.info('Get signed url of a Todo with Id', { todoId })

  return await attachmentUtils.getSignedUrl(todoId)
}

export async function updateAttachmentUrl(signedUrl: string, todoId: string, userId: string) {
  const attachmentUrl: string = signedUrl.split("?")[0]
  logger.info("Update the attachment url of a Todo with Id", { todoId, attachmentUrl })

  return await todosAccess.updateAttachmentUrl(attachmentUrl, todoId, userId)
}
