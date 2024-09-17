import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setFilterFields } from '@/store/features/vendor/vendorSlice'
import { Button, MultiSelectChip, Text, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

const Filter: React.FC<any> = ({
    vendorOption,
    paymentMethodOption,
    isFilterOpen,
    onClose,
}) => {
    // For Dynamic Company Id & AccountingTool
    const dispatch = useAppDispatch()
    const { filterFields } = useAppSelector((state) => state.vendor)
    const dropDownRef = useRef<HTMLDivElement | null>(null)

    const [minPayables, setMinPayables] = useState<string>('')
    const [maxPayables, setMaxPayables] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [selectedVendor, setSelectedVendor] = useState<string[]>([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([])
    const [isResetClicked, setIsResetClicked] = useState<boolean>(false)
    const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)
    const [isValidMaxAmount, setIsValidMaxAmount] = useState<boolean>(false)

    const statusOptions = [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' }
    ]

    const resetFilter = () => {
        setSelectedStatus([]);
        setSelectedVendor([]);
        setSelectedPaymentMethod([]);
        setMinPayables('');
        setMaxPayables('');
        setIsResetClicked(true);
        setIsFilterChanged(true);
        setIsValidMaxAmount(true);
    }

    const handleApplyChanges = () => {
        if (isResetClicked) {
            dispatch(setFilterFields({
                VendorIds: [],
                PaymentMethod: [],
                StatusIds: [],
                MinPayables: '',
                MaxPayables: ''
            }))
            setIsResetClicked(false)
        } else {
            dispatch(setFilterFields({
                VendorIds: selectedVendor ?? [],
                PaymentMethod: selectedPaymentMethod ?? [],
                StatusIds: selectedStatus ?? [],
                MinPayables: minPayables ?? '',
                MaxPayables: maxPayables ?? ''
            }))
        }
        onClose()
    }

    useEffect(() => {
        // Check if any filter option has been changed
        setSelectedStatus(filterFields.StatusIds)
        setSelectedVendor(filterFields.VendorIds)
        setSelectedPaymentMethod(filterFields.PaymentMethod)
        setMinPayables(filterFields.MinPayables)
        setMaxPayables(filterFields.MaxPayables)
    }, [filterFields]);

    useEffect(() => {
        if (isFilterOpen) {
            const isChanged = JSON.stringify(selectedStatus) !== JSON.stringify(filterFields.StatusIds) ||
                JSON.stringify(selectedVendor) !== JSON.stringify(filterFields.VendorIds) ||
                JSON.stringify(selectedPaymentMethod) !== JSON.stringify(filterFields.PaymentMethod) ||
                minPayables !== filterFields.MinPayables || maxPayables !== filterFields.MaxPayables
            setIsFilterChanged(isChanged);
        }
    }, [isFilterOpen, selectedStatus, selectedVendor, selectedPaymentMethod, minPayables, maxPayables, filterFields]);

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
        setSelectedStatus(filterFields.StatusIds)
        setSelectedVendor(filterFields.VendorIds)
        setSelectedPaymentMethod(filterFields.PaymentMethod)
        setMinPayables(filterFields.MinPayables)
        setMaxPayables(filterFields.MaxPayables)
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
                className={`top-28 z-30 w-[791px] outline-none rounded border border-lightSilver bg-pureWhite ${isFilterOpen ? 'absolute translate-x-0 right-[100px]' : ' fixed translate-x-full right-0'} transition-transform duration-300 ease-in-out`}>

                {/* Header */}
                <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
                    <span className='font-proxima text-lg font-medium text-darkCharcoal tracking-[0.02em]' tabIndex={-1}>Filter</span>
                    <Button className='rounded-sm !text-base' variant="error" onClick={resetFilter}>
                        Reset All
                    </Button>
                </div>

                {/* Content */}
                <div className='grid grid-cols-3 gap-5 p-5 custom-scroll overflow-y-auto'>
                    <div>
                        <MultiSelectChip
                            id='vendorName'
                            label='Vendor Name'
                            options={vendorOption}
                            type='checkbox'
                            defaultValue={selectedVendor}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedVendor(value)
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div>
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
                    <div className='flex justify-center items-center'>
                        <Text
                            label='Payables'
                            id='minPayables'
                            name='minPayables'
                            placeholder='Min'
                            maxLength={11}
                            value={minPayables}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                /^\d*$/.test(value) && setMinPayables(value)
                            }}
                            getError={() => { }}
                        /><span className='mt-7 mx-3 text-slatyGrey'>{"->"}</span>
                        <Text
                            className='mt-7'
                            id='maxPayables'
                            name='maxPayables'
                            placeholder='Max'
                            value={maxPayables}
                            maxLength={11}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                /^\d*$/.test(value) && setMaxPayables(value)
                            }}
                            getError={() => { }}
                        />
                    </div>
                    <div>
                        <MultiSelectChip
                            id='status'
                            label='Status'
                            options={statusOptions}
                            type='checkbox'
                            defaultValue={selectedStatus}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedStatus(value)
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
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