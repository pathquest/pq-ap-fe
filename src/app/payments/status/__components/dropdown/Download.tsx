import ApprovalModal from '@/app/approvals/__components/ApprovalModal'
import DownloadIconDark from '@/assets/Icons/DownloadIconDark'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useSession } from 'next-auth/react'
import { Radio, Toast, Tooltip } from 'pq-ap-lib'
import React, { useState } from 'react'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle } from 'pq-ap-lib'

interface ActionsProps {
  url: string
  params: any
  fileName: string
  isPdfDownload?: boolean
}

const Download: React.FC<ActionsProps> = ({ url, params, fileName, isPdfDownload = true }) => {
  const { data: session } = useSession()
  const token = session?.user?.access_token

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isExportLoading, setIsExportLoading] = useState<boolean>(false)
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false)
  const [isDetailViewSelect, setIsDetailViewSelect] = useState<boolean>(true)
  const [isSummaryViewSelect, setIsSummaryViewSelect] = useState<boolean>(false)

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleDownload = async (exportType: number) => {
    setIsExportLoading(true)
    setIsExcelModalOpen(false)
    const param = {
      ...params,
      PageNumber: 1,
      PageSize: 1000,
      IsDownload: true,
      ExportType: exportType
    }
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `bearer ${token}`,
      },
      // responseType: 'arraybuffer',
    }
    const response: any = await axios.post(url, param, config)

    if (response.status === 200) {
      if (response.data.ResponseStatus === 'Failure') {
        Toast.error(response.data.Message)
        setIsExportLoading(false)
      } else {
        const byteCharacters = atob(response?.data?.ResponseData?.FileContents);

        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], {
          type: response?.data?.ResponseData?.ContentType,
        })

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        if (exportType === 1) {
          a.download = `${fileName}.xlsx`
        } else {
          a.download = `${fileName}.pdf`
        }
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        setIsExportLoading(false)
      }
    }
  }

  const modalClose = () => {
    setIsExcelModalOpen(false)
    setIsDetailViewSelect(true)
    setIsSummaryViewSelect(false)
  }

  const handleDetailViewSelect = () => {
    setIsDetailViewSelect(true)
    setIsSummaryViewSelect(false)
  }

  const handleSummaryViewSelect = () => {
    setIsDetailViewSelect(false)
    setIsSummaryViewSelect(true)
  }

  return (<>
    <Dropdown>
      <MenuButton
        className={`!m-0 flex !items-center !rounded-[0.5px] !h-9 !w-9 !border-none  !outline-black !bg-transparent !p-0 ${isOpen ? '!text-primary' : ''}`}
        onClick={() => { handleDropdownToggle() }}>
        {isExportLoading ? (
          <div className='pl-[10px] pr-[8px]'>
            <div className='animate-spin'>
              <SpinnerIcon bgColor='#6E6D7A' />
            </div>
          </div>
        ) : (
          isOpen
            ? <span className='text-sm '>
              <DownloadIconDark />
            </span>
            : <Tooltip position='bottom' content='Download' className='!z-[4] !font-normal !cursor-pointer'>
              <span className='text-sm '>
                <DownloadIconDark />
              </span>
            </Tooltip>
        )}
      </MenuButton>
      <Menu placement="bottom-start" className={`z-[6] !w-[200px]`}>
        {isPdfDownload && <MenuItem className='flex items-center justify-start gap-3 px-2 py-1' onClick={() => handleDownload(2)}>
          <DownloadIconDark />
          <span className='text-sm font-medium text-[#212529]'>Download PDF</span>
        </MenuItem>}
        {/* <MenuItem className='flex items-center !outline-black justify-start gap-3 px-2 py-1' onClick={() => handleDownload(1)}> */}
        <MenuItem className='flex items-center !outline-black justify-start gap-3 px-2 py-1' onClick={() => setIsExcelModalOpen(true)}>
          <DownloadIconDark />
          <span className='text-sm font-medium text-[#212529]'>Download Excel</span>
        </MenuItem>
      </Menu>
    </Dropdown>

    <Modal isOpen={isExcelModalOpen} onClose={modalClose} width='476px'>
      <ModalTitle className='py-3 pl-4 pr-1 font-bold'>
        <div className='text-lg font-proxima font-bold tracking-[0.02em]'>Download Excel</div>
        <div onClick={() => modalClose()}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='my-7 px-4 flex'>
        <div className='flex gap-5'>
          <Radio
            className='text-sm'
            checked={isDetailViewSelect}
            onChange={handleDetailViewSelect}
            id='detailView'
            label='Detail View'
          />
          <Radio
            className='text-sm'
            checked={isSummaryViewSelect}
            id='summaryView'
            label='Summary View'
            onChange={handleSummaryViewSelect}
          />
        </div>
      </ModalContent>

      <ModalAction className='px-1'>
        <Button
          className='btn-sm mx-2 my-3 !h-[36px] !w-[124px] rounded-full font-semibold tracking-[0.02em]'
          variant='btn-outline-primary'
          onClick={modalClose}>
          CANCEL
        </Button>
        <Button
          className='btn-sm mx-2 my-3 !h-[36px] !w-[148px] rounded-full font-semibold tracking-[0.02em]'
          variant='btn-primary'
          onClick={() => handleDownload(1)}>
          DOWNLOAD
        </Button>
      </ModalAction>
    </Modal >
  </>
  )
}
export default Download