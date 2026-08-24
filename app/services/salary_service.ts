// app/services/salary_service.ts
import SalaryStructure from '#models/salary_structure'
import IncentiveRule from '#models/incentive_rule'
import LateDeductionRule from '#models/late_deduction_rule'
import SalaryPayroll from '#models/salary_payroll'
import User from '#models/user'
import Attendance from '#models/attendance'
import TaskManagement from '#models/task_management'
import { DateTime } from 'luxon'

export default class SalaryService {

  // ========== GENERATE SALARY ==========
  async generateSalary(month: number, year: number) {
    const m = Number(month)
    const y = Number(year)

    if (isNaN(m) || isNaN(y)) {
      throw new Error('Invalid month or year')
    }

    const employees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'designation')

    const results = []
    let totalGenerated = 0

    for (const employee of employees) {
      const employeeId = Number(employee.id)
      if (isNaN(employeeId) || employeeId <= 0) {
        continue
      }

      const structure = await SalaryStructure.query()
        .where('employee_id', employeeId)
        .where('status', 'active')
        .first()

      if (!structure) {
        results.push({
          employee_id: employeeId,
          employee_name: employee.name,
          status: 'Skipped',
          message: 'No salary structure found'
        })
        continue
      }

      const existing = await SalaryPayroll.query()
        .where('employee_id', employeeId)
        .where('month', m)
        .where('year', y)
        .first()

      if (existing && existing.status !== 'Draft') {
        results.push({
          employee_id: employeeId,
          employee_name: employee.name,
          status: 'Skipped',
          message: 'Already generated'
        })
        continue
      }

      const payroll = await this.calculateEmployeeSalary(employeeId, m, y)

      if (existing) {
        existing.basicSalary = payroll.basicSalary
        existing.target = payroll.target
        existing.achievedPremium = payroll.achievedPremium
        existing.excessPremium = payroll.excessPremium
        existing.incentive = payroll.incentive
        existing.lateCount = payroll.lateCount
        existing.lateDeduction = payroll.lateDeduction
        existing.bonus = payroll.bonus
        existing.netSalary = payroll.netSalary
        existing.status = 'Generated'
        existing.generatedAt = DateTime.now()
        await existing.save()
      } else {
        await SalaryPayroll.create({
          employeeId: employeeId,
          month: m,
          year: y,
          basicSalary: payroll.basicSalary,
          target: payroll.target,
          achievedPremium: payroll.achievedPremium,
          excessPremium: payroll.excessPremium,
          incentive: payroll.incentive,
          lateCount: payroll.lateCount,
          lateDeduction: payroll.lateDeduction,
          bonus: payroll.bonus,
          netSalary: payroll.netSalary,
          status: 'Generated',
          generatedAt: DateTime.now()
        })
      }

      totalGenerated++
      results.push({
        employee_id: employeeId,
        employee_name: employee.name,
        status: 'Generated',
        net_salary: payroll.netSalary
      })
    }

    return {
      month: m,
      year: y,
      total_employees: employees.length,
      total_generated: totalGenerated,
      results
    }
  }


async calculateEmployeeSalary(employeeId: number, month: number, year: number) {
  const empId = Number(employeeId)
  const m = Number(month)
  const y = Number(year)

  if (isNaN(empId) || isNaN(m) || isNaN(y)) {
    throw new Error('Invalid employeeId, month, or year')
  }

  const structure = await SalaryStructure.query()
    .where('employee_id', empId)
    .where('status', 'active')
    .first()

  if (!structure) {
    throw new Error(`Salary structure not found for employee ${empId}`)
  }

  const tasks = await TaskManagement.query()
    .where('assign_to', empId)
    .where('status', 'completed')
    .whereNull('deleted_at')
    .whereRaw('MONTH(created_at) = ?', [m])
    .whereRaw('YEAR(created_at) = ?', [y])

  let achievedPremium = 0
  for (const task of tasks) {
    const amount = task.flowAmount ? parseFloat(task.flowAmount) : 0
    achievedPremium += amount
  }

  const target = Number(structure.monthlyTarget)
  const excessPremium = Math.max(0, achievedPremium - target)
  
  // ✅ Pass employeeId to incentive calculation
  const incentive = await this.calculateIncentive(excessPremium, empId)

  const lateCount = await Attendance.query()
    .where('employee_id', empId)
    .where('status', 'Late')
    .whereRaw('MONTH(attendance_date) = ?', [m])
    .whereRaw('YEAR(attendance_date) = ?', [y])
    .count('* as total')

  const lateCountNumber = Number(lateCount[0].$extras.total) || 0
  const lateDeduction = await this.calculateLateDeduction(
    Number(structure.basicSalary),
    lateCountNumber
  )

  let bonus = 0
  if (excessPremium > 0 && excessPremium > Number(structure.monthlyTarget) * 0.5) {
    bonus = 500
  }

  const basicSalary = Number(structure.basicSalary)
  const netSalary = basicSalary + incentive + bonus - lateDeduction

  return {
    employeeId: empId,
    basicSalary,
    target: Number(structure.monthlyTarget),
    achievedPremium,
    excessPremium,
    incentive,
    lateCount: lateCountNumber,
    lateDeduction,
    bonus,
    netSalary
  }
}

async calculateIncentive(excessPremium: number, employeeId: number) {
  // ✅ First check if employee has custom rules
  const employeeRules = await IncentiveRule.query()
    .where('employee_id', employeeId)
    .where('is_active', true)
    .orderBy('excess_from', 'asc')
  if (employeeRules.length > 0) {
    for (const rule of employeeRules) {
      if (excessPremium >= Number(rule.excessFrom) && excessPremium <= Number(rule.excessTo)) {
        return (excessPremium * Number(rule.incentivePercent)) / 100
      }
    }

    const lastRule = employeeRules[employeeRules.length - 1]
    if (lastRule && excessPremium > Number(lastRule.excessTo)) {
      return (excessPremium * Number(lastRule.incentivePercent)) / 100
    }
    return 0
  }
  const defaultRules = await IncentiveRule.query()
    .whereNull('employee_id')
    .where('is_active', true)
    .orderBy('excess_from', 'asc')

  for (const rule of defaultRules) {
    if (excessPremium >= Number(rule.excessFrom) && excessPremium <= Number(rule.excessTo)) {
      return (excessPremium * Number(rule.incentivePercent)) / 100
    }
  }

  const lastDefaultRule = defaultRules[defaultRules.length - 1]
  if (lastDefaultRule && excessPremium > Number(lastDefaultRule.excessTo)) {
    return (excessPremium * Number(lastDefaultRule.incentivePercent)) / 100
  }

  return 0
}

  // ========== CALCULATE LATE DEDUCTION ==========
  async calculateLateDeduction(basicSalary: number, lateCount: number) {
    const rules = await LateDeductionRule.query()
      .where('is_active', true)
      .orderBy('from_count', 'asc')

    let totalDeduction = 0

    for (const rule of rules) {
      if (lateCount >= Number(rule.fromCount) && lateCount <= Number(rule.toCount)) {
        const applicableCount = lateCount - Number(rule.fromCount) + 1
        const deduction = (basicSalary * Number(rule.deductionPercent)) / 100
        totalDeduction += deduction * applicableCount
      } else if (lateCount > Number(rule.toCount)) {
        const applicableCount = Number(rule.toCount) - Number(rule.fromCount) + 1
        const deduction = (basicSalary * Number(rule.deductionPercent)) / 100
        totalDeduction += deduction * applicableCount
      }
    }

    return Math.min(totalDeduction, basicSalary * 0.1)
  }

  // ========== ✅ GET EMPLOYEE SALARY DETAILS (ADD THIS METHOD) ==========
  async getEmployeeSalaryDetails(employeeId: number, month?: number, year?: number) {
    const m = month || DateTime.now().month
    const y = year || DateTime.now().year

    const empId = Number(employeeId)
    if (isNaN(empId) || empId <= 0) {
      throw new Error('Invalid employee ID')
    }

    // ✅ First check if payroll exists
    let payroll = await SalaryPayroll.query()
      .where('employee_id', empId)
      .where('month', m)
      .where('year', y)
      .preload('employee', (query) => {
        query.select('id', 'name', 'email', 'designation')
      })
      .first()

    // ✅ If no payroll, calculate and return
    if (!payroll) {
      const calculated = await this.calculateEmployeeSalary(empId, m, y)
      return {
        employee_id: empId,
        month: m,
        year: y,
        basic_salary: calculated.basicSalary,
        target: calculated.target,
        achieved_premium: calculated.achievedPremium,
        excess_premium: calculated.excessPremium,
        incentive: calculated.incentive,
        late_count: calculated.lateCount,
        late_deduction: calculated.lateDeduction,
        bonus: calculated.bonus,
        net_salary: calculated.netSalary,
        status: 'Not Generated',
        employee: {
          id: empId,
          name: (await User.find(empId))?.name || 'Unknown'
        }
      }
    }

    return payroll
  }

  // ========== UPDATE SALARY STATUS ==========
  async updateSalaryStatus(payrollId: number, status: 'Generated' | 'Paid') {
    const payroll = await SalaryPayroll.find(payrollId)
    if (!payroll) {
      throw new Error('Salary record not found')
    }

    payroll.status = status
    if (status === 'Paid') {
      payroll.paidAt = DateTime.now()
    }
    await payroll.save()

    return payroll
  }

  // ========== GET SALARY DASHBOARD ==========
  async getSalaryDashboardAndList(filters?: {
    month?: number
    year?: number
    employeeId?: number
    status?: string
    page?: number
    limit?: number
  }) {
    const month = filters?.month || DateTime.now().month
    const year = filters?.year || DateTime.now().year
    const page = filters?.page || 1
    const limit = filters?.limit || 10

    const employees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'designation')

    let totalBasicSalary = 0
    let totalIncentive = 0
    let totalLateDeduction = 0
    let totalNetSalary = 0

    const salaryData = []

    for (const employee of employees) {
      const structure = await SalaryStructure.query()
        .where('employee_id', employee.id)
        .where('status', 'active')
        .first()

      if (!structure) {
        continue
      }

      let payroll = await SalaryPayroll.query()
        .where('employee_id', employee.id)
        .where('month', month)
        .where('year', year)
        .first()

      if (!payroll) {
        payroll = await this.calculateEmployeeSalary(employee.id, month, year)
      }

      totalBasicSalary += Number(payroll.basicSalary)
      totalIncentive += Number(payroll.incentive)
      totalLateDeduction += Number(payroll.lateDeduction)
      totalNetSalary += Number(payroll.netSalary)

      if (filters?.employeeId && employee.id !== filters.employeeId) {
        continue
      }

      if (filters?.status && payroll.status !== filters.status) {
        continue
      }

      salaryData.push({
        employee_id: employee.id,
        employee_name: employee.name,
        designation: employee.designation || '-',
        basic_salary: payroll.basicSalary,
        target: payroll.target,
        achieved_premium: payroll.achievedPremium,
        excess_premium: payroll.excessPremium,
        incentive: payroll.incentive,
        late_count: payroll.lateCount,
        late_deduction: payroll.lateDeduction,
        bonus: payroll.bonus,
        net_salary: payroll.netSalary,
        status: payroll.status,
        month: payroll.month,
        year: payroll.year
      })
    }

    const summary = {
      total_employees: employees.length,
      total_salary: totalBasicSalary,
      total_incentive: totalIncentive,
      total_late_deduction: totalLateDeduction,
      net_payroll: totalNetSalary,
      paid: salaryData.filter(s => s.status === 'Paid').length,
      pending: salaryData.filter(s => s.status !== 'Paid').length
    }

    const totalRecords = salaryData.length
    const lastPage = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = salaryData.slice(startIndex, endIndex)

    return {
      summary,
      employees: paginatedData,
      pagination: {
        page,
        per_page: limit,
        total: totalRecords,
        last_page: lastPage
      }
    }
  }

  // ========== SEED INITIAL DATA ==========
  async seedInitialData() {
    const incentiveRules = [
      { ruleName: 'Tier 1', excessFrom: 0, excessTo: 50000, incentivePercent: 1 },
      { ruleName: 'Tier 2', excessFrom: 50001, excessTo: 100000, incentivePercent: 1.5 },
      { ruleName: 'Tier 3', excessFrom: 100001, excessTo: 99999999, incentivePercent: 2 }
    ]

    for (const rule of incentiveRules) {
      await IncentiveRule.firstOrCreate(
        { ruleName: rule.ruleName },
        rule
      )
    }

    const lateRules = [
      { fromCount: 1, toCount: 3, deductionPercent: 0 },
      { fromCount: 4, toCount: 6, deductionPercent: 0.5 },
      { fromCount: 7, toCount: 9, deductionPercent: 1 },
      { fromCount: 10, toCount: 12, deductionPercent: 1.5 },
      { fromCount: 13, toCount: 15, deductionPercent: 2 }
    ]

    for (const rule of lateRules) {
      await LateDeductionRule.firstOrCreate(
        { fromCount: rule.fromCount, toCount: rule.toCount },
        rule
      )
    }
  }
}