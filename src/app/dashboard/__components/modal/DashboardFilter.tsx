import { formatPeriodDate } from '@/components/Common/Functions/FormatDate';
import { useAppDispatch, useAppSelector } from '@/store/configureStore';
import { setBillApprovalStatusFilter, setOnTimeVsMissedProcessingFilter, setPaymentApprovedVsPaidBeforeDueDateFilter, setPostedBillsByMonthFilter, setProcessedVsPaymentNotApprovedFilter, setVendorWiseMonthlyPaymentFilter } from '@/store/features/dashboard/dashboardSlice';
import { useSession } from 'next-auth/react';
import { Button, DatepickerRange, MultiSelectChip, Select, Typography } from 'pq-ap-lib';
import React, { useEffect, useRef, useState } from 'react';
import { processOptions } from './ProcessTypeDashboardFilter';

const DashboardFilter: React.FC<any> = ({
    locationOption,
    ChartType,
    isFilterOpen,
    onClose,
    onSuccessApply
}) => {
    const { data: session } = useSession()
    const CompanyId = Number(session?.user?.CompanyId)
    const filterFields = useAppSelector((state: any) => state.dashboard.filterFields[ChartType]);
    const dispatch = useAppDispatch()

    const filterRef = useRef<any>(null)

    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [selectedLocation, setSelectedLocation] = useState<string[]>([])
    const [chartPeriodValue, setChartPeriodValue] = useState<string>('')
    const [chartPeriodRange, setChartPeriodRange] = useState<string>('')

    const [startDate, setStartDate] = useState<Date | null>(thisMonthStart);
    const [endDate, setEndDate] = useState<Date | null>(today);

    const [isResetClicked, setIsResetClicked] = useState<boolean>(false)
    const [processType, setProcessType] = useState<string[]>(['1', '2'])

    useEffect(() => {
        if (filterFields) {
            setSelectedLocation(filterFields.LocationIds || []);
            setChartPeriodValue(filterFields.Period || "");
            setProcessType(filterFields.ProcessType || "")
            if (filterFields.StartDate || filterFields.EndDate) {
                setStartDate(filterFields.StartDate ? new Date(filterFields.StartDate) : null);
                setEndDate(filterFields.EndDate ? new Date(filterFields.EndDate) : null);
                setChartPeriodRange(`${filterFields.StartDate} to ${filterFields.EndDate}`);
            }
        }
    }, [filterFields]);

    const visibleOption = [
        // { value: 'Today', label: 'Today' },
        // { value: 'Yesterday', label: 'Yesterday' },
        { value: 'This Week', label: 'This Week' },
        // { value: 'Last Week', label: 'Last Week' },
        { value: 'This Month', label: 'This Month' },
        { value: 'Last Month', label: 'Last Month' },
        // { value: 'This Year', label: 'This Year' },
        // { value: 'Last Year', label: 'Last Year' },
        { value: 'Custom', label: 'Custom' },
    ];

    useEffect(() => {
        // if (locationOption.length > 0) {
        //     // const allLocation = locationOption.map((option: any) => option.value)
        //     setSelectedLocation([]);
        //     let newFilterFields = {
        //         LocationIds: [],
        //         StartDate: startDate ? formatPeriodDate(startDate) : '',
        //         EndDate: endDate ? formatPeriodDate(endDate) : '',
        //         Period: 'This Month',
        //     }
        //     dispatch(setPostedBillsByMonthFilter(newFilterFields));
        //     dispatch(setOnTimeVsMissedProcessingFilter(newFilterFields));
        //     dispatch(setVendorWiseMonthlyPaymentFilter(newFilterFields));
        //     dispatch(setBillApprovalStatusFilter(newFilterFields));
        //     dispatch(setProcessedVsPaymentNotApprovedFilter(newFilterFields));
        //     dispatch(setPaymentApprovedVsPaidBeforeDueDateFilter(newFilterFields));
        // }
        // else {
        setSelectedLocation([]);
        let newFilterFields = {
            LocationIds: [],
            StartDate: startDate ? formatPeriodDate(startDate) : '',
            EndDate: endDate ? formatPeriodDate(endDate) : '',
            Period: 'This Month',
        }
        dispatch(setPostedBillsByMonthFilter(newFilterFields));
        dispatch(setOnTimeVsMissedProcessingFilter(newFilterFields));
        dispatch(setVendorWiseMonthlyPaymentFilter(newFilterFields));
        dispatch(setBillApprovalStatusFilter(newFilterFields));
        dispatch(setProcessedVsPaymentNotApprovedFilter(newFilterFields));
        dispatch(setPaymentApprovedVsPaidBeforeDueDateFilter(newFilterFields));
        // }
    }, [CompanyId])

    const getDateRangeForOption = (option: string) => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        // Calculate the start of this week (Sunday)
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - dayOfWeek);

        // Calculate the end of this week (Saturday)
        // const thisWeekEnd = new Date(thisWeekStart);
        // thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

        // Calculate the start of last week
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        // Calculate the end of last week
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        // const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const thisYearEnd = new Date(today.getFullYear(), 11, 31);
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        const customMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        switch (option) {
            case "Today":
                return { startDate: today, endDate: today };
            case "Yesterday":
                return { startDate: yesterday, endDate: yesterday };
            case "This Week":
                return { startDate: thisWeekStart, endDate: today };
            case "Last Week":
                return { startDate: lastWeekStart, endDate: lastWeekEnd };
            case "This Month":
                return { startDate: thisMonthStart, endDate: today };
            case "Last Month":
                return { startDate: lastMonthStart, endDate: lastMonthEnd };
            case "This Year":
                return { startDate: thisYearStart, endDate: thisYearEnd };
            case "Last Year":
                return { startDate: lastYearStart, endDate: lastYearEnd };
            case "Custom":
                return { startDate: customMonthStart, endDate: today };
            default:
                return { startDate: null, endDate: null };
        }
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current?.contains(event.target as Node)) {
                onClose()
            }
        }
        window.addEventListener('mousedown', handleOutsideClick)
        return () => {
            window.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [isFilterOpen])

    const handleFilterClose = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClose()
        if (filterFields) {
            setSelectedLocation(filterFields.LocationIds || []);
            setChartPeriodValue(filterFields.Period || "");
            if (filterFields.StartDate || filterFields.EndDate) {
                setStartDate(filterFields.StartDate ? new Date(filterFields.StartDate) : null);
                setEndDate(filterFields.EndDate ? new Date(filterFields.EndDate) : null);
                setChartPeriodRange(`${filterFields.StartDate} to ${filterFields.EndDate}`);
                setProcessType(filterFields.ProcessType || "")
            }
        }
    }

    const handleApplyChanges = async (e: React.MouseEvent) => {
        e.stopPropagation()

        const newFilterFields = isResetClicked ? {
            // LocationIds: locationOption.map((option: any) => option.value),
            LocationIds: selectedLocation,
            StartDate: startDate ? formatPeriodDate(startDate) : '',
            EndDate: endDate ? formatPeriodDate(endDate) : '',
            Period: 'This Month',
        } : {
            LocationIds: selectedLocation,
            StartDate: startDate ? formatPeriodDate(startDate) : '',
            EndDate: endDate ? formatPeriodDate(endDate) : '',
            Period: chartPeriodValue,
        };

        switch (ChartType) {
            case 'PostedBillsByMonth':
                const updatedFilterFields = {
                    ...newFilterFields,
                    ProcessType: processType ? processType : [],
                };
                dispatch(setPostedBillsByMonthFilter(updatedFilterFields));
                onSuccessApply(updatedFilterFields)
                break;
            case 'OnTimeVsMissedProcessing':
                dispatch(setOnTimeVsMissedProcessingFilter(newFilterFields));
                onSuccessApply(newFilterFields)
                break;
            case 'VendorWiseMonthlyPayment':
                dispatch(setVendorWiseMonthlyPaymentFilter(newFilterFields));
                onSuccessApply(newFilterFields)
                break;
            case 'BillApprovalStatus':
                dispatch(setBillApprovalStatusFilter(newFilterFields));
                onSuccessApply(newFilterFields)
                break;
            case 'ProcessedVsPaymentNotApproved':
                dispatch(setProcessedVsPaymentNotApprovedFilter(newFilterFields));
                onSuccessApply(newFilterFields)
                break;
            case 'PaymentApprovedVsPaidBeforeDueDate':
                dispatch(setPaymentApprovedVsPaidBeforeDueDateFilter(newFilterFields));
                onSuccessApply(newFilterFields)
                break;
            default:
                break;
        }

        onClose()
    }

    const resetFilter = () => {
        const today = new Date();
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // setSelectedLocation(locationOption.map((option: any) => option.value));
        setSelectedLocation([])
        setChartPeriodValue("This Month");
        setStartDate(thisMonthStart);
        setEndDate(today);
        setChartPeriodRange(`${formatPeriodDate(thisMonthStart)} to ${formatPeriodDate(today)}`);
        setIsResetClicked(true);
        setProcessType(processOptions.map((option: any) => option.value))
    }

    const dynamicClass = isFilterOpen
        ? `absolute right-[120px] translate-x-0`
        : 'fixed right-0 translate-x-full'

    return (
        <div
            className={`${isFilterOpen &&
                'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
                }`}
        >
            <div ref={filterRef} className={`top-44 z-30 w-[793px] rounded border border-lightSilver bg-pureWhite ${dynamicClass} transition-transform duration-300 ease-in-out`}>
                <div className='flex items-center justify-between border-b border-lightSilver  px-4 py-3'>
                    <div className='text-lg font-medium'>Filter</div>
                    <Button className='rounded-sm !text-base' variant="error" onClick={resetFilter}>
                        Reset All
                    </Button>
                </div>
                <div className='h-full w-full p-5 grid grid-cols-3 sm:grid-cols-3 laptop:grid-cols-3 laptopMd:grid-cols-3 lg:grid-cols-3 gap-5'>
                    <div>
                        <Select
                            id={'chartPeriod'}
                            label='Period'
                            placeholder={'Please Select'}
                            defaultValue={chartPeriodValue}
                            options={visibleOption}
                            getValue={(value) => {
                                setChartPeriodValue(value)
                                const { startDate, endDate } = getDateRangeForOption(value);
                                if (startDate && endDate) {
                                    setStartDate(startDate);
                                    setEndDate(endDate);
                                    setChartPeriodRange(`${formatPeriodDate(startDate)} to ${formatPeriodDate(endDate)}`);
                                    setIsResetClicked(false)
                                }
                            }}
                            getError={() => ''}
                        />
                    </div>
                    <div className={`pt-[3px] customDatePickerExpandWidth ${chartPeriodValue === "Custom" ? "opacity-100" : "opacity-70 cursor-default pointer-events-none"}`}>
                        <DatepickerRange
                            id='ft_datepicker'
                            label='Date Range'
                            value={chartPeriodRange}
                            startYear={1995}
                            endYear={2050}
                            disabled={chartPeriodValue === "Custom" ? false : true}
                            getValue={(value: any) => {
                                if (chartPeriodValue === "Custom" && value) {
                                    const [start, end] = value.split(' to ');
                                    setStartDate(new Date(start));
                                    setEndDate(new Date(end));
                                    setChartPeriodRange(value);
                                    setIsResetClicked(false)
                                }
                            }}
                            getError={() => { }}
                        />
                    </div>
                    <div className={`pt-0.5 ${ChartType == "VendorWiseMonthlyPayment" || ChartType == "BillApprovalStatus" ? "md:pb-2 laptop:pb-2 laptopMd:pb-2 lg:pb-2 xl:pb-2" : ""} `}>
                        <MultiSelectChip
                            id='locations'
                            label='Location'
                            options={locationOption}
                            type='checkbox'
                            defaultValue={selectedLocation}
                            getValue={(value) => {
                                if (value) {
                                    setIsResetClicked(false)
                                    setSelectedLocation(value.map(Number))
                                }
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div className={`${ChartType == "PostedBillsByMonth" ? "visible" : "hidden"}`}>
                        <MultiSelectChip
                            type='checkbox'
                            id={'fh_process'}
                            label='Process'
                            placeholder={'Please select'}
                            defaultValue={processType}
                            options={processOptions ?? []}
                            getValue={(value) => {
                                if (value) {
                                    setProcessType(value)
                                }
                            }}
                            getError={() => ''}
                            onSelect={() => { }}
                        />
                    </div>
                </div>
                <div className='flex items-center justify-end border-t border-lightSilver  shadow-inner'>
                    <div className='mx-5 my-3'>
                        <Button
                            onClick={handleFilterClose}
                            className='mx-3 w-24 rounded-full font-medium xsm:!px-1 tracking-[0.02em]'
                            variant='btn-outline-primary'>
                            <Typography type='h6' className='!font-bold'>
                                CANCEL
                            </Typography>
                        </Button>
                        <Button
                            type='submit'
                            onClick={handleApplyChanges}
                            className={`w-24 rounded-full font-medium xsm:!px-1 tracking-[0.02em]`}
                            variant='btn-primary'>
                            <Typography type='h6' className='!font-bold'>
                                APPLY
                            </Typography>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardFilter