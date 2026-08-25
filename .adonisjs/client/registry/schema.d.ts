/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.test_redis': {
    methods: ["GET","HEAD"]
    pattern: '/api/test-redis'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/api/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.store': {
    methods: ["POST"]
    pattern: '/api/employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/employees/list'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/employees/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.update': {
    methods: ["PUT"]
    pattern: '/api/employees/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.destroy': {
    methods: ["DELETE"]
    pattern: '/api/employees/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee.check': {
    methods: ["GET","HEAD"]
    pattern: '/api/check'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'category.store': {
    methods: ["POST"]
    pattern: '/api/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'category.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'category.active': {
    methods: ["GET","HEAD"]
    pattern: '/api/categories/active'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'category.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'category.update': {
    methods: ["PUT"]
    pattern: '/api/categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'category.destroy': {
    methods: ["DELETE"]
    pattern: '/api/categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sub_category.store': {
    methods: ["POST"]
    pattern: '/api/sub-categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sub_category.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/sub-categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sub_category.get_by_category': {
    methods: ["GET","HEAD"]
    pattern: '/api/sub-categories/by-category/:categoryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { categoryId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sub_category.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/sub-categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sub_category.update': {
    methods: ["PUT"]
    pattern: '/api/sub-categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sub_category.destroy': {
    methods: ["DELETE"]
    pattern: '/api/sub-categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'company.store': {
    methods: ["POST"]
    pattern: '/api/companies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'company.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/companies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'company.get_by_sub_category': {
    methods: ["GET","HEAD"]
    pattern: '/api/companies/by-sub-category/:subCategoryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { subCategoryId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'company.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/companies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'company.update': {
    methods: ["PUT"]
    pattern: '/api/companies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'company.destroy': {
    methods: ["DELETE"]
    pattern: '/api/companies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.store': {
    methods: ["POST"]
    pattern: '/api/tasks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.get_logs': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/:id/logs'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.renewal': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/renewal'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.update_renewal': {
    methods: ["PUT"]
    pattern: '/api/tasks/renewal/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.search': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.filter': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/filter'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.counts': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/counts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.export_excel': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/export-excel'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/tasks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.update': {
    methods: ["PUT"]
    pattern: '/api/tasks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.destroy': {
    methods: ["DELETE"]
    pattern: '/api/tasks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.change_status': {
    methods: ["PATCH"]
    pattern: '/api/tasks/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'task.reassign': {
    methods: ["POST"]
    pattern: '/api/tasks/reassign'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.complete_dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/dashboard/complete'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.get_requests': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/requests'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.handle_request': {
    methods: ["PUT"]
    pattern: '/api/admin/attendance/request/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.report': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/report'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.get_settings': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.update_settings': {
    methods: ["PUT"]
    pattern: '/api/admin/attendance/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.filter_monthly_attendance': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/filter'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/attendance/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.update': {
    methods: ["PUT"]
    pattern: '/api/admin/attendance/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_attendance.destroy': {
    methods: ["DELETE"]
    pattern: '/api/admin/attendance/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.store': {
    methods: ["POST"]
    pattern: '/api/employee/tasks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.renewal': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks/renewal'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.update_renewal': {
    methods: ["PUT"]
    pattern: '/api/employee/tasks/renewal/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.search': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.filter': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks/filter'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.counts': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks/counts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/tasks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.update_status': {
    methods: ["PUT"]
    pattern: '/api/employee/tasks/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_task.update_workflow': {
    methods: ["PUT"]
    pattern: '/api/employee/tasks/:id/workflow'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.check_in': {
    methods: ["POST"]
    pattern: '/api/employee/attendance/check-in'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.check_out': {
    methods: ["POST"]
    pattern: '/api/employee/attendance/check-out'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.location_status': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/attendance/location-status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.today': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/attendance/today'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.history': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/attendance/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/attendance/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.create_request': {
    methods: ["POST"]
    pattern: '/api/employee/attendance/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.get_requests': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/attendance/requests'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_attendance.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/attendance/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_leave.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/leaves/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_leave.create_request': {
    methods: ["POST"]
    pattern: '/api/employee/leaves/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_leave.cancel_request': {
    methods: ["DELETE"]
    pattern: '/api/employee/leaves/request/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/leaves/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.get_employees': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/leaves/employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.assign_leave': {
    methods: ["POST"]
    pattern: '/api/admin/leaves/assign'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.create_or_update_balance': {
    methods: ["POST"]
    pattern: '/api/admin/leaves/balance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.get_employee_balance': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/leaves/balance/:employeeId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { employeeId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.delete_balance': {
    methods: ["DELETE"]
    pattern: '/api/admin/leaves/balance/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.reset_balances': {
    methods: ["POST"]
    pattern: '/api/admin/leaves/balance/reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.handle_request': {
    methods: ["PUT"]
    pattern: '/api/admin/leaves/request/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.get_types': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/leaves/types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_leave.update_type': {
    methods: ["POST"]
    pattern: '/api/admin/leaves/types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'lead.get_telesales_employees': {
    methods: ["GET","HEAD"]
    pattern: '/api/leads/telesales-employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'lead.create_lead': {
    methods: ["POST"]
    pattern: '/api/leads'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'report.employee_performance': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/reports/employee-performance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'report.export': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/reports/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/salary/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.generate': {
    methods: ["POST"]
    pattern: '/api/admin/salary/generate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/salary/:employeeId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { employeeId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.update_status': {
    methods: ["PUT"]
    pattern: '/api/admin/salary/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.seed': {
    methods: ["POST"]
    pattern: '/api/admin/salary/seed'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.create_structure': {
    methods: ["POST"]
    pattern: '/api/admin/salary-structure'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.get_structures': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/salary-structure'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.get_structure': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/salary-structure/:employeeId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { employeeId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.update_structure': {
    methods: ["PUT"]
    pattern: '/api/admin/salary-structure/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.delete_structure': {
    methods: ["DELETE"]
    pattern: '/api/admin/salary-structure/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.get_incentive_rules': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/salary/incentive-rules/:employeeId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { employeeId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.upsert_incentive_rule': {
    methods: ["POST"]
    pattern: '/api/admin/salary/incentive-rules'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.delete_incentive_rule': {
    methods: ["DELETE"]
    pattern: '/api/admin/salary/incentive-rules/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'salary.bulk_create_incentive_rules': {
    methods: ["POST"]
    pattern: '/api/admin/salary/incentive-rules/bulk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_dashboard.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_dashboard.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_salary.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/salary/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_salary.get_by_month': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/salary/month'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_salary.breakdown': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/salary/breakdown'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_salary.payslip': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/salary/payslip/:month/:year'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { month: ParamValue; year: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_salary.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/salary/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.calendar': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/holidays/calendar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.check': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/holidays/check'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/holidays'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/holidays/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.store': {
    methods: ["POST"]
    pattern: '/api/admin/holidays'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.update': {
    methods: ["PUT"]
    pattern: '/api/admin/holidays/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.destroy': {
    methods: ["DELETE"]
    pattern: '/api/admin/holidays/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_holiday.bulk_store': {
    methods: ["POST"]
    pattern: '/api/admin/holidays/bulk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_id_card.download': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/id-card/download'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_id_card.view': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/id-card/view'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_id_card.qr_code': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/qr-code'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_id_card.verify': {
    methods: ["POST"]
    pattern: '/api/employee/verify-qr'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_report.get_data': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/daily-report/data'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_report.generate_pdf': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/daily-report/pdf'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_report.view_pdf': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/daily-report/view'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_report.get_employees': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/daily-report/employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'employee_profile.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/employee/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'notification.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'notification.mark_all_as_read': {
    methods: ["PATCH"]
    pattern: '/api/notifications/mark-all-read'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'notification.mark_one_as_read': {
    methods: ["PATCH"]
    pattern: '/api/notifications/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
