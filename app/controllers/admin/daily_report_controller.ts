// app/controllers/admin/daily_report_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import DailyReportService from '#services/daily_report_service'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class DailyReportController {
  private reportService = new DailyReportService()

  async viewPDF({ request, response }: HttpContext) {
    try {
      const employeeId = request.input('employeeId')
      const date = request.input('date', DateTime.now().toISODate())

      if (!employeeId) {
        return response.badRequest({
          status: false,
          message: 'employeeId is required'
        })
      }

      const pdfBuffer = await this.reportService.generateDailyReportPDF(
        Number(employeeId),
        date
      )

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'inline')

      return response.send(pdfBuffer)
    } catch (error: any) {
      console.error('❌ Report Error:', error)
      return response.internalServerError({
        status: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  async generatePDF({ request, response }: HttpContext) {
    try {
      const employeeId = request.input('employeeId')
      const date = request.input('date', DateTime.now().toISODate())

      if (!employeeId) {
        return response.badRequest({
          status: false,
          message: 'employeeId is required'
        })
      }

      console.log('📝 Generating PDF for Employee:', employeeId, 'Date:', date)

      const pdfBuffer = await this.reportService.generateDailyReportPDF(
        Number(employeeId),
        date
      )

      console.log('✅ PDF Generated, Size:', pdfBuffer.length, 'bytes')

      const employee = await User.find(employeeId)
      const fileName = `Daily-Report-${employee?.name?.replace(/\s/g, '-') || 'Employee'}-${date}.pdf`

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `attachment; filename="${fileName}"`)

      return response.send(pdfBuffer)
    } catch (error: any) {
      console.error('❌ PDF Generation Error:', error)
      return response.internalServerError({
        status: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  async getData({ request, response }: HttpContext) {
    try {
      const employeeId = request.input('employeeId')
      const date = request.input('date', DateTime.now().toISODate())

      if (!employeeId) {
        return response.badRequest({
          status: false,
          message: 'employeeId is required'
        })
      }

      const data = await this.reportService.getDailyReportData(
        Number(employeeId),
        date
      )

      // Format data for response
      const formattedData = {
        employee: data.employee,
        reportDate: data.reportDate,
        todayNewLeadsCount: data.todayNewLeadsCount,
        pendingFollowUpsCount: data.pendingFollowUpsCount,
        callAgainCount: data.callAgainCount,
        followUpCount: data.followUpCount,
        quoteSentCount: data.quoteSentCount,
        todayConvertedCount: data.todayConvertedCount,
        notConvertedCount: data.notConvertedCount,
        totalPremium: data.totalPremium,
        tables: {
          newLeads: data.newLeads.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            leadDate: lead.leadDate?.toFormat('dd MMM yy') || 'N/A',
            insuranceType: lead.insuranceType || 'N/A',
            status: this.formatStatus(lead.status || 'pending'),
            quoteSent: lead.quoteShare || 'No'
          })),
          pendingFollowUpsList: data.pendingFollowUps.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            leadDate: lead.leadDate?.toFormat('dd MMM yy') || 'N/A',
            followUpDate: lead.followUpDate?.toFormat('dd MMM yy') || 'N/A',
            category: lead.insuranceCategoryId || 'N/A',
            priority: lead.priority || 'Normal'
          })),
          callAgainList: data.callAgainLeads.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            lastUpdated: lead.updatedAt?.toFormat('dd MMM HH:mm') || 'N/A',
            followUpDate: lead.followUpDate?.toFormat('dd MMM yy') || 'N/A',
            callResponse: lead.callResponse || 'N/A',
            remark: lead.flowComment || 'N/A'
          })),
          followUpList: data.followUpLeads.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            followUpDate: lead.followUpDate?.toFormat('dd MMM yy') || 'N/A',
            lastUpdated: lead.updatedAt?.toFormat('dd MMM HH:mm') || 'N/A',
            callResponse: lead.callResponse || 'N/A',
            insuranceType: lead.insuranceType || 'N/A'
          })),
          quoteSentList: data.todayLeadsWithQuote.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            status: this.formatStatus(lead.status || 'pending'),
            quoteAmount: lead.amount ? `₹${parseFloat(lead.amount.toString()).toLocaleString()}` : 'N/A',
            insuranceType: lead.insuranceType || 'N/A'
          })),
          convertedList: data.todayConverted.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            leadDate: lead.leadDate?.toFormat('dd MMM yy') || 'N/A',
            policyNumber: lead.policyNumber || 'N/A',
            premiumAmount: lead.amount ? `₹${parseFloat(lead.amount.toString()).toLocaleString()}` : 'N/A',
            convertedAt: lead.updatedAt?.toFormat('dd MMM HH:mm') || 'N/A'
          })),
          notConvertedList: data.todayNotConverted.map((lead, index) => ({
            sno: index + 1,
            clientName: lead.clientName || 'N/A',
            contactNumber: lead.clientContactNumber || 'N/A',
            status: this.formatStatus(lead.status || 'pending'),
            quoteSent: lead.quoteShare || 'No',
            leadDate: lead.leadDate?.toFormat('dd MMM yy') || 'N/A',
            priority: lead.priority || 'Normal'
          })),
          overdueFollowUpsList: data.overdueFollowUps.map((lead: any, index: number) => ({
      sno: index + 1,
      clientName: lead.clientName || 'N/A',
      contactNumber: lead.clientContactNumber || 'N/A',
      followUpDate: lead.followUpDate?.toFormat('dd MMM yy') || 'N/A',
      insuranceType: lead.insuranceType || 'N/A',
      priority: lead.priority || 'Normal',
      remark: lead.flowComment || 'N/A'
    })),
    callAgainNotDoneList: data.callAgainNotDone.map((lead: any, index: number) => ({
      sno: index + 1,
      clientName: lead.clientName || 'N/A',
      contactNumber: lead.clientContactNumber || 'N/A',
      followUpDate: lead.followUpDate?.toFormat('dd MMM yy') || 'N/A',
      callResponse: lead.callResponse || 'N/A',
      priority: lead.priority || 'Normal',
      remark: lead.flowComment || 'N/A'
    }))
        }
      }

      return response.ok({
        status: true,
        data: formattedData
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async getEmployees({ response }: HttpContext) {
    try {
      const employees = await User.query()
        .where('role', 'employee')
        .whereNull('deleted_at')
        .select('id', 'name', 'designation', 'mobile')
        .orderBy('name', 'asc')

      return response.ok({
        status: true,
        data: employees
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'follow_up': 'Follow Up',
      'call_again': 'Call Again',
      'completed': 'Converted',
      'not_converted': 'Not Converted'
    }
    return statusMap[status] || status
  }
}