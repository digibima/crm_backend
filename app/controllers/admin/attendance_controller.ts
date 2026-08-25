// app/controllers/admin/attendance_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import AttendanceService from '#services/attendance_service'
import { adminUpdateAttendanceValidator, handleRequestValidator, updateSettingsValidator } from '#validators/attendance_validator'

export default class AdminAttendanceController {
  private attendanceService = new AttendanceService()

   async completeDashboard({ request, response }: HttpContext) {
    try {
      const filters = {
        employeeId: request.input('employeeId'),
        date: request.input('date'),
        month: request.input('month'),
        year: request.input('year'),
        status: request.input('status'),
        page: Number(request.input('page', 1)),
        limit: Number(request.input('limit', 20))
      }

      const dashboard = await this.attendanceService.getAdminCompleteDashboard(filters)

      return response.ok({
        status: true,
        message: 'Dashboard data fetched successfully',
        data: dashboard
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
  /**
   * Admin Dashboard
   * GET /admin/attendance/dashboard
   */
  async dashboard({ response }: HttpContext) {
    try {
      const dashboard = await this.attendanceService.getAdminDashboard()

      return response.ok({
        status: true,
        data: dashboard
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin Attendance List
   * GET /admin/attendance
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 20))
      
      const filters = {
        employeeId: request.input('employeeId'),
        status: request.input('status'),
        date: request.input('date'),
        month: request.input('month'),
        year: request.input('year')
      }

      const attendance = await this.attendanceService.getAdminAttendanceList(page, limit, filters)

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
   * Admin Attendance Detail
   * GET /admin/attendance/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const attendance = await this.attendanceService.getAttendanceDetail(params.id)

      if (!attendance) {
        return response.notFound({
          status: false,
          message: 'Attendance not found'
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
   * Admin Manual Attendance Update
   * PUT /admin/attendance/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(adminUpdateAttendanceValidator)
      const attendance = await this.attendanceService.updateAttendance(params.id, payload)

      return response.ok({
        status: true,
        message: 'Attendance updated successfully',
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
   * Admin Delete Attendance
   * DELETE /admin/attendance/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const result = await this.attendanceService.deleteAttendance(params.id)

      return response.ok({
        status: true,
        ...result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Get Attendance Requests
   * GET /admin/attendance/requests
   */
  async getRequests({ request, response }: HttpContext) {
    try {
      const status = request.input('status')
      const requests = await this.attendanceService.getAttendanceRequests(status)

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
   * Admin - Approve/Reject Request
   * PUT /admin/attendance/request/:id
   */
  async handleRequest({ params, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(handleRequestValidator)
      const admin = auth.user!

      const result = await this.attendanceService.handleAttendanceRequest(
        params.id,
        payload.status,
        payload.remark,
        admin.id
      )

      return response.ok({
        status: true,
        message: `Request ${payload.status} successfully`,
        data: result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Attendance Report
   * GET /admin/attendance/report
   */
  async report({ request, response }: HttpContext) {
    try {
      const filters = {
        employeeId: request.input('employeeId'),
        month: request.input('month'),
        year: request.input('year'),
        status: request.input('status')
      }

      const report = await this.attendanceService.getAttendanceReport(filters)

      return response.ok({
        status: true,
        data: report
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Get Attendance Settings
   * GET /admin/attendance/settings
   */
  async getSettings({ response }: HttpContext) {
    try {
      const settings = await this.attendanceService.getSettings()

      return response.ok({
        status: true,
        data: settings
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Update Attendance Settings
   * PUT /admin/attendance/settings
   */
  async updateSettings({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateSettingsValidator)
      const settings = await this.attendanceService.updateSettings(payload)

      return response.ok({
        status: true,
        message: 'Settings updated successfully',
        data: settings
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
  async editAttendance({ params, request, response }: HttpContext) {
  try {
    const payload = await request.validateUsing(adminUpdateAttendanceValidator)
    
    console.log('📝 Editing attendance:', params.id)
    console.log('📊 Data:', payload)

    const attendance = await this.attendanceService.editAttendance(
      Number(params.id),
      payload
    )

    return response.ok({
      status: true,
      message: 'Attendance updated successfully',
      data: attendance
    })
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
/**
 * Filter Attendance by Name, Month, Year
 * GET /admin/attendance/filter
 */
async filterMonthlyAttendance({ request, response }: HttpContext) {
  try {
    const filters = {
      search: request.input('search') || request.input('name'), // Name/email search
      employeeId: request.input('employeeId') ? Number(request.input('employeeId')) : undefined,
      month: request.input('month') ? Number(request.input('month')) : undefined,
      year: request.input('year') ? Number(request.input('year')) : undefined,
      status: request.input('status'),
      page: Number(request.input('page', 1)),
      limit: Number(request.input('limit', 31))
    }

    const result = await this.attendanceService.getFilteredEmployeeAttendance(filters)

    return response.ok({
      status: true,
      message: 'Filtered attendance fetched successfully',
      data: result
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
}