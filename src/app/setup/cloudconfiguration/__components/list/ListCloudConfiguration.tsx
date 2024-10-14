'use client'

import agent from '@/api/axios'
import FolderIcon from '@/assets/Icons/FolderIcon'
import GoogleDriveIcon from '@/assets/Icons/GoogleDriveIcon'
import MoreOptionsIcon from '@/assets/Icons/MoreOptionsIcon'
import PlusIcon from '@/assets/Icons/PlusIcon'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import Wrapper from '@/components/Common/Wrapper'
import { useAppSelector } from '@/store/configureStore'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { useSession } from 'next-auth/react'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Radio, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

const ListCloudConfiguration: React.FC = () => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId

  const [visibleFolderModal, setVisibleFolderModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState('account_payable')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cloudConfigList, setCloudConfigList] = useState<any>([])
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isCloudConfigurationEdit = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Cloud Configuration", "Edit");
  const isCloudConfigurationCreate = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Cloud Configuration", "Create");

  const options = [
    {
      Id: 1,
      label: 'Accounts Payable',
      value: 'account_payable',
    },
    {
      Id: 2,
      label: 'Business Intelligence',
      value: 'business_intelligence',
    },
    {
      Id: 3,
      label: 'Others',
      value: 'others',
    },
  ]

  const fetchCloudList = async () => {
    if (CompanyId) {
      const params = {
        companyId: CompanyId,
      }
      setIsLoading(true)
      try {
        const response = await agent.APIs.getConnectorList(params)

        if (response.ResponseStatus === 'Success') {
          setCloudConfigList(response.ResponseData)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    fetchCloudList()
  }, [])

  const handleSignIn = async () => {
    const clientId = '136716508679-s5h2ofa2epvgpq0ij3629rq6u2qouvnv.apps.googleusercontent.com'
    const redirectUri = 'https://pq-ap-stage.vercel.app/setup/cloudconfiguration'
    const responseType = 'code'
    const scope = 'https://www.googleapis.com/auth/drive'

    const url = `${process.env.GOOGLE_ACCOUNT_OAUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&prompt=consent&access_type=offline&response_type=${responseType}&scope=${scope}`
    window.location.href = url
  }

  const onClose = () => { }

  return (
    <Wrapper masterSettings={true}>
      {/* Navbar */}
      <div className='sticky  top-0 z-[6] flex h-[66px] items-center justify-between bg-whiteSmoke'>
        <div className='mx-3 flex w-full items-center justify-between'>
          <Typography type='h5' className='flex items-center justify-center text-center !font-bold'>
            Cloud Configuration
          </Typography>
          <div className={`${isCloudConfigurationCreate ? "block" : "hidden"} cursor-pointer rounded-full border border-solid border-[#6E6D7A] p-0.5`}>
            <PlusIcon color={'#6E6D7A'} />
          </div>
        </div>
      </div>

      <div>
        <div className='h-[265px] w-[260px] rounded-[12px] border border-solid border-lightSilver p-[20px]'>
          <div className='flex items-center justify-between'>
            <div className='h-[16px] w-[16px] rounded-full bg-[#02B89D]' />
            <Dropdown>
              <MenuButton className={'!border-none !bg-transparent !outline-black'} onClick={() => { }}>
                <MoreOptionsIcon />
              </MenuButton>
              <Menu className={`!z-[6] !-ml-4 !-mt-2 !w-[168px]`}>
                <MenuItem key={'open'} className='!font-proxima !font-normal !text-black !outline-black' onClick={() => { }}>
                  <Typography type='h6' className='!font-normal'>
                    Open
                  </Typography>
                </MenuItem>
              </Menu>
            </Dropdown>
          </div>
          <div className='flex justify-center pb-2 pt-4'>
            <GoogleDriveIcon />
          </div>
          <div className='text-center font-proxima !text-sm text-[#333]'>
            <div className='py-1 font-bold'>Daniel Inc</div>
            <div>donna.jones@gmail.com</div>
          </div>
          <div className='text-center mt-4'>
            <Button
              variant={'btn-outline-primary'}
              className='btn-md w-[100px] rounded-full'
              disabled={false}
              onClick={() => { }}
              tabIndex={0}
            >
              <Typography className='!text-[14px] font-semibold uppercase'>DISABLE</Typography>
            </Button>
          </div>
        </div>
        <button onClick={handleSignIn}>Sign in</button>
      </div>

      <Modal isOpen={visibleFolderModal} onClose={onClose} width='32.5%'>
        <ModalTitle>
          <div className='flex flex-col px-4 py-3'>
            <Typography type='h5' className='!font-bold'>
              Select Folder
            </Typography>
            <Typography type='p'>Please select the folder where you can upload the documents by default</Typography>
          </div>

          <div className='p-3' onClick={onClose}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <ModalContent>
          <div className='p-4'>
            {options &&
              options.map((option) => {
                return (
                  <div key={option.Id} className='flex cursor-pointer items-center py-2 hover:bg-lightGray'>
                    <div className='w-1/12'>
                      <Radio
                        className='text-sm'
                        checked={option.value === selectedFolder}
                        onChange={(e: any) => {
                          setSelectedFolder(e.target.value)
                        }}
                        id={option.value}
                        // label={option.label}
                        value={option.value}
                      />
                    </div>
                    <div className='mx-2'>
                      <FolderIcon />
                    </div>
                    <div className='font-proxima text-sm'>{option.label}</div>
                  </div>
                )
              })}
          </div>
        </ModalContent>

        <ModalAction className={`px-1`}>
          <Button
            className='btn-sm mx-2 my-3 !h-[36px] !w-32 rounded-full font-semibold'
            variant={`btn-primary`}
            onClick={() => { }}
          >
            SET FOLDER
          </Button>
        </ModalAction>
      </Modal>
    </Wrapper>
  )
}

export default ListCloudConfiguration
