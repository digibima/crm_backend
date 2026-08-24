// app/models/incentive_rule.ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class IncentiveRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number | null 

  @column()
  declare ruleName: string

  @column()
  declare excessFrom: number

  @column()
  declare excessTo: number

  @column()
  declare incentivePercent: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}