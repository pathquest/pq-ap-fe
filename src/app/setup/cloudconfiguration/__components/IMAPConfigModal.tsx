import agent from '@/api/axios'
import {
  Button,
  Close,
  Email,
  Loader,
  Modal,
  ModalAction,
  ModalContent,
  ModalTitle,
  Password,
  Select,
  Text,
  Toast,
  Typography,
} from 'pq-ap-lib'
import React, { Dispatch, SetStateAction, useState } from 'react'

type IMAPConfigType = {
  email: string
  password: string
  imapHost: string
  port: number
  imapSocket: string
}

type IMAPConfigErrType = {
  email: boolean
  password: boolean
  imapHost: boolean
  port: boolean
  imapSocket: boolean
}

type IMAPConfigModalPropsType = {
  fetchCloudList: () => void
  isIMAPConfigOpen: boolean
  setIsIMAPConfigOpen: Dispatch<SetStateAction<boolean>>
  setIMAPConnectedEmail: Dispatch<SetStateAction<string>>
}

//vars
const IMAPConfig_initialState = {
  email: '',
  password: '',
  imapHost: '',
  port: 0,
  imapSocket: '',
}

const IMAPConfigErr_initialState = {
  email: false,
  password: false,
  imapHost: false,
  port: false,
  imapSocket: false,
}

const IMAPConfigHasNoErr_initialState = {
  email: true,
  password: true,
  imapHost: true,
  port: true,
  imapSocket: true,
}

const IMAPSocketOptions = [
  { label: 'None', value: 1 },
  { label: 'Autodetect', value: 2 },
  { label: 'SSL/TLS', value: 3 },
  { label: 'STARTTLS', value: 4 },
]

const IMAPConfigModal = ({
  fetchCloudList,
  isIMAPConfigOpen,
  setIsIMAPConfigOpen,
  setIMAPConnectedEmail,
}: IMAPConfigModalPropsType) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [IMAPConfig, setIMAPConfig] = useState<IMAPConfigType>(IMAPConfig_initialState)
  const [IMAPConfigErr, setIMAPConfigErr] = useState<IMAPConfigErrType>(IMAPConfigErr_initialState)
  const [IMAPConfigHasNoErr, setIMAPConfigHasNoErr] = useState<IMAPConfigErrType>(IMAPConfigHasNoErr_initialState)

  const handleIMAPConfigChange = (value: string | number, field: keyof IMAPConfigType) => {
    if (field === 'port' && !/^(\d{0,3})?$/.test(value.toString())) {
      return
    }
    setIMAPConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignIn = async () => {
    if (validated() && Object.values(IMAPConfigHasNoErr).every((value) => value)) {
      setIsLoading(true)
      const params = {
        HostName: IMAPConfig.imapHost,
        PortNumber: parseInt(IMAPConfig.port.toString()),
        UserName: IMAPConfig.email,
        Password: IMAPConfig.password,
        SocketType: parseInt(IMAPConfig.imapSocket),
      }
      try {
        const response = await agent.accountantDashboard.imapConnect(params)
        if (response.ResponseStatus === 'Success') {
          setIMAPConnectedEmail(IMAPConfig.email)
          Toast.success('Success', 'Connected Successfully')
          fetchCloudList()
          handleClose()
        } else Toast.error('Error', response.Message)
        setIsLoading(false)
      } catch (error) {
        handleClose()
        setIsLoading(false)
        console.error(error)
      }
    }
  }

  const validated = () => {
    Object.keys(IMAPConfig).forEach((key) => {
      if (!IMAPConfig[key as keyof IMAPConfigType]) {
        setIMAPConfigErr((prev) => ({ ...prev, [key]: true }))
      } else {
        setIMAPConfigErr((prev) => ({ ...prev, [key]: false }))
      }
    })

    return Object.values(IMAPConfig).every((value) => !!value)
  }

  const handleClose = () => {
    setIsIMAPConfigOpen(false)
    setIMAPConfig(IMAPConfig_initialState)
    setIMAPConfigErr(IMAPConfigErr_initialState)
    setIMAPConfigHasNoErr(IMAPConfigHasNoErr_initialState)
  }

  return (
    <Modal isOpen={isIMAPConfigOpen} onClose={handleClose}>
      <ModalTitle className={`${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
        <div className='flex flex-col px-4 py-3'>
          <Typography type='h5' className='!font-bold'>
            Sign in to your email account
          </Typography>
        </div>
        <div className={`p-3`} onClick={handleClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className={`${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
        <div className='flex flex-col gap-5 p-4'>
          <Email
            label='Email'
            required
            validate
            value={IMAPConfig.email}
            getValue={(value) => handleIMAPConfigChange(value, 'email')}
            getError={(err) => setIMAPConfigHasNoErr((prev) => ({ ...prev, email: err }))}
            hasError={IMAPConfigErr.email}
          />
          <Password
            novalidate
            label='Password'
            value={IMAPConfig.password}
            getValue={(value) => handleIMAPConfigChange(value, 'password')}
            getError={(err) => setIMAPConfigHasNoErr((prev) => ({ ...prev, password: err }))}
            hasError={IMAPConfigErr.password}
          />
          <div className='flex w-full gap-5'>
            <Text
              validate
              className='!pt-2'
              label='IMAP Host'
              value={IMAPConfig.imapHost}
              getValue={(value) => handleIMAPConfigChange(value, 'imapHost')}
              getError={(err) => setIMAPConfigHasNoErr((prev) => ({ ...prev, imapHost: err }))}
              hasError={IMAPConfigErr.imapHost}
            />
            <Text
              validate
              minChar={2}
              maxChar={3}
              className='!pt-2'
              label='Port'
              value={!IMAPConfig.port ? '' : IMAPConfig.port}
              getValue={(value) => handleIMAPConfigChange(value, 'port')}
              getError={(err) => setIMAPConfigHasNoErr((prev) => ({ ...prev, port: err }))}
              hasError={IMAPConfigErr.port}
            />
            <div className='w-full'>
              <Select
                validate
                label='IMAP Socket'
                defaultValue={IMAPConfig.imapSocket}
                getValue={(value) => { handleIMAPConfigChange(value, 'imapSocket'); setIMAPConfigErr((prev) => ({ ...prev, imapSocket: false })) }}
                getError={(err) => setIMAPConfigHasNoErr((prev) => ({ ...prev, imapSocket: err }))}
                id='imap-socket'
                options={IMAPSocketOptions}
                hasError={IMAPConfigErr.imapSocket}
              />
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalAction className={`flex w-full items-center justify-center ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
        <Button
          className={`btn-sm mx-2 my-3 !h-[36px] !w-32 rounded-full font-semibold`}
          variant={`btn-primary`}
          onClick={handleSignIn}
        >
          SIGN IN
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default IMAPConfigModal