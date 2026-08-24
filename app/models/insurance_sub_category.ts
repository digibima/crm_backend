// app/models/insurance_sub_category.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import InsuranceCategory from './insurance_category.js'
import InsuranceCompany from './insurance_company.js'

export default class InsuranceSubCategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({
  columnName: 'category_id',
})
declare categoryId: number// This should be camelCase

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => InsuranceCategory, {
    foreignKey: 'categoryId' // Specify the foreign key
  })
  declare category: BelongsTo<typeof InsuranceCategory>

  @hasMany(() => InsuranceCompany, {
    foreignKey: 'subCategoryId'
  })
  declare companies: HasMany<typeof InsuranceCompany>
}