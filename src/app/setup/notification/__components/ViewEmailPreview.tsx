import React, { useEffect, useState } from 'react'
import { Close, Loader, Modal, ModalContent, ModalTitle, Typography } from 'pq-ap-lib'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getCurrentYear } from '@/data/notification'
import { useAppDispatch } from '@/store/configureStore'
import { getEmailTemplate } from '@/store/features/notification/notificationSlice'

interface EmailPreviewProps {
  matrixId: number
  isViewOpen: boolean
  onViewClose: () => void
}

const ViewEmailPreview: React.FC<EmailPreviewProps> = ({ matrixId, isViewOpen, onViewClose }) => {
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<any>(null)
  const [initialEmailTemplate, setInitialEmailTemplate] = useState<string>('')

  // Get Email Template Api
  const toGetEmailTemplate = async () => {
    setIsLoading(true)
    const params = {
      MatrixId: matrixId,
    }
    performApiAction(
      dispatch,
      getEmailTemplate,
      params,
      (responseData: any) => {

        const doc = new DOMParser().parseFromString(responseData.Template, 'text/html')
        const imgElement = doc.querySelector('img')
        if (imgElement) {
          const src = imgElement.getAttribute('src')
          setImagePreview(src)
        }
        let modifiedTemplate = responseData.Template.replace(/<img[^>]*>/g, '')
        modifiedTemplate = modifiedTemplate
          .replace(/##AccountNumber##/g, '100000001')
          .replace(/##ActionBy##/g, 'PQR')
          .replace(/##ActionUrl##/g, '')
          .replace(/##ApproverName##/g, 'XYZ')
          .replace(/##BillNumber##/g, '#3457896')
          .replace(/##CompanyName##/g, 'Demo Company')
          .replace(/##Count##/g, '10')
          .replace(/##User##/g, 'ABC')
          .replace(/##UserName##/g, 'Demo User')
        setInitialEmailTemplate(modifiedTemplate)
        setIsLoading(false)
      },
      () => {
        // ErrorData
        setIsLoading(false)
      }
    )
  }

  useEffect(() => {
    toGetEmailTemplate()
  }, [])

  return (
    <Modal isOpen={isViewOpen} onClose={onViewClose} width='528' Height='92%'>
      <ModalTitle className='h-[64px] px-5'>
        <div className='flex flex-col items-center'>
          <Typography type='h5' className='!text-base !font-bold !tracking-[0.02em] !text-darkCharcoal'>
            Preview Email
          </Typography>
        </div>

        <div className='mt-1.5' onClick={onViewClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent>
        <div className='flex flex-col'>
          <div className='flex h-20 w-full items-center justify-center bg-[#F6F6F6]'>
            {imagePreview && (
              <div className='mx-4 mb-4 flex h-16 w-36 items-center justify-center overflow-hidden'>
                <img src={imagePreview} alt='logo' width={150} height={250} />
              </div>
            )}
          </div>
          <div className='mt-2 pt-[30px]'>
            {isLoading ? (
              <div className='h-[38vh] flex justify-center items-center'>
                <Loader size='sm' helperText />
              </div>
            ) : (
              <div
                className='h-[38vh] w-full overflow-y-auto break-all px-8 font-proxima'
                dangerouslySetInnerHTML={{ __html: initialEmailTemplate }}
              />
            )}
            <div className='flex items-center sticky h-[200px] flex-col justify-center gap-1 bg-darkSmoke px-16 py-2'>
              <label className='font-proxima text-[10.31px] tracking-[0.02em] text-darkCharcoal leading-tight'>
                <b>Attention</b>: This is a system generated email. We request you not to reply to this email. The information in this
                email is confidential and may be legally privileged. It is intended solely for the intended recipient. Access to this
                email by anyone other than the intended recipient is unauthorized. In the event you have received this email by
                mistake you are requested to immediately inform Support Team of the same by forwarding this mail; you should not copy
                or use it for any purpose, nor disclose its contents to any other person and you are required to delete it from your
                system permanently.
              </label>
              <div className='items-center flex justify-center'>
                <Typography className='text-darkCharcoal'>{getCurrentYear} © <label className='text-primary underline'>PathQuest</label></Typography>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default ViewEmailPreview
