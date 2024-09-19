import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setBillApprovalFilterFields } from '@/store/features/billApproval/approvalSlice'
import { setFilterFormFields } from '@/store/features/bills/billSlice'
import { getInsights } from '@/store/features/dashboard/dashboardSlice'
import { convertStringsDateToUTC } from '@/utils'
import { format, subMonths } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader, Typography } from 'pq-ap-lib'
import React, { useEffect, useMemo, useState } from 'react'

const Insights: React.FC = () => {
    const { data: session } = useSession()
    const userId = useMemo(() => localStorage.getItem('UserId'), [])
    const CompanyId = Number(session?.user?.CompanyId)
    const filterFields = useAppSelector((state: any) => state.dashboard.filterFields["Summary"]);

    const dispatch = useAppDispatch()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [insightData, setInsightData] = useState<any>([])
    const firstDayOfPreviousMonth = subMonths(new Date(), 1)
    const formattedDate = format(firstDayOfPreviousMonth, 'MM/dd/yyyy')
    const formattedCurrentDate = format(new Date(), 'MM/dd/yyyy')

    function formatDateByMonthYear(monthYear: any) {
        const [month, year] = monthYear.split('/')
        const formattedDate = `${month}/01/${year}`
        return formattedDate
    }

    const getInsightDashboard = (newFilterFields: any) => {
        setIsLoading(true)
        const params = {
            UserId: Number(userId),
            CompanyIds: [CompanyId],
            LocationIds: newFilterFields?.LocationIds.length != 0 ? newFilterFields?.LocationIds.map(Number) : null,
            Date: newFilterFields?.Date ? convertStringsDateToUTC(formatDateByMonthYear(newFilterFields.Date)) : '',
            ProcessType: newFilterFields?.ProcessType ? newFilterFields.ProcessType : []
        }
        performApiAction(dispatch, getInsights, params, (responseData: any) => {
            setInsightData(responseData)
            setIsLoading(false)
        }, () => {
            setIsLoading(false)
        })
    }

    useEffect(() => {
        if (CompanyId) {
            getInsightDashboard(filterFields)
        }
    }, [CompanyId])

    const updatedCardData = [
        {
            amount: `${insightData.BillPending ?? 0}`,
            description: 'Bill Pending'
        },
        {
            amount: `${insightData.DuplicateBills ?? 0}`,
            description: 'Duplicate Bills'
        },
        {
            amount: `${insightData.AssignedBills ?? 0}`,
            description: 'Assigned Bills'
        },
        {
            amount: `${insightData.PendingApproval ?? 0}`,
            description: 'Pending Approval'
        },
        {
            amount: `${insightData.BillPayment ?? 0}`,
            description: 'Bill Payment'
        }
    ];

    const handleInsightClick = (description: string) => {
        switch (description) {
            case 'Bill Pending':
                router.push(`/bills`)
                dispatch(setFilterFormFields({
                    ft_status: ['1', '2', '8'],
                    ft_assignee: '1',
                    ft_select_users: [],
                    ft_vendor: null,
                    ft_datepicker: `${formattedDate} to ${formattedCurrentDate}`,
                    ft_location: null,
                }))
                break
            case 'Duplicate Bills':
                // router.push(`/bills`)
                break
            case 'Assigned Bills':
                router.push(`/bills`)
                dispatch(setFilterFormFields({
                    ft_status: ['1', '2', '3', '4', '6', '7', '8', '9'],
                    ft_assignee: '1',
                    ft_select_users: [],
                    ft_vendor: null,
                    ft_datepicker: `${formattedDate} to ${formattedCurrentDate}`,
                    ft_location: null,
                }))
                break
            case 'Pending Approval':
                router.push(`/approvals?approvalId=1`)
                dispatch(setBillApprovalFilterFields({
                    VendorIds: [],
                    ApprovalStatusIds: ['0'],
                    BillNumber: '',
                    MinAmount: '',
                    MaxAmount: '',
                    BillStartDate: '',
                    BillEndDate: '',
                    StartDueDate: '',
                    EndDueDate: '',
                }))
                break
            case 'Bill Payment':
                router.push(`/payments/billtopay`)
                break
            default:
                break
        }
    }

    return (
        <div className='h-[493px] w-[240px] hd:w-[256px] 2xl:w-[256px] 3xl:w-[256px] shadow-md border border-lightSilver rounded bg-whiteSmoke overflow-y-auto flex flex-col gap-y-4 pb-4'>
            <div className='h-[62px] p-4 hd:p-5 2xl:p-5 3xl:p-5 border-b border-b-lightSilver sticky top-0 bg-white'>
                <Typography type='h5' className='title !text-base hd:!text-lg 2xl:!text-lg 3xl:!text-lg font-proxima font-semibold tracking-[0.02em] text-darkCharcoal'>
                    Insight
                </Typography>
            </div>
            {isLoading ? <div className='h-full w-full flex justify-center items-center'>
                <Loader size='sm' helperText/>
            </div>
                : updatedCardData.map((data, index) => (
                    <div className='pointer-events-none w-full px-4 hd:px-5 2xl:px-5 3xl:px-5' key={data.amount + index} onClick={() => handleInsightClick(data.description)}>
                        <div
                            key={data.amount + index}
                            onClick={() => handleInsightClick(data.description)}
                            className="w-full cursor-pointer cards_content laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 shadow-md border border-lightSilver rounded  bg-white"
                        >
                            <div className="lg:text-base xl:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-proxima font-semibold tracking-[0.02em]">
                                {data.amount}
                            </div>
                            <div className='text-base font-proxima laptopMd:mt-1.5 lg:mt-1.5 xl:mt-1.5 hd:mt-2.5 2xl:mt-2.5 3xl:mt-2.5 text-darkCharcoal tracking-[0.02em]'>
                                {data.description}
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    )
}

export default Insights