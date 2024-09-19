import ExportIcon from '@/assets/Icons/reports/ExportIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import axios, { AxiosRequestConfig } from 'axios'
import { useSession } from 'next-auth/react'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Radio, Toast, Tooltip } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface ActionsProps {
  url: string
  params: any
  fileName: string
  isPdfDownload?: boolean
  getDropdownOpen: (arg1: any) => void
}

const Download: React.FC<ActionsProps> = ({ url, params, fileName, isPdfDownload = true, getDropdownOpen }) => {
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

  useEffect(() => {
    getDropdownOpen(isOpen)
  }, [isOpen])

  const handleDownload = async (exportType: number) => {
    setIsExportLoading(true)
    setIsExcelModalOpen(false)
    setIsOpen(false)
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
    setIsOpen(false)
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
        className={`!m-0 flex !items-center !rounded-[0.5px] !h-5 !w-5 !border-none  !outline-black !bg-transparent !p-0 ${isOpen ? '!text-primary' : ''}`}
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
              <ExportIcon />
            </span>
            : <Tooltip position='bottom' content='Download' className='!z-[4] !font-normal !cursor-pointer'>
              <span className='text-sm '>
                <ExportIcon />
              </span>
            </Tooltip>
        )}
      </MenuButton>
      <Menu placement="bottom-start" className={`z-[6] !w-[200px]`}>
        {isPdfDownload && <MenuItem className='flex items-center justify-start gap-3 px-2 py-1' onClick={() => handleDownload(2)}>
          <ExportIcon />
          <span className='text-sm font-medium text-[#212529]'>Download PDF</span>
        </MenuItem>}
        {/* <MenuItem className='flex items-center !outline-black justify-start gap-3 px-2 py-1' onClick={() => handleDownload(1)}> */}
        <MenuItem className='flex items-center !outline-black justify-start gap-3 px-2 py-1' onClick={() => setIsExcelModalOpen(true)}>
          <ExportIcon />
          <span className='text-sm font-medium text-[#212529]'>Download Excel</span>
        </MenuItem>
      </Menu>
    </Dropdown>

    <Modal isOpen={isExcelModalOpen} onClose={modalClose} width='500px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Download Excel</div>
        <div className='pt-2.5' onClick={() => modalClose()}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='h-[72px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5 flex'>
        <div className='flex gap-5 ml-[-8px]'>
          <Radio
            className='text-sm !text-darkCharcoal !tracking-[0.02em] !font-proxima'
            checked={isDetailViewSelect}
            onChange={handleDetailViewSelect}
            id='detailView'
            label='Detail View'
          />
          <Radio
            className='text-sm !text-darkCharcoal !tracking-[0.02em] !font-proxima'
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