import Redis from 'ioredis'
import env from '#start/env'
const redis = new Redis({
  host: env.get('REDIS_HOST'),
  port: env.get('REDIS_PORT'),
  password: env.get('REDIS_PASSWORD'),
})

export default class NotificationService {
  async sendNotification(userId: number | string, title = "", message: string = "", taskid: number | null = null) {
    await redis.publish(
      'notification',
      JSON.stringify({
        userId,
        title,
        message,
        taskid
      })
    )
    console.log("Notification sent");
    return {
      status: true,
      message: 'Notification queued',
    }
  }
}