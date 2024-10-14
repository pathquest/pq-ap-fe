'use client'
import { useRouter } from 'next/navigation'
import { Button, CheckBox, DataTable, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
// Common Components
import BillsOnHoldModal from '../components/modals/BillsOnHoldModal'
import MarkAsPaidModal from '../components/modals/MarkAsPaidModal'
// Store
import BackArrow from '@/assets/Icons/payments/BackArrow'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { getVendorAginglist } from '@/store/features/billsToPay/billsToPaySlice'
import { convertStringsToIntegers } from '@/utils'
import { useSession } from 'next-auth/react'
import MoveBillsToPayModals from '../components/modals/MoveBillsToPayModal'
import SinglePaymentDetailsModal from '../components/payment-details/SinglePaymentDetailsModal'
import SingleVendorMultiplePaymentDetailsModal from '../components/payment-details/SingleVendorMultiplePaymentDetailsModal'
import MultipleVendorMultiplePaymentDetailsModal from '../components/payment-details/MultipleVendorMultiplePaymentDetailsModal'
import { vendorDropdown } from '@/store/features/bills/billSlice'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  startDay?: string | null
  endDay?: string | null
  currentVendorId?: string[] | null
  currentVendorName?: string
  currentFilter?: number
}

const AgingDays: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  startDay,
  endDay,
  currentVendorId,
  currentVendorName,
  currentFilter,
}) => {
  const [isSingleBillPaymentModalOpen, setIsSingleBillPaymentModalOpen] = useState<boolean>(false)
  const [isSingleVendorMultipleBillPayModalOpen, setIsSingleVendorMultipleBillPayModalOpen] = useState<boolean>(false)
  const [isMultipleVendorMultipleBillPayModalOpen, setIsMultipleVendorMultipleBillPayModalOpen] = useState<boolean>(false)

  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [vendorsId, setVendorsId] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any>([])
  const [rowIds, setRowIds] = useState<any>([])
  const [isMarkAsPaidClicked, setMarkAsPaidClicked] = useState<boolean>(false)
  const [isBillOnHoldClicked, setBillOnHoldClicked] = useState<boolean>(false)
  const [isBillsToPayClicked, setBillsToPayClicked] = useState<boolean>(false)
  const [currSelectedBillDetails, setCurrSelectedBillDetails] = useState<any[]>([])
  const [selectRowsStatus, setSelectRowsStatus] = useState<number[]>([])
  const [currentPayValue, setCurrentPayValue] = useState({
    billNumber: '',
    billDate: '',
    dueDate: '',
    vendorId: 0,
    vendorName: '',
    discount: null,
    payAmount: 0,
    remainingAmount: 0,
    accountPaybleId: null,
  })

  const [dataList, setDataList] = useState<any[]>([])
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [totalAmountToPay, setTotalAmountToPay] = useState<number>(0)
  const [isIntermediate, setIsIntermediate] = useState<any>({
    isEnable: false,
    isChecked: false,
  })
  const isRowSelected = (Id: any) => selectedRows.indexOf(Id) !== -1
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)

  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleOpenPayBillModal = () => {
    setIsSingleBillPaymentModalOpen(true)
  }

  const handleMoveBillsToPayModalClose = () => {
    setRowIds([])
    setBillsToPayClicked(false)
  }

  const handleClosePayBillModal = () => {
    localStorage.removeItem('billAmount')
    localStorage.removeItem('availCredits')
    localStorage.removeItem('PartialPaymentDataList')
    localStorage.removeItem('CreditData')
    setIsSingleBillPaymentModalOpen(false)
    setIsSingleVendorMultipleBillPayModalOpen(false)
    setIsMultipleVendorMultipleBillPayModalOpen(false)
    setRowIds([])
    setCurrentPayValue({
      billNumber: '',
      billDate: '',
      dueDate: '',
      vendorName: '',
      discount: null,
      vendorId: 0,
      payAmount: 0,
      remainingAmount: 0,
      accountPaybleId: null,
    })
  }

  const handleCloseMarkAsPaidModal = () => {
    setMarkAsPaidClicked(false)
    setRowIds([])
  }

  const handleBillsOnHoldClose = () => {
    setBillOnHoldClicked(false)
    setRowIds([])
  }

  const handleModalClose = () => {
    onClose()
    setSelectedRows([])
    setCurrSelectedBillDetails([])
    setRowIds([])
    setCurrentPayValue({
      billNumber: '',
      billDate: '',
      dueDate: '',
      vendorName: '',
      discount: null,
      vendorId: 0,
      payAmount: 0,
      remainingAmount: 0,
      accountPaybleId: null,
    })
  }

  // Function to calculate the total AmountToPay for selected rows
  const calculateTotalAmountToPay = (selectedRows: any[]) => {
    let totalAmountToPay = 0

    selectedRows.forEach((selectedId) => {
      const selectedRow = dataList.find((row) => row.Id === selectedId)
      if (selectedRow) {
        totalAmountToPay += selectedRow.DueAmount
      }
    })

    // Format the total to have 2 decimal places
    return totalAmountToPay.toFixed(2)
  }

  // function for select All row (Checkboxes)
  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      const uniqueVendorIds = new Set()
      const uniqueIds: any[] = []

      tableData.forEach((row) => {
        if (!uniqueVendorIds.has(row.VendorId)) {
          uniqueVendorIds.add(row.VendorId)
          uniqueIds.push(row.VendorId)
        }
      })

      setVendorsId(uniqueIds)

      const newSelecteds = tableData.map((row: any) => row.Id)
      setSelectedRows(newSelecteds)

      const selectedBillDetails = dataList.map((row: any) => ({
        VendorId: row.VendorId,
        AccountPaybleId: row.Id,
        Amount: row.DueAmount,
      }))

      setCurrSelectedBillDetails(selectedBillDetails)
      const selectedStatus = dataList.map((row: any) => Number(row.PaymentStatus))
      setSelectRowsStatus(selectedStatus)

      // Calculate and log the totalAmountToPay for selected rows
      const totalAmount = calculateTotalAmountToPay(newSelecteds)
      setTotalAmountToPay(Number(totalAmount))
      return
    }
    setSelectRowsStatus([])
    setCurrSelectedBillDetails([])
    setSelectedRows([])
  }

  const handleRowSelect = (event: any, id: any, statusId: any) => {
    setSelectedRows((prevSelectedRows: any) => {
      const selectedIndex = prevSelectedRows.indexOf(id)
      let newSelected: any[] = []
      let newStatuses: any[] = []

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(prevSelectedRows, id)
        newStatuses = newStatuses.concat(selectRowsStatus, Number(statusId))
      } else {
        newSelected = prevSelectedRows.filter((rowId: any) => rowId !== id)
        newStatuses = selectRowsStatus.filter((rowStatus: any, index: number) => prevSelectedRows[index] !== id)
      }
      const selectedBillDetails = dataList
        .filter((row: any) => newSelected.includes(row.Id))
        .map((row: any) => ({
          VendorId: row.VendorId,
          AccountPaybleId: row.Id,
          Amount: row.DueAmount,
        }))
      setCurrSelectedBillDetails(selectedBillDetails)
      // Calculate and log the totalAmountToPay for selected rows
      const totalAmount = calculateTotalAmountToPay(newSelected)
      setTotalAmountToPay(Number(totalAmount))
      setSelectRowsStatus(newStatuses)
      const uniqueVendorIds = Array.from(new Set(selectedBillDetails.map((detail) => detail.VendorId)))
      setVendorsId(uniqueVendorIds)
      return newSelected
    })
  }

  const getVendorAgingList = async () => {
    const params = {
      CompanyId: CompanyId,
      VendorIds: convertStringsToIntegers(currentVendorId as string[]),
      FiterType: currentFilter,
      StartDay: Number(startDay),
      EndDay: endDay == null ? null : Number(endDay),
      TypeOfAging: 2,
      PageSize: null,
    }
    performApiAction(dispatch, getVendorAginglist, params, (responseData: any) => {
      setDataList(responseData ?? [])

      // Calculating total DueAmount
      const totalDueAmount = responseData.reduce(
        (accumulator: any, item: { DueAmount: any }) => accumulator + item.DueAmount,
        0
      )
      setTotalAmount(totalDueAmount.toFixed(2))
      setIsLoading(false)
      setSelectedRows([])
      setRowIds([])
      setSelectRowsStatus([])
    })
  }

  useEffect(() => {
    setIsLoading(true)
    onOpen && getVendorAgingList()
  }, [startDay, endDay, currentVendorId, currentFilter, onOpen, CompanyId])

  const columns: any = [
    {
      header: (
        <CheckBox
          id='select-all-adm'
          intermediate={isIntermediate.isEnable}
          checked={isIntermediate.isChecked}
          onChange={(e) => handleSelectAll(e)}
          disabled={dataList.length === 0}
        />
      ),
      accessor: 'check',
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: 'center',
    },
    { header: 'Bill Date', accessor: 'BillDate', sortable: false, colStyle: '!w-[140px] uppercase' },
    { header: 'Bill Number', accessor: 'BillNumber', sortable: false, colStyle: '!w-[180px] uppercase' },
    { header: 'Due Date', accessor: 'DueDate', sortable: false, colStyle: '!w-[180px] uppercase' },
    { header: 'Aging', accessor: 'Aging', sortable: false, colStyle: '!w-[180px] !pr-[50px] uppercase', colalign: 'right' },
    { header: 'Open Balance', accessor: 'DueAmount', sortable: false, colStyle: '!w-[180px] !pr-[50px] uppercase', colalign: 'right' },
    { header: '', accessor: 'action', sortable: false, colStyle: '!w-[80px] uppercase' },
  ]

  const tableData = dataList.map((d: any) => {
    const dueDate = new Date(d.DueDate);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const isPastDueDate = dueDate < today
    return {
      ...d,
      check: (
        <CheckBox
          id={`adm-${d.Id}`}
          checked={isRowSelected(d.Id)}
          onChange={(event: any) => handleRowSelect(event, d.Id, d.PaymentStatus)}
        />
      ),
      BillDate: <Typography className='!text-sm'>{formatDate(d.BillDate)}</Typography>,
      BillNumber: (
        <span onClick={() => router.push(`/payments/billtopay/${d.Id}`)}>
          <Typography className='cursor-pointer !text-sm'>{d.BillNumber}</Typography>
        </span>
      ),
      DueDate: (
        <div className='flex items-center gap-4'>
          <span className='!text-sm'>{formatDate(d.DueDate)}</span>
          {isPastDueDate && <span className='h-2 w-2 rounded-full bg-[#DC3545]'></span>}
        </div>
      ),
      Aging: (
        <Typography className='!pr-[40px] !text-sm !font-bold !text-darkCharcoal'>
          {d.Aging ?? "-"}
        </Typography>
      ),
      DueAmount: (
        <Typography className='!pr-[40px] !text-sm !font-bold !text-darkCharcoal'>
          ${formatCurrency(d.DueAmount)}
        </Typography>
      ),
      action: Number(d.PaymentStatus) !== 3 && (
        <Button
          variant='btn-primary'
          className={`flex !h-6 pb-1 items-center rounded-full cursor-pointer font-proxima font-semibold text-sm tracking-[0.02em] ${selectedRows.length > 1 ? 'opacity-30' : ''}`}
          onClick={() => {
            setVendorsId([d.VendorId])
            setIsSingleBillPaymentModalOpen(true)
            setRowIds([d.Id])
            setCurrentPayValue({
              accountPaybleId: d.Id,
              billNumber: d.BillNumber,
              billDate: d.BillDate,
              dueDate: d.DueDate,
              vendorName: currentVendorName ?? d.VendorName,
              vendorId: d.VendorId,
              discount: d.Discount,
              payAmount: d.DueAmount,
              remainingAmount: d.DueAmount,
            })
            setCurrSelectedBillDetails([
              {
                VendorId: d.VendorId,
                AccountPaybleId: d.Id,
                Amount: d.DueAmount,
              },
            ])
          }}
          disabled={selectedRows.length > 1}
        >
          PAY
        </Button>
      ),
    }
  })

  useEffect(() => {
    if (selectedRows.length > 0 && dataList.length === selectedRows.length) {
      setIsIntermediate({
        isEnable: false,
        isChecked: true,
      })
    } else if (selectedRows.length > 1) {
      setIsIntermediate({
        isEnable: true,
        isChecked: true,
      })
    } else {
      setIsIntermediate({
        isEnable: false,
        isChecked: false,
      })
    }
  }, [selectedRows])

  const getAllVendorOptions = () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
      setVendorOptions(responseData)
    })
  }

  useEffect(() => {
    getAllVendorOptions()
  }, [CompanyId])

  return (
    <div className={`${onOpen ? "block" : "hidden"}`}>
      {/* Navbar */}
      <div className='sticky top-0 z-[6]'>
        <div className='relative flex !h-[50px] items-center justify-between bg-lightGray px-4'>
          <div className='flex items-center gap-3'>
            <span className='cursor-pointer' onClick={handleModalClose}>
              <BackArrow />
            </span>

            <div className='flex items-center justify-center gap-5'>
              <span className='border-r border-slatyGrey font-proxima tracking-[0.02em]  pr-5 text-base font-bold text-darkCharcoal'>
                {currentVendorName && currentVendorName.length > 15
                  ? currentVendorName.substring(0, 15) + '...'
                  : currentVendorName}
              </span>
              <span className='text-lg text-darkCharcoal font-proxima tracking-[0.02em]'>{startDay === '91' ? '90+ Days' : `${startDay}-${endDay} days`}</span>
              {selectedRows.length <= 1 ? (
                <span className='border-l border-slatyGrey pl-5 text-lg text-darkCharcoal font-proxima tracking-[0.02em]'>${totalAmount}</span>
              ) : null}
            </div>
          </div>
          <div>
            {selectedRows.length > 1 ? (
              <ul className='flex items-center justify-end h-fit laptopMd:h-7 lg:h-7 xl:h-full'>
                {selectRowsStatus.every((status) => status === 3) ? (
                  <li className='h-full place-content-center border-r border-r-lightSilver sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1'>
                    <span
                      className='flex cursor-pointer items-center justify-center'
                      onClick={() => setBillsToPayClicked(!isBillsToPayClicked)}
                    >
                      <CheckBox
                        id='bills-to-pay'
                        checked={isBillsToPayClicked}
                        onChange={(e) => setBillsToPayClicked(!e.target.checked)}
                      />
                      <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Move to Bills to Pay</label>
                    </span>
                  </li>
                ) : !selectRowsStatus.includes(3) ? (
                  <>
                    <li className='h-full place-content-center sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1 sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block'>
                      <span
                        className='flex cursor-pointer items-center justify-center'
                        onClick={() => setMarkAsPaidClicked(!isMarkAsPaidClicked)}
                      >
                        <CheckBox
                          id='mark-as-paid'
                          checked={isMarkAsPaidClicked}
                          onChange={(e) => setMarkAsPaidClicked(!e.target.checked)}
                        />
                        <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Mark as Paid</label>
                      </span>
                    </li>
                    <span className='w-[2px] h-7 border-r border-lightSilver sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block' />
                    <li className='h-full place-content-center sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1 sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block'>
                      <span
                        className='flex cursor-pointer items-center justify-center'
                        onClick={() => setBillOnHoldClicked(!isBillOnHoldClicked)}
                      >
                        <CheckBox
                          id='on-hold'
                          checked={isBillOnHoldClicked}
                          onChange={(e) => setBillOnHoldClicked(!e.target.checked)}
                        />
                        <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Place bills on hold</label>
                      </span>
                    </li>
                    <span className='w-[2px] h-7 border-r border-lightSilver sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block' />
                  </>
                ) : null}
                <li className='flex h-full items-center gap-[5px] sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 pt-[7px] pb-[3px]'>
                  <span className='text-sm font-bold font-proxima'>{selectedRows.length}</span>
                  <span className='text-sm font-proxima tracking-[0.02em]'>Bills Selected</span>
                </li>
                {!selectRowsStatus.includes(3) && (
                  <li className='border-l border-lightSilver h-full flex items-center sm:pl-3 md:pl-3 laptop:pl-3 laptopMd:pl-3 lg:pl-3 xl:pl-3 hd:pl-5 2xl:pl-5 3xl:pl-5'>
                    <Button
                      variant='btn-primary'
                      className='!tracking-[0.02em] flex h-7 sm:h-7 md:h-7 laptop:h-7 laptopMd:h-7 lg:h-9 xl:h-7 items-center justify-center rounded-full text-sm font-bold sm:!px-4 md:!px-4 laptop:!px-4 laptopMd:!px-4 lg:!px-4 xl:!px-4 hd:!px-5 2xl:!px-5 3xl:!px-5 !pt-[8px] !font-proxima'
                      onClick={() => {
                        vendorsId.length === 1
                          ? setIsSingleVendorMultipleBillPayModalOpen(true)
                          : setIsMultipleVendorMultipleBillPayModalOpen(true)
                      }}>
                      PAY BILLS
                      <label className='ml-2 pl-2 border-l border-pureWhite font-proxima font-bold tracking-[0.02em]'>${(totalAmountToPay).toFixed(2)}</label>
                    </Button>
                  </li>
                )}
              </ul>
            ) : ''}
          </div>
        </div>
      </div>

      {/* Datatable */}
      <div className='custom-scroll h-[calc(100vh-112px)] w-full approvalMain overflow-auto max-[425px]:mx-1'>
        <div className={`mainTable ${dataList.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            columns={columns}
            data={dataList.length > 0 ? tableData : []}
            hoverEffect={true}
            sticky
            getRowId={() => { }}
            getExpandableData={() => { }}
            isTableLayoutFixed
          />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={dataList} />
      </div>

      {/* Payment Details Modal when clicking on Mark as Paid */}
      <MarkAsPaidModal
        onOpen={isMarkAsPaidClicked}
        onClose={handleCloseMarkAsPaidModal}
        selectedRowIds={rowIds.length > 0 ? rowIds : selectedRows}
        onDataFetch={getVendorAgingList}
        selectedBillDetails={currSelectedBillDetails}
      />

      {/* Modal for moving a bill on hold. */}
      <BillsOnHoldModal
        onOpen={isBillOnHoldClicked}
        onClose={handleBillsOnHoldClose}
        selectedRowIds={rowIds.length > 0 ? rowIds : selectedRows}
        onDataFetch={getVendorAgingList}
      />

      {/* Modal for move the bills from on hold to - to pay */}
      <MoveBillsToPayModals
        onOpen={isBillsToPayClicked}
        onClose={handleMoveBillsToPayModalClose}
        selectedRowIds={rowIds.length > 0 ? rowIds : selectedRows}
        onDataFetch={getVendorAgingList}
      />

      {/* Modal for paying single bill */}
      {isSingleBillPaymentModalOpen && <SinglePaymentDetailsModal
        onOpen={isSingleBillPaymentModalOpen}
        onClose={handleClosePayBillModal}
        currentValues={currentPayValue || 0}
        onDataFetch={getVendorAgingList}

      />}

      {/* Modal for paying single vendor multiple bill */}
      {isSingleVendorMultipleBillPayModalOpen && <SingleVendorMultiplePaymentDetailsModal
        onOpen={isSingleVendorMultipleBillPayModalOpen}
        onClose={handleClosePayBillModal}
        vendorId={vendorsId}
        totalAmountToPay={totalAmountToPay}
        selectedAccountPayableIds={selectedRows}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={getVendorAgingList}

      />}

      {/* Modal for paying multiple vendor multiple bill */}
      {isMultipleVendorMultipleBillPayModalOpen && <MultipleVendorMultiplePaymentDetailsModal
        onOpen={isMultipleVendorMultipleBillPayModalOpen}
        onClose={handleClosePayBillModal}
        vendorsId={vendorsId}
        vendorOptions={vendorOptions}
        totalAmountToPay={totalAmountToPay}
        selectedAccountPayableIds={selectedRows}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={getVendorAgingList}

      />}
    </div>
  )
}

export default AgingDays