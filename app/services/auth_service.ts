import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthService {
  async login(data: {
    email: string
    password: string
    role: 'superadmin' | 'admin' | 'employee'
  }) {
    const user = await User.findBy('email', data.email)

    if (!user) {
      throw new Error('Invalid email')
    }

    if (!user.isActive) {
      throw new Error('Account is inactive')
    }

    const verify = await hash.verify(user.password, data.password)

    if (!verify) {
      throw new Error('Invalid password')
    }

    /**
     * Role Validation
     */

    if (user.role !== data.role) {
      throw new Error(`You are not authorized to login as ${data.role}`)
    }

    /**
     * Login Rules
     */

    switch (data.role) {
      case 'superadmin':
        if (user.role !== 'superadmin') {
          throw new Error('Only Super Admin can login from Super Admin portal')
        }
        break

      case 'admin':
        if (!['superadmin', 'admin'].includes(user.role)) {
          throw new Error('Only Admin or Super Admin can login from Admin portal')
        }
        break

      case 'employee':
        if (user.role !== 'employee') {
          throw new Error('Only Employee can login from Employee portal')
        }
        break
    }

    const token = await User.accessTokens.create(user)

    return {
      user,
      token,
    }
  }
}