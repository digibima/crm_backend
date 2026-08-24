import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('name').notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password').notNullable()
      table.string('role', 50).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.string('mobile', 15).nullable().unique()
      table.boolean('is_mobile_verified').defaultTo(false)
      table.boolean('is_email_verified').defaultTo(false)
      table.string('ip', 45).nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.date('dob').nullable()
      table.date('doj').nullable()
      table.text('salary').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}