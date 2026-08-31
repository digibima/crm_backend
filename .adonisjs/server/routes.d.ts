import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.test_redis': { paramsTuple?: []; params?: {} }
    'auth.send_otp': { paramsTuple?: []; params?: {} }
    'auth.verify_otp': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.get_login_logs': { paramsTuple?: []; params?: {} }
    'employee.store': { paramsTuple?: []; params?: {} }
    'employee.index': { paramsTuple?: []; params?: {} }
    'employee.list': { paramsTuple?: []; params?: {} }
    'employee.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee.check': { paramsTuple?: []; params?: {} }
    'category.store': { paramsTuple?: []; params?: {} }
    'category.index': { paramsTuple?: []; params?: {} }
    'category.active': { paramsTuple?: []; params?: {} }
    'category.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.store': { paramsTuple?: []; params?: {} }
    'sub_category.index': { paramsTuple?: []; params?: {} }
    'sub_category.get_by_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'sub_category.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.store': { paramsTuple?: []; params?: {} }
    'company.index': { paramsTuple?: []; params?: {} }
    'company.get_by_sub_category': { paramsTuple: [ParamValue]; params: {'subCategoryId': ParamValue} }
    'company.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.store': { paramsTuple?: []; params?: {} }
    'task.index': { paramsTuple?: []; params?: {} }
    'task.get_logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.get_all_logs': { paramsTuple?: []; params?: {} }
    'task.renewal': { paramsTuple?: []; params?: {} }
    'task.update_renewal': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.search': { paramsTuple?: []; params?: {} }
    'task.filter': { paramsTuple?: []; params?: {} }
    'task.counts': { paramsTuple?: []; params?: {} }
    'task.export_excel': { paramsTuple?: []; params?: {} }
    'task.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.change_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.reassign': { paramsTuple?: []; params?: {} }
    'admin_attendance.complete_dashboard': { paramsTuple?: []; params?: {} }
    'admin_attendance.dashboard': { paramsTuple?: []; params?: {} }
    'admin_attendance.get_requests': { paramsTuple?: []; params?: {} }
    'admin_attendance.handle_request': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.report': { paramsTuple?: []; params?: {} }
    'admin_attendance.get_settings': { paramsTuple?: []; params?: {} }
    'admin_attendance.update_settings': { paramsTuple?: []; params?: {} }
    'admin_attendance.filter_monthly_attendance': { paramsTuple?: []; params?: {} }
    'admin_attendance.index': { paramsTuple?: []; params?: {} }
    'admin_attendance.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.store': { paramsTuple?: []; params?: {} }
    'employee_task.index': { paramsTuple?: []; params?: {} }
    'employee_task.renewal': { paramsTuple?: []; params?: {} }
    'employee_task.update_renewal': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.search': { paramsTuple?: []; params?: {} }
    'employee_task.filter': { paramsTuple?: []; params?: {} }
    'employee_task.counts': { paramsTuple?: []; params?: {} }
    'employee_task.stats': { paramsTuple?: []; params?: {} }
    'employee_task.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.update_workflow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_attendance.check_in': { paramsTuple?: []; params?: {} }
    'employee_attendance.check_out': { paramsTuple?: []; params?: {} }
    'employee_attendance.location_status': { paramsTuple?: []; params?: {} }
    'employee_attendance.today': { paramsTuple?: []; params?: {} }
    'employee_attendance.history': { paramsTuple?: []; params?: {} }
    'employee_attendance.summary': { paramsTuple?: []; params?: {} }
    'employee_attendance.create_request': { paramsTuple?: []; params?: {} }
    'employee_attendance.get_requests': { paramsTuple?: []; params?: {} }
    'employee_attendance.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_leave.dashboard': { paramsTuple?: []; params?: {} }
    'employee_leave.create_request': { paramsTuple?: []; params?: {} }
    'employee_leave.cancel_request': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_leave.dashboard': { paramsTuple?: []; params?: {} }
    'admin_leave.get_employees': { paramsTuple?: []; params?: {} }
    'admin_leave.assign_leave': { paramsTuple?: []; params?: {} }
    'admin_leave.create_or_update_balance': { paramsTuple?: []; params?: {} }
    'admin_leave.get_employee_balance': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'admin_leave.delete_balance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_leave.reset_balances': { paramsTuple?: []; params?: {} }
    'admin_leave.handle_request': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_leave.get_types': { paramsTuple?: []; params?: {} }
    'admin_leave.update_type': { paramsTuple?: []; params?: {} }
    'lead.get_telesales_employees': { paramsTuple?: []; params?: {} }
    'lead.create_lead': { paramsTuple?: []; params?: {} }
    'report.employee_performance': { paramsTuple?: []; params?: {} }
    'report.export': { paramsTuple?: []; params?: {} }
    'salary.dashboard': { paramsTuple?: []; params?: {} }
    'salary.generate': { paramsTuple?: []; params?: {} }
    'salary.show': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.seed': { paramsTuple?: []; params?: {} }
    'salary.create_structure': { paramsTuple?: []; params?: {} }
    'salary.get_structures': { paramsTuple?: []; params?: {} }
    'salary.get_structure': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.update_structure': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.delete_structure': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.get_incentive_rules': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.upsert_incentive_rule': { paramsTuple?: []; params?: {} }
    'salary.delete_incentive_rule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.bulk_create_incentive_rules': { paramsTuple?: []; params?: {} }
    'admin_dashboard.index': { paramsTuple?: []; params?: {} }
    'employee_dashboard.index': { paramsTuple?: []; params?: {} }
    'employee_salary.dashboard': { paramsTuple?: []; params?: {} }
    'employee_salary.get_by_month': { paramsTuple?: []; params?: {} }
    'employee_salary.breakdown': { paramsTuple?: []; params?: {} }
    'employee_salary.payslip': { paramsTuple: [ParamValue,ParamValue]; params: {'month': ParamValue,'year': ParamValue} }
    'employee_salary.stats': { paramsTuple?: []; params?: {} }
    'admin_holiday.calendar': { paramsTuple?: []; params?: {} }
    'admin_holiday.check': { paramsTuple?: []; params?: {} }
    'admin_holiday.index': { paramsTuple?: []; params?: {} }
    'admin_holiday.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_holiday.store': { paramsTuple?: []; params?: {} }
    'admin_holiday.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_holiday.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_holiday.bulk_store': { paramsTuple?: []; params?: {} }
    'employee_id_card.download': { paramsTuple?: []; params?: {} }
    'employee_id_card.view': { paramsTuple?: []; params?: {} }
    'employee_id_card.qr_code': { paramsTuple?: []; params?: {} }
    'employee_id_card.verify': { paramsTuple?: []; params?: {} }
    'daily_report.get_data': { paramsTuple?: []; params?: {} }
    'daily_report.generate_pdf': { paramsTuple?: []; params?: {} }
    'daily_report.view_pdf': { paramsTuple?: []; params?: {} }
    'daily_report.get_employees': { paramsTuple?: []; params?: {} }
    'employee_profile.index': { paramsTuple?: []; params?: {} }
    'notification.admin_index': { paramsTuple?: []; params?: {} }
    'notification.index': { paramsTuple?: []; params?: {} }
    'notification.mark_all_as_read': { paramsTuple?: []; params?: {} }
    'notification.mark_one_as_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'google_sheets.index': { paramsTuple?: []; params?: {} }
    'google_sheets.store': { paramsTuple?: []; params?: {} }
    'google_sheets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'auth.test_redis': { paramsTuple?: []; params?: {} }
    'auth.get_login_logs': { paramsTuple?: []; params?: {} }
    'employee.index': { paramsTuple?: []; params?: {} }
    'employee.list': { paramsTuple?: []; params?: {} }
    'employee.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee.check': { paramsTuple?: []; params?: {} }
    'category.index': { paramsTuple?: []; params?: {} }
    'category.active': { paramsTuple?: []; params?: {} }
    'category.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.index': { paramsTuple?: []; params?: {} }
    'sub_category.get_by_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'sub_category.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.index': { paramsTuple?: []; params?: {} }
    'company.get_by_sub_category': { paramsTuple: [ParamValue]; params: {'subCategoryId': ParamValue} }
    'company.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.index': { paramsTuple?: []; params?: {} }
    'task.get_logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.get_all_logs': { paramsTuple?: []; params?: {} }
    'task.renewal': { paramsTuple?: []; params?: {} }
    'task.search': { paramsTuple?: []; params?: {} }
    'task.filter': { paramsTuple?: []; params?: {} }
    'task.counts': { paramsTuple?: []; params?: {} }
    'task.export_excel': { paramsTuple?: []; params?: {} }
    'task.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.complete_dashboard': { paramsTuple?: []; params?: {} }
    'admin_attendance.dashboard': { paramsTuple?: []; params?: {} }
    'admin_attendance.get_requests': { paramsTuple?: []; params?: {} }
    'admin_attendance.report': { paramsTuple?: []; params?: {} }
    'admin_attendance.get_settings': { paramsTuple?: []; params?: {} }
    'admin_attendance.filter_monthly_attendance': { paramsTuple?: []; params?: {} }
    'admin_attendance.index': { paramsTuple?: []; params?: {} }
    'admin_attendance.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.index': { paramsTuple?: []; params?: {} }
    'employee_task.renewal': { paramsTuple?: []; params?: {} }
    'employee_task.search': { paramsTuple?: []; params?: {} }
    'employee_task.filter': { paramsTuple?: []; params?: {} }
    'employee_task.counts': { paramsTuple?: []; params?: {} }
    'employee_task.stats': { paramsTuple?: []; params?: {} }
    'employee_task.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_attendance.location_status': { paramsTuple?: []; params?: {} }
    'employee_attendance.today': { paramsTuple?: []; params?: {} }
    'employee_attendance.history': { paramsTuple?: []; params?: {} }
    'employee_attendance.summary': { paramsTuple?: []; params?: {} }
    'employee_attendance.get_requests': { paramsTuple?: []; params?: {} }
    'employee_attendance.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_leave.dashboard': { paramsTuple?: []; params?: {} }
    'admin_leave.dashboard': { paramsTuple?: []; params?: {} }
    'admin_leave.get_employees': { paramsTuple?: []; params?: {} }
    'admin_leave.get_employee_balance': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'admin_leave.get_types': { paramsTuple?: []; params?: {} }
    'lead.get_telesales_employees': { paramsTuple?: []; params?: {} }
    'report.employee_performance': { paramsTuple?: []; params?: {} }
    'report.export': { paramsTuple?: []; params?: {} }
    'salary.dashboard': { paramsTuple?: []; params?: {} }
    'salary.show': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.get_structures': { paramsTuple?: []; params?: {} }
    'salary.get_structure': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.get_incentive_rules': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'admin_dashboard.index': { paramsTuple?: []; params?: {} }
    'employee_dashboard.index': { paramsTuple?: []; params?: {} }
    'employee_salary.dashboard': { paramsTuple?: []; params?: {} }
    'employee_salary.get_by_month': { paramsTuple?: []; params?: {} }
    'employee_salary.breakdown': { paramsTuple?: []; params?: {} }
    'employee_salary.payslip': { paramsTuple: [ParamValue,ParamValue]; params: {'month': ParamValue,'year': ParamValue} }
    'employee_salary.stats': { paramsTuple?: []; params?: {} }
    'admin_holiday.calendar': { paramsTuple?: []; params?: {} }
    'admin_holiday.check': { paramsTuple?: []; params?: {} }
    'admin_holiday.index': { paramsTuple?: []; params?: {} }
    'admin_holiday.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_id_card.download': { paramsTuple?: []; params?: {} }
    'employee_id_card.view': { paramsTuple?: []; params?: {} }
    'employee_id_card.qr_code': { paramsTuple?: []; params?: {} }
    'daily_report.get_data': { paramsTuple?: []; params?: {} }
    'daily_report.generate_pdf': { paramsTuple?: []; params?: {} }
    'daily_report.view_pdf': { paramsTuple?: []; params?: {} }
    'daily_report.get_employees': { paramsTuple?: []; params?: {} }
    'employee_profile.index': { paramsTuple?: []; params?: {} }
    'notification.admin_index': { paramsTuple?: []; params?: {} }
    'notification.index': { paramsTuple?: []; params?: {} }
    'google_sheets.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.test_redis': { paramsTuple?: []; params?: {} }
    'auth.get_login_logs': { paramsTuple?: []; params?: {} }
    'employee.index': { paramsTuple?: []; params?: {} }
    'employee.list': { paramsTuple?: []; params?: {} }
    'employee.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee.check': { paramsTuple?: []; params?: {} }
    'category.index': { paramsTuple?: []; params?: {} }
    'category.active': { paramsTuple?: []; params?: {} }
    'category.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.index': { paramsTuple?: []; params?: {} }
    'sub_category.get_by_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'sub_category.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.index': { paramsTuple?: []; params?: {} }
    'company.get_by_sub_category': { paramsTuple: [ParamValue]; params: {'subCategoryId': ParamValue} }
    'company.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.index': { paramsTuple?: []; params?: {} }
    'task.get_logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.get_all_logs': { paramsTuple?: []; params?: {} }
    'task.renewal': { paramsTuple?: []; params?: {} }
    'task.search': { paramsTuple?: []; params?: {} }
    'task.filter': { paramsTuple?: []; params?: {} }
    'task.counts': { paramsTuple?: []; params?: {} }
    'task.export_excel': { paramsTuple?: []; params?: {} }
    'task.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.complete_dashboard': { paramsTuple?: []; params?: {} }
    'admin_attendance.dashboard': { paramsTuple?: []; params?: {} }
    'admin_attendance.get_requests': { paramsTuple?: []; params?: {} }
    'admin_attendance.report': { paramsTuple?: []; params?: {} }
    'admin_attendance.get_settings': { paramsTuple?: []; params?: {} }
    'admin_attendance.filter_monthly_attendance': { paramsTuple?: []; params?: {} }
    'admin_attendance.index': { paramsTuple?: []; params?: {} }
    'admin_attendance.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.index': { paramsTuple?: []; params?: {} }
    'employee_task.renewal': { paramsTuple?: []; params?: {} }
    'employee_task.search': { paramsTuple?: []; params?: {} }
    'employee_task.filter': { paramsTuple?: []; params?: {} }
    'employee_task.counts': { paramsTuple?: []; params?: {} }
    'employee_task.stats': { paramsTuple?: []; params?: {} }
    'employee_task.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_attendance.location_status': { paramsTuple?: []; params?: {} }
    'employee_attendance.today': { paramsTuple?: []; params?: {} }
    'employee_attendance.history': { paramsTuple?: []; params?: {} }
    'employee_attendance.summary': { paramsTuple?: []; params?: {} }
    'employee_attendance.get_requests': { paramsTuple?: []; params?: {} }
    'employee_attendance.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_leave.dashboard': { paramsTuple?: []; params?: {} }
    'admin_leave.dashboard': { paramsTuple?: []; params?: {} }
    'admin_leave.get_employees': { paramsTuple?: []; params?: {} }
    'admin_leave.get_employee_balance': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'admin_leave.get_types': { paramsTuple?: []; params?: {} }
    'lead.get_telesales_employees': { paramsTuple?: []; params?: {} }
    'report.employee_performance': { paramsTuple?: []; params?: {} }
    'report.export': { paramsTuple?: []; params?: {} }
    'salary.dashboard': { paramsTuple?: []; params?: {} }
    'salary.show': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.get_structures': { paramsTuple?: []; params?: {} }
    'salary.get_structure': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'salary.get_incentive_rules': { paramsTuple: [ParamValue]; params: {'employeeId': ParamValue} }
    'admin_dashboard.index': { paramsTuple?: []; params?: {} }
    'employee_dashboard.index': { paramsTuple?: []; params?: {} }
    'employee_salary.dashboard': { paramsTuple?: []; params?: {} }
    'employee_salary.get_by_month': { paramsTuple?: []; params?: {} }
    'employee_salary.breakdown': { paramsTuple?: []; params?: {} }
    'employee_salary.payslip': { paramsTuple: [ParamValue,ParamValue]; params: {'month': ParamValue,'year': ParamValue} }
    'employee_salary.stats': { paramsTuple?: []; params?: {} }
    'admin_holiday.calendar': { paramsTuple?: []; params?: {} }
    'admin_holiday.check': { paramsTuple?: []; params?: {} }
    'admin_holiday.index': { paramsTuple?: []; params?: {} }
    'admin_holiday.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_id_card.download': { paramsTuple?: []; params?: {} }
    'employee_id_card.view': { paramsTuple?: []; params?: {} }
    'employee_id_card.qr_code': { paramsTuple?: []; params?: {} }
    'daily_report.get_data': { paramsTuple?: []; params?: {} }
    'daily_report.generate_pdf': { paramsTuple?: []; params?: {} }
    'daily_report.view_pdf': { paramsTuple?: []; params?: {} }
    'daily_report.get_employees': { paramsTuple?: []; params?: {} }
    'employee_profile.index': { paramsTuple?: []; params?: {} }
    'notification.admin_index': { paramsTuple?: []; params?: {} }
    'notification.index': { paramsTuple?: []; params?: {} }
    'google_sheets.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.send_otp': { paramsTuple?: []; params?: {} }
    'auth.verify_otp': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'employee.store': { paramsTuple?: []; params?: {} }
    'category.store': { paramsTuple?: []; params?: {} }
    'sub_category.store': { paramsTuple?: []; params?: {} }
    'company.store': { paramsTuple?: []; params?: {} }
    'task.store': { paramsTuple?: []; params?: {} }
    'task.reassign': { paramsTuple?: []; params?: {} }
    'employee_task.store': { paramsTuple?: []; params?: {} }
    'employee_attendance.check_in': { paramsTuple?: []; params?: {} }
    'employee_attendance.check_out': { paramsTuple?: []; params?: {} }
    'employee_attendance.create_request': { paramsTuple?: []; params?: {} }
    'employee_leave.create_request': { paramsTuple?: []; params?: {} }
    'admin_leave.assign_leave': { paramsTuple?: []; params?: {} }
    'admin_leave.create_or_update_balance': { paramsTuple?: []; params?: {} }
    'admin_leave.reset_balances': { paramsTuple?: []; params?: {} }
    'admin_leave.update_type': { paramsTuple?: []; params?: {} }
    'lead.create_lead': { paramsTuple?: []; params?: {} }
    'salary.generate': { paramsTuple?: []; params?: {} }
    'salary.seed': { paramsTuple?: []; params?: {} }
    'salary.create_structure': { paramsTuple?: []; params?: {} }
    'salary.upsert_incentive_rule': { paramsTuple?: []; params?: {} }
    'salary.bulk_create_incentive_rules': { paramsTuple?: []; params?: {} }
    'admin_holiday.store': { paramsTuple?: []; params?: {} }
    'admin_holiday.bulk_store': { paramsTuple?: []; params?: {} }
    'employee_id_card.verify': { paramsTuple?: []; params?: {} }
    'google_sheets.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'employee.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.update_renewal': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.handle_request': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.update_settings': { paramsTuple?: []; params?: {} }
    'admin_attendance.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.update_renewal': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_task.update_workflow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_leave.handle_request': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.update_structure': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_holiday.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'employee.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sub_category.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'company.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'task.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_attendance.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employee_leave.cancel_request': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_leave.delete_balance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.delete_structure': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'salary.delete_incentive_rule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_holiday.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'google_sheets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'task.change_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notification.mark_all_as_read': { paramsTuple?: []; params?: {} }
    'notification.mark_one_as_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}