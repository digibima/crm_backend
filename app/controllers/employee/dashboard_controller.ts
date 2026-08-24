// app/controllers/employee/dashboard_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import EmployeeDashboardService from '#services/employee_dashboard_service'

export default class EmployeeDashboardController {
  private dashboardService = new EmployeeDashboardService()

  /**
   * ✅ Complete Employee Dashboard
   * GET /api/employee/dashboard
   */
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      const dashboard = await this.dashboardService.getEmployeeDashboard(user.id)

      return response.ok({
        status: true,
        message: 'Dashboard data fetched successfully',
        data: dashboard
      })
    } catch (error: any) {
      console.error('❌ Dashboard Error:', error)
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
}