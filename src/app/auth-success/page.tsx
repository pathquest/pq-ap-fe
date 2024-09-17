'use server'

import { auth } from '@/auth'
import AuthSuccess from './__components/auth-success'
import { redirect } from 'next/navigation'

export default async function AuthSuccessPage() {
  const session = await auth()

  if (session) {
    return redirect('/profile')
  }

  return <AuthSuccess session={session} />
}
