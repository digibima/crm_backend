// app/services/holiday_service.ts
import Holiday from '#models/holiday'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class HolidayService {

  // ========== GET ALL HOLIDAYS ==========
  async getAllHolidays(year?: number) {
    const targetYear = year || DateTime.now().year
    
    const holidays = await Holiday.query()
      .whereRaw('YEAR(holiday_date) = ?', [targetYear])
      .orWhere('is_recurring', true)
      .whereNull('deleted_at')
      .preload('creator', (query) => {
        query.select('id', 'name', 'email')
      })
      .orderBy('holiday_date', 'asc')

    return holidays
  }

  // ========== GET HOLIDAY BY ID ==========
// app/services/holiday_service.ts

async getHolidayById(id: number) {
  // ✅ Validate ID
  const holidayId = Number(id)
  
  if (isNaN(holidayId) || holidayId <= 0) {
    throw new Error('Invalid holiday ID')
  }

  const holiday = await Holiday.query()
    .where('id', holidayId)
    .whereNull('deleted_at')
    .preload('creator', (query) => {
      query.select('id', 'name', 'email')
    })
    .first()

  if (!holiday) {
    throw new Error('Holiday not found')
  }

  return holiday
}

  // ========== CREATE HOLIDAY ==========
  async createHoliday(data: {
    title: string
    holidayDate: string
    description?: string
    type?: 'public' | 'festival' | 'optional'
    isPaid?: boolean
    isRecurring?: boolean
    createdBy?: number
  }) {
    // Check if holiday already exists on this date
    const existing = await Holiday.query()
      .where('holiday_date', data.holidayDate)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new Error(`Holiday already exists on ${data.holidayDate}`)
    }

    const holiday = await Holiday.create({
      title: data.title,
      holidayDate: DateTime.fromISO(data.holidayDate),
      description: data.description || null,
      type: data.type || 'public',
      isPaid: data.isPaid !== undefined ? data.isPaid : true,
      isRecurring: data.isRecurring || false,
      createdBy: data.createdBy || null
    })

    return holiday
  }

  // ========== UPDATE HOLIDAY ==========
  async updateHoliday(id: number, data: {
    title?: string
    holidayDate?: string
    description?: string
    type?: 'public' | 'festival' | 'optional'
    isPaid?: boolean
    isRecurring?: boolean
  }) {
    const holiday = await Holiday.find(id)
    if (!holiday || holiday.deletedAt) {
      throw new Error('Holiday not found')
    }

    // Check if date conflict (if date is being changed)
    if (data.holidayDate && data.holidayDate !== holiday.holidayDate.toISODate()) {
      const existing = await Holiday.query()
        .where('holiday_date', data.holidayDate)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (existing) {
        throw new Error(`Holiday already exists on ${data.holidayDate}`)
      }
    }

    if (data.title) holiday.title = data.title
    if (data.holidayDate) holiday.holidayDate = DateTime.fromISO(data.holidayDate)
    if (data.description !== undefined) holiday.description = data.description
    if (data.type) holiday.type = data.type
    if (data.isPaid !== undefined) holiday.isPaid = data.isPaid
    if (data.isRecurring !== undefined) holiday.isRecurring = data.isRecurring

    await holiday.save()
    return holiday
  }

  // ========== DELETE HOLIDAY ==========
  async deleteHoliday(id: number) {
    const holiday = await Holiday.find(id)
    if (!holiday || holiday.deletedAt) {
      throw new Error('Holiday not found')
    }

    holiday.deletedAt = DateTime.now()
    await holiday.save()

    return { message: 'Holiday deleted successfully' }
  }

  // ========== BULK CREATE HOLIDAYS ==========
  async bulkCreateHolidays(holidays: Array<{
    title: string
    holidayDate: string
    description?: string
    type?: 'public' | 'festival' | 'optional'
    isPaid?: boolean
    isRecurring?: boolean
  }>, createdBy?: number) {
    const created = []
    const errors = []

    for (const holidayData of holidays) {
      try {
        const holiday = await this.createHoliday({
          ...holidayData,
          createdBy
        })
        created.push(holiday)
      } catch (error) {
        errors.push({
          date: holidayData.holidayDate,
          error: error.message
        })
      }
    }

    return {
      created,
      errors,
      total: holidays.length,
      success: created.length,
      failed: errors.length
    }
  }

  // ========== GET HOLIDAYS FOR CALENDAR ==========
// app/services/holiday_service.ts

async getCalendarData(month?: number, year?: number) {
  // ✅ Convert to Number and validate
  const targetMonth = month ? Number(month) : DateTime.now().month
  const targetYear = year ? Number(year) : DateTime.now().year

  // ✅ Validate that they are valid numbers
  if (isNaN(targetMonth) || isNaN(targetYear)) {
    throw new Error('Invalid month or year')
  }

  // Get all holidays for the month
  const holidays = await Holiday.query()
    .whereRaw('MONTH(holiday_date) = ?', [targetMonth])
    .whereRaw('YEAR(holiday_date) = ?', [targetYear])
    .orWhere('is_recurring', true)
    .whereNull('deleted_at')
    .orderBy('holiday_date', 'asc')

  // Get Sundays of the month
  const sundays = this.getSundays(targetMonth, targetYear)

  // Format holidays for calendar
  const holidayList = holidays.map(holiday => ({
    id: holiday.id,
    title: holiday.title,
    date: holiday.holidayDate.toISODate(),
    type: holiday.type,
    isPaid: holiday.isPaid,
    isRecurring: holiday.isRecurring,
    description: holiday.description
  }))

  // Format Sundays
  const sundayList = sundays.map(date => ({
    id: `sunday-${date}`,
    title: 'Sunday',
    date: date,
    type: 'weekend',
    isPaid: true,
    isRecurring: true,
    description: 'Weekly holiday'
  }))

  return {
    month: targetMonth,
    year: targetYear,
    holidays: holidayList,
    sundays: sundayList,
    allHolidays: [...holidayList, ...sundayList]
  }
}

  // ========== CHECK IF DATE IS HOLIDAY ==========
  async isHoliday(date: string): Promise<{ isHoliday: boolean; holiday?: any }> {
    const dateObj = DateTime.fromISO(date)
    
    // Check if it's Sunday
    if (dateObj.weekday === 7) {
      return {
        isHoliday: true,
        holiday: {
          title: 'Sunday',
          type: 'weekend',
          isPaid: true
        }
      }
    }

    // Check if it's a holiday in database
    const holiday = await Holiday.query()
      .where('holiday_date', date)
      .whereNull('deleted_at')
      .first()

    if (holiday) {
      return {
        isHoliday: true,
        holiday: {
          id: holiday.id,
          title: holiday.title,
          type: holiday.type,
          isPaid: holiday.isPaid
        }
      }
    }

    return { isHoliday: false }
  }

  // ========== GET HOLIDAYS IN DATE RANGE ==========
  async getHolidaysInRange(fromDate: string, toDate: string) {
    const holidays = await Holiday.query()
      .whereBetween('holiday_date', [fromDate, toDate])
      .whereNull('deleted_at')
      .orderBy('holiday_date', 'asc')

    // Also get Sundays in range
    const sundays = this.getSundaysInRange(fromDate, toDate)

    return {
      holidays,
      sundays,
      total: holidays.length + sundays.length
    }
  }

  // ========== GET SUNDAYS OF A MONTH ==========
  private getSundays(month: number, year: number): string[] {
    const sundays: string[] = []
    const daysInMonth = DateTime.fromObject({ month, year }).daysInMonth || 30

    for (let day = 1; day <= daysInMonth; day++) {
      const date = DateTime.fromObject({ year, month, day })
      if (date.weekday === 7) { // Sunday
        sundays.push(date.toISODate())
      }
    }

    return sundays
  }

  // ========== GET SUNDAYS IN DATE RANGE ==========
  private getSundaysInRange(fromDate: string, toDate: string): string[] {
    const sundays: string[] = []
    let current = DateTime.fromISO(fromDate)
    const end = DateTime.fromISO(toDate)

    while (current <= end) {
      if (current.weekday === 7) {
        sundays.push(current.toISODate())
      }
      current = current.plus({ days: 1 })
    }

    return sundays
  }
}