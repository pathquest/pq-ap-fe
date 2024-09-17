import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { getBankAccountDropdown, getBuyerBankById, getPaymentMethodById, savePaymentMethod } from '@/store/features/paymentsetting/paymentSetupSlice'
import { Button, Close, Select, Text, Toast, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import { useEffect, useState } from 'react'

interface DrawerProps {
  paymentMethodName: string
  isOpen: boolean
  onClose: (value: string) => void
  ModeId: number
  Mode: string
  paymentMethodSetupId: number
}

const PaymentSetupDrawer: React.FC<DrawerProps> = ({ paymentMethodName, isOpen, onClose, paymentMethodSetupId, ModeId, Mode }) => {
  const dispatch = useAppDispatch()

  const [accountNumberOption, setAccountNumberOption] = useState([])
  const [paymentSetupId, setPaymentSetupId] = useState<number>(0)
  const [accountNumberError, setAccountNumberError] = useState<boolean>(false)

  const [bankName, setBankName] = useState<string>('')
  const [accountType, setAccountType] = useState<string>('')
  const [routingNumber, setRoutingNumber] = useState<string>('')

  const [modeClass, setModeClass] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isModeDisable, setIsModeDisable] = useState<boolean>(false)

  useEffect(() => {
    if (Mode === "View") {
      setModeClass('pointer-events-none')
      setIsModeDisable(true)
    }
    else {
      setModeClass('')
      setIsModeDisable(false)
    }
  }, [Mode])

  const setErrorTrue = () => {
    setAccountNumberError(true)
  }

  const initialData = () => {
    setAccountNumberOption([])
    setPaymentSetupId(0)
    setAccountNumberError(false)

    setAccountType('')
    setBankName('')
    setRoutingNumber('')

    setIsLoading(false)
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  // Buyer Bank Account Dropdown API
  const getBuyerBankAccountDropdown = async () => {
    try {
      const { payload, meta } = await dispatch(getBankAccountDropdown())
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setAccountNumberOption(payload?.ResponseData)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAccountNumberChange = (value: number) => {
    setAccountNumberError(false);
    setPaymentSetupId(0)
    setBankName('')
    setRoutingNumber('')
    setAccountType('')

    const params = {
      PaymentSetupId: Number(value)
    }

    performApiAction(dispatch, getBuyerBankById, params, (responseData: any) => {
      const { AccountingType, RoutingNumber, PaymentSetupId, BankName } = responseData
      setPaymentSetupId(PaymentSetupId)
      setBankName(BankName)
      setRoutingNumber(RoutingNumber)
      setAccountType(AccountingType)
    })
  }

  const getAccountPaymentMethodById = async () => {
    const params = {
      PaymentSetupMethodId: paymentMethodSetupId
    }

    performApiAction(dispatch, getPaymentMethodById, params, (responseData: any) => {
      const { AccountingType, RoutingNumber, BankName } = responseData
      setPaymentSetupId(ModeId || 0)
      setRoutingNumber(RoutingNumber || "")
      setBankName(BankName || '')
      setAccountType(AccountingType || "")
    })
  }

  useEffect(() => {
    if (isOpen) {
      getBuyerBankAccountDropdown()
      if (ModeId > 0) {
        getAccountPaymentMethodById()
      }
    }
  }, [isOpen, ModeId])

  //Save Data API
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (Mode === "Add") {
      e.preventDefault();
      setIsLoading(true)

      paymentSetupId <= 0 && setAccountNumberError(true)
      if (paymentSetupId > 0) {
        try {
          const params = {
            PaymentSetupId: Number(paymentSetupId),
            PaymentSetupMethodId: paymentMethodSetupId || 0,
            isAch: paymentMethodName === "ACH" ? true : null,
            isVcn: paymentMethodName === "Virtual Card" ? true : null,
            isCheck: null,
          }
          const { payload, meta } = await dispatch(savePaymentMethod(params))
          const dataMessage = payload?.Message
          if (meta?.requestStatus === 'fulfilled') {
            if (payload?.ResponseStatus === 'Success') {
              Toast.success(`Payment method has been added successfully.`)
              clearAllData("Save")
              setIsLoading(false)
            } else {
              Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
              setIsLoading(false)
            }
          } else {
            Toast.error(`${payload?.status} : ${payload?.statusText}`)
            setIsLoading(false)
          }
        } catch (error) {
          console.error(error)
        }
      } else {
        setIsLoading(false)
      }
    }
    else {
      clearAllData("")
    }
  }

  return (
    <div
      className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow w-[500px] max-[440px]:w-11/12 sm:w-2/4 lg:w-[500px] xl:w-[500px] hd:w-[500px] 2xl:w-[500px] 3xl:w-[500px] ${isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}>
      <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {Mode} {paymentMethodName} Payment Method
        </label>
        <div className='pt-2.5' onClick={() => clearAllData("")}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='mx-5 mb-12 flex-1'>
        <div className={`mt-5 ${modeClass} `}>
          <Select
            id='accountNumber'
            label='Account Number'
            options={accountNumberOption}
            disabled={isModeDisable}
            validate
            defaultValue={paymentSetupId + ""}
            getValue={(value) => {
              handleAccountNumberChange(value)
            }}
            getError={() => { }}
            hasError={accountNumberError}
          />
        </div>
        <div className='mt-5 flex gap-5'>
          <div className={`flex-1 ${modeClass} `}>
            <Text
              id='bankName'
              label='Bank Name'
              name='bankName'
              placeholder="Please Enter Bank Name"
              readOnly
              disabled
              validate
              value={bankName}
              getValue={(value) => { setBankName(value) }}
              getError={() => { }}
            />
          </div>
          <div className={`flex-1 ${modeClass} `}>
            <Text
              id='accountType'
              label='Account Type'
              name='accountType'
              placeholder="Please Enter Account Type"
              readOnly
              disabled
              validate
              value={accountType}
              getValue={() => { }}
              getError={() => { }}
            />
          </div>
        </div>
        <div className={`mt-5 ${modeClass} `}>
          <Text
            label='Routing Number'
            id='routingNumber'
            name='routingNumber'
            placeholder='Please Enter Routing Number'
            validate
            readOnly
            disabled
            value={routingNumber}
            getValue={() => { }}
            getError={() => { }}
          />
        </div>
      </div>

      <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
        <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={() => clearAllData("")} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
            <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
          </Button>
          <Button
            type='submit'
            onClick={handleSubmit}
            className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : Mode === "Add" ? "SAVE" : "CLOSE"}
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSetupDrawer