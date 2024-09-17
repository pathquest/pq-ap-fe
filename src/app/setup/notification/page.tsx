'use server'

import { auth } from '@/auth'
import ListNotifications from './__components/list/ListNotifications'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListNotifications />
}
