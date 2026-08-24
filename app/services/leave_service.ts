// app/services/leave_service.ts
import LeaveType from '#models/leave_type'
import LeaveBalance from '#models/leave_balance'
import LeaveRequest from '#models/leave_request'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class LeaveService {

  async initializeLeaveBalances(employeeId: number, year: number = DateTime.now().year) {
    const leaveTypes = await LeaveType.query().where('is_active', true)
    
    for (const type of leaveTypes) {
      await LeaveBalance.create({
        employeeId,
        leaveTypeId: type.id,
        year,
        totalDays: type.defaultDays,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: type.defaultDays
      })
    }
  }

calculateDays(fromDate: DateTime, toDate: DateTime, isHalfDay: boolean = false): number {
  if (isHalfDay) {
    return 0.5  
  }
  return Math.ceil(toDate.diff(fromDate, 'days').days) + 1
}
  async getEmployeeLeaveDashboard(employeeId: number, year?: number) {
    const currentYear = year || DateTime.now().year
    
    const leaveTypes = await LeaveType.query()
      .where('is_active', true)
      .orderBy('name', 'asc')

    const balances = await LeaveBalance.query()
      .where('employee_id', employeeId)
      .where('year', currentYear)
      .preload('leaveType')

    const balanceMap: Record<number, any> = {}
    for (const balance of balances) {
      balanceMap[balance.leaveTypeId] = balance
    }

    const requests = await LeaveRequest.query()
      .where('employee_id', employeeId)
      .whereRaw('YEAR(from_date) = ?', [currentYear])
      .orWhereRaw('YEAR(to_date) = ?', [currentYear])
      .preload('leaveType')
      .orderBy('created_at', 'desc')

    let totalTaken = 0
    let totalPending = 0
    let totalApproved = 0
    let totalRejected = 0

    for (const request of requests) {
      if (request.status === 'Approved') totalApproved += request.totalDays
      else if (request.status === 'Pending') totalPending += request.totalDays
      else if (request.status === 'Rejected') totalRejected += request.totalDays
      totalTaken += request.totalDays
    }

    return {
      year: currentYear,
      leaveTypes: leaveTypes.map(type => {
        const balance = balanceMap[type.id]
        return {
          id: type.id,
          name: type.name,
          code: type.code,
          total: balance?.totalDays || type.defaultDays,
          used: balance?.usedDays || 0,
          pending: balance?.pendingDays || 0,
          remaining: balance?.remainingDays || type.defaultDays,
          available: (balance?.remainingDays || type.defaultDays) > 0
        }
      }),
      summary: {
        totalTaken,
        totalPending,
        totalApproved,
        totalRejected,
        totalAvailable: leaveTypes.reduce((sum, type) => {
          const balance = balanceMap[type.id]
          return sum + (balance?.remainingDays || type.defaultDays)
        }, 0)
      },
      requests: requests.map(req => ({
        id: req.id,
        fromDate: req.fromDate.toISODate(),
        toDate: req.toDate.toISODate(),
        totalDays: req.totalDays,
        isHalfDay: req.isHalfDay || false,
        halfDayType: req.halfDayType || null,
        reason: req.reason,
        status: req.status,
        leaveType: {
          id: req.leaveType.id,
          name: req.leaveType.name
        },
        adminRemark: req.adminRemark,
        createdAt: req.createdAt.toISO()
      }))
    }
  }

  async createLeaveRequest(employeeId: number, data: {
    leaveTypeId: number
    fromDate: string
    toDate: string
    reason?: string
    attachment?: string
    isHalfDay?: boolean  
  halfDayType?: 'first_half' | 'second_half'
  }) {
     const isHalfDay = data.isHalfDay || false
    const fromDate = DateTime.fromISO(data.fromDate)
    const toDate = DateTime.fromISO(data.toDate)
    
    if (fromDate > toDate) {
      throw new Error('From date must be before to date')
    }

    const today = DateTime.now().startOf('day')
    if (fromDate < today) {
      throw new Error('Cannot apply for leave in the past')
    }
    if (data.isHalfDay) {
      if (!fromDate.hasSame(toDate, 'day')) {
        throw new Error('Half day leave must be for a single day')
      }
      if (!data.halfDayType) {
        throw new Error('Please specify half day type (first_half or second_half)')
      }
    }

    const existing = await LeaveRequest.query()
      .where('employee_id', employeeId)
      .where('status', 'Pending')
      .orWhere('status', 'Approved')
      .where((query) => {
        query.whereBetween('from_date', [fromDate.toISODate(), toDate.toISODate()])
          .orWhereBetween('to_date', [fromDate.toISODate(), toDate.toISODate()])
          .orWhere((q) => {
            q.where('from_date', '<=', fromDate.toISODate())
              .where('to_date', '>=', toDate.toISODate())
          })
      })
      .first()

    if (existing) {
      throw new Error('You already have a leave request for these dates')
    }

    const totalDays = data.isHalfDay ? 0.5 : this.calculateDays(fromDate, toDate, false)
    

    const balance = await LeaveBalance.query()
      .where('employee_id', employeeId)
      .where('leave_type_id', data.leaveTypeId)
      .where('year', fromDate.year)
      .first()

    if (!balance) {
      throw new Error('Leave balance not found')
    }

    if (balance.remainingDays < totalDays) {
      throw new Error(`Insufficient leave balance. Available: ${balance.remainingDays}, Required: ${totalDays}`)
    }

    const request = await LeaveRequest.create({
      employeeId,
      leaveTypeId: data.leaveTypeId,
      fromDate,
      toDate,
      totalDays,
      isHalfDay: data.isHalfDay || false,
      halfDayType: data.halfDayType || null,
      reason: data.reason || null,
      attachment: data.attachment || null,
      status: 'Pending'
    })

    balance.pendingDays = Number(balance.pendingDays) + totalDays
    await balance.save()

    return request
  }

  async cancelLeaveRequest(requestId: number, employeeId: number) {
    const request = await LeaveRequest.query()
      .where('id', requestId)
      .where('employee_id', employeeId)
      .where('status', 'Pending')
      .first()

    if (!request) {
      throw new Error('Leave request not found or cannot be cancelled')
    }

    request.status = 'Cancelled'
    await request.save()

    const balance = await LeaveBalance.query()
      .where('employee_id', employeeId)
      .where('leave_type_id', request.leaveTypeId)
      .where('year', request.fromDate.year)
      .first()

    if (balance) {
      balance.pendingDays = Math.max(0, Number(balance.pendingDays) - request.totalDays)
      await balance.save()
    }

    return request
  }

  async getAdminLeaveDashboard(filters?: {
    employeeId?: number
    status?: string
    fromDate?: string
    toDate?: string
    year?: number
    page?: number
    limit?: number
  }) {
    const year = filters?.year || DateTime.now().year
    const page = filters?.page || 1
    const limit = filters?.limit || 20

    const employees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'email')

    const leaveTypes = await LeaveType.query()
      .where('is_active', true)

    const query = LeaveRequest.query()
      .preload('employee', (query) => {
        query.select('id', 'name', 'email')
      })
      .preload('leaveType')
      .preload('approver', (query) => {
        query.select('id', 'name', 'email')
      })
      .orderBy('created_at', 'desc')

    if (filters?.employeeId) {
      query.where('employee_id', filters.employeeId)
    }
    if (filters?.status) {
      query.where('status', filters.status)
    }
    if (filters?.fromDate) {
      query.where('from_date', '>=', filters.fromDate)
    }
    if (filters?.toDate) {
      query.where('to_date', '<=', filters.toDate)
    }

    const requests = await query.paginate(page, limit)

    let totalRequests = 0
    let pendingRequests = 0
    let approvedRequests = 0
    let rejectedRequests = 0
    let totalDays = 0

    const allRequests = await LeaveRequest.query()
      .whereRaw('YEAR(created_at) = ?', [year])

    for (const req of allRequests) {
      totalRequests++
      totalDays += req.totalDays
      if (req.status === 'Pending') pendingRequests++
      else if (req.status === 'Approved') approvedRequests++
      else if (req.status === 'Rejected') rejectedRequests++
    }

    const employeeSummary = []
    for (const employee of employees) {
      const employeeRequests = await LeaveRequest.query()
        .where('employee_id', employee.id)
        .where('status', 'Approved')
        .whereRaw('YEAR(from_date) = ?', [year])

      const totalTaken = employeeRequests.reduce((sum, req) => sum + req.totalDays, 0)
      
      const balances = await LeaveBalance.query()
        .where('employee_id', employee.id)
        .where('year', year)
        .preload('leaveType')

      const balanceData = balances.map(b => ({
        leaveType: b.leaveType.name,
        total: b.totalDays,
        used: b.usedDays,
        remaining: b.remainingDays
      }))

      employeeSummary.push({
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email
        },
        totalTaken,
        balance: balanceData
      })
    }

    const monthlyTrend = []
    for (let month = 1; month <= 12; month++) {
      const monthRequests = await LeaveRequest.query()
        .whereRaw('MONTH(created_at) = ?', [month])
        .whereRaw('YEAR(created_at) = ?', [year])
        .where('status', 'Approved')

      const count = monthRequests.length
      const days = monthRequests.reduce((sum, req) => sum + req.totalDays, 0)

      monthlyTrend.push({
        month,
        requests: count,
        days
      })
    }

    return {
      year,
      summary: {
        totalEmployees: employees.length,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalDays
      },
      leaveTypes: leaveTypes.map(type => ({
        id: type.id,
        name: type.name,
        code: type.code,
        defaultDays: type.defaultDays
      })),
      employeeSummary,
      monthlyTrend,
      requests
    }
  }

  async handleLeaveRequest(requestId: number, status: 'Approved' | 'Rejected', adminRemark?: string, adminId?: number) {
    const request = await LeaveRequest.find(requestId)
    if (!request) {
      throw new Error('Leave request not found')
    }

    if (request.status !== 'Pending') {
      throw new Error('This request has already been processed')
    }

    const balance = await LeaveBalance.query()
      .where('employee_id', request.employeeId)
      .where('leave_type_id', request.leaveTypeId)
      .where('year', request.fromDate.year)
      .first()

    if (status === 'Approved') {
      if (balance && balance.remainingDays < request.totalDays) {
        throw new Error('Employee does not have enough leave balance')
      }

      if (balance) {
        balance.usedDays = Number(balance.usedDays) + request.totalDays
        balance.pendingDays = Math.max(0, Number(balance.pendingDays) - request.totalDays)
        balance.remainingDays = Number(balance.totalDays) - Number(balance.usedDays)
        await balance.save()
      }

      request.status = 'Approved'
    } else {
      if (balance) {
        balance.pendingDays = Math.max(0, Number(balance.pendingDays) - request.totalDays)
        await balance.save()
      }
      request.status = 'Rejected'
    }

    request.adminRemark = adminRemark || null
    request.approvedBy = adminId || null
    request.approvedAt = DateTime.now()

    await request.save()
    return request
  }

  async getLeaveTypes() {
    return await LeaveType.query()
      .where('is_active', true)
      .orderBy('name', 'asc')
  }

  async updateLeaveType(data: { id?: number; name: string; code: string; defaultDays: number; isActive?: boolean }) {
    if (data.id) {
      const type = await LeaveType.find(data.id)
      if (!type) {
        throw new Error('Leave type not found')
      }
      type.name = data.name
      type.code = data.code
      type.defaultDays = data.defaultDays
      if (data.isActive !== undefined) type.isActive = data.isActive
      await type.save()
      return type
    } else {
      const type = await LeaveType.create({
        name: data.name,
        code: data.code,
        defaultDays: data.defaultDays,
        isActive: true
      })
      return type
    }
  }

  async assignLeaveToEmployee(data: {
  employeeId: number
  leaveTypeId: number
  days: number
  year?: number
  reason?: string
}) {
  const year = data.year || DateTime.now().year

  const employee = await User.find(data.employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }
  const leaveType = await LeaveType.find(data.leaveTypeId)
  if (!leaveType) {
    throw new Error('Leave type not found')
  }
  let balance = await LeaveBalance.query()
    .where('employee_id', data.employeeId)
    .where('leave_type_id', data.leaveTypeId)
    .where('year', year)
    .first()

  if (!balance) {
    balance = await LeaveBalance.create({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      year: year,
      totalDays: data.days,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: data.days
    })
  } else {
    balance.totalDays = Number(balance.totalDays) + data.days
    balance.remainingDays = Number(balance.remainingDays) + data.days
    await balance.save()
  }

  const request = await LeaveRequest.create({
    employeeId: data.employeeId,
    leaveTypeId: data.leaveTypeId,
    fromDate: DateTime.now().toISODate(),
    toDate: DateTime.now().toISODate(),
    totalDays: data.days,
    reason: data.reason || `Leave credited by admin: ${data.days} days`,
    status: 'Approved',
    adminRemark: data.reason || 'Manual leave assignment',
    approvedBy: 1, // Admin ID
    approvedAt: DateTime.now()
  })

  return {
    balance,
    request,
    message: `${data.days} days ${leaveType.name} assigned successfully`
  }
}

async getEmployeesWithLeaveBalances(year?: number) {
  const currentYear = year || DateTime.now().year
  
  const employees = await User.query()
    .where('role', 'employee')
    .whereNull('deleted_at')
    .select('id', 'name', 'email')

  const result = []
  for (const employee of employees) {
    const balances = await LeaveBalance.query()
      .where('employee_id', employee.id)
      .where('year', currentYear)
      .preload('leaveType')

    const leaveTypes = await LeaveType.query()
      .where('is_active', true)
      .orderBy('name', 'asc')

    const balanceData = leaveTypes.map(type => {
      const balance = balances.find(b => b.leaveTypeId === type.id)
      return {
        leaveTypeId: type.id,
        leaveTypeName: type.name,
        leaveTypeCode: type.code,
        total: balance?.totalDays || 0,
        used: balance?.usedDays || 0,
        pending: balance?.pendingDays || 0,
        remaining: balance?.remainingDays || 0
      }
    })

    result.push({
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email
      },
      balances: balanceData
    })
  }

  return result
}

async createOrUpdateLeaveBalance(data: {
  employeeId: number
  leaveTypeId: number
  year: number
  totalDays: number
  usedDays?: number
  pendingDays?: number
  remainingDays?: number
  reason?: string
}) {

  const employee = await User.find(data.employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  const leaveType = await LeaveType.find(data.leaveTypeId)
  if (!leaveType) {
    throw new Error('Leave type not found')
  }

  const usedDays = data.usedDays || 0
  const pendingDays = data.pendingDays || 0
  const remainingDays = data.totalDays - usedDays - pendingDays

  let balance = await LeaveBalance.query()
    .where('employee_id', data.employeeId)
    .where('leave_type_id', data.leaveTypeId)
    .where('year', data.year)
    .first()

  if (balance) {

    balance.totalDays = data.totalDays
    balance.usedDays = usedDays
    balance.pendingDays = pendingDays
    balance.remainingDays = remainingDays
    await balance.save()
  } else {
    balance = await LeaveBalance.create({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      year: data.year,
      totalDays: data.totalDays,
      usedDays: usedDays,
      pendingDays: pendingDays,
      remainingDays: remainingDays
    })
  }

  await LeaveRequest.create({
    employeeId: data.employeeId,
    leaveTypeId: data.leaveTypeId,
    fromDate: DateTime.now().toISODate(),
    toDate: DateTime.now().toISODate(),
    totalDays: data.totalDays,
    reason: data.reason || `Leave balance updated by admin`,
    status: 'Approved',
    adminRemark: `Total: ${data.totalDays}, Used: ${usedDays}, Remaining: ${remainingDays}`,
    approvedBy: 1,
    approvedAt: DateTime.now()
  })

  return {
    balance,
    message: `Leave balance updated successfully for ${employee.name}`
  }
}


async getEmployeeLeaveBalance(employeeId: number, year?: number) {
  const currentYear = year || DateTime.now().year
  
  const employee = await User.find(employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  const balances = await LeaveBalance.query()
    .where('employee_id', employeeId)
    .where('year', currentYear)
    .preload('leaveType')

  const leaveTypes = await LeaveType.query()
    .where('is_active', true)
    .orderBy('name', 'asc')

  const balanceData = leaveTypes.map(type => {
    const balance = balances.find(b => b.leaveTypeId === type.id)
    return {
      leaveTypeId: type.id,
      leaveTypeName: type.name,
      leaveTypeCode: type.code,
      total: balance?.totalDays || 0,
      used: balance?.usedDays || 0,
      pending: balance?.pendingDays || 0,
      remaining: balance?.remainingDays || 0,
      exists: !!balance
    }
  })

  return {
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email
    },
    year: currentYear,
    balances: balanceData
  }
}

async deleteLeaveBalance(balanceId: number) {
  const balance = await LeaveBalance.find(balanceId)
  if (!balance) {
    throw new Error('Leave balance not found')
  }

  await balance.delete()
  return { message: 'Leave balance deleted successfully' }
}


async resetEmployeeLeaveBalances(data: {
  employeeId: number
  year: number
  reason?: string
}) {
  const employee = await User.find(data.employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }
  await LeaveBalance.query()
    .where('employee_id', data.employeeId)
    .where('year', data.year)
    .delete()

  const leaveTypes = await LeaveType.query().where('is_active', true)
  
  for (const type of leaveTypes) {
    await LeaveBalance.create({
      employeeId: data.employeeId,
      leaveTypeId: type.id,
      year: data.year,
      totalDays: type.defaultDays,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: type.defaultDays
    })
  }

  return {
    message: `Leave balances reset successfully for ${employee.name}`,
    employee: {
      id: employee.id,
      name: employee.name
    }
  }
}
}