import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle } from 'pq-ap-lib'
import React from 'react'

type ColorVariant =
  | 'btn'
  | 'btn-primary'
  | 'btn-secondary'
  | 'btn-success'
  | 'btn-error'
  | 'btn-warning'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'btn-outline'
  | 'btn-outline-primary'
  | 'btn-outline-secondary'
  | 'btn-outline-success'
  | 'btn-outline-error'
  | 'btn-outline-warning'

interface ConfirmationModalProps {
  title: string
  content: string
  isModalOpen: boolean
  modalClose: (value?: string) => void
  handleSubmit?: (arg1?: any) => void
  colorVariantNo: ColorVariant
  colorVariantYes: ColorVariant
  modalWidth?: string
  contentClassName?: string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  content,
  isModalOpen,
  modalClose,
  handleSubmit,
  colorVariantNo,
  colorVariantYes,
  contentClassName,
  modalWidth,
}) => {
  return (
    <Modal isOpen={isModalOpen} onClose={() => { }} width={modalWidth ? modalWidth : '500px'}>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>{title}</div>
        <div className='pt-2.5' onClick={() => modalClose()}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className={`h-[72px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5 pt-2.5 font-proxima font-normal laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base text-darkCharcoal ${contentClassName}`}>{content}</ModalContent>

      <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
        <Button
          className='btn-sm !h-9 rounded-full !w-[73px]'
          variant={colorVariantNo}
          onClick={() => modalClose('No')}
        >
          <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">NO</label>
        </Button>
        <Button
          className='btn-sm !h-9 rounded-full !w-[78px]'
          variant={colorVariantYes}
          onClick={handleSubmit}
        >
          <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">YES</label>
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default ConfirmationModal
