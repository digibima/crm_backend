// app/services/sub_category_service.ts
import InsuranceSubCategory from '#models/insurance_sub_category'
import InsuranceCategory from '#models/insurance_category'
import { DateTime } from 'luxon'

export default class SubCategoryService {
  async create(data: { name: string; categoryId: number }) {
    const category = await InsuranceCategory.find(data.categoryId)
    if (!category || category.deletedAt) {
      throw new Error('Category not found')
    }

    const existing = await InsuranceSubCategory.query()
      .where('name', data.name)
      .where('category_id', data.categoryId)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new Error('Sub category already exists in this category')
    }

    const subCategory = new InsuranceSubCategory()
    subCategory.name = data.name
    subCategory.categoryId = data.categoryId // Use categoryId (camelCase)
    subCategory.isActive = true
    await subCategory.save()

    return subCategory
  }

  async getAll(page = 1, limit = 10) {
    return InsuranceSubCategory.query()
      .whereNull('deleted_at')
      .preload('category')
      .preload('companies', (query) => {
        query.whereNull('deleted_at').where('is_active', true)
      })
      .paginate(page, limit)
  }

  async getByCategory(categoryId: number) {
    return InsuranceSubCategory.query()
      .where('category_id', categoryId)
      .whereNull('deleted_at')
      .where('is_active', true)
      .preload('companies', (query) => {
        query.whereNull('deleted_at').where('is_active', true)
      })
      .orderBy('name', 'asc')
  }

  async getById(id: number) {
    const subCategory = await InsuranceSubCategory.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('category')
      .preload('companies', (query) => {
        query.whereNull('deleted_at').where('is_active', true)
      })
      .first()

    if (!subCategory) {
      throw new Error('Sub category not found')
    }

    return subCategory
  }

  async update(id: number, data: { name?: string; categoryId?: number; isActive?: boolean }) {
    const subCategory = await InsuranceSubCategory.find(id)
    if (!subCategory || subCategory.deletedAt) {
      throw new Error('Sub category not found')
    }

    if (data.categoryId) {
      const category = await InsuranceCategory.find(data.categoryId)
      if (!category || category.deletedAt) {
        throw new Error('Category not found')
      }
      subCategory.categoryId = data.categoryId
    }

    if (data.name) {
      const existing = await InsuranceSubCategory.query()
        .where('name', data.name)
        .where('category_id', subCategory.categoryId)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (existing) {
        throw new Error('Sub category already exists in this category')
      }
      subCategory.name = data.name
    }

    if (data.isActive !== undefined) {
      subCategory.isActive = data.isActive
    }

    await subCategory.save()
    return subCategory
  }

  async delete(id: number) {
    const subCategory = await InsuranceSubCategory.find(id)
    if (!subCategory || subCategory.deletedAt) {
      throw new Error('Sub category not found')
    }

    subCategory.deletedAt = DateTime.now()
    await subCategory.save()

    return { message: 'Sub category deleted successfully' }
  }
}