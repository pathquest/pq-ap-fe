'use server'

import { redirect } from 'next/navigation'
import ForgotConfirm from './__components/forgotconfirm'
import { auth } from '@/auth'
import { ssoUrl } from '@/api/server/common'

export default async function ForgotConfirmPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  }

  if(!session){
    return redirect(`${ssoUrl}/signin`)
  }

  return <ForgotConfirm />
}
