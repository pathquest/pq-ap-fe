'use server'

import { auth } from '@/auth'
import ListCurrency from './__components/list/ListCurrency'
import { redirect } from 'next/navigation'

export default async function CurrencyPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListCurrency />
}
