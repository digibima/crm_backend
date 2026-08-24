// app/controllers/admin/company_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import CompanyService from '#services/company_service'
import { createCompanyValidator, updateCompanyValidator } from '#validators/task_validator'

export default class CompanyController {
  private companyService = new CompanyService()

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createCompanyValidator)
      const company = await this.companyService.create(payload)
      
      return response.created({
        status: true,
        message: 'Company created successfully',
        data: company
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

async index({ response }: HttpContext) {
  try {
    const companies = await this.companyService.getAll()

    return response.ok({
      status: true,
      data: companies
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
      const company = await this.companyService.getById(Number(params.id))
      
      return response.ok({
        status: true,
        data: company
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async getBySubCategory({ params, response }: HttpContext) {
    try {
      const companies = await this.companyService.getBySubCategory(Number(params.subCategoryId))
      
      return response.ok({
        status: true,
        data: companies
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
      const payload = await request.validateUsing(updateCompanyValidator)
      const company = await this.companyService.update(Number(params.id), payload)
      
      return response.ok({
        status: true,
        message: 'Company updated successfully',
        data: company
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
      const result = await this.companyService.delete(Number(params.id))
      
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
}