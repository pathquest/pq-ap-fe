'use server'

import { auth } from '@/auth'
import ListApFieldMapping from './__components/list/ListApFieldMapping'
import { redirect } from 'next/navigation'

export default async function ApFieldMappingPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListApFieldMapping />
}
