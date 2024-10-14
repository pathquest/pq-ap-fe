import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Avatar, Tooltip } from 'pq-ap-lib'

import Insights from '@/app/practice-dashboard/__components/common/Insights'
import CircularProgress from '@/app/practice-dashboard/__components/common/CircularProgress'
import { useAppDispatch } from '@/store/configureStore'
import { setSelectedCompany } from '@/store/features/user/userSlice'
import { useSession } from 'next-auth/react'
import { invalidateSessionCache } from '@/api/axios'

const Card = ({ company, isLastCardInRow }: any) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { update } = useSession()
  const { data: session } = useSession()
  const user = session ? session?.user : {}
  const insightsRef: any = useRef(null)
  const [showInsightsPopup, setShowInsightsPopup] = useState<boolean>(false)

  const customContent = (
    <div className='!w-auto text-[14px]'>
      <span className='font-semibold'>Bills Received VS Bills Not Processed</span>
      <p>
        {company?.BillNotProcessed} out of {company?.TotalBills} bills has not been processed
      </p>
      <p>within TAT</p>
    </div>
  )

  const InsightsData = {
    TotalAmountSpent: company?.TotalAmountSpent,
    NewVendors: company?.NewVendors,
    SavedAmount: company?.SavedAmount,
    UncategorizedExpence: company?.UncategorizedExpence,
    RejectedBills: company?.RejectedBills,
    TotalBills: company?.TotalBills,
    TatMissed: company?.TatMissed,
    DisputedBills: company?.DisputedBills,
  }

  const handleMouseEnter = () => {
    setShowInsightsPopup(true)
  }

  const handleMouseLeave = () => {
    if (!insightsRef.current || !insightsRef.current.contains(document.activeElement)) {
      setShowInsightsPopup(false)
    }
  }

  const handleDashboardClick = async (label: string, value: string, accountingTool: number) => {
    dispatch(setSelectedCompany({ label, value, accountingTool }))
    localStorage.setItem('CompanyId', value)
    invalidateSessionCache();
    await update({ ...user, CompanyId: value, CompanyName: label, AccountingTool: accountingTool })

    router.push(`/dashboard`)
  }

  return (
    <>
      <div className='rounded-md border border-lightSilver text-[14px] hover:border-[#02B89D]'>
        <div className='relative flex flex-col items-center justify-center gap-2 py-6'>
          {company?.CompanyImage ? (
            <Avatar imageUrl={''} variant='medium' />
          ) : (
            <Avatar variant='medium' name={company?.CompanyName} />
          )}
          <span className='!text-[16px] font-semibold'>{company?.CompanyName}</span>
          <div className='relative flex gap-5'>
            <span
              className='cursor-pointer rounded-md border border-lightGray bg-lightGray px-[12px] py-[2px] hover:border-[#02B89D]'
              onClick={() => handleDashboardClick(company?.CompanyName, company?.CompanyId, company?.AccountingTool)}
            >
              Dashboard
            </span>
            <span
              className='relative cursor-pointer rounded-md border border-lightGray bg-lightGray px-[12px] py-[2px] hover:border-[#02B89D]'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Insights
            </span>
          </div>
          {showInsightsPopup && (
            <div
              ref={insightsRef}
              className='absolute right-3 top-[132px] !z-10 flex w-auto rounded-md bg-white shadow-lg'
              onMouseEnter={() => setShowInsightsPopup(true)}
              onMouseLeave={handleMouseLeave}
            >
              <Insights InsightsData={InsightsData} />
            </div>
          )}
        </div>
        <div className='flex border-t-2 border-dotted border-lightSilver'>
          <div className='flex w-[38%] flex-col items-start justify-center p-3'>
            <span>Possible Duplicate Bills</span>
            <span className='!text-[16px] font-semibold'>{company?.PossibleDuplication}</span>
          </div>
          <div className='flex w-[37%] flex-col items-start justify-center border-l-2 border-dotted border-lightSilver p-2'>
            <span>Pending Payment Approval</span>
            <span className='!text-[16px] font-semibold'>{company?.PendingPaymentAproval}</span>
          </div>
          <div className='flex w-[25%] flex-col items-center justify-center border-l-2 border-dotted border-lightSilver p-2'>
            <Tooltip
              position={isLastCardInRow ? 'left' : 'top'}
              content={customContent}
              className='!w-[200px] !cursor-pointer !font-proxima !text-[12px]'
            >
              <CircularProgress size={55} strokeWidth={4} percentage={company?.BillNotProcessedPercentage} />
            </Tooltip>
          </div>
        </div>
        <div className='flex items-center justify-between border-t border-lightSilver bg-lightGray px-3 py-4'>
          <div className='flex items-center'>
            <span>TAT Missed Bills: </span>
            <span className='pl-2 !text-[16px] font-semibold'>{company?.PendingOverDueBills}</span>
          </div>
          <div className='flex items-center'>
            <span>Total Bills Posted: </span>
            <span className='pl-2 !text-[16px] font-semibold'>{company?.TotalBillPosted}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Card
