import { formatDate, getNextYear, getPastYear } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { BillDetails, getBankAccountDrpdwnList, getPaymentMethodsbyVendor, getautomaticvendorcredit, sendForPay } from '@/store/features/billsToPay/billsToPaySlice'
import { format, parse } from 'date-fns'
import { useSession } from 'next-auth/react'
import { BasicTooltip, Button, Close, Datepicker, Modal, ModalTitle, Radio, Select, Switch, Text, Toast } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import SingleVendorPartialPayModal from '../modals/SingleVendorPartialPayModal'
import ReauthenticateModal from './ReauthenticateModal'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  vendorId: any
  totalAmountToPay: number
  selectedAccountPayableIds: any
  selectedBillDetails: any
  onDataFetch: any
}

const SingleVendorMultiplePaymentDetailsModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  vendorId,
  selectedAccountPayableIds,
  totalAmountToPay,
  selectedBillDetails,
  onDataFetch,
}) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

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
  const [automaticCreditList, setAutomaticCreditList] = useState<any[]>([])
  const [manualCreditList, setManualCreditList] = useState<any[]>([])

  const [isAmountToPayModalOpen, setAmountToPayModalOpen] = useState<boolean>(false)
  const [billData, setBillData] = useState<any[]>([])
  const [manualRemainingAmount, setManualRemainingAmount] = useState<number>(0)
  const [manualAvailedCreditAmount, setManualAvailedCreditAmount] = useState<number>(0)
  const [vendorData, setVendorData] = useState<any[]>([])
  const [previousCreditAmount, setPreviousCreditAmount] = useState<number>(0);

  const [isPaymentButtonDisabled, setIsPaymentButtonDisabled] = useState<boolean>(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false)

  const [isMergeBillsSelected, setMergeBillsSelected] = useState<boolean>(true)
  const [isSingleBillSelected, setSingleBillSelected] = useState<boolean>(false)

  const handleResetAll = () => {
    setIsCreditAvailed(true)
    setIsFullPaymentSelected(true)
    setIsPartialPaymentSelected(false)
    setIsReauthenticateModalOpen(false)
    setPaymentMethod(0)
    setPaymentMethodError(false)
    setSelectedBank(0)
    setSelectedBankError(false)
    setSelectedBillDate('')
    setBillDateError(false)
    setCreditAvailedAmount(0)
    setCreditAvailedError(false)
    setCreditAvailedErrorMsg('')
    setManualAmountToPay(0)
    setManualRemainingAmount(0)
    setAmountToPayModalOpen(false)
    setManualAvailedCreditAmount(0)
    setVendorData([])
    setPreviousCreditAmount(0)
    setBillData([])
    setManualCreditList([])
    setAutomaticCreditList([])
    setPaymentMethodOption([])
    setBankMethodOption([])
    setIsPaymentButtonDisabled(false)
    setIsPaymentLoading(false)
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
    localStorage.removeItem('PartialPaymentDataList')
    localStorage.removeItem('CreditData')
    localStorage.removeItem('BillsData')
    localStorage.removeItem('DataList')
  }

  const handleAutoCreditSelected = () => {
    setIsFullPaymentSelected(true)
    setIsPartialPaymentSelected(false)
    setManualAmountToPay(0)
    setManualAvailedCreditAmount(0)
    if (isCreditAvailed) {
      fetchAutomaticVendorCredit();
    }
  }

  const handleCloseModal = () => {
    onClose()
    handleResetAll()
    clearLocalStorage()
  }

  const handleAmountToPayModalClose = () => {
    setAmountToPayModalOpen(false)
  }

  const fetchPaymentMethods = async () => {
    const params = {
      VendorIds: vendorId ?? 0,
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

  const transformVendorBillsId = (details: any[]) => {
    const vendorMap: { [key: number]: number[] } = {}
    details.forEach((detail) => {
      const { VendorId, AccountPaybleId } = detail
      if (!vendorMap[VendorId]) {
        vendorMap[VendorId] = []
      }
      vendorMap[VendorId].push(AccountPaybleId)
    })
    const vendorBills = Object.entries(vendorMap).map(([VendorId, Bills]) => ({
      VendorId: Number(VendorId),
      Bills: Bills.join(','),
    }))
    return vendorBills
  }

  const handlePartialPaymentSelected = () => {
    setIsFullPaymentSelected(false)
    setIsPartialPaymentSelected(true)
    setAmountToPayModalOpen(true)

    const vendorBills = transformVendorBillsId(selectedBillDetails)
    const getBillDetailsForPartialPayment = async () => {
      setIsPaymentButtonDisabled(true)
      const params = {
        VendorBills: vendorBills,
      }
      performApiAction(dispatch, BillDetails, params, (responseData: any) => {
        setIsPaymentButtonDisabled(false)
        setBillData(responseData)
        localStorage.setItem('BillsData', JSON.stringify(responseData))
      }, () => {
        setIsPaymentButtonDisabled(false)
      })
    }
    const storedData = localStorage.getItem('BillsData')
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setBillData(parsedData)
    } else {
      getBillDetailsForPartialPayment()
    }
  }

  useEffect(() => {
    if (onOpen) {
      const currentDate = new Date()
      setSelectedBillDate(formatDate(currentDate + ''))
      fetchPaymentMethods()
      fetchBankAccountDrpdwnList()
    }
  }, [onOpen, CompanyId])

  const handleBillDetails = (billDetails: any) => {
    return billDetails.map((d: any) => {
      const amount = d.Amount?.toFixed(2)
      return {
        VendorId: d.VendorId,
        AccountPaybleId: d.AccountPaybleId,
        Amount: Number(amount),
      }
    })
  }

  const fetchAutomaticVendorCredit = async () => {
    setIsPaymentButtonDisabled(true)
    const params = {
      BillDetails: handleBillDetails(selectedBillDetails),
    }
    performApiAction(dispatch, getautomaticvendorcredit, params, (responseData: any) => {
      setAutomaticCreditList(responseData?.AutomaticCreditList || [])
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

    if (selectedBillDate.trim().length <= 0) {
      setBillDateError(true)
      hasError = true
    }

    if (!hasError) {
      setIsReauthenticateModalOpen(true)
    }
  }

  const handlePartialPaymentForMultipleBill = (credits: any, vendorData: any, totalManualAmount: any, availCredit: number) => {
    const updatedCredit = vendorData.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)

    setManualAmountToPay(totalManualAmount)
    isCreditAvailed ? setCreditAvailedAmount(updatedCredit) : setCreditAvailedAmount(0)
    setPreviousCreditAmount(updatedCredit)

    setManualAvailedCreditAmount(updatedCredit)
    setVendorData(vendorData)
    const totalRemainingAmount = vendorData.reduce(
      (total: number, bill: { remainingAmount: number }) => total + bill.remainingAmount,
      0
    );
    setManualRemainingAmount(totalRemainingAmount)
    setManualCreditList(credits)
    if (Number((totalManualAmount).toFixed(2)) == totalAmountToPay) {
      setIsFullPaymentSelected(true)
      setIsPartialPaymentSelected(false)
    } else {
      setIsPartialPaymentSelected(true)
      setIsFullPaymentSelected(false)
    }
  }

  // API for send bill for pay
  const sendBillForPay = async () => {
    setIsPaymentLoading(true)
    let creditsList: any = [];

    if (isFullPaymentSelected) {
      creditsList = automaticCreditList;
    } else if (isPartialPaymentSelected) {
      creditsList = manualCreditList;
    }

    const mainBillDetail = selectedBillDetails.reduce((acc: any[], curr: any) => {
      const existingVendor = acc.find((v: any) => v.VendorId === curr.VendorId)

      const getFilteredCredits = (billId: number) => {
        if (!creditsList) return null
        const billCredits = creditsList?.filter((credit: any) => credit.BillId === billId)
        if (billCredits.length != 0) {
          if (billCredits[0].CreditsList) {
            return billCredits.flatMap((credit: any) => credit.CreditsList || [])
          } else {
            return billCredits
          }
        } else {
          if (creditsList.length > 0 && 'CreditId' in creditsList[0] && !('BillId' in creditsList[0])) {
            return creditsList
          }
          return null
        }
      }

      const calculateAmount = (billId: number) => {
        const vendorBill = vendorData.find(bill => bill.BillId === billId);
        if (vendorBill) {
          return isFullPaymentSelected ? vendorBill.BillAmount : vendorBill.BillAmount - vendorBill.remainingAmount;
        }
        return curr.Amount; // Fallback to original amount if not found in vendorData
      };

      const newBillEntry = {
        BillId: curr.AccountPaybleId,
        Amount: calculateAmount(curr.AccountPaybleId),
        CreditsList: getFilteredCredits(curr.AccountPaybleId),
      }

      if (existingVendor) {
        const billIndex = existingVendor.BillList.findIndex((bill: any) => bill.BillId === curr.AccountPaybleId)
        if (billIndex !== -1) {
          // Update existing bill
          existingVendor.BillList[billIndex] = {
            ...existingVendor.BillList[billIndex],
            CreditsList: newBillEntry.CreditsList,
            Amount: newBillEntry.Amount,
          }
        } else {
          // Add new bill to existing vendor
          existingVendor.BillList.push(newBillEntry)
        }
      } else {
        // Add new vendor with the bill
        acc.push({
          VendorId: curr.VendorId,
          BillList: [newBillEntry],
        })
      }

      return acc
    }, [])

    const calculateAutomaticDetail = () => {
      // First, always perform the reduce operation
      const automaticDetail = selectedBillDetails.reduce((acc: any[], curr: any) => {
        const existingVendor = acc.find((v: any) => v.VendorId === curr.VendorId)

        const getFilteredCredits = (vendorId: number) => {
          if (!creditsList) return []
          return creditsList.filter((credit: any) => credit.VendorId === vendorId)
        }

        const newBillEntry = {
          BillId: curr.AccountPaybleId,
          Amount: curr.Amount,
          CreditsList: [], // Keep this empty for now
        }

        if (existingVendor) {
          existingVendor.BillList.push(newBillEntry)
        } else {
          acc.push({
            VendorId: curr.VendorId,
            BillList: [newBillEntry],
            creditsList: getFilteredCredits(curr.VendorId),
            PaymentMethod: paymentMethod,
            BankAccount: Number(selectedBank),
          })
        }

        return acc
      }, [])

      // Only perform credit distribution if automatic is selected

      automaticDetail.forEach((vendor: any) => {
        let remainingCredits = [...vendor.creditsList] // Create a copy of the credits array

        vendor.BillList.forEach((bill: any) => {
          bill.CreditsList = [] // Initialize CreditsList for each bill
          let remainingBillAmount = bill.Amount

          while (remainingBillAmount > 0 && remainingCredits.length > 0) {
            const currentCredit = remainingCredits[0]
            const creditToApply = Math.min(currentCredit.CreditAmount, remainingBillAmount)

            bill.CreditsList.push({
              CreditId: currentCredit.CreditId,
              CreditAmount: creditToApply,
            })

            remainingBillAmount -= creditToApply
            currentCredit.CreditAmount -= creditToApply

            if (currentCredit.CreditAmount === 0) {
              remainingCredits.shift() // Remove the fully used credit
            }
          }

          bill.Amount = bill.Amount
        })

        // Remove the top-level creditsList after distribution
        delete vendor.creditsList
      })

      return automaticDetail
    }

    const params: any = {
      PaymentMasterList: isFullPaymentSelected ? calculateAutomaticDetail() : mainBillDetail,
      PaymentGenrationType: isSingleBillSelected ? 1 : 2,
      PaymentDate: format(parse(selectedBillDate.trim(), 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss"),
    }

    try {
      const { payload, meta } = await dispatch(sendForPay(params))
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          Toast.success(`Bills has been sent for approval!`)
          onDataFetch()
          handleCloseModal()
          setIsPaymentLoading(false)
        } else {
          const error = payload?.ErrorData?.ErrorDetail;
          if (error != null) {
            const errorBillNumber = error?.BillNumbers ?? [];
            const formattedBillNumbers = errorBillNumber.join(', ');

            Toast.error(`Payment already initiated from accounting tool for bill number(s) ${formattedBillNumbers}. Kindly check before proceeding.`, "", 60000)
          } else {
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
          setIsPaymentLoading(false)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
        setIsPaymentLoading(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const isBankDropdownDisabled = (method: number) => {
    return method === 1 || method === 4 || method === 5;
  };

  const handleMergeBillsSelected = () => {
    setMergeBillsSelected(true)
    setSingleBillSelected(false)
  }

  const handleSingleBillSelected = () => {
    setMergeBillsSelected(false)
    setSingleBillSelected(true)
  }

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
            {/* Payment Options */}
            <div className='flex flex-col py-[30px]'>
              <div className='flex justify-between mb-[30px]'>
                <div className='flex flex-col'>
                  <span className='text-lg font-bold text-darkCharcoal font-proxima tracking-[0.02em]'>{selectedAccountPayableIds.length}</span>
                  <span className='text-sm text-right text-slatyGrey tracking-[0.02em] font-proxima'>BILLS  SELECTED</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-right text-lg font-bold text-primary font-proxima tracking-[0.02em]'>
                    ${isFullPaymentSelected
                      ? (totalAmountToPay).toFixed(2)
                      : (totalAmountToPay - manualAmountToPay - manualAvailedCreditAmount).toFixed(2)}
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
              <div className={`${isCreditAvailed ? 'mt-5' : 'mt-0'}`}>
                <label className='text-sm font-bold text-darkCharcoal tracking-[0.02em] font-proxima'>AMOUNT TO PAY</label>
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
                        onClick={handlePartialPaymentSelected}
                      />
                    </BasicTooltip>
                  </div>
                </div>
              </div>
              <div className='!pointer-events-none relative !opacity-80 select-none mt-5'>
                <Text
                  label='Bill Amount'
                  id='amount-to-pay'
                  placeholder='Enter Amount'
                  className='pl-3 '
                  value={totalAmountToPay}
                  getValue={() => { }}
                  getError={() => { }}
                  readOnly
                  validate
                  disabled
                />
                <span className={`absolute text-sm left-0 ${isCreditAvailed ? 'top-[33px]' : 'top-[34px]'} text-slatyGrey`}>$</span>
              </div>
              <div className='mt-5 mb-[30px]'>
                <label htmlFor='amount-to-pay' className='font-proxima tracking-[0.02em] text-sm font-bold uppercase text-darkCharcoal'>
                  Payment Request Type
                </label>
                <div className='flex py-5'>
                  <Radio
                    className='text-sm text-darkCharcoal font-proxima'
                    checked={isMergeBillsSelected}
                    onChange={handleMergeBillsSelected}
                    id='merge-bills'
                    label='Merge Bills by Vendor'
                  />
                  <Radio
                    className='text-sm text-darkCharcoal font-proxima'
                    checked={isSingleBillSelected}
                    onChange={handleSingleBillSelected}
                    id='single-bill'
                    label='Single Bills'
                  />
                </div>
              </div>

              <Button variant='btn-primary' className={`${isPaymentLoading ? 'pointer-events-none opacity-80' : ""} ${isPaymentButtonDisabled ? 'pointer-events-none opacity-80' : ""} font-proxima font-semibold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base mb-4 flex items-center justify-center rounded-full tracking-[0.02em] ${isPaymentButtonDisabled ? 'pointer-events-none opacity-80' : ""}`} onClick={handlePayBill}>
                {isPaymentLoading
                  ? <div className='animate-spin'> <SpinnerIcon bgColor='#FFF' /></div>
                  : <>
                    <span className='border-r border-white pr-2  uppercase'>payable amount</span>
                    <span className='pl-2'>${(totalAmountToPay - manualRemainingAmount - creditAvailedAmount).toFixed(2)}
                    </span>
                  </>}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {isAmountToPayModalOpen && <SingleVendorPartialPayModal
        onOpen={isAmountToPayModalOpen}
        onClose={handleAmountToPayModalClose}
        amountToPay={totalAmountToPay}
        BillsData={billData}
        vendorId={vendorId}
        handleSendData={handlePartialPaymentForMultipleBill}
      />}

      <ReauthenticateModal
        onOpen={isReauthenticateModalOpen}
        onClose={handleCloseReauthenticateModal}
        onSubmitPay={sendBillForPay}
        onUploadAttachments={() => { }}
      />
    </div>
  )
}

export default SingleVendorMultiplePaymentDetailsModal