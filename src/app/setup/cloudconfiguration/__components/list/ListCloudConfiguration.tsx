'use client'

import agent from '@/api/axios'
import GoogleDriveIcon from '@/assets/Icons/GoogleDriveIcon'
import GoogleDrive from '@/assets/Icons/cloud_configuration/GoogledDrive'
import DropBox from '@/assets/Icons/cloud_configuration/DropBox'
import EmailCloudIcon from '@/assets/Icons/EmailCloudIcon'
import FTPCloudIcon from '@/assets/Icons/FTPCloudIcon'
import FTP from '@/assets/Icons/cloud_configuration/FTP'
import Email from '@/assets/Icons/cloud_configuration/Email'
import MoreOptionsIcon from '@/assets/Icons/MoreOptionsIcon'
import PlusIcon from '@/assets/Icons/PlusIcon'
import Wrapper from '@/components/Common/Wrapper'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BasicTooltip, Button, Loader, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import InfoIcon from '@/assets/Icons/infoIcon'
import SelectFolderModal from '../SelectFolderModal'
import IMAPConfigModal from '../IMAPConfigModal'
import DropboxIcon from '@/assets/Icons/DropboxIcon'
import FolderIcon from '@/assets/Icons/FolderIcon'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setSelectedConnectorId } from '@/store/features/cloudConfiguration/cloudConfigurationSlice'
import AliasPopupModal from '../AliasPopupModal'

interface CloudConfigProps {
  ConnectorId: number
  IsConnected: boolean
  Name: string
  AuthUserEmail: string
  FolderPath: string
}

const ListCloudConfiguration: React.FC = () => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const router = useRouter()
  const dispatch = useAppDispatch()

  const searchParams = useSearchParams()

  const code = searchParams.get('code')
  const { selectedConnecterId } = useAppSelector((state) => state.cloudConfiguration)
  const [isPlusIconClicked, setIsPlusIconClicked] = useState<boolean>(false)
  const [visibleFolderModal, setVisibleFolderModal] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isIMAPConfigOpen, setIsIMAPConfigOpen] = useState<boolean>(false)
  const [isAliasNameOpen, setIsAliasNameOpen] = useState<boolean>(false)
  const [cloudConfigList, setCloudConfigList] = useState<any>([])
  const [folders, setFolders] = useState<any>([])
  // const [selectedCloudConnectorId, setSelectedCloudConnectorId] = useState<number | null>(null)
  const [imapConnectedEmail, setIMAPConnectedEmail] = useState<string>('')

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
          setIsLoading(false)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    const connectToGoogleDrive = async () => {
      try {
        const response = await agent.accountantDashboard.googleDriveConnect({
          Code: code,
        })

        if (response.ResponseStatus === 'Success') {
          const folderResponse = await agent.accountantDashboard.getFolderList()
          if (folderResponse.ResponseStatus === 'Success') {
            setFolders(folderResponse.ResponseData)
            setVisibleFolderModal(true)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    const connectToDropBox = async () => {
      try {
        const response = await agent.accountantDashboard.dropboxConnect({
          Code: code,
        })

        if (response.ResponseStatus === 'Success') {
          const folderResponse = await agent.accountantDashboard.getFolderDropboxList()
          if (folderResponse.ResponseStatus === 'Success') {
            setFolders(folderResponse.ResponseData)
            setVisibleFolderModal(true)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
    if (code && selectedConnecterId) {
      selectedConnecterId === 1 && connectToGoogleDrive()
      selectedConnecterId === 2 && connectToDropBox()
    }
  }, [code, selectedConnecterId])

  useEffect(() => {
    fetchCloudList()
  }, [])

  const onDisableCloudConnection = async (CloudConnectorId: number) => {
    setIsLoading(true)
    const response = await agent.accountantDashboard.disableCloudConnection({
      CloudConnectorId,
    })

    if (response.ResponseStatus === 'Success') {
      fetchCloudList()
    }
  }

  const onEnableCloudConnection = (CloudConnectorId: number) => {
    dispatch(setSelectedConnectorId(CloudConnectorId))
    if (CloudConnectorId === 1) {
      const responseType = 'code'
      const scope =
        'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'

      const url = `${process.env.GOOGLE_ACCOUNT_OAUTH_URL}?client_id=${process.env.CLOUD_CONFIGURATION_GOOGLEDRIVE_CLIENTID}&redirect_uri=${process.env.CLOUD_CONFIGURATION_GOOGLEDRIVE_REDIRECTURI}&prompt=consent&access_type=offline&response_type=${responseType}&scope=${scope}`
      window.location.href = url
    }

    if (CloudConnectorId === 2) {
      const responseType = 'code';
      const dropboxOAuthUrl = `${process.env.CLOUD_CONFIGURATION_DROPBOX_AUTHURL}`;
      const clientId = `${process.env.CLOUD_CONFIGURATION_DROPBOX_CLIENTID}`;
      const redirectUri = `${process.env.CLOUD_CONFIGURATION_DROPBOX_REDIRECTURL}`;

      const url = `${dropboxOAuthUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}`;
      window.location.href = url;
    }

    if (CloudConnectorId === 4) {
      setIsIMAPConfigOpen(true)
    }
  }

  const connectorIcons: any = {
    1: <GoogleDrive />,
    2: <DropBox />,
    3: <FTP />,
    4: <Email />,
  };

  return (
    <Wrapper masterSettings={true}>
      {isLoading ? (
        <div className='flex h-full w-full justify-center'>
          <Loader />
        </div>
      ) : (
        <>
          {/* Navbar */}
          <div className='sticky  top-0 z-[6] flex h-[66px] items-center justify-between bg-whiteSmoke'>
            <div className='mx-3 flex w-full items-center justify-between'>
              <Typography type='h5' className='flex items-center justify-center text-center !font-bold'>
                Cloud Configuration
              </Typography>
              <Dropdown>
                <MenuButton
                  className={'!border-none !bg-transparent !outline-black'}
                  onClick={() => {
                    setIsPlusIconClicked(!isPlusIconClicked)
                  }}
                >
                  <BasicTooltip position='left' content='Connectors' className='!z-9'>
                    <div className='cursor-pointer rounded-full border border-solid border-[#6E6D7A] p-0.5'>
                      <PlusIcon color={'#6E6D7A'} />
                    </div>
                  </BasicTooltip>
                </MenuButton>
                <Menu className={`!z-[6] !-ml-4 !-mt-2 !w-[230px]`}>
                  {cloudConfigList.map((config: CloudConfigProps, index: number) => (
                    <MenuItem
                      disabled={config.ConnectorId === 3 || config.IsConnected}
                      key={index}
                      className='select-none gap-2 !font-proxima !font-normal !text-black !outline-black'
                      onClick={() => onEnableCloudConnection(config.ConnectorId)}
                    >
                      {connectorIcons[config.ConnectorId] || null}
                      <Typography type='h6' className='!font-normal'>
                        {config.Name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Dropdown>
            </div>
          </div>

          <div className='m-3 flex gap-4'>
            {cloudConfigList &&
              cloudConfigList.map((config: CloudConfigProps) => {
                if (config.IsConnected)
                  return (
                    <div className='h-[265px] w-[260px] rounded-[12px] border border-solid border-[#D8D8D8] p-[20px]'>
                      <div className='flex items-center justify-between'>
                        <div className={`h-[16px] w-[16px] rounded-full ${config.IsConnected ? 'bg-[#02B89D]' : 'bg-red-500'}`} />
                        <Dropdown>
                          <MenuButton className={'!border-none !bg-transparent !outline-black'} onClick={() => { }}>
                            <MoreOptionsIcon />
                          </MenuButton>
                          <Menu className={`!z-[6] !-ml-4 !-mt-2 !w-[168px]`}>
                            <MenuItem
                              key={'open'}
                              className='!font-proxima !font-normal !text-black !outline-black'
                              onClick={() => { }}
                            >
                              <Typography type='h6' className='!font-normal'>
                                Rename Alias
                              </Typography>
                            </MenuItem>
                          </Menu>
                        </Dropdown>
                      </div>
                      <div className='flex justify-center pb-2 pt-4'>
                        {config.ConnectorId === 1 ? (
                          <GoogleDriveIcon />
                        ) : config.ConnectorId === 2 ? (
                          <DropboxIcon />
                        ) : config.ConnectorId === 3 ? (
                          <FTPCloudIcon />
                        ) : (
                          <EmailCloudIcon />
                        )}
                      </div>
                      <div className='text-center font-proxima !text-sm text-[#333]'>
                        {!!imapConnectedEmail && config.ConnectorId === 4 ? imapConnectedEmail : config.AuthUserEmail}
                      </div>

                      <div className={`${config.ConnectorId !== 4 ? 'py-1' : 'py-4'} flex items-center justify-center`}>
                        {config.FolderPath ? (
                          <BasicTooltip position='top' content={config.FolderPath} className='!m-0 !z-[4]'>
                            <FolderIcon />
                          </BasicTooltip>
                        ) : config.ConnectorId !== 4 && (
                          <div className='flex py-1 justify-center items-center'>
                            <InfoIcon bgColor={'#FB2424'} />
                            <div className='ml-1 font-proxima text-sm text-[#FB2424]'>Source folder is not selected.</div>
                          </div>
                        )}
                      </div>

                      <div className='mt-4 text-center'>
                        <Button
                          variant={'btn-outline-primary'}
                          className='btn-md w-[100px] rounded-full'
                          disabled={false}
                          onClick={() => {
                            onDisableCloudConnection(config.ConnectorId)
                          }}
                          tabIndex={0}
                        >
                          <Typography className='!text-[14px] font-semibold uppercase'>
                            DISABLE
                          </Typography>
                        </Button>
                      </div>
                    </div>
                  )
                else <></>
              })}

            <SelectFolderModal
              folders={folders}
              visibleFolderModal={visibleFolderModal}
              setOnCloseModal={() => {
                setVisibleFolderModal(false)
                window.location.href = '/setup/cloudconfiguration';
              }}
              setFolderSelected={(value: boolean) => setIsAliasNameOpen(value)}
              companyId={CompanyId}
              selectedCloudConnectorId={selectedConnecterId}
            />

            <AliasPopupModal
              visibleAliasName={isAliasNameOpen}
              setOnCloseAliasModal={() => {
                setIsAliasNameOpen(false)
              }}
            />

            <IMAPConfigModal
              fetchCloudList={fetchCloudList}
              isIMAPConfigOpen={isIMAPConfigOpen}
              setIsIMAPConfigOpen={setIsIMAPConfigOpen}
              setIMAPConnectedEmail={setIMAPConnectedEmail}
            />
          </div>
        </>
      )}
    </Wrapper>
  )
}

export default ListCloudConfiguration