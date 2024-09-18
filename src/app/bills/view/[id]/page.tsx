'use server'

import ViewBillPosting from '@/app/bills/__components/view/ViewBillPosting'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const ViewBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return (
    <>
      <ViewBillPosting />
    </>
  )
}

export default ViewBill
