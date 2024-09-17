import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Uploader } from 'pq-ap-lib';
import React from 'react';

interface ImportModalProps {
  isModalOpen: boolean
  modalClose: () => void
  handleSubmit: (arg1?: any) => void
  sampleFile: string
  getValue: (value: any) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isModalOpen,
  modalClose,
  handleSubmit,
  sampleFile,
  getValue,
}) => {

  return (
    <Modal isOpen={isModalOpen} onClose={modalClose} width='500px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em]'>Import</div>
        <div className='pt-2.5' onClick={() => modalClose()}>
          <Close variant='medium' />
        </div>
      </ModalTitle>
      <ModalContent className='!h-[72px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5 pt-2.5 font-proxima font-normal laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base text-darkCharcoal'>
        <Uploader variant="small" getValue={(value: any) => getValue(value[0])} accept=".xlsx, .csv" />
      </ModalContent>

      <ModalAction className='flex justify-between laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
        <div className='!ml-3 text-sm'>Download a <a className=' text-primary tracking-[0.02em] text-sm border-b' href={`/Sample/${sampleFile}.xlsx`} download>
          sample file
        </a></div>
        <Button
          className='btn-sm !h-9 rounded-full'
          variant='btn-primary'
          onClick={handleSubmit}
        >
          <label className="cursor-pointer laptop:px-5 laptopMd:px-5 lg:px-5 xl:px-5 hd:px-6 2xl:px-6 3xl:px-6 font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">IMPORT</label>
        </Button>
      </ModalAction>
    </Modal>
  );
};

export default ImportModal;