import vine from '@vinejs/vine'

export const createLeadValidator = vine.compile(
  vine.object({
    client_name: vine.string().trim(),
    user_id: vine.number(),
    registration_number: vine.string().trim(),
    client_contact_number: vine.string().trim(),
    registration_date: vine.string().optional(), 
  })
)