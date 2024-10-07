'use client'
import BackArrow from '@/assets/Icons/payments/BackArrow'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { useAppDispatch } from '@/store/configureStore'
import { apAgingSummaryDrawer, setSelectedIndex } from '@/store/features/reports/reportsSlice'
import { DataTable, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  startDay?: number | null
  endDay?: number | null
  currentVendorId?: string[] | null
  currentVendorName?: string | null
  StartDate?: string | null
  EndDate?: string | null
}

const AgingDetailedDrawer: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  startDay,
  endDay,
  StartDate,
  EndDate,
  currentVendorId,
  currentVendorName,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [dataList, setDataList] = useState<any[]>([])
  const dispatch = useAppDispatch()

  const handleModalClose = () => {
    dispatch(setSelectedIndex(1))
    onClose()
  }

  // Common function for formatting data in Datatable
  const formatValue = (value: null, formatFn: (arg0: any) => any) => (value === null || value === '' ? '-' : formatFn(value))

  const getApAgingDetailList = async () => {
    const params = {
      Vendors: currentVendorId,
      StartDate: StartDate,
      EndDate: EndDate,
      MinDay: startDay,
      MaxDay: endDay,
      PageNumber: 1,
      PageSize: 1000,
      ViewBy: 1,
    }

    try {
      const { payload, meta } = await dispatch(apAgingSummaryDrawer(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setDataList(payload?.ResponseData.ReportData ?? [])
          setIsLoading(false)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    if (onOpen) {
      getApAgingDetailList()
    }
  }, [onOpen])

  const columns: any = [
    {
      header: 'VENDOR',
      accessor: 'Vendor',
      sortable: true,
      colalign: 'left',
      colStyle: '!w-[25%]',
    },
    {
      header: 'BILL NUMBER',
      accessor: 'BillNumber',
      sortable: true,
      colalign: 'left',
      colStyle: '!w-[15%]',
    },
    {
      header: 'BILL DATE',
      accessor: 'BillDate',
      sortable: true,
      colalign: 'left',
      colStyle: '!w-[15%]',
    },
    {
      header: 'TRANSACTION TYPE',
      accessor: 'TransactionType',
      sortable: true,
      colalign: 'left',
      colStyle: '!w-[10%]',
    },
    {
      header: 'DUE DATE',
      accessor: 'DueDate',
      sortable: true,
      colalign: 'right',
      colStyle: '!w-[10%]',
    },
    {
      header: 'AMOUNT',
      accessor: 'Amount',
      sortable: true,
      colalign: 'right',
      colStyle: '!w-[10%] !pr-[2%]',
    },
  ]

  const getProcessLabel = (process: number): string => {
    switch (process) {
      case 1:
        return 'Accounts Payable'
      case 2:
        return 'Accounts Adjustment'
      case 3:
        return 'Other'
      default:
        return ''
    }
  }

  function getDayRangeLabel(startDay: number | null | undefined, endDay: number | null | undefined): string {
    if (startDay === 0 && endDay === 0) {
      return 'Current Day'
    } else if (startDay === 91) {
      return '90+ Days'
    } else {
      return `${startDay}-${endDay} days`
    }
  }

  const table_Data = dataList?.map((d: any) => {
    return {
      ...d,
      Vendor:
        d.VendorName?.length > 20 ? (
          <label
            title={d.VendorName}
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
          <label className='font-proxima text-sm '>{d.VendorName}</label>
        ),
      BillNumber: <Typography className='!text-sm'>{formatValue(d.BillNumber, (value) => value)}</Typography>,
      BillDate: <Typography className='!text-sm'>{formatDate(d.BillDate)}</Typography>,
      TransactionType: <Typography>{getProcessLabel(d.TransactionType)}</Typography>,
      DueDate: (
        <div className='flex items-center gap-4'>
          <span className='!text-sm'>{formatDate(d.DueDate)}</span>
        </div>
      ),
      Amount: <label className='!mr-[25px] !text-[14px] !font-semibold'>{`$${parseFloat(d.Amount).toFixed(2)}`}</label>,
    }
  })

  return (
    <div className={`${onOpen ? 'visible' : 'hidden'}`}>
      {/* Navbar */}
      <div className='sticky top-0'>
        <div className='relative flex h-16 items-center justify-between bg-[#F4F4F4] px-4'>
          <div className='flex items-center gap-5'>
            <span className='cursor-pointer' onClick={handleModalClose}>
              <BackArrow />
            </span>

            <div className='flex items-center justify-center gap-5'>
              <span className='border-r border-slatyGrey pr-5 text-base font-bold text-darkCharcoal'>
                {currentVendorName && currentVendorName.length > 15
                  ? currentVendorName.substring(0, 15) + '...'
                  : currentVendorName}
              </span>
              <span className='text-lg text-darkCharcoal'>{getDayRangeLabel(startDay, endDay)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Datatable */}
      <div className='custom-scroll h-[calc(100vh-128px)] w-full overflow-auto max-[425px]:mx-1'>
        <div className={`mainTable ${dataList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={dataList.length > 0 ? table_Data : []}
            hoverEffect={true}
            sticky
            getRowId={() => {}}
            getExpandableData={() => {}}
            isTableLayoutFixed
          />
        </div>

        <DataLoadingStatus isLoading={isLoading} data={dataList.length > 0 ? table_Data : []} />
      </div>
    </div>
  )
}

export default AgingDetailedDrawer
