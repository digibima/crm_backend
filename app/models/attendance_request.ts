// app/models/attendance_request.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Attendance from './attendance.js'

export default class AttendanceRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare attendanceId: number

  @column()
  declare requestType: 'Missed Check In' | 'Missed Check Out' | 'Wrong Time' | 'Manual Attendance'

  @column()
  declare reason: string

  @column()
  declare attachment: string | null

  @column()
  declare status: 'Pending' | 'Approved' | 'Rejected'

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

  @belongsTo(() => Attendance, { foreignKey: 'attendanceId' })
  declare attendance: BelongsTo<typeof Attendance>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>
}