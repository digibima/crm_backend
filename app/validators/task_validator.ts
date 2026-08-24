// app/validators/task_validator.ts
import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
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
    renewalFollowUpDate: vine.date().optional(),
    registrationDate: vine.string().optional(),
    registration_date: vine.string().optional(), 
    assignTo: vine.number().optional(),
    priority: vine.enum(['high', 'low', 'normal']).optional(),
    clientContactNumber: vine.string().trim().minLength(10).maxLength(15).optional(),
    status: vine.enum(['pending', 'in_progress', 'follow_up', 'call_again', 'completed', 'not_converted']).optional(),
     quoteSent: vine.enum(['yes', 'no']).optional(),
     quoteShare: vine.enum(['yes', 'no']).optional(), 
   insuranceType: vine.enum(['new_business', 'port']).optional(),
    registrationNumber: vine.string().trim().maxLength(50).optional(),
    amount: vine.number().positive().optional(),
    policyNumber: vine.string().trim().maxLength(100).optional(),
     isRenewal: vine.boolean().optional(), 
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    insuranceCategoryId: vine.number().optional(),
    insuranceSubCategoryId: vine.number().optional(),
    taskAction: vine.string().trim().minLength(2).maxLength(255).optional(),
    referenceName: vine.string().trim().maxLength(255).optional(),
    clientName: vine.string().trim().maxLength(255).optional(), 
    insuranceCompanyId: vine.number().optional(),
    leadDate: vine.date().optional(),
    followUpDate: vine.date().optional(),
    renewalDate: vine.date().optional(),
    renewalFollowUpDate: vine.date().optional(),
    registrationDate: vine.string().optional(),
    registration_date: vine.string().optional(),
    assignTo: vine.number().optional(),
    priority: vine.enum(['high', 'low', 'normal']).optional(),
    clientContactNumber: vine.string().trim().minLength(10).maxLength(15).optional(),
    status: vine.enum(['pending', 'in_progress', 'follow_up', 'call_again', 'completed', 'not_converted']).optional(),
     quoteSent: vine.enum(['yes', 'no']).optional(),
     quoteShare: vine.enum(['yes', 'no']).optional(), 
   insuranceType: vine.enum(['new_business', 'port']).optional(),
    registrationNumber: vine.string().trim().maxLength(50).optional(),
    amount: vine.number().positive().optional(),
    policyNumber: vine.string().trim().maxLength(100).optional(),
     isRenewal: vine.boolean().optional(), 
  })
)

// Category Validators
export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
  })
)

export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const createSubCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    categoryId: vine.number(),
  })
)

export const updateSubCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    categoryId: vine.number().optional(),
    isActive: vine.boolean().optional(),
  })
)

// Company Validators
export const createCompanyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    subCategoryId: vine.number(),
  })
)

export const updateCompanyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    subCategoryId: vine.number().optional(),
    isActive: vine.boolean().optional(),
  })
)