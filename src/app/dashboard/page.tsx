'use server'

import { auth } from '@/auth'
import Dashboard from './__components/list/Dashboard'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <Dashboard />
}
