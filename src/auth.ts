import NextAuth from 'next-auth'
import authConfig from './auth.config'
import axios from 'axios'

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn() {
      return Promise.resolve(true)
    },
    async jwt({ token, user, trigger, session }: any) {
      if (trigger === 'update' && session) {
        token = { ...user, ...session }
        return token
      }

      if (user) {
        token.id = user.id
        token.email = user.email
        token.access_token = user.access_token
        token.refresh_token = user.refresh_token
        token.expires_at = user.expires_at
        token.CompanyId = user.CompanyId || 0
        token.CompanyName = user.CompanyName || ''
        token.AccountingTool = user.AccountingTool || 0
        token.org_id = user.org_id || 0
        token.org_name = user.org_name || ''
        token.user_id = user.user_id || 0
        token.is_admin = user.is_admin || false
        token.is_organization_admin = user.is_organization_admin || false
        return token
      }

      const expiresAt = new Date(token.expires_at).getTime()

      if (Date.now() > expiresAt) {
        if (!token.refresh_token) throw new Error('Missing refresh token')

        try {
          const url = `${process.env.API_SSO}/auth/refreshtoken`
          const response: any = await axios.post(url, {
            accesstoken: token.access_token,
            refreshtoken: token.refresh_token,
          })

          if (response.data.ResponseStatus === 'Success') {
            return {
              ...token,
              access_token: response.data.ResponseData.Token,
              refresh_token: response.data.ResponseData.RefreshToken,
              expires_at: response.data.ResponseData.TokenExpiry,
            }
          }
          if (response.data.ResponseStatus === 'Failure') {
            return { ...token, error: 'RefreshAccessTokenError' as const }
          }
          return
        } catch (error) {
          return { ...token, error: 'RefreshAccessTokenError' as const }
        }
      } else {
        return token
      }
    },
    async session({ session, token, user }: any) {
      if (user && 'error' in user) {
        session.error = user.error
      }

      if (token) {
        session.user.id = token.id || token.sub
        session.user.email = token.email
        session.user.access_token = token.access_token
        session.user.refresh_token = token.refresh_token
        session.user.expires_at = token.expires_at
        session.user.CompanyId = token.CompanyId || 0
        session.user.CompanyName = token.CompanyName || ''
        session.user.AccountingTool = token.AccountingTool || 0
        session.user.org_id = token.org_id || 0
        session.user.org_name = token.org_name || ''
        session.user.user_id = token.user_id || 0
        session.user.is_admin = token.is_admin || false
        session.user.is_organization_admin = token.is_organization_admin || false
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  ...authConfig,
})
