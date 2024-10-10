import { useState } from 'react'

import { Button, Close, Tooltip, Modal, ModalAction, ModalContent, ModalTitle, Radio, Typography, Toast, Text } from 'pq-ap-lib'
import FolderIcon from '@/assets/Icons/FolderIcon'
import agent from '@/api/axios'
import GoogleDriveIcon from '@/assets/Icons/GoogleDriveIcon'
import ChevronLeftIcon from '@/assets/Icons/ChevronLeftIcon'

interface FolderProps {
    Name: string
    Id: string
    FolderPath: string
    WebViewLink: string
    ParentName: string
    ParentId: string
    ChildFolders: FolderProps[]
}

export default function SelectFolderModal({
    folders,
    visibleFolderModal,
    setOnCloseModal,
    companyId,
    selectedCloudConnectorId
}: any) {
    const [selectedFolder, setSelectedFolder] = useState<string>('')
    const [isSettingAliasName, setIsSettingAliasName] = useState<boolean>(false)
    const [aliasName, setAliasName] = useState<string>('')
    const [currentFolder, setCurrentFolder] = useState<FolderProps | null>(null);
    const [folderHistory, setFolderHistory] = useState<any[]>([]);

    const onSelectFolder = async () => {
        const response = await agent.accountantDashboard.saveDocumentFolderPath({
            CompanyId: Number(companyId),
            CloudConnectorId: selectedCloudConnectorId,
            SourcePath: selectedFolder,
        })

        if (response.ResponseStatus === 'Success') {
            Toast.success(response.ResponseStatus, response.ResponseData)
            setOnCloseModal()
        } else {
            Toast.error(response.ResponseStatus, response.Message)
            setOnCloseModal()
        }
    }

    const handleFolderClick = (folder: FolderProps) => {
        if (folder.ChildFolders && folder.ChildFolders.length > 0) {
            setFolderHistory([...folderHistory, currentFolder]);
            setCurrentFolder(folder.ChildFolders[0]);
        } else {
            setSelectedFolder(folder.FolderPath);
        }
    };

    const handleBackClick = () => {
        const lastFolder = folderHistory.pop();
        setCurrentFolder(lastFolder || null);
        setSelectedFolder('')
        setFolderHistory([...folderHistory]);
    };

    return (
        <>
            <Modal isOpen={visibleFolderModal} onClose={setOnCloseModal} width='32.5%'>
                <ModalTitle>
                    <div className='flex flex-col px-4 py-3'>
                        {folderHistory.length > 0 ? (
                            <div className='flex justify-center items-center cursor-pointer' onClick={handleBackClick}>
                                <ChevronLeftIcon />
                                <Typography type='h5' className='!font-bold'>
                                    Back
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <Typography type='h5' className='!font-bold'>
                                    Select Folder
                                </Typography>
                                <Typography type='p'>Please select the folder where you can upload the documents by default</Typography>
                            </>
                        )}
                    </div>

                    <div className='p-3' onClick={setOnCloseModal}>
                        <Close variant='medium' />
                    </div>
                </ModalTitle>

                <ModalContent>
                    <div className='p-4'>
                        {(currentFolder ? [currentFolder] : folders).map((folder: FolderProps) => {
                            return (
                                <div key={`${folder.FolderPath}-${folder.Name}`} className='flex items-center py-2 hover:bg-[#F4F4F4]'>
                                    <div className='w-1/12'>
                                        <Radio
                                            className='text-sm'
                                            checked={folder.FolderPath === selectedFolder}
                                            onChange={(e: any) => {
                                                setSelectedFolder(folder.FolderPath)
                                            }}
                                            id={`${folder.FolderPath}-${folder.Name}`}
                                            value={folder.FolderPath}
                                        />
                                    </div>
                                    <div className={`${folder.ChildFolders.length > 0 && 'hover:cursor-pointer'} flex justify-between w-full`} onClick={() => handleFolderClick(folder)}>
                                        <div className={`flex mx-2 gap-3 justify-center items-center font-proxima text-sm`}>
                                            <FolderIcon />
                                            {folder.Name}
                                        </div>
                                        {folder.ChildFolders.length > 0 && (
                                            <span className='rotate-180'>
                                                <ChevronLeftIcon />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ModalContent>


                <ModalAction className={`px-1`}>
                    <Button
                        className='btn-sm mx-2 my-3 !h-[36px] !w-32 rounded-full font-semibold'
                        variant={`btn-primary`}
                        onClick={onSelectFolder}
                    >
                        SET FOLDER
                    </Button>
                </ModalAction>
            </Modal>

            {/* alias setName Modal */}
            <Modal isOpen={false} onClose={setOnCloseModal} width='32.5%'>
                <ModalTitle>
                    <div className='flex w-full px-4 py-3'>
                        <Typography type='h5' className='!font-bold'>
                            Set New Alias Name
                        </Typography>
                    </div>

                    <div className='flex w-full justify-end p-3' onClick={setOnCloseModal}>
                        <Close variant='medium' />
                    </div>
                </ModalTitle>

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
                                    className='!pt-2 '
                                    label='Alias Name *'
                                    value={aliasName}
                                    getValue={(value) => setAliasName(value)}
                                    getError={() => { }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='my-4 flex flex-col gap-5'>
                            <div className='flex w-full flex-col items-center gap-4'>
                                <div className='w-60 text-center text-lg font-semibold'>Your google drive has been successfully connected</div>
                                <div className='flex items-center gap-4'>
                                    <GoogleDriveIcon />
                                    <div className='flex flex-col'>
                                        <span className='font-semibold'>Donna Jones</span>
                                        <span className='text-sm'>donna.jones@gmail.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex w-full justify-center'>Would you like to set alias name?</div>
                        </div>
                    )}
                </ModalContent>

                <ModalAction>
                    {isSettingAliasName ? (
                        <div className={`my-2 flex w-full items-center justify-end px-1`}>
                            <Button
                                className='btn-sm mx-2 my-3 !h-[36px] !w-24 rounded-full font-semibold'
                                variant={`btn-primary`}
                                onClick={() => setIsSettingAliasName(false)}
                            >
                                CANCEL
                            </Button>
                            <Button
                                className={`btn-sm mx-2 my-3 !h-[36px] !w-24 rounded-full font-semibold ${!aliasName ? 'opacity-50' : ''}`}
                                variant={`btn-primary`}
                                onClick={onSelectFolder}
                                disabled={!aliasName}
                            >
                                NEXT
                            </Button>
                        </div>
                    ) : (
                        <div className={`my-2 flex w-full items-center justify-center px-1`}>
                            <Button
                                className='btn-sm mx-2 my-3 !h-[36px] !w-24 rounded-full font-semibold'
                                variant={`btn-primary`}
                            // onClick={onSelectFolder}
                            >
                                NO
                            </Button>
                            <Button
                                className='btn-sm mx-2 my-3 !h-[36px] !w-24 rounded-full font-semibold'
                                variant={`btn-primary`}
                                onClick={() => setIsSettingAliasName(true)}
                            >
                                YES
                            </Button>
                        </div>
                    )}
                </ModalAction>
            </Modal>
        </>
    )
}