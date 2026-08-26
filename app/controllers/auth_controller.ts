// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { sendOtpValidator, verifyOtpValidator } from '#validators/otp_validator'
import AuthService from '#services/auth_service'
import User from '#models/user'
import RedisService from '#services/redis_service'

export default class AuthController {
  private authService = new AuthService()

  async sendOtp({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(sendOtpValidator)
      const data = await this.authService.sendOtp(payload.mobile, payload.role)

      return response.ok({
        status: true,
        message: data.message,
        data,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message || 'Failed to send OTP',
      })
    }
  }

  async verifyOtp({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(verifyOtpValidator)
      const ip = request.ip()
      const userAgent = request.header('user-agent')

      const data = await this.authService.verifyOtpAndLogin({
        ...payload,
        ip,
        userAgent,
      })

      return response.ok({
        status: true,
        message: 'Login successful',
        data,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message || 'OTP verification failed',
      })
    }
  }

  async getLoginLogs({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const employeeId = request.input('employeeId') ? Number(request.input('employeeId')) : undefined

      const logs = await this.authService.getEmployeeLogs(page, limit, employeeId)

      return response.ok({
        status: true,
        data: logs,
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message || 'Failed to fetch logs',
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ status: false, message: 'User not authenticated' })
      }

      if (user.role === 'employee') {
        await RedisService.removeAvailableStaff(user.id)
      }

      const token = user.currentAccessToken
      if (token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.ok({ status: true, message: 'Logged out successfully' })
    } catch (error: any) {
      return response.badRequest({ status: false, message: error.message || 'Logout failed' })
    }
  }
}