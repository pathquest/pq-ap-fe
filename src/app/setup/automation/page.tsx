'use server'

import { auth } from '@/auth'
import ListAutomation from './__components/list/ListAutomation'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function AutomationPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListAutomation />
}
