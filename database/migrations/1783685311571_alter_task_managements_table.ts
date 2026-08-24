// database/migrations/xxxxxx_add_workflow_fields_to_task_management.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_management'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('call_response', 50).nullable()
      table.string('not_responded_action', 100).nullable()
      table.string('responded_option', 50).nullable()
      table.string('conversion_status', 50).nullable()
      table.text('flow_comment').nullable()
      table.decimal('flow_amount', 10, 2).nullable()
      table.timestamp('flow_date_time').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('call_response')
      table.dropColumn('not_responded_action')
      table.dropColumn('responded_option')
      table.dropColumn('conversion_status')
      table.dropColumn('flow_comment')
      table.dropColumn('flow_amount')
      table.dropColumn('flow_date_time')
    })
  }
}