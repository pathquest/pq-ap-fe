'use server'

import { redirect } from 'next/navigation'
import SetNewPasswordForm from './__components/setpassword-form'
import { auth } from '@/auth'

export default async function SetPasswordPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <SetNewPasswordForm />
}
