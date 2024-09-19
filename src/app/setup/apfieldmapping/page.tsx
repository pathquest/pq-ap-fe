'use server'

import { auth } from '@/auth'
import ListApFieldMapping from './__components/list/ListApFieldMapping'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function ApFieldMappingPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListApFieldMapping />
}
