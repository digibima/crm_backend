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
    userId: number | string,
    title = "",
    message: string = "",
    taskid: number | null = null
  ) {
    const record = await Notification.create({
      userId: Number(userId),
      title,
      message,
      taskId: taskid,
      isRead: false,
    })
    await redis.publish(
      'notification',
      JSON.stringify({
        id: record.id,
        userId: userId,
        title: title,
        message: message,
        taskid: taskid, 
        taskId: taskid, 
        createdAt: record.createdAt,
      })
    )

    console.log(`[Notification] Saved to DB & broadcasted for User ${userId}`)

    return {
      status: true,
      message: 'Notification queued',
    }
  }
}