import { useRouter } from 'next/navigation'
import { Button, Close, Datepicker, Modal, ModalAction, ModalContent, ModalTitle, Select, Toast } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

// Store
import { formatDate, getNextYear, getPastYear } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import {
  getBankAccountDrpdwnList,
  markAsPaidBill,
} from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  selectedRowIds?: any
  onDataFetch?: any
  selectedBillDetails?: any
}

const MarkAsPaidModal: React.FC<ActionsProps> = ({ onOpen, onClose, onDataFetch, selectedBillDetails }) => {
  const router = useRouter()

  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const billsToPayReducer = useAppSelector((state: { billsToPayReducer: any }) => state.billsToPayReducer)
  const dispatch = useAppDispatch()

  const [paymentMethod, setPaymentMethod] = useState<number>(0)
  const [paymentMthdErr, setPaymentMthdErr] = useState<boolean>(false)
  const [paymentAccount, setPaymentAccount] = useState<number>(0)
  const [paymentAccErr, setPaymentAccErr] = useState(false)
  const [paymentDate, setPaymentDate] = useState<any>('')

  const [paymentDateErr, setPaymentDateErr] = useState(false)
  const [bankAccList, setBankAccList] = useState<any>([])
  const [formIsValid, setFormIsValid] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleReset = () => {
    setPaymentMethod(0)
    setPaymentMthdErr(false)
    setPaymentAccount(0)
    setPaymentAccErr(false)
    setPaymentDate('')
    setPaymentDateErr(false)
    onClose()
  }

  const option = [
    {
      label: 'Record Transfer',
      value: 2,
    },
    {
      label: 'Cash',
      value: 3,
    },
  ]


  const fetchBankAccountDrpdwnList = async () => {
    performApiAction(dispatch, getBankAccountDrpdwnList, null, (responseData: any) => {
      const updatedBankAccList = responseData.map((f: any) => ({
        label: f.label,
        value: Number(f.value),
      }))

      if (paymentMethod) {
        const foundItem = responseData.find((f: any) => Number(f.value) === paymentMethod)
        if (foundItem) {
          setBankAccList([{ label: foundItem.label, value: Number(foundItem.value) }])
        } else {
          setBankAccList(updatedBankAccList)
        }
      } else {
        setBankAccList(updatedBankAccList)
      }
    })
  }

  useEffect(() => {
    if (onOpen === true) {
      const currentDate = new Date()
      setPaymentDate(formatDate(currentDate + ''))
      fetchBankAccountDrpdwnList()
    }
  }, [onOpen, CompanyId, paymentMethod])

  const transformData = (data: any) => {
    // Create a map to group bills by VendorId
    const vendorMap = new Map()

    data?.forEach((item: any) => {
      if (!vendorMap.has(item.VendorId)) {
        vendorMap.set(item.VendorId, [])
      }
      vendorMap.get(item.VendorId).push({
        BillId: item.AccountPaybleId,
        Amount: item.Amount,
        CreditsList: null,
      })
    })

    // Transform the map into the desired structure
    const VednorBillList = Array.from(vendorMap, ([VednorId, BillList]) => ({
      VednorId,
      BillList,
    }))

    return VednorBillList
  }

  const convertToISO8601 = (dateString: string) => {
    // Split the date string into month, day, and year
    const [month, day, year] = dateString.split('/')

    // Pad month and day with leading zeros if necessary
    const paddedMonth = month?.padStart(2, '0')
    const paddedDay = day?.padStart(2, '0')

    // Construct the ISO 8601 format string
    const isoDate = `${year}-${paddedMonth}-${paddedDay}T00:00:00Z`

    return isoDate
  }

  const applyChanges = async () => {
    setIsLoading(true)
    const params = {
      PaymentMethod: paymentMethod ? paymentMethod : null,
      BankAccountId: paymentAccount ? paymentAccount : null,
      PaymentDate: convertToISO8601(paymentDate.trim()),
      VednorBillList: selectedBillDetails?.length > 0 ? transformData(selectedBillDetails) : [],
    }
    performApiAction(dispatch, markAsPaidBill, params, () => {
      setIsLoading(false)
      Toast.success('Bills has been successfully marked as paid.')
      handleReset()
      router.push(billsToPayReducer.currentPath)
      onDataFetch && onDataFetch()
    }, () => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    const isFormValid = paymentMethod >= 0 && paymentAccount >= 0 && paymentDate?.trim().length > 0
    setFormIsValid(isFormValid)
  }, [paymentMethod, paymentAccount, paymentDate])

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    let hasError = false

    if (paymentMethod <= 0) {
      setPaymentMthdErr(true)
      hasError = true
    }

    if (paymentAccount <= 0) {
      setPaymentAccErr(true)
      hasError = true
    }

    if (paymentDate?.trim().length <= 0) {
      setPaymentDateErr(true)
      hasError = true
    }

    if (!hasError) {
      applyChanges()
    }
  }

  return (
    <Modal isOpen={onOpen} onClose={handleReset} width='352px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-black'>Payment Details</div>
        <div className='pt-2.5' onClick={handleReset}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='grid grid-cols-1 p-5'>
        <div>
          <Datepicker
            id='payment-date'
            label='Payment Date'
            format='MM/DD/YYYY'
            startYear={getPastYear()}
            endYear={getNextYear()}
            value={paymentDate}
            getValue={(e) => {
              setPaymentDate(e)
              setPaymentDateErr(false)
            }}
            getError={() => { }}
            hasError={paymentDateErr}
            validate
          />
        </div>
        <div className='py-5'>
          <Select
            id='payment-method'
            label='Payment Method'
            options={option || []}
            defaultValue={paymentMethod}
            getValue={(e) => {
              setPaymentMethod(e)
              e > 0 && setPaymentMthdErr(false)
            }}
            getError={() => { }}
            hasError={paymentMthdErr}
            validate
          />
        </div>
        <div>
          <Select
            id='payment-account'
            label='Payment Account'
            options={bankAccList || []}
            defaultValue={paymentAccount}
            getValue={(e) => {
              setPaymentAccount(e)
              e > 0 && setPaymentAccErr(false)
            }}
            getError={() => { }}
            hasError={paymentAccErr}
            validate
          />
        </div>
      </ModalContent>

      <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
        <Button
          className={`btn-sm !h-9 rounded-full !w-[94px]`}
          variant={`btn-outline-primary`}
          onClick={handleReset}>
          <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">CANCEL</label>
        </Button>
        <Button
          className={`btn-sm !h-9 rounded-full !w-[84px] ${!formIsValid ? 'opacity-40' : ''}`}
          variant={`btn-primary`}
          disabled={!formIsValid}
          onClick={handleSubmit}>
          <label className={`flex items-center justify-center ${isLoading ? "animate-spin mx-[26px]" : "cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
            {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
          </label>
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default MarkAsPaidModal
