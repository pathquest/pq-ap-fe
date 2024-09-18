import React, { lazy } from 'react'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Typography } from 'pq-ap-lib'

const WarningIcon = lazy(() => import('@/assets/Icons/FieldMapping/WarningIcon'))

interface DrawerProps {
  onOpen: boolean
  onClose: () => void
}

const ErrorModal: React.FC<DrawerProps> = ({ onOpen, onClose }) => {
  return (
    <Modal isOpen={onOpen} onClose={onClose} size='md'>
      <ModalTitle className='py-3 pl-4 pr-1 font-bold'>
        <div>
          <Typography className='text-[18px] font-semibold'>Error</Typography>
        </div>
        <div onClick={onClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent>
        <div className='flex flex-col p-5'>
          <div className='flex w-full items-center justify-start'>
            <WarningIcon />
          </div>
          <div className=''>
            <Typography type='h5' className='flex w-full pb-2 pt-5'>
              Default and Mandatory fields cannot be removed from the layout. These fields are necessary for processing accounts
              payable correctly. Please keep all default and required fields in place.
            </Typography>
          </div>
        </div>
      </ModalContent>
      <ModalAction>
        <Button variant='btn-primary' className='btn-md my-[15px] mr-4 rounded-full' onClick={onClose}>
          <Typography className='py-[10px] !text-[14px] font-semibold uppercase laptop:px-[17px]'>Continue</Typography>
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default ErrorModal