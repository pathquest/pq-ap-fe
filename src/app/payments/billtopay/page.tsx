'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'
import ListBillsToPay from './__components/list/ListBillsToPay'

export default async function BillsToPayPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListBillsToPay />
}
