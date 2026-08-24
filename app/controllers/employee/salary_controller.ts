// app/controllers/employee/salary_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import EmployeeSalaryService from '#services/employee_salary_service'
import { DateTime } from 'luxon'

export default class EmployeeSalaryController {
  private salaryService = new EmployeeSalaryService()

  /**
   * ✅ Single API - Employee Salary Dashboard
   * GET /api/employee/salary/dashboard
   */
  async dashboard({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await this.salaryService.getEmployeeSalaryDashboard(user.id)

      return response.ok({
        status: true,
        message: 'Salary data fetched successfully',
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
   * Get Salary by Month
   * GET /api/employee/salary/month
   */
  async getByMonth({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const month = Number(request.input('month', DateTime.now().month))
      const year = Number(request.input('year', DateTime.now().year))

      const data = await this.salaryService.getSalaryByMonth(user.id, month, year)

      return response.ok({
        status: true,
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
   * Get Salary Breakdown
   * GET /api/employee/salary/breakdown
   */
  async breakdown({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const month = Number(request.input('month', DateTime.now().month))
      const year = Number(request.input('year', DateTime.now().year))

      const data = await this.salaryService.getSalaryBreakdown(user.id, month, year)

      return response.ok({
        status: true,
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
   * Get Payslip
   * GET /api/employee/salary/payslip/:month/:year
   */
  async payslip({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const month = Number(params.month)
      const year = Number(params.year)

      if (!month || !year) {
        return response.badRequest({
          status: false,
          message: 'Month and year are required'
        })
      }

      const data = await this.salaryService.getPayslip(user.id, month, year)

      return response.ok({
        status: true,
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
   * Get Salary Stats
   * GET /api/employee/salary/stats
   */
  async stats({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await this.salaryService.getSalaryStats(user.id)

      return response.ok({
        status: true,
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
}