'use server'

import { auth } from '@/auth'
import ListVendorsDuplication from './__components/list/ListVendorsDuplication'
import { redirect } from 'next/navigation'

export default async function VendorsDuplicationPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListVendorsDuplication />
}
