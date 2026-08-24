// app/services/report_service.ts
import TaskManagement from '#models/task_management'
import User from '#models/user'
import InsuranceCategory from '#models/insurance_category'
import InsuranceCompany from '#models/insurance_company'
import { DateTime } from 'luxon'

export default class ReportService {

  /**
   * Safe number conversion helper
   */
  private safeNumber(value: any): number {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  /**
   * ✅ SINGLE API - Employee Performance Report with Filters
   */
  async getEmployeePerformanceReport(filters?: {
    month?: number
    year?: number
    employeeId?: number
    categoryId?: number
    subCategoryId?: number
    companyId?: number
    insuranceType?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const month = filters?.month || DateTime.now().month
    const year = filters?.year || DateTime.now().year
    const page = filters?.page || 1
    const limit = filters?.limit || 10

    // ========== 1. GET ALL EMPLOYEES ==========
    const employeesQuery = User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'designation')

    // Apply employee filter
    if (filters?.employeeId) {
      employeesQuery.where('id', filters.employeeId)
    }

    const employees = await employeesQuery

    // ========== 2. GET ALL CATEGORIES & COMPANIES FOR FILTERS ==========
    const categories = await InsuranceCategory.query()
      .whereNull('deleted_at')
      .select('id', 'name')
      .orderBy('name', 'asc')

    const companies = await InsuranceCompany.query()
      .whereNull('deleted_at')
      .select('id', 'name')
      .orderBy('name', 'asc')

    // ========== 3. CALCULATE FOR EACH EMPLOYEE ==========
    const employeeData = []
    let totalLeads = 0
    let totalQuotesShared = 0
    let totalConverted = 0
    let totalNetPremium = 0

    for (const employee of employees) {
      // Build base query for this employee
      const query = TaskManagement.query()
        .where('assign_to', employee.id)
        .whereNull('deleted_at')
        .whereRaw('MONTH(created_at) = ?', [month])
        .whereRaw('YEAR(created_at) = ?', [year])

      // ✅ Apply category filter
      if (filters?.categoryId) {
        query.where('insurance_category_id', filters.categoryId)
      }

      // ✅ Apply sub-category filter
      if (filters?.subCategoryId) {
        query.where('insurance_sub_category_id', filters.subCategoryId)
      }

      // ✅ Apply company filter
      if (filters?.companyId) {
        query.where('insurance_company_id', filters.companyId)
      }

      // ✅ Apply insurance type filter
      if (filters?.insuranceType) {
        query.where('insurance_type', filters.insuranceType)
      }

      // Get all leads for this employee
      const leads = await query

      // ✅ Total Leads
      const totalLeadsCount = leads.length

      // ✅ Quotes Shared (quoteShare = 'yes')
      const quotesShared = leads.filter(lead => lead.quoteShare === 'yes')
      const quotesSharedCount = quotesShared.length

      // ✅ Converted (status = 'completed')
      const converted = leads.filter(lead => lead.status === 'completed')
      const convertedCount = converted.length

      // ✅ Net Premium (sum of converted leads' flowAmount)
      const netPremium = converted.reduce((sum, lead) => {
        return sum + this.safeNumber(lead.flowAmount)
      }, 0)

      // ✅ Conversion Rate
      const conversionRate = totalLeadsCount > 0
        ? ((convertedCount / totalLeadsCount) * 100).toFixed(1)
        : 0

      // Add to totals (only if employee has at least 1 lead)
      if (totalLeadsCount > 0) {
        totalLeads += totalLeadsCount
        totalQuotesShared += quotesSharedCount
        totalConverted += convertedCount
        totalNetPremium += netPremium
      }

      // ✅ Check if employee matches search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!employee.name.toLowerCase().includes(searchTerm) && 
            !employee.designation?.toLowerCase().includes(searchTerm)) {
          continue
        }
      }

      // ✅ Skip if no leads
      if (totalLeadsCount === 0) {
        continue
      }

      employeeData.push({
        employee_id: employee.id,
        employee_name: employee.name,
        designation: employee.designation || '-',
        leads: totalLeadsCount,
        quotes_shared: quotesSharedCount,
        converted: convertedCount,
        conversion_rate: `${conversionRate}%`,
        net_premium: netPremium
      })
    }

    // ========== 4. CALCULATE SUMMARY ==========
    const overallConversionRate = totalLeads > 0
      ? ((totalConverted / totalLeads) * 100).toFixed(2)
      : 0

    // Sort employees by leads (descending)
    employeeData.sort((a, b) => b.leads - a.leads)

    const summary = {
      total_employees: employees.length,
      total_leads: totalLeads,
      quotes_shared: totalQuotesShared,
      converted_leads: totalConverted,
      conversion_rate: `${overallConversionRate}%`,
      net_premium: totalNetPremium
    }

    // ========== 5. PAGINATION ==========
    const totalRecords = employeeData.length
    const lastPage = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEmployees = employeeData.slice(startIndex, endIndex)

    // ========== 6. RESPONSE ==========
    return {
      summary,
      employees: paginatedEmployees,
      pagination: {
        page,
        per_page: limit,
        total: totalRecords,
        last_page: lastPage
      },
      filters: {
        month,
        year,
        employeeId: filters?.employeeId || null,
        categoryId: filters?.categoryId || null,
        subCategoryId: filters?.subCategoryId || null,
        companyId: filters?.companyId || null,
        insuranceType: filters?.insuranceType || null,
        search: filters?.search || null
      },
      // ✅ Categories & Companies in separate arrays
      filter_options: {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name
        })),
        companies: companies.map(comp => ({
          id: comp.id,
          name: comp.name
        }))
      }
    }
  }

  /**
   * Export Report (CSV)
   */
  async exportReport(filters?: {
    month?: number
    year?: number
    employeeId?: number
    categoryId?: number
    subCategoryId?: number
    companyId?: number
    insuranceType?: string
  }) {
    const data = await this.getEmployeePerformanceReport({
      ...filters,
      page: 1,
      limit: 10000
    })
    return data.employees
  }
}