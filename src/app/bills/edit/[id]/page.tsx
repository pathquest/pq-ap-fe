'use server'

import { ssoUrl } from '@/api/server/common'
import EditBillPosting from '@/app/bills/__components/edit/EditBillPosting'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const EditBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return (
    <>
      <EditBillPosting />
    </>
  )
}

export default EditBill
