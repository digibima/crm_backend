import { defineConfig } from '@adonisjs/auth'
import {
  tokensGuard,
  tokensUserProvider,
} from '@adonisjs/auth/access_tokens'

import type {
  InferAuthenticators,
  InferAuthEvents,
  Authenticators,
} from '@adonisjs/auth/types'

const authConfig = defineConfig({
  default: 'api',

  guards: {
    api: tokensGuard({
      provider: tokensUserProvider({
        model: () => import('#models/user'),
        tokens: 'accessTokens',
      }),
    }),
  },
})

export default authConfig

declare module '@adonisjs/auth/types' {
  interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}

declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}