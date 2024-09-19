'use server'

import { ssoUrl } from '@/api/server/common'
import CreateBillPosting from '@/app/bills/__components/create/CreateBillPosting'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const CreateBill = async ({ params }: any) => {
  const session = await auth()

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return (
    <CreateBillPosting
      processtype={params?.type}
      documentId={params.id}
    />
  )
}

export default CreateBill
