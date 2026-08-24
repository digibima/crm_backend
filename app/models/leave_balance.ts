// app/models/leave_balance.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import LeaveType from './leave_type.js'

export default class LeaveBalance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare leaveTypeId: number

  @column()
  declare year: number

  @column()
  declare totalDays: number

  @column()
  declare usedDays: number

  @column()
  declare pendingDays: number

  @column()
  declare remainingDays: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof User>

  @belongsTo(() => LeaveType, { foreignKey: 'leaveTypeId' })
  declare leaveType: BelongsTo<typeof LeaveType>
}