import BackArrow from '@/assets/Icons/payments/BackArrow'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { approveRejectCheck } from '@/store/features/paymentsetting/paymentSetupSlice'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Textarea, Toast } from 'pq-ap-lib'
import React, { useState } from 'react'
import Check from './Check'

interface DrawerProps {
    onClose: (value: string) => void
    Mode: string
    paymentMethodSetupId: number
    accountId: string
}

const CheckApprove: React.FC<DrawerProps> = ({ onClose, Mode, accountId, paymentMethodSetupId }) => {
    const dispatch = useAppDispatch()
    const [isApproveLoading, setIsApproveLoading] = useState<boolean>(false)
    const [isRejectLoading, setIsRejectLoading] = useState<boolean>(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false)
    const [rejectReason, setRejectReason] = useState<string>('')
    const [rejectReasonError, setRejectReasonError] = useState<boolean>(false)
    const [rejectReasonHasError, setRejectReasonHasError] = useState<boolean>(false)

    const setErrorTrue = () => {
        setRejectReasonHasError(true)
        setRejectReasonError(true)
    }

    const initialData = () => {
        setRejectReason('')
        setRejectReasonHasError(false)
        setRejectReasonError(false)
        setIsApproveLoading(false)
        setIsRejectLoading(false)
    }

    const clearAllData = async (type: string) => {
        await setErrorTrue()
        await initialData()
        onClose(type)
    }

    const handleModalClose = (type: string) => {
        clearAllData(type)
    }

    const handleApprove = (isApprove: boolean) => {
        if (isApprove) {
            modalClose()
            setIsApproveLoading(true)
            const params = {
                PaymentSetupMethodId: paymentMethodSetupId || 0,
                AccountId: accountId,
                isApprove: isApprove,
                isReject: false,
                RejectReason: ""
            }
            performApiAction(dispatch, approveRejectCheck, params, () => {
                Toast.success("Payment method approved!")
                handleModalClose("Save")
            }, () => {
                setIsRejectLoading(false)
                setIsApproveLoading(false)
            })
        } else {
            rejectReason.trim().length <= 0 && setRejectReasonError(true)
            if (rejectReason.trim().length > 0 && rejectReasonHasError) {
                setIsRejectLoading(true)
                modalClose()
                const params = {
                    PaymentSetupMethodId: paymentMethodSetupId || 0,
                    AccountId: accountId,
                    isApprove: false,
                    isReject: !isApprove,
                    RejectReason: rejectReason
                }
                performApiAction(dispatch, approveRejectCheck, params, () => {
                    Toast.success("Payment method rejected!")
                    handleModalClose("Save")
                }, () => {
                    setIsRejectLoading(false)
                    setIsApproveLoading(false)
                })
            }
        }
    }

    const modalClose = () => {
        setIsRejectModalOpen(false)
        setRejectReason('')
        setRejectReasonHasError(false)
        setRejectReasonError(false)
    }

    return (<>
        <div className='w-full h-full overflow-hidden'>
            <div className='sticky top-0 z-[6] px-5 flex h-[50px] w-full items-center justify-between bg-whiteSmoke'>
                <div className='cursor-pointer flex gap-5' onClick={() => handleModalClose("")}>
                    <BackArrow />
                    <label className='flex items-center pt-0 pr-0.5 font-proxima text-base font-bold tracking-wide cursor-pointer'>Check Layout</label>
                </div>

                <div className={`flex items-center gap-5 ${Mode === "Approve" ? "" : "hidden"}`}>
                    <Button
                        type='submit'
                        onClick={() => setIsRejectModalOpen(true)}
                        className={`btn-sm !h-9 !bg-transparent rounded-full ${isRejectLoading && 'pointer-events-none opacity-80'}`}
                        variant='btn-outline-error'>
                        <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isRejectLoading ? "animate-spin mx-[20px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                            {isRejectLoading ? <SpinnerIcon bgColor='#B02A37' /> : "REJECT"}
                        </label>
                    </Button>

                    <Button
                        type='submit'
                        onClick={() => handleApprove(true)}
                        className={`btn-sm !h-9 rounded-full ${isApproveLoading && 'pointer-events-none opacity-80'}`}
                        variant='btn-primary'>
                        <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isApproveLoading ? "animate-spin  mx-[27px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                            {isApproveLoading ? <SpinnerIcon bgColor='#FFF' /> : "APPROVE"}
                        </label>
                    </Button>
                </div>
            </div>
            <div className='w-full h-fit flex justify-center m-5'><Check /></div>
        </div>

        {/* Reject Modal */}
        <Modal isOpen={isRejectModalOpen} onClose={modalClose} width={'500px'}>
            <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
                <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-medium tracking-[0.02em] text-darkCharcoal'>Check Rejection</div>
                <div className='pt-2.5' onClick={modalClose}>
                    <Close variant='medium' />
                </div>
            </ModalTitle>

            <ModalContent className='my-5 px-5 '>
                <div className='font-proxima text-base tracking-[0.02em] text-darkCharcoal'>Check payment method will be removed permanently. Are you sure you want to reject?</div>
                <div className='my-5'>
                    <Textarea
                        className='resize-y'
                        label='Rejection Reason'
                        id='rejectReason'
                        name='rejectReason'
                        placeholder='Please Enter Reason'
                        validate
                        maxLength={50}
                        minChar={6}
                        rows={3}
                        hasError={rejectReasonError}
                        value={rejectReason}
                        getValue={(value) => setRejectReason(value)}
                        getError={(error) => setRejectReasonHasError(error)}
                    />
                </div>
            </ModalContent>

            <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
                <Button
                    className='btn-sm !h-9 rounded-full !w-[73px]'
                    variant='btn-outline-error'
                    onClick={modalClose}>
                    <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">NO</label>
                </Button>
                <Button
                    className='btn-sm !h-9 rounded-full !w-[78px]'
                    variant='btn-error'
                    onClick={() => handleApprove(false)}                >
                    <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">YES</label>
                </Button>
            </ModalAction>
        </Modal>
    </>
    )
}

export default CheckApprove