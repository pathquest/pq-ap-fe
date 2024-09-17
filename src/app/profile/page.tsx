'use server'

import { auth } from '@/auth'
import ProfileForm from './__components/profile-form'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ProfileForm />
}
