'use server'

import { auth } from '@/auth'
import ListPurchaseOrder from './__components/list/ListPurchaseOrder'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function PurchaseOrderPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListPurchaseOrder />
}
