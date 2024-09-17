'use server'

import EditBillsToPay from '@/app/payments/billtopay/__components/edit/EditBillsToPay'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const EditBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return (
    <>
      <EditBillsToPay />
    </>
  )
}

export default EditBill
