'use server'

import { auth } from '@/auth'
import QuickbookAuthSuccess from './__components/quickbook-auth-success'
import { redirect } from 'next/navigation'

export default async function QuickbookAuthSuccessPage() {
  const session = await auth()

  if (session) {
    return redirect('/profile')
  }

  return <QuickbookAuthSuccess session={session} />
}
