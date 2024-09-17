import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setBillApprovalFilterFields, setPaymentApprovalFilterFields } from '@/store/features/billApproval/approvalSlice'
import { getSummary } from '@/store/features/dashboard/dashboardSlice'
import { convertStringsDateToUTC } from '@/utils'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import ProcessTypeDashboardFilter from '../modal/ProcessTypeDashboardFilter'
import { setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'

const Summary: React.FC<any> = ({ LocationOption }) => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const [summaryData, setSummaryData] = useState<any>([])
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const filterFields = useAppSelector((state: any) => state.dashboard.filterFields["Summary"]);

  const dispatch = useAppDispatch()
  const router = useRouter()

  function formatDateByMonthYear(monthYear: any) {
    const [month, year] = monthYear.split('/')
    const formattedDate = `${month}/01/${year}`
    return formattedDate
  }

  function getMonthNameFromDate(dateString: any) {
    const monthNames = [
      "January", "February", "March", "April", "May",
      "June", "July", "August", "September", "October",
      "November", "December"
    ];
    const monthIndex = parseInt(dateString.split('/')[0], 10) - 1; // Extract month and convert to zero-based index
    return monthNames[monthIndex]; // Get month name
  }


  const getSummaryDashboard = (newFilterFields: any) => {
    const params = {
      CompanyIds: [CompanyId],
      LocationIds: newFilterFields?.LocationIds.length != 0 ? newFilterFields?.LocationIds.map(Number) : null,
      Date: newFilterFields?.Date ? convertStringsDateToUTC(formatDateByMonthYear(newFilterFields.Date)) : '',
      ProcessType: newFilterFields?.ProcessType ? newFilterFields.ProcessType : []
    }
    performApiAction(dispatch, getSummary, params, (responseData: any) => {
      setSummaryData(responseData)
    })
  }

  useEffect(() => {
    if (CompanyId) {
      getSummaryDashboard(filterFields)
    }
  }, [CompanyId])

  const updatedCardData = [
    {
      amount: `$${summaryData.TotalAmount ?? 0}`,
      description: 'Total Posted Amount'
    },
    {
      amount: `${summaryData.TotalPostedBills ?? 0}`,
      description: 'Posted Bills & Adj'
    },
    {
      amount: `${summaryData.TotalBillApprovalPending ?? 0}`,
      description: 'Pending Bill Approval'
    },
    {
      amount: `${summaryData.TotalPaymentApprovalPending ?? 0}`,
      description: 'Pending Payment Approval'
    }
  ];

  const handleSummaryClick = (description: string) => {
    switch (description) {
      case 'Total Posted Amount':
        dispatch(setSelectedProcessTypeFromList('4'))
        router.push(`/bills?module=BillsOverview?chart=Summary`)
        break
      case 'Posted Bills & Adj':
        dispatch(setSelectedProcessTypeFromList('4'))
        router.push(`/bills?module=BillsOverview?chart=Summary`)
        break
      case 'Pending Bill Approval':
        router.push(`/approvals?approvalId=1`)
        dispatch(setBillApprovalFilterFields({
          VendorIds: [],
          ApprovalStatusIds: ['0'],
          BillNumber: '',
          MinAmount: '',
          MaxAmount: '',
          BillStartDate: filterFields.StartDate,
          BillEndDate: filterFields.EndDate,
          StartDueDate: '',
          EndDueDate: '',
          Assignee: '1',
          LocationIds: filterFields?.LocationIds.length != 0 ? filterFields?.LocationIds.map(Number) : []
        }))
        break
      // case 'Pending Payment Approval':
      //   dispatch(setPaymentApprovalFilterFields({
      //     VendorIds: [],
      //     BankAccountIds: [],
      //     ApprovalStatusIds: ['0'],
      //     PaymentMethodIds: [],
      //     MinAmount: '',
      //     MaxAmount: ''
      //   }))
      //   router.push(`approvals?approvalId=2`)
      //   break
      default:
        break
    }
  }

  const handleFilterOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFilterOpen(true)
  }

  const handleFilterClose = () => {
    setIsFilterOpen(false)
  }

  const onSuccessApply = (newFilterFields: any) => {
    getSummaryDashboard(newFilterFields)
  }

  return (
    <>
      <div className='flex justify-end mx-4 hd:mx-5 2xl:mx-5 3xl:mx-5'>
        <div className='w-full py-4 hd:py-5 2xl:py-5 3xl:py-5'>
          <Typography type='h5' className='title !text-base hd:!text-lg 2xl:!text-lg 3xl:!text-lg font-proxima font-semibold tracking-[0.02em] text-darkCharcoal'>
            Summary ({getMonthNameFromDate(filterFields.Date)})
          </Typography>
        </div>
        <div className='filter_change cursor-pointer flex items-center relative my-5' onClick={handleFilterOpen}><ChartFilterIcon />
          {/* Filter Modal */}
          <ProcessTypeDashboardFilter isFilterOpen={isFilterOpen} locationOption={LocationOption} onClose={handleFilterClose} ChartType="Summary" onSuccessApply={onSuccessApply} />
        </div>
      </div>

      <div className="px-4 mb-5 grid grid-cols-4 sm:grid-cols-2 laptop:grid-cols-3 laptopMd:grid-cols-4 lg:grid-cols-4 gap-5">
        {updatedCardData.map((data, index) => (
          <div
            key={data.amount + index}
            onClick={() => handleSummaryClick(data.description)}
            className={`${data.amount == "0" || data.amount == "$0" ? "cursor-default pointer-events-none" : "cursor-pointer"} w-full cards_content laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 shadow-md border border-lightSilver rounded  bg-white"`}
          >
            <div className="lg:text-base xl:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-proxima font-semibold tracking-[0.02em]">
              {data.amount}
            </div>
            <div className='text-base font-proxima laptopMd:mt-1.5 lg:mt-1.5 xl:mt-1.5 hd:mt-2.5 2xl:mt-2.5 3xl:mt-2.5 text-darkCharcoal tracking-[0.02em]'>
              {data.description}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Summary