import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class GoogleSheet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column({ columnName: 'sheet_url' })
  declare sheetUrl: string

  @column()
  declare folder: string

  @column({ columnName: 'access_type' })
  declare accessType: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'google_sheet_user',
    pivotForeignKey: 'google_sheet_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare assignedEmployees: ManyToMany<typeof User>
}