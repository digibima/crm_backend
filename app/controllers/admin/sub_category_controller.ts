// app/controllers/admin/sub_category_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import SubCategoryService from '#services/sub_category_service'
import { createSubCategoryValidator, updateSubCategoryValidator } from '#validators/task_validator'

export default class SubCategoryController {
  private subCategoryService = new SubCategoryService()

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createSubCategoryValidator)
      const subCategory = await this.subCategoryService.create(payload)
      
      return response.created({
        status: true,
        message: 'Sub category created successfully',
        data: subCategory
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const subCategories = await this.subCategoryService.getAll(page, limit)
      
      return response.ok({
        status: true,
        data: subCategories
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
      const subCategory = await this.subCategoryService.getById(Number(params.id))
      
      return response.ok({
        status: true,
        data: subCategory
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  async getByCategory({ params, response }: HttpContext) {
    try {
      const subCategories = await this.subCategoryService.getByCategory(Number(params.categoryId))
      
      return response.ok({
        status: true,
        data: subCategories
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
      const payload = await request.validateUsing(updateSubCategoryValidator)
      const subCategory = await this.subCategoryService.update(Number(params.id), payload)
      
      return response.ok({
        status: true,
        message: 'Sub category updated successfully',
        data: subCategory
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
      const result = await this.subCategoryService.delete(Number(params.id))
      
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