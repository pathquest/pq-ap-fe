import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Textarea, Toast, Typography } from 'pq-ap-lib'
import React, { useState } from 'react'

// Icons
import ExclamationOrangeIcon from '@/assets/Icons/payments/ExclamationOrangeIcon'

// Store
import { useAppDispatch } from '@/store/configureStore'
import { moveBillToPay } from '@/store/features/billsToPay/billsToPaySlice'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  selectedRowIds: number[]
  onDataFetch?: any
}

const MoveBillsToPayModals: React.FC<ActionsProps> = ({ onOpen, onClose, selectedRowIds, onDataFetch }) => {
  const [reason, setReason] = useState<string>('')
  const [reasonErr, setReasonErr] = useState<boolean>(false)
  const [reasonErrMsg, setReasonErrMsg] = useState<string>('')
  const [showReason, setShowReason] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleClose = () => {
    setReason('')
    setShowReason(false)
    setReasonErr(false)
    setReasonErrMsg('')
    onClose()
  }

  const applyChanges = async () => {
    if (reason.trim().length === 0) {
      setReasonErr(true)
      setReasonErrMsg('This is a required field!')
    } else if (reason.trim().length < 3) {
      setReasonErr(true)
      setReasonErrMsg('Please enter minimum 3 characters!')
    } else if (reason.trim().length > 500) {
      setReasonErr(true)
      setReasonErrMsg('Please enter maximum 500 characters!')
    } else {
      setIsLoading(true)
      const params = {
        AccountPaybleId: selectedRowIds,
        OnHold: false,
        OnHoldReason: reason,
      }
      performApiAction(dispatch, moveBillToPay, params, () => {
        setIsLoading(false)
        Toast.success('Bills has been successfully moved to Bill to Pay.')
        onDataFetch()
        onClose()
      }, () => {
        setIsLoading(false)
      })
    }
  }

  return (
    <Modal isOpen={onOpen} onClose={handleClose} width='500px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Move this Bill to Pay</div>
        <div className='pt-2.5' onClick={handleClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className={`grid grid-cols-1 ${showReason ? "!h-[182px]" : "!h-[72px]"} laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5`}>
        <div className='flex items-center gap-[10px] pt-3.5 pb-3'>
          {showReason ? "" : <ExclamationOrangeIcon />}
          <label className='font-proxima font-normal text-sm text-darkCharcoal'>
            Are you sure you want to move this bill to pay?
          </label>
        </div>
        <div className='w-full'>
          {showReason && (
            <Textarea
              label='Reason'
              validate
              getValue={(e) => {
                setReason(e)
                setReasonErr(false)
              }}
              rows={3}
              getError={() => { }}
              hasError={reasonErr}
              errorMessage={reasonErrMsg}
            />
          )}
        </div>
      </ModalContent>

      <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
        <Button
          className={`btn-sm !h-9 rounded-full !w-[94px]`}
          variant={`btn-outline-primary`}
          onClick={onClose}>
          <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">CANCEL</label>
        </Button>
        {showReason
          ? <Button
            className='btn-sm !h-9 rounded-full !w-[84px]'
            variant={`btn-primary`}
            onClick={applyChanges}>
            <label className={`flex items-center justify-center ${isLoading ? "animate-spin mx-[26px]" : "cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "YES"}
            </label>
          </Button>
          : <Button
            className={`btn-sm !h-9 rounded-full !w-[84px]`}
            variant={`btn-primary`}
            onClick={() => setShowReason(true)}>
            <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">YES</label>
          </Button>}
      </ModalAction>
    </Modal>
  )
}

export default MoveBillsToPayModals