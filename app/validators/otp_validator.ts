// app/validators/otp_validator.ts
import vine from '@vinejs/vine'

export const sendOtpValidator = vine.compile(
  vine.object({
    mobile: vine.string().trim().minLength(10).maxLength(15),
    role: vine.enum(['superadmin', 'admin', 'employee'] as const),
  })
)

export const verifyOtpValidator = vine.compile(
  vine.object({
    mobile: vine.string().trim().minLength(10).maxLength(15),
    otp: vine.string().trim().minLength(4).maxLength(6),
    role: vine.enum(['superadmin', 'admin', 'employee'] as const),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
  })
)