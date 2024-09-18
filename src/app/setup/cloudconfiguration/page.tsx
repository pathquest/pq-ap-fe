'use server'

import { auth } from '@/auth'
import ListCloudConfiguration from './__components/list/ListCloudConfiguration'
import { redirect } from 'next/navigation'

export default async function CloudConfigurationPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListCloudConfiguration />
}
