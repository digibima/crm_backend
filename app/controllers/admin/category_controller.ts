// app/controllers/admin/category_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import CategoryService from '#services/category_service'
import { createCategoryValidator, updateCategoryValidator } from '#validators/task_validator'

export default class CategoryController {
  private categoryService = new CategoryService()

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createCategoryValidator)
      const category = await this.categoryService.create(payload)
      
      return response.created({
        status: true,
        message: 'Category created successfully',
        data: category
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
      const categories = await this.categoryService.getAll(page, limit)
      
      return response.ok({
        status: true,
        data: categories
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
      const category = await this.categoryService.getById(Number(params.id))
      
      return response.ok({
        status: true,
        data: category
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
      const payload = await request.validateUsing(updateCategoryValidator)
      const category = await this.categoryService.update(Number(params.id), payload)
      
      return response.ok({
        status: true,
        message: 'Category updated successfully',
        data: category
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
      const result = await this.categoryService.delete(Number(params.id))
      
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

  // Get active categories for dropdown
  async active({ response }: HttpContext) {
    try {
      const categories = await this.categoryService.getActiveCategories()
      
      return response.ok({
        status: true,
        data: categories
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
}