import Redis from 'ioredis'
import env from '#start/env'
const redis = new Redis({
  host: env.get('REDIS_HOST'),
  port: env.get('REDIS_PORT'),
  password: env.get('REDIS_PASSWORD'),
})

export default redis