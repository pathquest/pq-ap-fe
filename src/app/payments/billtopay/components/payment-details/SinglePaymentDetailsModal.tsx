import { formatDate, getNextYear, getPastYear } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { uploadAttachment } from '@/store/features/bills/billSlice'
import { getBankAccountDrpdwnList, getPaymentMethodsbyVendor, getVendorCreditList, getautomaticvendorcredit, sendForPay } from '@/store/features/billsToPay/billsToPaySlice'
import { format, parse } from 'date-fns'
import { useSession } from 'next-auth/react'
import { BasicTooltip, Button, Close, Datepicker, Modal, ModalTitle, Radio, Select, Switch, Text, Toast, Uploader } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import ReauthenticateModal from './ReauthenticateModal'
import SingleBillPartialPayment from '../modals/SingleBillPartialPayment'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'

interface CurrentBillValueProps {
  billNumber: string
  billDate: string
  dueDate: string
  vendorName: string
  discount: null | number
  payAmount: number
  vendorId: number
}

interface ActionsProps {
  onOpen: boolean
  onClose: any
  currentValues: CurrentBillValueProps
  onDataFetch: any
}

const SinglePaymentDetailsModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  currentValues,
  onDataFetch,
}) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

  const { accountPaybleId, billNumber, billDate, dueDate, vendorName, discount, payAmount, remainingAmount, vendorId }: any = currentValues || {}

  const [isCreditAvailed, setIsCreditAvailed] = useState<boolean>(true)
  const [isFullPaymentSelected, setIsFullPaymentSelected] = useState<boolean>(true)
  const [isPartialPaymentSelected, setIsPartialPaymentSelected] = useState<boolean>(false)
  const [isReauthenticateModalOpen, setIsReauthenticateModalOpen] = useState<boolean>(false)

  const [paymentMethodOption, setPaymentMethodOption] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<number>(0)
  const [paymentMethodError, setPaymentMethodError] = useState<boolean>(false)

  const [bankMethodOption, setBankMethodOption] = useState<any>([])
  const [selectedBank, setSelectedBank] = useState<number>(0)
  const [selectedBankError, setSelectedBankError] = useState<boolean>(false)

  const [selectedBillDate, setSelectedBillDate] = useState<string>('')
  const [billDateError, setBillDateError] = useState<boolean>(false)

  const [creditAvailedAmount, setCreditAvailedAmount] = useState<number>(0)
  const [creditAvailedError, setCreditAvailedError] = useState<boolean>(false)
  const [creditAvailedErrorMsg, setCreditAvailedErrorMsg] = useState<string>('')

  const [manualAmountToPay, setManualAmountToPay] = useState<number>(0)
  const [vendorCreditList, setVendorCreditList] = useState<any[]>([])
  const [fullPaymentCreditList, setFullPaymentCreditList] = useState([])

  const [uploadedFile, setUploadedFile] = useState<any[]>([])
  const [isAllocateCreditModalOpen, setAllocateCreditModalOpen] = useState<boolean>(false)
  const [previousCreditAmount, setPreviousCreditAmount] = useState<number>(0);
  const [isPaymentButtonDisabled, setIsPaymentButtonDisabled] = useState<boolean>(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false)

  const handleResetAll = () => {
    setIsCreditAvailed(true)
    setIsFullPaymentSelected(true)
    setIsPartialPaymentSelected(false)
    setIsReauthenticateModalOpen(false)
    setPaymentMethodOption([])
    setPaymentMethod(0)
    setPaymentMethodError(false)
    setBankMethodOption([])
    setSelectedBank(0)
    setSelectedBankError(false)
    setSelectedBillDate('')
    setBillDateError(false)
    setCreditAvailedAmount(0)
    setCreditAvailedError(false)
    setCreditAvailedErrorMsg('')
    setManualAmountToPay(0)
    setUploadedFile([])
    setVendorCreditList([])
    setFullPaymentCreditList([])
    setAllocateCreditModalOpen(false)
    setPreviousCreditAmount(0)
    setIsPaymentButtonDisabled(false)
    setIsPaymentLoading(false)
  }

  // getting data from Allocate Credit Modal for single vendor with single bills
  const handleManualCreditdata = (creditList: any, updatedVendorCreditList: any, amount: number) => {
    setManualAmountToPay(amount)
    setVendorCreditList(updatedVendorCreditList)
    const totalCreditAmount = creditList.reduce((total: number, credit: { CreditAmount: number }) => total + credit.CreditAmount, 0)
    isCreditAvailed ? setCreditAvailedAmount(totalCreditAmount) : setCreditAvailedAmount(0)
    setPreviousCreditAmount(totalCreditAmount)

    // Checking if manualCreditList has data
    if (amount > 0) {
      setIsPartialPaymentSelected(true)
      setIsFullPaymentSelected(false)
    } else {
      setIsFullPaymentSelected(true)
      setIsPartialPaymentSelected(false)
    }
  }

  const handleCloseReauthenticateModal = () => {
    setIsReauthenticateModalOpen(false)
  }

  const handleCreditAvailedToggle = () => {
    setIsCreditAvailed(!isCreditAvailed);

    if (isCreditAvailed) {
      setPreviousCreditAmount(creditAvailedAmount);
      setCreditAvailedAmount(0);
    } else {
      setCreditAvailedAmount(previousCreditAmount);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('billAmount')
    localStorage.removeItem('availCredits')
  }

  const handleAutoCreditSelected = () => {
    setIsFullPaymentSelected(true)
    setIsPartialPaymentSelected(false)
    setManualAmountToPay(0)
    if (isCreditAvailed) {
      fetchAutomaticVendorCredit();
    }
  }

  const handleManualCreditSelected = () => {
    setIsFullPaymentSelected(false)
    setIsPartialPaymentSelected(true)
    setAllocateCreditModalOpen(true)
  }

  const handleCloseModal = () => {
    onClose()
    handleResetAll()
    clearLocalStorage()
  }

  const handleAllocateCreditModalClose = () => {
    setAllocateCreditModalOpen(false)
  }

  const fetchPaymentMethods = async () => {
    const params = {
      VendorIds: [vendorId] ?? 0,
    }

    performApiAction(dispatch, getPaymentMethodsbyVendor, params, (responseData: any) => {
      const dynamicPaymentMethodOptions = responseData.flatMap(
        (vendor: any) =>
          vendor.PaymentMethodList?.map((method: any) => ({
            label: method.label,
            value: Number(method.value),
            DefaultBankId: method.DefaultBankId
          })) ?? []
      )
      setPaymentMethodOption(dynamicPaymentMethodOptions)
      setPaymentMethod(responseData[0].PreferdPayment ?? 0)

      const preferredPaymentMethod = dynamicPaymentMethodOptions.find(
        (method: any) => Number(method.value) === responseData[0].PreferdPayment
      )
      if (preferredPaymentMethod && preferredPaymentMethod.DefaultBankId) {
        setSelectedBank(preferredPaymentMethod.DefaultBankId)
      }
    })
  }

  const fetchBankAccountDrpdwnList = async () => {
    performApiAction(dispatch, getBankAccountDrpdwnList, null, (responseData: any) => {
      const formattedOptions = responseData.map((item: any) => ({ ...item, value: Number(item.value) }))
      setBankMethodOption(formattedOptions)
    })
  }
  const fetchVendorCreditList = async () => {
    const params = { VendorId: vendorId }
    performApiAction(dispatch, getVendorCreditList, params, (responseData: any) => {
      const updatedList = responseData
        ? responseData.map((d: any) => {
          return { ...d, RemainingCredit: d.CreditsAvailable }
        })
        : []
      setVendorCreditList(updatedList)
    })
  }

  useEffect(() => {
    if (onOpen) {
      const currentDate = new Date()
      setSelectedBillDate(formatDate(currentDate + ''))
      fetchVendorCreditList()
      fetchPaymentMethods()
      fetchBankAccountDrpdwnList()
    }
  }, [onOpen, CompanyId])

  const fetchAutomaticVendorCredit = async () => {
    setIsPaymentButtonDisabled(true)
    const params = {
      BillDetails: [{
        VendorId: vendorId,
        AccountPaybleId: accountPaybleId,
        Amount: Number(remainingAmount),
      }],
    }
    performApiAction(dispatch, getautomaticvendorcredit, params, (responseData: any) => {
      setFullPaymentCreditList(responseData?.AutomaticCreditList || [])
      setCreditAvailedAmount(responseData?.TotalCredit || 0)
      setIsPaymentButtonDisabled(false)
    }, () => {
      setIsPaymentButtonDisabled(true)
    })
  }

  useEffect(() => {
    if (onOpen && isFullPaymentSelected && isCreditAvailed) {
      fetchAutomaticVendorCredit()
      clearLocalStorage()
    }
  }, [onOpen, isFullPaymentSelected, isCreditAvailed])

  const handlePayBill = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    let hasError = false

    if (paymentMethod <= 0) {
      setPaymentMethodError(true)
      hasError = true
    }

    if (selectedBank <= 0) {
      setSelectedBankError(true)
      hasError = true
    }

    if (selectedBillDate?.trim().length <= 0) {
      setBillDateError(true)
      hasError = true
    }

    if (creditAvailedAmount > Number(remainingAmount)) {
      setCreditAvailedError(true)
      setCreditAvailedErrorMsg('Availing credit should not exceed the amount to pay.')
      hasError = true
    }

    if (creditAvailedAmount === 0 && Number(remainingAmount) === 0) {
      hasError = true
      Toast.error('Bill amount and credit cannot be 0')
    }

    if (!hasError) {
      setIsReauthenticateModalOpen(true)
    }
  }

  // API for send bill for pay
  const sendBillForPay = async () => {
    setIsPaymentLoading(true)
    const storedAmount = localStorage.getItem('billAmount')
    const storedCredits = localStorage.getItem('availCredits')

    let creditsList: any = isCreditAvailed
      ? (isFullPaymentSelected ? fullPaymentCreditList : JSON.parse(storedCredits || '[]'))
      : []
    creditsList = creditsList.map(({ CreditId, CreditAmount }: any) => ({ CreditId, CreditAmount }));

    const params: any = {
      PaymentMasterList: [{
        VendorId: vendorId,
        BillList: [{
          BillId: accountPaybleId,
          Amount: Number(storedAmount || remainingAmount),
          CreditsList: creditsList,
        }],
        PaymentMethod: Number(paymentMethod),
        BankAccount: Number(selectedBank),
      }],
      PaymentGenrationType: 1,
      PaymentDate: format(parse(selectedBillDate.trim(), 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss"),
    }

    try {
      const { payload, meta } = await dispatch(sendForPay(params))
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          Toast.success(`Bill has been sent for approval!`)
          onDataFetch()
          handleCloseModal()
          setIsPaymentLoading(false)
        } else {
          const error = payload?.ErrorData?.ErrorDetail;
          if (error != null) {
            const errorBillNumber = error?.BillNumbers;
            Toast.error(`Payment already initiated from accounting tool for bill number(s) ${errorBillNumber}. Kindly check before proceeding.`,"", 60000)
          } else {
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
          setIsPaymentLoading(false)
        }
      } else {
        setIsPaymentLoading(false)
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // API for uploading attachments
  const handleUploadAttachment = async () => {
    if (uploadedFile.length > 0) {
      let formData: any = new FormData()
      const attachmentFiles = (uploadedFile as any) || []

      Array.from(attachmentFiles).forEach((file, index) => {
        formData.append(`Files[${index}]`, file)
      })

      formData.append('DocumentId', accountPaybleId.toString())

      performApiAction(dispatch, uploadAttachment, formData, () => {
        // Toast.success('Attachments have been successfully!')
        // onDataFetch()
      })
    }
  }

  const handleFileChange = (e: any) => {
    const files = e
    if (files) {
      const maxFileSizeMB = 50
      let totalFileSizeMB = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        totalFileSizeMB += file.size / (1024 * 1024)
      }
      if (totalFileSizeMB > maxFileSizeMB) {
        Toast.error(`Total file size exceeds the maximum limit of ${maxFileSizeMB} MB`)
      } else {
        setUploadedFile(files)
      }
    }
  }

  const isBankDropdownDisabled = (method: number) => {
    return method === 1 || method === 4 || method === 5;
  };

  return (
    <div className='relative h-full w-full'>
      <Modal className='absolute w-full h-full' isOpen={onOpen} onClose={handleCloseModal} noneOutSideClicked>
        <ModalTitle className='!h-[64px] py-[15.5px] px-[38px]'>
          <div className='font-proxima flex items-center text-2xl font-bold tracking-[0.02em] text-darkCharcoal'>Payment Details</div>
          <div className='pt-2.5' onClick={handleCloseModal}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <div className='custom-scroll flex h-[calc(100vh-73px)] justify-center overflow-y-auto'>
          <div className={`my-5 pb-[5rem] laptop:w-[calc(100vw-50vw)] lg:w-[calc(100vw-60vw)] xl:w-[calc(100vw-65vw)]`}>

            {/* Payment Details (header) */}
            <div className='flex items-center justify-between rounded-md border border-darkSmoke bg-darkSmoke px-5 py-[14px]'>
              <div className='flex flex-col gap-1'>
                <span className='text-xs tracking-[0.02em] font-proxima text-slatyGrey'>BILL NO. & DATE</span>
                <span className='flex items-center gap-1'>
                  <span className='text-sm uppercase font-proxima text-darkCharcoal'>{billNumber ?? '-'} & </span>
                  <span className='text-sm font-proxima tracking-[0.02em] font-semibold text-darkCharcoal'>{formatDate(billDate)}</span>
                </span>
              </div>
              <span className='border-r border-whiteSmoke !h-[4.5vh]' />
              <div className='flex flex-col gap-1'>
                <span className='text-xs font-proxima tracking-[0.02em] text-slatyGrey'>VENDOR</span>
                <span className='text-sm font-semibold tracking-[0.02em] font-proxima text-darkCharcoal'>
                  {vendorName && vendorName.length > 20 ? vendorName.substring(0, 20) + '...' : vendorName ?? '-'}
                </span>
              </div>
              <span className='border-r border-whiteSmoke !h-[4.5vh]' />
              <div className='flex flex-col gap-1'>
                <span className='text-xs tracking-[0.02em] font-proxima text-slatyGrey'>DUE DATE</span>
                <span className='text-sm font-semibold tracking-[0.02em] font-proxima text-darkCharcoal'>{formatDate(dueDate)}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className='flex flex-col py-[30px]'>
              <div className='flex justify-between mb-[30px]'>
                <div className='flex flex-col'>
                  <span className='text-lg font-bold text-primary font-proxima tracking-[0.02em]'>
                    ${discount === null || discount === '' ? 0.00 : discount && discount.toFixed(2)}
                  </span>
                  <span className='text-sm text-right text-slatyGrey tracking-[0.02em] font-proxima'>DISCOUNT</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-right text-lg font-bold text-primary font-proxima tracking-[0.02em]'>
                    ${remainingAmount === manualAmountToPay ? (remainingAmount).toFixed(2) : (remainingAmount - manualAmountToPay).toFixed(2)}
                  </span>
                  <span className='text-sm text-right text-slatyGrey tracking-[0.02em] font-proxima'>REMAINING</span>
                </div>
              </div>

              <div className='rightDatepicker'>
                <Datepicker
                  label='Payment Date'
                  id='bill-date'
                  format='MM/DD/YYYY'
                  startYear={getPastYear()}
                  endYear={getNextYear()}
                  getValue={(e) => {
                    setBillDateError(false)
                    setSelectedBillDate(e)
                  }}
                  value={selectedBillDate}
                  getError={() => { }}
                  hasError={billDateError}
                  validate
                />
              </div>
              <div className='mt-5'>
                <Select
                  label='Payment Method'
                  id='payment-method'
                  name='payment-method'
                  options={paymentMethodOption ?? []}
                  defaultValue={paymentMethod}
                  getValue={(value) => {
                    if (value > 0) {
                      setPaymentMethodError(false)
                      setPaymentMethod(value)
                      // Update the bank account when payment method changes
                      const selectedMethod = paymentMethodOption.find((method: any) => Number(method.value) === value)
                      if (selectedMethod && selectedMethod.DefaultBankId) {
                        setSelectedBank(selectedMethod.DefaultBankId)
                      }
                    }
                  }}
                  getError={() => { }}
                  placeholder='Select Payment Method'
                  hasError={paymentMethodError}
                  validate
                />
              </div>
              <div className='mt-5'>
                <Select
                  key={paymentMethod}
                  label='Bank'
                  id='bank'
                  name='bank'
                  defaultValue={selectedBank}
                  options={bankMethodOption ?? []}
                  getValue={(value) => {
                    value > 0 && setSelectedBankError(false)
                    setSelectedBank(value)
                  }}
                  getError={() => { }}
                  hasError={selectedBankError}
                  validate
                  disabled={isBankDropdownDisabled(paymentMethod)}
                />
              </div>
              <div className='mt-5'>
                <div className='flex items-center justify-between py-[15px]'>
                  <label className='text-sm font-bold tracking-[0.02em] text-darkCharcoal font-proxima'>CREDIT AVAILED</label>
                  <span onClick={handleCreditAvailedToggle}>
                    <Switch checked={isCreditAvailed} />
                  </span>
                </div>
                <div className={`${isCreditAvailed ? 'relative' : 'hidden'} !pointer-events-none !opacity-80 select-none`}>
                  <Text
                    label='Credit Availed'
                    id='credit-availed'
                    placeholder='Enter Amount'
                    className='pl-3 select-none'
                    value={creditAvailedAmount.toFixed(2) ?? 0}
                    readOnly
                    getValue={(value) => {
                      setCreditAvailedError(false)
                      setCreditAvailedAmount(Number(value))
                    }}
                    getError={() => { }}
                    hasError={creditAvailedError}
                    errorMessage={creditAvailedErrorMsg}
                    validate
                    disabled={!isCreditAvailed}
                  />
                  <span className={`absolute left-0 text-sm top-[34px] text-slatyGrey ${creditAvailedError ? 'text-[#FB2424]' : ''}`}>
                    $
                  </span>
                  <span className={`font-proxima text-xs text-slatyGrey tracking-[0.02em] block mt-1`}>
                    The available credit is adjusted proportionately among the credit memos on a "First-In, First-out" basis.
                  </span>
                </div>
              </div>
              <div className={`${isCreditAvailed ? 'mt-5' : 'mt-0'} !pointer-events-none relative !opacity-80 select-none`}>
                <Text
                  label='Bill Amount'
                  id='amount-to-pay'
                  placeholder='Enter Amount'
                  className='pl-3 '
                  value={remainingAmount}
                  getValue={() => { }}
                  getError={() => { }}
                  readOnly
                  validate
                  disabled
                />
                <span className={`absolute text-sm left-0 ${isCreditAvailed ? 'top-[32px]' : 'top-[34px]'} text-slatyGrey`}>$</span>
              </div>
              <div className='mt-5'>
                <label className='text-sm font-bold text-darkCharcoal tracking-[0.02em] font-proxima'>PAYMENT OPTIONS</label>
                <div className={`flex mt-5`}>
                  <Radio
                    className='text-sm text-darkCharcoal font-proxima'
                    checked={isFullPaymentSelected}
                    onChange={handleAutoCreditSelected}
                    id='automatic'
                    label='Full Payment'
                  />
                  <div className='w-full'>
                    <BasicTooltip content={`Partial payment with manual credit adjustment`} position='top' className='!px-0 !pb-0 !pt-0.5'>
                      <Radio
                        className='text-sm text-darkCharcoal font-proxima'
                        checked={isPartialPaymentSelected}
                        id='manual'
                        label='Partial Payment'
                        onClick={handleManualCreditSelected}
                      />
                    </BasicTooltip>
                  </div>
                </div>
              </div>

              <div className='mt-5 mb-[30px]'>
                <Uploader variant='small' getValue={handleFileChange} multiSelect />
              </div>

              <Button variant='btn-primary' className={`${isPaymentLoading ? 'pointer-events-none opacity-80' : ""} font-proxima font-semibold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base mb-4 flex items-center justify-center rounded-full tracking-[0.02em] ${isPaymentButtonDisabled ? 'pointer-events-none opacity-80' : ""}`} onClick={handlePayBill}>
                {isPaymentLoading
                  ? <div className='animate-spin'> <SpinnerIcon bgColor='#FFF' /></div>
                  : <>
                    <span className='border-r border-white pr-2 uppercase'>payable amount</span>
                    <span className='pl-2'>
                      ${manualAmountToPay > 0 ? (manualAmountToPay - creditAvailedAmount).toFixed(2) : (Number(remainingAmount) - creditAvailedAmount).toFixed(2)}
                    </span>
                  </>}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {isAllocateCreditModalOpen && <SingleBillPartialPayment
        onOpen={isAllocateCreditModalOpen}
        onClose={handleAllocateCreditModalClose}
        vendorId={vendorId}
        amountToPay={remainingAmount}
        vendorCreditDataList={vendorCreditList}
        handleSendData={handleManualCreditdata}
      />}

      <ReauthenticateModal
        onOpen={isReauthenticateModalOpen}
        onClose={handleCloseReauthenticateModal}
        onSubmitPay={sendBillForPay}
        onUploadAttachments={handleUploadAttachment}
      />
    </div>
  )
}

export default SinglePaymentDetailsModal