'use server'

import { auth } from '@/auth'
import ListUsers from './__components/list/ListUsers'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function ManageUsersPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListUsers />
}
