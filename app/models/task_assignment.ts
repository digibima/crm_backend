// app/models/task_assignment.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations' 
import TaskManagement from './task_management.js'
import User from './user.js'

export default class TaskAssignment extends BaseModel {
  static table = 'task_assignments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare taskId: number

  @column()
  declare userId: number

  @column()
  declare assignedBy: number | null

  @column()
  declare status: 'pending' | 'in_progress' | 'follow_up' | 'call_again' | 'completed' | 'not_converted' | 'renewed'

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => TaskManagement, { foreignKey: 'taskId' })
  declare task: BelongsTo<typeof TaskManagement>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'assignedBy' })
  declare assignedByUser: BelongsTo<typeof User>
}