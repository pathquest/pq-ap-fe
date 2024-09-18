'use server'

import { auth } from '@/auth'
import ListDimentions from './__components/list/ListDimentions'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function DimentionsPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListDimentions />
}
