'use server'

import { auth } from '@/auth'
import ProfileForm from './__components/profile-form'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ProfileForm session={session}/>
}
