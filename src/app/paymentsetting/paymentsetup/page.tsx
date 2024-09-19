'use server'

import { auth } from '@/auth'
import ListPaymentSetup from './__components/list/ListPaymentSetup'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function PaymentSetupPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListPaymentSetup />
}