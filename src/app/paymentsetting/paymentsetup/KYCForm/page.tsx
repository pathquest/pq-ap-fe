"use client"

import { useRouter } from 'next/navigation';
import { Button, Close, Loader, Modal, ModalAction, ModalContent, ModalTitle, Typography } from 'pq-ap-lib';
import 'pq-ap-lib/dist/index.css';
import React, { useState } from 'react';

const KYCForm: React.FC = () => {
    const router = useRouter()
    const [isConfirmKYCModalOpen, setIsConfirmKYCModalOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const clearAllData = async () => {
        router.push('/paymentsetting/paymentsetup')
    }

    const modalClose = () => {
        setIsConfirmKYCModalOpen(false)
    }

    const handleKYCFrom = () => {
        router.push('/paymentsetting/paymentsetup')
        setIsConfirmKYCModalOpen(false)
    }

    return (
        <>
            <div className="h-screen w-full flex flex-col">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <Loader size="md" helperText />
                    </div>
                )}
                <iframe
                    className="flex-grow custom-scroll"
                    src="https://kyc.pathquest.com/onboard/?email=payments%40pathquest.com&source=PathQuest"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    onLoad={() => setIsLoading(false)}
                />

                <div className="sticky bottom-0 h-[76px] flex justify-end items-center border-t border-lightSilver">
                    <Button className='mx-3 w-28 rounded-full xsm:!px-1' variant='btn-outline-primary' onClick={() => clearAllData()}>
                        <Typography type='h6' className='!font-bold'>
                            CANCEL
                        </Typography>
                    </Button>
                    <Button type='submit' className='mx-3 w-28 rounded-full xsm:!px-1' variant='btn-primary' onClick={() => setIsConfirmKYCModalOpen(true)}>
                        <Typography type='h6' className='!font-bold'>
                            SUBMIT
                        </Typography>
                    </Button>
                </div>
            </div>

            {/* KYC Modal */}
            <Modal isOpen={isConfirmKYCModalOpen} onClose={modalClose} width={'500px'}>
                <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
                    <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-medium tracking-[0.02em] text-darkCharcoal'>Company KYC Form</div>
                    <div className='pt-2.5' onClick={modalClose}>
                        <Close variant='medium' />
                    </div>
                </ModalTitle>

                <ModalContent className='mt-2.5 mb-[30px] px-5'>
                    <label className='text-base font-proxima text-darkCharcoal tracking-[0.02em]'>Thank you so much, your KYC has been successfully submitted. Please check status of KYC after some time, kindly close this window and login again.</label>
                </ModalContent>

                <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
                    <Button
                        className='btn-sm !h-9 rounded-full !w-[63px]'
                        variant='btn-primary'
                        onClick={handleKYCFrom}>
                        <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">OK</label>
                    </Button>
                </ModalAction>
            </Modal>
        </>
    );
};

export default KYCForm;