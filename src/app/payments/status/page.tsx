'use server'

import { auth } from '@/auth'
import ListPaymentStatus from './__components/list/ListPaymentStatus'
import { redirect } from 'next/navigation'

export default async function PaymentStatusPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListPaymentStatus />
}
