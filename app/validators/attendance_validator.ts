// app/validators/attendance_validator.ts
import vine from '@vinejs/vine'

export const checkInValidator = vine.compile(
  vine.object({
    latitude: vine.string().optional(),
    longitude: vine.string().optional(),
    remarks: vine.string().optional(),
  })
)

export const checkOutValidator = vine.compile(
  vine.object({
    latitude: vine.string().optional(),
    longitude: vine.string().optional(),
    remarks: vine.string().optional(),
  })
)

export const locationStatusValidator = vine.compile(
  vine.object({
    // In VineJS, fields are required by default
    // Just use .string() without .required()
    latitude: vine.string(),
    longitude: vine.string(),
  })
)

export const attendanceRequestValidator = vine.compile(
  vine.object({
    attendanceId: vine.number(),
    requestType: vine.enum(['Missed Check In', 'Missed Check Out', 'Wrong Time', 'Manual Attendance']),
    reason: vine.string().minLength(5),
    attachment: vine.string().optional(),
  })
)

export const adminUpdateAttendanceValidator = vine.compile(
  vine.object({
    attendanceDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    checkIn: vine.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    checkOut: vine.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    status: vine.enum(['Present', 'Late', 'Half Day', 'Absent']).optional(),
    remarks: vine.string().optional(),
  })
)

export const handleRequestValidator = vine.compile(
  vine.object({
    status: vine.enum(['Approved', 'Rejected']),
    remark: vine.string().optional(),
  })
)

export const updateSettingsValidator = vine.compile(
  vine.object({
    officeStartTime: vine.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    officeEndTime: vine.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    graceMinutes: vine.number().positive().optional(),
    minimumWorkingMinutes: vine.number().positive().optional(),
    halfDayAfter: vine.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    overtimeAfterMinutes: vine.number().positive().optional(),
    gpsRequired: vine.boolean().optional(),
    allowManualRequest: vine.boolean().optional(),
  })
  
)