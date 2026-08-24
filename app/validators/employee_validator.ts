// app/validators/employee_validator.ts
import vine from '@vinejs/vine'

export const createEmployeeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().trim().email().unique({ table: 'users', column: 'email' }),
    phone: vine.string().trim().minLength(10).maxLength(15).optional(),
    password: vine.string().minLength(6).maxLength(32),
    role: vine.enum(['admin', 'employee']),
    designation: vine.string().trim().maxLength(255).optional(),
    salary: vine.number().positive().optional(),
    doj: vine.date().optional(),
    dob: vine.date().optional(),
    isActive: vine.boolean().optional(),
    // profileImage: vine.file({
    //   size: '5mb',
    //   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'heif'],
    // }).optional(),
  })
)

export const updateEmployeeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    email: vine.string().trim().email().optional(),
    phone: vine.string().trim().minLength(10).maxLength(15).optional(),
    role: vine.enum(['admin', 'employee']).optional(),
    designation: vine.string().trim().maxLength(255).optional(),
    salary: vine.number().positive().optional(),
    doj: vine.date().optional(),
    dob: vine.date().optional(),
    isActive: vine.boolean().optional(),
    password: vine.string().minLength(6).maxLength(32).optional(),
  //   profileImage: vine.file({
  //     size: '5mb',
  //     extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'heif'],
  //   }).optional(),
  })
)