// database/migrations/xxxxxx_create_insurance_companies_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'insurance_companies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.integer('sub_category_id').unsigned().references('id').inTable('insurance_sub_categories').onDelete('CASCADE')
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
      
      table.unique(['name', 'sub_category_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}