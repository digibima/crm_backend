// app/controllers/admin/leave_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import LeaveService from '#services/leave_service'
import { adminLeaveRequestValidator, leaveTypeValidator } from '#validators/leave_validator'
import { DateTime } from 'luxon'

export default class AdminLeaveController {
  private leaveService = new LeaveService()
  async dashboard({ request, response }: HttpContext) {
    try {
      const filters = {
        employeeId: request.input('employeeId'),
        status: request.input('status'),
        fromDate: request.input('fromDate'),
        toDate: request.input('toDate'),
        year: Number(request.input('year', DateTime.now().year)),
        page: Number(request.input('page', 1)),
        limit: Number(request.input('limit', 20))
      }

      const data = await this.leaveService.getAdminLeaveDashboard(filters)

      return response.ok({
        status: true,
        message: 'Leave dashboard data fetched successfully',
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Get all employees with leave balances
   * GET /admin/leaves/employees
   */
  async getEmployees({ request, response }: HttpContext) {
    try {
      const year = Number(request.input('year', DateTime.now().year))
      const data = await this.leaveService.getEmployeesWithLeaveBalances(year)

      return response.ok({
        status: true,
        message: 'Employees with leave balances fetched successfully',
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Manually assign leave to employee
   * POST /admin/leaves/assign
   */
  async assignLeave({ request, response }: HttpContext) {
    try {
      const { employeeId, leaveTypeId, days, year, reason } = request.only([
        'employeeId',
        'leaveTypeId',
        'days',
        'year',
        'reason'
      ])

      if (!employeeId || !leaveTypeId || !days) {
        return response.badRequest({
          status: false,
          message: 'employeeId, leaveTypeId and days are required'
        })
      }

      if (days <= 0) {
        return response.badRequest({
          status: false,
          message: 'Days must be greater than 0'
        })
      }

      const result = await this.leaveService.assignLeaveToEmployee({
        employeeId,
        leaveTypeId,
        days,
        year,
        reason
      })

      return response.ok({
        status: true,
        message: result.message,
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
   * ✅ Admin - Create/Update leave balance (Single employee)
   * POST /admin/leaves/balance
   */
  async createOrUpdateBalance({ request, response }: HttpContext) {
    try {
      const { employeeId, leaveTypeId, year, totalDays, usedDays, pendingDays, reason } = request.only([
        'employeeId',
        'leaveTypeId',
        'year',
        'totalDays',
        'usedDays',
        'pendingDays',
        'reason'
      ])

      console.log('📝 createOrUpdateBalance called with:', { employeeId, leaveTypeId, year, totalDays, usedDays, pendingDays })

      // Validate
      if (!employeeId || !leaveTypeId || !year || totalDays === undefined) {
        return response.badRequest({
          status: false,
          message: 'employeeId, leaveTypeId, year and totalDays are required'
        })
      }

      if (totalDays < 0) {
        return response.badRequest({
          status: false,
          message: 'Total days cannot be negative'
        })
      }

      const result = await this.leaveService.createOrUpdateLeaveBalance({
        employeeId,
        leaveTypeId,
        year,
        totalDays,
        usedDays: usedDays || 0,
        pendingDays: pendingDays || 0,
        reason
      })

      return response.ok({
        status: true,
        message: result.message,
        data: result.balance
      })
    } catch (error: any) {
      console.error('❌ Error in createOrUpdateBalance:', error)
      return response.badRequest({
        status: false,
        message: error.message || 'Failed to update leave balance'
      })
    }
  }

  /**
   * Admin - Get single employee leave balance
   * GET /admin/leaves/balance/:employeeId
   */
  async getEmployeeBalance({ params, request, response }: HttpContext) {
    try {
      const employeeId = Number(params.employeeId)
      const year = Number(request.input('year', DateTime.now().year))

      if (!employeeId) {
        return response.badRequest({
          status: false,
          message: 'Employee ID is required'
        })
      }

      const result = await this.leaveService.getEmployeeLeaveBalance(employeeId, year)

      return response.ok({
        status: true,
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
   * Admin - Delete leave balance
   * DELETE /admin/leaves/balance/:id
   */
  async deleteBalance({ params, response }: HttpContext) {
    try {
      const balanceId = Number(params.id)

      if (!balanceId) {
        return response.badRequest({
          status: false,
          message: 'Balance ID is required'
        })
      }

      const result = await this.leaveService.deleteLeaveBalance(balanceId)

      return response.ok({
        status: true,
        message: result.message
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Reset all leave balances for an employee
   * POST /admin/leaves/balance/reset
   */
  async resetBalances({ request, response }: HttpContext) {
    try {
      const { employeeId, year, reason } = request.only([
        'employeeId',
        'year',
        'reason'
      ])

      if (!employeeId) {
        return response.badRequest({
          status: false,
          message: 'Employee ID is required'
        })
      }

      const result = await this.leaveService.resetEmployeeLeaveBalances({
        employeeId,
        year: year || DateTime.now().year,
        reason
      })

      return response.ok({
        status: true,
        message: result.message,
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
   * Admin - Approve/Reject Leave Request
   * PUT /admin/leaves/request/:id
   */
  async handleRequest({ params, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(adminLeaveRequestValidator)
      const admin = auth.user!

      const result = await this.leaveService.handleLeaveRequest(
        params.id,
        payload.status,
        payload.remark,
        admin.id
      )

      return response.ok({
        status: true,
        message: `Leave request ${payload.status.toLowerCase()} successfully`,
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
   * Admin - Get Leave Types
   * GET /admin/leaves/types
   */
  async getTypes({ response }: HttpContext) {
    try {
      const types = await this.leaveService.getLeaveTypes()

      return response.ok({
        status: true,
        data: types
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Admin - Create/Update Leave Type
   * POST /admin/leaves/types
   */
  async updateType({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(leaveTypeValidator)
      const result = await this.leaveService.updateLeaveType(payload)

      return response.ok({
        status: true,
        message: payload.id ? 'Leave type updated successfully' : 'Leave type created successfully',
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