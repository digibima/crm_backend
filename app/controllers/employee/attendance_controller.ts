// app/controllers/employee/attendance_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import AttendanceService from '#services/attendance_service'
import { 
  checkInValidator, 
  checkOutValidator, 
  attendanceRequestValidator, 
  locationStatusValidator 
} from '#validators/attendance_validator'

export default class EmployeeAttendanceController {
  private attendanceService = new AttendanceService()

  /**
   * Check if employee is at office location
   * GET /employee/attendance/location-status
   */
  async locationStatus({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(locationStatusValidator)
      const status = await this.attendanceService.getLocationStatus({
        latitude: payload.latitude,
        longitude: payload.longitude
      })

      return response.ok({
        status: true,
        data: status
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Check In
   * POST /employee/attendance/check-in
   */
  async checkIn({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(checkInValidator)
      
      const ip = request.ip()

      const attendance = await this.attendanceService.checkIn(user.id, {
        ...payload,
        ip
      })

      return response.created({
        status: true,
        message: 'Check-in successful',
        data: {
          checkIn: attendance.checkIn?.toFormat('HH:mm:ss'),
          status: attendance.status,
          location: {
            latitude: attendance.checkInLatitude,
            longitude: attendance.checkInLongitude
          }
        }
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Check Out
   * POST /employee/attendance/check-out
   */
  async checkOut({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(checkOutValidator)
      
      const ip = request.ip()

      const attendance = await this.attendanceService.checkOut(user.id, {
        ...payload,
        ip
      })

      return response.ok({
        status: true,
        message: 'Check-out successful',
        data: {
          checkIn: attendance.checkIn?.toFormat('HH:mm:ss'),
          checkOut: attendance.checkOut?.toFormat('HH:mm:ss'),
          workingHours: this.formatMinutes(attendance.workingMinutes),
          status: attendance.status,
          location: {
            latitude: attendance.checkOutLatitude,
            longitude: attendance.checkOutLongitude
          }
        }
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Today's Attendance
   * GET /employee/attendance/today
   */
  async today({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const attendance = await this.attendanceService.getTodayAttendance(user.id)

      if (!attendance) {
        return response.ok({
          status: true,
          data: null,
          message: 'No attendance record for today'
        })
      }

      return response.ok({
        status: true,
        data: attendance
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Attendance History
   * GET /employee/attendance/history
   */
 async history({ auth, request, response }: HttpContext) {
  try {
    const user = auth.user!
    const month = request.input('month')
    const year = request.input('year')
    const fromDate = request.input('fromDate')
    const toDate = request.input('toDate')

    const history = await this.attendanceService.getAttendanceHistory(user.id, {
      month,
      year,
      fromDate,
      toDate
    })

    return response.ok({
      status: true,
      data: history
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}

  /**
   * Attendance Summary
   * GET /employee/attendance/summary
   */
  async summary({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const summary = await this.attendanceService.getAttendanceSummary(user.id)

      return response.ok({
        status: true,
        data: summary
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Create Attendance Request
   * POST /employee/attendance/request
   */
// app/controllers/employee/attendance_controller.ts

async createRequest({ auth, request, response }: HttpContext) {
  try {
    const user = auth.user!
    const payload = await request.validateUsing(attendanceRequestValidator)

    const attendanceRequest = await this.attendanceService.createAttendanceRequest(user.id, payload)

    return response.created({
      status: true,
      message: 'Attendance request submitted successfully',
      data: attendanceRequest
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
  /**
   * Get Employee's Attendance Requests
   * GET /employee/attendance/requests
   */
  async getRequests({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const requests = await this.attendanceService.getEmployeeRequests(user.id)

      return response.ok({
        status: true,
        data: requests
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Get Attendance Details
   * GET /employee/attendance/:id
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const attendance = await this.attendanceService.getAttendanceDetail(params.id)

      if (!attendance || attendance.employeeId !== user.id) {
        return response.notFound({
          status: false,
          message: 'Attendance record not found'
        })
      }

      return response.ok({
        status: true,
        data: attendance
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  private formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
}