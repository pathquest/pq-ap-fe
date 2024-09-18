'use server'

import { auth } from '@/auth'
import ListPaymentSetup from './__components/list/ListPaymentSetup'
import { redirect } from 'next/navigation'

export default async function PaymentSetupPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListPaymentSetup />
}