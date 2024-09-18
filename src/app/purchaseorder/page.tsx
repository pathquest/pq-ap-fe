'use server'

import { auth } from '@/auth'
import ListPurchaseOrder from './__components/list/ListPurchaseOrder'
import { redirect } from 'next/navigation'

export default async function PurchaseOrderPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListPurchaseOrder />
}
