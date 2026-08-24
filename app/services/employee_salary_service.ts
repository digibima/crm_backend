// app/services/employee_salary_service.ts
import SalaryPayroll from '#models/salary_payroll'
import SalaryStructure from '#models/salary_structure'
import TaskManagement from '#models/task_management'
import Attendance from '#models/attendance'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class EmployeeSalaryService {

  /**
   * Helper: Kisi bhi month ka exact live converted premium & incentive calculate karna
   */
  private async calculateMonthlyPerformance(
    employeeId: number,
    structure: SalaryStructure,
    month: number,
    year: number
  ) {
    // 1. Us specific month ki converted / completed leads
    const completedTasks = await TaskManagement.query()
      .where((query) => {
        query.where('assign_to', employeeId).orWhere('user_id', employeeId)
      })
      .whereNull('deleted_at')
      .where((query) => {
        query
          .whereRaw('LOWER(status) = ?', ['completed'])
          .orWhereRaw('LOWER(responded_option) = ?', ['converted'])
      })
      .where((query) => {
        query
          .whereRaw('(MONTH(updated_at) = ? AND YEAR(updated_at) = ?)', [month, year])
          .orWhereRaw('(MONTH(created_at) = ? AND YEAR(created_at) = ?)', [month, year])
      })

    // 2. Premium sum
    let achievedPremium = 0
    for (const task of completedTasks) {
      const raw = task as any
      const amount =
        Number(raw.flowAmount) ||
        Number(raw.flow_amount) ||
        Number(raw.amount) ||
        0

      achievedPremium += amount
    }

    const target = Number(structure.monthlyTarget) || 0
    const excessPremium = Math.max(0, achievedPremium - target)

    // 3. Incentive (% on excess)
    const incentivePercent = Number(
      (structure as any).incentivePercentage ||
      (structure as any).incentive_percentage ||
      (structure as any).incentiveRate ||
      10
    )
    const incentive = excessPremium > 0 ? (excessPremium * incentivePercent) / 100 : 0

    // 4. Late attendance calculation
    const attendances = await Attendance.query()
      .where('employee_id', employeeId)
      .whereRaw('MONTH(attendance_date) = ?', [month])
      .whereRaw('YEAR(attendance_date) = ?', [year])

    let lateCount = 0
    for (const att of attendances) {
      if (att.status === 'Late') {
        lateCount++
      }
    }

    const lateDeductionPerLate = Number(
      (structure as any).lateDeductionAmount ||
      (structure as any).late_deduction_amount ||
      0
    )
    const lateDeduction = lateCount * lateDeductionPerLate

    // 5. Net Salary
    const basicSalary = Number(structure.basicSalary) || 0
    const netSalary = Math.max(0, basicSalary + incentive - lateDeduction)

    return {
      month,
      year,
      monthName: DateTime.fromObject({ month, year }).toFormat('MMMM yyyy'),
      basicSalary,
      target,
      achievedPremium,
      excessPremium,
      incentive,
      lateCount,
      lateDeduction,
      bonus: 0,
      netSalary
    }
  }

  /**
   * Complete Employee Salary Dashboard with Month-by-Month History
   * GET /api/employee/salary/dashboard
   */
  async getEmployeeSalaryDashboard(employeeId: number) {
    const now = DateTime.now()
    const currentMonth = now.month
    const currentYear = now.year

    // 1. Active Salary Structure
    const structure = await SalaryStructure.query()
      .where('employee_id', employeeId)
      .where('status', 'active')
      .first()

    if (!structure) {
      return {
        hasStructure: false,
        message: 'Salary structure not found for this employee'
      }
    }

    // 2. Current Month Performance
    const currentMonthData = await this.calculateMonthlyPerformance(
      employeeId,
      structure,
      currentMonth,
      currentYear
    )

    // Check agar admin ne is month ka status Paid kiya ho
    const currentPayroll = await SalaryPayroll.query()
      .where('employee_id', employeeId)
      .where('month', currentMonth)
      .where('year', currentYear)
      .first()

    // 3. Month-wise History (Pichle 6 Months ka Alag-Alag Data)
    const monthlyHistory = []
    let yearlyTotal = 0
    let monthsPaid = 0

    for (let i = 0; i < 6; i++) {
      const date = now.minus({ months: i })
      const m = date.month
      const y = date.year

      // Check DB generated payroll first
      const payroll = await SalaryPayroll.query()
        .where('employee_id', employeeId)
        .where('month', m)
        .where('year', y)
        .first()

      if (payroll && payroll.status === 'Paid') {
        // Locked paid payroll
        monthlyHistory.push({
          month: date.toFormat('MMM yyyy'),
          monthNumber: m,
          year: y,
          basicSalary: Number(payroll.basicSalary),
          target: Number(payroll.target),
          achievedPremium: Number(payroll.achievedPremium),
          excessPremium: Number(payroll.excessPremium),
          incentive: Number(payroll.incentive),
          lateDeduction: Number(payroll.lateDeduction),
          bonus: Number(payroll.bonus),
          netSalary: Number(payroll.netSalary),
          status: 'Paid'
        })
        yearlyTotal += Number(payroll.netSalary) || 0
        monthsPaid++
      } else {
        // Live calculated performance for that month
        const monthPerf = await this.calculateMonthlyPerformance(employeeId, structure, m, y)
        monthlyHistory.push({
          month: date.toFormat('MMM yyyy'),
          monthNumber: m,
          year: y,
          ...monthPerf,
          status: payroll?.status || (i === 0 ? 'Live / In Progress' : 'Pending')
        })
        yearlyTotal += monthPerf.netSalary
      }
    }

    return {
      hasStructure: true,
      summary: {
        basicSalary: Number(structure.basicSalary),
        monthlyTarget: Number(structure.monthlyTarget),
        currentMonth: {
          ...currentMonthData,
          status: currentPayroll?.status || 'Live / In Progress'
        }
      },
      monthlyHistory, // Har month ka alag breakdown yahan milega
      yearlyTotal,
      monthsPaid,
      currentMonth: now.toFormat('MMMM yyyy')
    }
  }

  /**
   * Specific Month ki Salary Fetch Karna
   * GET /api/employee/salary/month?month=8&year=2026
   */
  async getSalaryByMonth(employeeId: number, month: number, year: number) {
    const structure = await SalaryStructure.query()
      .where('employee_id', employeeId)
      .where('status', 'active')
      .first()

    if (!structure) {
      throw new Error('Salary structure not found for this employee')
    }

    // Check if payroll row is marked Paid
    const payroll = await SalaryPayroll.query()
      .where('employee_id', employeeId)
      .where('month', month)
      .where('year', year)
      .first()

    if (payroll && payroll.status === 'Paid') {
      return {
        employeeId,
        month,
        year,
        basicSalary: Number(payroll.basicSalary),
        target: Number(payroll.target),
        achievedPremium: Number(payroll.achievedPremium),
        excessPremium: Number(payroll.excessPremium),
        incentive: Number(payroll.incentive),
        lateCount: Number(payroll.lateCount),
        lateDeduction: Number(payroll.lateDeduction),
        bonus: Number(payroll.bonus),
        netSalary: Number(payroll.netSalary),
        status: 'Paid'
      }
    }

    const liveData = await this.calculateMonthlyPerformance(employeeId, structure, month, year)

    return {
      employeeId,
      ...liveData,
      status: payroll?.status || 'Live / In Progress'
    }
  }

  /**
   * Salary Breakdown by Month
   * GET /api/employee/salary/breakdown?month=8&year=2026
   */
  async getSalaryBreakdown(employeeId: number, month: number, year: number) {
    return await this.getSalaryByMonth(employeeId, month, year)
  }
}