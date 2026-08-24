// app/controllers/employee/leave_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import LeaveService from '#services/leave_service'
import { leaveRequestValidator } from '#validators/leave_validator'
import { DateTime } from 'luxon'

export default class EmployeeLeaveController {
  private leaveService = new LeaveService()

  /**
   * ✅ SINGLE EMPLOYEE LEAVE API
   */
  async dashboard({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const year = Number(request.input('year', DateTime.now().year))

      const data = await this.leaveService.getEmployeeLeaveDashboard(user.id, year)

      return response.ok({
        status: true,
        message: 'Leave data fetched successfully',
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async createRequest({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(leaveRequestValidator)
      if (payload.isHalfDay === undefined) {
      payload.isHalfDay = false
    }
    if (payload.isHalfDay && !payload.halfDayType) {
      return response.badRequest({
        status: false,
        message: 'halfDayType is required for half day leave'
      })
    }

    if (!payload.isHalfDay && payload.halfDayType) {
      return response.badRequest({
        status: false,
        message: 'halfDayType should only be provided for half day leave'
      })
    }

      const leaveRequest = await this.leaveService.createLeaveRequest(user.id, payload)
      
      return response.created({
        status: true,
        message: 'Leave request submitted successfully',
        data: leaveRequest
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async cancelRequest({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const result = await this.leaveService.cancelLeaveRequest(params.id, user.id)

      return response.ok({
        status: true,
        message: 'Leave request cancelled successfully',
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