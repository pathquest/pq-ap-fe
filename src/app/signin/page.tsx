'use server'

import { redirect } from 'next/navigation'
import SignInForm from './__components/signin-form'
import { auth } from '@/auth'
import { ssoUrl } from '@/api/server/common'

export default async function SignInPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  }

  if(!session){
    return redirect(`${ssoUrl}/signin`)
  }


  return <SignInForm />
}
