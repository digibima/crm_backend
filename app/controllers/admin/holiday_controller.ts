// app/controllers/admin/holiday_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import HolidayService from '#services/holiday_service'
import { createHolidayValidator, updateHolidayValidator } from '#validators/holiday_validator'
import { DateTime } from 'luxon'

export default class AdminHolidayController {
  private holidayService = new HolidayService()

  /**
   * Get all holidays (with year filter)
   * GET /admin/holidays
   */
  async index({ request, response }: HttpContext) {
    try {
      const year = request.input('year') ? Number(request.input('year')) : undefined
      const holidays = await this.holidayService.getAllHolidays(year)

      return response.ok({
        status: true,
        data: holidays
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Get holiday by ID
   * GET /admin/holidays/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      // ✅ Properly convert ID to number and validate
      const id = Number(params.id)
      
      if (isNaN(id) || id <= 0) {
        return response.badRequest({
          status: false,
          message: 'Invalid holiday ID'
        })
      }

      const holiday = await this.holidayService.getHolidayById(id)

      return response.ok({
        status: true,
        data: holiday
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Create holiday
   * POST /admin/holidays
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createHolidayValidator)
      
      const holiday = await this.holidayService.createHoliday({
        ...payload,
        createdBy: auth.user!.id
      })

      return response.created({
        status: true,
        message: 'Holiday created successfully',
        data: holiday
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Update holiday
   * PUT /admin/holidays/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      // ✅ Properly convert ID to number and validate
      const id = Number(params.id)
      
      if (isNaN(id) || id <= 0) {
        return response.badRequest({
          status: false,
          message: 'Invalid holiday ID'
        })
      }

      const payload = await request.validateUsing(updateHolidayValidator)
      const holiday = await this.holidayService.updateHoliday(id, payload)

      return response.ok({
        status: true,
        message: 'Holiday updated successfully',
        data: holiday
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Delete holiday
   * DELETE /admin/holidays/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      // ✅ Properly convert ID to number and validate
      const id = Number(params.id)
      
      if (isNaN(id) || id <= 0) {
        return response.badRequest({
          status: false,
          message: 'Invalid holiday ID'
        })
      }

      const result = await this.holidayService.deleteHoliday(id)

      return response.ok({
        status: true,
        ...result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Bulk create holidays
   * POST /admin/holidays/bulk
   */
  async bulkStore({ request, response, auth }: HttpContext) {
    try {
      const { holidays } = request.only(['holidays'])

      if (!holidays || !Array.isArray(holidays) || holidays.length === 0) {
        return response.badRequest({
          status: false,
          message: 'holidays array is required'
        })
      }

      const result = await this.holidayService.bulkCreateHolidays(holidays, auth.user!.id)

      return response.created({
        status: true,
        message: `${result.success} holidays created, ${result.failed} failed`,
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
   * Get calendar data (monthly view)
   * GET /admin/holidays/calendar
   */
  async calendar({ request, response }: HttpContext) {
    try {
      const month = request.input('month') ? Number(request.input('month')) : undefined
      const year = request.input('year') ? Number(request.input('year')) : undefined

      console.log('📊 Calendar Request:', { month, year })

      const data = await this.holidayService.getCalendarData(month, year)

      return response.ok({
        status: true,
        data
      })
    } catch (error: any) {
      console.error('❌ Calendar Error:', error)
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Check if date is holiday
   * GET /admin/holidays/check?date=2026-08-15
   */
  async check({ request, response }: HttpContext) {
    try {
      const date = request.input('date')

      if (!date) {
        return response.badRequest({
          status: false,
          message: 'date parameter is required'
        })
      }

      const result = await this.holidayService.isHoliday(date)

      return response.ok({
        status: true,
        data: result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
}