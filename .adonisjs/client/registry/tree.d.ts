/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    testRedis: typeof routes['auth.test_redis']
    login: typeof routes['auth.login']
    logout: typeof routes['auth.logout']
  }
  employee: {
    store: typeof routes['employee.store']
    index: typeof routes['employee.index']
    list: typeof routes['employee.list']
    show: typeof routes['employee.show']
    update: typeof routes['employee.update']
    destroy: typeof routes['employee.destroy']
    check: typeof routes['employee.check']
  }
  category: {
    store: typeof routes['category.store']
    index: typeof routes['category.index']
    active: typeof routes['category.active']
    show: typeof routes['category.show']
    update: typeof routes['category.update']
    destroy: typeof routes['category.destroy']
  }
  subCategory: {
    store: typeof routes['sub_category.store']
    index: typeof routes['sub_category.index']
    getByCategory: typeof routes['sub_category.get_by_category']
    show: typeof routes['sub_category.show']
    update: typeof routes['sub_category.update']
    destroy: typeof routes['sub_category.destroy']
  }
  company: {
    store: typeof routes['company.store']
    index: typeof routes['company.index']
    getBySubCategory: typeof routes['company.get_by_sub_category']
    show: typeof routes['company.show']
    update: typeof routes['company.update']
    destroy: typeof routes['company.destroy']
  }
  task: {
    store: typeof routes['task.store']
    index: typeof routes['task.index']
    renewal: typeof routes['task.renewal']
    search: typeof routes['task.search']
    filter: typeof routes['task.filter']
    counts: typeof routes['task.counts']
    exportExcel: typeof routes['task.export_excel']
    show: typeof routes['task.show']
    update: typeof routes['task.update']
    destroy: typeof routes['task.destroy']
    changeStatus: typeof routes['task.change_status']
    reassign: typeof routes['task.reassign']
  }
  adminAttendance: {
    completeDashboard: typeof routes['admin_attendance.complete_dashboard']
    dashboard: typeof routes['admin_attendance.dashboard']
    getRequests: typeof routes['admin_attendance.get_requests']
    handleRequest: typeof routes['admin_attendance.handle_request']
    report: typeof routes['admin_attendance.report']
    getSettings: typeof routes['admin_attendance.get_settings']
    updateSettings: typeof routes['admin_attendance.update_settings']
    index: typeof routes['admin_attendance.index']
    show: typeof routes['admin_attendance.show']
    update: typeof routes['admin_attendance.update']
    destroy: typeof routes['admin_attendance.destroy']
  }
  employeeTask: {
    store: typeof routes['employee_task.store']
    index: typeof routes['employee_task.index']
    renewal: typeof routes['employee_task.renewal']
    search: typeof routes['employee_task.search']
    filter: typeof routes['employee_task.filter']
    counts: typeof routes['employee_task.counts']
    stats: typeof routes['employee_task.stats']
    show: typeof routes['employee_task.show']
    updateStatus: typeof routes['employee_task.update_status']
    updateWorkflow: typeof routes['employee_task.update_workflow']
  }
  employeeAttendance: {
    checkIn: typeof routes['employee_attendance.check_in']
    checkOut: typeof routes['employee_attendance.check_out']
    locationStatus: typeof routes['employee_attendance.location_status']
    today: typeof routes['employee_attendance.today']
    history: typeof routes['employee_attendance.history']
    summary: typeof routes['employee_attendance.summary']
    createRequest: typeof routes['employee_attendance.create_request']
    getRequests: typeof routes['employee_attendance.get_requests']
    show: typeof routes['employee_attendance.show']
  }
  employeeLeave: {
    dashboard: typeof routes['employee_leave.dashboard']
    createRequest: typeof routes['employee_leave.create_request']
    cancelRequest: typeof routes['employee_leave.cancel_request']
  }
  adminLeave: {
    dashboard: typeof routes['admin_leave.dashboard']
    getEmployees: typeof routes['admin_leave.get_employees']
    assignLeave: typeof routes['admin_leave.assign_leave']
    createOrUpdateBalance: typeof routes['admin_leave.create_or_update_balance']
    getEmployeeBalance: typeof routes['admin_leave.get_employee_balance']
    deleteBalance: typeof routes['admin_leave.delete_balance']
    resetBalances: typeof routes['admin_leave.reset_balances']
    handleRequest: typeof routes['admin_leave.handle_request']
    getTypes: typeof routes['admin_leave.get_types']
    updateType: typeof routes['admin_leave.update_type']
  }
  lead: {
    getTelesalesEmployees: typeof routes['lead.get_telesales_employees']
    createLead: typeof routes['lead.create_lead']
  }
  report: {
    employeePerformance: typeof routes['report.employee_performance']
    export: typeof routes['report.export']
  }
  salary: {
    dashboard: typeof routes['salary.dashboard']
    generate: typeof routes['salary.generate']
    show: typeof routes['salary.show']
    updateStatus: typeof routes['salary.update_status']
    seed: typeof routes['salary.seed']
    createStructure: typeof routes['salary.create_structure']
    getStructures: typeof routes['salary.get_structures']
    getStructure: typeof routes['salary.get_structure']
    updateStructure: typeof routes['salary.update_structure']
    deleteStructure: typeof routes['salary.delete_structure']
    getIncentiveRules: typeof routes['salary.get_incentive_rules']
    upsertIncentiveRule: typeof routes['salary.upsert_incentive_rule']
    deleteIncentiveRule: typeof routes['salary.delete_incentive_rule']
    bulkCreateIncentiveRules: typeof routes['salary.bulk_create_incentive_rules']
  }
  adminDashboard: {
    index: typeof routes['admin_dashboard.index']
  }
  employeeDashboard: {
    index: typeof routes['employee_dashboard.index']
  }
  employeeSalary: {
    dashboard: typeof routes['employee_salary.dashboard']
    getByMonth: typeof routes['employee_salary.get_by_month']
    breakdown: typeof routes['employee_salary.breakdown']
    payslip: typeof routes['employee_salary.payslip']
    stats: typeof routes['employee_salary.stats']
  }
  adminHoliday: {
    calendar: typeof routes['admin_holiday.calendar']
    check: typeof routes['admin_holiday.check']
    index: typeof routes['admin_holiday.index']
    show: typeof routes['admin_holiday.show']
    store: typeof routes['admin_holiday.store']
    update: typeof routes['admin_holiday.update']
    destroy: typeof routes['admin_holiday.destroy']
    bulkStore: typeof routes['admin_holiday.bulk_store']
  }
  employeeIdCard: {
    download: typeof routes['employee_id_card.download']
    view: typeof routes['employee_id_card.view']
    qrCode: typeof routes['employee_id_card.qr_code']
    verify: typeof routes['employee_id_card.verify']
  }
  dailyReport: {
    getData: typeof routes['daily_report.get_data']
    generatePdf: typeof routes['daily_report.generate_pdf']
    viewPdf: typeof routes['daily_report.view_pdf']
    getEmployees: typeof routes['daily_report.get_employees']
  }
  employeeProfile: {
    index: typeof routes['employee_profile.index']
  }
}
