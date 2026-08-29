// app/services/notification_service.ts
import Redis from 'ioredis'
import env from '#start/env'
import Notification from '#models/notification'

const redis = new Redis({
  host: env.get('REDIS_HOST'),
  port: env.get('REDIS_PORT'),
  password: env.get('REDIS_PASSWORD'),
})

export default class NotificationService {
  async sendNotification(
    userId: number | string | null | undefined, // ✅ Allow null/undefined
    title = "",
    message: string = "",
    taskid: number | null = null
  ) {
    // ✅ Validate userId
    if (!userId) {
      console.warn('[Notification] Skipped: userId is null or undefined')
      return {
        status: false,
        message: 'No user ID provided for notification'
      }
    }

    // ✅ Convert to number and validate
    const userIdNumber = Number(userId)
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      console.warn(`[Notification] Skipped: Invalid userId: ${userId}`)
      return {
        status: false,
        message: 'Invalid user ID for notification'
      }
    }

    try {
      const record = await Notification.create({
        userId: userIdNumber,
        title: title || 'Notification',
        message: message || '',
        taskId: taskid,
        isRead: false,
      })

      await redis.publish(
        'notification',
        JSON.stringify({
          id: record.id,
          userId: userIdNumber,
          title: title || 'Notification',
          message: message || '',
          taskId: taskid,
          createdAt: record.createdAt,
        })
      )

      console.log(`[Notification] Saved to DB & broadcasted for User ${userIdNumber}`)

      return {
        status: true,
        message: 'Notification sent successfully',
        data: record
      }
    } catch (error) {
      console.error('[Notification] Error:', error)
      return {
        status: false,
        message: 'Failed to send notification',
        error: error.message
      }
    }
  }
}