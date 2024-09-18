import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { Button, Close, DataTable, Modal, ModalAction, ModalContent, ModalTitle, Text, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  amountToPay: any
  BillsData: any
  handleSendData: any
  vendorId: number
}

type VendorData = {
  totalCredit: number
  totalBillAmount: number
  totalPayableAmount: number
  totalRemaingCredit: number
  availCredit: number
}

type VendorDataMap = {
  [vendorId: string]: VendorData
}

const SingleVendorPartialPayModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  handleSendData,
  BillsData,
  vendorId
}) => {
  const textInputRef = useRef<HTMLInputElement | null>(null)

  const [dataList, setDataList] = useState<any[]>([])
  const [updatedDataList, setUpdatedDataList] = useState<any[]>([])
  const [vendorData, setVendorData] = useState<VendorDataMap>({})
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [enteredCreditData, setEnteredCreditData] = useState<any>([])
  const [editingRow, setEditingRow] = useState<{ id: number | null, field: 'payable' | 'credit' | null }>({ id: null, field: null });

  const columns: any = [
    { header: 'Bill date', accessor: 'BillDate', sortable: true, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Bill Number', accessor: 'BillNumber', sortable: false, colStyle: '!w-[130px] uppercase !tracking-[0.02em]' },
    { header: 'Due date', accessor: 'DueDate', sortable: true, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Bill Amount', accessor: 'BillAmount', sortable: true, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Avail Credits', accessor: 'AvailCredits', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Payable Amount', accessor: 'PayableAmount', sortable: false, colalign: 'right', colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'remaining Amount', accessor: 'remainingAmount', sortable: false, colalign: 'right', colStyle: '!w-[160px] uppercase !tracking-[0.02em]' },
  ]

  const handleClose = () => {
    onClose()
    setIsSaveDisabled(true)
    setDataList([]);
    setUpdatedDataList([]);
    setEnteredCreditData([]);
    setVendorData({});
    setHoveredRow({})
  }

  const modalClose = () => {
    handleClose()
    handleSendData(enteredCreditData, updatedDataList, vendorData[vendorId]?.totalPayableAmount ?? 0, vendorData[vendorId]?.availCredit ?? 0)
  }

  useEffect(() => {
    if (onOpen && BillsData.length === 1) {
      const vendor = BillsData[0]
      const storedData = localStorage.getItem('PartialPaymentDataList')
      const dataToSave = localStorage.getItem('CreditData')
      const storedDataList = localStorage.getItem('DataList')

      setEnteredCreditData(dataToSave)
      if (storedDataList) {
        const parsedData = JSON.parse(storedDataList)
        setDataList(parsedData)
      }
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setUpdatedDataList(parsedData)
        const totalCredit = vendor.CreditDetail.reduce((total: any, credit: any) => total + credit.Credit, 0)
        const totalPayableAmount = parsedData.reduce((total: any, bill: any) => total + bill.PayableAmount, 0);
        const totalBillAmount = parsedData.reduce((total: any, bill: any) => total + bill.BillAmount, 0);
        const totalCreditAmount = parsedData.reduce((total: any, bill: any) => total + bill.AvailCredits, 0);

        const vendorDataMap: VendorDataMap = {
          [vendor.VendorId]: {
            totalCredit: totalCredit,
            totalBillAmount,
            totalPayableAmount: totalPayableAmount,
            totalRemaingCredit: totalCredit - totalCreditAmount,
            availCredit: totalCreditAmount
          },
        }
        setVendorData(vendorDataMap)
      } else {
        let initialDataList = vendor.BillDetail?.map((bill: any) => ({
          ...bill,
          VendorId: vendor.VendorId,
          TotalCredit: vendor.TotalCredit,
          AvailCredits: 0,
          remainingCredit: vendor.TotalCredit,
          PayableAmount: bill.BillAmount,
          remainingAmount: 0,
        }))
        setDataList(initialDataList)
        setUpdatedDataList(initialDataList)

        const totalCredit = vendor.CreditDetail.reduce((total: any, credit: any) => total + credit.Credit, 0)
        const totalPayableAmount = initialDataList.reduce((total: any, bill: any) => total + bill.PayableAmount, 0);
        const totalBillAmount = initialDataList.reduce((total: any, bill: any) => total + bill.BillAmount, 0);
        const totalCreditAmount = initialDataList.reduce((total: any, bill: any) => total + bill.AvailCredits, 0);

        const vendorDataMap: VendorDataMap = {
          [vendor.VendorId]: {
            totalCredit: totalCredit,
            totalBillAmount,
            totalPayableAmount: totalPayableAmount,
            totalRemaingCredit: totalCredit - totalCreditAmount,
            availCredit: 0
          },
        }
        setVendorData(vendorDataMap)
      }
    }

  }, [onOpen, BillsData])

  const handlePayableAmountChange = (rowId: number, amount: any, vendorId: string) => {
    const updatedData = dataList.map((item: any) => {
      if (item.BillId === rowId) {
        const enteredBillAmount = parseFloat(amount)
        setIsSaveDisabled(false)
        if (enteredBillAmount < 0) {
          return {
            ...item,
            PayableAmount: item.BillAmount,
            remainingAmount: 0
          }
        }
        const payableAmount: number = enteredBillAmount <= item.BillAmount && amount !== '' ? enteredBillAmount : item.BillAmount

        const remainingAmount = parseFloat(item.BillAmount) - payableAmount
        const remainingCredit = item.TotalCredit - vendorData[vendorId]?.availCredit

        return {
          ...item,
          PayableAmount: payableAmount,
          remainingAmount: remainingAmount,
          AvailCredits: 0,
          remainingCredit: remainingCredit,
        }
      }
      return item
    })

    const updatedRow = updatedData.find((item: any) => item.BillId === rowId)
    if (updatedRow) {
      const totalPayableAmount = updatedData.reduce((total: any, item: any) => total + item.PayableAmount, 0)
      const totalCreditAmount = updatedData.reduce((total: any, bill: any) => total + bill.AvailCredits, 0)
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
      setUpdatedDataList((prevDataList) => prevDataList.map((item) => (item.BillId === rowId ? updatedRow : item)))
    }
  }

  const handleAvailCreditsChange = (rowId: number, creditAmount: any, vendorId: string) => {
    const totalRemainingCreditAmount = updatedDataList.reduce((total, item) => {
      if (item.BillId !== rowId) {
        return total + item.AvailCredits;
      } else {
        return total;
      }
    }, 0);

    const updatedData = dataList?.map((bill) => {
      if (bill.BillId === rowId) {
        setIsSaveDisabled(false)

        const enteredCreditValue = parseFloat(creditAmount) <= bill.TotalCredit ? parseFloat(creditAmount) : 0
        const remAmount = updatedDataList.find((bill) => bill.BillId == rowId)
        const vendorCredit = vendorData[vendorId]?.totalCredit

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
          // ...(billAmount == item.BillAmount ? { remainingAmount: updatedRemainingAmount, remainingCredit: updatedRemainingCredit } : {}),
        }
      }
      return bill
    })

    const updatedRow = updatedData.find((item: any) => item.BillId === rowId)
    if (updatedRow) {
      const vendorCredit = vendorData[vendorId]?.totalCredit
      const totalCreditAmount = updatedData.reduce((total, item) => total + item.AvailCredits, 0)

      vendorCredit >= Number(totalCreditAmount) &&
        setUpdatedDataList((prevDataList) => prevDataList.map((item) => (item.BillId === rowId ? updatedRow : item)))
    }
  }

  useEffect(() => {
    if (updatedDataList) {
      const totalPayableAmount = updatedDataList.reduce((total, item) => total + item.PayableAmount, 0)
      const totalCreditAmount = updatedDataList.reduce((total, item) => total + item.AvailCredits, 0)
      const vendorCredit = vendorData[vendorId]?.totalCredit
      const updatedAvailCredit = vendorCredit - totalCreditAmount

      vendorCredit >= Number(totalCreditAmount) &&
        setVendorData((prevState) => ({
          ...prevState,
          [vendorId]: {
            ...prevState[vendorId],
            totalRemaingCredit: updatedAvailCredit,
            availCredit: totalCreditAmount
          },
        }))

      const updatedPayableAmount = totalPayableAmount - totalCreditAmount

      vendorCredit >= Number(totalCreditAmount) && Number(totalPayableAmount) >= Number(updatedPayableAmount) &&
        setVendorData((prevState) => ({
          ...prevState,
          [vendorId]: {
            ...prevState[vendorId],
            totalPayableAmount: totalPayableAmount,
          },
        }))
    }
  }, [updatedDataList])

  const handleSaveButtonClick = () => {
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

      if (table_data.length == 1) {
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
      }
    };

    // Output the result for verification
    const dataToSave = distributeCredits(updatedDataList, BillsData)
    localStorage.setItem('CreditData', JSON.stringify(dataToSave))
    localStorage.setItem('PartialPaymentDataList', JSON.stringify(updatedDataList))
    localStorage.setItem('DataList', JSON.stringify(dataList))
    handleSendData(dataToSave, updatedDataList, vendorData[vendorId]?.totalPayableAmount ?? 0, vendorData[vendorId]?.availCredit ?? 0)
    handleClose()
  }

  const tableData = updatedDataList?.map((d: any) => {
    return {
      ...d,
      DueDate: <Typography type='h6' className='w-full !text-sm !font-proxima'>{formatDate(d.DueDate)}</Typography>,
      BillDate: <Typography type='h6' className='w-full !text-sm !font-proxima'>{formatDate(d.BillDate)}</Typography>,
      BillAmount: <Typography className='!text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d.BillAmount)}</Typography>,
      PayableAmount:
        <div className={`relative w-full ${hoveredRow?.BillId === d.BillId && (editingRow.id !== d.BillId || editingRow.field !== 'payable') ? "border-b border-lightSilver" : ""}`}>
          {editingRow.id === d.BillId && editingRow.field === 'payable' ? (
            <div className='w-full mt-1'>
              <Text
                defaultValue={d.PayableAmount}
                className='px-1 text-right'
                getValue={(value) => {
                  handlePayableAmountChange(d.BillId, value, d.VendorId)
                }}
                getError={() => { }}
                autoFocus
                onBlur={() => setEditingRow({ id: null, field: null })}
              />
            </div>
          ) : (
            <div
              className='w-full flex justify-end cursor-pointer !text-sm !font-bold !text-darkCharcoal mt-1'
              onClick={() => setEditingRow({ id: d.BillId, field: 'payable' })}
            >
              ${formatCurrency(d.PayableAmount) || 0}
            </div>
          )}
        </div>,
      AvailCredits:
        <div className={`w-full ${hoveredRow?.BillId === d.BillId && (editingRow.id !== d.BillId || editingRow.field !== 'credit') ? "border-b border-lightSilver" : ""}`}>
          {editingRow.id === d.BillId && editingRow.field === 'credit' ? (
            <div className='w-full mt-1'>
              <Text
                defaultValue={d.AvailCredits !== '' || d.AvailCredits !== 0 ? d.AvailCredits : ''}
                className='px-1 text-right'
                getValue={(value) => {
                  handleAvailCreditsChange(d.BillId, value, d.VendorId)
                }}
                getError={() => { }}
                autoFocus
                onBlur={() => setEditingRow({ id: null, field: null })}
              />
            </div>
          ) : (
            <div
              className='w-full flex justify-end cursor-pointer !text-sm !font-bold !text-darkCharcoal mt-1'
              onClick={() => setEditingRow({ id: d.BillId, field: 'credit' })}
            >
              ${formatCurrency(d.AvailCredits || 0)}
            </div>
          )}
        </div>,
      remainingAmount: (
        <Typography className='!text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d.remainingAmount)}</Typography>
      ),
    }
  })

  if (BillsData.length == 0) {
    return null
  }


  return (
    <Modal isOpen={onOpen} onClose={modalClose} width='94vw' Height='600px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div ref={textInputRef} className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Partial payment with manual credit adjustment</div>
        <div className='pt-2.5' onClick={modalClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='p-5'>
        <div className='main_details mb-5'>
          <div className='mb-2'>
            <span className='text-sm font-proxima tracking-[0.02em]'>Vendor:</span>
            <span className='ml-[92px] text-sm font-proxima tracking-[0.02em]'>{BillsData[0]?.VendorName}</span>
          </div>
          <div className='flex justify-between mb-2'>
            <div>
              <span className='text-sm font-proxima tracking-[0.02em]'>Available credit:</span>
              <span className='ml-[35px] text-sm font-proxima tracking-[0.02em]'>${formatCurrency(BillsData[0].TotalCredit)}</span>
            </div>
            <div className='text-sm font-proxima tracking-[0.02em]'>Bill Amount: ${formatCurrency(BillsData[0].TotalAmount)}</div>
          </div>
          <div className='flex justify-between'>
            <div>
              <span className='text-sm font-proxima tracking-[0.02em]'>Total Availed credit:</span>
              <span className='ml-[10px] text-sm font-proxima tracking-[0.02em]'>${formatCurrency(vendorData[vendorId]?.availCredit + "")}</span>
            </div>
            <div className='text-sm font-proxima tracking-[0.02em]'>Payable Amount: ${formatCurrency(vendorData[vendorId]?.totalPayableAmount + "")}</div>
          </div>
        </div>
        <div className='h-[45vh] w-full overflow-y-auto approvalMain max-[425px]:mx-1 custom-scroll'>
          <div className={`${BillsData.length === 0 ? 'h-11' : 'h-auto'}`}>
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

export default SingleVendorPartialPayModal