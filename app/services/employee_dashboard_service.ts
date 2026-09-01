// app/services/employee_dashboard_service.ts
import User from '#models/user'
import TaskManagement from '#models/task_management'
import Attendance from '#models/attendance'
import Holiday from '#models/holiday'
import LeaveRequest from '#models/leave_request'
import { DateTime } from 'luxon'

export default class EmployeeDashboardService {
  /**
   * Helper: Working days counter (Only Sunday + DB Holidays are excluded)
   */
  private async getWorkingDaysCount(month: number, year: number, upToDay?: number): Promise<number> {
    const daysInMonth = DateTime.fromObject({ month, year }).daysInMonth || 30
    const endDay = upToDay ? Math.min(upToDay, daysInMonth) : daysInMonth

    const holidays = await Holiday.query()
      .whereRaw('MONTH(holiday_date) = ?', [month])
      .whereRaw('YEAR(holiday_date) = ?', [year])
      .whereNull('deleted_at')

    const holidayDates = new Set(
      holidays.map((h) => {
        if (typeof h.holidayDate === 'string') {
          return h.holidayDate
        }
        return DateTime.fromJSDate(new Date(h.holidayDate)).toISODate()
      })
    )

    let workingDays = 0

    for (let day = 1; day <= endDay; day++) {
      const date = DateTime.fromObject({ year, month, day })
      const dateStr = date.toISODate()

      // Exclude Sunday (weekday 7)
      if (date.weekday === 7) {
        continue
      }

      // Exclude Database declared holidays
      if (holidayDates.has(dateStr)) {
        continue
      }

      workingDays++
    }

    return workingDays
  }

  private formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  private getTimeAgo(date: DateTime): string {
    const diff = DateTime.now().diff(date, ['days', 'hours', 'minutes']).toObject()
    if ((diff.days || 0) > 0) return `${Math.floor(diff.days!)} days ago`
    if ((diff.hours || 0) > 0) return `${Math.floor(diff.hours!)} hours ago`
    if ((diff.minutes || 0) > 0) return `${Math.floor(diff.minutes!)} mins ago`
    return 'just now'
  }

  /**
   * Complete Employee Dashboard
   */
  async getEmployeeDashboard(employeeId: number) {
    const now = DateTime.now()
    const today = now.toISODate()
    const currentMonth = now.month
    const currentYear = now.year

    // ========== 1. USER PROFILE ==========
    const user = await User.find(employeeId)
    if (!user) {
      throw new Error('Employee not found')
    }

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      designation: (user as any).designation || 'Employee',
      mobile: (user as any).mobile || '',
      doj: (user as any).doj || user.createdAt.toISODate(),
      profileImage: (user as any).profileImage || null,
      profileImageRaw: (user as any).profileImageRaw || null
    }

    // ========== 2. WORKING DAYS & PASSED DAYS ==========
    const totalWorkingDays = await this.getWorkingDaysCount(currentMonth, currentYear)
    const passedWorkingDays = await this.getWorkingDaysCount(currentMonth, currentYear, now.day)

    // ========== 3. TODAY ATTENDANCE ==========
    const todayAttendanceRecord = await Attendance.query()
      .where('employee_id', employeeId)
      .where('attendance_date', today)
      .first()

    const todayAttendance = todayAttendanceRecord
      ? {
          status: todayAttendanceRecord.status,
          checkIn: todayAttendanceRecord.checkIn ? todayAttendanceRecord.checkIn.toFormat('HH:mm') : null,
          checkOut: todayAttendanceRecord.checkOut ? todayAttendanceRecord.checkOut.toFormat('HH:mm') : null,
          workingHours: todayAttendanceRecord.workingMinutes ? this.formatMinutesToHours(todayAttendanceRecord.workingMinutes) : null
        }
      : null

    // ========== 4. ATTENDANCE SUMMARY (ACCURATE CALCULATION) ==========
    const monthlyAttendances = await Attendance.query()
      .where('employee_id', employeeId)
      .whereRaw('MONTH(attendance_date) = ?', [currentMonth])
      .whereRaw('YEAR(attendance_date) = ?', [currentYear])

    let present = 0
    let late = 0
    let halfDay = 0
    let explicitAbsent = 0
    let totalWorkingMinutes = 0

    for (const att of monthlyAttendances) {
      totalWorkingMinutes += att.workingMinutes || 0

      switch (att.status) {
        case 'Present':
          present++
          break
        case 'Late':
          present++ 
          late++
          break
        case 'Half Day':
          halfDay++
          break
        case 'Absent':
          explicitAbsent++
          break
      }
    }

    const attendedDays = present + halfDay
    const calculatedAbsent = Math.max(0, passedWorkingDays - attendedDays) + explicitAbsent

    const attendancePercentage = passedWorkingDays > 0
      ? Math.round(((present + (halfDay * 0.5)) / passedWorkingDays) * 100)
      : 0

    const attendanceSummary = {
      present,
      late,
      halfDay,
      absent: calculatedAbsent,
      totalWorkingDays,
      passedWorkingDays,
      attendancePercentage,
      totalWorkingHours: this.formatMinutesToHours(totalWorkingMinutes)
    }

    // ========== 5. TASK SUMMARY & DISTRIBUTION ==========
    const pendingTasksCount = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .where('status', 'pending')
      .count('* as total')

    const completedTasksCount = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .where('status', 'completed')
      .count('* as total')

    const followUpTasksCount = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .where('status', 'follow_up')
      .count('* as total')

    const callAgainTasksCount = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .where('status', 'call_again')
      .count('* as total')

    const notConvertedTasksCount = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .where('status', 'not_converted')
      .count('* as total')

    const totalTasksCount = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .count('* as total')

    const taskDistribution = {
      pending: Number(pendingTasksCount[0].$extras.total) || 0,
      completed: Number(completedTasksCount[0].$extras.total) || 0,
      followUp: Number(followUpTasksCount[0].$extras.total) || 0,
      callAgain: Number(callAgainTasksCount[0].$extras.total) || 0,
      notConverted: Number(notConvertedTasksCount[0].$extras.total) || 0
    }

    const taskSummary = {
      total: Number(totalTasksCount[0].$extras.total) || 0,
      ...taskDistribution
    }

    // ========== 6. RECENT TASKS ==========
    const recentTasksData = await TaskManagement.query()
      .where('assign_to', employeeId)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(5)

    const recentTasks = recentTasksData.map((task) => ({
      id: task.id,
      taskAction: task.taskAction || '-',
      clientName: task.clientName || '-',
      status: task.status || '-',
      priority: (task as any).priority || 'medium',
      followUpDate: (task as any).followUpDate || null,
      insuranceCategory: (task as any).insuranceCategory || '-'
    }))

    // ========== 7. LEAVE SUMMARY & BALANCES ==========
    const leaveRequests = await LeaveRequest.query()
      .where('employee_id', employeeId)
      .whereRaw('YEAR(created_at) = ?', [currentYear])
      .orderBy('created_at', 'desc')

    const leaveQuotas: Record<string, number> = {
      'Casual Leave': 12,
      'Sick Leave': 10,
      'Paid Leave': 15
    }

    const leaveSummaryMap: Record<string, { total: number; used: number; pending: number }> = {}

    for (const [type, quota] of Object.entries(leaveQuotas)) {
      leaveSummaryMap[type] = { total: quota, used: 0, pending: 0 }
    }

    for (const leave of leaveRequests) {
      const type = (leave as any).leaveType || 'Casual Leave'
      const days = Number((leave as any).totalDays || (leave as any).numberOfDays || 1)
      const status = leave.status

      if (!leaveSummaryMap[type]) {
        leaveSummaryMap[type] = { total: 10, used: 0, pending: 0 }
      }

      if (status === 'Approved' || status === 'Accepted') {
        leaveSummaryMap[type].used += days
      } else if (status === 'Pending') {
        leaveSummaryMap[type].pending += days
      }
    }

    const leaveSummary = Object.keys(leaveSummaryMap).map((type) => {
      const item = leaveSummaryMap[type]
      const remaining = Math.max(0, item.total - item.used)
      return {
        leaveType: type,
        total: item.total,
        used: item.used,
        remaining: remaining,
        pending: item.pending
      }
    })

    const pendingLeaveCount = leaveRequests.filter((l) => l.status === 'Pending').length

    const recentLeaves = leaveRequests.slice(0, 5).map((leave) => ({
      id: leave.id,
      leaveType: (leave as any).leaveType || 'Leave',
      startDate: (leave as any).startDate || '-',
      endDate: (leave as any).endDate || '-',
      totalDays: (leave as any).totalDays || 1,
      reason: (leave as any).reason || '',
      status: leave.status,
      createdAt: leave.createdAt.toISODate()
    }))

    // ========== 8. WEEKLY TASK TREND ==========
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const targetDate = DateTime.now().minus({ days: i })
      const dateStr = targetDate.toISODate()

      const dayTasks = await TaskManagement.query()
        .where('assign_to', employeeId)
        .whereNull('deleted_at')
        .whereRaw('DATE(created_at) = ?', [dateStr])

      const completed = dayTasks.filter((t) => t.status === 'completed').length
      const pending = dayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

      weeklyTrend.push({
        date: targetDate.toFormat('dd MMM'),
        total: dayTasks.length,
        completed,
        pending
      })
    }

    // ========== 9. RECENT ACTIVITIES ==========
    const recentActivities = recentTasksData.slice(0, 3).map((task) => ({
      type: 'task',
      message: `Task "${task.taskAction}" is ${task.status}`,
      client: task.clientName || '-',
      time: this.getTimeAgo(task.createdAt)
    }))

    return {
      profile,
      todayAttendance,
      attendanceSummary,
      taskSummary,
      taskStatusDistribution: taskDistribution,
      recentTasks,
      leaveSummary,
      recentLeaves,
      pendingLeaveRequests: pendingLeaveCount,
      weeklyTrend,
      recentActivities
    }
  }
}