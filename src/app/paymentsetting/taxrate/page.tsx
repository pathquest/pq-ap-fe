'use server'

import { auth } from '@/auth'
import ListTaxRate from './__components/list/ListTaxRate'
import { redirect } from 'next/navigation'

export default async function TaxRatePage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return <ListTaxRate />
}
