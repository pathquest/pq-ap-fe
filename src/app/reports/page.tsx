'use server'

import { ssoUrl } from '@/api/server/common'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ListReports from './__components/list/ListReports'

export default async function ReportsPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return (
    <ListReports />
  )
}
