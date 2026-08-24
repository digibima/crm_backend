// app/controllers/admin/salary_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import SalaryService from '#services/salary_service'
import SalaryStructure from '#models/salary_structure' 
import IncentiveRule from '#models/incentive_rule' // ✅ Add this import
import User from '#models/user'
import { DateTime } from 'luxon'

export default class SalaryController {
  private salaryService = new SalaryService()

  /**
   * ✅ API 1: Salary Dashboard + List (Sab kuch ek saath)
   * GET /admin/salary/dashboard
   */
  async dashboard({ request, response }: HttpContext) {
    try {
      const filters = {
        month: Number(request.input('month', DateTime.now().month)),
        year: Number(request.input('year', DateTime.now().year)),
        employeeId: request.input('employeeId') ? Number(request.input('employeeId')) : undefined,
        status: request.input('status'),
        page: Number(request.input('page', 1)),
        limit: Number(request.input('limit', 10))
      }

      const data = await this.salaryService.getSalaryDashboardAndList(filters)

      return response.ok({
        status: true,
        message: 'Salary data fetched successfully',
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * ✅ API 2: Generate Salary (Auto calculate)
   * POST /admin/salary/generate
   */
  async generate({ request, response }: HttpContext) {
    try {
      const { month, year } = request.only(['month', 'year'])

      if (!month || !year) {
        return response.badRequest({
          status: false,
          message: 'month and year are required'
        })
      }

      const result = await this.salaryService.generateSalary(
        Number(month),
        Number(year)
      )

      return response.ok({
        status: true,
        message: 'Salary generated successfully',
        data: result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Get Employee Salary Details
   * GET /admin/salary/:employeeId
   */
  async show({ params, request, response }: HttpContext) {
    try {
      const month = Number(request.input('month', DateTime.now().month))
      const year = Number(request.input('year', DateTime.now().year))

      const data = await this.salaryService.getEmployeeSalaryDetails(
        Number(params.employeeId),
        month,
        year
      )

      return response.ok({
        status: true,
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Update Salary Status
   * PUT /admin/salary/:id/status
   */
  async updateStatus({ params, request, response }: HttpContext) {
    try {
      const { status } = request.only(['status'])

      if (!['Generated', 'Paid'].includes(status)) {
        return response.badRequest({
          status: false,
          message: 'Status must be Generated or Paid'
        })
      }

      const result = await this.salaryService.updateSalaryStatus(
        Number(params.id),
        status
      )

      return response.ok({
        status: true,
        message: `Salary marked as ${status}`,
        data: result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Seed Initial Rules (One time)
   * POST /admin/salary/seed
   */
  async seed({ response }: HttpContext) {
    try {
      await this.salaryService.seedInitialData()
      return response.ok({
        status: true,
        message: 'Salary rules seeded successfully'
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
  async createStructure({ request, response }: HttpContext) {
  try {
    const { employeeId, basicSalary, monthlyTarget, effectiveFrom } = request.only([
      'employeeId',
      'basicSalary',
      'monthlyTarget',
      'effectiveFrom'
    ])

    if (!employeeId || !basicSalary || !monthlyTarget) {
      return response.badRequest({
        status: false,
        message: 'employeeId, basicSalary and monthlyTarget are required'
      })
    }

    // Check if structure already exists
    const existing = await SalaryStructure.query()
      .where('employee_id', employeeId)
      .where('status', 'active')
      .first()

    if (existing) {
      // Deactivate old one
      existing.status = 'inactive'
      await existing.save()
    }

    const structure = await SalaryStructure.create({
      employeeId,
      basicSalary,
      monthlyTarget,
      effectiveFrom: effectiveFrom || DateTime.now().toISODate(),
      status: 'active'
    })

    return response.created({
      status: true,
      message: 'Salary structure created successfully',
      data: structure
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
// app/controllers/admin/salary_controller.ts

/**
 * Get Incentive Rules for an Employee
 * GET /admin/salary/incentive-rules/:employeeId
 */
async getIncentiveRules({ params, response }: HttpContext) {
  try {
    const employeeId = Number(params.employeeId)
    
    // Get employee's custom rules
    const customRules = await IncentiveRule.query()
      .where('employee_id', employeeId)
      .where('is_active', true)
      .orderBy('excess_from', 'asc')

    // Get default rules
    const defaultRules = await IncentiveRule.query()
      .whereNull('employee_id')
      .where('is_active', true)
      .orderBy('excess_from', 'asc')

    return response.ok({
      status: true,
      data: {
        custom: customRules,
        default: defaultRules
      }
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}

/**
 * Create/Update Custom Incentive Rule for Employee
 * POST /admin/salary/incentive-rules
 */
// app/controllers/admin/salary_controller.ts

async upsertIncentiveRule({ request, response }: HttpContext) {
  try {
    const { employeeId, ruleName, excessFrom, excessTo, incentivePercent, isActive } = request.only([
      'employeeId',
      'ruleName',
      'excessFrom',
      'excessTo',
      'incentivePercent',
      'isActive'
    ])

    console.log('📊 Values:', { employeeId, ruleName, excessFrom, excessTo, incentivePercent, isActive })

    // ✅ Check each value individually
    if (!employeeId) {
      return response.badRequest({
        status: false,
        message: 'employeeId is required'
      })
    }

    if (excessFrom === undefined || excessFrom === null) {
      return response.badRequest({
        status: false,
        message: 'excessFrom is required'
      })
    }

    if (excessTo === undefined || excessTo === null) {
      return response.badRequest({
        status: false,
        message: 'excessTo is required'
      })
    }

    if (incentivePercent === undefined || incentivePercent === null) {
      return response.badRequest({
        status: false,
        message: 'incentivePercent is required'
      })
    }

    // Check if employee exists
    const employee = await User.find(employeeId)
    if (!employee) {
      return response.badRequest({
        status: false,
        message: 'Employee not found'
      })
    }

    // Check if rule already exists
    let rule = await IncentiveRule.query()
      .where('employee_id', employeeId)
      .where('excess_from', excessFrom)
      .where('excess_to', excessTo)
      .first()

    if (rule) {
      // Update existing rule
      rule.ruleName = ruleName || `Custom Rule for ${employee.name}`
      rule.incentivePercent = incentivePercent
      if (isActive !== undefined) rule.isActive = isActive
      await rule.save()
    } else {
      // Create new rule
      rule = await IncentiveRule.create({
        employeeId,
        ruleName: ruleName || `Custom Rule for ${employee.name}`,
        excessFrom,
        excessTo,
        incentivePercent,
        isActive: true
      })
    }

    return response.ok({
      status: true,
      message: 'Incentive rule saved successfully',
      data: rule
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}

/**
 * Delete Custom Incentive Rule
 * DELETE /admin/salary/incentive-rules/:id
 */
async deleteIncentiveRule({ params, response }: HttpContext) {
  try {
    const rule = await IncentiveRule.find(params.id)
    if (!rule) {
      return response.badRequest({
        status: false,
        message: 'Incentive rule not found'
      })
    }

    await rule.delete()

    return response.ok({
      status: true,
      message: 'Incentive rule deleted successfully'
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
// app/controllers/admin/salary_controller.ts

/**
 * ✅ Bulk Create Multiple Incentive Rules for an Employee
 * POST /admin/salary/incentive-rules/bulk
 */
async bulkCreateIncentiveRules({ request, response }: HttpContext) {
  try {
    const payload = request.all()
    console.log('📊 Full Payload:', payload)

    // ✅ Get employeeId and rules with proper validation
    const employeeId = payload.employeeId ? Number(payload.employeeId) : null
    const rules = payload.rules

    // ✅ Validate employeeId
    if (!employeeId || isNaN(employeeId)) {
      return response.badRequest({
        status: false,
        message: 'Valid employeeId is required'
      })
    }

    // ✅ Validate rules
    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return response.badRequest({
        status: false,
        message: 'rules array is required with at least one rule'
      })
    }

    // ✅ Check if employee exists
    const employee = await User.find(employeeId)
    if (!employee) {
      return response.badRequest({
        status: false,
        message: `Employee with ID ${employeeId} not found`
      })
    }

    console.log(`✅ Employee found: ${employee.name}`)

    const createdRules = []

    for (const rule of rules) {
      const { excessFrom, excessTo, incentivePercent, ruleName } = rule

      // ✅ Validate each rule
      if (excessFrom === undefined || excessFrom === null) {
        return response.badRequest({
          status: false,
          message: 'excessFrom is required for each rule'
        })
      }

      if (excessTo === undefined || excessTo === null) {
        return response.badRequest({
          status: false,
          message: 'excessTo is required for each rule'
        })
      }

      if (incentivePercent === undefined || incentivePercent === null) {
        return response.badRequest({
          status: false,
          message: 'incentivePercent is required for each rule'
        })
      }

      // ✅ Check if rule already exists
      let existingRule = await IncentiveRule.query()
        .where('employee_id', employeeId)
        .where('excess_from', excessFrom)
        .where('excess_to', excessTo)
        .first()

      if (existingRule) {
        // Update existing rule
        existingRule.ruleName = ruleName || `Tier ${createdRules.length + 1}`
        existingRule.incentivePercent = incentivePercent
        existingRule.isActive = true
        await existingRule.save()
        createdRules.push(existingRule)
      } else {
        // Create new rule
        const newRule = await IncentiveRule.create({
          employeeId,
          ruleName: ruleName || `Tier ${createdRules.length + 1}`,
          excessFrom,
          excessTo,
          incentivePercent,
          isActive: true
        })
        createdRules.push(newRule)
      }
    }

    return response.ok({
      status: true,
      message: `${createdRules.length} incentive rules created/updated successfully for ${employee.name}`,
      data: createdRules
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
}