'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AccountantDashboard from '@/app/practice-dashboard/__components/AccountantDashboard'
import { getOrganizationDropdown } from '@/store/features/accountantDashboard/accountDashboardSlice'

  export default async function AccountantDashboardPage() {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  const organizationOptions: any = await getOrganizationDropdown()

  return (
    <>
      <AccountantDashboard organizationOptions={organizationOptions} sessionData={session}/>
    </>
  )
}