
import type { HttpContext } from '@adonisjs/core/http'
import TaskService from '#services/task_service'
import BullMqService from '#services/bullmq_service'
import NotificationService from '#services/notification_service'
// import { DateTime } from 'luxon'

export default class EmployeeTaskController {
  private taskService = new TaskService()
  private notificationService = new NotificationService()
  
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!

      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const filters: Record<string, any> = {
        assignTo: user.id,
      }

      const filterFields = [
        'status',
        'priority',
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

      const tasks = await this.taskService.getEmployeeTasks(page, limit, filters)

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

  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const id = Number(params.id)

      if (isNaN(id) || id <= 0) {
        return response.badRequest({
          status: false,
          message: 'Invalid task ID'
        })
      }

      const task = await this.taskService.getEmployeeTaskById(id, user.id)

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
// app/controllers/employee/task_controller.ts

async store({ request, response, auth }: HttpContext) {
  try {
    const user = auth.user!
    const payload = request.only([
      'insuranceCategoryId',
      'insuranceSubCategoryId',
      'taskAction',
      'referenceName',
      'clientName',
      'insuranceCompanyId',
      'leadDate',
      'followUpDate',
      'renewalDate',
      'renewalFollowUpDate',
      'priority',
      'clientContactNumber',
      'status',
      'insuranceType',
      'registrationNumber',
      'registrationDate',
      'amount',
      'policyNumber',
      'renewalStatus'
    ])

    // ✅ Calculate isRenewal
    let isRenewal = false
    
    // Agar renewalDate hai toh true
    if (payload.renewalDate) {
      isRenewal = true
    }
    
    // Agar renewalFollowUpDate hai toh true
    if (payload.renewalFollowUpDate) {
      isRenewal = true
    }
    
    // Agar renewalStatus true hai toh true
    if (payload.renewalStatus === true || payload.renewalStatus === 'true') {
      isRenewal = true
    }

    const data = {
      ...payload,
      userId: user.id,
      assignTo: user.id,
      assignBy: user.id,
      registrationDate: payload.registrationDate || null,
      isRenewal: isRenewal // ✅ Send explicitly
    }

    const task = await this.taskService.create(data)

    return response.created({
      status: true,
      message: 'Task created successfully',
      data: task
    })
  } catch (error: any) {
    console.error('❌ Store Error:', error)
    return response.badRequest({
      status: false,
      message: error.message
    })
  }
}
  async updateWorkflow({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const id = Number(params.id)

      if (isNaN(id) || id <= 0) {
        return response.badRequest({
          status: false,
          message: 'Invalid task ID'
        })
      }

      const payload = request.only([
        'callResponse',
        'notRespondedAction',
        'respondedOption',
        'quoteSent',
        'conversionStatus',
        'flowDateTime',
        'flowComment',
        'flowAmount',
        'renewalDate',
        'followUpDate',
        'status'
      ])

      //return;
      if (payload.callResponse === 'Not Responded') {
        if (!payload.notRespondedAction) {
          return response.badRequest({
            status: false,
            message: 'Action is required when call is not responded'
          })
        }
      }

      if (payload.callResponse === 'Responded') {
        if (!payload.respondedOption) {
          return response.badRequest({
            status: false,
            message: 'Responded option is required'
          })
        }

        if (payload.respondedOption === 'Converted' && !payload.flowAmount) {
          return response.badRequest({
            status: false,
            message: 'Premium amount is required for conversion'
          })
        }

        if (payload.respondedOption === 'Not Converted' && !payload.flowComment) {
          return response.badRequest({
            status: false,
            message: 'Comments are required for Not Converted'
          })
        }

        if (payload.respondedOption === 'Call Again' && !payload.flowDateTime) {
          return response.badRequest({
            status: false,
            message: 'Follow up date & time is required for Call Again'
          })
        }
      }
      const userid = user.id;
      let flowupadate = null;
      if (payload.followUpDate || payload.flowDateTime) {
        if (payload.flowDateTime) {
          flowupadate = payload.flowDateTime;
        }
        else if (payload.followUpDate) {
          flowupadate = payload.followUpDate;
        }
        else {
          flowupadate = null;
        }
      }

      const comment = payload.flowComment
      // console.log(flowupadate);
      // console.log(payload);
      if (flowupadate) {
        const flowDate = new Date(flowupadate);
        await BullMqService.createJob(
          "notification",
          "followup",
          {
            userId: userid,
            title: "New followup",
            message: comment,
            taskid: id,
          },
          {
            delay: Math.max(0, flowDate.getTime() - Date.now()),
            jobId: `alarm-${flowDate.getTime()}`
          }
        );

      }


      const task = await this.taskService.updateEmployeeTaskWorkflow(id, user.id, payload)

      return response.ok({
        status: true,
        message: 'Workflow updated successfully',
        data: task
      })
    } catch (error: any) {
      console.log(error);
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }

  async updateStatus({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const id = Number(params.id)
      const status = request.input('status')

      if (isNaN(id) || id <= 0) {
        return response.badRequest({
          status: false,
          message: 'Invalid task ID'
        })
      }

      if (!['pending', 'completed'].includes(status)) {
        return response.badRequest({
          status: false,
          message: 'Invalid status. Must be pending or completed'
        })
      }

      const task = await this.taskService.updateEmployeeTaskStatus(id, user.id, status)

      return response.ok({
        status: true,
        message: `Task status updated to ${status}`,
        data: task
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async stats({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const stats = await this.taskService.getEmployeeTaskStats(user.id)

      return response.ok({
        status: true,
        data: stats
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
  async filter({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      // Get all filter params
      const filters: Record<string, any> = {}

      const filterFields = [
        'status',
        'priority',
        'insuranceCategoryId',
        'insuranceSubCategoryId',
        'insuranceCompanyId',
        'insuranceType',
        'respondedOption',
        'callResponse',
        'fromDate',
        'toDate'
      ]

      for (const field of filterFields) {
        const value = request.input(field)
        if (value !== undefined && value !== null && value !== '') {
          filters[field] = value
        }
      }

      const tasks = await this.taskService.getEmployeeTasksWithFilters(page, limit, user.id, filters)

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

  /**
   * Get task filter counts - Employee
   * GET /api/employee/tasks/counts
   */
  async counts({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      const filters: Record<string, any> = {}

      const filterFields = [
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

      // Add employee filter
      filters.assignTo = user.id

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


// app/controllers/employee/task_controller.ts

async search({ auth, request, response }: HttpContext) {
  try {
    const user = auth.user!
    const searchTerm = request.input('q', '').trim()
    const page = Number(request.input('page', 1))
    const limit = Number(request.input('limit', 10))

    console.log('🔍 Search Request:', {
      employeeId: user.id,
      searchTerm,
      page,
      limit,
      allParams: request.all()
    })

    const filters: Record<string, any> = {}

    const filterFields = [
      'status',
      'priority',
      'insuranceCategoryId',
      'insuranceSubCategoryId',
      'insuranceCompanyId',
      'insuranceType',
      'respondedOption',
      'callResponse',
      'quoteSent',
      'fromDate',
      'toDate',
    ]

    for (const field of filterFields) {
      const value = request.input(field)
      if (value !== undefined && value !== null && value !== '') {
        filters[field] = value
      }
    }

    console.log('📊 Filters:', filters)

    // ✅ If search term is empty, use filter method
    if (!searchTerm || searchTerm === '') {
      const tasks = await this.taskService.getEmployeeTasksWithFilters(
        page,
        limit,
        user.id,
        filters
      )
      console.log('📊 Filter result count:', tasks.meta?.total || 0)
      return response.ok({
        status: true,
        data: tasks,
      })
    }

    // ✅ Search with term and filters
    const tasks = await this.taskService.searchEmployeeTasks(
      searchTerm,
      user.id,
      page,
      limit,
      filters
    )

    console.log('📊 Search result count:', tasks.meta?.total || 0)

    return response.ok({
      status: true,
      data: tasks,
    })
  } catch (error: any) {
    console.error('❌ Search error:', error)
    return response.badRequest({
      status: false,
      message: error.message,
    })
  }
}
async renewal({ auth, request, response }: HttpContext) {
  try {
    const user = auth.user!
    const page = Number(request.input('page', 1))
    const limit = Number(request.input('limit', 10))

    const filters: Record<string, any> = {}

    const filterFields = [
      'status',
      'clientName',
      'fromDate',
      'toDate',
      'priority',
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

    const tasks = await this.taskService.getEmployeeRenewalTasks(
      page,
      limit,
      user.id,
      filters
    )

    return response.ok({
      status: true,
      data: tasks
    })
  } catch (error: any) {
    return response.badRequest({
      status: false,
      message: error.message || 'Failed to fetch renewal tasks'
    })
  }
}
async updateRenewal({ params, request, response, auth }: HttpContext) {
  try {
    const user = auth.user!
    const status = request.input('status')
    const comment = request.input('comment') || request.input('flowComment')
    const renewalDate = request.input('renewalDate')

    if (!['pending', 'renewed' ,'notrenewed'].includes(status)) {
      return response.badRequest({
        status: false,
        message: "Status must be either 'pending' or 'renewed' or 'notrenewed",
      })
    }
    const existingTask = await TaskManagement.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .where((builder) => {
        builder
          .where('assign_to', user.id)
          .orWhere('user_id', user.id)
          .orWhere('assign_by', user.id)
      })
      .first()

    if (!existingTask) {
      return response.forbidden({
        status: false,
        message: 'Task not found or not assigned to you',
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
  
}