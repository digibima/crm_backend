// app/controllers/admin/report_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import ReportService from '#services/report_service'

export default class ReportController {
  private reportService = new ReportService()

  /**
   * ✅ Employee Performance Report with all filters + categories & companies
   * GET /admin/reports/employee-performance
   */
  async employeePerformance({ request, response }: HttpContext) {
    try {
      const filters = {
        // Date filters
        month: Number(request.input('month', new Date().getMonth() + 1)),
        year: Number(request.input('year', new Date().getFullYear())),
        
        // Employee filter
        employeeId: request.input('employeeId') ? Number(request.input('employeeId')) : undefined,
        
        // Insurance filters
        categoryId: request.input('categoryId') ? Number(request.input('categoryId')) : undefined,
        subCategoryId: request.input('subCategoryId') ? Number(request.input('subCategoryId')) : undefined,
        companyId: request.input('companyId') ? Number(request.input('companyId')) : undefined,
        insuranceType: request.input('insuranceType') || undefined,
        
        // Search
        search: request.input('search') || undefined,
        
        // Pagination
        page: Number(request.input('page', 1)),
        limit: Number(request.input('limit', 10))
      }

      const report = await this.reportService.getEmployeePerformanceReport(filters)

      return response.ok({
        status: true,
        message: 'Report generated successfully',
        data: report
      })
    } catch (error: any) {
      console.log('Error:', error)
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Export Report (CSV)
   * GET /admin/reports/export
   */
  async export({ request, response }: HttpContext) {
    try {
      const filters = {
        month: Number(request.input('month', new Date().getMonth() + 1)),
        year: Number(request.input('year', new Date().getFullYear())),
        employeeId: request.input('employeeId') ? Number(request.input('employeeId')) : undefined,
        categoryId: request.input('categoryId') ? Number(request.input('categoryId')) : undefined,
        subCategoryId: request.input('subCategoryId') ? Number(request.input('subCategoryId')) : undefined,
        companyId: request.input('companyId') ? Number(request.input('companyId')) : undefined,
        insuranceType: request.input('insuranceType') || undefined
      }

      const data = await this.reportService.exportReport(filters)

      // Generate CSV
      let csv = 'Employee Name,Designation,Leads,Quotes Shared,Converted,Conversion Rate,Net Premium\n'
      
      for (const row of data) {
        csv += `${row.employee_name},${row.designation},${row.leads},${row.quotes_shared},${row.converted},${row.conversion_rate},${row.net_premium}\n`
      }

      response.header('Content-Type', 'text/csv')
      response.header('Content-Disposition', `attachment; filename=employee-performance-${filters.month}-${filters.year}.csv`)
      
      return response.send(csv)
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
}