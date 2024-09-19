'use server'

import { auth } from '@/auth'
import ListTaxRate from './__components/list/ListTaxRate'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function TaxRatePage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListTaxRate />
}
