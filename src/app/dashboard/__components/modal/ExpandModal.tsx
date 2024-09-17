import React from 'react'

import { Modal, ModalTitle, Close, ModalContent, Typography, ModalAction, Button } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'

const ExpandModal = ({ onOpen, onClose, modalTitle, modalContent }: any) => {
  return (
    <Modal isOpen={onOpen} onClose={onClose} width='95vw' Height='90vh'>
      <ModalTitle>
        <div className='flex flex-col px-4 py-3'>
          <Typography type='h5' className='!font-bold !tracking-[0.02em]'>
            {modalTitle}
          </Typography>
        </div>

        <div className='p-3' onClick={onClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='overflow-auto h-[80vh] custom-scroll'>
        <div className='p-4'>{modalContent}</div>
      </ModalContent>
    </Modal>
  )
}

export default ExpandModal