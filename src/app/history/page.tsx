'use server'

import { getBillNumberDropdown, getLocationDropdown, getUserDropdown } from '@/api/server/common'
import ListFileHistory from './__components/list/ListFileHistory'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const ListBill = async () => {
  const session = await auth()
  const CompanyId = session?.user?.CompanyId

  if (!session) {
    return redirect('/signin')
  }

  const userOptions: any = await getUserDropdown(Number(CompanyId))
  const billNumberOptions: any = await getBillNumberDropdown()
  const locationOptions: any = await getLocationDropdown(Number(CompanyId))

  return (
    <>
      <ListFileHistory
        userOptions={userOptions}
        billNumberOptions={billNumberOptions}
        locationOptions={locationOptions}
      />
    </>
  )
}

export default ListBill