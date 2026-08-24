import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),

    password: vine.string().minLength(6),

    role: vine.enum(['superadmin', 'admin', 'employee'] as const),
  })
)  