// app/services/category_service.ts
import InsuranceCategory from '#models/insurance_category'
import { DateTime } from 'luxon'

export default class CategoryService {
  async create(data: { name: string }) {
    const existing = await InsuranceCategory.findBy('name', data.name)
    if (existing) {
      throw new Error('Category already exists')
    }

    const category = new InsuranceCategory()
    category.name = data.name
    category.isActive = true
    await category.save()

    return category
  }

  async getAll(page = 1, limit = 10) {
    return InsuranceCategory.query()
      .whereNull('deleted_at')
      .preload('subCategories', (query) => {
        query.whereNull('deleted_at').where('is_active', true)
      })
      .paginate(page, limit)
  }

  async getActiveCategories() {
    return InsuranceCategory.query()
      .whereNull('deleted_at')
      .where('is_active', true)
      .orderBy('name', 'asc')
  }

  async getById(id: number) {
    const category = await InsuranceCategory.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('subCategories', (query) => {
        query.whereNull('deleted_at').where('is_active', true)
      })
      .first()

    if (!category) {
      throw new Error('Category not found')
    }

    return category
  }

  async update(id: number, data: { name?: string; isActive?: boolean }) {
    const category = await InsuranceCategory.find(id)
    if (!category || category.deletedAt) {
      throw new Error('Category not found')
    }

    if (data.name) {
      const existing = await InsuranceCategory.query()
        .where('name', data.name)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (existing) {
        throw new Error('Category name already exists')
      }
      category.name = data.name
    }

    if (data.isActive !== undefined) {
      category.isActive = data.isActive
    }

    await category.save()
    return category
  }

  async delete(id: number) {
    const category = await InsuranceCategory.find(id)
    if (!category || category.deletedAt) {
      throw new Error('Category not found')
    }

    category.deletedAt = DateTime.now()
    await category.save()

    return { message: 'Category deleted successfully' }
  }
}