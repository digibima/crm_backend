// app/services/redis_service.ts
import Redis from 'ioredis'
import env from '#start/env'

class RedisService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: env.get('REDIS_HOST', '127.0.0.1'),
      port: Number(env.get('REDIS_PORT', 6379)),
      password: env.get('REDIS_PASSWORD', undefined),
    })
  }

  // ✅ Make sure ye 3 methods add ho chuke hain:
  async setOtp(mobile: string, otp: string, ttlSeconds = 300) {
    await this.redis.set(`otp:${mobile}`, otp, 'EX', ttlSeconds)
  }

  async getOtp(mobile: string): Promise<string | null> {
    return await this.redis.get(`otp:${mobile}`)
  }

  async deleteOtp(mobile: string) {
    await this.redis.del(`otp:${mobile}`)
  }

  async addAvailableStaff(userId: number) {
    await this.redis.sadd('avl_staff', String(userId))
  }

  async removeAvailableStaff(userId: number) {
    await this.redis.srem('avl_staff', String(userId))
  }

  async isAvailable(userId: number) {
    const exists = await this.redis.sismember('avl_staff', String(userId))
    return exists === 1
  }

  async getAvailableStaff() {
    return await this.redis.smembers('avl_staff')
  }
}

export default new RedisService()