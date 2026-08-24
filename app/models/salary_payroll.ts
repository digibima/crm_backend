// app/models/salary_payroll.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class SalaryPayroll extends BaseModel {
  // ✅ Specify exact table name
  static table = 'salary_payroll'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare basicSalary: number

  @column()
  declare target: number

  @column()
  declare achievedPremium: number

  @column()
  declare excessPremium: number

  @column()
  declare incentive: number

  @column()
  declare lateCount: number

  @column()
  declare lateDeduction: number

  @column()
  declare bonus: number

  @column()
  declare netSalary: number

  @column()
  declare status: 'Draft' | 'Generated' | 'Paid'

  @column.dateTime()
  declare generatedAt: DateTime | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof User>
}