'use server'

import { auth } from '@/auth'
import AuthSuccess from './__components/auth-success'
import { redirect } from 'next/navigation'

export default async function AuthSuccessPage() {
  const session = await auth()
  const token = session?.user?.access_token

  if (session) {
    return redirect(`/profile?token=${token}`)
  }

  return <AuthSuccess session={session} />
}
