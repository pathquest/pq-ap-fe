'use server'

import { auth } from '@/auth'
import ListCompanies from './__components/list/ListCompanies'
import { redirect } from 'next/navigation'

export default async function ManageCompanyPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListCompanies session={session} />
}
