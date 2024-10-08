'use client'

import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import Wrapper from '@/components/Common/Wrapper'
import { Option } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { useSession } from 'next-auth/react'
import { Loader, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useState } from 'react'
import BillApprovalStatus from '../charts/BillApprovalStatus'
import Insights from '../charts/Insights'
import OnTimeVsMissedProcessing from '../charts/OnTimeVsMissedProcessingBills'
import PaidAfterVsPaidBeforeDueDate from '../charts/PaymentApprovedVsPaidBeforeDueDate'
import ProcessedVsPaymentNotApproved from '../charts/ProcessedVsPaymentNotApproved'
import Summary from '../charts/Summary'
import TotalPostedBillsByMonth from '../charts/TotalPostedBillsByMonth'
import VendorWiseMonthlyPayment from '../charts/VendorWiseMonthlyPayment'
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import { useRouter } from 'next/navigation'

const Dashboard: React.FC = () => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-500px)] laptopMd:w-[calc(100vw-85px)]')

  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isDashboardPermission = getModulePermissions(processPermissionsMatrix, "Dashboard") ?? {}

  const isStaffAccountantView = isDashboardPermission["Staff Accountant"]?.View ?? false;
  const isManagerView = isDashboardPermission["Manager"]?.View ?? false;
  const isPracticeView = isDashboardPermission["Practice"]?.View ?? false;

  const [locationOption, setLocationOption] = useState<Option[]>([])

  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-[calc(100vw-85px)] laptop:w-[calc(100vw-85px)] laptopMd:w-[calc(100vw-85px)]' : 'laptop:w-[calc(100vw-200px)] laptopMd:w-[calc(100vw-200px)]')
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    if (!isStaffAccountantView && !isManagerView && !isPracticeView) {
      router.push('/manage/companies');
    }
  }, [isStaffAccountantView, isManagerView, isPracticeView]);

  const getLocationDropdownList = () => {
    const params = {
      CompanyId: CompanyId,
      IsActive: true,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      setLocationOption(responseData)
    })
  }

  useEffect(() => {
    if (CompanyId) {
      getLocationDropdownList()
    }
  }, [CompanyId])

  return (
    <Wrapper>
      {/* Navbar */}
      <div className='sticky top-0 z-[6] flex !h-[66px] items-center justify-between bg-whiteSmoke laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='flex items-center'>
          <label className='font-proxima flex items-center laptop:text-base laptopMd:text-base lg:text-base xl:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Dashboard</label>
        </div>
      </div>

      <div className={`${tableDynamicWidth}`}>
        <Summary LocationOption={locationOption} />
      </div>

      <div className={`flex px-4 hd:px-5 2xl:px-5 3xl:px-5 laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5`}>
        <div>
          <Insights />
        </div>
        <div className={`overflow-auto ${isLeftSidebarCollapsed ? "w-[calc(100vw-373px)] hd:w-[calc(100vw-389px)] 2xl:w-[calc(100vw-389px)] 3xl:w-[calc(100vw-389px)]" : "md:w-[calc(75vw)] laptop:w-[calc(100vw-488px)] laptopMd:w-[calc(100vw-488px)] hd:w-[calc(100vw-504px)] 2xl:w-[calc(100vw-504px)] 3xl:w-[calc(100vw-504px)]"}`}>
          <TotalPostedBillsByMonth LocationOption={locationOption} />
        </div>
      </div>

      <div className={`flex py-4 hd:py-5 2xl:py-5 3xl:py-5 px-4 hd:px-5 2xl:px-5 3xl:px-5 laptop:h-[600px] laptopMd:h-[600px] lg:h-[600px] xl:h-[600px] hd:h-[720px] 2xl:h-[720px] 3xl:h-[720px] laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 overflow-auto ${tableDynamicWidth}`}>
        <div className='w-1/2 rounded shadow-md overflow-auto border border-lightSilver'>
          <VendorWiseMonthlyPayment LocationOption={locationOption} />
        </div>
        <div className='w-1/2 rounded shadow-md overflow-auto border-y border-r border-lightSilver'>
          <BillApprovalStatus LocationOption={locationOption} />
        </div>
      </div>

      <div className={`px-4 hd:px-5 2xl:px-5 3xl:px-5 ${tableDynamicWidth}`}>
        <OnTimeVsMissedProcessing LocationOption={locationOption} />
      </div>

      <div className={`py-4 hd:py-5 2xl:py-5 3xl:py-5 px-4 hd:px-5 2xl:px-5 3xl:px-5 ${tableDynamicWidth}`}>
        <PaidAfterVsPaidBeforeDueDate LocationOption={locationOption} />
      </div>

      <div className={`px-4 pb-5 hd:px-5 2xl:px-5 3xl:px-5 ${tableDynamicWidth}`}>
        <ProcessedVsPaymentNotApproved LocationOption={locationOption} />
      </div>
    </Wrapper>
  )
}
export default Dashboard