// app/models/leave_type.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import LeaveBalance from './leave_balance.js'
import LeaveRequest from './leave_request.js'

export default class LeaveType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare defaultDays: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => LeaveBalance)
  declare balances: HasMany<typeof LeaveBalance>

  @hasMany(() => LeaveRequest)
  declare requests: HasMany<typeof LeaveRequest>
}