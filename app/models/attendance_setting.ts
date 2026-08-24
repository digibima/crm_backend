// app/models/attendance_setting.ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AttendanceSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare officeStartTime: string

  @column()
  declare officeEndTime: string

  @column()
  declare graceMinutes: number

  @column()
  declare minimumWorkingMinutes: number

  @column()
  declare halfDayAfter: string | null

  @column()
  declare overtimeAfterMinutes: number

  @column()
  declare gpsRequired: boolean

  @column()
  declare allowManualRequest: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}