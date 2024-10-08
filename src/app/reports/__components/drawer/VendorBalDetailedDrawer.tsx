'use client'
import { DataTable, Loader, Tooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import BackArrow from '@/assets/Icons/payments/BackArrow'
import { useAppDispatch } from '@/store/configureStore'
import { vendorAgingGroupBy } from '@/store/features/reports/reportsSlice'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { VendorBalanceDetailcolumns, VendorSummaryDetail } from '@/data/reports'
import { format } from 'date-fns'
import { setIsVisibleSidebar, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import { useRouter } from 'next/navigation'

type NullableId = string[] | null | undefined
interface ActionsProps {
  onOpen: boolean
  onClose: any
  startDay?: number | null
  endDay?: number | null
  currentVendorId?: NullableId
  currentVendorName?: string | null
  StartDate?: string | null
  EndDate?: string | null
  viewByValue?: number | null
  GroupBy?: any
  IsZeroBalance?: boolean
}

const VendorBalDetailedDrawer: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  StartDate,
  EndDate,
  currentVendorId,
  currentVendorName,
  viewByValue,
  GroupBy,
  IsZeroBalance
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dataList, setDataList] = useState<any[]>([])
  const router = useRouter()
  const dispatch = useAppDispatch()
  const handleModalClose = () => {
    onClose()
  }

  const getVendorBalDetailList = () => {
    const params = {
      Vendors: currentVendorId?.map((item: any) => item.toString()),
      StartDate: StartDate,
      EndDate: EndDate,
      ViewBy: viewByValue,
      IsZeroBalance: IsZeroBalance,
      GroupBy: GroupBy,
      LocationIds: null,
    }
    performApiAction(dispatch, vendorAgingGroupBy, params, (responseData: any) => {
      let combinedChildData: any = [];

      responseData.forEach((parentColumn: any) => {
        if (parentColumn.GroupByData && parentColumn.GroupByData.length > 0) {
          parentColumn.GroupByData.forEach((group: any) => {
            if (group.ChildData && group.ChildData.length > 0) {
              combinedChildData = combinedChildData.concat(group.ChildData);
            }
          });
        }
      });
      if (combinedChildData.length > 0 && responseData.length > 0) {
        setDataList(combinedChildData)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    })
  }

  useEffect(() => {
    setIsLoading(true)
    if (onOpen) {
      getVendorBalDetailList()
    }
  }, [onOpen])

  const table_Data =
    dataList &&
    dataList.map((nestedData: any) => {
      return {
        Vendor: <label className='font-proxima font-medium !tracking-[0.02em] !pl-3'>{nestedData.VendorName ?? null}</label>,
        BillNumber: <div
          className='w-4/5 cursor-pointer'
          onClick={() => {
            dispatch(setIsVisibleSidebar(false))
            nestedData.Id && router.push(`/reports/view/${nestedData.Id}`)
          }}
        >
          <Typography className='!text-sm text-darkCharcoal !tracking-[0.02em]'>{nestedData.BillNumber ? nestedData.BillNumber : ''}</Typography>
        </div>,
        BillDate: (
          <div className='flex items-center gap-4 font-medium'>
            <span className='font-proxima !text-sm !tracking-[0.02em]'>
              {nestedData.BillDate !== null ? format(nestedData.BillDate, 'MM/dd/yyyy') : null}
            </span>
          </div>
        ),
        Location: <label className='font-proxima font-medium !tracking-[0.02em]'>{nestedData.Location ?? null}</label>,
        TransactionType: <label className='font-proxima font-medium !tracking-[0.02em]'>{nestedData.TransactionType ?? null}</label>,
        DueDate: (
          <div className='flex items-center gap-4 font-medium'>
            <span className='font-proxima !text-sm !tracking-[0.02em]'>
              {nestedData.DueDate !== null ? format(nestedData.DueDate, 'MM/dd/yyyy') : null}
            </span>
          </div>
        ),
        Amount: (
          <label className='!pr-[8%] font-proxima text-sm !font-bold !tracking-[0.02em]'>
            ${nestedData.Amount ? parseFloat(nestedData.Amount).toFixed(2) : (0).toFixed(2)}
          </label>
        ),
      }
    })

  let noDataContent

  if (table_Data.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className='fixed flex h-[59px] w-full items-center justify-center border-b border-b-[#ccc]'>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }

  return (
    <div className={`${onOpen ? 'block' : 'hidden'}`}>
      {/* Navbar */}
      <div className='sticky top-0 border-t border-lightSilver'>
        <div className='relative flex h-16 items-center justify-between bg-[#F4F4F4] px-4'>
          <div className='flex items-center gap-5'>
            <span className='cursor-pointer' onClick={handleModalClose}>
              <BackArrow />
            </span>

            <div className='flex items-center justify-center gap-5'>
              <span className=' pr-5 text-base font-bold text-darkCharcoal'>{currentVendorName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Datatable */}
      <div className={`custom-scroll stickyTable h-[calc(100vh-210px)] overflow-scroll`}>
        <div className={`mainTable ${dataList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={VendorSummaryDetail}
            data={dataList.length > 0 ? table_Data : []}
            sticky
            hoverEffect
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
        </div>
        {noDataContent}
      </div>
    </div>
  )
}

export default VendorBalDetailedDrawer
