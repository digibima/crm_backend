// app/controllers/admin/task_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import TaskService from '#services/task_service'
import NotificationService from '#services/notification_service'
import { createTaskValidator, updateTaskValidator } from '#validators/task_validator'
import { DateTime } from 'luxon'
import * as XLSX from 'xlsx'
export default class TaskController {
  private taskService = new TaskService()
  private notificationService = new NotificationService()

  private toDateTime(date: any): DateTime | undefined {
    if (!date) return undefined

    if (date instanceof DateTime) {
      return date
    }

    if (date instanceof Date) {
      return DateTime.fromJSDate(date)
    }

    if (typeof date === 'string') {
      return DateTime.fromISO(date)
    }

    return undefined
  }
  // async test({ request, response, auth }: HttpContext) {
  //   const res = await this.notificationService.sendNotification(31, 1);
  //   return res;

  // }
  async store({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createTaskValidator)
      const registrationDate = payload.registrationDate || payload.registration_date || null
          let assignTo = payload.assignTo
    if (assignTo && !Array.isArray(assignTo)) {
      assignTo = [assignTo] // Convert single to array
    }
      const data: any = {
        ...payload,
        userId: auth.user!.id,
        assignBy: auth.user!.id,
        assignTo: assignTo,
        leadDate: this.toDateTime(payload.leadDate),
        followUpDate: this.toDateTime(payload.followUpDate),
        renewalDate: this.toDateTime(payload.renewalDate),
        renewalFollowUpDate: this.toDateTime(payload.renewalFollowUpDate),
        isRenewal: payload.isRenewal || false,
        registrationDate: registrationDate, 
      }
      //console.log(data.userId);
      const task = await this.taskService.create(data)
         if (assignTo && Array.isArray(assignTo)) {
      const title = "New Task Created"
      for (const userId of assignTo) {
        await this.notificationService.sendNotification(
          userId, 
          title, 
          `${title}: ${data.taskAction}`, 
          task.id
        )
      }
    }

      const title = "New Task Created";
      await this.notificationService.sendNotification(data.assignTo || null, title, title, task.id);
      return response.created({
        status: true,
        message: 'Task created successfully',
        data: task
      })
    } catch (error: any) {
      console.log('Error:', error)
      return response.badRequest({
        status: false,
        message: error.message || 'Failed to create task'
      })
    }
  }

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const filters: Record<string, any> = {}

      const filterFields = [
        'status',
        'priority',
        'userId',
        'assignTo',
        'insuranceCategoryId',
        'insuranceSubCategoryId',
        'insuranceCompanyId',
        'insuranceType',
        'quoteSent'
      ]

      for (const field of filterFields) {
        const value = request.input(field)
        if (value !== undefined && value !== null && value !== '') {
          filters[field] = value
        }
      }

      const tasks = await this.taskService.getAll(page, limit, filters)

      return response.ok({
        status: true,
        data: tasks
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const task = await this.taskService.getById(Number(params.id))

      return response.ok({
        status: true,
        data: task
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateTaskValidator)

      const data: Record<string, any> = {}

      // Only include fields that are provided
      if (payload.insuranceCategoryId !== undefined) data.insuranceCategoryId = payload.insuranceCategoryId
      if (payload.insuranceSubCategoryId !== undefined) data.insuranceSubCategoryId = payload.insuranceSubCategoryId
      if (payload.taskAction) data.taskAction = payload.taskAction
      if (payload.referenceName !== undefined) data.referenceName = payload.referenceName
      if (payload.clientName !== undefined) data.clientName = payload.clientName
      if (payload.clientContactNumber !== undefined) data.clientContactNumber = payload.clientContactNumber
      if (payload.insuranceCompanyId !== undefined) data.insuranceCompanyId = payload.insuranceCompanyId
      if (payload.assignTo !== undefined) data.assignTo = payload.assignTo
      if (payload.priority) data.priority = payload.priority
      if (payload.status) data.status = payload.status
      if (payload.insuranceType !== undefined) data.insuranceType = payload.insuranceType
      if (payload.registrationNumber !== undefined) data.registrationNumber = payload.registrationNumber
      if (payload.quoteSent !== undefined) data.quoteSent = payload.quoteSent
      if (payload.amount !== undefined) data.amount = payload.amount
      if (payload.policyNumber !== undefined) data.policyNumber = payload.policyNumber

      // Convert dates
      if (payload.leadDate !== undefined) {
        data.leadDate = this.toDateTime(payload.leadDate)
      }
      if (payload.followUpDate !== undefined) {
        data.followUpDate = this.toDateTime(payload.followUpDate)
      }
      if (payload.renewalDate !== undefined) {
        data.renewalDate = this.toDateTime(payload.renewalDate)
      }
      if (payload.renewalFollowUpDate !== undefined) { // ✅ New field
      data.renewalFollowUpDate = this.toDateTime(payload.renewalFollowUpDate)
    }
        if (payload.registrationDate !== undefined) {
      data.registrationDate = payload.registrationDate // ✅ Direct string assign
    }

const task = await this.taskService.update(Number(params.id), data, auth.user!.id)

      return response.ok({
        status: true,
        message: 'Task updated successfully',
        data: task
      })
    } catch (error: any) {
      console.log('Error:', error)
      return response.badRequest({
        status: false,
        message: error.message || 'Failed to update task'
      })
    }
  }
async getLogs({ params, response }: HttpContext) {
  try {
    const logs = await this.taskService.getTaskStatusLogs(Number(params.id))

    return response.ok({
      status: true,
      message: 'Status change logs fetched successfully',
      data: logs
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
async getAllLogs({ response }: HttpContext) {
  try {
    const logs = await this.taskService.getAllTaskStatusLogs()

    return response.ok({
      status: true,
      message: 'All status change logs fetched successfully',
      data: logs
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
  async destroy({ params, response }: HttpContext) {
    try {
      const result = await this.taskService.delete(Number(params.id))

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

async changeStatus({ params, request, response, auth }: HttpContext) {
    try {
      const status = request.input('status')
      const remarks = request.input('remarks') // ✅ Declare remarks variable here

      if (!['pending', 'in_progress', 'follow_up', 'call_again', 'completed', 'not_converted', 'renewed'].includes(status)) {
        return response.badRequest({
          status: false,
          message: 'Invalid status'
        })
      }

      const task = await this.taskService.changeStatus(
        Number(params.id),
        status,
        auth.user!.id,
        remarks
      )

      return response.ok({
        status: true,
        message: `Task status changed to ${status}`,
        data: task
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async filter({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const filters: Record<string, any> = {}

      const filterFields = [
        'status',
        'priority',
        'assignTo',
        'userId',
        'insuranceCategoryId',
        'insuranceSubCategoryId',
        'insuranceCompanyId',
        'insuranceType',
        'respondedOption',
        'callResponse',
        'quoteSent',
        'fromDate',
        'toDate'
      ]

      for (const field of filterFields) {
        const value = request.input(field)
        if (value !== undefined && value !== null && value !== '') {
          filters[field] = value
        }
      }

      const tasks = await this.taskService.getTasksWithFilters(page, limit, filters)

      return response.ok({
        status: true,
        data: tasks
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async counts({ request, response }: HttpContext) {
    try {
      const filters: Record<string, any> = {}

      const filterFields = [
        'assignTo',
        'userId',
        'insuranceCategoryId',
        'insuranceSubCategoryId',
        'insuranceCompanyId',
        'insuranceType'
      ]

      for (const field of filterFields) {
        const value = request.input(field)
        if (value !== undefined && value !== null && value !== '') {
          filters[field] = value
        }
      }

      const counts = await this.taskService.getTaskFilterCounts(filters)

      return response.ok({
        status: true,
        data: counts
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

// app/controllers/admin/task_controller.ts

async search({ request, response }: HttpContext) {
  try {
    const employeeName = request.input('employeeName', '').trim()
    const insurance = request.input('insurance', '').trim()
    const clientName = request.input('clientName', '').trim()
    const clientContact = request.input('clientContact', '').trim()
    const registrationNumber = request.input('registrationNumber', '').trim()
    const q = request.input('q', '').trim() 
    
    const page = Number(request.input('page', 1))
    const limit = Number(request.input('limit', 10))

    const filters: Record<string, any> = {}

    const filterFields = [
      'status',
      'priority',
      'assignTo',
      'userId',
      'insuranceCategoryId',
      'insuranceSubCategoryId',
      'insuranceCompanyId',
      'insuranceType',
      'respondedOption',
      'callResponse',
      'quoteSent',
      'fromDate',
      'toDate'
    ]

    for (const field of filterFields) {
      const value = request.input(field)
      if (value !== undefined && value !== null && value !== '') {
        filters[field] = value
      }
    }

    // ✅ Add specific search fields to filters
    if (employeeName) filters.employeeName = employeeName
    if (insurance) filters.insurance = insurance
    if (clientName) filters.clientName = clientName
    if (clientContact) filters.clientContact = clientContact
    if (registrationNumber) filters.registrationNumber = registrationNumber

    console.log('🔍 Search Filters:', filters) // Debug log

    const tasks = await this.taskService.searchTasks(
      q,
      page,
      limit,
      filters
    )

    console.log('📊 Total results:', tasks.meta?.total || 0) // Debug log

    return response.ok({
      status: true,
      data: tasks,
    })
  } catch (error: any) {
    console.error('❌ Search Error:', error)
    return response.badRequest({
      status: false,
      message: error.message,
    })
  }
}
async renewal({ request, response }: HttpContext) {
  try {
    const page = Number(request.input('page', 1))
    const limit = Number(request.input('limit', 10))

    const filters: Record<string, any> = {}

    const filterFields = [
      'status',  
      'clientName', 
      'fromDate', 
      'toDate',
      'priority',
      'assignTo',
      'userId',
      'insuranceCategoryId',
      'insuranceSubCategoryId',
      'insuranceCompanyId',
      'insuranceType'
    ]

    for (const field of filterFields) {
      const value = request.input(field)
      if (value !== undefined && value !== null && value !== '') {
        filters[field] = value
      }
    }

    const tasks = await this.taskService.getRenewalTasks(page, limit, filters)

    return response.ok({
      status: true,
      data: tasks
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
  async updateRenewal({ params, request, response }: HttpContext) {
  try {
    const status = request.input('status') // 'pending' | 'renewed'
    const comment = request.input('comment') || request.input('flowComment')
    const renewalDate = request.input('renewalDate')

    if (!['pending', 'renewed' ,'notrenewed'].includes(status)) {
      return response.badRequest({
        status: false,
        message: "Status must be either 'pending' or 'renewed' or 'notrenewed'",
      })
    }

    const task = await this.taskService.updateRenewalStatus(Number(params.id), {
      status,
      comment,
      renewalDate,
    })

    return response.ok({
      status: true,
      message: `Renewal task updated to ${status} successfully`,
      data: task,
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message || 'Failed to update renewal task',
    })
  }
}
async exportExcel({ request, response }: HttpContext) {
  try {
    const filters: Record<string, any> = {}

    const filterFields = [
      'status',
      'priority',
      'userId',
      'assignTo',
      'insuranceCategoryId',
      'insuranceSubCategoryId',
      'insuranceCompanyId',
      'insuranceType',
      'quoteSent',
      'fromDate',
      'toDate',
      'searchTerm' 
    ]

    for (const field of filterFields) {
      const value = request.input(field)
      if (value !== undefined && value !== null && value !== '') {
        filters[field] = value
      }
    }
    const searchTerm = request.input('q', '').trim()
    const searchTermFromFilter = request.input('searchTerm', '').trim()
    const finalSearchTerm = searchTerm || searchTermFromFilter

    // ✅ Call exportTasks with search term
    const tasks = await this.taskService.exportTasks(filters, finalSearchTerm)

    if (tasks.length === 0) {
      return response.badRequest({
        status: false,
        message: 'No tasks found to export'
      })
    }

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(tasks)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const fileName = `tasks-export-${DateTime.now().toFormat('yyyy-MM-dd-HH-mm-ss')}.xlsx`
    
    response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    
    return response.send(buffer)
  } catch (error: any) {
    console.log('Export Excel Error:', error)
    return response.badRequest({
      status: false,
      message: error.message || 'Failed to export tasks'
    })
  }
}
async reassign({ request, response }: HttpContext) {
  try {
    const { taskId, assignTo, assignedBy } = request.only(['taskId', 'assignTo', 'assignedBy'])

    if (!taskId) {
      return response.badRequest({
        status: false,
        message: 'taskId is required'
      })
    }

    if (!assignTo) {
      return response.badRequest({
        status: false,
        message: 'assignTo is required (single ID or array of IDs)'
      })
    }

    const task = await this.taskService.getById(Number(taskId))
    if (!task) {
      return response.badRequest({
        status: false,
        message: 'Task not found'
      })
    }

    const updatedTask = await this.taskService.reassignTask(
      Number(taskId), 
      assignTo, // Can be array or single
      assignedBy ? Number(assignedBy) : undefined
    )

    // Send notifications to new assignees
    const userIds = Array.isArray(assignTo) ? assignTo : [assignTo]
    const title = `Task Reassigned: ${task.taskAction || 'Task'}`
    
    for (const userId of userIds) {
      await this.notificationService.sendNotification(
        userId, 
        title, 
        `Task has been reassigned to you`, 
        task.id
      )
    }

    // Notify old assignees
    const oldAssignments = await this.taskService.getTaskAssignments(Number(taskId))
    for (const assignment of oldAssignments) {
      if (!userIds.includes(assignment.userId)) {
        await this.notificationService.sendNotification(
          assignment.userId,
          `Task Removed: ${task.taskAction || 'Task'}`,
          `Task has been reassigned from you`,
          task.id
        )
      }
    }

    return response.ok({
      status: true,
      message: 'Task reassigned successfully',
      data: updatedTask
    })
  } catch (error: any) {
    console.log('Reassign Error:', error)
    return response.badRequest({
      status: false,
      message: error.message || 'Failed to reassign task'
    })
  }
}
}