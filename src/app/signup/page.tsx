'use server'

import { redirect } from 'next/navigation'
import SignUpForm from './__components/signup-form'
import { auth } from '@/auth'

export default async function SignUpPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <SignUpForm />
}
