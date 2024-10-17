'use server'

import { ssoUrl } from '@/api/server/common'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ListFileHistory from './__components/list/ListFileHistory'

const ListBill = async () => {
  const session = await auth()
  // const CompanyId = session?.user?.CompanyId

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  // const userOptions: any = await getUserDropdown(Number(CompanyId))
  // const billNumberOptions: any = await getBillNumberDropdown()
  // const locationOptions: any = await getLocationDropdown(Number(CompanyId))

  return (
    <ListFileHistory />
  )
}

export default ListBill