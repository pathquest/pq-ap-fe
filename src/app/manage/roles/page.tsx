'use server'

import { auth } from '@/auth'
import ListRoles from './__components/list/ListRoles'
import { redirect } from 'next/navigation'

export default async function ManageRolePage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListRoles />
}
