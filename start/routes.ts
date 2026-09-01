
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import EmployeeController from '#controllers/admin/employee_controller'
import EmployeeTaskController from '#controllers/employee/task_controller'
import CategoryController from '#controllers/admin/category_controller'
import SubCategoryController from '#controllers/admin/sub_category_controller'
import CompanyController from '#controllers/admin/company_controller'
import TaskController from '#controllers/admin/task_controller'
import AuthController from '#controllers/auth_controller'
import EmployeeAttendanceController from '#controllers/employee/attendance_controller'
import AdminAttendanceController from '#controllers/admin/attendance_controller'
import EmployeeLeaveController from '#controllers/employee/leave_controller'
import AdminLeaveController from '#controllers/admin/leave_controller'
import LeadController from '#controllers/lead/lead_controller'
import ReportController from '#controllers/admin/report_controller'
import SalaryController from '#controllers/admin/salary_controller'
import AdminDashboardController from '#controllers/admin/dashboard_controller'
import EmployeeDashboardController from '#controllers/employee/dashboard_controller'
import EmployeeSalaryController from '#controllers/employee/salary_controller'
import AdminHolidayController from '#controllers/admin/holiday_controller'
import EmployeeIdCardController from '#controllers/employee/id_card_controller'
import DailyReportController from '#controllers/admin/daily_report_controller'
import NotificationController from '#controllers/notification_controller'
import fs from 'node:fs'
import path from 'node:path'
import EmployeeProfileController from '#controllers/employee/profile_controller'
import GoogleSheetsController from '#controllers/google_sheets_controller'
// import { fileURLToPath } from 'node:url'

router.get('/hello', async () => {
  return 'hello'  
})
router.get('/api/hello', async () => {
  return 'hello'
})

router.get('/api/test-redis', [AuthController, 'testRedis'])
router.get('/', async () => {
  return {
    message: 'Server is running 🚀',
  }
})
// router
//   .group(() => {
//     router.get('signup', [controllers.NewAccount, 'create'])
//     router.post('signup', [controllers.NewAccount, 'store'])

//     router.get('login', [controllers.Session, 'create'])
//     router.post('login', [controllers.Session, 'store'])
//   })
//   .use(middleware.guest())




// router.post('/api/login', [AuthController, 'login'])
// router
//   .group(() => {
//     router.post('/logout', [AuthController, 'logout'])
//     // router.post('/logout-all', [AuthController, 'logoutAll'])
//   })
//   .prefix('/api')
//   .use(middleware.auth())
router.group(() => {
  // Public OTP Endpoints
  router.post('/auth/send-otp', [AuthController, 'sendOtp'])
  router.post('/auth/verify-otp', [AuthController, 'verifyOtp'])

  // Authenticated Endpoints
  router
    .group(() => {
      router.post('/logout', [AuthController, 'logout'])
      router.get('/employee-login-logs', [AuthController, 'getLoginLogs'])
    })
    .use(middleware.auth())
    .use(middleware.role({ roles: ['superadmin', 'admin'] }))
}).prefix('/api')
router
  .group(() => {
    router.post('/employees', [EmployeeController, 'store'])
    router.get('/employees', [EmployeeController, 'index'])
    router.get('/employees/list', [EmployeeController, 'list'])
    router.get('/employees/:id', [EmployeeController, 'show'])
    router.put('/employees/:id', [EmployeeController, 'update'])
    router.delete('/employees/:id', [EmployeeController, 'destroy'])
  })
  .prefix('/api')
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )
  .use(
    middleware.role({
      roles: ['superadmin', 'admin'],
    })
  )
router.get('/api/check', [EmployeeController, 'check'])
router.get('/api/test', async ({ auth }) => {
  try {
    await auth.authenticate()

    return auth.user
  } catch (e) {
    return e
  }
})

router
  .group(() => {
    router.post('/categories', [CategoryController, 'store'])
    router.get('/categories', [CategoryController, 'index'])
    router.get('/categories/active', [CategoryController, 'active'])
    router.get('/categories/:id', [CategoryController, 'show'])
    router.put('/categories/:id', [CategoryController, 'update'])
    router.delete('/categories/:id', [CategoryController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.role({
    roles: ['superadmin', 'admin', 'employee']
  }))


router
  .group(() => {
    router.post('/sub-categories', [SubCategoryController, 'store'])
    router.get('/sub-categories', [SubCategoryController, 'index'])
    router.get('/sub-categories/by-category/:categoryId', [SubCategoryController, 'getByCategory'])
    router.get('/sub-categories/:id', [SubCategoryController, 'show'])
    router.put('/sub-categories/:id', [SubCategoryController, 'update'])
    router.delete('/sub-categories/:id', [SubCategoryController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.role({
    roles: ['superadmin', 'admin', 'employee']
  }))


router
  .group(() => {
    router.post('/companies', [CompanyController, 'store'])
    router.get('/companies', [CompanyController, 'index'])
    router.get('/companies/by-sub-category/:subCategoryId', [CompanyController, 'getBySubCategory'])
    router.get('/companies/:id', [CompanyController, 'show'])
    router.put('/companies/:id', [CompanyController, 'update'])
    router.delete('/companies/:id', [CompanyController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.role({
    roles: ['superadmin', 'admin', 'employee']
  }))

// router.get('/api/testsocket', [TaskController, 'test'])
router
  .group(() => {
    router.post('/tasks', [TaskController, 'store'])
    router.get('/tasks', [TaskController, 'index'])
    router.get('/tasks/:id/logs', [TaskController, 'getLogs'])
    router.get('/tasks/logs', [TaskController, 'getAllLogs'])
    router.get('/tasks/renewal', [TaskController, 'renewal'])
    router.put('/tasks/renewal/:id', [TaskController, 'updateRenewal'])
    router.get('/tasks/search', [TaskController, 'search'])  
    router.get('/tasks/filter', [TaskController, 'filter'])
    router.get('/tasks/counts', [TaskController, 'counts']) 
    router.get('/tasks/export-excel', [TaskController,'exportExcel'])
    router.get('/tasks/:id', [TaskController, 'show'])
    router.put('/tasks/:id', [TaskController, 'update'])
    router.delete('/tasks/:id', [TaskController, 'destroy'])
    router.patch('/tasks/:id/status', [TaskController, 'changeStatus'])
    router.post('/tasks/reassign', [TaskController, 'reassign'])

  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.role({
    roles: ['superadmin', 'admin', 'employee']
  }))

  router
  .group(() => {

     router.get('/attendance/dashboard/complete', [AdminAttendanceController, 'completeDashboard'])
    router.get('/attendance/dashboard', [AdminAttendanceController, 'dashboard'])
    router.get('/attendance/requests', [AdminAttendanceController, 'getRequests'])
    router.put('/attendance/request/:id', [AdminAttendanceController, 'handleRequest'])
    router.get('/attendance/report', [AdminAttendanceController, 'report'])
    router.get('/attendance/settings', [AdminAttendanceController, 'getSettings'])
    router.put('/attendance/settings', [AdminAttendanceController, 'updateSettings'])
    router.get('/attendance/filter', [AdminAttendanceController, 'filterMonthlyAttendance'])
    router.get('/attendance', [AdminAttendanceController, 'index'])
    router.get('/attendance/:id', [AdminAttendanceController, 'show'])
    router.put('/attendance/:id', [AdminAttendanceController, 'update'])
    router.delete('/attendance/:id', [AdminAttendanceController, 'destroy'])
  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))


router
  .group(() => {
    router.post('/employee/tasks', [EmployeeTaskController, 'store'])
    // router.get('/employee/dashboard/summary', [EmployeeDashboardController, 'summary'])
    router.get('/employee/tasks', [EmployeeTaskController, 'index'])
    router.get('/employee/tasks/renewal', [EmployeeTaskController, 'renewal'])
    router.put('/employee/tasks/renewal/:id', [EmployeeTaskController, 'updateRenewal'])
    router.get('/employee/tasks/search', [EmployeeTaskController, 'search']) 
    router.get('/employee/tasks/filter', [EmployeeTaskController, 'filter']) 
    router.get('/employee/tasks/counts', [EmployeeTaskController, 'counts'])
    router.get('/employee/tasks/stats', [EmployeeTaskController, 'stats'])
    router.get('/employee/tasks/:id', [EmployeeTaskController, 'show'])
    router.put('/employee/tasks/:id/status', [EmployeeTaskController, 'updateStatus'])
    router.put('/employee/tasks/:id/workflow', [EmployeeTaskController, 'updateWorkflow'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.role({
    roles: ['employee']
  }))

router.group(() => {
  // Check In / Out
  router.post('/attendance/check-in', [EmployeeAttendanceController, 'checkIn'])
  router.post('/attendance/check-out', [EmployeeAttendanceController, 'checkOut'])
  router.get('/attendance/location-status', [EmployeeAttendanceController, 'locationStatus'])

  // Today & History
  router.get('/attendance/today', [EmployeeAttendanceController, 'today'])
  router.get('/attendance/history', [EmployeeAttendanceController, 'history'])
  router.get('/attendance/summary', [EmployeeAttendanceController, 'summary'])

  // Attendance Requests (move above :id)
  router.post('/attendance/request', [EmployeeAttendanceController, 'createRequest'])
  router.get('/attendance/requests', [EmployeeAttendanceController, 'getRequests'])

  // Attendance Detail (keep last)
  router.get('/attendance/:id', [EmployeeAttendanceController, 'show'])
})
.prefix('/api/employee')
.use(middleware.auth())
.use(middleware.role({ roles: ['employee'] }))


  
  // ========== Employee Leave Routes ==========
router
  .group(() => {
    router.get('/leaves/dashboard', [EmployeeLeaveController, 'dashboard'])
    router.post('/leaves/request', [EmployeeLeaveController, 'createRequest'])
    router.delete('/leaves/request/:id', [EmployeeLeaveController, 'cancelRequest'])
  })
  .prefix('/api/employee')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['employee'] }))

// ========== Admin Leave Routes ==========
router
  .group(() => {
    router.get('/leaves/dashboard', [AdminLeaveController, 'dashboard'])
    router.get('/leaves/employees', [AdminLeaveController, 'getEmployees'])
    router.post('/leaves/assign', [AdminLeaveController, 'assignLeave']) 
    router.post('/leaves/balance', [AdminLeaveController, 'createOrUpdateBalance'])  
    router.get('/leaves/balance/:employeeId', [AdminLeaveController, 'getEmployeeBalance']) 
    router.delete('/leaves/balance/:id', [AdminLeaveController, 'deleteBalance']) 
    router.post('/leaves/balance/reset', [AdminLeaveController, 'resetBalances']) 
    router.put('/leaves/request/:id', [AdminLeaveController, 'handleRequest'])
    router.get('/leaves/types', [AdminLeaveController, 'getTypes'])
    router.post('/leaves/types', [AdminLeaveController, 'updateType'])
  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))
  


router.get(
  '/api/leads/telesales-employees',
  [LeadController, 'getTelesalesEmployees']
)
router.post('/api/leads', [LeadController, 'createLead'])


router
  .group(() => {
    router.get('/reports/employee-performance', [ReportController, 'employeePerformance'])
    router.get('/reports/export', [ReportController, 'export'])
  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))

  router
  .group(() => {
    // ✅ API 1: Dashboard + List (Sab kuch)
    router.get('/salary/dashboard', [SalaryController, 'dashboard'])
    
    // ✅ API 2: Generate Salary
    router.post('/salary/generate', [SalaryController, 'generate'])
    
    // Salary Details
    router.get('/salary/:employeeId', [SalaryController, 'show'])
    
    // Update Status
    router.put('/salary/:id/status', [SalaryController, 'updateStatus'])
    
    // Seed Rules (One time)
    router.post('/salary/seed', [SalaryController, 'seed'])
    // Salary Structure CRUD
    router.post('/salary-structure', [SalaryController, 'createStructure'])
    router.get('/salary-structure', [SalaryController, 'getStructures'])
    router.get('/salary-structure/:employeeId', [SalaryController, 'getStructure'])
    router.put('/salary-structure/:id', [SalaryController, 'updateStructure'])
    router.delete('/salary-structure/:id', [SalaryController, 'deleteStructure'])

    router.get('/salary/incentive-rules/:employeeId', [SalaryController, 'getIncentiveRules'])
    router.post('/salary/incentive-rules', [SalaryController, 'upsertIncentiveRule'])
    router.delete('/salary/incentive-rules/:id', [SalaryController, 'deleteIncentiveRule'])
     router.post('/salary/incentive-rules/bulk', [SalaryController, 'bulkCreateIncentiveRules'])

  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))

  router
  .group(() => {
    router.get('/dashboard', [AdminDashboardController, 'index'])
  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))

  router
  .group(() => {
    router.get('/dashboard', [EmployeeDashboardController, 'index'])
  })
  .prefix('/api/employee')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['employee'] }))

  router
  .group(() => {
    router.get('/salary/dashboard', [EmployeeSalaryController, 'dashboard'])
    router.get('/salary/month', [EmployeeSalaryController, 'getByMonth'])
    router.get('/salary/breakdown', [EmployeeSalaryController, 'breakdown'])
    router.get('/salary/payslip/:month/:year', [EmployeeSalaryController, 'payslip'])
    router.get('/salary/stats', [EmployeeSalaryController, 'stats'])
  })
  .prefix('/api/employee')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['employee'] }))

  router
  .group(() => {
       router.get('/holidays/calendar', [AdminHolidayController, 'calendar'])  // ✅ Calendar route pehle
    router.get('/holidays/check', [AdminHolidayController, 'check'])   
    // CRUD
    router.get('/holidays', [AdminHolidayController, 'index'])
    router.get('/holidays/:id', [AdminHolidayController, 'show'])
    router.post('/holidays', [AdminHolidayController, 'store'])
    router.put('/holidays/:id', [AdminHolidayController, 'update'])
    router.delete('/holidays/:id', [AdminHolidayController, 'destroy'])
    
    // Bulk create
    router.post('/holidays/bulk', [AdminHolidayController, 'bulkStore'])
    
  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))



  router
  .group(() => {
    // ✅ Download ID Card PDF (Single API)
    router.get('/id-card/download', [EmployeeIdCardController, 'download'])
    
    // View ID Card (HTML Preview)
    router.get('/id-card/view', [EmployeeIdCardController, 'view'])
    
    // Get QR Code
    router.get('/qr-code', [EmployeeIdCardController, 'qrCode'])
    
    // Verify QR Code
    router.post('/verify-qr', [EmployeeIdCardController, 'verify'])
  })
  .prefix('/api/employee')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['employee'] }))

  router
  .group(() => {
 router.get('/daily-report/data', [DailyReportController, 'getData'])
    
    // ✅ PDF Download
    router.get('/daily-report/pdf', [DailyReportController, 'generatePDF'])
    
    // ✅ PDF View (inline)
    router.get('/daily-report/view', [DailyReportController, 'viewPDF'])
    
    // ✅ Employees list
    router.get('/daily-report/employees', [DailyReportController, 'getEmployees'])
  })
  .prefix('/api/admin')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['superadmin', 'admin'] }))

  router.get('/uploads/*', async ({ request, response }) => {
  try {
    // Get file path from URL (remove /uploads/ prefix)
    const filePath = request.param('*').join('/')
    
    // ✅ SAFE: Prevent directory traversal attacks
    if (filePath.includes('..') || filePath.includes('~')) {
      return response.status(403).send('Access denied')
    }
    
    // Build full path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log('❌ File not found:', fullPath)
      return response.status(404).send('File not found')
    }
    
    // Get file extension
    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.ico': 'image/x-icon',
    }
    
    // Set content type
    response.header('Content-Type', mimeTypes[ext] || 'application/octet-stream')
    
    // Serve file
    return response.download(fullPath)
  } catch (error) {
    console.error('❌ Image serve error:', error)
    return response.status(404).send('File not found')
  }
})
router
  .group(() => {
    router.get('/profile', [EmployeeProfileController, 'index'])
  })
  .prefix('/api/employee')
  .use(middleware.auth())
  .use(middleware.role({ roles: ['employee'] }))

  router
  .group(() => {
    router.get('/admin/notifications', [NotificationController, 'adminIndex'])
    router.get('/notifications', [NotificationController, 'index'])
    router.patch('/notifications/mark-all-read', [NotificationController, 'markAllAsRead'])
    router.patch('/notifications/:id/read', [NotificationController, 'markOneAsRead'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(
    middleware.role({
      roles: ['superadmin', 'admin', 'employee'],
    })
  )

  router
  .group(() => {
    router.get('/google-sheets', [GoogleSheetsController, 'index'])
    router.post('/google-sheets', [GoogleSheetsController, 'store'])
    router.delete('/google-sheets/:id', [GoogleSheetsController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(
    middleware.role({
      roles: ['superadmin', 'admin'],
    })
  )

  router
  .group(() => {
    router.get('/employee/google-sheets', [GoogleSheetsController, 'employeeIndex'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(
    middleware.role({
      roles: ['employee', 'superadmin', 'admin'],
    })
  )