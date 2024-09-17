'use server'

import { auth } from '@/auth'
import ListCurrency from './__components/list/ListCurrency'
import { redirect } from 'next/navigation'
import { ssoUrl } from '@/api/server/common'

export default async function CurrencyPage() {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ListCurrency />
}
