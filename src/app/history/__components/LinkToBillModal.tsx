import React from 'react'

import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Typography } from 'pq-ap-lib'

interface LinkToBillModalProps {
    isOpen: boolean
    onClose: () => void,
    onApply: () => void,
    modalTitle: string
    modalContent: React.ReactNode
}

const LinkToBillModal = ({
    isOpen,
    onClose,
    onApply,
    modalTitle,
    modalContent
}: LinkToBillModalProps) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width='32.5%'>
        <ModalTitle>
          <div className='flex flex-col px-4 py-3'>
            <Typography type='h5' className='!font-bold'>
              {modalTitle}
            </Typography>
          </div>

          <div className='p-3' onClick={onClose}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <ModalContent>
          <div className='historyFilter p-4'>{modalContent}</div>
        </ModalContent>

        <ModalAction className={`px-1`}>
          <Button
            className='btn-sm h-9 w-24 mx-2 my-3 text-[14px] rounded-full font-semibold tracking-[0.02em]'
            variant={`btn-outline-primary`}
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            className='btn-sm mx-2 my-3 h-9 w-16 text-[14px] rounded-full font-semibold tracking-[0.02em]'
            variant={`btn-primary`}
            onClick={onApply}
          >
            LINK
          </Button>
        </ModalAction>
      </Modal>
    </>
  )
}

export default LinkToBillModal
