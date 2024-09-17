import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { formatErrorMessage } from '@/components/Common/Functions/FormatErrorMessage'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { saveTerm, termGetById } from '@/store/features/master/aptermSlice'
import { useSession } from 'next-auth/react'
import { Button, Close, Text, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditId?: number
}

const APTermDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()

  const [name, setName] = useState<string>('')
  const [nameError, setNameError] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('')
  const [dueDay, setDueDay] = useState<string>('')
  const [dueDayError, setDueDayError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [recordNo, setRecordNo] = useState<string>('')
  const [status, setStatus] = useState<boolean>(false)

  const setErrorTrue = () => {
    setNameError(true)
    setDueDayError(true)
  }

  const initialData = () => {
    setName('')
    setNameError(false)
    setDescription('')

    setDueDay('')
    setDueDayError(false)

    setIsLoading(false)
    setRecordNo('')
    setStatus(false)
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  //APTerm Data API
  const getAPTermById = async () => {
    const params = {
      CompanyId: CompanyId,
      Id: EditId,
    }
    performApiAction(dispatch, termGetById, params, (responseData: any) => {
      if (responseData) {
        const { Name, DueDays, Description, RecordNo, Status } = responseData;
        setName(Name || '')
        setDueDay(DueDays || '0')
        setRecordNo(RecordNo || '')
        setDescription(Description || '')
        setStatus(Status)
      }
    })
  }

  //Save Data API
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    name.trim().length <= 0 && setNameError(true)
    String(dueDay).trim().length <= 0 && setDueDayError(true)

    if (name.trim().length > 0 && String(dueDay).trim().length > 0) {
      setIsLoading(true)

      const params = {
        Id: EditId || 0,
        CompanyId: CompanyId,
        RecordNo: recordNo || '',
        Name: name,
        DueDays: Number(dueDay) || 0,
        Status: status || true,
        Description: description || ''
      }

      performApiAction(dispatch, saveTerm, params, (responseData: any) => {
        const dataMessage = responseData.Message
        if (responseData.ResponseStatus === 'Success') {
          Toast.success(`AP Term ${EditId ? 'updated' : 'added'} successfully.`)
          onClose("Save")
          initialData()
        }
        else {
          const errorMessage = formatErrorMessage(dataMessage, "AP Term");
          Toast.error('Error', errorMessage);
          setIsLoading(false)
        }
      }, () => {
        // ErrorData
        setIsLoading(false)
      })
    }
  }

  const handleDueDayChange = (value: string) => {
    if (value === '') {
      setDueDay('');
      return;
    }
    const intValue = parseInt(value);
    if (!isNaN(intValue)) {
      if (intValue >= 0 && intValue <= 90) {
        setDueDay(intValue.toString());
      } else {
        setDueDay(Math.max(0, Math.min(90, intValue)).toString());
      }
    }
  }

  useEffect(() => {
    if (onOpen && EditId) {
      getAPTermById()
    }
  }, [onOpen, EditId])

  return (
    <div className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 sm:w-2/4 laptop:w-2/6 laptopMd:w-2/6 lg:w-2/6 xl:w-2/6 hd:w-[418px] 2xl:w-[418px] 3xl:w-[418px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
      <div className=' sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {EditId ? 'Edit' : 'Add'} AP Term
        </label>
        <div className='pt-2.5' onClick={() => clearAllData("Cancel")}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='laptop:m-4 laptopMd:m-4 lg:m-4 xl:m-4 hd:m-5 2xl:m-5 3xl:m-5 flex-1'>
        <div className='laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex'>
          <Text
            label='Name'
            id='name'
            name='name'
            placeholder='Please Enter Name'
            validate
            maxLength={20}
            hasError={nameError}
            value={name}
            getValue={(value: any) => { /^[a-zA-Z0-9 ]*$/.test(value) && setName(value) }}
            getError={() => { }} />
        </div>
        <div className='laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex'>
          <Text
            label='Due Day'
            id='dueDay'
            name='dueDay'
            placeholder='Please Enter Due Day'
            validate
            hasError={dueDayError}
            value={dueDay}
            getValue={(value: any) => handleDueDayChange(value)}
            getError={() => { }} />
        </div>
        <div className='laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex'>
          <Text
            label='Description'
            id='description'
            name='description'
            placeholder='Please Enter Description'
            value={description}
            getValue={(value: any) => setDescription(value)}
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

export default APTermDrawer
