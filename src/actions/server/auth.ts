'use server'

import { ssoUrl } from '@/api/server/common'
import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export async function handleSignInSubmit(formFields: any) {
  try {
    await signIn('credentials', {
      email: formFields.email,
      password: formFields.otp,
      redirect: false,
      redirectTo: `/products`,
    }).then((res) => {
      redirect(res)
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CallbackRouteError') {
        return { error: error?.cause?.err?.message }
      } else if (error.type === 'CredentialsSignin') {
        return { error: 'Invalid credentials!' }
      } else {
        return { error: 'Something went wrong!' }
      }
    }

    throw error
  }
}

export async function handleSignOut() {
  await signOut({ redirect: false }).then((res) => {
    if (res) {
      redirect(`${ssoUrl}/logout`)
    }
  })
}


export async function handleTokenSave(formFields: any) {
  try {
    await signIn('credentials', {
      email: '',
      password: '',
      token: formFields.token,
      expires_at:formFields.expires_at,
      redirect: true,
      redirectTo: `${formFields.isFirstConfig === 'false' ? '/manage/companies' : '/profile'}`
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CallbackRouteError') {
        return { error: error?.cause?.err?.message }
      } else if (error.type === 'CredentialsSignin') {
        return { error: 'Invalid credentials!' }
      } else {
        return { error: 'Something went wrong!' }
      }
    }

    throw error
  }
}
