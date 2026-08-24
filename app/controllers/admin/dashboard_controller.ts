// app/controllers/admin/dashboard_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import DashboardService from '#services/dashboard_service'

export default class AdminDashboardController {
  private dashboardService = new DashboardService()

  /**
   * ✅ Complete Admin Dashboard
   * GET /api/admin/dashboard
   */
  async index({ response }: HttpContext) {
    try {
      const dashboard = await this.dashboardService.getAdminDashboard()

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