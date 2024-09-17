'use server'

import { redirect } from 'next/navigation'
import ForgotPasswordForm from './__components/forgotpassword-form'
import { auth } from '@/auth'
import { ssoUrl } from '@/api/server/common'

export default async function ForgotPasswordPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  }  
  if(!session){
    return redirect(`${ssoUrl}/signin`)
  }

  return <ForgotPasswordForm />
}
