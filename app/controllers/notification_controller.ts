// app/controllers/notification_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

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
}