// app/models/late_deduction_rule.ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LateDeductionRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fromCount: number

  @column()
  declare toCount: number

  @column()
  declare deductionPercent: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}