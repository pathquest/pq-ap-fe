import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Typography } from 'pq-ap-lib'
import React from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  handleActionClick?: any
}

const RemoveCreditModal: React.FC<ActionsProps> = ({ onOpen, onClose, handleActionClick }) => {
  return (
    <Modal isOpen={onOpen} onClose={onClose} width='400px'>
      <ModalTitle className='p-5'>
        <span className='text-lg font-bold text-[#333333]'>Credit Availed</span>
        <span className='cursor-pointer' onClick={onClose}>
          <Close variant='medium' />
        </span>
      </ModalTitle>

      <ModalContent className='flex items-center gap-[10px] px-5 py-5'>
        {/* <span>
            <ExclamationOrangeIcon />
          </span> */}
        <Typography type='label' className='font-semibold'>
          Are you sure you want to remove credit?
        </Typography>
      </ModalContent>

      <ModalAction className='flex items-center justify-end gap-3 p-4'>
        <Button
          variant='btn-outline-primary'
          className='flex h-9 w-16 items-center justify-center rounded-full'
          onClick={() => {
            onClose()
            handleActionClick(false)
          }}
        >
          No
        </Button>
        <Button
          variant='btn-primary'
          className='flex h-9 w-16 items-center justify-center rounded-full'
          onClick={() => handleActionClick(true)}
        >
          Yes
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default RemoveCreditModal
