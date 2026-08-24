// app/validators/leave_validator.ts
import vine from '@vinejs/vine'

export const leaveRequestValidator = vine.compile(
  vine.object({
    leaveTypeId: vine.number(),
    fromDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    toDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: vine.string().optional(),
    attachment: vine.string().optional(),
    isHalfDay: vine.boolean().optional(),
    halfDayType: vine.enum(['first_half', 'second_half']).optional()
  })
)

export const adminLeaveRequestValidator = vine.compile(
  vine.object({
    status: vine.enum(['Approved', 'Rejected']),
    remark: vine.string().optional(),
  })
)

export const leaveTypeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100),
    code: vine.string().minLength(2).maxLength(20),
    defaultDays: vine.number().positive(),
    isActive: vine.boolean().optional(),
  })
)