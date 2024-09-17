'use server'

import { redirect } from 'next/navigation'
import SignInForm from './__components/signin-form'
import { auth } from '@/auth'

export default async function SignInPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <SignInForm />
}
