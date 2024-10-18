import DownloadIconDark from '@/assets/Icons/DownloadIconDark'
import ExportIcon from '@/assets/Icons/reports/ExportIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useSession } from 'next-auth/react'
import { Toast, Tooltip } from 'pq-ap-lib'
import React, { useState } from 'react'
import CustomTooltip from '../MUI/CustomTooltip'

interface ActionsProps {
  url: string
  params: any
  fileName: any
  isPdfDownload?: boolean
}

const Download: React.FC<ActionsProps> = ({ url, params, fileName, isPdfDownload = true }) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isExportLoading, setIsExportLoading] = useState<boolean>(false)

  const token = session?.user?.access_token

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleDownload = async (exportType: number) => {
    setIsExportLoading(true)
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

  return (
    <Dropdown>
      <MenuButton
        className={`!m-0 flex !items-center !rounded-[0.5px] !h-5 !w-5 !border-none !outline-black !bg-transparent !p-0 ${isExportLoading ? "pointer-events-none" : ""} ${isOpen ? '!text-primary' : ''}`}
        onClick={handleDropdownToggle}>
        {isExportLoading ? (
          <div className='pointer-events-none cursor-default pl-2.5 pr-2 pb-1'>
            <div className='animate-spin'>
              <SpinnerIcon bgColor='#6E6D7A' />
            </div>
          </div>
        ) : (
          isOpen
            ? <span><ExportIcon /></span>
            : <CustomTooltip content='Export'>
              <ExportIcon />
            </CustomTooltip>
        )}
      </MenuButton>
      <Menu placement="bottom-start" className="!z-[6] !w-[200px]">
        {isPdfDownload && <MenuItem className='flex items-center justify-start gap-3 px-2 py-1' onClick={() => handleDownload(2)}>
          <span className='text-sm font-medium text-[#212529]'>Export to PDF</span>
        </MenuItem>}
        <MenuItem className='flex items-center !outline-black justify-start gap-3 px-2 py-1' onClick={() => handleDownload(1)}>
          <span className='text-sm font-medium text-[#212529]'>Export to Excel</span>
        </MenuItem>
      </Menu>
    </Dropdown>
  )
}
export default Download