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
  amountToPay: any
  BillsData: any
  handleSendData: any
  vendorsId: any
}

type VendorData = {
  totalCredit: number
  totalBillAmount: number
  totalPayableAmount: number
  totalRemaingCredit?: number
  availCredit: number
}

type VendorDataMap = {
  [vendorId: string]: VendorData
}

interface PaymentMethodProps {
  [key: string]: string
}

type PaymentMethodInfo = {
  value: string
  DefaultBankId?: number | null
}

const MultipleVendorAmountToPayModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  amountToPay,
  handleSendData,
  BillsData,
  vendorsId,
}) => {
  const dispatch = useAppDispatch()

  const [dataList, setDataList] = useState<any[]>([])
  const [updatedDataList, setUpdatedDataList] = useState<any[]>([])
  const [vendorData, setVendorData] = useState<VendorDataMap>({})
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [enteredCreditData, setEnteredCreditData] = useState<any>([])
  const [currentRowVendorId, setCurrentRowVendorId] = useState<number>(0)
  const [disabledBankAccount, setDisabledBankAccount] = useState<{ [key: string]: boolean }>({})

  const [paymentMethodOption, setPaymentMethodOption] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    [key: number]: { value: string; DefaultBankId: number | null }
  }>({})
  const [bankMethodOption, setBankMethodOption] = useState<any>([])
  const [selectedBankMethod, setSelectedBankMethod] = useState<PaymentMethodProps>({})
  const [editingRow, setEditingRow] = useState<{ id: number | null, field: 'payable' | 'credit' | null }>({ id: null, field: null });

  const textInputRef = useRef<HTMLInputElement | null>(null)

  const columns: any = [
    {
      header: '',
      accessor: 'arrowspace',
      sortable: false,
      colStyle: '!w-[20px] !tracking-[0.02em]',
    },
    { header: 'Bill date', accessor: 'BillDate', sortable: true, colStyle: '!w-[150px] uppercase !pl-[29px]  !tracking-[0.02em]' },
    { header: 'Bill Number', accessor: 'BillNumber', sortable: false, colStyle: '!w-[130px] uppercase !tracking-[0.02em]' },
    { header: 'Due date', accessor: 'DueDate', sortable: true, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Bill Amount', accessor: 'BillAmount', sortable: true, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Avail Credits', accessor: 'AvailCredits', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Payable Amount', accessor: 'PayableAmount', sortable: false, colalign: 'right', colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'remaining Amount', accessor: 'remainingAmount', sortable: false, colalign: 'right', colStyle: '!w-[160px] uppercase !tracking-[0.02em]' },
  ]
  const multiVendorColumns: any = [
    { header: 'Vendor', accessor: 'VendorName', sortable: true, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Payment Method', accessor: 'PaymentMethod', sortable: false, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Bank Name', accessor: 'BankMethod', sortable: false, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Available Credit', accessor: 'TotalCredit', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Total Amount', accessor: 'TotalBillAmount', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
  ]

  const handleClose = () => {
    onClose()
    setIsSaveDisabled(true)
    setDataList([]);
    setUpdatedDataList([]);
    setEnteredCreditData([]);
    setVendorData({});
    setHoveredRow({});
    setCurrentRowVendorId(0);
    setSelectedPaymentMethod({})
    setSelectedBankMethod({})
  }

  useEffect(() => {
    if (onOpen) {
      const storedTableData = localStorage.getItem('MultipleVendorTableData');
      const dataToSave = localStorage.getItem('MultipleVendorCreditData')
      const storedDataList = localStorage.getItem('DataList')

      if (dataToSave) {
        const parsedData = JSON.parse(dataToSave);
        setEnteredCreditData(parsedData)
      }
      if (storedDataList) {
        const parsedData = JSON.parse(storedDataList)
        setDataList(parsedData)
      }
      if (storedTableData) {
        const parsedTableData = JSON.parse(storedTableData);
        setUpdatedDataList(parsedTableData)
        const newVendorData = parsedTableData.reduce((acc: any, vendor: any) => {

          const totalCredit = vendor.CreditDetail.reduce((total: any, credit: any) => total + credit.Credit, 0);
          const totalPayableAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.PayableAmount, 0);
          const totalBillAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.BillAmount, 0);
          const totalCreditAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)

          acc[vendor.VendorId] = {
            totalCredit: totalCredit,
            totalBillAmount,
            totalPayableAmount: totalPayableAmount,
            totalRemaingCredit: totalCredit - totalCreditAmount,
          };
          return acc;
        }, {} as VendorDataMap);
        setVendorData(newVendorData);

        // Reconstruct selected payment and bank methods
        const reconstructedPaymentMethods: any = {};
        const reconstructedBankMethods: any = {};
        parsedTableData.forEach((vendor: any) => {
          reconstructedPaymentMethods[vendor.VendorId] = { value: vendor.PaymentMethod };
          reconstructedBankMethods[vendor.VendorId] = vendor.BankMethod;
        });
        setSelectedPaymentMethod(reconstructedPaymentMethods);
        setSelectedBankMethod(reconstructedBankMethods);
      }
      else {
        let updatedTableData = BillsData.map((vendor: any) => ({
          ...vendor,
          BillDetail: vendor.BillDetail.map((bill: any) => ({
            ...bill,
            VendorId: vendor.VendorId,
            TotalCredit: vendor.TotalCredit,
            AvailCredits: 0,
            remainingCredit: vendor.TotalCredit,
            PayableAmount: bill.BillAmount,
            remainingAmount: 0,
          })),
        }));

        setDataList(updatedTableData);
        setUpdatedDataList(updatedTableData)

        const newVendorData = updatedTableData.reduce((acc: any, vendor: any) => {
          const totalCredit = vendor.CreditDetail.reduce((total: any, credit: any) => total + credit.Credit, 0);
          const totalPayableAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.PayableAmount, 0);
          const totalBillAmount = vendor.BillDetail.reduce((total: any, bill: any) => total + bill.BillAmount, 0);

          acc[vendor.VendorId] = {
            totalCredit,
            totalBillAmount,
            totalPayableAmount: totalPayableAmount,
            totalRemaingCredit: totalCredit,
            availCredit: 0
          };
          return acc;
        }, {} as VendorDataMap);
        setVendorData(newVendorData);
      }
    }
  }, [onOpen, BillsData]);

  const modalClose = () => {
    handleClose()
    const localTotalPayableAmount = localStorage.getItem('totalPayableAmount') ?? amountToPay
    const MultipleVendorTableData = localStorage.getItem('MultipleVendorTableData')
    const vendorTableData = MultipleVendorTableData && JSON.parse(MultipleVendorTableData);
    handleSendData(enteredCreditData, vendorTableData, localTotalPayableAmount, paymentMethodDetails)
  }

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
    fetchPaymentMethods();
    //setSelectedPaymentMethod({})
    // setSelectedBankMethod({})
  }, [onOpen])


  const handleMultiplePayableAmountChange = (rowId: number, value: any, vendorId: string) => {
    const updatedData = dataList.map((vendor) => ({
      ...vendor,
      BillDetail: vendor.BillDetail.map((bill: any) => {
        if (bill.BillId === rowId) {
          setIsSaveDisabled(false)
          const enteredBillAmount = parseFloat(value)

          if (enteredBillAmount < 0) {
            return {
              ...bill,
              PayableAmount: bill.BillAmount,
              remainingAmount: 0
            }
          }
          const payableAmount: number = enteredBillAmount <= bill.BillAmount && value !== '' ? enteredBillAmount : bill.BillAmount

          const remainingAmount = parseFloat(bill.BillAmount) - payableAmount
          const remainingCredit = bill.AvailCredits + vendorData[vendorId]?.availCredit

          return {
            ...bill,
            PayableAmount: payableAmount,
            AvailCredits: 0,
            remainingCredit: remainingCredit,
            remainingAmount: remainingAmount,
          }
        }
        return bill
      }),
    }))

    const updatedVendor = updatedData.find((vendor) => vendor.VendorId === vendorId)
    const updatedRow = updatedVendor?.BillDetail.find((bill: any) => bill.BillId === rowId)

    if (updatedRow && vendorData[vendorId]) {
      const totalPayableAmount = updatedVendor.BillDetail.reduce((total: any, item: any) => total + item.PayableAmount, 0)
      const totalCreditAmount = updatedVendor.BillDetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)
      const remainingCredit = vendorData[vendorId]?.totalCredit - totalCreditAmount

      setVendorData((prevState) => ({
        ...prevState,
        [vendorId]: {
          ...prevState[vendorId],
          totalRemaingCredit: remainingCredit,
          availCredit: totalCreditAmount,
          totalPayableAmount: totalPayableAmount,
        },
      }))

      setUpdatedDataList((prevDataList) =>
        prevDataList.map((vendor) =>
          vendor.VendorId === vendorId
            ? {
              ...vendor,
              BillDetail: vendor.BillDetail.map((bill: any) => (bill.BillId === rowId ? updatedRow : bill)),
            }
            : vendor
        )
      )
    }
  }

  const handleMultipleAvailCreditsChange = (rowId: number, creditAmount: any, vendorId: string) => {
    const vendorCredit = vendorData[vendorId]?.totalCredit
    const getVendorData = updatedDataList.find((bill) => bill.VendorId == vendorId)
    const totalRemainingCreditAmount = getVendorData.BillDetail.reduce((total: any, item: any) => {
      if (item.BillId !== rowId) {
        return total + item.AvailCredits;
      } else {
        return Number(total);
      }
    }, 0);
    const updatedData = dataList.map((vendor) => {
      if (vendor.VendorId == vendorId) {
        setCurrentRowVendorId(Number(vendorId))
        const updatedBilldetail = vendor.BillDetail.map((bill: any) => {
          if (bill.BillId == rowId) {
            setIsSaveDisabled(false)
            const enteredCreditValue = parseFloat(creditAmount) <= bill.TotalCredit ? parseFloat(creditAmount) : 0
            const remAmount = getVendorData.BillDetail.find((bill: any) => bill.BillId == rowId)

            if (enteredCreditValue > bill.PayableAmount || enteredCreditValue < 0 || totalRemainingCreditAmount + enteredCreditValue > vendorCredit) {
              return {
                ...bill,
                PayableAmount: remAmount.remainingAmount > 0 ? bill.BillAmount - remAmount.remainingAmount : bill.PayableAmount,
                AvailCredits: 0,
                remainingAmount: remAmount.remainingAmount
              }
            }
            if (remAmount.remainingAmount > 0) {
              const newPayableAmount = enteredCreditValue > (bill.BillAmount - remAmount.remainingAmount)
                ? (bill.BillAmount - remAmount.remainingAmount)
                : (bill.BillAmount - remAmount.remainingAmount) - enteredCreditValue
              const newAvailCredit = enteredCreditValue > (bill.BillAmount - remAmount.remainingAmount)
                ? 0
                : enteredCreditValue
              return {
                ...bill,
                AvailCredits: newAvailCredit,
                PayableAmount: newPayableAmount,
                remainingAmount: remAmount.remainingAmount
              }
            }
            const newPayableAmount = remAmount.remainingAmount > 0
              ? remAmount.PayableAmount - enteredCreditValue
              : bill.BillAmount - enteredCreditValue

            return {
              ...bill,
              PayableAmount: newPayableAmount,
              AvailCredits: enteredCreditValue,
              // remainingCredit: newRemainingCredit,
              remainingAmount: remAmount.remainingAmount
              // ...(billAmount === bill.BillAmount ? { remainingAmount: updatedRemainingAmount, remainingCredit: newRemainingCredit } : {}),
            }
          }
          return bill
        })
        const totalPayableAmount = updatedBilldetail.reduce((total: any, bill: any) => total + bill.PayableAmount, 0)
        const totalBillCredit = updatedBilldetail.reduce((total: any, bill: any) => total + bill.TotalCredit, 0)

        const totalCreditAmount = updatedBilldetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)
        const updatedAvailCredit = vendorData[vendorId]?.totalCredit - totalCreditAmount

        return {
          ...vendor,
          BillDetail: updatedBilldetail,
          TotalCredit: totalBillCredit,
          TotalBillAmount: totalPayableAmount,
          TotalRemaingCredit: updatedAvailCredit,
        }
      }

      return vendor
    })

    const updatedVendor = updatedData.find((vendor) => vendor.VendorId === vendorId)
    const updatedRow = updatedVendor?.BillDetail.find((bill: any) => bill.BillId === rowId)

    if (updatedRow && vendorData[vendorId]) {
      const vendorCredit = vendorData[vendorId]?.totalCredit
      const totalCreditAmount = updatedVendor.BillDetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)

      Number(vendorCredit) >= Number(totalCreditAmount) &&
        setUpdatedDataList((prevDataList) =>
          prevDataList.map((vendor) =>
            vendor.VendorId === vendorId
              ? {
                ...vendor,
                BillDetail: vendor.BillDetail.map((bill: any) => (bill.BillId === rowId ? updatedRow : bill)),
              }
              : vendor
          )
        )
    }
  }

  useEffect(() => {
    if (updatedDataList && currentRowVendorId > 0) {
      const getVendorData = updatedDataList.find((bill) => bill.VendorId == currentRowVendorId)
      const vendorCredit = vendorData[currentRowVendorId]?.totalCredit
      const totalCreditAmount = getVendorData?.BillDetail.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)

      const updatedAvailCredit = vendorCredit - totalCreditAmount
      if (Number(vendorCredit) >= Number(totalCreditAmount)) {
        setVendorData((prevState) => ({
          ...prevState,
          [currentRowVendorId]: {
            ...prevState[currentRowVendorId],
            totalRemaingCredit: updatedAvailCredit,
            availCredit: totalCreditAmount
          },
        }))
      }

      const totalPayableAmount = getVendorData.BillDetail?.reduce((total: any, bill: any) => total + bill.PayableAmount, 0)
      if (Number(vendorCredit) >= Number(totalCreditAmount)) {
        setVendorData((prevState) => ({
          ...prevState,
          [currentRowVendorId]: {
            ...prevState[currentRowVendorId],
            totalPayableAmount: totalPayableAmount,
          },
        }))
      }
    }
  }, [updatedDataList])

  let totalPayableAmount = 0

  const calculateTotalPayableAmount = (vendorData: Record<string, { totalPayableAmount: number }>) => {
    return Object.values(vendorData).reduce((total, vendor) => total + vendor.totalPayableAmount, 0)
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
    const allVendorsHavePaymentMethodAndBankMethod = updatedDataList.every(
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

    const tableData = updatedDataList.map(vendor => ({
      ...vendor,
      PaymentMethod: selectedPaymentMethod[vendor.VendorId]?.value,
      BankMethod: selectedBankMethod[vendor.VendorId],
      TotalCredit: vendorData[vendor.VendorId]?.totalCredit || 0,
      TotalBillAmount: vendorData[vendor.VendorId]?.totalPayableAmount || 0
    }));

    localStorage.setItem('MultipleVendorTableData', JSON.stringify(tableData));

    const distributeCredits = (dataList: any) => {
      const distributeCreditsFIFO = (amount: number, creditDetail: any[]) => {
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
              CreditAmount: creditAmount,
            });

            // Update the CreditDetail amount
            credit.Credit -= creditAmount;
          }
        }

        return CreditsList;
      };

      return dataList.flatMap((vendor: any) => {
        const { BillDetail, CreditDetail } = vendor;

        return BillDetail.filter((bill: any) => bill.AvailCredits > 0).map((bill: any) => {
          const { BillId, AvailCredits, remainingAmount, BillAmount } = bill;
          const creditToDistribute = Math.min(AvailCredits, BillAmount - remainingAmount);
          const CreditsList = distributeCreditsFIFO(creditToDistribute, CreditDetail);

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
    };
    totalPayableAmount = calculateTotalPayableAmount(vendorData)
    localStorage.setItem('totalPayableAmount', JSON.stringify(totalPayableAmount))

    // Output the result for verification
    const dataToSave = distributeCredits(updatedDataList)
    setEnteredCreditData(dataToSave)
    localStorage.setItem('MultipleVendorCreditData', JSON.stringify(dataToSave))
    localStorage.setItem('DataList', JSON.stringify(dataList))

    handleSendData(dataToSave, tableData, totalPayableAmount, paymentMethodDetails)
    handleClose()
  }

  const multiVendorTableData = updatedDataList?.map((d: any) => {
    const vendorPaymentOption = paymentMethodOption.find((option) => option.VendorId === d?.VendorId)

    // Get the PaymentMethodList for the vendor
    const vendorPaymentMethods = vendorPaymentOption?.PaymentMethodList || []

    // Determine the initial default value
    let defaultValue = selectedPaymentMethod[d?.VendorId]?.value || ''
    let defaultBankId = selectedPaymentMethod[d?.VendorId]?.DefaultBankId

    if (!defaultValue && vendorPaymentOption?.PreferdPayment) {
      const preferredMethod = vendorPaymentMethods.find(
        (method: any) => method?.value?.toString() == vendorPaymentOption.PreferdPayment.toString()
      )
      if (preferredMethod) {
        defaultValue = preferredMethod.value.toString()
        defaultBankId = preferredMethod.DefaultBankId

        // Set the initial value and DefaultBankId in selectedPaymentMethod state
        setSelectedPaymentMethod((prevState) => ({
          ...prevState,
          [d?.VendorId]: { value: defaultValue, DefaultBankId: defaultBankId },
        }))

        setDisabledBankAccount(prevState => ({
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
            setDisabledBankAccount(prevState => ({
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
          disabled={disabledBankAccount[d.VendorId]}
          getError={() => { }}
          hasError={false}
        />
      ),
      TotalCredit: <span className='!text-sm !font-bold !text-darkCharcoal'>${(vendorData[d.VendorId]?.totalRemaingCredit || 0).toFixed(2)} </span>,
      TotalBillAmount: (
        <span className='!text-sm !font-bold !text-darkCharcoal'>${(vendorData[d.VendorId]?.totalPayableAmount || 0).toFixed(2)} </span>
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
                      BillAmount: <Typography className='!text-sm !font-bold !text-darkCharcoal'>${formatCurrency(nestedData.BillAmount)}</Typography>,
                      PayableAmount:
                        <div className={`relative w-full ${hoveredRow?.BillId === nestedData.BillId && (editingRow.id !== nestedData.BillId || editingRow.field !== 'payable') ? "border-b border-lightSilver" : ""}`}>
                          {editingRow.id === nestedData.BillId && editingRow.field === 'payable' ? (
                            <div className='w-full mt-1'>
                              <Text
                                defaultValue={nestedData.PayableAmount}
                                getValue={(value) => {
                                  handleMultiplePayableAmountChange(nestedData.BillId, value, nestedData.VendorId)
                                }}
                                className='px-1 text-right'
                                getError={() => { }}
                                autoFocus
                                onBlur={() => setEditingRow({ id: null, field: null })}
                              />
                            </div>
                          ) : (
                            <div
                              className='w-full flex justify-end cursor-pointer !text-sm !font-bold !text-darkCharcoal mt-1'
                              onClick={() => setEditingRow({ id: nestedData.BillId, field: 'payable' })}
                            >
                              ${formatCurrency(nestedData.PayableAmount) || 0}
                            </div>
                          )}
                        </div>,
                      AvailCredits:
                        <div className={`w-full ${hoveredRow?.BillId === nestedData.BillId && (editingRow.id !== nestedData.BillId || editingRow.field !== 'credit') ? "border-b border-lightSilver" : ""}`}>
                          {editingRow.id === nestedData.BillId && editingRow.field === 'credit' ? (
                            <div className='w-full mt-1'>
                              <Text
                                className='px-1 text-right'
                                defaultValue={nestedData.AvailCredits !== '' || nestedData.AvailCredits !== 0 ? nestedData.AvailCredits : ''}
                                getValue={(value) => { handleMultipleAvailCreditsChange(nestedData.BillId, value, nestedData.VendorId) }}
                                getError={() => { }}
                                autoFocus
                                onBlur={() => setEditingRow({ id: null, field: null })}
                              />
                            </div>
                          ) : (
                            <div
                              className='w-full flex justify-end cursor-pointer !text-sm !font-bold !text-darkCharcoal mt-1'
                              onClick={() => setEditingRow({ id: nestedData.BillId, field: 'credit' })}
                            >
                              ${formatCurrency(nestedData.AvailCredits || 0)}
                            </div>
                          )}
                        </div>,
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

  return (
    <Modal isOpen={onOpen} onClose={modalClose} width='94vw' Height='600px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div ref={textInputRef} className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Partial payment with manual credit adjustment</div>
        <div className='pt-2.5' onClick={modalClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='flex flex-col p-5'>
        <div className='h-[55vh] w-full overflow-y-auto approvalMain max-[425px]:mx-1 custom-scroll'>
          <div className={`${BillsData.length === 0 ? 'h-11' : 'h-auto'}`}>
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
          </div>

          {updatedDataList.length === 0 && (
            <div className='mx-5 flex h-[59px] w-auto items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
          )}
        </div>
      </ModalContent>

      <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
        <Button
          className={`btn-sm !h-9 rounded-full !w-[94px]`}
          variant={`btn-outline-primary`}
          onClick={modalClose}>
          <label className="font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">CANCEL</label>
        </Button>
        <Button
          className='btn-sm !h-9 rounded-full !w-[84px]'
          variant={isSaveDisabled ? 'btn' : 'btn-primary'}
          disabled={isSaveDisabled}
          onClick={handleSaveButtonClick}>
          <label className={`disabled:opacity-50 flex items-center justify-center cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
            SAVE
          </label>
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default MultipleVendorAmountToPayModal