// app/services/dashboard_service.ts
import User from '#models/user'
import TaskManagement from '#models/task_management'
import Attendance from '#models/attendance'
import LeaveRequest from '#models/leave_request'
import SalaryPayroll from '#models/salary_payroll'
import { DateTime } from 'luxon'

export default class DashboardService {

  /**
   * ✅ Complete Admin Dashboard - Single API
   */
  async getAdminDashboard() {
    const today = DateTime.now().toISODate()
    const currentMonth = DateTime.now().month
    const currentYear = DateTime.now().year

    console.log('📊 Dashboard Date:', today)

    // ========== 1. EMPLOYEE SUMMARY ==========
    const totalEmployees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .count('* as total')

    const totalEmployeesCount = Number(totalEmployees[0].$extras.total) || 0

    // ✅ Active = Aaj attendance mark karne wale
    const todayAttendances = await Attendance.query()
      .where('attendance_date', today)

    const activeEmployees = todayAttendances.length

    // ✅ New = Is month join kiye
    const newEmployees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .whereRaw('MONTH(created_at) = ?', [currentMonth])
      .whereRaw('YEAR(created_at) = ?', [currentYear])
      .count('* as total')

    const newEmployeesCount = Number(newEmployees[0].$extras.total) || 0

    // ========== 2. ATTENDANCE SUMMARY ==========
    let present = 0, late = 0, absent = 0, halfDay = 0

    const employees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id')

    for (const employee of employees) {
      const att = todayAttendances.find(a => a.employeeId === employee.id)
      if (att) {
        switch (att.status) {
          case 'Present': present++; break
          case 'Late': late++; break
          case 'Half Day': halfDay++; break
        }
      } else {
        absent++
      }
    }

    const totalEmployeesForAttendance = employees.length
    const attendancePercentage = totalEmployeesForAttendance > 0
      ? Math.round(((present + late + halfDay) / totalEmployeesForAttendance) * 100)
      : 0

    // ========== 3. TASK SUMMARY ==========
    const totalTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .count('* as total')

    const pendingTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .where('status', 'pending')
      .count('* as total')

    const completedTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .where('status', 'completed')
      .count('* as total')

    const followUpTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .where('status', 'follow_up')
      .count('* as total')

    const callAgainTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .where('status', 'call_again')
      .count('* as total')

    const notConvertedTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .where('status', 'not_converted')
      .count('* as total')

    // ========== 4. LEAVE SUMMARY ==========
    const pendingLeaves = await LeaveRequest.query()
      .where('status', 'Pending')
      .count('* as total')

    const approvedLeaves = await LeaveRequest.query()
      .where('status', 'Approved')
      .count('* as total')

    const rejectedLeaves = await LeaveRequest.query()
      .where('status', 'Rejected')
      .count('* as total')

    // ========== 5. SALARY SUMMARY ==========
    const salaryPayrolls = await SalaryPayroll.query()
      .where('month', currentMonth)
      .where('year', currentYear)

    let totalSalary = 0
    let totalIncentive = 0
    let totalLateDeduction = 0
    let totalNetSalary = 0
    let paidCount = 0
    let pendingCount = 0

    for (const payroll of salaryPayrolls) {
      totalSalary += Number(payroll.basicSalary) || 0
      totalIncentive += Number(payroll.incentive) || 0
      totalLateDeduction += Number(payroll.lateDeduction) || 0
      totalNetSalary += Number(payroll.netSalary) || 0
      if (payroll.status === 'Paid') paidCount++
      else pendingCount++
    }

    // ========== 6. RECENT ACTIVITIES ==========
    const recentTasks = await TaskManagement.query()
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(5)
      .preload('assignToUser', (query) => {
        query.select('id', 'name', 'email')
      })
      .preload('user', (query) => {
        query.select('id', 'name', 'email')
      })

    const recentActivities = recentTasks.map(task => ({
      id: task.id,
      type: 'task',
      action: task.taskAction || '-',
      clientName: task.clientName || '-',
      status: task.status || '-',
      assignedTo: task.assignToUser?.name || '-',
      createdBy: task.user?.name || '-',
      createdAt: task.createdAt.toISO()
    }))

    // ========== 7. MONTHLY TASK TREND (Last 6 Months) ==========
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = DateTime.now().minus({ months: i })
      const month = date.month
      const year = date.year

      const tasks = await TaskManagement.query()
        .whereNull('deleted_at')
        .whereRaw('MONTH(created_at) = ?', [month])
        .whereRaw('YEAR(created_at) = ?', [year])

      const completed = tasks.filter(t => t.status === 'completed')
      const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')

      monthlyTrend.push({
        month: date.toFormat('MMM'),
        total: tasks.length,
        completed: completed.length,
        pending: pending.length
      })
    }

    // ========== 8. TASK STATUS DISTRIBUTION ==========
    const statusDistribution = {
      pending: Number(pendingTasks[0].$extras.total) || 0,
      completed: Number(completedTasks[0].$extras.total) || 0,
      followUp: Number(followUpTasks[0].$extras.total) || 0,
      callAgain: Number(callAgainTasks[0].$extras.total) || 0,
      notConverted: Number(notConvertedTasks[0].$extras.total) || 0
    }

    // ========== 9. RESPONSE ==========
    return {
      summary: {
        employees: {
          total: totalEmployeesCount,
          active: activeEmployees,
          new: newEmployeesCount
        },
        tasks: {
          total: Number(totalTasks[0].$extras.total) || 0,
          pending: Number(pendingTasks[0].$extras.total) || 0,
          completed: Number(completedTasks[0].$extras.total) || 0,
          followUp: Number(followUpTasks[0].$extras.total) || 0,
          callAgain: Number(callAgainTasks[0].$extras.total) || 0,
          notConverted: Number(notConvertedTasks[0].$extras.total) || 0
        },
        attendance: {
          present,
          late,
          absent,
          halfDay,
          total: totalEmployeesForAttendance,
          percentage: attendancePercentage
        },
        leaves: {
          pending: Number(pendingLeaves[0].$extras.total) || 0,
          approved: Number(approvedLeaves[0].$extras.total) || 0,
          rejected: Number(rejectedLeaves[0].$extras.total) || 0
        },
        salary: {
          totalSalary,
          totalIncentive,
          totalLateDeduction,
          totalNetSalary,
          paid: paidCount,
          pending: pendingCount
        }
      },
      charts: {
        monthlyTrend,
        statusDistribution
      },
      recentActivities
    }
  }
}