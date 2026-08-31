// app/services/task_service.ts
import TaskManagement from '#models/task_management'
import User from '#models/user'  // ✅ Add this import
import InsuranceCategory from '#models/insurance_category' // ✅ Also add if used
import InsuranceSubCategory from '#models/insurance_sub_category'
import { DateTime } from 'luxon'
import TaskStatusLog from '#models/task_status_log'
import TaskAssignment from '#models/task_assignment'

interface CreateTaskData {
  insuranceCategoryId?: number
  insuranceSubCategoryId?: number
  taskAction: string
  referenceName?: string
  clientName?: string 
  insuranceCompanyId?: number
  leadDate?: DateTime | Date | string
  followUpDate?: DateTime | Date | string
  renewalDate?: DateTime
  renewalFollowUpDate?: DateTime
  registrationDate?: string 
  assignTo?: number
  priority?: 'high' | 'low' | 'normal'
  clientContactNumber?: string
  status?: 'pending' | 'completed'
  userId: number
  assignBy?: number
  insuranceType?: 'new_business' | 'port'
  registrationNumber?: string
  quoteSent?: 'yes' | 'no' 
  quoteShare?: 'yes' | 'no'
  amount?: number 
  policyNumber?: string 
  isRenewal?: boolean
}

interface UpdateTaskData {
  insuranceCategoryId?: number
  insuranceSubCategoryId?: number
  taskAction?: string
  referenceName?: string
  clientName?: string
  insuranceCompanyId?: number
  leadDate?: DateTime | Date | string
  followUpDate?: DateTime | Date | string
  renewalDate?: DateTime
  renewalFollowUpDate?: DateTime
  registrationDate?: string 
  assignTo?: number
  priority?: 'high' | 'low' | 'normal'
  clientContactNumber?: string
  status?: 'pending' | 'completed'
  insuranceType?: 'new_business' | 'port'
  registrationNumber?: string
  quoteSent?: 'yes' | 'no' 
  quoteShare?: 'yes' | 'no'
  amount?: number
  policyNumber?: string 
  isRenewal?: boolean
}

export default class TaskService {
  private async recordStatusLog(taskId: number, oldStatus: string | null, newStatus: string, changedBy?: number, remarks?: string) {
  if (oldStatus !== newStatus) {
    await TaskStatusLog.create({
      taskId,
      oldStatus,
      newStatus,
      changedBy: changedBy || null,
      remarks: remarks || null
    })
  }
}
  private toDateTime(date: DateTime | Date | string | undefined): DateTime | null {
    if (!date) return null
    
    if (date instanceof DateTime) {
      return date
    }
    
    if (date instanceof Date) {
      return DateTime.fromJSDate(date)
    }
    
    if (typeof date === 'string') {
      return DateTime.fromISO(date)
    }
    
    return null
  }
// app/services/task_service.ts

async create(data: CreateTaskData) {
  const task = new TaskManagement()
  const isEmployeeTask = data.assignTo || data.assignBy
  
  if (isEmployeeTask) {
    if (!data.leadDate) {
      data.leadDate = DateTime.now()
    }
    
    if (!data.insuranceCategoryId) {
      const motorCategory = await InsuranceCategory.query()
        .where('name', 'LIKE', '%Motor%')
        .orWhere('name', 'LIKE', '%motor%')
        .orWhere('name', 'LIKE', '%MOTOR%')
        .first()
      
      if (motorCategory) {
        data.insuranceCategoryId = motorCategory.id
      }
    }
  }
  
  // Set all fields
  task.insuranceCategoryId = data.insuranceCategoryId || null
  task.insuranceSubCategoryId = data.insuranceSubCategoryId || null
  task.taskAction = data.taskAction
  task.referenceName = data.referenceName || null
  task.clientName = data.clientName || null
  task.insuranceCompanyId = data.insuranceCompanyId || null
  task.leadDate = this.toDateTime(data.leadDate)
  task.followUpDate = this.toDateTime(data.followUpDate)
  task.renewalDate = this.toDateTime(data.renewalDate) 
  task.renewalFollowUpDate = this.toDateTime(data.renewalFollowUpDate)
  task.registrationDate = data.registrationDate || null 
  
  // ✅ Store only the first assignee in assign_to for backward compatibility
  // OR set it to null and rely on task_assignments table
  if (Array.isArray(data.assignTo) && data.assignTo.length > 0) {
    task.assignTo = data.assignTo[0] // Store first one for backward compatibility
  } else if (data.assignTo && !Array.isArray(data.assignTo)) {
    task.assignTo = data.assignTo
  } else {
    task.assignTo = null
  }
  
  task.assignBy = data.assignBy || null
  task.priority = data.priority || 'normal'
  task.userId = data.userId
  task.clientContactNumber = data.clientContactNumber || null
  task.status = data.status || 'pending'
  task.isActive = true
  task.insuranceType = data.insuranceType || null
  task.registrationNumber = data.registrationNumber || null
  task.quoteSent = data.quoteSent || null 
  task.quoteShare = data.quoteShare || null
  task.amount = data.amount || null
  task.policyNumber = data.policyNumber || null
  
  // Calculate isRenewal
  let isRenewal = false
  
  if (data.isRenewal === true) {
    isRenewal = true
  }
  
  if (!isRenewal && data.renewalDate) {
    isRenewal = true
  }
  
  if (!isRenewal && data.renewalFollowUpDate) {
    isRenewal = true
  }
  
  if (!isRenewal && data.insuranceSubCategoryId) {
    const subCategory = await InsuranceSubCategory.query()
      .where('id', data.insuranceSubCategoryId)
      .first()
    
    if (subCategory && subCategory.name) {
      const name = subCategory.name.toLowerCase()
      if (name.includes('renewal') || name.includes('renew')) {
        isRenewal = true
      }
    }
  }
  
  task.isRenewal = isRenewal

  await task.save()
  
  // ✅ Create task assignments for multiple users
  if (data.assignTo) {
    const userIds = Array.isArray(data.assignTo) ? data.assignTo : [data.assignTo]
    
    for (const userId of userIds) {
      // Check if user exists and is an employee
      const user = await User.query()
        .where('id', userId)
        .where('role', 'employee')
        .whereNull('deleted_at')
        .first()
      
      if (user) {
        await TaskAssignment.create({
          taskId: task.id,
          userId: userId,
          assignedBy: data.assignBy || data.userId,
          status: 'pending',
        })
      }
    }
  }
  
  await this.recordStatusLog(task.id, null, task.status, data.userId, 'Initial Task Creation')
  return task
}

  async getAll(page = 1, limit = 10, filters?: any) {
const query = TaskManagement.query()
    .whereNull('deleted_at')
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('taskAssignments', (query) => {
      query.preload('user', (q) => q.select('id', 'name', 'email'))
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })
    if (filters) {
      if (filters.status) {
        query.where('status', filters.status)
      }
      if (filters.priority) {
        query.where('priority', filters.priority)
      }
      if (filters.userId) {
        query.where('user_id', filters.userId)
      }
      if (filters.assignTo) {
        query.where('assign_to', filters.assignTo)
      }
      if (filters.insuranceCategoryId) {
        query.where('insurance_category_id', filters.insuranceCategoryId)
      }
      if (filters.insuranceSubCategoryId) {
        query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
      }
      if (filters.insuranceCompanyId) {
        query.where('insurance_company_id', filters.insuranceCompanyId)
      }
    }

    return query.orderBy('id', 'desc').paginate(page, limit)
  }

async getById(id: number) {
  const task = await TaskManagement.query()
    .where('id', id)
    .whereNull('deleted_at')
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('taskAssignments', (query) => {
      query.preload('user', (q) => q.select('id', 'name', 'email'))
      query.preload('assignedByUser', (q) => q.select('id', 'name', 'email'))
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })
    .first()

  if (!task) {
    throw new Error('Task not found')
  }

  return task
}


async update(id: number, data: UpdateTaskData, changedBy?: number) {
    const task = await TaskManagement.find(id)
    if (!task || task.deletedAt) {
      throw new Error('Task not found')
    }
    const oldStatus = task.status
    if (data.insuranceCategoryId !== undefined) {
      task.insuranceCategoryId = data.insuranceCategoryId
    }
    if (data.insuranceSubCategoryId !== undefined) {
      task.insuranceSubCategoryId = data.insuranceSubCategoryId
    }
    if (data.taskAction) {
      task.taskAction = data.taskAction
    }
    if (data.referenceName !== undefined) {
      task.referenceName = data.referenceName
    }
    if (data.clientName !== undefined) { 
      task.clientName = data.clientName
    }
    if (data.insuranceCompanyId !== undefined) {
      task.insuranceCompanyId = data.insuranceCompanyId
    }
    
    // Convert dates properly
    if (data.leadDate !== undefined) {
      task.leadDate = this.toDateTime(data.leadDate)
    }
    if (data.followUpDate !== undefined) {
      task.followUpDate = this.toDateTime(data.followUpDate)
    }
    if (data.renewalDate !== undefined) { 
      task.renewalDate = this.toDateTime(data.renewalDate)
    }
    if (data.renewalFollowUpDate !== undefined) { 
      task.renewalFollowUpDate = this.toDateTime(data.renewalFollowUpDate)
    }
    if (data.registrationDate !== undefined) {
      task.registrationDate = data.registrationDate || null
    }
    if (data.assignTo !== undefined) {
      task.assignTo = data.assignTo
    }
    if (data.priority) {
      task.priority = data.priority
    }
    if (data.clientContactNumber !== undefined) {
      task.clientContactNumber = data.clientContactNumber
    }
    if (data.status) {
      task.status = data.status
    }
    if (data.amount !== undefined) {
      task.amount = data.amount
    }
    if (data.policyNumber !== undefined) {
      task.policyNumber = data.policyNumber
    }
    if (data.isRenewal !== undefined) {
      task.isRenewal = data.isRenewal
    }
    if (data.insuranceType !== undefined) {
      task.insuranceType = data.insuranceType
    }
    if (data.registrationNumber !== undefined) {
      task.registrationNumber = data.registrationNumber
    }
    if (data.quoteShare !== undefined) { 
      task.quoteShare = data.quoteShare
    }
    task.quoteSent = data.quoteSent || null 

    await task.save()

    if (data.status && oldStatus !== task.status) {
      await this.recordStatusLog(task.id, oldStatus, task.status, changedBy)
    }

    return task
  }
  async delete(id: number) {
    const task = await TaskManagement.find(id)
    if (!task || task.deletedAt) {
      throw new Error('Task not found')
    }

    task.deletedAt = DateTime.now()
    await task.save()

    return { message: 'Task deleted successfully' }
  }

async changeStatus(id: number, status: string, changedBy?: number, remarks?: string) {
    const task = await TaskManagement.find(id)
    if (!task || task.deletedAt) {
      throw new Error('Task not found')
    }

    const oldStatus = task.status
    task.status = status as any
    await task.save()

    await this.recordStatusLog(task.id, oldStatus, status, changedBy, remarks)
    return task
  }
async getEmployeeTasks(page = 1, limit = 10, filters?: any) {
  const employeeId = filters?.assignTo || 0
  
  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .whereHas('taskAssignments', (query) => {
      query.where('user_id', employeeId).whereNull('deleted_at')
    })
    // OR use this if you still want to support old tasks without assignments:
    .orWhere('assign_to', employeeId)
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('taskAssignments', (query) => {
      query.preload('user', (q) => q.select('id', 'name', 'email'))
      query.preload('assignedByUser', (q) => q.select('id', 'name', 'email'))
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })

  // Apply filters
  if (filters) {
    if (filters.status) {
      query.whereHas('taskAssignments', (q) => {
        q.where('status', filters.status)
      })
    }
    if (filters.priority) {
      query.where('priority', filters.priority)
    }
    if (filters.insuranceCategoryId) {
      query.where('insurance_category_id', filters.insuranceCategoryId)
    }
    if (filters.insuranceSubCategoryId) {
      query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }
    if (filters.insuranceCompanyId) {
      query.where('insurance_company_id', filters.insuranceCompanyId)
    }
    if (filters.insuranceType) {
      query.where('insurance_type', filters.insuranceType)
    }
  }

  return query.orderBy('id', 'desc').paginate(page, limit)
}

async getEmployeeTaskById(id: number, employeeId: number) {
  const task = await TaskManagement.query()
    .where('id', id)
    .whereNull('deleted_at')
    .where((builder) => {
      builder
        .whereHas('taskAssignments', (q) => {
          q.where('user_id', employeeId).whereNull('deleted_at')
        })
        .orWhere('assign_to', employeeId)
    })
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('taskAssignments', (query) => {
      query.preload('user', (q) => q.select('id', 'name', 'email'))
      query.preload('assignedByUser', (q) => q.select('id', 'name', 'email'))
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })
    .first()

  if (!task) {
    throw new Error('Task not found or not assigned to you')
  }

  return task
}

 async updateEmployeeTaskStatus(id: number, employeeId: number, status: 'pending' | 'completed') {
  const task = await TaskManagement.query()
    .where('id', id)
    .whereNull('deleted_at')
    .where('assign_to', employeeId)
    .first()

  if (!task || task.deletedAt) {
    throw new Error('Task not found or not assigned to you')
  }

  task.status = status
  await task.save()

  return task
}

async getEmployeeTaskStats(employeeId: number) {
    const total = await TaskManagement.query()
    .whereNull('deleted_at')
    .where('assign_to', employeeId) 
    .count('* as total')

  const pending = await TaskManagement.query()
    .whereNull('deleted_at')
    .where('assign_to', employeeId)  
    .where('status', 'pending')
    .count('* as total')

  const completed = await TaskManagement.query()
    .whereNull('deleted_at')
    .where('status', 'completed')
    .count('* as total')

  const highPriority = await TaskManagement.query()
    .whereNull('deleted_at')
    .where('assign_to', employeeId)  
    .where('priority', 'high')
    .where('status', 'pending')
    .count('* as total')

  return {
    total: total[0].$extras.total || 0,
    pending: pending[0].$extras.total || 0,
    completed: completed[0].$extras.total || 0,
    highPriority: highPriority[0].$extras.total || 0,
  }
}

async updateEmployeeTaskWorkflow(id: number, employeeId: number, data: any) {
  const task = await TaskManagement.query()
    .where('id', id)
    .whereNull('deleted_at')
    .where((builder) => {
      builder
        .where('assign_to', employeeId)
        .orWhere('user_id', employeeId)
        .orWhere('assign_by', employeeId)
    })
    .first()

  if (!task || task.deletedAt) {
    throw new Error('Task not found or not assigned to you')
  }
  // Start me old status save karein:
const oldStatus = task.status
  const isAssigned = task.assignTo === employeeId
  const isCreator = task.userId === employeeId
  const isAssigner = task.assignBy === employeeId

  if (!isAssigned && !isCreator && !isAssigner) {
    throw new Error('You are not authorized to update this task')
  }
  if (!task.assignTo && isCreator) {
    task.assignTo = employeeId
  }
  if (data.callResponse) {
    task.callResponse = data.callResponse
  }
  
  if (data.notRespondedAction) {
    task.notRespondedAction = data.notRespondedAction
  }
  
  if (data.respondedOption) {
    task.respondedOption = data.respondedOption
  }
  
  if (data.conversionStatus) {
    task.conversionStatus = data.conversionStatus
  }
  
  if (data.flowComment) {
    task.flowComment = data.flowComment
  }
  
  if (data.flowAmount) {
    task.flowAmount = parseFloat(data.flowAmount)
  }
  
  if (data.quoteShare) {
    task.quoteShare = data.quoteShare
  }
  
  if (data.quoteSent) {
    task.quoteSent = data.quoteSent
  }

  if (data.callResponse === 'Not Responded') {
    if (data.notRespondedAction === 'Call Again') {
      task.status = 'call_again'
      if (data.flowDateTime) {
        const dateTime = DateTime.fromISO(data.flowDateTime)
        task.followUpDate = dateTime
        task.flowDateTime = dateTime
      }
    }
  } else if (data.callResponse === 'Responded') {
    switch (data.respondedOption) {
      case 'Call Again':
        task.status = 'call_again'
        if (data.flowDateTime) {
          const dateTime = DateTime.fromISO(data.flowDateTime)
          task.followUpDate = dateTime
          task.flowDateTime = dateTime
        }
        break

      case 'Share quote':
        task.status = 'follow_up'
        if (data.renewalDate) {
          task.renewalDate = DateTime.fromISO(data.renewalDate)
        }
        if (data.followUpDate) {
          task.followUpDate = DateTime.fromISO(data.followUpDate)
        }
        if (data.flowComment) {
          task.flowComment = data.flowComment
        }
        task.quoteShare = 'yes'
        break

      case 'Converted':
        task.status = 'completed'
        if (data.flowAmount) {
          task.flowAmount = parseFloat(data.flowAmount)
        }
        if (data.renewalDate) {
          task.renewalDate = DateTime.fromISO(data.renewalDate)
        }
        if (data.followUpDate) {
          task.followUpDate = DateTime.fromISO(data.followUpDate)
        }
        break

      case 'Not Converted':
        task.status = 'not_converted'
        if (data.flowComment) {
          task.flowComment = data.flowComment
        }
        break

      default:
        task.status = 'pending'
        break
    }
  }

  await task.save()
  if (oldStatus !== task.status) {
  await this.recordStatusLog(task.id, oldStatus, task.status, employeeId, data.flowComment || null)
}
  return task
}
async getTaskStatusLogs(taskId: number) {
  return await TaskStatusLog.query()
    .where('task_id', taskId)
    .preload('user', (q) => q.select('id', 'name', 'email', 'role'))
    .orderBy('created_at', 'desc')
}
async getAllTaskStatusLogs() {
  return await TaskStatusLog.query()
    .preload('task') // Optional: to include task details in the logs
    .preload('user', (q) => q.select('id', 'name', 'email', 'role'))
    .orderBy('created_at', 'desc')
}
// async getEmployeeDashboardSummary(employeeId: number) {
//    const total = await TaskManagement.query()
//     .where('assign_to', employeeId) 
//     .whereNull('deleted_at')
//     .count('* as total')

//   const converted = await TaskManagement.query()
//     .where('assign_to', employeeId) 
//     .whereNull('deleted_at')
//     .where('status', 'completed')
//     .count('* as total')

//   const followUp = await TaskManagement.query()
//     .where('assign_to', employeeId) 
//     .whereNull('deleted_at')
//     .where('status', 'follow_up')
//     .count('* as total')

//   const quotesSent = await TaskManagement.query()
//     .where('assign_to', employeeId) 
//     .whereNull('deleted_at')
//     .where('responded_option', 'Share quote')
//     .count('* as total')

//   const callAgain = await TaskManagement.query()
//     .where('assign_to', employeeId) 
//     .whereNull('deleted_at')
//     .where('status', 'call_again')
//     .count('* as total')

//   const notConverted = await TaskManagement.query()
//     .where('assign_to', employeeId)  
//     .whereNull('deleted_at')
//     .where('status', 'not_converted')
//     .count('* as total')

//   const pending = await TaskManagement.query()
//     .where('assign_to', employeeId) 
//     .whereNull('deleted_at')
//     .whereIn('status', ['pending', 'in_progress'])
//     .count('* as total')
//   return {
//     total: total[0].$extras.total || 0,
//     converted: converted[0].$extras.total || 0,
//     followUp: followUp[0].$extras.total || 0,
//     quotesSent: quotesSent[0].$extras.total || 0,
//     callAgain: callAgain[0].$extras.total || 0,
//     notConverted: notConverted[0].$extras.total || 0,
//     pending: pending[0].$extras.total || 0,
//   }
// }


async getTasksWithFilters(page = 1, limit = 10, filters?: any) {
  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('assignToUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('assignByUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })

  if (filters) {
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.priority) {
      query.where('priority', filters.priority)
    }
    if (filters.assignTo) {
      query.where('assign_to', filters.assignTo)
    }
    if (filters.userId) {
      query.where('user_id', filters.userId)
    }
    if (filters.insuranceCategoryId) {
      query.where('insurance_category_id', filters.insuranceCategoryId)
    }
    if (filters.insuranceSubCategoryId) {
      query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }
    if (filters.insuranceCompanyId) {
      query.where('insurance_company_id', filters.insuranceCompanyId)
    }
    if (filters.insuranceType) {
      query.where('insurance_type', filters.insuranceType)
    }
    if (filters.respondedOption) {
      query.where('responded_option', filters.respondedOption)
    }
    if (filters.callResponse) {
      query.where('call_response', filters.callResponse)
    }
    if (filters.quoteSent) {
      query.where('quote_sent', filters.quoteSent)
    }
    if (filters.fromDate) {
      query.where('created_at', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.where('created_at', '<=', filters.toDate)
    }
  }

  return query.orderBy('id', 'desc').paginate(page, limit)
}


async getEmployeeTasksWithFilters(page = 1, limit = 10, employeeId: number, filters?: any) {
  console.log('📊 getEmployeeTasksWithFilters called:', { employeeId, filters })

  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .where((builder) => {
      builder
        .where('assign_to', employeeId)
        .orWhere('user_id', employeeId)
        .orWhere('assign_by', employeeId)
    })
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('assignToUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('assignByUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })

  // ✅ Apply filters
  if (filters) {
    if (filters.status) {
      query.andWhere('status', filters.status)
    }
    if (filters.priority) {
      query.andWhere('priority', filters.priority)
    }
    if (filters.insuranceCategoryId) {
      query.andWhere('insurance_category_id', filters.insuranceCategoryId)
    }
    if (filters.insuranceSubCategoryId) {
      query.andWhere('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }
    if (filters.insuranceCompanyId) {
      query.andWhere('insurance_company_id', filters.insuranceCompanyId)
    }
    if (filters.insuranceType) {
      query.andWhere('insurance_type', filters.insuranceType)
    }
    if (filters.respondedOption) {
      query.andWhere('responded_option', filters.respondedOption)
    }
    if (filters.callResponse) {
      query.andWhere('call_response', filters.callResponse)
    }
    if (filters.fromDate) {
      query.andWhere('created_at', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.andWhere('created_at', '<=', filters.toDate)
    }
  }

  const result = await query.orderBy('id', 'desc').paginate(page, limit)
  console.log('📊 Filter results count:', result.meta?.total || 0)
  return result
}

async getTaskFilterCounts(filters?: any) {
  const query = TaskManagement.query().whereNull('deleted_at')

  if (filters) {
    if (filters.assignTo) {
      query.where('assign_to', filters.assignTo)
    }
    if (filters.userId) {
      query.where('user_id', filters.userId)
    }
    if (filters.insuranceCategoryId) {
      query.where('insurance_category_id', filters.insuranceCategoryId)
    }
    if (filters.insuranceSubCategoryId) {
      query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }
    if (filters.insuranceCompanyId) {
      query.where('insurance_company_id', filters.insuranceCompanyId)
    }
    if (filters.insuranceType) {
      query.where('insurance_type', filters.insuranceType)
    }
  }

  // Get counts for different statuses
  const pending = await query.clone().where('status', 'pending').count('* as total')
  const callAgain = await query.clone().where('status', 'call_again').count('* as total')
  const followUp = await query.clone().where('status', 'follow_up').count('* as total')
  const completed = await query.clone().where('status', 'completed').count('* as total')
  const notConverted = await query.clone().where('status', 'not_converted').count('* as total')
  const quotesSent = await query.clone().where('responded_option', 'Share quote').count('* as total')
  const total = await query.clone().count('* as total')

  return {
    total: Number(total[0].$extras.total) || 0,
    pending: Number(pending[0].$extras.total) || 0,
    callAgain: Number(callAgain[0].$extras.total) || 0,
    followUp: Number(followUp[0].$extras.total) || 0,
    converted: Number(completed[0].$extras.total) || 0,
    notConverted: Number(notConverted[0].$extras.total) || 0,
    quotesSent: Number(quotesSent[0].$extras.total) || 0,
  }
}

// app/services/task_service.ts

async searchTasks(
  searchTerm: string,
  page = 1,
  limit = 10,
  filters?: any
) {
  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (query) => {
      query.preload('category')
    })
    .preload('insuranceCompany', (query) => {
      query.preload('subCategory', (q) => {
        q.preload('category')
      })
    })
    .preload('assignToUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('assignByUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('user', (query) => {  // ✅ user = creator of task
      query.select('id', 'name', 'email')
    })

  // ✅ Apply filters
  if (filters) {
    // Status filter
    if (filters.status) {
      query.where('status', filters.status)
    }

    // Priority filter
    if (filters.priority) {
      query.where('priority', filters.priority)
    }

    // AssignTo filter (employee ID - direct match)
    if (filters.assignTo) {
      query.where('assign_to', filters.assignTo)
    }

    // UserId filter (created by)
    if (filters.userId) {
      query.where('user_id', filters.userId)
    }

    // Insurance Category
    if (filters.insuranceCategoryId) {
      query.where('insurance_category_id', filters.insuranceCategoryId)
    }

    // Insurance Sub Category
    if (filters.insuranceSubCategoryId) {
      query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }

    // Insurance Company
    if (filters.insuranceCompanyId) {
      query.where('insurance_company_id', filters.insuranceCompanyId)
    }

    // Insurance Type
    if (filters.insuranceType) {
      query.where('insurance_type', filters.insuranceType)
    }

    // Responded Option
    if (filters.respondedOption) {
      query.where('responded_option', filters.respondedOption)
    }

    // Call Response
    if (filters.callResponse) {
      query.where('call_response', filters.callResponse)
    }

    // Quote Sent
    if (filters.quoteSent) {
      query.where('quote_sent', filters.quoteSent)
    }

    // Date range
    if (filters.fromDate) {
      query.where('lead_date', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.where('follow_up_date', '<=', filters.toDate)
    }

    // ✅ Employee Name filter - Search in user (creator) OR assignToUser
    if (filters.employeeName) {
      query.where((builder) => {
        builder
          .whereHas('user', (userQuery) => {
            userQuery.where('name', 'LIKE', `%${filters.employeeName}%`)
          })
          .orWhereHas('assignToUser', (userQuery) => {
            userQuery.where('name', 'LIKE', `%${filters.employeeName}%`)
          })
      })
    }

    // ✅ Insurance search
    if (filters.insurance) {
      query.where((builder) => {
        builder
          .whereHas('insuranceCategory', (catQuery) => {
            catQuery.where('name', 'LIKE', `%${filters.insurance}%`)
          })
          .orWhereHas('insuranceSubCategory', (subQuery) => {
            subQuery.where('name', 'LIKE', `%${filters.insurance}%`)
          })
          .orWhereHas('insuranceCompany', (compQuery) => {
            compQuery.where('name', 'LIKE', `%${filters.insurance}%`)
          })
      })
    }

    // ✅ Client Name filter
    if (filters.clientName) {
      query.where('client_name', 'LIKE', `%${filters.clientName}%`)
    }

    // ✅ Client Contact filter
    if (filters.clientContact) {
      query.where('client_contact_number', 'LIKE', `%${filters.clientContact}%`)
    }

    // ✅ Registration Number filter
    if (filters.registrationNumber) {
      query.where('registration_number', 'LIKE', `%${filters.registrationNumber}%`)
    }
  }

  // ✅ Apply search term (q parameter)
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim()
    query.where((builder) => {
      builder
        .where('client_name', 'LIKE', `%${term}%`)
        .orWhere('client_contact_number', 'LIKE', `%${term}%`)
        .orWhere('registration_number', 'LIKE', `%${term}%`)
        .orWhere('reference_name', 'LIKE', `%${term}%`)
        .orWhere('policy_number', 'LIKE', `%${term}%`)
        .orWhere('insurance_type', 'LIKE', `%${term}%`)
        .orWhereHas('user', (userQuery) => {
          userQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('assignToUser', (userQuery) => {
          userQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('assignByUser', (userQuery) => {
          userQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceCategory', (categoryQuery) => {
          categoryQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceSubCategory', (subCategoryQuery) => {
          subCategoryQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceCompany', (companyQuery) => {
          companyQuery.where('name', 'LIKE', `%${term}%`)
        })
    })
  }

  return query.orderBy('id', 'desc').paginate(page, limit)
}

async searchEmployeeTasks(
  searchTerm: string,
  employeeId: number,
  page = 1,
  limit = 10,
  filters?: any
) {
  console.log('🔍 searchEmployeeTasks called:', { 
    employeeId, 
    searchTerm, 
    filters,
    hasFilters: !!filters 
  })

  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .where((builder) => {
      builder
        .where('assign_to', employeeId)
        .orWhere('user_id', employeeId)
        .orWhere('assign_by', employeeId)
    })

  if (filters) {
    if (filters.status) {
      query.andWhere('status', filters.status)
      console.log('✅ Status filter:', filters.status)
    }
    if (filters.priority) {
      query.andWhere('priority', filters.priority)
    }
    if (filters.insuranceCategoryId) {
      query.andWhere('insurance_category_id', filters.insuranceCategoryId)
    }
    if (filters.insuranceSubCategoryId) {
      query.andWhere('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }
    if (filters.insuranceCompanyId) {
      query.andWhere('insurance_company_id', filters.insuranceCompanyId)
    }
    if (filters.insuranceType) {
      query.andWhere('insurance_type', filters.insuranceType)
    }
    if (filters.respondedOption) {
      query.andWhere('responded_option', filters.respondedOption)
    }
    if (filters.callResponse) {
      query.andWhere('call_response', filters.callResponse)
    }
    if (filters.quoteSent) {
      query.andWhere('quote_sent', filters.quoteSent)
    }
    if (filters.fromDate) {
      query.andWhere('lead_date', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.andWhere('follow_up_date', '<=', filters.toDate)
    }
  }
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim()
    query.andWhere((builder) => {
      builder
        .where('client_name', 'LIKE', `%${term}%`)
        .orWhere('client_contact_number', 'LIKE', `%${term}%`)
        .orWhere('registration_number', 'LIKE', `%${term}%`)
        .orWhere('reference_name', 'LIKE', `%${term}%`)
        .orWhere('policy_number', 'LIKE', `%${term}%`)
        .orWhere('insurance_type', 'LIKE', `%${term}%`)
        .orWhereHas('insuranceCategory', (categoryQuery) => {
          categoryQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceSubCategory', (subCategoryQuery) => {
          subCategoryQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceCompany', (companyQuery) => {
          companyQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('assignToUser', (userQuery) => {
          userQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('assignByUser', (userQuery) => {
          userQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('user', (userQuery) => {
          userQuery.where('name', 'LIKE', `%${term}%`)
        })
    })
  }

  const result = await query.orderBy('id', 'desc').paginate(page, limit)
  console.log('📊 Final result count:', result.meta?.total || 0)

  return result
}

async getRenewalTasks(page = 1, limit = 10, filters?: any) {
  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .where('is_renewal', true)
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (q) => q.preload('category'))
    .preload('insuranceCompany', (q) => q.preload('subCategory', (sq) => sq.preload('category')))
    .preload('assignToUser', (q) => q.select('id', 'name', 'email'))
    .preload('assignByUser', (q) => q.select('id', 'name', 'email'))
    .preload('user', (q) => q.select('id', 'name', 'email'))

  if (filters) {
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.clientName) {
      query.where('client_name', 'LIKE', `%${filters.clientName.trim()}%`)
    }
    if (filters.fromDate) {
      query.where('renewal_date', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.where('renewal_date', '<=', filters.toDate)
    }
    if (filters.priority) query.where('priority', filters.priority)
    if (filters.assignTo) query.where('assign_to', filters.assignTo)
    if (filters.userId) query.where('user_id', filters.userId)
    if (filters.insuranceCategoryId) query.where('insurance_category_id', filters.insuranceCategoryId)
    if (filters.insuranceSubCategoryId) query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    if (filters.insuranceCompanyId) query.where('insurance_company_id', filters.insuranceCompanyId)
    if (filters.insuranceType) query.where('insurance_type', filters.insuranceType)
  }

  return query.orderBy('renewal_date', 'asc').paginate(page, limit)
}

async updateRenewalStatus(
  id: number,
  data: {
    status: 'pending' | 'renewed'
    comment?: string
    flowComment?: string
    renewalDate?: DateTime | string
  }
) {
  const task = await TaskManagement.query()
    .where('id', id)
    .whereNull('deleted_at')
    .first()

  if (!task) {
    throw new Error('Task not found')
  }
  task.status = data.status
  if (data.comment !== undefined || data.flowComment !== undefined) {
    task.flowComment = data.comment || data.flowComment || null
  }
  if (data.renewalDate) {
    task.renewalDate = this.toDateTime(data.renewalDate)
  }
  task.isRenewal = true

  await task.save()
  return task
}
async getEmployeeRenewalTasks(page = 1, limit = 10, employeeId: number, filters?: any) {
  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .where('is_renewal', true)
    .where((builder) => {
      builder
        .where('assign_to', employeeId)
        .orWhere('user_id', employeeId)
        .orWhere('assign_by', employeeId)
    })
    .preload('insuranceCategory')
    .preload('insuranceSubCategory', (q) => q.preload('category'))
    .preload('insuranceCompany', (q) => q.preload('subCategory', (sq) => sq.preload('category')))
    .preload('assignToUser', (q) => q.select('id', 'name', 'email'))
    .preload('assignByUser', (q) => q.select('id', 'name', 'email'))
    .preload('user', (q) => q.select('id', 'name', 'email'))

  if (filters) {
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.clientName) {
      query.where('client_name', 'LIKE', `%${filters.clientName.trim()}%`)
    }
    if (filters.fromDate) {
      query.where('renewal_date', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.where('renewal_date', '<=', filters.toDate)
    }
    if (filters.priority) query.where('priority', filters.priority)
    if (filters.insuranceCategoryId) query.where('insurance_category_id', filters.insuranceCategoryId)
    if (filters.insuranceSubCategoryId) query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    if (filters.insuranceCompanyId) query.where('insurance_company_id', filters.insuranceCompanyId)
    if (filters.insuranceType) query.where('insurance_type', filters.insuranceType)
  }

  return query.orderBy('renewal_date', 'asc').paginate(page, limit)
}
async exportTasks(filters?: any, searchTerm?: string) {
  const query = TaskManagement.query()
    .whereNull('deleted_at')
    .select(
      'id',
      'client_name',
      'client_contact_number',
      'task_action',
      'status',
      'priority',
      'insurance_type',
      'registration_number',
      'policy_number',
      'amount',
      'flow_amount',
      'lead_date',
      'follow_up_date',
      'renewal_date',
      'insurance_category_id',
      'insurance_sub_category_id',
      'insurance_company_id',
      'assign_to',
      'assign_by',
      'user_id',
      'call_response',
      'responded_option',
      'quote_sent',
      'quote_share',
      'created_at',
      'updated_at'
    )
    .preload('insuranceCategory', (query) => {
      query.select('id', 'name')
    })
    .preload('insuranceSubCategory', (query) => {
      query.select('id', 'name')
    })
    .preload('insuranceCompany', (query) => {
      query.select('id', 'name')
    })
    .preload('assignToUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('assignByUser', (query) => {
      query.select('id', 'name', 'email')
    })
    .preload('user', (query) => {
      query.select('id', 'name', 'email')
    })
  if (filters) {
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.priority) {
      query.where('priority', filters.priority)
    }
    if (filters.assignTo) {
      query.where('assign_to', filters.assignTo)
    }
    if (filters.userId) {
      query.where('user_id', filters.userId)
    }
    if (filters.insuranceCategoryId) {
      query.where('insurance_category_id', filters.insuranceCategoryId)
    }
    if (filters.insuranceSubCategoryId) {
      query.where('insurance_sub_category_id', filters.insuranceSubCategoryId)
    }
    if (filters.insuranceCompanyId) {
      query.where('insurance_company_id', filters.insuranceCompanyId)
    }
    if (filters.insuranceType) {
      query.where('insurance_type', filters.insuranceType)
    }
    if (filters.quoteSent) {
      query.where('quote_sent', filters.quoteSent)
    }
    if (filters.callResponse) {
      query.where('call_response', filters.callResponse)
    }
    if (filters.respondedOption) {
      query.where('responded_option', filters.respondedOption)
    }
    if (filters.fromDate) {
      query.where('created_at', '>=', filters.fromDate)
    }
    if (filters.toDate) {
      query.where('created_at', '<=', filters.toDate)
    }
  }
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim()
    query.where((builder) => {
      builder
        .where('client_name', 'LIKE', `%${term}%`)
        .orWhere('client_contact_number', 'LIKE', `%${term}%`)
        .orWhere('registration_number', 'LIKE', `%${term}%`)
        .orWhere('reference_name', 'LIKE', `%${term}%`)
        .orWhere('policy_number', 'LIKE', `%${term}%`)
        .orWhere('insurance_type', 'LIKE', `%${term}%`)
        .orWhereHas('insuranceCategory', (categoryQuery) => {
          categoryQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceSubCategory', (subCategoryQuery) => {
          subCategoryQuery.where('name', 'LIKE', `%${term}%`)
        })
        .orWhereHas('insuranceCompany', (companyQuery) => {
          companyQuery.where('name', 'LIKE', `%${term}%`)
        })
    })
  }

  const tasks = await query.orderBy('id', 'desc')

  return tasks.map(task => ({
    'ID': task.id,
    'Client Name': task.clientName || '-',
    'Contact Number': task.clientContactNumber || '-',
    'Task Action': task.taskAction || '-',
    'Status': task.status || '-',
    'Priority': task.priority || '-',
    'Insurance Type': task.insuranceType || '-',
    'Insurance Category': task.insuranceCategory?.name || '-',
    'Insurance Sub Category': task.insuranceSubCategory?.name || '-',
    'Insurance Company': task.insuranceCompany?.name || '-',
    'Registration Number': task.registrationNumber || '-',
    'Policy Number': task.policyNumber || '-',
    'Amount': task.amount || 0,
    'Flow Amount': task.flowAmount || 0,
    'Call Response': task.callResponse || '-',
    'Responded Option': task.respondedOption || '-',
    'Quote Sent': task.quoteSent || '-',
    'Quote Share': task.quoteShare || '-',
    'Lead Date': task.leadDate ? task.leadDate.toFormat('yyyy-MM-dd') : '-',
    'Follow Up Date': task.followUpDate ? task.followUpDate.toFormat('yyyy-MM-dd') : '-',
    'Renewal Date': task.renewalDate ? task.renewalDate.toFormat('yyyy-MM-dd') : '-',
    'Assigned To': task.assignToUser?.name || '-',
    'Assigned By': task.assignByUser?.name || '-',
    'Created By': task.user?.name || '-',
    'Created At': task.createdAt ? task.createdAt.toFormat('yyyy-MM-dd HH:mm:ss') : '-',
    'Updated At': task.updatedAt ? task.updatedAt.toFormat('yyyy-MM-dd HH:mm:ss') : '-'
  }))
}

async reassignTask(id: number, assignTo: number | number[], assignedBy?: number) {
  const task = await TaskManagement.query()
    .where('id', id)
    .whereNull('deleted_at')
    .first()

  if (!task) {
    throw new Error('Task not found')
  }

  // Delete existing assignments
  await TaskAssignment.query()
    .where('task_id', id)
    .whereNull('deleted_at')
    .delete()

  // Create new assignments
  const userIds = Array.isArray(assignTo) ? assignTo : [assignTo]
  
  // Update assign_to column with first user (for backward compatibility)
  task.assignTo = userIds.length > 0 ? userIds[0] : null
  await task.save()
  
  for (const userId of userIds) {
    const user = await User.query()
      .where('id', userId)
      .where('role', 'employee')
      .whereNull('deleted_at')
      .first()

    if (!user) {
      throw new Error(`User ${userId} not found or not an employee`)
    }

    await TaskAssignment.create({
      taskId: task.id,
      userId: userId,
      assignedBy: assignedBy || task.assignBy,
      status: 'pending',
    })
  }

  return task
}
async getTaskAssignments(taskId: number) {
  return await TaskAssignment.query()
    .where('task_id', taskId)
    .whereNull('deleted_at')
    .preload('user', (q) => q.select('id', 'name', 'email'))
    .preload('assignedByUser', (q) => q.select('id', 'name', 'email'))
}
}