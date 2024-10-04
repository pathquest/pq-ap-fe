import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader, Typography } from 'pq-ap-lib'
import { endOfMonth, format } from 'date-fns'

import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'

import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setBillApprovalFilterFields } from '@/store/features/billApproval/approvalSlice'
import { getSummary } from '@/store/features/dashboard/dashboardSlice'
import { setFilterFormFields, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'

import ProcessTypeDashboardFilter, { processOptions } from '@/app/dashboard/__components/modal/ProcessTypeDashboardFilter'
import { convertStringsDateToUTC, formatDateByMonthYear } from '@/utils'
import { cardDataItems } from '@/data/dashboard'

const Summary: React.FC<any> = ({ LocationOption }) => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const [summaryData, setSummaryData] = useState<any>([])
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const filterFields = useAppSelector((state: any) => state.dashboard.filterFields["Summary"]);

  const dispatch = useAppDispatch()
  const router = useRouter()

  function getMonthNameFromDate(dateString: any) {
    const monthNames = [
      "January", "February", "March", "April", "May",
      "June", "July", "August", "September", "October",
      "November", "December"
    ];
    const monthIndex = parseInt(dateString.split('/')[0], 10) - 1;
    const currentMonth = new Date().getMonth();

    if (monthIndex === currentMonth) {
      return "This month";
    }

    return monthNames[monthIndex];
  }

  const getSummaryDashboard = (newFilterFields: any) => {
    setIsLoading(true)
    const params = {
      CompanyIds: [CompanyId],
      LocationIds: newFilterFields?.LocationIds.length != 0 ? newFilterFields?.LocationIds.length === LocationOption.length ? null : newFilterFields?.LocationIds.map(Number) : null,
      Date: newFilterFields?.Date ? convertStringsDateToUTC(formatDateByMonthYear(newFilterFields.Date)) : '',
      ProcessType: newFilterFields?.ProcessType.length != 0 ? newFilterFields?.ProcessType.length === processOptions.length ? ["1", "2"] : newFilterFields.ProcessType : ["1", "2"]
    }
    performApiAction(dispatch, getSummary, params, (responseData: any) => {
      setSummaryData(responseData)
      setIsLoading(false)
    }, () => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (CompanyId && LocationOption.length > 0) {
      getSummaryDashboard(filterFields)
    }
  }, [CompanyId, LocationOption])
  
  const updatedCardData = cardDataItems.map(({ amountKey, description, isCurrency }) => ({
    amount: isCurrency 
      ? `$${formatCurrency(summaryData[amountKey] ?? 0)}` 
      : `${summaryData[amountKey] ?? 0}`,
    description
  }));

  const handleSummaryClick = (description: string) => {
    switch (description) {
      case 'Total Posted Amount':
        dispatch(setSelectedProcessTypeFromList('4'))
        router.push(`/bills?module=BillsOverview?chart=Summary`)
        const startDate = format(convertStringsDateToUTC(formatDateByMonthYear(filterFields.Date)), 'MM/dd/yyyy');

        const lastDayOfNextMonth = endOfMonth(convertStringsDateToUTC(formatDateByMonthYear(filterFields.Date)));
        const formattedLastDayOfNextMonth = format(lastDayOfNextMonth, 'MM/dd/yyyy');

        dispatch(setFilterFormFields({
          ft_status: ['1', '2', '6', '8'],
          ft_assignee: '1',
          ft_select_users: [],
          ft_vendor: null,
          ft_location: null,
          ft_overview_status: ['2', '3', '4', '5'],
          ft_process: filterFields?.ProcessType,
          ft_datepicker: `${startDate} to ${formattedLastDayOfNextMonth}`
        }));
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
          LocationIds:
            filterFields?.LocationIds.length === LocationOption.length
              ? null
              : filterFields?.LocationIds.map(Number),
        }))
        break
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
      <div className={`px-4 mb-5 grid ${isLoading ? "grid-cols-1" : "grid-cols-4 sm:grid-cols-2 laptop:grid-cols-3 laptopMd:grid-cols-4 lg:grid-cols-4 gap-5"}`}>
        {isLoading ? <div className='h-[90px] w-full flex justify-center'>
          <Loader size='sm' helperText />
        </div>
          : updatedCardData.map((data, index) => (
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