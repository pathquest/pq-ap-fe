'use server'

import { getProcessDropdown } from '@/api/server/common'

import FileUpload from '@/app/fileupload/__components/FileUpload'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const UploadDocument = async () => {
  const session = await auth()
  const CompanyId = session?.user?.CompanyId

  if (!session) {
    return redirect('/signin')
  }

  const processOptions: any = await getProcessDropdown()

  return (
    <>
      <FileUpload
        processOptions={processOptions}
      />
    </>
  )
}

export default UploadDocument
