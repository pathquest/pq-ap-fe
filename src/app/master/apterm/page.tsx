'use server'

import { auth } from '@/auth'
import ListApTerm from './__components/list/ListAPTerm'
import { redirect } from 'next/navigation'

export default async function ApTermPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListApTerm />
}
