'use server'

import { ssoUrl } from '@/api/server/common'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ViewReportBill from '../../__components/view/ViewReportBill'

const ViewBill = async () => {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return (
    <>
      <ViewReportBill />
    </>
  )
}

export default ViewBill
