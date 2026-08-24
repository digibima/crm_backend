// app/services/attendance_service.ts
import Attendance from '#models/attendance'
import AttendanceSetting from '#models/attendance_setting'
import AttendanceRequest from '#models/attendance_request'
import Holiday from '#models/holiday' 
import User from '#models/user'
import { DateTime } from 'luxon'

export default class AttendanceService {
  private readonly OFFICE_LATITUDE = 26.887194
  private readonly OFFICE_LONGITUDE = 75.760226
  private readonly ALLOWED_RADIUS_METERS = 30

  private validateLocation(latitude: number, longitude: number): boolean {
    const distance = this.calculateDistance(
      latitude,
      longitude,
      this.OFFICE_LATITUDE,
      this.OFFICE_LONGITUDE
    )
    return distance <= this.ALLOWED_RADIUS_METERS
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 
    const φ1 = this.toRadians(lat1)
    const φ2 = this.toRadians(lat2)
    const Δφ = this.toRadians(lat2 - lat1)
    const Δλ = this.toRadians(lon2 - lon1)

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c 
  }

  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180
  }

  async checkIn(employeeId: number, data: { 
    latitude?: string; 
    longitude?: string; 
    remarks?: string; 
    ip?: string 
  }) {
    const today = DateTime.now().toISODate()
    const holidayCheck = await this.isHoliday(today)
    if (holidayCheck.isHoliday) {
      throw new Error(`Today is a holiday: ${holidayCheck.holiday.title}. No check-in required.`)
    }
    
    // Check if already checked in today
    const existing = await Attendance.query()
      .where('employee_id', employeeId)
      .where('attendance_date', today)
      .whereNull('check_out')
      .first()

    if (existing) {
      throw new Error('Already checked in today')
    }

    const settings = await AttendanceSetting.first()

    if (settings?.gpsRequired !== false) { 
      if (!data.latitude || !data.longitude) {
        throw new Error('GPS location is required for check-in')
      }

      const latitude = parseFloat(data.latitude)
      const longitude = parseFloat(data.longitude)

      if (!this.validateLocation(latitude, longitude)) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          this.OFFICE_LATITUDE,
          this.OFFICE_LONGITUDE
        )
        throw new Error(
          `You must be within ${this.ALLOWED_RADIUS_METERS} meters of the office to check in. ` +
          `You are ${Math.round(distance)} meters away.`
        )
      }
    }
    
    const now = DateTime.now()
    const checkInTime = now.toFormat('HH:mm')
    const officeStartTime = settings?.officeStartTime || '10:00'
    const graceMinutes = settings?.graceMinutes || 5

    // Determine status
    let status: 'Present' | 'Late' | 'Half Day' | 'Absent' = 'Present'
    
    const checkInMinutes = this.timeToMinutes(checkInTime)
    const officeStartMinutes = this.timeToMinutes(officeStartTime)
    
    if (checkInMinutes > officeStartMinutes + graceMinutes) {
      status = 'Late'
    }

    // Create attendance
    const attendance = await Attendance.create({
      employeeId,
      attendanceDate: today,
      checkIn: now,
      checkInLatitude: data.latitude ? parseFloat(data.latitude) : null,
      checkInLongitude: data.longitude ? parseFloat(data.longitude) : null,
      checkInIp: data.ip || null,
      status,
      remarks: data.remarks || null,
      workingMinutes: 0,
      overtimeMinutes: 0
    })

    return attendance
  }

  async isHoliday(date: string) {
    const dateObj = DateTime.fromISO(date)
    
    // Check if it's Sunday (Weekday 7)
    if (dateObj.weekday === 7) {
      return {
        isHoliday: true,
        holiday: {
          title: 'Sunday',
          type: 'weekend',
          isPaid: true
        }
      }
    }

    // Check if it's a holiday in database
    const holiday = await Holiday.query()
      .where('holiday_date', date)
      .whereNull('deleted_at')
      .first()

    if (holiday) {
      return {
        isHoliday: true,
        holiday: {
          id: holiday.id,
          title: holiday.title,
          type: holiday.type,
          isPaid: holiday.isPaid
        }
      }
    }

    return { isHoliday: false }
  }

  /**
   * Check Out with Location Validation
   */
  async checkOut(employeeId: number, data: { 
    latitude?: string; 
    longitude?: string; 
    remarks?: string; 
    ip?: string 
  }) {
    const today = DateTime.now().toISODate()
    
    const attendance = await Attendance.query()
      .where('employee_id', employeeId)
      .where('attendance_date', today)
      .whereNull('check_out')
      .first()

    if (!attendance) {
      throw new Error('No active check-in found')
    }

    // Get settings
    const settings = await AttendanceSetting.first()
    
    // Validate GPS location if required
    if (settings?.gpsRequired !== false) {
      if (!data.latitude || !data.longitude) {
        throw new Error('GPS location is required for check-out')
      }

      const latitude = parseFloat(data.latitude)
      const longitude = parseFloat(data.longitude)

      if (!this.validateLocation(latitude, longitude)) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          this.OFFICE_LATITUDE,
          this.OFFICE_LONGITUDE
        )
        throw new Error(
          `You must be within ${this.ALLOWED_RADIUS_METERS} meters of the office to check out. ` +
          `You are ${Math.round(distance)} meters away.`
        )
      }
    }

    const now = DateTime.now()
    attendance.checkOut = now
    attendance.checkOutLatitude = data.latitude ? parseFloat(data.latitude) : null
    attendance.checkOutLongitude = data.longitude ? parseFloat(data.longitude) : null
    attendance.checkOutIp = data.ip || null
    attendance.remarks = data.remarks || attendance.remarks

    // Calculate working minutes
    if (attendance.checkIn) {
      const checkIn = attendance.checkIn
      const workingMinutes = Math.floor(now.diff(checkIn, 'minutes').minutes)
      attendance.workingMinutes = workingMinutes

      const overtimeAfterMinutes = settings?.overtimeAfterMinutes || 30
      const minimumWorkingMinutes = settings?.minimumWorkingMinutes || 480

      // Calculate overtime
      if (workingMinutes > minimumWorkingMinutes) {
        attendance.overtimeMinutes = workingMinutes - minimumWorkingMinutes
      }

      // Update status based on working hours
      if (workingMinutes < minimumWorkingMinutes) {
        attendance.status = 'Half Day'
      }
    }

    await attendance.save()
    return attendance
  }

  /**
   * Get Location Status
   */
  async getLocationStatus(data: { latitude?: string; longitude?: string }) {
    if (!data.latitude || !data.longitude) {
      return {
        status: false,
        message: 'GPS location is required',
        distance: null,
        isWithinRadius: false
      }
    }

    const latitude = parseFloat(data.latitude)
    const longitude = parseFloat(data.longitude)
    const distance = this.calculateDistance(
      latitude,
      longitude,
      this.OFFICE_LATITUDE,
      this.OFFICE_LONGITUDE
    )
    const isWithinRadius = distance <= this.ALLOWED_RADIUS_METERS

    return {
      status: true,
      officeLocation: {
        latitude: this.OFFICE_LATITUDE,
        longitude: this.OFFICE_LONGITUDE
      },
      distance: Math.round(distance),
      isWithinRadius,
      allowedRadius: this.ALLOWED_RADIUS_METERS,
      message: isWithinRadius 
        ? 'You are within the office premises' 
        : `You are ${Math.round(distance)} meters away from the office`
    }
  }

  /**
   * Get Today's Attendance
   */
  async getTodayAttendance(employeeId: number) {
    const today = DateTime.now().toISODate()
    
    const attendance = await Attendance.query()
      .where('employee_id', employeeId)
      .where('attendance_date', today)
      .first()

    if (!attendance) {
      return null
    }

    return {
      checkIn: attendance.checkIn?.toFormat('HH:mm') || null,
      checkOut: attendance.checkOut?.toFormat('HH:mm') || null,
      workingHours: this.formatMinutesToHours(attendance.workingMinutes),
      status: attendance.status,
      overtime: this.formatMinutesToHours(attendance.overtimeMinutes)
    }
  }

  /**
   * Get Attendance History
   */
  async getAttendanceHistory(
    employeeId: number,
    filters: {
      month?: number
      year?: number
      fromDate?: string
      toDate?: string
    }
  ) {
    const query = Attendance.query()
      .where('employee_id', employeeId)
      .orderBy('attendance_date', 'desc')

    if (filters.month) {
      query.whereRaw('MONTH(attendance_date) = ?', [filters.month])
    }

    if (filters.year) {
      query.whereRaw('YEAR(attendance_date) = ?', [filters.year])
    }

    if (filters.fromDate) {
      query.where('attendance_date', '>=', filters.fromDate)
    }

    if (filters.toDate) {
      query.where('attendance_date', '<=', filters.toDate)
    }

    const paginatedResult = await query.paginate(1, 30)

    const formattedData = paginatedResult.all().map((attendance) => ({
      id: attendance.id,
      attendanceDate: attendance.attendanceDate.toISODate(),
      checkIn: attendance.checkIn?.toFormat('HH:mm') || null,
      checkOut: attendance.checkOut?.toFormat('HH:mm') || null,
      checkInFull: attendance.checkIn?.toISO() || null,
      checkOutFull: attendance.checkOut?.toISO() || null,
      workingHours: this.formatMinutesToHours(attendance.workingMinutes),
      workingMinutes: attendance.workingMinutes,
      overtime: this.formatMinutesToHours(attendance.overtimeMinutes),
      overtimeMinutes: attendance.overtimeMinutes,
      status: attendance.status,
      remarks: attendance.remarks,
      location: {
        checkIn: {
          latitude: attendance.checkInLatitude,
          longitude: attendance.checkInLongitude,
        },
        checkOut: {
          latitude: attendance.checkOutLatitude,
          longitude: attendance.checkOutLongitude,
        },
      },
      ip: {
        checkIn: attendance.checkInIp,
        checkOut: attendance.checkOutIp,
      },
      createdAt: attendance.createdAt?.toISO(),
      updatedAt: attendance.updatedAt?.toISO(),
    }))

    const today = DateTime.now().toISODate()

    const todayAttendance = await Attendance.query()
      .where('employee_id', employeeId)
      .where('attendance_date', today)
      .first()

    const todaySummary = todayAttendance
      ? {
          checkIn: todayAttendance.checkIn?.toFormat('HH:mm') || null,
          checkOut: todayAttendance.checkOut?.toFormat('HH:mm') || null,
          workingHours: this.formatMinutesToHours(todayAttendance.workingMinutes),
          status: todayAttendance.status,
          overtime: this.formatMinutesToHours(todayAttendance.overtimeMinutes),
        }
      : null

    return {
      todayAttendance: todaySummary,
      meta: paginatedResult.getMeta(),
      data: formattedData,
    }
  }

  /**
   * Get Attendance Summary
   */
/**
 * Get Employee Attendance Summary with Accurate Working Days & Absent
 */
async getAttendanceSummary(employeeId: number) {
  const now = DateTime.now()
  const month = now.month
  const year = now.year

  // 1. Calculate working days (Only Sunday + DB Holidays excluded)
  const totalWorkingDays = await this.getWorkingDaysCount(month, year)
  const passedWorkingDays = await this.getWorkingDaysCount(month, year, now.day)

  // 2. Fetch monthly attendances
  const attendances = await Attendance.query()
    .where('employee_id', employeeId)
    .whereRaw('MONTH(attendance_date) = ?', [month])
    .whereRaw('YEAR(attendance_date) = ?', [year])

  let present = 0
  let late = 0
  let halfDay = 0
  let explicitAbsent = 0
  let totalWorkingMinutes = 0

  for (const att of attendances) {
    totalWorkingMinutes += att.workingMinutes || 0

    switch (att.status) {
      case 'Present':
        present++
        break
      case 'Late':
        present++ // Late ko present count me include kiya
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

  // 3. Exact Absent Calculation (Passed Working Days - Attended Days)
  const attendedDays = present + halfDay
  const calculatedAbsent = Math.max(0, passedWorkingDays - attendedDays) + explicitAbsent

  const attendancePercentage = passedWorkingDays > 0
    ? Math.round(((present + (halfDay * 0.5)) / passedWorkingDays) * 100)
    : 0

  return {
    month,
    year,
    present,
    late,
    halfDay,
    absent: calculatedAbsent,
    totalWorkingDays,
    passedWorkingDays,
    totalRecords: attendances.length,
    attendancePercentage,
    totalWorkingHours: this.formatMinutesToHours(totalWorkingMinutes)
  }
}
  /**
   * Create Attendance Request
   */
  async createAttendanceRequest(employeeId: number, data: {
    attendanceId: number
    requestType: string
    reason: string
    attachment?: string
  }) {
    const attendance = await Attendance.find(data.attendanceId)
    if (!attendance) {
      throw new Error('Attendance record not found')
    }

    if (attendance.employeeId !== employeeId) {
      throw new Error('You can only request for your own attendance')
    }

    const existing = await AttendanceRequest.query()
      .where('attendance_id', data.attendanceId)
      .where('employee_id', employeeId)
      .where('status', 'Pending')
      .first()

    if (existing) {
      throw new Error('You already have a pending request for this attendance')
    }

    const request = await AttendanceRequest.create({
      employeeId,
      attendanceId: data.attendanceId,
      requestType: data.requestType as any,
      reason: data.reason,
      attachment: data.attachment || null,
      status: 'Pending'
    })

    return request
  }

  /**
   * Get Employee's Attendance Requests
   */
  async getEmployeeRequests(employeeId: number) {
    return await AttendanceRequest.query()
      .where('employee_id', employeeId)
      .preload('attendance')
      .orderBy('created_at', 'desc')
  }

  // ========== ADMIN APIs ==========

  /**
   * Admin Dashboard
   */
  async getAdminDashboard() {
    const today = DateTime.now().toISODate()

    const totalEmployees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .count('* as total')

    const todayAttendances = await Attendance.query()
      .where('attendance_date', today)

    let present = 0, late = 0, absent = 0, halfDay = 0

    const employees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')

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

    const pendingRequests = await AttendanceRequest.query()
      .where('status', 'Pending')
      .count('* as total')

    return {
      totalEmployees: Number(totalEmployees[0].$extras.total) || 0,
      present,
      late,
      absent,
      halfDay,
      pendingRequests: Number(pendingRequests[0].$extras.total) || 0
    }
  }

  /**
   * Admin - Get All Attendance List
   */
  async getAdminAttendanceList(page = 1, limit = 20, filters?: any) {
    const query = Attendance.query()
      .preload('employee', (query) => {
        query.select('id', 'name', 'email')
      })
      .orderBy('attendance_date', 'desc')

    if (filters?.employeeId) {
      query.where('employee_id', filters.employeeId)
    }
    if (filters?.status) {
      query.where('status', filters.status)
    }
    if (filters?.date) {
      query.where('attendance_date', filters.date)
    }
    if (filters?.month) {
      query.whereRaw('MONTH(attendance_date) = ?', [filters.month])
    }
    if (filters?.year) {
      query.whereRaw('YEAR(attendance_date) = ?', [filters.year])
    }

    return await query.paginate(page, limit)
  }

  /**
   * Admin - Get Single Attendance Detail
   */
  async getAttendanceDetail(id: number) {
    return await Attendance.query()
      .where('id', id)
      .preload('employee', (query) => {
        query.select('id', 'name', 'email')
      })
      .preload('requests')
      .first()
  }

  /**
   * Admin - Update Attendance Manually
   */
  async updateAttendance(id: number, data: { checkIn?: string; checkOut?: string; status?: string; remarks?: string }) {
    const attendance = await Attendance.find(id)
    if (!attendance) {
      throw new Error('Attendance not found')
    }

    if (data.checkIn) {
      attendance.checkIn = DateTime.fromISO(data.checkIn)
    }
    if (data.checkOut) {
      attendance.checkOut = DateTime.fromISO(data.checkOut)
    }
    if (data.status) {
      attendance.status = data.status as any
    }
    if (data.remarks) {
      attendance.remarks = data.remarks
    }

    if (attendance.checkIn && attendance.checkOut) {
      attendance.workingMinutes = Math.floor(attendance.checkOut.diff(attendance.checkIn, 'minutes').minutes)
    }

    await attendance.save()
    return attendance
  }

  /**
   * Admin - Delete Attendance
   */
  async deleteAttendance(id: number) {
    const attendance = await Attendance.find(id)
    if (!attendance) {
      throw new Error('Attendance not found')
    }
    await attendance.delete()
    return { message: 'Attendance deleted successfully' }
  }

  /**
   * Admin - Get Attendance Requests
   */
  async getAttendanceRequests(status?: string) {
    const query = AttendanceRequest.query()
      .preload('employee', (query) => {
        query.select('id', 'name', 'email')
      })
      .preload('attendance')
      .orderBy('created_at', 'desc')

    if (status) {
      query.where('status', status as any)
    }

    return await query
  }

  /**
   * Admin - Approve/Reject Request
   */
  async handleAttendanceRequest(requestId: number, status: 'Approved' | 'Rejected', adminRemark?: string, adminId?: number) {
    const request = await AttendanceRequest.find(requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    request.status = status
    request.adminRemark = adminRemark || null
    request.approvedBy = adminId || null
    request.approvedAt = DateTime.now()

    await request.save()
    return request
  }

  /**
   * Admin - Get Attendance Report
   */
  async getAttendanceReport(filters?: { employeeId?: number; month?: number; year?: number; status?: string }) {
    const query = Attendance.query()
      .preload('employee', (query) => {
        query.select('id', 'name', 'email')
      })

    if (filters?.employeeId) {
      query.where('employee_id', filters.employeeId)
    }
    if (filters?.month) {
      query.whereRaw('MONTH(attendance_date) = ?', [filters.month])
    }
    if (filters?.year) {
      query.whereRaw('YEAR(attendance_date) = ?', [filters.year])
    }
    if (filters?.status) {
      query.where('status', filters.status)
    }

    return await query.orderBy('attendance_date', 'desc')
  }

  /**
   * Get Attendance Settings
   */
  async getSettings() {
    let settings = await AttendanceSetting.first()
    if (!settings) {
      settings = await AttendanceSetting.create({
        officeStartTime: '10:00',
        officeEndTime: '19:00',
        graceMinutes: 5,
        minimumWorkingMinutes: 480,
        overtimeAfterMinutes: 30,
        gpsRequired: false,
        allowManualRequest: true
      })
    }
    return settings
  }

  /**
   * Update Attendance Settings
   */
  async updateSettings(data: any) {
    let settings = await AttendanceSetting.first()
    if (!settings) {
      settings = new AttendanceSetting()
    }

    if (data.officeStartTime) settings.officeStartTime = data.officeStartTime
    if (data.officeEndTime) settings.officeEndTime = data.officeEndTime
    if (data.graceMinutes) settings.graceMinutes = data.graceMinutes
    if (data.minimumWorkingMinutes) settings.minimumWorkingMinutes = data.minimumWorkingMinutes
    if (data.halfDayAfter) settings.halfDayAfter = data.halfDayAfter
    if (data.overtimeAfterMinutes) settings.overtimeAfterMinutes = data.overtimeAfterMinutes
    if (data.gpsRequired !== undefined) settings.gpsRequired = data.gpsRequired
    if (data.allowManualRequest !== undefined) settings.allowManualRequest = data.allowManualRequest

    await settings.save()
    return settings
  }

  // ========== Helper Methods ==========

  private timeToMinutes(time: string): number {
    const parts = time.split(':')
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }

  private formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  /**
   * Working days counter: Only Sunday (7) is off + DB Holiday is off
   */
  private async getWorkingDaysCount(month: number, year: number, upToDay?: number): Promise<number> {
    const daysInMonth = DateTime.fromObject({ month, year }).daysInMonth || 30
    const endDay = upToDay ? Math.min(upToDay, daysInMonth) : daysInMonth

    // Get all holidays in database for this month
    const holidays = await Holiday.query()
      .whereRaw('MONTH(holiday_date) = ?', [month])
      .whereRaw('YEAR(holiday_date) = ?', [year])
      .whereNull('deleted_at')

    // Store holiday date strings (e.g. '2026-08-15')
    const holidayDates = new Set(
      holidays.map(h => {
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

      // Exclude Sunday (weekday === 7)
      if (date.weekday === 7) {
        continue
      }

      // Exclude database declared holidays
      if (holidayDates.has(dateStr)) {
        continue
      }

      workingDays++
    }

    return workingDays
  }

  /**
   * Complete Admin Dashboard with accurate Absent calculation
   */
  async getAdminCompleteDashboard(filters?: {
    employeeId?: number;
    date?: string;
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const now = DateTime.now()
    const today = now.toISODate()
    const currentMonth = Number(filters?.month) || now.month
    const currentYear = Number(filters?.year) || now.year
    const page = Number(filters?.page) || 1
    const limit = Number(filters?.limit) || (filters?.employeeId ? 100 : 20)

    // Total month working days
    const totalWorkingDays = await this.getWorkingDaysCount(currentMonth, currentYear)

    // Till date passed working days for absent calculation
    const isCurrentMonth = now.month === currentMonth && now.year === currentYear
    const isPastMonth = (currentYear < now.year) || (currentYear === now.year && currentMonth < now.month)
    
    const passedWorkingDays = isCurrentMonth
      ? await this.getWorkingDaysCount(currentMonth, currentYear, now.day)
      : (isPastMonth ? totalWorkingDays : 0)

    // Query employees (filtered if employeeId provided)
    const employeeQuery = User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'email')

    if (filters?.employeeId) {
      employeeQuery.where('id', filters.employeeId)
    }

    const employees = await employeeQuery
    const totalEmployeesCount = employees.length

    // Today's attendance
    const todayAttendanceQuery = Attendance.query().where('attendance_date', today)
    if (filters?.employeeId) {
      todayAttendanceQuery.where('employee_id', filters.employeeId)
    }
    const todayAttendances = await todayAttendanceQuery

    let present = 0, late = 0, absent = 0, halfDay = 0

    for (const employee of employees) {
      const att = todayAttendances.find(a => a.employeeId === employee.id)
      if (att) {
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
            absent++
            break
        }
      } else {
        absent++
      }
    }

    const pendingRequestsQuery = AttendanceRequest.query().where('status', 'Pending')
    if (filters?.employeeId) {
      pendingRequestsQuery.where('employee_id', filters.employeeId)
    }
    const pendingRequests = await pendingRequestsQuery.count('* as total')

    // Monthly attendances
    const monthlyAttendancesQuery = Attendance.query()
      .whereRaw('MONTH(attendance_date) = ?', [currentMonth])
      .whereRaw('YEAR(attendance_date) = ?', [currentYear])

    if (filters?.employeeId) {
      monthlyAttendancesQuery.where('employee_id', filters.employeeId)
    }
    const monthlyAttendances = await monthlyAttendancesQuery

    let monthlyPresent = 0, monthlyLate = 0, monthlyHalfDay = 0

    for (const att of monthlyAttendances) {
      switch (att.status) {
        case 'Present':
          monthlyPresent++
          break
        case 'Late':
          monthlyPresent++
          monthlyLate++
          break
        case 'Half Day':
          monthlyHalfDay++
          break
      }
    }

    // ========== EMPLOYEE MONTHLY SUMMARY ==========
    const employeeMonthlySummary = []
    let totalMonthlyCalculatedAbsent = 0

    for (const user of employees) {
      const userAttendances = await Attendance.query()
        .where('employee_id', user.id)
        .whereRaw('MONTH(attendance_date) = ?', [currentMonth])
        .whereRaw('YEAR(attendance_date) = ?', [currentYear])

      let userPresent = 0, userLate = 0, userHalfDay = 0, userExplicitAbsent = 0

      for (const att of userAttendances) {
        switch (att.status) {
          case 'Present':
            userPresent++
            break
          case 'Late':
            userPresent++
            userLate++
            break
          case 'Half Day':
            userHalfDay++
            break
          case 'Absent':
            userExplicitAbsent++
            break
        }
      }

      // Attended days = Present + Half Day
      const attendedDays = userPresent + userHalfDay
      
      // Absent = Till date working days - Attended days (plus any marked absent)
      const userAbsent = Math.max(0, passedWorkingDays - attendedDays) + userExplicitAbsent
      totalMonthlyCalculatedAbsent += userAbsent

      employeeMonthlySummary.push({
        employee: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        summary: {
          present: userPresent,
          late: userLate,
          halfDay: userHalfDay,
          absent: userAbsent,
          total: userAttendances.length,
          workingDays: totalWorkingDays,
          passedWorkingDays: passedWorkingDays
        }
      })
    }

    // ========== TODAY RECORDS & LIST ==========
    const todayRecordsQuery = Attendance.query()
      .where('attendance_date', today)
      .preload('employee', (q) => q.select('id', 'name', 'email'))
      .orderBy('created_at', 'desc')

    if (filters?.employeeId) {
      todayRecordsQuery.where('employee_id', filters.employeeId)
    }
    const todayRecords = await todayRecordsQuery

    const listQuery = Attendance.query()
      .preload('employee', (q) => q.select('id', 'name', 'email'))
      .orderBy('attendance_date', 'desc')

    if (filters?.employeeId) {
      listQuery.where('employee_id', filters.employeeId)
    }
    if (filters?.status) {
      listQuery.where('status', filters.status)
    }
    if (filters?.date) {
      listQuery.where('attendance_date', filters.date)
    }
    if (filters?.month) {
      listQuery.whereRaw('MONTH(attendance_date) = ?', [filters.month])
    }
    if (filters?.year) {
      listQuery.whereRaw('YEAR(attendance_date) = ?', [filters.year])
    }

    const attendanceList = await listQuery.paginate(page, limit)

    const recentActivityQuery = Attendance.query()
      .orderBy('created_at', 'desc')
      .limit(10)
      .preload('employee', (q) => q.select('id', 'name', 'email'))

    if (filters?.employeeId) {
      recentActivityQuery.where('employee_id', filters.employeeId)
    }
    const recentActivity = await recentActivityQuery

    const pendingRequestsListQuery = AttendanceRequest.query()
      .where('status', 'Pending')
      .preload('employee', (q) => q.select('id', 'name', 'email'))
      .preload('attendance')
      .orderBy('created_at', 'desc')
      .limit(10)

    if (filters?.employeeId) {
      pendingRequestsListQuery.where('employee_id', filters.employeeId)
    }
    const pendingRequestsList = await pendingRequestsListQuery

    const attendancePercentage = totalEmployeesCount > 0 
      ? Math.round(((present + halfDay) / totalEmployeesCount) * 100)
      : 0

    // ========== WEEKLY TREND ==========
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = DateTime.now().minus({ days: i }).toISODate()
      const dayAttendancesQuery = Attendance.query().where('attendance_date', date)
      
      if (filters?.employeeId) {
        dayAttendancesQuery.where('employee_id', filters.employeeId)
      }
      const dayAttendances = await dayAttendancesQuery
      
      let dayPresent = 0, dayLate = 0, dayAbsent = 0, dayHalfDay = 0
      
      for (const att of dayAttendances) {
        switch (att.status) {
          case 'Present':
            dayPresent++
            break
          case 'Late':
            dayPresent++   
            dayLate++
            break
          case 'Half Day':
            dayHalfDay++
            break
          case 'Absent':
            dayAbsent++
            break
        }
      }

      weeklyTrend.push({
        date,
        present: dayPresent,
        late: dayLate,
        halfDay: dayHalfDay,
        absent: dayAbsent,
        total: dayAttendances.length
      })
    }

    const settingsData = await this.getSettings()

    return {
      today: {
        date: today,
        totalEmployees: totalEmployeesCount,
        present,
        late,
        absent,
        halfDay,
        attendancePercentage,
        status: attendancePercentage >= 80 ? 'Good' : attendancePercentage >= 60 ? 'Average' : 'Low'
      },
      monthly: {
        month: currentMonth,
        year: currentYear,
        workingDays: totalWorkingDays,
        passedWorkingDays,
        present: monthlyPresent,
        late: monthlyLate,
        halfDay: monthlyHalfDay,
        absent: totalMonthlyCalculatedAbsent,
        totalRecords: monthlyAttendances.length
      },
      employeeMonthlySummary,
      todayRecords,
      attendanceList,
      recentActivity,
      pendingRequests: {
        count: Number(pendingRequests[0].$extras.total) || 0,
        list: pendingRequestsList
      },
      weeklyTrend,
      settings: settingsData
    }
  }

  /**
   * Admin Edit Attendance
   */
  async editAttendance(id: number, data: {
    attendanceDate?: string
    checkIn?: string
    checkOut?: string
    status?: 'Present' | 'Late' | 'Half Day' | 'Absent'
    remarks?: string
  }) {
    const attendance = await Attendance.find(id)
    if (!attendance) {
      throw new Error('Attendance record not found')
    }

    if (data.attendanceDate) {
      attendance.attendanceDate = DateTime.fromISO(data.attendanceDate)
    }

    if (data.checkIn) {
      const [hours, minutes] = data.checkIn.split(':').map(Number)
      const checkInTime = DateTime.now().set({ hour: hours, minute: minutes, second: 0 })
      attendance.checkIn = checkInTime
    }

    if (data.checkOut) {
      const [hours, minutes] = data.checkOut.split(':').map(Number)
      const checkOutTime = DateTime.now().set({ hour: hours, minute: minutes, second: 0 })
      attendance.checkOut = checkOutTime
    }

    if (attendance.checkIn && attendance.checkOut) {
      attendance.workingMinutes = Math.floor(
        attendance.checkOut.diff(attendance.checkIn, 'minutes').minutes
      )
    }

    if (data.status) {
      attendance.status = data.status
    }

    if (data.remarks !== undefined) {
      attendance.remarks = data.remarks
    }

    if (!data.status && attendance.checkIn) {
      const settings = await AttendanceSetting.first()
      const officeStartTime = settings?.officeStartTime || '10:00'
      const graceMinutes = settings?.graceMinutes || 5
      
      const checkInMinutes = this.timeToMinutes(attendance.checkIn.toFormat('HH:mm'))
      const officeStartMinutes = this.timeToMinutes(officeStartTime)
      
      if (checkInMinutes > officeStartMinutes + graceMinutes) {
        attendance.status = 'Late'
      }
    }

    await attendance.save()

    return await Attendance.query()
      .where('id', id)
      .preload('employee', (query) => {
        query.select('id', 'name', 'email')
      })
      .first()
  }
}