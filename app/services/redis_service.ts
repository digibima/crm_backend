import Redis from 'ioredis'
import env from '#start/env'
class RedisService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: env.get('REDIS_PASSWORD'),
    })
  }

  async addAvailableStaff(userId: number) {
    await this.redis.sadd('avl_staff', String(userId))
  }

  async removeAvailableStaff(userId: number) {
    await this.redis.srem('avl_staff', String(userId))
  }

  async isAvailable(userId: number) {
    const exists = await this.redis.sismember(
      'avl_staff',
      String(userId)
    )

    return exists === 1
  }

  async getAvailableStaff() {
    return await this.redis.smembers('avl_staff')
  }
}

export default new RedisService()