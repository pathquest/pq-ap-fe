import { formatDate, getNextYear, getPastYear } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { BillDetails, getPaymentMethodsbyVendor, getautomaticvendorcredit, sendForPay } from '@/store/features/billsToPay/billsToPaySlice'
import { format, parse } from 'date-fns'
import { useSession } from 'next-auth/react'
import { BasicTooltip, Button, Close, Datepicker, Modal, ModalTitle, Radio, Select, Switch, Text, Toast } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import MultipleVendorAmountToPayModal from '../modals/MultipleVendorAmountToPayModal'
import ReauthenticateModal from './ReauthenticateModal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setFilterFields } from '@/store/features/vendor/vendorSlice'
import { ClickToast } from '../Toast/Toast'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  vendorsId: any
  totalAmountToPay: number
  selectedAccountPayableIds: any
  selectedBillDetails: any
  onDataFetch: any
  vendorOptions: any
}

interface Credit {
  CreditId: number
  CreditAmount: number
}

interface Bills {
  VendorId: number
}

type PaymentMethod = {
  PaymentMethod: number
  BankAccount: number
}

interface Bill {
  BillId: number
  Amount: number
  CreditsList: Credit[]
}

const MultipleVendorMultiplePaymentDetailsModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  vendorsId,
  selectedAccountPayableIds,
  totalAmountToPay,
  selectedBillDetails,
  onDataFetch,
  vendorOptions,
}) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [isCreditAvailed, setIsCreditAvailed] = useState<boolean>(true)
  const [isFullPaymentSelected, setIsFullPaymentSelected] = useState<boolean>(true)
  const [isPartialPaymentSelected, setIsPartialPaymentSelected] = useState<boolean>(false)
  const [isReauthenticateModalOpen, setIsReauthenticateModalOpen] = useState<boolean>(false)

  const [paymentMethodOption, setPaymentMethodOption] = useState<any[]>([])

  const [selectedBillDate, setSelectedBillDate] = useState<string>('')
  const [billDateError, setBillDateError] = useState<boolean>(false)

  const [creditAvailedAmount, setCreditAvailedAmount] = useState<number>(0)
  const [creditAvailedError, setCreditAvailedError] = useState<boolean>(false)
  const [creditAvailedErrorMsg, setCreditAvailedErrorMsg] = useState<string>('')
  const [manualAvailedCreditAmount, setManualAvailedCreditAmount] = useState<number>(0)

  const [manualAmountToPay, setManualAmountToPay] = useState<number>(0)
  const [automaticCreditList, setAutomaticCreditList] = useState<any[]>([])
  const [manualCreditList, setManualCreditList] = useState<any[]>([])

  const [isAmountToPayModalOpen, setAmountToPayModalOpen] = useState<boolean>(false)
  const [billData, setBillData] = useState<any[]>([])
  const [previousCreditAmount, setPreviousCreditAmount] = useState<number>(0);

  const [isMergeBillsSelected, setMergeBillsSelected] = useState<boolean>(true)
  const [isSingleBillSelected, setSingleBillSelected] = useState<boolean>(false)

  const [vendorCreditList, setVendorCreditList] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{ [key: number]: PaymentMethod }>({})
  const [isPaymentButtonDisabled, setIsPaymentButtonDisabled] = useState<boolean>(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false)

  const handleResetAll = () => {
    setIsCreditAvailed(true)
    setIsFullPaymentSelected(true)
    setIsPartialPaymentSelected(false)
    setIsReauthenticateModalOpen(false)
    setSelectedBillDate('')
    setBillDateError(false)
    setCreditAvailedAmount(0)
    setManualAvailedCreditAmount(0)
    setCreditAvailedError(false)
    setCreditAvailedErrorMsg('')
    setManualAmountToPay(0)
    setAmountToPayModalOpen(false)
    setPreviousCreditAmount(0)
    setBillData([])
    setManualCreditList([])
    setAutomaticCreditList([])
    setPaymentMethodOption([])
    setVendorCreditList([])
    setPaymentMethods([])
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
    localStorage.removeItem('DataList')
    localStorage.removeItem('totalPayableAmount')
    localStorage.removeItem('MultipleVendorTableData')
    localStorage.removeItem('PaymentMethodList')
    localStorage.removeItem('MultipleVendorCreditData')
    localStorage.removeItem('MultipleVendorPartialPaymentDataList')
  }

  const handleAutoCreditSelected = () => {
    setIsFullPaymentSelected(true)
    setIsPartialPaymentSelected(false)
    setManualAmountToPay(0)
    clearLocalStorage()
    localStorage.removeItem('BillsData')
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
      VendorIds: vendorsId ?? 0,
    }

    performApiAction(dispatch, getPaymentMethodsbyVendor, params, (responseData: any) => {
      setPaymentMethodOption(responseData)
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
      const updatedList = responseData?.AutomaticCreditList
        ? responseData?.AutomaticCreditList.map((d: any) => {
          return { ...d }
        })
        : []
      setAutomaticCreditList(updatedList)
      setCreditAvailedAmount(responseData?.TotalCredit)
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


  const validateVendorPaymentMethods = (): boolean => {
    const vendorsWithNullPayment = paymentMethodOption.filter(vendor => vendor.PreferdPayment == null);

    if (vendorsWithNullPayment.length > 0) {
      const vendorLinks = vendorsWithNullPayment.map(vendor => {
        const vendorLabel = vendorOptions.find((v: any) => v.value == vendor.VendorId)?.label;
        return (
          <Link
            key={vendor.VendorId}
            href={`/vendors?id=${vendor.VendorId}`}
            className="font-bold cursor-pointer"
          >
            {vendorLabel}
          </Link>
        );
      });

      let errorMessage;
      if (vendorLinks.length === 1) {
        errorMessage = (
          <span>
            Please configure payment method in vendor {vendorLinks[0]}!
          </span>
        );
      } else {
        errorMessage = (
          <span>
            Please configure payment method for the vendors: {vendorLinks.reduce((prev, curr, index): any => [prev, index > 0 ? (index === vendorLinks.length - 1 ? ' and ' : ', ') : '', curr])}!
          </span>
        );
      }

      ClickToast.error(errorMessage);
      return false;
    }
    return true;
  };

  const handlePayBill = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    let hasError = false
    if (selectedBillDate.trim().length <= 0) {
      setBillDateError(true)
      hasError = true
    }

    if (isFullPaymentSelected && !validateVendorPaymentMethods()) {
      hasError = true;
    }

    if (!hasError) {
      setIsReauthenticateModalOpen(true)
    }
  }

  const handlePartialPaymentForMultipleBill = (creditList: any, vendorCredits: any, totalManualAmount: number, paymentMethodDetails: any) => {
    setPaymentMethods(paymentMethodDetails)
    setManualCreditList(creditList)
    setVendorCreditList(vendorCredits)
    const totalCreditAmount = creditList?.reduce((total: number, bill: Bill) => {
      return total + bill.CreditsList.reduce((creditTotal: number, credit: Credit) => creditTotal + credit.CreditAmount, 0)
    }, 0)
    isCreditAvailed ? setCreditAvailedAmount(totalCreditAmount) : setCreditAvailedAmount(0)
    setPreviousCreditAmount(totalCreditAmount)
    setManualAvailedCreditAmount(totalCreditAmount)
    setManualAmountToPay(parseFloat(Number(totalManualAmount).toFixed(2)))

    if (totalManualAmount == totalAmountToPay) {
      setIsPartialPaymentSelected(false)
      setIsFullPaymentSelected(true)
    } else {
      setIsFullPaymentSelected(false)
      setIsPartialPaymentSelected(true)
    }
  }

  // API for send bill for pay
  const sendBillForPay = async () => {
    setIsPaymentLoading(true)
    let creditsList: any = [];

    if (isFullPaymentSelected) {
      creditsList = automaticCreditList;
    } else {
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

      const calculateAmount = (billId: number, vendorCredit: any[]) => {
        if (isFullPaymentSelected) {
          return curr.Amount
        }

        let billDetail: any = null

        // Check if the vendorCredit is in the nested format or flat format
        if (vendorCredit[0] && 'BillDetail' in vendorCredit[0]) {
          // Nested format
          for (const vendor of vendorCredit) {
            billDetail = vendor.BillDetail.find((detail: any) => detail.BillId === billId)
            if (billDetail) break
          }
        } else {
          // Flat format
          billDetail = vendorCredit.find((detail: any) => detail.BillId === billId)
        }

        if (!billDetail) return Number(totalAmountToPay)

        const billAmount = Number(billDetail.BillAmount)

        // Handle different structures for remainingAmount
        let remainingAmount
        if (typeof billDetail.remainingAmount === 'object' && billDetail.remainingAmount?.props?.children) {
          remainingAmount = Number(billDetail.remainingAmount.props.children[1])
        } else {
          remainingAmount = Number(billDetail.remainingAmount)
        }

        if (isNaN(billAmount) || isNaN(remainingAmount)) {
          return 0
        }

        const calculatedAmount = Math.max(0, billAmount - remainingAmount)

        return calculatedAmount
      }

      const newBillEntry = {
        BillId: curr.AccountPaybleId,
        Amount: calculateAmount(curr.AccountPaybleId, vendorCreditList),
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

    const vendorPreferences = paymentMethodOption.reduce((acc, vendor) => {
      acc[vendor.VendorId] = {
        preferredPayment: vendor.PreferdPayment,
        paymentMethods: vendor.PaymentMethodList.reduce((methodAcc: any, method: any) => {
          methodAcc[Number(method.value)] = method.DefaultBankId;
          return methodAcc;
        }, {})
      };
      return acc;
    }, {});

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
          const vendorPref = vendorPreferences[curr.VendorId] || {};
          const preferredPayment = vendorPref.preferredPayment || 0;
          const bankAccount = vendorPref.paymentMethods?.[preferredPayment] || 0;

          acc.push({
            VendorId: curr.VendorId,
            BillList: [newBillEntry],
            creditsList: getFilteredCredits(curr.VendorId),
            PaymentMethod: preferredPayment,
            BankAccount: Number(bankAccount),
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
        // delete vendor.creditsList
      })
      return automaticDetail
    }

    const params: any = {
      PaymentMasterList: isFullPaymentSelected ? calculateAutomaticDetail() : mainBillDetail,
      PaymentGenrationType: isSingleBillSelected ? 1 : 2,
      PaymentDate: format(parse(selectedBillDate.trim(), 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss"),
    }

    if (params.PaymentMasterList.length > 0 && isPartialPaymentSelected) {
      params.PaymentMasterList = params.PaymentMasterList.map((bill: Bills) => {
        const method = paymentMethods[bill.VendorId]
        if (method) {
          return {
            ...bill,
            PaymentMethod: Number(method.PaymentMethod) || 0,
            BankAccount: Number(method.BankAccount) || 0,
          }
        }
        return {
          ...bill,
          PaymentMethod: 0,
          BankAccount: 0,
        }
      })
    }

    try {
      const { payload, meta } = await dispatch(sendForPay(params))
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          Toast.success(`Bills sent for approval!`)
          onDataFetch()
          handleCloseModal()
          setIsPaymentLoading(false)
        } else {
          const error = payload?.ErrorData?.ErrorDetail;
          if (error != null) {
            const errorBillNumber = error?.BillNumbers ?? [];
            const formattedBillNumbers = errorBillNumber.join(', ');

            Toast.error(`Payment already initiated from accounting tool for bill number(s) ${formattedBillNumbers}. Kindly check before proceeding.`,"", 60000)
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
                  options={[]}
                  getValue={() => { }}
                  getError={() => { }}
                  placeholder='Select Payment Method'
                  validate
                  disabled
                />
              </div>
              <div className='mt-5'>
                <Select
                  label='Bank'
                  id='bank'
                  name='bank'
                  options={[]}
                  getValue={() => { }}
                  getError={() => { }}
                  validate
                  disabled
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
                <span className={`absolute text-sm left-0 top-[33px] text-slatyGrey`}>$</span>
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

              <Button variant='btn-primary' className={`font-proxima font-semibold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base mb-4 flex items-center justify-center rounded-full tracking-[0.02em] ${isPaymentButtonDisabled ? 'pointer-events-none opacity-80' : ""}`} onClick={handlePayBill}>
                <span className='border-r border-white pr-2 uppercase'>payable amount</span>
                <span className='pl-2'>${
                  isFullPaymentSelected
                    ? (totalAmountToPay - creditAvailedAmount).toFixed(2)
                    : isCreditAvailed
                      ? String(manualAmountToPay).includes('.')
                        ? manualAmountToPay
                        : Number(manualAmountToPay).toFixed(2)
                      : String(manualAmountToPay).includes('.')
                        ? manualAmountToPay + manualAvailedCreditAmount
                        : (manualAvailedCreditAmount + manualAmountToPay).toFixed(2)}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {isAmountToPayModalOpen && <MultipleVendorAmountToPayModal
        onOpen={isAmountToPayModalOpen}
        onClose={handleAmountToPayModalClose}
        amountToPay={totalAmountToPay}
        BillsData={billData}
        vendorsId={vendorsId}
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

export default MultipleVendorMultiplePaymentDetailsModal