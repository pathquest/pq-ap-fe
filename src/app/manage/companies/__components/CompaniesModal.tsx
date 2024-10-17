
import AnyIcon from '@/assets/Icons/AnyIcon'
import Image from 'next/image'
import { Button, Close, Modal, ModalContent, ModalTitle, Typography } from 'pq-ap-lib'

const CompaniesModal = ({ onOpen, onClose, onConnectQb, onConnectXero, onConnectIntacct, getValue }: any) => {
  return (
    <Modal isOpen={onOpen} onClose={onClose} width='900px'>
      <ModalTitle className='p-5'>
        <div className="flex flex-col">
          <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'> Add Company</div>
          <Typography className='!pb-1 !text-sm !text-slatyGrey'>
            Select an accounting tool to connect the company.
          </Typography>
        </div>
        <div className='pt-2.5' onClick={onClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>


      <ModalContent>
        <div className='grid grid-cols-4 gap-5 p-5'>
          <div className='flex h-full w-full max-w-sm flex-col items-center overflow-hidden rounded border-[1px] border-lightSilver'>
            <span className='my-2 flex h-20 w-20 items-center justify-center'>
              <img
                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv26TvCWusuQWjAAuncGhTg094aGaTBr9x1w&usqp=CAU'
                alt='quickbook_logo'
                className='h-20 w-20'
                width={60}
                height={60}
              />
            </span>
            <Typography className='mt-4 text-darkCharcoal text-sm tracking-[0.02em]'>QuickBooks Online</Typography>
            <Button
              className='btn-sm !h-8 font-bold px-[15px] my-5 rounded'
              variant='btn-outline-primary'
              onClick={onConnectQb}>
              <label className='cursor-pointer font-proxima tracking-[0.02em] py-2'>CONNECT</label>
            </Button>
          </div>

          <div className='flex h-full w-full max-w-sm flex-col items-center overflow-hidden rounded border-[1px] border-lightSilver'>
            <span className='pt-5'>
              <Image
                src='data:image/png;base64,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'
                alt='xero_logo'
                width={60}
                height={60}
                className='h-[70px] w-[70px]'
              />
            </span>
            <Typography className='mt-5 text-darkCharcoal text-sm tracking-[0.02em]'>Xero</Typography>
            <Button
              className='btn-sm !h-8 font-bold px-[15px] mt-5 rounded'
              variant='btn-outline-primary'
              onClick={onConnectXero}
            >
              <label className='cursor-pointer px-2 font-proxima tracking-[0.02em]'>CONNECT</label>
            </Button>
          </div>

          <div className='flex h-full w-full max-w-sm flex-col items-center overflow-hidden rounded border-[1px] border-lightSilver'>
            <span className='my-2 flex h-20 w-20 items-center justify-center'>
              <Image
                src='data:image/png;base64,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'
                alt='quickbook_logo'
                width={60}
                height={60}
                className='h-[70px] w-[70px]'
              />
            </span>
            <Typography className='mt-4 text-darkCharcoal text-sm tracking-[0.02em]'>Sage Intacct</Typography>
            <Button
              className='btn-sm !h-8 font-bold px-[15px] my-5 rounded'
              variant='btn-outline-primary'
              onClick={onConnectIntacct}>
              <label className='cursor-pointer font-proxima tracking-[0.02em] py-2'>CONNECT</label>
            </Button>
          </div>

          <div className='flex h-full w-full max-w-sm flex-col items-center overflow-hidden rounded border-[1px] border-lightSilver'>
            <span className='my-2 flex h-20 w-20 items-center justify-center'>
              <AnyIcon size={70} />
            </span>
            <Typography className='mt-4 text-darkCharcoal text-sm tracking-[0.02em]'>No Accounting Tool</Typography>
            <Button
              className='btn-sm !h-8 font-bold px-[15px] my-5 rounded'
              variant='btn-outline-primary'
              onClick={() => getValue(true)}>
              <label className='cursor-pointer px-4 font-proxima tracking-[0.02em]'>CREATE</label>
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default CompaniesModal
