import { format, parse } from 'date-fns'
import { Button, Close, Datepicker, Modal, Radio, Select, Switch, Text, Toast, Uploader } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

// Icons
import AllocateCreditsModal from '../modals/AllocateCreditsModal'
import RemoveCreditModal from '../modals/RemoveCreditModal'
import ReauthenticateModal from './ReauthenticateModal'

// store
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { uploadAttachment } from '@/store/features/bills/billSlice'
import { BillDetails, getBankAccountDrpdwnList, getPaymentMethodsbyVendor, getVendorCreditList, getautomaticvendorcredit, sendForPay } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'
import AmountToPayModal from '../modals/AmountToPayModal'

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
  currentValues?: CurrentBillValueProps
  selectedRowIds?: any
  totalAmountToPay?: string
  selectedBillDetails?: any
  onDataFetch?: any
  vendorsId?: any
}

interface Credit {
  CreditId: number
  CreditAmount: number
}

interface Bill {
  BillId: number
  Amount: number
  CreditsList: Credit[]
}

interface Bills {
  VendorId: number
}

type PaymentMethod = {
  PaymentMethod: number
  BankAccount: number
}
interface Params {
  PaymentMasterList: Bills[]
}

interface PaymentMethodProps {
  [key: string]: string
}

type PaymentMethodInfo = {
  value: string
  DefaultBankId?: number | null
}

const PaymentDetailsModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  currentValues,
  selectedRowIds,
  totalAmountToPay,
  selectedBillDetails,
  onDataFetch,
  vendorsId,
}) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

  const { billNumber, billDate, dueDate, vendorName, discount, payAmount, remainingAmount, vendorId }: any = currentValues || {}

  const [isCreditAvailed, setIsCreditAvailed] = useState<boolean>(true)
  const [isMultipleCreditAvailed, setIsMultipleCreditAvailed] = useState<boolean>(true)
  const [isAutomaticSelected, setIsAutomaticSelected] = useState<boolean>(true)
  const [isManualSelected, setIsManualSelected] = useState<boolean>(false)
  const [isPayBillClicked, setIsPayBillClicked] = useState<boolean>(false)
  const [isStandardSelected, setStandardSelected] = useState<boolean>(true)
  const [isSameDaySelected, setSameDaySelected] = useState<boolean>(false)
  const [isNextDaySelected, setNextDaySelected] = useState<boolean>(false)
  const [isMergeBillsSelected, setMergeBillsSelected] = useState<boolean>(true)
  const [isSingleBillSelected, setSingleBillSelected] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = useState<number>(0)
  const [paymentMthdErr, setPaymentMthdErr] = useState<boolean>(false)
  const [selectedBank, setSelectedBank] = useState<number>(0)
  const [selectedBankErr, setSelectedBankErr] = useState<boolean>(false)
  const [selectedBillDate, setSelectedBillDate] = useState<string>('')
  const [billDateErr, setBillDateErr] = useState<boolean>(false)
  const [creditAvailed, setCreditAvailed] = useState<string>('')

  const [creditAvailedErr, setCreditAvailedErr] = useState<boolean>(false)
  const [creditAvailedErrMsg, setCreditAvailedErrMsg] = useState<string>('')
  const [manualAmount, setManualAmount] = useState(0)

  const [manualRemainingAmount, setManualRemainingAmount] = useState(0)
  const [currAmountToPay, setCurrAmountToPay] = useState<string>('')
  const [manualAmountToPay, setManualAmountToPay] = useState<number>(0)
  const [vendorCreditList, setVendorCreditList] = useState<any[]>([])
  const [billData, setBillData] = useState<any[]>([])
  const [manualCreditList, setManualCreditList] = useState([])
  const [automaticCreditList, setAutomaticCreditList] = useState([])
  const [openRemoveCreditModal, setOpenRemoveCreditModal] = useState<boolean>(false)

  const [uploadedFile, setUploadedFile] = useState<any[]>([])
  const [isAllocateCreditModalOpen, setAllocateCreditModalOpen] = useState<boolean>(false)
  const [isAmountToPayModalOpen, setAmountToPayModalOpen] = useState<boolean>(false)

  const [paymentMethodList, setPaymentMethodList] = useState<any[]>([])
  const [bankAccList, setBankAccList] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{ [key: number]: PaymentMethod }>({})
  const [currentVendorId, setCurrentVendorId] = useState<number | null>(null)
  const [paymentMethodOption, setPaymentMethodOption] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    [key: number]: { value: string; DefaultBankId: number | null }
  }>({})
  const [bankMethodOption, setBankMethodOption] = useState<any>([])
  const [selectedBankMethod, setSelectedBankMethod] = useState<PaymentMethodProps>({})

  const handleRemoveCredit = (arg: boolean) => {
    if (arg === true) {
      setCreditAvailed('')
      setIsMultipleCreditAvailed(false)
    }
    setOpenRemoveCreditModal(false)
  }

  // getting data from Allocate Credit Modal for single vendor with single bills
  const handleManualCreditdata = (arg1: any, arg2: any, amount: number) => {
    setManualCreditList(arg1)
    setVendorCreditList(arg2)

    setManualAmountToPay(amount)

    const totalCreditAmount = arg1.reduce((total: any, credit: { CreditAmount: any }) => total + credit.CreditAmount, 0)
    setCreditAvailed(totalCreditAmount.toString())
    setManualAmount(0)

    // Checking if manualCreditList has data
    if (amount > 0) {
      setIsManualSelected(true)
      setIsAutomaticSelected(false)
    } else {
      setIsAutomaticSelected(true)
      setIsManualSelected(false)
    }
  }

  // getting data from Allocate Credit Modal for single vendor with multiple bills also work in multiple vendor with multiple bills
  const handleManualCreditdataForMultiple = (
    creditList: any,
    vendorCredits: any,
    arg3: any,
    totalManualAmount?: any,
    paymentMethodDetails?: any
  ) => {
    if (arg3.length === 1) {
      setManualCreditList(creditList)
      setVendorCreditList(vendorCredits)

      const totalCreditAmount = creditList.reduce((total: number, bill: Bill) => {
        return total + bill.CreditsList.reduce((creditTotal: number, credit: Credit) => creditTotal + credit.CreditAmount, 0)
      }, 0)

      const totalRemainingAmount = vendorCredits.reduce((total: number, bill: any) => {
        // Extract the remainingAmount value from the props object inside the children array
        const remainingAmount = parseFloat(bill.remainingAmount?.props?.children[1]) || 0
        return total + remainingAmount
      }, 0)

      setManualRemainingAmount(totalRemainingAmount.toFixed(2))

      setCreditAvailed(totalCreditAmount.toString())
      setManualAmount(totalManualAmount)

      // Checking if manualCreditList has data
      if (totalCreditAmount >= 0 && Number(totalManualAmount) !== Number(currAmountToPay) && Number(totalManualAmount) !== 0) {
        setIsManualSelected(true)
        setIsAutomaticSelected(false)
      } else {
        setIsAutomaticSelected(true)
        setIsManualSelected(false)
      }
    } else {
      setPaymentMethods(paymentMethodDetails)
      setManualCreditList(creditList)
      setVendorCreditList(vendorCredits)
      const totalCreditAmount = creditList.reduce((total: number, bill: Bill) => {
        return total + bill.CreditsList.reduce((creditTotal: number, credit: Credit) => creditTotal + credit.CreditAmount, 0)
      }, 0)
      setCreditAvailed(totalCreditAmount.toString())
      setManualAmount(totalManualAmount)
      if (totalCreditAmount >= 0 && Number(totalManualAmount) !== Number(currAmountToPay) && Number(totalManualAmount) !== 0 && paymentMethodDetails != undefined) {
        setIsManualSelected(true)
        setIsAutomaticSelected(false)
      } else {
        setIsAutomaticSelected(true)
        setIsManualSelected(false)
      }
    }
  }

  // Function to get the current year
  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  // Function to get the past one year from the current year
  const getPastYear = () => {
    return getCurrentYear() - 1
  }

  // Function to get the next one year from the current year
  const getNextYear = () => {
    return getCurrentYear() + 1
  }

  useEffect(() => {
    if (onOpen) {
      setManualAmount(0)
      if (selectedRowIds.length === 1) {
        setCurrAmountToPay(remainingAmount)
      } else if (selectedRowIds.length > 0) {
        setCurrAmountToPay(String(totalAmountToPay))
      }
    }
  }, [onOpen, totalAmountToPay, selectedRowIds, remainingAmount])

  const handleCloseReauthenticateModal = () => {
    setIsPayBillClicked(false)
  }

  const handleCreditAvailedToggle = () => {
    setIsCreditAvailed(!isCreditAvailed)
    setIsMultipleCreditAvailed(false)
    if (!isCreditAvailed) {
      setIsAutomaticSelected(true)
      setIsManualSelected(false)
    } else {
      setIsAutomaticSelected(false)
      setIsManualSelected(false)
      setCreditAvailed('')
    }
  }

  const handleCreditAvailedToggleForMultiple = () => {
    setIsMultipleCreditAvailed(!isMultipleCreditAvailed)
    if (!isMultipleCreditAvailed) {
      setCreditAvailed('')
      return
    }
    if (isMultipleCreditAvailed) {
      setOpenRemoveCreditModal(true)
    } else {

      // When turning credit on, fetch automatic credit
      fetchAutomaticVendorCredit()
    }
  }

  const handleAutoCreditSelected = () => {
    setIsAutomaticSelected(true)
    setIsManualSelected(false)
    if (selectedRowIds.length === 1) {
      setCurrAmountToPay(remainingAmount)
    } else if (selectedRowIds.length > 0) {
      setCurrAmountToPay(String(totalAmountToPay))
    }
  }

  const handleManualCreditSelected = () => {
    setIsAutomaticSelected(false)
    setIsManualSelected(true)
    isCreditAvailed === true && setAllocateCreditModalOpen(true)
  }

  const handleFullPaymentSelected = () => {
    setCreditAvailed('')
    setCurrAmountToPay(totalAmountToPay + "")
    // setManualAmount(Number(totalAmountToPay))
    setIsAutomaticSelected(true)
    setIsManualSelected(false)
  }

  const transformToVendorBills = (details: any[]) => {
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
    setIsAutomaticSelected(false)
    setIsManualSelected(true)
    isCreditAvailed === true && setAmountToPayModalOpen(true)

    const vendorBills = transformToVendorBills(selectedBillDetails)
    setBillData([])
    const billDetails = async () => {
      const params = {
        VendorBills: vendorBills,
      }
      performApiAction(dispatch, BillDetails, params, (responseData: any) => {
        setBillData(responseData)
      })
    }
    billDetails()
  }

  const handleStandardSelected = () => {
    setStandardSelected(true)
    setSameDaySelected(false)
    setNextDaySelected(false)
  }

  const handleSameDaySelected = () => {
    setStandardSelected(false)
    setSameDaySelected(true)
    setNextDaySelected(false)
  }

  const handleNextDaySelected = () => {
    setStandardSelected(false)
    setSameDaySelected(false)
    setNextDaySelected(true)
  }

  const handleMergeBillsSelected = () => {
    setMergeBillsSelected(true)
    setSingleBillSelected(false)
  }

  const handleSingleBillSelected = () => {
    setMergeBillsSelected(false)
    setSingleBillSelected(true)
  }

  const handleCloseBothModals = () => {
    onClose()
    handleResetAll()
    setIsPayBillClicked(false)
  }

  const handleCloseModal = () => {
    onClose()
    handleResetAll()
  }

  const handleAllocateCreditModalClose = () => {
    setAllocateCreditModalOpen(false)
  }

  const handleAmountToPayModalClose = () => {
    setAmountToPayModalOpen(false)
  }

  // Fetch Payment Method Dropdown List
  const fetchPaymentMethods = async () => {
    const params = {
      VendorIds: vendorsId ? vendorsId : 0,
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
      const formattedOptions = responseData.map((f: any) => ({ label: f.label, value: f.value.toString() }))
      setBankMethodOption(formattedOptions)

      function isPaymentMethodInfo(obj: any): obj is PaymentMethodInfo {
        return (
          obj &&
          typeof obj.value === 'string' &&
          (obj.DefaultBankId === undefined || obj.DefaultBankId === null || typeof obj.DefaultBankId === 'number')
        )
      }

      // Automatically select bank accounts based on selected payment methods
      const newSelectedBankMethods: { [key: number]: string } = {}
      Object.entries(selectedPaymentMethod).forEach(([vendorId, paymentMethodInfo]) => {
        if (isPaymentMethodInfo(paymentMethodInfo) && paymentMethodInfo.DefaultBankId != null) {
          const matchingBankAccount = formattedOptions.find(
            (option: any) => option.value === paymentMethodInfo.DefaultBankId!.toString()
          )
          if (matchingBankAccount) {
            newSelectedBankMethods[Number(vendorId)] = matchingBankAccount.value
          }
        }
      })

      setSelectedBankMethod((prevState) => ({
        ...prevState,
        ...newSelectedBankMethods,
      }))
    })
  }

  const fetchVendorCreditList = async () => {
    const params = {
      VendorId: vendorId ? vendorId : 0,
    }
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

  const prepareDataForApi = (data: any) => {
    return data.map((d: any) => {
      const amount = d.Amount?.toFixed(2)
      return {
        VendorId: d.VendorId,
        AccountPaybleId: d.AccountPaybleId,
        Amount: Number(amount),
      }
    })
  }

  const fetchAutomaticVendorCredit = async () => {
    const params = {
      BillDetails: selectedBillDetails?.length > 0 ? prepareDataForApi(selectedBillDetails) : [],
    }
    performApiAction(dispatch, getautomaticvendorcredit, params, (responseData: any) => {
      const updatedList = responseData?.AutomaticCreditList
        ? responseData?.AutomaticCreditList.map((d: any) => {
          return { ...d }
        })
        : []
      setAutomaticCreditList(updatedList)
      setCreditAvailed(responseData?.TotalCredit)
    })
  }

  // useEffect(() => {
  //   if (onOpen === true && isAutomaticSelected === true && isCreditAvailed === true) {
  //     fetchAutomaticVendorCredit()
  //   }
  // }, [onOpen, isAutomaticSelected, selectedBillDetails, isCreditAvailed])

  // useEffect(() => {
  //   if (onOpen && isMultipleCreditAvailed) {
  //     fetchAutomaticVendorCredit()
  //   }
  // }, [onOpen, isMultipleCreditAvailed])

  useEffect(() => {
    if (onOpen) {
      if (isAutomaticSelected && isCreditAvailed) {
        fetchAutomaticVendorCredit();
      } else if (isMultipleCreditAvailed) {
        fetchAutomaticVendorCredit();
      } else { }
    }
  }, [onOpen, isAutomaticSelected, isCreditAvailed, isMultipleCreditAvailed, selectedBillDetails]);

  const handlePayBill = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    let hasError = false

    if (vendorsId.length <= 1) {
      if (paymentMethod <= 0) {
        setPaymentMthdErr(true)
        hasError = true
      }

      if (selectedBank <= 0) {
        setSelectedBankErr(true)
        hasError = true
      }
    }

    if (selectedBillDate?.trim().length <= 0) {
      setBillDateErr(true)
      hasError = true
    }

    if (Number(creditAvailed) > Number(currAmountToPay)) {
      setCreditAvailedErr(true)
      setCreditAvailedErrMsg('Availing credit should not exceed the amount to pay.')
      hasError = true
    }

    if (Number(creditAvailed) === 0 && Number(currAmountToPay) === 0) {
      hasError = true
      Toast.error('Bill amount and credit cannot be 0')
    }

    if (!hasError) {
      setIsPayBillClicked(true)
    }
  }

  const handleResetAll = () => {
    setIsCreditAvailed(true)
    setIsAutomaticSelected(true)
    setIsManualSelected(false)
    setIsPayBillClicked(false)
    setStandardSelected(true)
    setSameDaySelected(false)
    setNextDaySelected(false)
    setMergeBillsSelected(true)
    setSingleBillSelected(false)
    setPaymentMethod(0)
    setPaymentMthdErr(false)
    setSelectedBank(0)
    setSelectedBankErr(false)
    setSelectedBillDate('')
    setBillDateErr(false)
    setCreditAvailed('')
    setCreditAvailedErr(false)
    setCreditAvailedErrMsg('')
    setCurrAmountToPay('')
    setManualAmountToPay(0)
    setUploadedFile([])
    setAllocateCreditModalOpen(false)
    setAmountToPayModalOpen(false)
  }

  // API for send bill for pay
  const sendBillForPay = async () => {
    let creditsList: any

    if (creditAvailed === '') {
      creditsList = []
    } else if (isAutomaticSelected) {
      creditsList = automaticCreditList
    } else if (isManualSelected) {
      creditsList = manualCreditList
    } else {
      creditsList = null
    }

    const mainBillDetail = selectedBillDetails.reduce((acc: any[], curr: any) => {
      const existingVendor = acc.find((v: any) => v.VendorId === curr.VendorId)

      const getFilteredCredits = (billId: number) => {
        if (!creditsList) return null
        const billCredits = creditsList.filter((credit: any) => credit.BillId === billId)
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
        if (isAutomaticSelected) {
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

        if (!billDetail) return Number(currAmountToPay)

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

    const calculateAutomaticDetail = () => {
      // First, always perform the reduce operation
      const automaticDetail = selectedBillDetails.reduce((acc: any[], curr: any) => {
        const existingVendor = acc.find((v: any) => v.VendorId === curr.VendorId)

        const getFilteredCredits = (vendorId: number) => {
          if (!creditsList) return []
          return creditsList.filter((credit: any) => credit.VendorId === vendorId)
        }

        const calculateAmount = (billId: number, amount: number) => {
          // For automatic credit, we'll use the original amount
          return amount
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

    const params = {
      PaymentMasterList: selectedBillDetails?.length > 0 ? (isManualSelected ? mainBillDetail : calculateAutomaticDetail()) : [],
      PaymentGenrationType: selectedRowIds.length > 1 ? (isSingleBillSelected ? 1 : isMergeBillsSelected ? 2 : 1) : 1,
      PaymentDate: format(parse(selectedBillDate.trim(), 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss"),
    }

    if (params.PaymentMasterList.length > 0 && isManualSelected) {
      if (vendorsId.length > 1) {
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
      } else {
        params.PaymentMasterList = params.PaymentMasterList.map((bill: Bill) => ({
          ...bill,
          PaymentMethod: Number(paymentMethod),
          BankAccount: Number(selectedBank),
        }))
      }
    }
    //  else {
    //   params.PaymentMasterList = params.PaymentMasterList.map((bill: any) => ({
    //     ...bill,
    //     creditsList: creditsList.filter((credit: any) => credit.VendorId === bill.VendorId),
    //     PaymentMethod: paymentMethod,
    //     BankAccount: Number(selectedBank),
    //   }))
    // }

    performApiAction(dispatch, sendForPay, params, () => {
      Toast.success(`Bill${selectedRowIds?.length > 1 ? 's' : ''} has been sent for approval!`)
      onDataFetch()
    })
  }

  // API for uploading attachments
  const handleUploadAttachment = async () => {
    if (uploadedFile.length > 0) {
      let formData: any = new FormData()
      const attachmentFiles = (uploadedFile as any) || []

      Array.from(attachmentFiles).forEach((file, index) => {
        formData.append(`Files[${index}]`, file)
      })

      formData.append('DocumentId', selectedRowIds?.length > 0 ? selectedRowIds[0] : 0)

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
    <>
      <Modal isOpen={onOpen} onClose={handleCloseModal} Height='100vh' width='100vw' noneOutSideClicked>
        <div className='flex items-center justify-between border-b border-b-lightSilver px-10 py-4'>
          <span className='text-2xl font-bold text-[#232343]'>Payment Details</span>
          <span className='cursor-pointer' onClick={handleCloseModal}>
            <Close />
          </span>
        </div>
        <div className='custom-scroll flex h-[calc(100vh-73px)] justify-center overflow-y-auto'>
          <div className={`py-[20px] pb-[5rem] laptop:w-[calc(100vw-50vw)] lg:w-[calc(100vw-60vw)] xl:w-[calc(100vw-65vw)]`}>
            {/* Payment Details (header) */}
            {selectedRowIds?.length > 1 ? null : (
              <div className='flex items-center justify-between rounded-md border border-[#E6E6E6] bg-[#F4F4F4] p-3'>
                <div className='flex flex-col gap-1'>
                  <span className='text-[12px] uppercase text-slatyGrey'>Bill No. & Date</span>
                  <span className='flex items-center gap-1'>
                    <span className='text-xs uppercase text-[#232343]'>{billNumber ?? '-'}</span>
                    <span className='text-xs font-semibold text-[#232343]'>{formatDate(billDate)}</span>
                  </span>
                </div>
                <span className='text-lightSilver'>|</span>
                <div className='flex flex-col gap-1'>
                  <span className='text-[12px] uppercase text-slatyGrey'>Vendor</span>
                  <span className='text-xs font-semibold  text-[#232343]'>
                    {vendorName && vendorName.length > 20 ? vendorName.substring(0, 20) + '...' : vendorName ?? '-'}
                  </span>
                </div>
                <span className='text-lightSilver'>|</span>
                <div className='flex flex-col gap-1'>
                  <span className='text-[12px] uppercase text-slatyGrey'>Due Date</span>
                  <span className='text-xs font-semibold  text-[#232343]'>{formatDate(dueDate)}</span>
                </div>
              </div>
            )}

            {/* Payment Options */}
            <div className='flex flex-col gap-[30px] py-[30px]'>
              <div className='flex justify-between'>
                {selectedRowIds.length > 1 ? (
                  <div className='flex flex-col'>
                    <span className='text-lg font-bold text-darkCharcoal'>{selectedRowIds.length}</span>
                    <span className='text-[14px] uppercase text-slatyGrey'>Bills Selected</span>
                  </div>
                ) : (
                  <div className='flex flex-col'>
                    <span className='text-lg font-bold text-primary'>
                      ${discount === null || discount === '' ? 0.00 : discount && discount.toFixed(2)}
                    </span>
                    <span className='text-[14px] uppercase text-slatyGrey'>Discount</span>
                  </div>
                )}
                {vendorsId?.length === 1 && (
                  <div className='flex flex-col'>
                    <span className='text-right text-lg font-bold text-primary'>
                      ${selectedRowIds.length > 1
                        ? (Number(currAmountToPay) - Number(manualAmount) - Number(creditAvailed)).toFixed(2)
                        : isManualSelected && currAmountToPay != String(manualAmountToPay) ? (Number(currAmountToPay) - Number(manualAmountToPay)).toFixed(2)
                          : !isCreditAvailed && manualAmountToPay != 0
                            ? (Number(currAmountToPay) - Number(manualAmountToPay)).toFixed(2) : Number(remainingAmount).toFixed(2)
                      }
                      {/* Number(currAmountToPay) - Number(manualAmountToPay) - Number(creditAvailed) */}
                      {/* {selectedRowIds.length > 1
                        ? (Number(currAmountToPay) !== Number(manualAmount) && Number(manualAmount) !== 0
                          ? Number(manualRemainingAmount)
                          : Number(currAmountToPay) - Number(creditAvailed)
                        ).toFixed(2)
                        : payAmount} */}
                    </span>
                    <span className='text-[14px] text-right uppercase text-slatyGrey'>remaining</span>
                  </div>
                )}
              </div>

              <div className='rightDatepicker'>
                <Datepicker
                  label='Payment Date'
                  id='bill-date'
                  format='MM/DD/YYYY'
                  startYear={getPastYear()}
                  endYear={getNextYear()}
                  getValue={(e) => {
                    setBillDateErr(false)
                    setSelectedBillDate(e)
                  }}
                  value={selectedBillDate}
                  getError={() => { }}
                  hasError={billDateErr}
                  validate
                />
              </div>
              {vendorsId?.length <= 1 ? (
                <>
                  <div className={`${vendorsId?.length >= 2 && 'pointer-events-none opacity-60'}`}>
                    <Select
                      label='Payment Method'
                      id='payment-method'
                      name='payment-method'
                      options={paymentMethodOption || []}
                      defaultValue={paymentMethod}
                      getValue={(e) => {
                        if (e > 0) {
                          setPaymentMthdErr(false)
                          setPaymentMethod(e)
                          // Update the bank account when payment method changes
                          const selectedMethod = paymentMethodOption.find((method: any) => Number(method.value) === e)
                          if (selectedMethod && selectedMethod.DefaultBankId) {
                            setSelectedBank(selectedMethod.DefaultBankId)
                          }
                        }
                      }}
                      getError={() => { }}
                      placeholder='Select Payment Method'
                      hasError={paymentMthdErr}
                      validate
                    />
                  </div>
                  {/* {Number(paymentMethod) === 5 && (
                    <div className='flex'>
                      <Radio
                        className='text-sm'
                        checked={isStandardSelected}
                        onChange={handleStandardSelected}
                        id='standard'
                        label='Standard'
                      />
                      <Radio
                        className='text-sm'
                        checked={isSameDaySelected}
                        id='same-day'
                        label='Same Day'
                        onChange={handleSameDaySelected}
                      />
                      <Radio
                        className='text-sm'
                        checked={isNextDaySelected}
                        id='next-day'
                        label='Next Day'
                        onChange={handleNextDaySelected}
                      />
                    </div>
                  )} */}
                  <div className={`${vendorsId?.length >= 2 && 'pointer-events-none opacity-60'}`}>
                    <Select
                      label='Bank'
                      id='bank'
                      name='bank'
                      defaultValue={selectedBank + ""}
                      options={bankMethodOption}
                      getValue={(e) => {
                        e > 0 && setSelectedBankErr(false)
                        setSelectedBank(e)
                      }}
                      getError={() => { }}
                      hasError={selectedBankErr}
                      validate
                      disabled={isBankDropdownDisabled(paymentMethod)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={`${vendorsId?.length >= 2 && 'pointer-events-none opacity-60'}`}>
                    <Select
                      label='Payment Method'
                      id='payment-method'
                      name='payment-method'
                      options={paymentMethodOption.find((option) => option.vendorId === currentVendorId)?.paymentMethods || []}
                      defaultValue={currentVendorId !== null ? selectedPaymentMethod[currentVendorId]?.value || '' : ''}
                      getValue={(e) => {
                        if (e && currentVendorId !== null) {
                          setPaymentMthdErr(false)
                          const selectedMethod = paymentMethodOption
                            .find((option) => option.vendorId === currentVendorId)
                            ?.paymentMethods.find((method: { value: string }) => method.value === e)

                          if (selectedMethod) {
                            setSelectedPaymentMethod((prev) => ({
                              ...prev,
                              [currentVendorId]: {
                                value: e,
                                DefaultBankId: selectedMethod.DefaultBankId,
                              },
                            }))
                          }
                        }
                      }}
                      getError={() => { }}
                      placeholder='Select Payment Method'
                      hasError={paymentMthdErr}
                      validate
                    />
                  </div>
                  {/* {Number(paymentMethod) === 5 && (
                    <div className='flex'>
                      <Radio
                        className='text-sm'
                        checked={isStandardSelected}
                        onChange={handleStandardSelected}
                        id='standard'
                        label='Standard'
                      />
                      <Radio
                        className='text-sm'
                        checked={isSameDaySelected}
                        id='same-day'
                        label='Same Day'
                        onChange={handleSameDaySelected}
                      />
                      <Radio
                        className='text-sm'
                        checked={isNextDaySelected}
                        id='next-day'
                        label='Next Day'
                        onChange={handleNextDaySelected}
                      />
                    </div>
                  )} */}
                  <div className={`${vendorsId?.length >= 2 && 'pointer-events-none opacity-60'}`}>
                    <Select
                      label='Bank'
                      id='bank'
                      name='bank'
                      defaultValue={selectedBank}
                      options={bankMethodOption}
                      getValue={(e) => {
                        e > 0 && setSelectedBankErr(false)
                        setSelectedBank(e)
                      }}
                      getError={() => { }}
                      hasError={selectedBankErr}
                      validate
                    />
                  </div>
                </>
              )}

              {selectedRowIds?.length > 1 ? (<>
                <div className='relative'>
                  <div className='mb-1 flex items-center justify-between'>
                    <label className='text-sm font-bold !uppercase text-darkCharcoal'>Credit Availed</label>
                    <span onClick={handleCreditAvailedToggleForMultiple}>
                      <Switch checked={isMultipleCreditAvailed} />
                    </span>
                  </div>
                  <Text
                    label='Credit Availed'
                    id='credit-availed'
                    placeholder='Enter Amount'
                    className='!py-0 pl-3'
                    value={isMultipleCreditAvailed ? (creditAvailed !== '' ? Number(creditAvailed).toFixed(2) : '0.00') : '0.00'}
                    getValue={(e) => {
                      setCreditAvailedErr(false)
                      setCreditAvailed(e)
                    }}
                    getError={() => { }}
                    hasError={creditAvailedErr}
                    errorMessage={creditAvailedErrMsg}
                    validate
                    readOnly
                  />
                  <span className='text-xs text-slatyGrey'>
                    The available credit is adjusted proportionately among the credit memos on a "First-In, First-allocate" basis.
                  </span>
                  <span className={`absolute left-0 top-[60px] text-sm ${creditAvailedErr ? 'text-[#FB2424]' : 'text-slatyGrey'}`}>
                    $
                  </span>
                  {/* {Number(creditAvailed) > 0 && (
                    <span
                      className='absolute right-2 top-[22px] cursor-pointer text-sm text-[#FB2424] underline'
                      onClick={() => setOpenRemoveCreditModal(true)}
                    >
                      Remove
                    </span>
                  )} */}
                </div>
              </>) : (
                <>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-bold !uppercase text-darkCharcoal'>Credit Availed</label>
                    <span onClick={handleCreditAvailedToggle}>
                      <Switch checked={isCreditAvailed} />
                    </span>
                  </div>
                  <div className={`flex ${!isCreditAvailed ? 'hidden' : ''}`}>
                    <Radio
                      className='text-sm'
                      disabled={!isCreditAvailed}
                      checked={isAutomaticSelected && isCreditAvailed}
                      onChange={handleAutoCreditSelected}
                      id='automatic'
                      label='Automatic'
                    />
                    <Radio
                      className='text-sm'
                      disabled={!isCreditAvailed}
                      checked={isManualSelected && isCreditAvailed}
                      id='manual'
                      label='Manual'
                      onClick={handleManualCreditSelected}
                    />
                  </div>
                  <div className='!pointer-events-none relative !opacity-80 select-none'>
                    <Text
                      label='Credit Availed'
                      id='credit-availed'
                      placeholder='Enter Amount'
                      className='pl-3 select-none'
                      value={creditAvailed !== '' ? Number(creditAvailed).toFixed(2) : 0}
                      getValue={(e) => {
                        setCreditAvailedErr(false)
                        setCreditAvailed(e)
                      }}
                      getError={() => { }}
                      hasError={creditAvailedErr}
                      errorMessage={creditAvailedErrMsg}
                      validate
                      disabled={!isCreditAvailed}
                    />
                    <span className={`absolute left-0 top-[30px] text-slatyGrey ${creditAvailedErr ? 'text-[#FB2424]' : ''}`}>
                      $
                    </span>
                  </div>
                </>
              )}

              {selectedRowIds.length > 1 && (
                <div>
                  <b className='uppercase'>amount to pay</b>
                  <div className='flex pt-5'>
                    <Radio
                      className='text-sm'
                      disabled={!isCreditAvailed}
                      checked={isAutomaticSelected && isCreditAvailed}
                      onChange={handleFullPaymentSelected}
                      id='automatic'
                      label='Full Payment'
                    />
                    <Radio
                      className='text-sm'
                      disabled={!isCreditAvailed}
                      checked={isManualSelected && isCreditAvailed}
                      id='manual'
                      label='Partial Payment'
                      onClick={handlePartialPaymentSelected}
                    />
                  </div>
                </div>
              )}
              <div className='!pointer-events-none relative !opacity-80 select-none'>
                <Text
                  label='Bill Amount'
                  id='amount-to-pay'
                  placeholder='Enter Amount'
                  className='pl-3 '
                  value={currAmountToPay}
                  getValue={(e) => {
                    const regex = /^\d*\.?\d{0,2}$/
                    if (regex.test(e) || e === '') {
                      payAmount >= e && setCurrAmountToPay(e)
                      setCreditAvailedErr(false)
                      selectedBillDetails[0].Amount = payAmount >= e && e !== '' ? parseFloat(e) : 0
                      payAmount >= e && fetchAutomaticVendorCredit()
                    }
                  }}
                  getError={() => { }}
                  readOnly
                  validate
                />
                <span className={`absolute left-0 top-[31px] text-slatyGrey`}>$</span>
              </div>

              {selectedRowIds.length > 1 ? (
                <div>
                  <label htmlFor='amount-to-pay' className='text-sm font-bold uppercase text-darkCharcoal'>
                    Payment Request Type
                  </label>
                  <div className='flex py-5'>
                    <Radio
                      className='text-sm'
                      checked={isMergeBillsSelected}
                      onChange={handleMergeBillsSelected}
                      id='merge-bills'
                      label='Merge Bills by Vendor'
                    />
                    <Radio
                      className='text-sm'
                      checked={isSingleBillSelected}
                      onChange={handleSingleBillSelected}
                      id='single-bill'
                      label='Single Bills'
                    />
                  </div>
                </div>
              ) : (
                <Uploader variant='small' getValue={handleFileChange} multiSelect />
              )}

              <Button variant='btn-primary' className='flex items-center justify-center rounded-full' onClick={handlePayBill}>
                <span className='border-r border-r-white pr-2 text-sm uppercase'>payable amount</span>
                {isCreditAvailed === true ? (
                  <span className='pl-2 text-sm'>
                    {isManualSelected && (Number(currAmountToPay) == manualAmount) ? (Number(manualAmountToPay) - Number(creditAvailed)).toFixed(2)
                      : ((Number(currAmountToPay) !== manualAmount) && manualAmount > 0
                        ? manualAmount
                        : Number(currAmountToPay) - Number(creditAvailed)
                      ).toFixed(2)}
                  </span>
                ) : (
                  <span className='pl-2 text-sm'>
                    {!isCreditAvailed && manualAmountToPay != 0
                      ? (Number(manualAmountToPay) - Number(creditAvailed)).toFixed(2)
                      : (Number(currAmountToPay) !== Number(manualAmount) && Number(manualAmount) !== 0
                        ? Number(manualAmount)
                        : Number(currAmountToPay) - Number(creditAvailed)
                      ).toFixed(2)}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <AllocateCreditsModal
        onOpen={isAllocateCreditModalOpen}
        onClose={handleAllocateCreditModalClose}
        vendorId={vendorId}
        amountToPay={currAmountToPay}
        vendorCreditDataList={vendorCreditList}
        handleSendData={handleManualCreditdata}
      />

      <AmountToPayModal
        onOpen={isAmountToPayModalOpen && billData.length > 0}
        onClose={handleAmountToPayModalClose}
        vendorId={vendorId}
        amountToPay={currAmountToPay}
        vendorCreditDataList={vendorCreditList}
        BillsData={billData}
        handleSendData={handleManualCreditdataForMultiple}
        vendorsId={vendorsId}
      />

      <ReauthenticateModal
        onOpen={isPayBillClicked}
        onClose={handleCloseReauthenticateModal}
        onPaymentDetailsClose={handleCloseBothModals}
        onSubmitPay={sendBillForPay}
        onUploadAttachments={handleUploadAttachment}
      />

      <RemoveCreditModal
        onOpen={openRemoveCreditModal}
        onClose={() => {
          setOpenRemoveCreditModal(false)
          setIsMultipleCreditAvailed(true)
        }}
        handleActionClick={handleRemoveCredit}
      />
    </>
  )
}

export default PaymentDetailsModal