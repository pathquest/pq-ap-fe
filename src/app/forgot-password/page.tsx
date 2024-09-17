'use server'

import { redirect } from 'next/navigation'
import ForgotPasswordForm from './__components/forgotpassword-form'
import { auth } from '@/auth'

export default async function ForgotPasswordPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <ForgotPasswordForm />
}
