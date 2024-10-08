import axios from 'axios'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        
        const user: any = {
          access_token: credentials.token,
          expires_at: credentials.expires_at,
          refresh_token: credentials.refresh_token
        }
        return user
      },
    }),
  ],
}

export default authConfig
