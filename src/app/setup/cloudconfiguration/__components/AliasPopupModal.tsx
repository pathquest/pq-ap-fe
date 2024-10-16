import GoogleDriveIcon from '@/assets/Icons/GoogleDriveIcon';
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Text, Typography } from 'pq-ap-lib'
import React, { useState } from 'react'

function AliasPopupModal({
    visibleAliasName,
    setOnCloseAliasModal
}: any) {
    const [isSettingAliasName, setIsSettingAliasName] = useState(false);
    const [aliasName, setAliasName] = useState('');

    return (
        <>
            <Modal isOpen={visibleAliasName} onClose={setOnCloseAliasModal} width='32.5%'>
                {isSettingAliasName && (
                    <ModalTitle>
                        <div className='flex w-full px-4 py-3'>
                            <Typography type='h5' className='!font-bold'>
                                Set New Alias Name
                            </Typography>
                        </div>

                        <div className='flex w-full justify-end p-3' onClick={setOnCloseAliasModal}>
                            <Close variant='medium' />
                        </div>
                    </ModalTitle>
                )}
                <ModalContent>
                    {isSettingAliasName ? (
                        <div className='my-4'>
                            <div className='flex w-full flex-col items-center gap-2'>
                                <GoogleDriveIcon />
                                <span className='font-semibold'>Donna Jones</span>
                                <span className='text-sm'>donna.jones@gmail.com</span>
                            </div>
                            <div className='mx-4 my-2'>
                                <Text
                                    required
                                    className='!pt-2 '
                                    label='Alias Name'
                                    value={aliasName}
                                    getValue={(value) => setAliasName(value)}
                                    getError={() => { }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='flex w-full justify-end p-3' onClick={setOnCloseAliasModal}>
                                <Close variant='large' />
                            </div>
                            <div className='flex w-full justify-center'>
                                <div className='flex-col w-[70%] justify-center items-center mb-5'>
                                    <span className='text-[16px] font-bold flex text-center pt-7'>
                                        Your google drive has been successfully connected
                                    </span>

                                    <div className='flex justify-center items-center pt-7'>
                                        <GoogleDriveIcon />
                                        <div className='pl-3 flex flex-col'>
                                            <span className='font-bold text-[14px]'>Devesh Sheth</span>
                                            <span className='text-[#6E6D7A] text-[14px] max-w-[180px] break-all'>abc2018@gmail.com</span>
                                        </div>
                                    </div>

                                    <span className='text-[16px] text-[#333333] flex justify-center items-center pt-7'>
                                        Would you like to set alias name?
                                    </span>

                                    <div className='flex justify-center items-center pt-7'>
                                        <Button
                                            className='btn-sm mx-2 !h-[36px] !w-24 rounded-full font-semibold'
                                            variant={`btn-outline-primary`}
                                            onClick={setOnCloseAliasModal}
                                        >
                                            NO
                                        </Button>
                                        <Button
                                            className='btn-sm mx-2 !h-[36px] !w-24 rounded-full font-semibold'
                                            variant={`btn-outline-primary`}
                                            onClick={() => setIsSettingAliasName(true)}
                                        >
                                            YES
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </>
                    )}
                </ModalContent >
                {isSettingAliasName && (
                    <ModalAction>
                        <div className={`my-2 flex w-full items-center justify-end px-1`}>
                            <Button
                                className='btn-sm mx-2 my-3 !h-[36px] !w-24 rounded-full font-semibold'
                                variant={`btn-outline-primary`}
                                onClick={setOnCloseAliasModal}
                            >
                                CANCEL
                            </Button>
                            <Button
                                className={`btn-sm mx-2 my-3 !h-[36px] !w-24 rounded-full font-semibold ${!aliasName ? 'opacity-50' : ''}`}
                                variant={`btn-primary`}
                                onClick={() => { }}
                                disabled={!aliasName}
                            >
                                NEXT
                            </Button>
                        </div>
                    </ModalAction>
                )}
            </Modal >
        </>
    )
}

export default AliasPopupModal