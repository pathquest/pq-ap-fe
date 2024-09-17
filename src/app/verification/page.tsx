'use server'

import { ssoUrl } from '@/api/server/common'
import VerificationForm from './__components/VerificationForm'
import './index.css'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function VerificationPage() {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  }
  if(!session){
    return redirect(`${ssoUrl}/signin`)
  }

  return <VerificationForm />
}
