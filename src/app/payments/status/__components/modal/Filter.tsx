import { FilterProps } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setFilterFields } from '@/store/features/paymentstatus/paymentStatusSlice'
import { Button, DatepickerRange, MultiSelectChip, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

const Filter: React.FC<FilterProps> = ({
    locationOption,
    vendorOption,
    paymentMethodOption,
    isFilterOpen,
    onClose,
}) => {
    // For Dynamic Company Id & AccountingTool
    const dispatch = useAppDispatch()
    const { filterFields } = useAppSelector((state) => state.paymentStatus)
    const dropDownRef = useRef<HTMLDivElement>(null)

    const [dateRange, setDateRange] = useState<string>('')
    const [selectedLocation, setSelectedLocation] = useState<string[]>([])
    const [selectedVendor, setSelectedVendor] = useState<string[]>([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([])
    const [isResetClicked, setIsResetClicked] = useState<boolean>(false)
    const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)

    const resetFilter = () => {
        setSelectedLocation([]);
        setSelectedVendor([]);
        setSelectedPaymentMethod([]);
        setDateRange('');
        setIsResetClicked(true);
        setIsFilterChanged(true);
    }

    const handleApplyChanges = () => {
        if (isResetClicked) {
            dispatch(setFilterFields({
                LocationIds: [],
                VendorIds: [],
                PaymentMethod: [],
                StartDate: '',
                EndDate: ''
            }))
            setIsResetClicked(false)
        } else {
            const startDate = dateRange?.split(' to ')[0];
            const endDate = dateRange?.split(' to ')[1];
            dispatch(setFilterFields({
                LocationIds: selectedLocation || [],
                VendorIds: selectedVendor || [],
                PaymentMethod: selectedPaymentMethod ?? [],
                StartDate: startDate ?? '',
                EndDate: endDate ?? '',
            }))
        }
        onClose()
    }

    useEffect(() => {
        // Check if any filter option has been changed
        const dateValue = (filterFields.StartDate !== "" && filterFields.EndDate !== "") ? `${filterFields.StartDate} to ${filterFields.EndDate}` : ''
        setSelectedLocation(filterFields.LocationIds)
        setSelectedVendor(filterFields.VendorIds)
        setSelectedPaymentMethod(filterFields.PaymentMethod)
        setDateRange(dateValue)
    }, [filterFields]);

    useEffect(() => {
        if (isFilterOpen) {
            const isChanged =
                JSON.stringify(selectedLocation) !== JSON.stringify(filterFields.LocationIds) ||
                JSON.stringify(selectedVendor) !== JSON.stringify(filterFields.VendorIds) ||
                JSON.stringify(selectedPaymentMethod) !== JSON.stringify(filterFields.PaymentMethod) ||
                dateRange.trim() !== `${filterFields.StartDate} ${dateRange == "" ? "" : "to"} ${filterFields.EndDate}`.trim();
            setIsFilterChanged(isChanged);
        }
    }, [isFilterOpen, selectedLocation, selectedVendor, selectedPaymentMethod, dateRange, filterFields]);

    // Handel Outside Click
    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isFilterOpen) {
            document.addEventListener('mousedown', handleOutsideClick)
        } else {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [isFilterOpen, onClose])

    const handleCancel = () => {
        onClose()
        const dateValue = (filterFields.StartDate !== "" && filterFields.EndDate !== "") ? `${filterFields.StartDate} to ${filterFields.EndDate}` : ''
        setSelectedLocation(filterFields.LocationIds)
        setSelectedVendor(filterFields.VendorIds)
        setSelectedPaymentMethod(filterFields.PaymentMethod)
        setDateRange(dateValue)
    }

    useEffect(() => {
        if (isFilterOpen) {
            if (dropDownRef.current) {
                dropDownRef.current.focus();
            }
        }
    }, [isFilterOpen]);

    return (
        <div tabIndex={isFilterOpen ? 0 : -1} className={`${isFilterOpen &&
            'custom-scroll outline-none fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
            }`}>
            <div
                ref={dropDownRef}
                tabIndex={-1}
                className={`top-28 z-30 w-[40vw] outline-none rounded border border-lightSilver bg-pureWhite ${isFilterOpen ? 'absolute translate-x-0 right-[85px]' : ' fixed translate-x-full right-0'} transition-transform duration-300 ease-in-out`}>

                {/* Header */}
                <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
                    <span className='font-proxima text-lg font-medium text-darkCharcoal tracking-[0.02em]' tabIndex={-1}>Filter</span>
                    <Button className='rounded-sm !text-base' variant="error" onClick={resetFilter}>
                        Reset All
                    </Button>
                </div>

                {/* Content */}
                <div className='grid grid-cols-2 gap-5 p-5'>
                    <div className='w-full'>
                        <MultiSelectChip
                            id='locations'
                            label='Location(s)'
                            options={locationOption}
                            type='checkbox'
                            defaultValue={selectedLocation}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedLocation(value.map(Number))
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div className='w-full'>
                        <MultiSelectChip
                            id='vendors'
                            label='Vendors'
                            options={vendorOption}
                            type='checkbox'
                            defaultValue={selectedVendor}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedVendor(value.map(Number))
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div className='w-full'>
                        <MultiSelectChip
                            id='paymentMethod'
                            label='Payment Method'
                            options={paymentMethodOption}
                            type='checkbox'
                            defaultValue={selectedPaymentMethod}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedPaymentMethod(value)
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div className='w-full'>
                        <DatepickerRange
                            id='date'
                            label='Payment Date'
                            startYear={1900}
                            endYear={2099}
                            value={dateRange}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setDateRange(value)
                            }}
                            getError={() => { }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-end border-t border-lightSilver shadow-inner laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
                    <Button tabIndex={0} onClick={handleCancel} className='!h-9 rounded-full !p-0 !m-0' variant='btn-outline-primary'>
                        <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
                            CANCEL
                        </label>
                    </Button>
                    <Button
                        type='submit'
                        tabIndex={0}
                        onClick={handleApplyChanges}
                        className={`h-9 rounded-full !p-0 !m-0`}
                        variant={isFilterChanged ? 'btn-primary' : 'btn'}
                        disabled={isFilterChanged ? false : true}>
                        <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
                            APPLY FILTER
                        </label>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Filter