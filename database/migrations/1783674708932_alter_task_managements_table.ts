// database/migrations/xxxxxx_add_renewal_date_and_client_name_to_task_management.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_management'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('renewal_date').nullable().after('follow_up_date')
      table.string('client_name', 255).nullable().after('reference_name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('renewal_date')
      table.dropColumn('client_name')
    })
  }
}