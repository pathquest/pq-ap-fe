'use server'

import { auth } from '@/auth'
import ListPaymentMethod from './__components/list/ListPaymentMethod'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function PaymentMethodPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListPaymentMethod />
}
