import { useAppDispatch, useAppSelector } from '@/store/configureStore';
import { setSummaryFilter } from '@/store/features/dashboard/dashboardSlice';
import { useSession } from 'next-auth/react';
import { Button, DatepickerYear, MultiSelectChip, Typography } from 'pq-ap-lib';
import React, { useEffect, useRef, useState } from 'react';

export const processOptions = [
    {
        label: 'Accounts Payable',
        value: '1',
    },
    {
        label: 'Accounts Adjustment',
        value: '2',
    }
]

const ProcessTypeDashboardFilter: React.FC<any> = ({
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

    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${month}/${year}`;

    const [selectedLocation, setSelectedLocation] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState(formattedDate)
    const [processType, setProcessType] = useState<string[]>(['1', '2'])

    const [isResetClicked, setIsResetClicked] = useState<boolean>(false)

    useEffect(() => {
        if (filterFields) {
            setSelectedLocation(filterFields.LocationIds);
            setSelectedDate(filterFields.Date)
            setProcessType(filterFields.ProcessType)
        }
    }, [filterFields]);

    useEffect(() => {
        if (locationOption.length > 0) {
            const allLocation = locationOption.map((option: any) => option.value)
            let newFilterFields = {
                LocationIds: allLocation,
                Date: selectedDate,
                ProcessType: processType,
            }
            dispatch(setSummaryFilter(newFilterFields));
        }
    }, [CompanyId, locationOption])

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
            setSelectedDate(filterFields.Date)
            setProcessType(filterFields.ProcessType)
        }
    }

    const handleApplyChanges = async (e: React.MouseEvent) => {
        e.stopPropagation()

        const newFilterFields = isResetClicked ? {
            // LocationIds: locationOption.map((option: any) => option.value),
            LocationIds: [],
            Date: selectedDate ? selectedDate : '',
            ProcessType: processType ? processType : [],
        } : {
            LocationIds: selectedLocation,
            Date: selectedDate ? selectedDate : '',
            ProcessType: processType ? processType : [],
        };
        await dispatch(setSummaryFilter(newFilterFields));
        onSuccessApply(newFilterFields)
        onClose()
    }

    const resetFilter = () => {
        setSelectedLocation(locationOption.map((option: any) => option.value));
        setProcessType(processOptions.map((option: any) => option.value))
        setSelectedDate(formattedDate)
        setIsResetClicked(true);
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
                <div className='h-full w-full px-5 place-content-center grid grid-cols-3 sm:grid-cols-3 laptop:grid-cols-3 laptopMd:grid-cols-3 lg:grid-cols-3 gap-5'>

                    <div className={`pt-[18px] customDatePickerYearExpandWidth pb-4`}>
                        <div className='flex flex-col'>
                            <DatepickerYear
                                id='ft_date'
                                label='Date'
                                value={selectedDate}
                                startYear={1900}
                                endYear={2099}
                                getValue={(value) => {
                                    if (value) {
                                        setSelectedDate(value)
                                    }
                                }}
                                getError={() => { }}
                            />
                        </div>
                    </div>

                    <div className={`py-4`}>
                        <MultiSelectChip
                            type='checkbox'
                            id={'locations'}
                            label='Location'
                            options={locationOption ?? []}
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
                    <div className={`py-4`}>
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
                            className='mx-3 w-24 rounded-full font-medium xsm:!px-1 tracking-wider'
                            variant='btn-outline-primary'>
                            <Typography type='h6' className='!font-bold'>
                                CANCEL
                            </Typography>
                        </Button>
                        <Button
                            type='submit'
                            onClick={handleApplyChanges}
                            className={`w-24 rounded-full font-medium xsm:!px-1 tracking-wider`}
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

export default ProcessTypeDashboardFilter
