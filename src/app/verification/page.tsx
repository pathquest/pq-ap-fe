'use server'

import VerificationForm from './__components/VerificationForm'
import './index.css'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function VerificationPage() {
  const session = await auth()

  if (session) {
    return redirect('/products')
  }

  return <VerificationForm />
}
