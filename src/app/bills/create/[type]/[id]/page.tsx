'use server'

import CreateBillPosting from '@/app/bills/__components/create/CreateBillPosting'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const CreateBill = async ({ params }: any) => {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  return (
    <CreateBillPosting
      processtype={params?.type}
      documentId={params.id}
    />
  )
}

export default CreateBill
