'use server'

import { redirect } from 'next/navigation'
import SetNewPasswordForm from './__components/setpassword-form'
import { auth } from '@/auth'
import { ssoUrl } from '@/api/server/common'

export default async function SetPasswordPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  } else {
    return redirect(`${ssoUrl}/signin`)
  }

  return <SetNewPasswordForm />
}
