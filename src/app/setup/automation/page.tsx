'use server'

import { auth } from '@/auth'
import ListAutomation from './__components/list/ListAutomation'
import { redirect } from 'next/navigation'

export default async function AutomationPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListAutomation />
}
