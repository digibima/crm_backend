// app/services/company_service.ts
import InsuranceCompany from '#models/insurance_company'
import InsuranceSubCategory from '#models/insurance_sub_category'
import { DateTime } from 'luxon'

export default class CompanyService {
  async create(data: { name: string; subCategoryId: number }) {
    const subCategory = await InsuranceSubCategory.find(data.subCategoryId)
    if (!subCategory || subCategory.deletedAt) {
      throw new Error('Sub category not found')
    }

    const existing = await InsuranceCompany.query()
      .where('name', data.name)
      .where('sub_category_id', data.subCategoryId)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new Error('Company already exists in this sub category')
    }

    const company = new InsuranceCompany()
    company.name = data.name
    company.subCategoryId = data.subCategoryId // Use subCategoryId (camelCase)
    company.isActive = true
    await company.save()

    return company
  }

async getAll() {
  return await InsuranceCompany.query()
    .whereNull('deleted_at')
    .preload('subCategory', (query) => {
      query.preload('category')
    })
    .orderBy('id', 'desc')
}

  async getBySubCategory(subCategoryId: number) {
    return InsuranceCompany.query()
      .where('sub_category_id', subCategoryId)
      .whereNull('deleted_at')
      .where('is_active', true)
      .orderBy('name', 'asc')
  }

  async getById(id: number) {
    const company = await InsuranceCompany.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('subCategory', (query) => {
        query.preload('category')
      })
      .first()

    if (!company) {
      throw new Error('Company not found')
    }

    return company
  }

  async update(id: number, data: { name?: string; subCategoryId?: number; isActive?: boolean }) {
    const company = await InsuranceCompany.find(id)
    if (!company || company.deletedAt) {
      throw new Error('Company not found')
    }

    if (data.subCategoryId) {
      const subCategory = await InsuranceSubCategory.find(data.subCategoryId)
      if (!subCategory || subCategory.deletedAt) {
        throw new Error('Sub category not found')
      }
      company.subCategoryId = data.subCategoryId
    }

    if (data.name) {
      const existing = await InsuranceCompany.query()
        .where('name', data.name)
        .where('sub_category_id', company.subCategoryId)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (existing) {
        throw new Error('Company already exists in this sub category')
      }
      company.name = data.name
    }

    if (data.isActive !== undefined) {
      company.isActive = data.isActive
    }

    await company.save()
    return company
  }

  async delete(id: number) {
    const company = await InsuranceCompany.find(id)
    if (!company || company.deletedAt) {
      throw new Error('Company not found')
    }

    company.deletedAt = DateTime.now()
    await company.save()

    return { message: 'Company deleted successfully' }
  }
}