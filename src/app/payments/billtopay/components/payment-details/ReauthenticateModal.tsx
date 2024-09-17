import CrossIcon from '@/assets/Icons/CrossIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { reauthentication } from '@/store/features/auth/authSlice'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Password } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  onPaymentDetailsClose?: any
  onSubmitPay?: any
  onUploadAttachments?: any
}

const ReauthenticateModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  onPaymentDetailsClose,
  onSubmitPay,
  onUploadAttachments,
}) => {
  const dispatch = useAppDispatch()
  const [currPassword, setCurrPassword] = useState('')
  const [passwordErr, setPasswordErr] = useState(false)
  const [passwordErrMsg, setPasswordErrMsg] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    let hasError = false

    if (currPassword.trim().length <= 0) {
      setPasswordErr(true)
      setPasswordErrMsg('Please enter your password')

      hasError = true
    }

    if (!hasError) {
      HandleReauthenticate()
    }
  }

  const HandleReauthenticate = async () => {
    setIsLoading(true)
    const params = {
      Password: currPassword,
    }

    performApiAction(dispatch, reauthentication, params, () => {
    setIsLoading(false)
    onUploadAttachments()
    onSubmitPay()
    onPaymentDetailsClose()
    }, () => {
      setIsLoading(false)
      setPasswordErr(true)
      setPasswordErrMsg('The password you entered is incorrect')
    })
  }

  useEffect(() => {
    setPasswordErr(false)
  }, [onOpen])

  return (
    <Modal isOpen={onOpen} onClose={onClose} width='388px'>
      <ModalTitle className='!h-[64px] py-[21px] px-5'>
        <div className='font-proxima flex items-center text-lg font-bold tracking-[0.02em] text-darkCharcoal'>Confirm Password to Continue</div>
        <div className='pt-2.5' onClick={onClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='p-5 flex flex-col'>
        <label htmlFor='password' className={`text-sm pb-1.5 w-full ${passwordErr ? "text-[#FB2424]" : "text-slatyGrey"}`}>
          Enter Your Password
        </label>
        <Password
          getValue={(e) => {
            setCurrPassword(e)
            setPasswordErr(false)
          }}
          getError={() => { }}
          hasError={passwordErr}
          errorMessage={passwordErrMsg}
          novalidate
          validate
        />
      </ModalContent>
      <ModalAction className='p-5 h-[76px]'>
        <Button className='rounded-full w-full' variant='btn-primary' onClick={handleSubmit}>
          <label className={`flex items-center justify-center ${isLoading ? "animate-spin mx-[26px]" : "cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
            {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "REAUTHENTICATE"}
          </label>
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default ReauthenticateModal