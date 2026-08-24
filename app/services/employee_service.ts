// app/services/employee_service.ts

import User from '#models/user'
import { DateTime } from 'luxon'
import RedisService from '#services/redis_service'
import { unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'

interface CreateEmployeeData {
  name: string
  email: string
  phone?: string
  password: string
  role: 'admin' | 'employee'
  designation?: string
  salary?: number
  doj?: DateTime
  dob?: DateTime
  isActive?: boolean
  profileImage?: string
}

interface UpdateEmployeeData {
  name?: string
  email?: string
  phone?: string
  password?: string
  role?: 'admin' | 'employee'
  designation?: string
  salary?: number
  doj?: DateTime
  dob?: DateTime
  isActive?: boolean
  profileImage?: string
}

export default class EmployeeService {
  
  private async deleteProfileImage(imagePath: string | null): Promise<void> {
    if (!imagePath) return

    try {
      const fullPath = app.makePath('public', imagePath)
      if (existsSync(fullPath)) {
        await unlink(fullPath)
        console.log(`✅ Deleted profile image: ${imagePath}`)
      }
    } catch (error) {
      console.error(`❌ Failed to delete profile image: ${imagePath}`, error)
    }
  }

  async createEmployee(data: CreateEmployeeData) {
    // Check if email exists
    const exists = await User.findBy('email', data.email)
    if (exists) {
      throw new Error('Email already exists')
    }

    const employee = new User()

    employee.name = data.name
    employee.email = data.email
    employee.password = data.password
    employee.plainPassword = data.password 
    employee.role = data.role
    employee.isActive = data.isActive ?? true
    employee.isEmailVerified = true
    employee.isMobileVerified = false
    employee.profileImage = data.profileImage ?? null

    if (data.designation) employee.designation = data.designation
    if (data.phone) employee.mobile = data.phone
    if (data.salary) employee.salary = data.salary.toString()
    if (data.dob) employee.dob = data.dob
    if (data.doj) employee.doj = data.doj

    await employee.save()
    return employee
  }

  async getAllEmployees(page = 1, limit = 10) {
    return User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select(
        'id', 
        'name', 
        'email', 
        'mobile', 
        'role', 
        'designation',
        'plainPassword',
        'profileImage',
        'isActive', 
        'salary', 
        'doj', 
        'dob', 
        'createdAt',
        'updatedAt'
      )
      .orderBy('id', 'desc')
      .paginate(page, limit)
  }

  async getEmployeeById(id: number) {
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('Invalid employee ID')
    }

    const employee = await User.query()
      .where('id', id)
      .where('role', 'employee')
      .select(
        'id', 
        'name', 
        'email', 
        'mobile', 
        'role', 
        'profileImage',
        'designation',
        'plainPassword',
        'isActive', 
        'salary', 
        'doj', 
        'dob', 
        'createdAt',
        'updatedAt',
        'deletedAt'
      )
      .first()

    if (!employee) {
      throw new Error('Employee not found')
    }
    if (employee.deletedAt) {
      throw new Error('Employee has been deleted')
    }

    return employee
  }

  async updateEmployee(id: number, data: UpdateEmployeeData) {
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('Invalid employee ID')
    }

    const employee = await User.query()
      .where('id', id)
      .where('role', 'employee')
      .first()

    if (!employee) {
      throw new Error('Employee not found')
    }
    if (employee.deletedAt) {
      throw new Error('Cannot update a deleted employee')
    }

    // If new profile image is uploaded, delete the old one
    if (data.profileImage && employee.profileImage) {
      await this.deleteProfileImage(employee.profileImage)
    }

    // Check email if changed
    if (data.email && data.email !== employee.email) {
      const exists = await User.findBy('email', data.email)
      if (exists) {
        throw new Error('Email already exists')
      }
      employee.email = data.email
    }

    // Update fields
    if (data.name) employee.name = data.name
    if (data.phone) employee.mobile = data.phone
    if (data.role) employee.role = data.role
    if (data.designation) employee.designation = data.designation
    if (data.salary) employee.salary = data.salary.toString()
    if (data.dob) employee.dob = data.dob
    if (data.doj) employee.doj = data.doj
    if (data.isActive !== undefined) employee.isActive = data.isActive
    if (data.profileImage) {
      employee.profileImage = data.profileImage
    }

    if (data.password) {
      employee.password = data.password 
      employee.plainPassword = data.password 
    }
    
    await employee.save()
    
    if (data.isActive === false) {
      await RedisService.removeAvailableStaff(employee.id)
    }
    
    return employee
  }

  async deleteEmployee(id: number) {
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('Invalid employee ID')
    }

    const employee = await User.query()
      .where('id', id)
      .where('role', 'employee')
      .first()

    if (!employee) {
      throw new Error('Employee not found')
    }
    if (employee.deletedAt) {
      throw new Error('Employee is already deleted')
    }

    // Delete profile image when employee is deleted
    if (employee.profileImage) {
      await this.deleteProfileImage(employee.profileImage)
    }

    employee.deletedAt = DateTime.now()
    await employee.save()

    return {
      message: 'Employee deleted successfully',
    }
  }

  async getEmployeeList() {
    return User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .where('isActive', true)
      .select('id', 'name')
      .orderBy('name', 'asc')
  }
}