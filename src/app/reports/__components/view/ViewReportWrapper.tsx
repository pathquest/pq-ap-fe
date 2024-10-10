import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import Wrapper from '@/components/Common/Wrapper'
import { AssignUserOption } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getAssigneeList } from '@/store/features/bills/billSlice'
import { getTimeDifference } from '@/utils/billposting'
import { parseISO } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { Toast } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface ViewReportWrapperProps {
  children?: React.ReactNode
  billLists?: any
  processSelectionOptions?: any
  processSelection?: any
  setProcessSelection?: any
  filterFormFields?: any
  handleApplyFilter?: any
  isOpenFilter?: any
  setIsOpenFilter?: any
  lineItemsFieldsData?: any
  isVisibleLeftSidebar?: any
  documentDetailByIdData?: any
  handleForward?: any
  handleBackword?: any
  selectedBillItems?: any
  setSelectedBillItems?: any
  activeBill?: any
  onChangeSelectedBillItem?: any
  pdfUrl?: string
  statusSelectionOptions?: any
  locationOptions?: any
  userOptions?: any
  vendorOptions?: any
  handleProcessCheck?: any
  totalAmount?: any
  isMainFieldConfiguration?: any
  setIsResetFilter?: any
  localFilterFormFields?: any
  setLocalFilterFormFields?: any
  billListsRef: any
  handleScroll: any
  isLoading: any
  setIsVisibleLeftSidebar: any
}

const ViewReportWrapper = ({
  children,
  billLists,
  processSelectionOptions,
  processSelection,
  setProcessSelection,
  filterFormFields,
  isMainFieldConfiguration,
  totalAmount,
  handleApplyFilter,
  isOpenFilter,
  setIsOpenFilter,
  lineItemsFieldsData,
  isVisibleLeftSidebar,
  documentDetailByIdData,
  handleProcessCheck,
  handleForward,
  handleBackword,
  selectedBillItems,
  setSelectedBillItems,
  activeBill,
  onChangeSelectedBillItem,
  pdfUrl,
  statusSelectionOptions,
  locationOptions,
  userOptions,
  vendorOptions,
  setIsResetFilter,
  localFilterFormFields,
  setLocalFilterFormFields,
  billListsRef,
  handleScroll,
  isLoading,
  setIsVisibleLeftSidebar
}: ViewReportWrapperProps) => {
  const router = useRouter()
  const billStatus = documentDetailByIdData?.Status

  const CreatedOn = documentDetailByIdData?.CreatedOn ? parseISO(documentDetailByIdData?.CreatedOn) : null
  const timeDifference = getTimeDifference(CreatedOn)

  return (
    <Wrapper>
      <div className='relative mx-auto grid-cols-12 md:grid'>
        <div
          className={`${isVisibleLeftSidebar ? 'col-span-8 laptop:col-span-9' : 'col-span-12'} h-[calc(100vh_-_65px)] overflow-y-auto`}
        >
          <div className={`!h-[66px] sticky top-0 z-[5] flex w-full flex-row justify-between bg-[#F4F4F4] px-5`}>
            <div className='flex items-center justify-center'>
              <span
                className='cursor-pointer rounded-full bg-white p-1.5'
                onClick={() => router.push('/reports')}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && router.push('/reports')}
              >
                <BackIcon />
              </span>
              {/* {billStatus !== 3 && billStatus !== 9 && (
                <>
                  <span className='pl-[13px] !text-[14px] font-semibold'>TAT :</span>
                  <span className='pl-2 !text-[16px] font-semibold text-[#FB2424]'>{timeDifference.value}</span>
                </>
              )} */}
            </div>
          </div>
          {children}
        </div>
      </div>

    </Wrapper>
  )
}

export default ViewReportWrapper