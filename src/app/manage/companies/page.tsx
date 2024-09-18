'use server'

import { auth } from '@/auth'
import ListCompanies from './__components/list/ListCompanies'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function ManageCompanyPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListCompanies />
}
