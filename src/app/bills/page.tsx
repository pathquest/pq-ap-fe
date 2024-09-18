'use server'

import { getLocationDropdown, getProcessDropdown, getStatusDropdown, getVendorDropdown } from '@/api/server/common'
import ListBillPosting from '@/app/bills/__components/list/ListBillPosting'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const ListBill = async () => {
  const session = await auth()
  const CompanyId = session?.user?.CompanyId

  if (!session) {
    return redirect('/signin')
  }

  const vendorOptions: any = await getVendorDropdown(Number(CompanyId))
  const statusOptions: any = await getStatusDropdown()
  const locationOptions: any = await getLocationDropdown(Number(CompanyId))
  const processOptions: any = await getProcessDropdown()

  return (
    <>
      <ListBillPosting
        vendorOptions={vendorOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
        processOptions={processOptions}
      />
    </>
  )
}

export default ListBill
