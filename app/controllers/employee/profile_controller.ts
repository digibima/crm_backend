// app/controllers/employee/profile_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import TaskManagement from '#models/task_management'
import { DateTime } from 'luxon'

export default class EmployeeProfileController {
  
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      // ✅ DEBUG: Check what's in database
      console.log('🔍 User ID:', user.id)
      
      // ✅ Fetch employee with raw data
      const employee = await User.query()
        .where('id', user.id)
        .whereNull('deleted_at')
        .first()

      if (!employee) {
        return response.notFound({
          status: false,
          message: 'Employee not found'
        })
      }

      // ✅ DEBUG: Check profile_image directly from DB
      console.log('🔍 profile_image from DB:', employee.profileImage)
      console.log('🔍 Full employee object:', employee.$attributes)

      // Build profile image URL
      let profileImageUrl = null
      if (employee.profileImage) {
        const host = process.env.HOST || '192.168.29.182'
        const port = process.env.PORT || 3333
        profileImageUrl = `http://${host}:${port}/${employee.profileImage}`
        console.log('✅ Profile Image URL:', profileImageUrl)
      } else {
        console.log('⚠️ No profile image found in DB')
      }

      // ========== STATS ==========
      const today = DateTime.now().toISODate()
      const startOfMonth = DateTime.now().startOf('month').toISODate()

      const totalLeads = await TaskManagement.query()
        .where('assign_to', employee.id)
        .whereNull('deleted_at')
        .count('* as total')

      const todayLeads = await TaskManagement.query()
        .where('assign_to', employee.id)
        .where('lead_date', today)
        .whereNull('deleted_at')
        .count('* as total')

      const monthLeads = await TaskManagement.query()
        .where('assign_to', employee.id)
        .where('lead_date', '>=', startOfMonth)
        .whereNull('deleted_at')
        .count('* as total')

      const totalFollowups = await TaskManagement.query()
        .where('assign_to', employee.id)
        .whereIn('status', ['follow_up', 'call_again'])
        .whereNull('deleted_at')
        .count('* as total')

      const totalConverted = await TaskManagement.query()
        .where('assign_to', employee.id)
        .where('status', 'completed')
        .whereNull('deleted_at')
        .count('* as total')

      const totalPremiumResult = await TaskManagement.query()
        .where('assign_to', employee.id)
        .where('status', 'completed')
        .whereNotNull('amount')
        .whereNull('deleted_at')
        .sum('amount as total')

      const todayConverted = await TaskManagement.query()
        .where('assign_to', employee.id)
        .where('status', 'completed')
        .whereRaw('DATE(updated_at) = ?', [today])
        .whereNull('deleted_at')
        .count('* as total')

      const pendingTasks = await TaskManagement.query()
        .where('assign_to', employee.id)
        .where('status', 'pending')
        .whereNull('deleted_at')
        .count('* as total')

      const recentLeads = await TaskManagement.query()
        .where('assign_to', employee.id)
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')
        .limit(5)
        .select(
          'id',
          'client_name',
          'client_contact_number',
          'lead_date',
          'status',
          'amount',
          'created_at'
        )

      return response.ok({
        status: true,
        data: {
          profile: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            mobile: employee.mobile,
            designation: employee.designation,
            profileImage: profileImageUrl,  // ✅ Full URL
            profileImageRaw: employee.profileImage, // ✅ Raw path for debugging
            isActive: employee.isActive === 1,
            dob: employee.dob?.toFormat('dd MMM yyyy') || null,
            doj: employee.doj?.toFormat('dd MMM yyyy') || null,
            salary: employee.salary ? `₹${parseFloat(employee.salary).toLocaleString()}` : null,
            joinedAt: employee.createdAt?.toFormat('dd MMM yyyy') || null
          },
          stats: {
            totalLeads: Number(totalLeads[0]?.$extras?.total || 0),
            totalConverted: Number(totalConverted[0]?.$extras?.total || 0),
            totalFollowups: Number(totalFollowups[0]?.$extras?.total || 0),
            pendingTasks: Number(pendingTasks[0]?.$extras?.total || 0),
            totalPremium: Number(totalPremiumResult[0]?.$extras?.total || 0),
            todayLeads: Number(todayLeads[0]?.$extras?.total || 0),
            todayConverted: Number(todayConverted[0]?.$extras?.total || 0),
            monthLeads: Number(monthLeads[0]?.$extras?.total || 0),
            conversionRate: this.calculatePercentage(
              Number(totalConverted[0]?.$extras?.total || 0),
              Number(totalLeads[0]?.$extras?.total || 0)
            )
          },
          recentLeads: recentLeads.map(lead => ({
            id: lead.id,
            clientName: lead.client_name || 'N/A',
            contact: lead.client_contact_number || 'N/A',
            leadDate: lead.lead_date?.toFormat('dd MMM yyyy') || 'N/A',
            status: this.formatStatus(lead.status || 'pending'),
            amount: lead.amount ? `₹${parseFloat(lead.amount.toString()).toLocaleString()}` : null,
            createdAt: lead.createdAt?.toFormat('dd MMM yyyy HH:mm') || 'N/A'
          }))
        }
      })

    } catch (error: any) {
      console.error('❌ Profile Error:', error)
      return response.internalServerError({
        status: false,
        message: error.message || 'Something went wrong'
      })
    }
  }

  private calculatePercentage(part: number, total: number): string {
    if (total === 0) return '0%'
    return `${Math.round((part / total) * 100)}%`
  }

  private formatStatus(status: string): string {
    const map: Record<string, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'follow_up': 'Follow Up',
      'call_again': 'Call Again',
      'completed': 'Converted',
      'not_converted': 'Not Converted'
    }
    return map[status] || status
  }
}