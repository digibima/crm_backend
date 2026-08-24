// app/models/task_management.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import InsuranceCategory from './insurance_category.js'
import InsuranceSubCategory from './insurance_sub_category.js'
import InsuranceCompany from './insurance_company.js'

export default class TaskManagement extends BaseModel {
  static table = 'task_management'

  @column({ isPrimary: true })
  declare id: number

  @column({
  columnName: 'insurance_category_id',
})
declare insuranceCategoryId: number | null

  @column({
  columnName: 'insurance_sub_category_id',
})
declare insuranceSubCategoryId: number | null

 @column({ columnName: 'task_action' })
declare taskAction: string

  @column()
  declare referenceName: string | null
    @column()
  declare clientName: string | null
@column({
  columnName: 'insurance_company_id',
})
declare insuranceCompanyId: number | null

  @column.date()
  declare leadDate: DateTime | null

  @column.date()
  declare followUpDate: DateTime | null
   @column.date()
  declare renewalDate: DateTime | null 
  @column.date()
  declare renewalFollowUpDate: DateTime | null 

   @column()
  declare registrationDate: string | null

  @column({
  columnName: 'assign_to',
})
declare assignTo: number | null

@column({
  columnName: 'assign_by',
})
declare assignBy: number | null

  @column()
  declare priority: 'high' | 'low' | 'normal'

  @column({
  columnName: 'user_id',
})
declare userId: number
@column({
  columnName: 'client_contact_number',
})
declare clientContactNumber: string | null

  @column()
  declare status: 'pending' | 'in_progress' | 'follow_up' | 'call_again' | 'completed' | 'not_converted'

  @column({
  columnName: 'is_active',
})
declare isActive: boolean
  @column()
  declare insuranceType: 'new_business' | 'port' | null 

  @column()
  declare registrationNumber: string | null 
   @column()
  declare callResponse: string | null

  @column()
  declare notRespondedAction: string | null

  @column()
  declare respondedOption: string | null
   @column()
  declare quoteSent: 'yes' | 'no' | null 
   @column()
  declare quoteShare: 'yes' | 'no' | null 

  @column()
  declare conversionStatus: string | null

  @column()
  declare flowComment: string | null

  @column()
  declare flowAmount: number | null

  @column.dateTime()
  declare flowDateTime: DateTime | null
   @column()
  declare amount: number | null

  @column()
  declare policyNumber: string | null
  @column()
  declare isRenewal: boolean 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => InsuranceCategory)
  declare insuranceCategory: BelongsTo<typeof InsuranceCategory>

  @belongsTo(() => InsuranceSubCategory)
  declare insuranceSubCategory: BelongsTo<typeof InsuranceSubCategory>

  @belongsTo(() => InsuranceCompany)
  declare insuranceCompany: BelongsTo<typeof InsuranceCompany>

  @belongsTo(() => User, { foreignKey: 'assignTo' })
  declare assignToUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'assignBy' })
  declare assignByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}