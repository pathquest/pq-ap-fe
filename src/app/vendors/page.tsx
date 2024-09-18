'use server'

import { auth } from '@/auth'
import ListVendors from './__components/list/ListVendors'
import { redirect } from 'next/navigation'

export default async function ManageVendorsPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListVendors />
}
