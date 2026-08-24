// database/migrations/xxxxxx_change_assign_to_to_json.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_management'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Change assign_to to JSON type
      table.json('assign_to').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('assign_to').nullable().alter()
    })
  }
}