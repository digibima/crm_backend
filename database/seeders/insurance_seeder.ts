// database/seeders/insurance_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import InsuranceCategory from '#models/insurance_category'
import InsuranceSubCategory from '#models/insurance_sub_category'
import InsuranceCompany from '#models/insurance_company'

export default class extends BaseSeeder {
  async run() {
    // Create Categories
    const categories = {
      health: await InsuranceCategory.create({ name: 'Health', isActive: true }),
      life: await InsuranceCategory.create({ name: 'Life', isActive: true }),
      motor: await InsuranceCategory.create({ name: 'Motor', isActive: true }),
      sme: await InsuranceCategory.create({ name: 'SME', isActive: true }),
      mutualFunds: await InsuranceCategory.create({ name: 'Mutual Funds', isActive: true }),
    }

    // Create Sub Categories
    const subCategories = {
      // Health
      healthPersonal: await InsuranceSubCategory.create({
        name: 'Personal Accident',
        categoryId: categories.health.id,
        isActive: true
      }),
      
      // Life
      term: await InsuranceSubCategory.create({
        name: 'Term',
        categoryId: categories.life.id,
        isActive: true
      }),
      saving: await InsuranceSubCategory.create({
        name: 'Saving',
        categoryId: categories.life.id,
        isActive: true
      }),
      
      // Motor
      twoWheeler: await InsuranceSubCategory.create({
        name: '2 Wheeler',
        categoryId: categories.motor.id,
        isActive: true
      }),
      fourWheeler: await InsuranceSubCategory.create({
        name: '4 Wheeler',
        categoryId: categories.motor.id,
        isActive: true
      }),
      gccv: await InsuranceSubCategory.create({
        name: 'GCCV',
        categoryId: categories.motor.id,
        isActive: true
      }),
      pccv: await InsuranceSubCategory.create({
        name: 'PCCV',
        categoryId: categories.motor.id,
        isActive: true
      }),
      
      // SME
      fire: await InsuranceSubCategory.create({
        name: 'Fire',
        categoryId: categories.sme.id,
        isActive: true
      }),
      ghi: await InsuranceSubCategory.create({
        name: 'GHI',
        categoryId: categories.sme.id,
        isActive: true
      }),
      gpa: await InsuranceSubCategory.create({
        name: 'GPA',
        categoryId: categories.sme.id,
        isActive: true
      }),
      marine: await InsuranceSubCategory.create({
        name: 'Marine',
        categoryId: categories.sme.id,
        isActive: true
      }),
      solar: await InsuranceSubCategory.create({
        name: 'Solar',
        categoryId: categories.sme.id,
        isActive: true
      }),
      indemnity: await InsuranceSubCategory.create({
        name: 'Indemnity',
        categoryId: categories.sme.id,
        isActive: true
      }),
      
      // Mutual Funds
      sip: await InsuranceSubCategory.create({
        name: 'SIP',
        categoryId: categories.mutualFunds.id,
        isActive: true
      }),
      lumpSum: await InsuranceSubCategory.create({
        name: 'Lump Sum',
        categoryId: categories.mutualFunds.id,
        isActive: true
      }),
    }

    // Create Companies
    await InsuranceCompany.createMany([
      // Life - Term
      { name: 'HDFC Life', subCategoryId: subCategories.term.id, isActive: true },
      { name: 'LIC', subCategoryId: subCategories.term.id, isActive: true },
      { name: 'Bandhan Life', subCategoryId: subCategories.term.id, isActive: true },
      
      // Life - Saving
      { name: 'HDFC Life', subCategoryId: subCategories.saving.id, isActive: true },
      { name: 'LIC', subCategoryId: subCategories.saving.id, isActive: true },
      { name: 'Bandhan Life', subCategoryId: subCategories.saving.id, isActive: true },
    ])
  }
}