// app/models/insurance_company.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import InsuranceSubCategory from './insurance_sub_category.js'

export default class InsuranceCompany extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({
  columnName: 'sub_category_id',
})
declare subCategoryId: number// This should be camelCase

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => InsuranceSubCategory, {
    foreignKey: 'subCategoryId'
  })
  declare subCategory: BelongsTo<typeof InsuranceSubCategory>
}