'use server'

import { redirect } from 'next/navigation'
import EmailActivation from './__components/email-activation'
import { auth } from '@/auth'
import { ssoUrl } from '@/api/server/common'

export default async function EmailActivationPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  }

  if(!session){
    return redirect(`${ssoUrl}/signin`)
  }

  return <EmailActivation />
}
