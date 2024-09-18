'use server'

import { ssoUrl } from '@/api/server/common'
import EditBillsToPay from '@/app/payments/billtopay/__components/edit/EditBillsToPay'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const EditBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return (
    <>
      <EditBillsToPay />
    </>
  )
}

export default EditBill
