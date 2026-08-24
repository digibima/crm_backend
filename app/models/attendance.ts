// app/models/attendance.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import AttendanceRequest from './attendance_request.js'

export default class Attendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column.date()
  declare attendanceDate: DateTime

  @column.dateTime()
  declare checkIn: DateTime | null

  @column.dateTime()
  declare checkOut: DateTime | null

  @column()
  declare checkInLatitude: number | null

  @column()
  declare checkInLongitude: number | null

  @column()
  declare checkOutLatitude: number | null

  @column()
  declare checkOutLongitude: number | null

  @column()
  declare checkInIp: string | null

  @column()
  declare checkOutIp: string | null

  @column()
  declare workingMinutes: number

  @column()
  declare overtimeMinutes: number

  @column()
  declare status: 'Present' | 'Late' | 'Half Day' | 'Absent'

  @column()
  declare remarks: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof User>

  @hasMany(() => AttendanceRequest)
  declare requests: HasMany<typeof AttendanceRequest>
}