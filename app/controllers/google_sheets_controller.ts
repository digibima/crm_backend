import type { HttpContext } from '@adonisjs/core/http'
import GoogleSheet from '#models/google_sheet'
import User from '#models/user'

export default class GoogleSheetsController {
  // Get all sheets with assigned employees
async index({ response }: HttpContext) {
    try {
      // 1. Fetch all Google Sheets with assigned employees
      const sheets = await GoogleSheet.query()
        .preload('assignedEmployees', (q) => {
          q.select('id', 'name', 'email', 'role', 'designation')
        })
        .orderBy('id', 'desc')

      const formattedSheets = sheets.map((sheet) => ({
        id: sheet.id,
        title: sheet.title,
        sheetUrl: sheet.sheetUrl,
        folder: sheet.folder,
        accessType: sheet.accessType,
        assignedEmployees: sheet.assignedEmployees.map((emp) => emp.id),
      }))

      // 2. Fetch all active employees for the frontend selection list
      const employees = await User.query()
        .where('role', 'employee')
        .whereNull('deleted_at')
        .where('isActive', true)
        .select('id', 'name', 'role', 'designation')
        .orderBy('name', 'asc')

      return response.ok({
        status: true,
        data: {
          sheets: formattedSheets,
          availableEmployees: employees, // Yahan saare employees mil jayenge
        },
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }

  // Create/Upload a new sheet and assign employees
  async store({ request, response }: HttpContext) {
    try {
      const { title, sheetUrl, folder, accessType, assignedEmployees } = request.only([
        'title',
        'sheetUrl',
        'folder',
        'accessType',
        'assignedEmployees',
      ])

      const sheet = await GoogleSheet.create({
        title,
        sheetUrl,
        folder: folder || 'Common Files',
        accessType: accessType || 'View Only',
      })

      // Attach selected employee IDs to the pivot table
      if (assignedEmployees && assignedEmployees.length > 0) {
        await sheet.related('assignedEmployees').attach(assignedEmployees)
      }

      return response.created({
        status: true,
        message: 'Google Sheet added and shared successfully',
        data: sheet,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }

  // Delete sheet
  async destroy({ params, response }: HttpContext) {
    try {
      const sheet = await GoogleSheet.find(params.id)

      if (!sheet) {
        return response.notFound({
          status: false,
          message: 'Google Sheet not found',
        })
      }

      // Detach pivot relations first
      await sheet.related('assignedEmployees').detach()
      await sheet.delete()

      return response.ok({
        status: true,
        message: 'Google Sheet deleted successfully',
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }
}