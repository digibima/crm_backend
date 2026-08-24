import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/login_validator'
import AuthService from '#services/auth_service'
import User from '#models/user'
import RedisService from '#services/redis_service'

export default class AuthController {

  private authService = new AuthService()
  async login({ request, response }: HttpContext) {
    //return "kjkj";
    try {
      const payload = await request.validateUsing(loginValidator)
      const data = await this.authService.login(payload)
      if (data.user.role === 'employee') {
        await RedisService.addAvailableStaff(data.user.id)
      }
      return response.ok({
        status: true,
        message: 'Login Success',
        data
      })

    } catch (error) {
      return response.badRequest({
        status: false,
        message: error instanceof Error ? error.message : 'Something went wrong',
      })
    }

  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.unauthorized({
          status: false,
          message: 'User not authenticated'
        })
      }
      if (user.role === 'employee') {
        await RedisService.removeAvailableStaff(user.id)
      }

      // Get the current token
      const token = user.currentAccessToken

      if (token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.ok({
        status: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      return response.badRequest({
        status: false,
        message: error instanceof Error ? error.message : 'Failed to logout'
      })
    }
  }

  /**
   * Logout from all devices
   * POST /api/logout-all
   */
  //   async logoutAll({ auth, response }: HttpContext) {
  //     try {
  //       const user = auth.user

  //       if (!user) {
  //         return response.unauthorized({
  //           status: false,
  //           message: 'User not authenticated'
  //         })
  //       }

  //       // Delete all tokens for the user
  //       await User.accessTokens.delete(user)

  //       return response.ok({
  //         status: true,
  //         message: 'Logged out from all devices successfully'
  //       })
  //     } catch (error) {
  //       return response.badRequest({
  //         status: false,
  //         message: error instanceof Error ? error.message : 'Failed to logout from all devices'
  //       })
  //     }
  //   }

  async testRedis({ response }: HttpContext) {
    try {
      const data = await RedisService.getAvailableStaff()

      return response.ok({
        status: true,
        redis_key: 'avl_staff',
        count: data.length,
        data,
      })
    } catch (error) {
      return response.internalServerError({
        status: false,
        message: error instanceof Error ? error.message : 'Something went wrong',
      })
    }
  }
}