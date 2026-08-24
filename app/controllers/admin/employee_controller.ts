// app/controllers/admin/employee_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import EmployeeService from '#services/employee_service'
import {
  createEmployeeValidator,
  updateEmployeeValidator,
} from '#validators/employee_validator'
import fs from 'node:fs'
import path from 'node:path'

export default class EmployeeController {
  private employeeService = new EmployeeService()

  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'
  ]

  private readonly ALLOWED_IMAGE_EXTENSIONS = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'
  ]

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024

  private validateId(id: any): number {
    if (!id) throw new Error('Employee ID is required')
    const parsedId = Number(id)
    if (isNaN(parsedId)) throw new Error('Employee ID must be a valid number')
    if (parsedId <= 0) throw new Error('Employee ID must be a positive number')
    return parsedId
  }

  /**
   * Upload profile image - FIXED using move() method
   */
  private async uploadProfileImage(file: any): Promise<string | undefined> {
    if (!file || !file.clientName) {
      console.log('❌ No file to upload')
      return undefined
    }

    console.log('📎 Uploading file:', file.clientName)
    console.log('📎 File size:', file.size)
    console.log('📎 File type:', file.type)

    // Check file size
    if (file.size && file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
    }

    // Get extension
    let extname = file.extname || ''
    if (!extname && file.clientName) {
      const parts = file.clientName.split('.')
      extname = parts.length > 1 ? `.${parts.pop()}` : ''
    }
    
    const extension = extname.replace('.', '').toLowerCase()
    if (!extension || !this.ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      throw new Error(`Invalid file type. Allowed: ${this.ALLOWED_IMAGE_EXTENSIONS.join(', ')}`)
    }

    // Create directory if not exists
    const uploadDir = app.makePath('public/uploads/employees')
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Creating directory:', uploadDir)
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const fileName = `${randomUUID()}.${extension}`
    const filePath = path.join(uploadDir, fileName)

    console.log('📁 Saving file to:', filePath)

    try {
      // ✅ FIX: Use move() method instead of getContents()
      await file.move(uploadDir, {
        name: fileName,
        overwrite: true,
      })

      if (!file.isValid) {
        console.log('❌ File validation failed:', file.errors)
        throw new Error(file.errors?.join(', ') || 'File upload failed')
      }

      console.log('✅ File saved successfully:', fileName)
      return `uploads/employees/${fileName}`
    } catch (error: any) {
      console.log('❌ File save error:', error.message)
      throw new Error(`Failed to save file: ${error.message}`)
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      console.log('📝 Creating employee...')

      // Get file first
      const profileImage = request.file('profileImage', {
        size: '5mb',
        extnames: this.ALLOWED_IMAGE_EXTENSIONS,
      })

      console.log('📎 Profile image received:', profileImage ? 'Yes' : 'No')

      // Get other data
      const payload = await request.validateUsing(createEmployeeValidator)

      let profileImagePath: string | undefined

      // Upload image if exists and valid
      if (profileImage && profileImage.isValid) {
        try {
          profileImagePath = await this.uploadProfileImage(profileImage)
        } catch (error: any) {
          return response.badRequest({
            status: false,
            message: error.message,
          })
        }
      } else if (profileImage && !profileImage.isValid) {
        console.log('❌ File validation failed:', profileImage.errors)
        return response.badRequest({
          status: false,
          message: profileImage.errors?.join(', ') || 'Invalid file upload',
        })
      }

      // Create employee
      const employee = await this.employeeService.createEmployee({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: payload.role,
        designation: payload.designation,
        salary: payload.salary,
        doj: payload.doj,
        dob: payload.dob,
        isActive: payload.isActive ?? true,
        profileImage: profileImagePath,
      })

      console.log('✅ Employee created successfully:', employee.id)

      return response.created({
        status: true,
        message: 'Employee created successfully',
        data: employee,
      })
    } catch (error: any) {
      console.log('❌ Store Error:', error)
      return response.badRequest({
        status: false,
        message: error.messages?.[0]?.message || error.message,
        errors: error.messages || [],
      })
    }
  }

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))

      const employees = await this.employeeService.getAllEmployees(page, limit)

      return response.ok({
        status: true,
        data: employees,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const id = this.validateId(params.id)
      const employee = await this.employeeService.getEmployeeById(id)

      return response.ok({
        status: true,
        data: employee,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const id = this.validateId(params.id)
      console.log('📝 Updating employee:', id)

      // Get file first
      const profileImage = request.file('profileImage', {
        size: '5mb',
        extnames: this.ALLOWED_IMAGE_EXTENSIONS,
      })

      console.log('📎 Profile image received:', profileImage ? 'Yes' : 'No')

      // Get other data
      const payload = await request.validateUsing(updateEmployeeValidator)

      let profileImagePath: string | undefined

      // Upload image if exists and valid
      if (profileImage && profileImage.isValid) {
        try {
          profileImagePath = await this.uploadProfileImage(profileImage)
        } catch (error: any) {
          return response.badRequest({
            status: false,
            message: error.message,
          })
        }
      } else if (profileImage && !profileImage.isValid) {
        console.log('❌ File validation failed:', profileImage.errors)
        return response.badRequest({
          status: false,
          message: profileImage.errors?.join(', ') || 'Invalid file upload',
        })
      }
      const employee = await this.employeeService.updateEmployee(id, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: payload.role,
        designation: payload.designation,
        salary: payload.salary,
        doj: payload.doj,
        dob: payload.dob,
        isActive: payload.isActive,
        profileImage: profileImagePath,
      })

      console.log('✅ Employee updated successfully:', employee.id)

      return response.ok({
        status: true,
        message: 'Employee updated successfully',
        data: employee,
      })
    } catch (error: any) {
      console.log('❌ Update Error:', error)
      return response.badRequest({
        status: false,
        message: error.messages?.[0]?.message || error.message,
        errors: error.messages || [],
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const id = this.validateId(params.id)
      const result = await this.employeeService.deleteEmployee(id)

      return response.ok({
        status: true,
        ...result,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message,
      })
    }
  }

  async list({ response }: HttpContext) {
    try {
      const employees = await this.employeeService.getEmployeeList()
      
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
}