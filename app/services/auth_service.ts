// app/services/auth_service.ts
import User from '#models/user'
import EmployeeLoginLog from '#models/employee_login_log'
import RedisService from '#services/redis_service'
import SmsService from '#services/sms_service'

export default class AuthService {
  private smsService = new SmsService()

  /**
   * 1. Send OTP & Store in Redis (5 min TTL)
   */
  async sendOtp(mobile: string, role: string) {
    const user = await User.query()
      .where('mobile', mobile)
      .whereNull('deleted_at')
      .first()

    if (!user) {
      throw new Error('User not found with this mobile number')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact administrator.')
    }

    // Role portal validation
    if (role === 'admin' && !['superadmin', 'admin'].includes(user.role)) {
      throw new Error('Access denied: You are not authorized for Admin portal')
    }

    if (role === 'employee' && user.role !== 'employee') {
      throw new Error('Access denied: You are not authorized for Employee portal')
    }

    // 6-digit random OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()

    // ✅ Store in Redis with 5 minutes expiration (300 seconds)
    await RedisService.setOtp(mobile, generatedOtp, 300)

    // ✅ Send SMS via ProactiveSMS API
    await this.smsService.sendOtpSms(mobile, generatedOtp)

    return {
      message: 'OTP sent successfully to your mobile number',
      expiresInSeconds: 300,
    }
  }

  /**
   * 2. Verify OTP directly from Redis & Authenticate
   */
  async verifyOtpAndLogin(data: {
    mobile: string
    otp: string
    role: 'superadmin' | 'admin' | 'employee'
    ip?: string
    userAgent?: string
    latitude?: number
    longitude?: number
  }) {
    const user = await User.query()
      .where('mobile', data.mobile)
      .whereNull('deleted_at')
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    if (data.role === 'admin' && !['superadmin', 'admin'].includes(user.role)) {
      throw new Error('Unauthorized portal access')
    }

    if (data.role === 'employee' && user.role !== 'employee') {
      throw new Error('Unauthorized portal access')
    }

    // ✅ Fetch OTP from Redis
    const cachedOtp = await RedisService.getOtp(data.mobile)

    if (!cachedOtp) {
      throw new Error('OTP has expired or does not exist. Please request a new OTP.')
    }

    if (cachedOtp !== data.otp) {
      throw new Error('Invalid OTP entered')
    }

    // ✅ Delete OTP from Redis on successful verification
    await RedisService.deleteOtp(data.mobile)

    // Log employee coordinates and details
    if (user.role === 'employee') {
      await EmployeeLoginLog.create({
        userId: user.id,
        ip: data.ip || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        userAgent: data.userAgent || null,
      })

      user.ip = data.ip || null
      user.latitude = data.latitude || null
      user.longitude = data.longitude || null
      await user.save()

      await RedisService.addAvailableStaff(user.id)
    }

    const token = await User.accessTokens.create(user)

    return {
      user,
      token,
    }
  }

  async getEmployeeLogs(page = 1, limit = 10, employeeId?: number) {
    const query = EmployeeLoginLog.query()
      .preload('user', (q) => {
        q.select('id', 'name', 'email', 'mobile', 'designation')
      })
      .orderBy('login_at', 'desc')

    if (employeeId) {
      query.where('user_id', employeeId)
    }

    return query.paginate(page, limit)
  }
}