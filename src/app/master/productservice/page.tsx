'use server'

import { auth } from '@/auth'
import ListProductService from './__components/list/ListProductService'
import { redirect } from 'next/navigation'

export default async function ProductServicePage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListProductService />
}
