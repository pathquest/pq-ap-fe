import { Typography } from '@material-ui/core'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Radio } from 'pq-ap-lib'
import React, { useState } from 'react'

interface DeleteModalProps {
  isModalOpen: boolean
  modalClose: () => void
  handleSubmit?: (isChecked: number) => void
  process: string
  field: any
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isModalOpen, modalClose, handleSubmit, process, field }) => {
  const [isChecked, setIsChecked] = useState<number>(1)

  const clearData = () => {
    setIsChecked(1)
    modalClose()
  }

  const handleYesClick = () => {
    handleSubmit && handleSubmit(isChecked)
    clearData()
  }

  return (
    <Modal isOpen={isModalOpen} onClose={clearData} size='md' noneOutSideClicked>
      <ModalTitle className='py-3 pl-4 pr-1 font-bold'>
        <Typography className='!font-bold'>Remove</Typography>
        <div onClick={clearData}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent>
        <div className='p-4'>
          <Typography className='text-[16px]'>Are you sure you want to delete this custom field?</Typography>
          {field?.IsRequiredForAccountPayable && field?.IsRequiredForAccountAdjustment || field?.DisplayForAccountPayable && field?.DisplayForAccountAdjustment ? (
            <div className='-ml-2 mt-4 mb-2.5'>
              <div className='flex w-full'>
                <Radio
                  id='forOnly'
                  name='mandtory'
                  className='text-[14px]'
                  label={`Only ${process === '2' ? 'Account Adjustment ' : 'Account Payable '}`}
                  onChange={(e: any) => setIsChecked(1)}
                  defaultChecked
                />
                <Radio id='forBoth' name='mandtory' className='text-[14px]' label='Both' onChange={(e: any) => setIsChecked(2)} />
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </ModalContent>

      <ModalAction className='px-1'>
        <Button className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold' variant='btn-outline' onClick={clearData}>
          NO
        </Button>
        <Button
          className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold'
          variant='btn-error'
          onClick={handleYesClick}
        >
          YES
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default DeleteModal
