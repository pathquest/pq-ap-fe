'use server'

import ViewApprovals from '@/app/approvals/__components/view/ViewApprovals'
import { auth } from '@/auth'
import { store } from '@/store/configureStore'
import { redirect } from 'next/navigation'

const ViewApprovalsPage = async ({ params }: { params: { id: string } }) => {
  const session = await auth()

  if (!session) {
    return redirect('/signin')
  }

  const { bill } = store.getState()
  const processType = bill.selectedProcessTypeInList

  return (
    <>
      <ViewApprovals
        processtype={processType}
      />
    </>
  )
}

export default ViewApprovalsPage
