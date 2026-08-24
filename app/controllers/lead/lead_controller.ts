// app/controllers/lead/lead_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import TaskManagement from '#models/task_management'
import User from '#models/user'
import { createLeadValidator } from '#validators/lead_validator'
import NotificationService from '#services/notification_service'
import InsuranceCategory from '#models/insurance_category'
import { DateTime } from 'luxon'
import Redis from 'ioredis'

export default class LeadController {
  private notificationService = new NotificationService()

  private redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  })

  public async getTelesalesEmployees({ response }: HttpContext) {
    try {
      const employees = await User.query()
        .select('id', 'name')
        .where('role', 'employee')
        .where('designation', 'telesales')
        .where('is_active', 1)
        .whereNull('deleted_at')

      return response.ok({
        success: true,
        message: 'Telesales employees fetched successfully',
        data: employees,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Something went wrong',
        error: error.message,
      })
    }
  }

  public async createLead({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createLeadValidator)

      const employee = await User.query()
        .where('id', payload.user_id)
        .where('role', 'employee')
        .where('designation', 'telesales')
        .where('is_active', 1)
        .whereNull('deleted_at')
        .first()

      if (!employee) {
        return response.badRequest({
          success: false,
          message: 'Invalid telesales employee.',
        })
      }
      const motorCategory = await InsuranceCategory.query()
        .whereRaw('LOWER(name) = ?', ['motor'])
        .first()

      
      const lead = await TaskManagement.create({
        taskAction: 'lead',
        clientName: payload.client_name,
        userId: payload.user_id,
        registrationNumber: payload.registration_number || null,
        clientContactNumber: payload.client_contact_number,
        leadDate: DateTime.now().toISODate(),
        insuranceCategoryId: motorCategory?.id ?? null,
        registrationDate: payload.registration_date || null,
      })

    
      let onlineEmployees: string[] = []

      try {
        onlineEmployees = await this.redis.smembers('avl_staff')
      } catch (redisError) {
        console.error(
          'Redis avl_staff check failed:',
          redisError
        )
      }

      if (onlineEmployees.length > 0) {
        try {
          await this.notificationService.sendNotification(
            payload.user_id,
            'Lead generated',
            `New Lead generated from ${payload.client_name}`,
            lead.id
          )
        } catch (notificationError) {
         
          console.error(
            'Lead notification failed:',
            notificationError
          )
        }

        return response.created({
          success: true,
          message: 'Lead created successfully.',
          data: lead,
        })
      }

      const allEmployees = await User.query()
        .select('id', 'name')
        .where('role', 'employee')
        .where('designation', 'telesales')
        .where('is_active', 1)
        .whereNull('deleted_at')

      if (allEmployees.length > 0) {
        const employeeIds = allEmployees.map((emp) =>
          String(emp.id)
        )

        await this.redis.sadd(
          'offline_staff',
          ...employeeIds
        )
      }

      const pendingLeadKey =
        `offline_leads:${payload.user_id}`

      await this.redis.rpush(
        pendingLeadKey,
        String(lead.id)
      )

      return response.created({
        success: true,
        message:
          'Lead created successfully. All employees are offline.',
        data: lead,
      })
    } catch (error) {
      console.error('Create Lead Error:', error)

      return response.internalServerError({
        success: false,
        message: error.message,
      })
    }
  }
}