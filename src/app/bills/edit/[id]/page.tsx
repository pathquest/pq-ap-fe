'use server'

import EditBillPosting from '@/app/bills/__components/edit/EditBillPosting'
import { auth } from '@/auth'
import { store } from '@/store/configureStore'
import { redirect } from 'next/navigation'

const EditBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
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
