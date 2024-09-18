'use server'

import { redirect } from 'next/navigation'
import ForgotConfirm from './__components/forgotconfirm'
import { auth } from '@/auth'

export default async function ForgotConfirmPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <ForgotConfirm />
}
