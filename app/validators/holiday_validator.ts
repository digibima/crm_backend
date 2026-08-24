// app/validators/holiday_validator.ts
import vine from '@vinejs/vine'

export const createHolidayValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    holidayDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: vine.string().optional(),
    type: vine.enum(['public', 'festival', 'optional']).optional(),
    isPaid: vine.boolean().optional(),
    isRecurring: vine.boolean().optional(),
  })
)

export const updateHolidayValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255).optional(),
    holidayDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    description: vine.string().optional(),
    type: vine.enum(['public', 'festival', 'optional']).optional(),
    isPaid: vine.boolean().optional(),
    isRecurring: vine.boolean().optional(),
  })
)

export const bulkHolidayValidator = vine.compile(
  vine.object({
    holidays: vine.array(
      vine.object({
        title: vine.string().trim().minLength(2).maxLength(255),
        holidayDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        description: vine.string().optional(),
        type: vine.enum(['public', 'festival', 'optional']).optional(),
        isPaid: vine.boolean().optional(),
        isRecurring: vine.boolean().optional(),
      })
    )
  })
)