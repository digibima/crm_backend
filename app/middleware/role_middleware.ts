import type { HttpContext } from '@adonisjs/core/http'

export default class RoleMiddleware {

  async handle(
    ctx: HttpContext,
    next: () => Promise<void>,
    options: {
      roles: string[]
    }
  ) {

    const user = ctx.auth.user

    if (!user) {

      return ctx.response.unauthorized({
        message: 'Unauthorized'
      })

    }

    if (!options.roles.includes(user.role)) {

      return ctx.response.forbidden({
        message: 'Permission Denied'
      })

    }

    await next()

  }

}