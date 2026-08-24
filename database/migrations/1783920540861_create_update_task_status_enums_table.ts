// database/migrations/xxxxxx_update_task_status_enum.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_management'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', [
        'pending', 
        'in_progress', 
        'follow_up', 
        'call_again', 
        'completed', 
        'not_converted'
      ]).defaultTo('pending').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', ['pending', 'completed']).defaultTo('pending').alter()
    })
  }
}