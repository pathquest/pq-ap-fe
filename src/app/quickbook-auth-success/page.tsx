'use server'

import { auth } from '@/auth'
import QuickbookAuthSuccess from './__components/quickbook-auth-success'
import { redirect } from 'next/navigation'

export default async function QuickbookAuthSuccessPage() {
  const session = await auth()
  const token = session?.user?.access_token

  if (session) {
    return redirect(`/profile?token=${token}`)
  }

  return <QuickbookAuthSuccess session={session} />
}
