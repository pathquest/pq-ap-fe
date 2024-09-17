'use server'

import { getLocationDropdown, getProcessDropdown, getStatusDropdown, getVendorDropdown } from '@/api/server/common'
import ListPossibleDuplication from '@/app/possible-duplication/__components/list/ListPossibleDuplication'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const ListPossibleDuplicationPage = async () => {
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
      <ListPossibleDuplication
        vendorOptions={vendorOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
        processOptions={processOptions}
      />
    </>
  )
}

export default ListPossibleDuplicationPage
