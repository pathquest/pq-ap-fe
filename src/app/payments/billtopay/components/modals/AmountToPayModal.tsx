/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { getBankAccountDrpdwnList, getPaymentMethodsbyVendor } from '@/store/features/billsToPay/billsToPaySlice'
import { Button, Close, DataTable, Modal, ModalAction, ModalContent, ModalTitle, Select, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  vendorId?: string
  vendorCreditDataList?: any
  handleSendData?: any
  amountToPay?: any
  BillsData?: any
  vendorsId?: any
}

type VendorData = {
  totalCredit: number
  totalBillAmount: number
  totalPayableAmount: number
  totalRemaingCredit?: number
}

type VendorDataMap = {
  [vendorId: string]: VendorData
}

const vendorWiseData: {
  [vendorId: string]: {
    availCred: number
    credit: number
    availPayableAmount: number
  }
} = {}

interface PaymentMethodProps {
  [key: string]: string
}

type PaymentMethodInfo = {
  value: string
  DefaultBankId?: number | null
}

const AmountToPayModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  vendorId,
  handleSendData,
  vendorCreditDataList,
  BillsData,
  vendorsId,
}) => {
  const dispatch = useAppDispatch()

  const [selectedRows, setSelectedRows] = useState<any>([])
  const [dataList, setDataList] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [vendorData, setVendorData] = useState<VendorDataMap>({})
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [enteredCreditData, setEnteredCreditData] = useState<any>([])
  const [credit, setCredit] = useState(0)
  const [availCred, setAvailCred] = useState(0)
  const [availpayableAmount, setAvailPayableAmount] = useState(0)
  const [disabledBankMethods, setDisabledBankMethods] = useState<{ [key: string]: boolean }>({})

  // For multiplevendor and multipleBills
  const [vendorWiseData, setVendorWiseData] = useState<{
    [vendorId: string]: {
      availCred: number
      credit: number
      availPayableAmount: number
    }
  }>({})

  const [paymentMethodOption, setPaymentMethodOption] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    [key: number]: { value: string; DefaultBankId: number | null }
  }>({})
  const [bankMethodOption, setBankMethodOption] = useState<any>([])
  const [selectedBankMethod, setSelectedBankMethod] = useState<PaymentMethodProps>({})

  const textInputRef = useRef<HTMLInputElement | null>(null)

  const handleClose = () => {
    onClose()
    setIsSaveDisabled(true)
  }

  const table_data = BillsData

  const fetchPaymentMethods = async () => {
    const params = {
      VendorIds: vendorsId ? vendorsId : [],
    }

    performApiAction(dispatch, getPaymentMethodsbyVendor, params, (responseData: any) => {
      setPaymentMethodOption(responseData ?? [])
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

  useEffect(() => {
    fetchBankAccountDrpdwnList()
  }, [selectedPaymentMethod, onOpen])

  useEffect(() => {
    setSelectedPaymentMethod({})
    setSelectedBankMethod({})
  }, [onOpen])

  useEffect(() => {
    if (table_data.length === 1) {
      const vendor = table_data[0]
      const initialDataList = vendor.BillDetail?.map((bill: any) => ({
        ...bill,
        VendorId: vendor.VendorId,
        TotalCredit: bill.BillAmount,
        AvailCredits: 0,
        remainingCredit: bill.BillAmount,
        PayableAmount: bill.BillAmount,
        remainingAmount: 0,
      }))
      setData(table_data)
      setDataList(initialDataList)

      const totalCreditAmount = dataList
        .filter((bill) => bill.VendorId === vendor.VendorId)
        .reduce((total, bill) => total + bill.AvailCredits, 0)

      const totalCredit = vendor.CreditDetail.reduce((total: any, credit: any) => total + credit.Credit, 0)
      setAvailCred(totalCredit)
      setCredit(totalCredit)
      const totalBillAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.BillAmount, 0)
      setAvailPayableAmount(totalBillAmount)
      const vendorDataMap: VendorDataMap = {
        [vendor.VendorId]: {
          totalCredit: totalCredit,
          totalBillAmount,
          totalPayableAmount: totalBillAmount,
          totalRemaingCredit: totalCredit - totalCreditAmount,
        },
      }
      setVendorData(vendorDataMap)
    } else {
      // Handle cases with multiple vendors if needed
      const updatedTableData = table_data.map((vendor: any) => ({
        ...vendor,
        BillDetail: vendor.BillDetail.map((bill: any) => ({
          ...bill,
          VendorId: vendor.VendorId,
          TotalCredit: bill.BillAmount,
          AvailCredits: 0,
          remainingCredit: bill.BillAmount,
          PayableAmount: bill.BillAmount,
          remainingAmount: 0,
        })),
      }))

      setData(table_data)
      setDataList(updatedTableData)

      const newVendorData = updatedTableData.reduce((acc: any, vendor: any) => {
        const totalCreditAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)
        const totalCredit = vendor.CreditDetail.reduce((total: any, credit: any) => total + credit.Credit, 0)
        const totalBillAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.BillAmount, 0)
        acc[vendor.VendorId] = {
          totalCredit,
          totalBillAmount,
          totalPayableAmount: totalBillAmount,
          totalRemaingCredit: totalCredit - totalCreditAmount,
        }

        vendorWiseData[vendor.VendorId] = {
          availCred: totalCredit,
          credit: totalCredit,
          availPayableAmount: totalBillAmount,
        }
        return acc
      }, {} as VendorDataMap)

      setVendorData(newVendorData)
      setVendorWiseData(vendorWiseData)
    }
    fetchPaymentMethods()
  }, [onOpen])

  const handlePayableAmountChange = (rowId: number, value: any, vendorId: string) => {
    const updatedData = dataList.map((item: any) => {
      if (item.BillId === rowId) {
        setIsSaveDisabled(false)
        const enteredBillAmount = parseFloat(value)
        const payableAmount: number = enteredBillAmount <= item.BillAmount && value !== '' ? enteredBillAmount : 0

        const remainingAmount = parseFloat(item.BillAmount) - payableAmount
        return {
          ...item,
          PayableAmount: payableAmount,
          remainingAmount: remainingAmount,
          AvailCredits: 0,
          remainingCredit: payableAmount,
        }
      }

      return item
    })

    const updatedRow = updatedData.find((item: any) => item.BillId === rowId)

    if (updatedRow) {
      const totalCreditAmount = updatedData.reduce((total, item) => total + item.PayableAmount, 0)
      setAvailPayableAmount(totalCreditAmount)

      setDataList((prevDataList) => prevDataList.map((item) => (item.BillId === rowId ? updatedRow : item)))

      setSelectedRows(selectedRows.filter((id: any) => id !== rowId))
    }
  }

  const handleMultiplePayableAmountChange = (rowId: number, value: any, vendorId: string) => {
    const updatedData = dataList.map((vendor) => ({
      ...vendor,
      BillDetail: vendor.BillDetail.map((bill: any) => {
        if (bill.BillId === rowId) {
          setIsSaveDisabled(false)
          const enteredBillAmount = parseFloat(value)
          const payableAmount: number = enteredBillAmount <= bill.BillAmount && value !== '' ? enteredBillAmount : 0

          const remainingAmount = parseFloat(bill.BillAmount) - payableAmount
          return {
            ...bill,
            PayableAmount: payableAmount,
            remainingAmount: remainingAmount,
            AvailCredits: 0,
            remainingCredit: payableAmount,
          }
        }
        return bill
      }),
    }))

    const updatedVendor = updatedData.find((vendor) => vendor.VendorId === vendorId)
    const updatedRow = updatedVendor?.BillDetail.find((bill: any) => bill.BillId === rowId)

    if (updatedRow && vendorWiseData[vendorId]) {
      const totalPayableAmount = updatedVendor.BillDetail.reduce((total: any, item: any) => total + item.PayableAmount, 0)
      setVendorWiseData((prevState) => ({
        ...prevState,
        [vendorId]: {
          ...prevState[vendorId],
          availPayableAmount: totalPayableAmount,
        },
      }))

      setDataList((prevDataList) =>
        prevDataList.map((vendor) =>
          vendor.VendorId === vendorId
            ? {
              ...vendor,
              BillDetail: vendor.BillDetail.map((bill: any) => (bill.BillId === rowId ? updatedRow : bill)),
            }
            : vendor
        )
      )

      setSelectedRows(selectedRows.filter((id: any) => id !== rowId))
    }
  }

  const handleAvailCreditsChange = (rowId: number, value: any, vendorId: string) => {
    const updatedData = dataList?.map((item) => {
      if (item.BillId === rowId) {
        setIsSaveDisabled(false)

        const remainingCredit = parseFloat(item.remainingCredit)
        const entervalue = parseFloat(value)
        const vendorTotalCredit = vendorData[vendorId]?.totalRemaingCredit || 0

        let updatedAvailCredits = entervalue <= remainingCredit && entervalue <= vendorTotalCredit ? entervalue : 0

        const billAmount =
          updatedAvailCredits > 0 || Number.isNaN(updatedAvailCredits) ? remainingCredit - updatedAvailCredits : item.BillAmount
        return {
          ...item,
          PayableAmount: billAmount,
          AvailCredits: updatedAvailCredits,
          ...(billAmount === item.BillAmount ? { remainingAmount: 0, remainingCredit: billAmount } : {}),
        }
      }

      return item
    })

    const updatedRow = updatedData.find((item: any) => item.BillId === rowId)

    if (updatedRow) {
      const totalCreditAmount = updatedData.reduce((total, item) => total + item.AvailCredits, 0)

      const totalPayableAmount = updatedData.reduce((total, item) => total + item.PayableAmount, 0)

      const updatedAvailCredit = vendorData[vendorId]?.totalCredit - totalCreditAmount
      Number(credit) >= Number(totalCreditAmount) && setAvailCred(updatedAvailCredit)

      const updatedPayableAmount = vendorData[vendorId]?.totalPayableAmount - totalCreditAmount
      Number(credit) >= Number(totalCreditAmount) &&
        Number(totalPayableAmount) <= Number(updatedPayableAmount) &&
        setAvailPayableAmount(totalPayableAmount)

      Number(credit) >= Number(totalCreditAmount) &&
        setDataList((prevDataList) => prevDataList.map((item) => (item.BillId === rowId ? updatedRow : item)))

      setSelectedRows(selectedRows.filter((id: any) => id !== rowId))
    }
  }

  const handleMultipleAvailCreditsChange = (rowId: number, value: any, vendorId: string) => {
    const updatedData = dataList.map((vendor) => {
      if (vendor.VendorId === vendorId) {
        const updatedBilldetail = vendor.BillDetail.map((bill: any) => {
          if (bill.BillId === rowId) {
            setIsSaveDisabled(false)
            const remainingCredit = parseFloat(bill.remainingCredit)

            const enteredValue = parseFloat(value)
            const vendorTotalCredit = vendorData[vendorId]?.totalRemaingCredit || 0

            let updatedAvailCredits = enteredValue <= remainingCredit && enteredValue <= vendorTotalCredit ? enteredValue : 0

            const billAmount =
              updatedAvailCredits > 0 || Number.isNaN(updatedAvailCredits)
                ? remainingCredit - updatedAvailCredits
                : bill.BillAmount

            return {
              ...bill,
              PayableAmount: billAmount,
              AvailCredits: updatedAvailCredits,
              ...(billAmount === bill.BillAmount ? { remainingAmount: 0, remainingCredit: billAmount } : {}),
            }
          }
          return bill
        })

        const totalCreditAmount = updatedBilldetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)
        const totalPayableAmount = updatedBilldetail.reduce((total: any, bill: any) => total + bill.PayableAmount, 0)
        const updatedAvailCredit = vendorData[vendorId]?.totalCredit - totalCreditAmount

        return {
          ...vendor,
          BillDetail: updatedBilldetail,
          TotalCredit: vendorData[vendorId]?.totalCredit,
          TotalBillAmount: totalPayableAmount,
          TotalRemaingCredit: updatedAvailCredit,
        }
      }

      return vendor
    })

    const updatedVendor = updatedData.find((vendor) => vendor.VendorId === vendorId)
    const updatedRow = updatedVendor?.BillDetail.find((bill: any) => bill.BillId === rowId)

    if (updatedRow && vendorWiseData[vendorId]) {
      const totalCreditAmount = updatedVendor.BillDetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)
      const vendorCredit = vendorWiseData[vendorId].credit

      const updatedAvailCredit = vendorCredit - totalCreditAmount

      if (Number(vendorCredit) >= Number(totalCreditAmount)) {
        setVendorWiseData((prevState) => ({
          ...prevState,
          [vendorId]: {
            ...prevState[vendorId],
            availCred: updatedAvailCredit,
          },
        }))
      }

      const totalPayableAmount = updatedVendor.BillDetail?.reduce((total: any, bill: any) => total + bill.PayableAmount, 0)
      const updatedPayableAmount = vendorData[vendorId]?.totalPayableAmount - totalCreditAmount
      if (Number(vendorCredit) >= Number(totalCreditAmount) && Number(totalPayableAmount) <= Number(updatedPayableAmount)) {
        setVendorWiseData((prevState) => ({
          ...prevState,
          [vendorId]: {
            ...prevState[vendorId],
            availPayableAmount: totalPayableAmount,
          },
        }))
      }

      Number(vendorCredit) >= Number(totalCreditAmount) &&
        setDataList((prevDataList) =>
          prevDataList.map((vendor) =>
            vendor.VendorId === vendorId
              ? {
                ...vendor,
                BillDetail: vendor.BillDetail.map((bill: any) => (bill.BillId === rowId ? updatedRow : bill)),
              }
              : vendor
          )
        )
      setSelectedRows(selectedRows.filter((id: any) => id !== rowId))
    }
  }

  const columns: any = [
    {
      header: '',
      accessor: 'arrowspace',
      sortable: false,
      colStyle: '!w-[20px] !tracking-[0.02em]',
    },
    { header: 'Bill date', accessor: 'BillDate', sortable: true, colStyle: '!w-[150px] uppercase !pl-[29px]' },
    { header: 'Bill Number', accessor: 'BillNumber', sortable: false, colStyle: '!w-[130px] uppercase' },
    { header: 'Due date', accessor: 'DueDate', sortable: true, colStyle: '!w-[150px] uppercase' },
    { header: 'Bill Amount', accessor: 'BillAmount', sortable: true, colStyle: '!w-[180px] uppercase' },
    { header: 'Avail Credits', accessor: 'AvailCredits', sortable: false, colStyle: '!w-[180px] uppercase' },
    { header: 'Payable Amount', accessor: 'PayableAmount', sortable: false, colStyle: '!w-[150px] uppercase' },
    { header: 'remaining Amount', accessor: 'remainingAmount', sortable: false, colStyle: '!w-[160px] uppercase' },
  ]

  const multiVendorColumns: any = [
    { header: 'Vendor', accessor: 'VendorName', sortable: true, colStyle: '!w-[150px] uppercase' },
    { header: 'Payment Method', accessor: 'PaymentMethod', sortable: false, colStyle: '!w-[150px] uppercase' },
    { header: 'Bank Name', accessor: 'BankMethod', sortable: false, colStyle: '!w-[150px] uppercase' },
    { header: 'Available Credit', accessor: 'TotalCredit', sortable: false, colStyle: '!w-[180px] uppercase' },
    { header: 'Total Amount', accessor: 'TotalBillAmount', sortable: false, colStyle: '!w-[180px] uppercase' },
  ]

  let totalPayableAmount = 0

  const calculateTotalPayableAmount = (vendorWiseData: Record<number, { availPayableAmount: number }>) => {
    return Object.values(vendorWiseData).reduce((total, vendor) => total + vendor.availPayableAmount, 0)
  }

  const paymentMethodDetails = Object.keys({ ...selectedPaymentMethod, ...selectedBankMethod }).reduce(
    (acc, vendorId) => {
      const numericVendorId = Number(vendorId)

      const paymentMethod = selectedPaymentMethod[numericVendorId]?.value
      const bankAccount = selectedBankMethod[numericVendorId]

      acc[numericVendorId] = {
        PaymentMethod: paymentMethod ? Number(paymentMethod) : 0,
        BankAccount: bankAccount ? Number(bankAccount) : 0,
      }

      return acc
    },
    {} as { [vendorId: number]: { PaymentMethod: number; BankAccount: number } }
  )

  const handleSaveButtonClick = () => {
    if (vendorsId.length > 1) {
      const allVendorsHavePaymentMethodAndBankMethod = dataList.every(
        (vendor) =>
          selectedPaymentMethod[vendor.VendorId] &&
          selectedPaymentMethod[vendor.VendorId].value &&
          selectedBankMethod[vendor.VendorId] &&
          selectedBankMethod[vendor.VendorId].trim() !== ''
      )

      if (!allVendorsHavePaymentMethodAndBankMethod) {
        Toast.error('Please select a payment method and a bank method.')
        return
      }
    }

    const distributeCredits = (dataList: any, table_data: any) => {
      const distributeCreditsFIFO = (billId: number, amount: number, creditDetail: any[]) => {
        const CreditsList = [];
        let remainingAmount = amount;

        for (const credit of creditDetail) {
          if (remainingAmount <= 0) break;

          const { CreditId, Credit } = credit;
          let creditAmount = 0;

          if (remainingAmount >= Credit) {
            creditAmount = Credit;
            remainingAmount -= Credit;
          } else {
            creditAmount = remainingAmount;
            remainingAmount = 0;
          }

          if (creditAmount > 0) {
            CreditsList.push({
              CreditId,
              BillId: billId,
              CreditAmount: creditAmount,
            });

            // Update the CreditDetail amount
            credit.Credit -= creditAmount;
          }
        }

        return CreditsList;
      };

      if (table_data.length === 1) {
        return dataList
          .filter((item: any) => item.AvailCredits > 0)
          .map((item: any) => {
            const { VendorId, AvailCredits, remainingAmount, BillId, BillAmount } = item;
            const vendorData = table_data.find((vendor: any) => vendor.VendorId === VendorId);

            if (vendorData) {
              const { CreditDetail } = vendorData;
              const creditToDistribute = Math.min(AvailCredits, BillAmount - remainingAmount);
              const CreditsList = distributeCreditsFIFO(BillId, creditToDistribute, CreditDetail);

              return {
                BillId,
                Amount: BillAmount - remainingAmount,
                CreditsList,
              };
            }

            return {
              BillId,
              Amount: BillAmount - remainingAmount,
              CreditsList: [],
            };
          });
      } else {
        return dataList.flatMap((vendor: any) => {
          const { VendorId, BillDetail, CreditDetail } = vendor;

          return BillDetail.filter((bill: any) => bill.AvailCredits > 0).map((bill: any) => {
            const { BillId, AvailCredits, remainingAmount, BillAmount } = bill;
            const creditToDistribute = Math.min(AvailCredits, BillAmount - remainingAmount);
            const CreditsList = distributeCreditsFIFO(BillId, creditToDistribute, CreditDetail);

            // Update the bill's data
            const totalCreditUsed = CreditsList.reduce((sum, credit) => sum + credit.CreditAmount, 0);
            bill.AvailCredits -= totalCreditUsed;
            bill.PayableAmount -= totalCreditUsed;

            return {
              BillId,
              Amount: BillAmount - remainingAmount,
              CreditsList,
            };
          });
        });
      }
    };
    totalPayableAmount = calculateTotalPayableAmount(vendorWiseData)

    // Output the result for verification
    const dataToSave = distributeCredits(dataList, data)
    setEnteredCreditData(dataToSave)
    data.length === 1
      ? handleSendData(dataToSave, tableData, table_data, availpayableAmount)
      : handleSendData(dataToSave, tableData, table_data, totalPayableAmount, paymentMethodDetails)
    handleClose()
  }

  const tableData = dataList?.map((d: any) => {
    return {
      ...d,
      DueDate: <Typography type='h6' className='w-full !text-sm !font-proxima'>{formatDate(d.DueDate)}</Typography>,
      BillDate: <Typography type='h6' className='!ml-[21px] w-full !text-sm !font-proxima'>{formatDate(d.BillDate)}</Typography>,
      PayableAmount:
        hoveredRow?.BillId === d.BillId ? (
          <div className='relative'>
            <Text
              value={d.PayableAmount}
              className='pl-3'
              getValue={(e) => {
                handlePayableAmountChange(d.BillId, e, d.VendorId)
              }}
              getError={() => { }}
            />
            <span className='absolute bottom-[2px]'>$ </span>
          </div>
        ) : (
          <span className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>${d.PayableAmount || 0}</span>
        ),
      AvailCredits:
        hoveredRow?.BillId === d.BillId ? (
          <>
            <div className='relative'>
              <Text
                value={d.AvailCredits !== '' || d.AvailCredits !== 0 ? d.AvailCredits : ''}
                className='pl-3'
                getValue={(e) => handleAvailCreditsChange(d.BillId, e, d.VendorId)}
                getError={() => { }}
              />
              <span className='absolute bottom-[2px]'>$</span>
            </div>
          </>
        ) : (
          <span className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>${d.AvailCredits || 0}</span>
        ),
      remainingAmount: (
        <Typography className='!text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d.remainingAmount)}</Typography>
      ),
    }
  })

  const multiVendorTableData = dataList?.map((d: any) => {
    const vendorPaymentOption = paymentMethodOption.find((option) => option.VendorId === d?.VendorId)

    // Get the PaymentMethodList for the vendor
    const vendorPaymentMethods = vendorPaymentOption?.PaymentMethodList || []

    // Determine the initial default value
    let defaultValue = selectedPaymentMethod[d?.VendorId]?.value || ''
    let defaultBankId = selectedPaymentMethod[d?.VendorId]?.DefaultBankId

    if (!defaultValue && vendorPaymentOption?.PreferdPayment) {
      const preferredMethod = vendorPaymentMethods.find(
        (method: any) => method?.value?.toString() === vendorPaymentOption.PreferdPayment.toString()
      )
      if (preferredMethod) {
        defaultValue = preferredMethod.value.toString()
        defaultBankId = preferredMethod.DefaultBankId

        // Set the initial value and DefaultBankId in selectedPaymentMethod state
        setSelectedPaymentMethod((prevState) => ({
          ...prevState,
          [d?.VendorId]: { value: defaultValue, DefaultBankId: defaultBankId },
        }))

        setDisabledBankMethods(prevState => ({
          ...prevState,
          [d?.VendorId]: ['1', '4', '5'].includes(defaultValue)
        }))
      }
    }

    return {
      ...d,
      VendorName:
        d.VendorName?.length > 20 ? (
          <label
            title={d.VendorName}
            className='cursor-pointer !font-semibold'
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {d.VendorName}
          </label>
        ) : (
          <label className='font-proxima text-sm !font-semibold'>{d.VendorName}</label>
        ),
      PaymentMethod: (
        <Select
          search
          id={d?.Id ?? ''}
          options={vendorPaymentMethods ?? []}
          errorClass='!-mt-4'
          defaultValue={defaultValue}
          getValue={(value) => {
            const selectedMethod = vendorPaymentMethods.find((method: any) => method?.value?.toString() === value)
            setSelectedPaymentMethod((prevState) => ({
              ...prevState,
              [d?.VendorId]: {
                value: value,
                DefaultBankId: selectedMethod ? selectedMethod.DefaultBankId : null,
              },
            }))
            setIsSaveDisabled(false);
            const disableBankMethod = ['1', '5', '4'].includes(value)
            setDisabledBankMethods(prevState => ({
              ...prevState,
              [d?.VendorId]: disableBankMethod
            }))
          }}
          getError={() => { }}
          hasError={false}
        />
      ),
      BankMethod: (
        <Select
          search
          id={`bank-${d?.Id ?? ''}`}
          options={bankMethodOption}
          errorClass='!-mt-4'
          defaultValue={selectedBankMethod[d.VendorId] ?? ''}
          getValue={(value) => {
            setIsSaveDisabled(false)
            setSelectedBankMethod((prevState) => ({
              ...prevState,
              [d.VendorId]: value,
            }))
          }}
          disabled={disabledBankMethods[d.VendorId]}
          getError={() => { }}
          hasError={false}
        />
      ),
      TotalCredit: <span className='!text-sm !font-bold !text-darkCharcoal'>${vendorWiseData[d.VendorId]?.availCred || 0} </span>,
      TotalBillAmount: (
        <span className='!text-sm !font-bold !text-darkCharcoal'>${(vendorWiseData[d.VendorId]?.availPayableAmount||0).toFixed(2)} </span>
      ),

      details: (
        <div className='custom-scroll stickyTable h-auto max-h-[288px] overflow-auto border-b border-solid border-black'>
          <DataTable
            columns={columns}
            data={
              d.BillDetail?.length > 0
                ? d.BillDetail.map(
                  (nestedData: any) =>
                    new Object({
                      ...nestedData,
                      DueDate: <Typography type='h6' className='w-full !text-sm !font-proxima'>{formatDate(nestedData.DueDate)}</Typography>,
                      BillDate: <Typography type='h6' className='!ml-[21px] w-full !text-sm !font-proxima'>{formatDate(nestedData.BillDate)}</Typography>,
                      PayableAmount:
                        hoveredRow?.BillId === nestedData.BillId ? (
                          <div className='relative'>
                            <Text
                              value={nestedData.PayableAmount}
                              className='pl-3'
                              getValue={(e) => {
                                handleMultiplePayableAmountChange(nestedData.BillId, e, nestedData.VendorId)
                              }}
                              getError={() => { }}
                            />
                            <span className='absolute bottom-[2px]'>$ </span>
                          </div>
                        ) : (
                          <span className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>
                            ${nestedData.PayableAmount || 0}
                          </span>
                        ),
                      AvailCredits:
                        hoveredRow?.BillId === nestedData.BillId ? (
                          <>
                            <div className='relative'>
                              <Text
                                value={
                                  nestedData.AvailCredits !== '' || nestedData.AvailCredits !== 0 ? nestedData.AvailCredits : ''
                                }
                                className='pl-3'
                                getValue={(e) => handleMultipleAvailCreditsChange(nestedData.BillId, e, nestedData.VendorId)}
                                getError={() => { }}
                              />
                              <span className='absolute bottom-[2px]'>$</span>
                            </div>
                          </>
                        ) : (
                          <span className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>
                            ${nestedData.AvailCredits || 0}
                          </span>
                        ),
                      remainingAmount: (
                        <Typography className='!text-sm !font-bold !text-darkCharcoal'>
                          ${formatCurrency(nestedData.remainingAmount)}
                        </Typography>
                      ),
                    })
                )
                : []
            }
            hoverEffect
            sticky
            getRowId={(value: any) => {
              setHoveredRow(value)
            }}
            getExpandableData={() => { }}
            isTableLayoutFixed
          />
        </div>
      ),
    }
  })

  if (BillsData.length == 0) {
    return null
  }

  return (
    <Modal
      isOpen={onOpen}
      onClose={() => {
        handleClose()
        handleSendData(enteredCreditData, dataList, [], 0)
      }}
      size='extra-lg'
    >
      <ModalTitle className='p-5'>
        <div ref={textInputRef} className='flex items-center justify-center gap-5'>
          <span className='text-lg font-bold text-darkCharcoal'>Amount to Pay</span>
        </div>
        <span
          className='cursor-pointer'
          onClick={() => {
            handleClose()
            handleSendData([], dataList, [], 0)
          }}
        >
          <Close variant='medium' />
        </span>
      </ModalTitle>

      <ModalContent className='flex flex-col'>
        <div className='main_details p-3'>
          {table_data.length === 1 && (
            <>
              <div className='mb-2'>
                <span className='mr-2'>Vendor:</span>
                <span className='ml-14'>{table_data[0]?.VendorName}</span>
              </div>
              <div key={vendorId} className='flex justify-between'>
                <div>Available credit: ${(availCred).toFixed(2)}</div>
                <div>Total Payable Amount: ${(availpayableAmount).toFixed(2)}</div>
              </div>
            </>
          )}
        </div>
        <div className='custom-scroll h-[50vh] w-full overflow-y-auto max-[425px]:mx-1'>
          <div className={` ${BillsData.length !== 0 && 'h-0'}`}>
            {BillsData.length === 1 ? (
              <DataTable
                columns={columns}
                data={tableData}
                hoverEffect
                sticky
                getRowId={(value: any) => {
                  setHoveredRow(value)
                }}
                expandable={false}
                getExpandableData={() => { }}
                isTableLayoutFixed
              />
            ) : (
              <DataTable
                columns={multiVendorColumns}
                data={multiVendorTableData}
                hoverEffect
                sticky
                getRowId={(value: any) => {
                  setHoveredRow(value)
                }}
                expandable={true}
                getExpandableData={() => { }}
                isTableLayoutFixed
              />
            )}
          </div>

          {dataList.length === 0 && (
            <div className='flex h-[59px] w-auto items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
          )}
        </div>
      </ModalContent>

      <ModalAction className='flex items-center gap-5 p-5'>
        <Button
          className='flex h-9 w-24 items-center justify-center rounded-full'
          variant='btn-outline-primary'
          onClick={() => {
            handleClose()
            handleSendData([], dataList, table_data, 0)
          }}
        >
          Cancel
        </Button>
        <Button
          className='flex h-9 w-[85px] items-center justify-center rounded-full disabled:opacity-50'
          variant='btn-primary'
          disabled={isSaveDisabled}
          onClick={handleSaveButtonClick}
        >
          Save
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default AmountToPayModal
