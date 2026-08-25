import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TaskManagement from '#models/task_management'

export default class TaskStatusLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare taskId: number

  @column()
  declare changedBy: number | null

  @column()
  declare oldStatus: string | null

  @column()
  declare newStatus: string

  @column()
  declare remarks: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'changedBy',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TaskManagement, {
    foreignKey: 'taskId',
  })
  declare task: BelongsTo<typeof TaskManagement>
}