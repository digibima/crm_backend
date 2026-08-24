// app/validators/employee_task_validator.ts
import vine from '@vinejs/vine'

export const createEmployeeTaskValidator = vine.compile(
  vine.object({
    insuranceCategoryId: vine.number().optional(),
    insuranceSubCategoryId: vine.number().optional(),
    taskAction: vine.string().trim().minLength(1).maxLength(255),
    referenceName: vine.string().trim().maxLength(255).optional(),
    clientName: vine.string().trim().maxLength(255).optional(),
    insuranceCompanyId: vine.number().optional(),
    leadDate: vine.date().optional(),
    followUpDate: vine.date().optional(),
    renewalDate: vine.date().optional(),
    priority: vine.enum(['high', 'low', 'normal']).optional(),
    clientContactNumber: vine.string().trim().minLength(10).maxLength(15).optional(),
    status: vine.enum(['pending', 'in_progress', 'follow_up', 'call_again', 'completed', 'not_converted']).optional(),
    insuranceType: vine.enum(['new_business', 'port']).optional(),
    registrationNumber: vine.string().trim().maxLength(50).optional(),
    amount: vine.number().positive().optional(), 
    policyNumber: vine.string().trim().maxLength(100).optional(),
  })
)