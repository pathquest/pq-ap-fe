'use server'

import { redirect } from 'next/navigation'
import SignUpForm from './__components/signup-form'
import { auth } from '@/auth'
import { ssoUrl } from '@/api/server/common'

export default async function SignUpPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  }  
  if(!session){
    return redirect(`${ssoUrl}/signin`)
  }

  return <SignUpForm />
}
