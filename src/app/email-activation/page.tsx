'use server'

import { redirect } from 'next/navigation'
import EmailActivation from './__components/email-activation'
import { auth } from '@/auth'

export default async function EmailActivationPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <EmailActivation />
}
