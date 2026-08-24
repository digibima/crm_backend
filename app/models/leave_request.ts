// app/models/leave_request.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import LeaveType from './leave_type.js'

export default class LeaveRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare leaveTypeId: number

  @column.date()
  declare fromDate: DateTime

  @column.date()
  declare toDate: DateTime

  @column()
  declare totalDays: number
    @column()
  declare isHalfDay: boolean

  @column()
  declare halfDayType: 'first_half' | 'second_half' | null

  @column()
  declare reason: string | null

  @column()
  declare attachment: string | null

  @column()
  declare status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

  @column()
  declare adminRemark: string | null

  @column()
  declare approvedBy: number | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof User>

  @belongsTo(() => LeaveType, { foreignKey: 'leaveTypeId' })
  declare leaveType: BelongsTo<typeof LeaveType>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>
}