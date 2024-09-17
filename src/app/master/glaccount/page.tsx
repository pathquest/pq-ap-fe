'use server'

import { auth } from '@/auth'
import ListGLAccount from './__components/list/ListGLAccount'
import { redirect } from 'next/navigation'

export default async function GLAccountPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListGLAccount />
}
