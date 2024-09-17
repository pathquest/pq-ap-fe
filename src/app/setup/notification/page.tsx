'use server'

import { auth } from '@/auth'
import ListNotifications from './__components/list/ListNotifications'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function NotificationsPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListNotifications />
}
