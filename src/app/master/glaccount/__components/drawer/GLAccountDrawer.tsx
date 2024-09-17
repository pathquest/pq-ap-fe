import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { formatErrorMessage } from '@/components/Common/Functions/FormatErrorMessage'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { glAccountGetById, saveGLAccount } from '@/store/features/master/glAccountSlice'
import { useSession } from 'next-auth/react'
import { Button, Close, Select, Text, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditId?: number
}

const GLAccountDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()

  const [accountName, setAccountName] = useState<string>('')
  const [accountNameError, setAccountNameError] = useState<boolean>(false)
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [accountType, setAccountType] = useState<string>('')
  const [accountTypeError, setAccountTypeError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [recordNo, setRecordNo] = useState<string>('')
  const [status, setStatus] = useState<boolean>(false)

  const accountTypeOptions = [
    { label: 'Expenses', value: 'Expenses' },
    { label: 'Banks', value: 'Banks' },
    { label: 'Assets', value: 'Assets' },
    { label: 'Credit cards', value: 'Credit cards' },
    { label: 'Liabilities', value: 'Liabilities' },
    { label: 'Equity', value: 'Equity' },
  ]

  const setErrorTrue = () => {
    setAccountNameError(true)
    setAccountTypeError(true)
  }

  const initialData = () => {
    setAccountName('')
    setAccountNameError(false)

    setAccountType('')
    setAccountTypeError(false)

    setAccountNumber('')

    setIsLoading(false)
    setRecordNo('')
    setStatus(false)
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  //GL Account Data API
  const getAccountById = async () => {
    const params = {
      CompanyId: CompanyId,
      Id: EditId,
    }
    performApiAction(dispatch, glAccountGetById, params, (responseData: any) => {
      if (responseData) {
        const { Name, AccountCode, AccountType, RecordNo, Status } = responseData;
        setAccountName(Name || '');
        setAccountNumber(AccountCode || '');
        setAccountType(AccountType || '');
        setRecordNo(RecordNo || '');
        setStatus(Status);
      }
    })
  }

  //Save Data API
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    accountName.trim().length <= 0 && setAccountNameError(true)
    accountType.trim().length <= 0 && setAccountTypeError(true)

    if (accountName.trim().length > 0 && accountType.trim().length > 0) {
      setIsLoading(true)

      const params = {
        Id: EditId || 0,
        CompanyId: CompanyId,
        RecordNo: recordNo || '',
        Name: accountName,
        AccountCode: accountNumber || '',
        AccountType: accountType || '',
        Status: status || true,
      }

      performApiAction(dispatch, saveGLAccount, params, (responseData: any) => {
        const dataMessage = responseData.Message
        if (responseData.ResponseStatus === 'Success') {
          Toast.success(`Account ${EditId ? 'updated' : 'added'} successfully.`)
          onClose("Save")
          initialData()
        }
        else {
          const errorMessage = formatErrorMessage(dataMessage, "GL Account");
          Toast.error('Error', errorMessage);
          setIsLoading(false)
        }
      }, () => {
        // ErrorData
        setIsLoading(false)
      })
    }
  }

  useEffect(() => {
    if (onOpen && EditId) {
      getAccountById()
    }
  }, [EditId])

  return (
    <div className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 sm:w-2/4 laptop:w-2/6 laptopMd:w-2/6 lg:w-2/6 xl:w-2/6 hd:w-[418px] 2xl:w-[418px] 3xl:w-[418px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
      <div className=' sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {EditId ? 'Edit' : 'Add'} GL Account
        </label>
        <div className='pt-2.5' onClick={() => clearAllData("Cancel")}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='laptop:m-4 laptopMd:m-4 lg:m-4 xl:m-4 hd:m-5 2xl:m-5 3xl:m-5 flex-1'>
        <div className='laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex'>
          <Text
            label='Account Name'
            id='accountName'
            name='accountName'
            placeholder='Please Enter Account Name'
            validate
            maxLength={100}
            hasError={accountNameError}
            value={accountName}
            getValue={(value: any) => { /^[a-zA-Z0-9 ]*$/.test(value) && setAccountName(value) }}
            getError={() => { }}
          />
        </div>
        <div className='laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex'>
          <Select
            label='Account Type'
            id='accounttype'
            name='accounttype'
            options={accountTypeOptions}
            validate
            defaultValue={accountType}
            hasError={accountTypeError}
            getValue={(value) => {
              setAccountType(value)
              setAccountTypeError(false)
            }}
            getError={() => { }}
          />
        </div>
        <div className='laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex'>
          <Text
            label='Account Number'
            id='accountNumber'
            name='accountNumber'
            placeholder='Please Enter Account Number'
            maxLength={20}
            value={accountNumber}
            getValue={(value: any) => { /^[a-zA-Z0-9 ]*$/.test(value) && setAccountNumber(value) }}
            getError={() => { }}
          />
        </div>
      </div>
      <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
        <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={() => clearAllData("Cancel")} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
            <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
          </Button>
          <Button
            type='submit'
            onClick={handleSubmit}
            className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GLAccountDrawer