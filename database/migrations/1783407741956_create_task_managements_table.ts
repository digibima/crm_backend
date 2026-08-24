import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_management'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('insurance_category_id')
        .unsigned()
        .references('id')
        .inTable('insurance_categories')

      table
        .integer('insurance_sub_category_id')
        .unsigned()
        .references('id')
        .inTable('insurance_sub_categories')

      table.string('task_action').notNullable()

      table.string('reference_name').nullable()

      table
        .integer('insurance_company_id')
        .unsigned()
        .references('id')
        .inTable('insurance_companies')

      table.date('lead_date').nullable()

      table.date('follow_up_date').nullable()

      // users.id = BIGINT UNSIGNED
      table
        .bigInteger('assign_to')
        .unsigned()
        .references('id')
        .inTable('users')

      table
        .bigInteger('assign_by')
        .unsigned()
        .references('id')
        .inTable('users')

      table
        .bigInteger('user_id')
        .unsigned()
        .references('id')
        .inTable('users')

      table
        .enum('priority', ['high', 'low', 'normal'])
        .defaultTo('normal')

      table.string('client_contact_number', 15).nullable()

      table
        .enum('status', ['pending', 'completed'])
        .defaultTo('pending')

      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at').notNullable()

      table.timestamp('updated_at').nullable()

      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}