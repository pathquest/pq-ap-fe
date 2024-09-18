import axios from 'axios'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const url = `${process.env.API_SSO}/auth/validateotp`
        const response: any = await axios.post(url, {
          email: credentials.email,
          otp: credentials.password,
        })

        if (response.data.ResponseStatus === 'Success') {
          const user: any = {
            email: credentials.email,
            access_token: response.data.ResponseData.Token,
            refresh_token: response.data.ResponseData.RefreshToken,
            expires_at: response.data.ResponseData.TokenExpiry,
          }
          return user
        }

        if (response.data.ResponseStatus === 'Failure') {
          throw new Error(response.data.Message || 'Invalid credentials')
        }

        return null
      },
    }),
  ],
}

export default authConfig
