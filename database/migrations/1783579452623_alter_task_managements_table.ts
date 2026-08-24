// database/migrations/xxxxxx_add_insurance_type_and_registration_to_task_management.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_management'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // For Health category - New Business or Port
      table.enum('insurance_type', ['new_business', 'port']).nullable()
      
      // For Motor category - Registration Number
      table.string('registration_number', 50).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('insurance_type')
      table.dropColumn('registration_number')
    })
  }
}