// app/controllers/notification_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class NotificationController {
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      const notifications = await Notification.query()
        .where('userId', user.id)
        .orderBy('createdAt', 'desc')
        .limit(30)

      const unreadCountResult = await Notification.query()
        .where('userId', user.id)
        .where('isRead', false)
        .count('* as total')

      const unreadCount = Number(unreadCountResult[0]?.$extras?.total || 0)

      return response.ok({
        success: true,
        data: notifications,
        unreadCount,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Could not fetch notifications',
        error: error.message,
      })
    }
  }
  async markAllAsRead({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const currentTimestamp = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')

      // Database ke exact column names (snake_case) use karein
      await Notification.query()
        .where('user_id', user.id)
        .where('is_read', 0)
        .update({
          is_read: 1,
          read_at: currentTimestamp,
          updated_at: currentTimestamp,
        })

      return response.ok({
        success: true,
        message: 'All notifications marked as read',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to update notifications',
        error: error.message,
      })
    }
  }
  async markOneAsRead({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const notificationId = params.id

      const notification = await Notification.query()
        .where('id', notificationId)
        .where('userId', user.id)
        .first()

      if (!notification) {
        return response.notFound({
          success: false,
          message: 'Notification not found',
        })
      }

      notification.isRead = true
      notification.readAt = DateTime.now()
      await notification.save()

      return response.ok({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      })
    }
  }
async adminIndex({ response }: HttpContext) {
  try {
    const unreadNotifications = await Notification.query()
      .where('is_read', false)
      .preload('user', (query) => {
        query.select('id', 'name', 'email', 'role', 'profileImage')
      })
      .orderBy('created_at', 'desc')
      .limit(30)
    const employees = await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .where('isActive', true)

    const today = DateTime.now()
    const specialEvents: any[] = []

    for (const emp of employees) {
      if (emp.dob) {
        const dob = DateTime.fromJSDate(new Date(emp.dob))
        if (dob.hasSame(today, 'day') && dob.hasSame(today, 'month')) {
          specialEvents.push({
            id: `dob-${emp.id}-${today.year}`,
            title: '🎂 Birthday Today!',
            message: `Today is ${emp.name}'s birthday. Wish them well!`,
            type: 'birthday',
            date: today.toISODate(),
            employeeId: emp.id,
            isRead: false,
          })
        }
      }
      if (emp.doj) {
        const doj = DateTime.fromJSDate(new Date(emp.doj))
        if (doj.hasSame(today, 'day') && doj.hasSame(today, 'month') && doj.year < today.year) {
          const years = today.year - doj.year
          specialEvents.push({
            id: `doj-${emp.id}-${today.year}`,
            title: '🎉 Work Anniversary!',
            message: `${emp.name} has completed ${years} ${years === 1 ? 'year' : 'years'} at the company today!`,
            type: 'anniversary',
            date: today.toISODate(),
            employeeId: emp.id,
            isRead: false,
          })
        }
      }
    }

    return response.ok({
      success: true,
      data: {
        notifications: unreadNotifications,
        specialEvents: specialEvents,
        totalUnread: unreadNotifications.length + specialEvents.length,
      },
    })
  } catch (error) {
    return response.internalServerError({
      success: false,
      message: 'Could not fetch admin notifications',
      error: error.message,
    })
  }
}
}