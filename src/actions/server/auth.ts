'use server'

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
  await signOut({ redirect: false, redirectTo: '/signin' }).then((res) => {
    if (res) {
      redirect(res.redirect)
    }
  })
}
