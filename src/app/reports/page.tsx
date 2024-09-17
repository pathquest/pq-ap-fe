'use server'

import { auth } from '@/auth'
import ListReports from './__components/list/ListReports'
import { redirect } from 'next/navigation'
import { getLocationDropdown, getTermDropdown, getVendorDropdown } from '@/api/server/common'

export default async function ReportsPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }
  
  return (
    <>
      <ListReports />
    </>
  )
}
