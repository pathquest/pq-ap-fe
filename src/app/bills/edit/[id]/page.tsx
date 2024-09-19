'use server'

import { ssoUrl } from '@/api/server/common'
import EditBillPosting from '@/app/bills/__components/edit/EditBillPosting'
import { auth } from '@/auth'
import { store } from '@/store/configureStore'
import { redirect } from 'next/navigation'

const EditBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  const { bill } = store.getState()
  const processType = bill.selectedProcessTypeInList

  return (
    <>
      <EditBillPosting 
        processtype={processType}
      />
    </>
  )
}

export default EditBill
