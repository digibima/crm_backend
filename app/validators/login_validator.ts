 // app/validators/login_validator.ts
import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(4),
    role: vine.enum(['superadmin', 'admin', 'employee'] as const),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
  })
)