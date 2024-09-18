import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { formatErrorMessage } from '@/components/Common/Functions/FormatErrorMessage'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ControlFields from '@/components/controls'
import { DepartmentDrawerFormFieldErrorsProps, DepartmentDrawerFormFieldsProps } from '@/models/formFields'
import { useAppDispatch } from '@/store/configureStore'
import { departmentGetById, saveDepartment } from '@/store/features/master/dimensionSlice'
import { validate, verifyAllFieldsValues } from '@/utils/billposting'
import { useSession } from 'next-auth/react'
import { Button, Close, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditId?: number
}
const DepartmentDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()

  const initialFormFieldObj = {
    departmentCode: '',
    title: '',
  }

  const initialFormFieldErrorObj = {
    departmentCode: false,
    title: false,
  }

  const [formFields, setFormFields] = useState<DepartmentDrawerFormFieldsProps>(initialFormFieldObj)
  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<DepartmentDrawerFormFieldErrorsProps>(initialFormFieldErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] =
    useState<DepartmentDrawerFormFieldErrorsProps>(initialFormFieldErrorObj)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<boolean>(false)
  const [recordNo, setRecordNo] = useState<string>('')

  useEffect(() => {
    setHasFormFieldLibraryErrors(() => ({
      ...hasFormFieldLibraryErrors,
      departmentCode: formFields.departmentCode ? true : false,
      title: formFields.title ? true : false,
    }))
  }, [formFields?.departmentCode, formFields?.title])

  //Department Get Data API
  const getDepartmentById = async () => {
    const params = {
      CompanyId: CompanyId,
      Id: EditId,
    }
    performApiAction(dispatch, departmentGetById, params, (responseData: any) => {
      if (responseData) {
        const { Title, Status, DepartmentCode, RecordNo } = responseData
        setFormFields({
          ...formFields,
          departmentCode: DepartmentCode,
          title: Title,
        })
        setRecordNo(RecordNo)
        setStatus(Status)
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          departmentCode: true,
          title: true,
        })
      }
    })
  }

  //Save Data API
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const errorsValues = verifyAllFieldsValues(formFields)
    setHasFormFieldErrors(errorsValues)

    if (validate(hasFormFieldLibraryErrors)) {
      setIsLoading(true)
      const params = {
        Id: EditId || 0,
        CompanyId: CompanyId,
        DepartmentCode: formFields?.departmentCode,
        RecordNo: recordNo || '',
        Title: formFields?.title,
        Status: status || true,
      }

      performApiAction(dispatch, saveDepartment, params, (responseData: any) => {
        const dataMessage = responseData.Message
        if (responseData.ResponseStatus === 'Success') {
          Toast.success(`Department ${EditId ? 'updated' : 'added'} successfully.`)
          onClose("Save")
          initialData()
        }
        else {
          const errorMessage = formatErrorMessage(dataMessage, "Department");
          Toast.error('Error', errorMessage);
          setIsLoading(false)
        }
      }, () => {
        // ErrorData
        setIsLoading(false)
      })
    }
  }

  const generateId = () => {
    const prefix = 'PQ-D';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomDigits}`;
  }

  const setErrorTrue = () => {
    setHasFormFieldLibraryErrors({
      ...hasFormFieldLibraryErrors,
      title: true,
    })
    setHasFormFieldErrors({
      ...hasFormFieldErrors,
      title: true,
    })
  }

  const initialData = () => {
    setFormFields((prevState) => ({
      ...prevState,
      departmentCode: '',
      title: '',
    }))
    setHasFormFieldLibraryErrors((prevState) => ({
      ...prevState,
      title: false,
    }))
    setHasFormFieldErrors((prevState) => ({
      ...prevState,
      title: false,
    }))

    setRecordNo('')
    setStatus(false)
    setIsLoading(false)
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  useEffect(() => {
    if (onOpen && EditId) {
      getDepartmentById()
    } else {
      setFormFields({
        ...formFields,
        departmentCode: generateId(),
      })
    }
  }, [onOpen, EditId])

  // Form Fields
  const setFormValues = (key: string, value: string | number) => {
    setFormFields({
      ...formFields,
      [key]: value,
    })
  }

  const departmentDrawerFormFields: any = [
    accountingTool === 1 && {
      type: 'text',
      key: 'departmentCode',
      label: 'Id',
      name: 'departmentCode',
      id: 'departmentCode',
      placeholder: 'Please Enter Department Id',
      isValidate: true,
      readOnly: true,
      value: formFields?.departmentCode,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.departmentCode,
      classNames: 'laptop:mb-4 laptopMd:mb-4 lg:mb-4 xl:mb-4 hd:mb-5 2xl:mb-5 3xl:mb-5 flex',
    },
    {
      type: 'text',
      key: 'title',
      label: 'Name',
      name: 'title',
      id: 'title',
      placeholder: 'Please Enter Department Name',
      isValidate: true,
      value: formFields?.title,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.title,
      max: 100,
      classNames: 'flex',
    },
  ].filter(Boolean)

  return (
    <div className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 sm:w-2/4 laptop:w-2/6 laptopMd:w-2/6 lg:w-2/6 xl:w-2/6 hd:w-[418px] 2xl:w-[418px] 3xl:w-[418px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
      <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {EditId ? 'Edit' : 'Add'} Department
        </label>
        <div className='pt-2.5' onClick={() => clearAllData("Cancel")}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='m-5 flex-1'>
        <ControlFields formFields={departmentDrawerFormFields} />
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

export default DepartmentDrawer