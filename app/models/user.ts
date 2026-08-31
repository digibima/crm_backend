import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import GoogleSheet from '#models/google_sheet'
export default class User extends BaseModel {
    static accessTokens = DbAccessTokensProvider.forModel(User)

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string
  @column()
  declare plainPassword: string | null

  @column()
  declare role: string

  @column()
  declare designation: string | null

  @column()
  declare mobile: string | null
  @column()
declare profileImage: string | null

  @column()
  declare isActive: boolean

  @column()
  declare isEmailVerified: boolean

  @column()
  declare isMobileVerified: boolean

  @column()
  declare ip: string | null

  @column()
  declare latitude: string | null

  @column()
  declare longitude: string |null

  @column.date()
  declare dob: DateTime | null

  @column.date()
  declare doj: DateTime | null

  @column()
  declare salary: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null
  @manyToMany(() => GoogleSheet, {
  pivotTable: 'google_sheet_user',
  pivotForeignKey: 'user_id',
  pivotRelatedForeignKey: 'google_sheet_id',
})
declare googleSheets: ManyToMany<typeof GoogleSheet>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
      if (user.password) {
      }
    }
  }
}