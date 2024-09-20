'use server'

import { getLocationDropdown, getProcessDropdown, getStatusDropdown, getVendorDropdown, ssoUrl } from '@/api/server/common'
import ListBillPosting from '@/app/bills/__components/list/ListBillPosting'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const ListBill = async () => {
  const session = await auth()
  const CompanyId = session?.user?.CompanyId

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  // const statusOptions: any = await getStatusDropdown()
  // const processOptions: any = await getProcessDropdown()

  return (
    <>
      <ListBillPosting
        statusOptions={[]}
      />
    </>
  )
}

export default ListBill
