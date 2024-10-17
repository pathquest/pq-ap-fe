import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setBillApprovalFilterFields, setPaymentApprovalFilterFields } from '@/store/features/billApproval/approvalSlice'
import { getSummary } from '@/store/features/dashboard/dashboardSlice'
import { convertStringsDateToUTC } from '@/utils'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import ProcessTypeDashboardFilter, { processOptions } from '../modal/ProcessTypeDashboardFilter'
import { setFilterFormFields, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { addMonths, endOfMonth, format, parse } from 'date-fns'

const Summary: React.FC<any> = ({ LocationOption }) => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const [summaryData, setSummaryData] = useState<any>([])
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

    // const monthIndex = parseInt(month, 10) - 1;
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
    if (CompanyId) {
      getSummaryDashboard(filterFields)
    }
  }, [CompanyId, LocationOption])

  const updatedCardData = [
    {
      // amount: `$${summaryData.TotalAmount ?? 0}`,
      amount: `$${formatCurrency(summaryData.TotalAmount)}`,
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
    const startDate = format(convertStringsDateToUTC(formatDateByMonthYear(filterFields.Date)), 'MM/dd/yyyy');

    const lastDayOfNextMonth = endOfMonth(convertStringsDateToUTC(formatDateByMonthYear(filterFields.Date)));
    const formattedLastDayOfNextMonth = format(lastDayOfNextMonth, 'MM/dd/yyyy');

    switch (description) {
      case 'Total Posted Amount':
        dispatch(setSelectedProcessTypeFromList('4'))
        router.push(`/bills?module=BillsOverview?chart=Summary`)
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
          BillStartDate: startDate,
          BillEndDate: formattedLastDayOfNextMonth,
          StartDueDate: '',
          EndDueDate: '',
          Assignee: '1',
          LocationIds:
            filterFields?.LocationIds.length === LocationOption.length
              ? null
              : filterFields?.LocationIds.map(Number),
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
      <div className={`px-4 mb-5 grid grid-cols-4 sm:grid-cols-2 laptop:grid-cols-3 laptopMd:grid-cols-4 lg:grid-cols-4 gap-5`}>
        {updatedCardData.map((data, index) => (
          <div
            key={data.amount + index}
            onClick={() => handleSummaryClick(data.description)}
            className={`${data.amount == "0" || data.amount == "$0.00" || isLoading ? "cursor-default pointer-events-none" : "cursor-pointer"} w-full cards_content laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 shadow-md border border-lightSilver rounded  bg-white"`}
          >
            {isLoading ? <div className='w-full laptop:h-[54px] laptopMd:h-[54px] lg:h-[54px] xl:h-[54px] hd:h-[62px] 2xl:h-[62px] 3xl:h-[62px] flex justify-center items-center'>
              <Loader size='sm' />
            </div> : <>
              <div className="lg:text-base xl:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-proxima font-semibold tracking-[0.02em]">
                {data.amount}
              </div>
              <div className='text-base font-proxima laptopMd:mt-1.5 lg:mt-1.5 xl:mt-1.5 hd:mt-2.5 2xl:mt-2.5 3xl:mt-2.5 text-darkCharcoal tracking-[0.02em]'>
                {data.description}
              </div>
            </>}
          </div>
        ))}
      </div>
    </>
  )
}

export default Summary