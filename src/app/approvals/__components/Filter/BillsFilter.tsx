import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setBillApprovalFilterFields } from '@/store/features/billApproval/approvalSlice'
import { Button, DatepickerRange, MultiSelectChip, Select, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

const Filter: React.FC<any> = ({
    vendorOption,
    locationOption,
    isFilterOpen,
    onClose,
}) => {
    // For Dynamic Company Id & AccountingTool
    const dispatch = useAppDispatch()
    const { billApprovalFilterFields } = useAppSelector((state) => state.billApproval)
    const dropDownRef = useRef<HTMLDivElement | null>(null)

    const [minAmount, setMinAmount] = useState<string>('')
    const [maxAmount, setMaxAmount] = useState<string>('')
    const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string[]>([])
    const [selectedVendor, setSelectedVendor] = useState<string[]>([])
    const [isResetClicked, setIsResetClicked] = useState<boolean>(false)
    const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)
    const [isValidMaxAmount, setIsValidMaxAmount] = useState<boolean>(false)

    const [billNumber, setBillNumber] = useState<string>('')
    const [billDateRange, setBillDateRange] = useState<string>('')
    const [dueDateRange, setDueDateRange] = useState<string>('')
    const [maxAmountErrorMessage, setMaxAmountErrorMessage] = useState<string>('')

    const [selectedLocation, setSelectedLocation] = useState<string[]>([])
    const [assigneeValue, setAssigneeValue] = useState<string>('1')

    const statusOptions = [
        { label: 'Pending', value: '0' },
        { label: 'Approved', value: '1' },
        { label: 'Rejected', value: '2' },
    ]

    const assigneeOptions = [
        { label: 'Assign To Me', value: '1' },
        { label: 'Assign To Other', value: '2' },
        { label: 'Created By Me', value: '3' },
    ]

    const resetFilter = () => {
        setSelectedApprovalStatus(['0']);
        setSelectedVendor([]);
        setMinAmount('');
        setMaxAmount('');
        setBillNumber('');
        setBillDateRange('');
        setDueDateRange('');
        setIsResetClicked(true);
        setIsFilterChanged(true);
        setIsValidMaxAmount(true);
        setMaxAmountErrorMessage('');
        setAssigneeValue('1');
        setSelectedLocation([]);
    }

    const handleApplyChanges = () => {
        if (isResetClicked) {
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
                Assignee: '1',
                LocationIds: [],
            }))
            setIsResetClicked(false)
        } else {
            const billStartDate = billDateRange?.split(' to ')[0];
            const billEndDate = billDateRange?.split(' to ')[1];
            const startDueDate = dueDateRange?.split(' to ')[0];
            const EndDueDate = dueDateRange?.split(' to ')[1];
            dispatch(setBillApprovalFilterFields({
                VendorIds: selectedVendor ?? [],
                ApprovalStatusIds: selectedApprovalStatus ?? [],
                MinAmount: minAmount ?? '',
                MaxAmount: maxAmount ?? '',
                BillNumber: billNumber ?? '',
                BillStartDate: billStartDate ?? '',
                BillEndDate: billEndDate ?? '',
                StartDueDate: startDueDate ?? '',
                EndDueDate: EndDueDate ?? '',
                Assignee: assigneeValue ?? '1',
                LocationIds: selectedLocation ?? []
            }))
        }
        onClose()
    }

    useEffect(() => {
        if (billApprovalFilterFields) {
            // Check if any filter option has been changed
            const billDateValue = (billApprovalFilterFields.BillStartDate !== "" && billApprovalFilterFields.BillEndDate !== "") ? `${billApprovalFilterFields.BillStartDate} to ${billApprovalFilterFields.BillEndDate}` : ''
            const dueDateValue = (billApprovalFilterFields.StartDueDate !== "" && billApprovalFilterFields.EndDueDate !== "") ? `${billApprovalFilterFields.StartDueDate} to ${billApprovalFilterFields.EndDueDate}` : ''
            setSelectedApprovalStatus(billApprovalFilterFields.ApprovalStatusIds ?? [])
            setSelectedVendor(billApprovalFilterFields.VendorIds ?? [])
            setMinAmount(billApprovalFilterFields.MinAmount ?? "")
            setMaxAmount(billApprovalFilterFields.MaxAmount ?? "")
            setAssigneeValue(billApprovalFilterFields.Assignee ?? "1")
            setSelectedLocation(billApprovalFilterFields.LocationIds ?? []);
            setBillNumber(billApprovalFilterFields.BillNumber ?? "");
            setBillDateRange(billDateValue ?? '');
            setDueDateRange(dueDateValue ?? '');
        }
    }, [billApprovalFilterFields]);

    useEffect(() => {
        if (isFilterOpen && billApprovalFilterFields) {
            const isChanged =
                JSON.stringify(selectedVendor) !== JSON.stringify(billApprovalFilterFields.VendorIds) ||
                JSON.stringify(selectedLocation) !== JSON.stringify(billApprovalFilterFields.LocationIds) ||
                JSON.stringify(selectedApprovalStatus) !== JSON.stringify(billApprovalFilterFields.ApprovalStatusIds) ||
                billNumber.trim() !== billApprovalFilterFields.BillNumber.trim() ||
                assigneeValue.trim() !== billApprovalFilterFields.Assignee.trim() ||
                minAmount.trim() !== billApprovalFilterFields.MinAmount.trim() ||
                maxAmount.trim() !== billApprovalFilterFields.MaxAmount.trim() ||
                billDateRange.trim() !== `${billApprovalFilterFields.BillStartDate} ${billDateRange == "" ? "" : "to"} ${billApprovalFilterFields.BillEndDate}`.trim() ||
                dueDateRange.trim() !== `${billApprovalFilterFields.StartDueDate} ${billDateRange == "" ? "" : "to"} ${billApprovalFilterFields.EndDueDate}`.trim()
            setIsFilterChanged(isChanged);
        }
    }, [isFilterOpen, selectedApprovalStatus, billDateRange, dueDateRange, selectedVendor, minAmount, maxAmount, assigneeValue, selectedLocation, billApprovalFilterFields]);

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
        if (billApprovalFilterFields) {
            const billDateValue = (billApprovalFilterFields.BillStartDate !== "" && billApprovalFilterFields.BillEndDate !== "") ? `${billApprovalFilterFields.BillStartDate} to ${billApprovalFilterFields.BillEndDate}` : ''
            const dueDateValue = (billApprovalFilterFields.StartDueDate !== "" && billApprovalFilterFields.BillEndDate !== "") ? `${billApprovalFilterFields.BillStartDate} to ${billApprovalFilterFields.BillEndDate}` : ''
            setSelectedApprovalStatus(billApprovalFilterFields.ApprovalStatusIds ?? [])
            setSelectedVendor(billApprovalFilterFields.VendorIds ?? [])
            setMinAmount(billApprovalFilterFields.MinAmount ?? "")
            setMaxAmount(billApprovalFilterFields.MaxAmount ?? "")
            setAssigneeValue(billApprovalFilterFields.Assignee ?? "1")
            setSelectedLocation(billApprovalFilterFields.LocationIds ?? []);
            setBillNumber(billApprovalFilterFields.BillNumber ?? "");
            setBillDateRange(billDateValue ?? '');
            setDueDateRange(dueDateValue ?? '');
        }
    }

    useEffect(() => {
        if (isFilterOpen) {
            if (dropDownRef.current) {
                dropDownRef.current.focus();
            }
        }
    }, [isFilterOpen]);

    const validateAmount = (min: string, max: string) => {
        const minVal = parseFloat(min);
        const maxVal = parseFloat(max);

        if (min != '' && max == '') {
            setMaxAmountErrorMessage('')
            return true;
        }

        if (min == '' && max != '') {
            setMaxAmountErrorMessage('')
            return true;
        }

        if (min != '' && max != '') {
            if (maxVal < minVal) {
                setMaxAmountErrorMessage('Max amount cannot be less than min amount')
                return false;
            }
            setMaxAmountErrorMessage('')
            return true;
        }

        return false;
    };

    return (
        <div tabIndex={isFilterOpen ? 0 : -1} className={`${isFilterOpen &&
            'custom-scroll outline-none fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
            }`}>
            <div
                ref={dropDownRef}
                tabIndex={-1}
                className={`top-28 z-30 w-[793px] outline-none rounded border border-lightSilver bg-pureWhite ${isFilterOpen ? 'absolute translate-x-0 right-[80px]' : ' fixed translate-x-full right-0'} transition-transform duration-300 ease-in-out`}>

                {/* Header */}
                <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
                    <span className='font-proxima text-lg font-medium text-darkCharcoal tracking-[0.02em]' tabIndex={-1}>Filter</span>
                    <Button className='rounded-sm !text-base' variant="error" onClick={resetFilter}>
                        Reset All
                    </Button>
                </div>

                {/* Content */}
                <div className='grid grid-cols-3 gap-5 p-5 overflow-visible custom-scroll'>
                    <div>
                        <MultiSelectChip
                            id='approalStatus'
                            label='Approval Status'
                            options={statusOptions}
                            type='checkbox'
                            defaultValue={selectedApprovalStatus}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedApprovalStatus(value);
                                setIsValidMaxAmount(true);
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div>
                        <Text
                            label='Bill Number'
                            id='billnumber'
                            name='billNumber'
                            className='pt-[7px]'
                            placeholder='Please enter'
                            value={billNumber}
                            getValue={(value) => {
                                if (value != '') {
                                    const trimmedValue = value.trim();
                                    setIsResetClicked(false);
                                    setBillNumber(trimmedValue)
                                    trimmedValue.length > 0 && setIsFilterChanged(true);
                                    setIsValidMaxAmount(trimmedValue.length > 0);
                                }
                            }}
                            getError={() => { }}
                        />
                    </div>
                    <div>
                        <div className='flex justify-center items-center gap-5'>
                            <Text
                                label='Amount'
                                id='minAmount'
                                name='minAmount'
                                placeholder='Min'
                                className='pt-[7px]'
                                maxLength={11}
                                value={minAmount}
                                noSpecialChar
                                noText
                                getValue={(value) => {
                                    const trimmedValue = value.trim();
                                    setIsResetClicked(false);
                                    /^\d*$/.test(trimmedValue) && setMinAmount(trimmedValue)
                                    const isValid = validateAmount(trimmedValue, maxAmount);
                                    setIsFilterChanged(isValid);
                                    setIsValidMaxAmount(isValid);
                                }}
                                getError={() => { }}
                            />
                            <Text
                                id='maxAmount'
                                name='maxAmount'
                                placeholder='Max'
                                className='mt-7 pt-[7px]'
                                value={maxAmount}
                                maxLength={11}
                                getValue={(value) => {
                                    const trimmedValue = value.trim();
                                    setIsResetClicked(false);
                                    /^\d*$/.test(trimmedValue) && setMaxAmount(trimmedValue)
                                    const isValid = validateAmount(minAmount, trimmedValue);
                                    setIsFilterChanged(isValid);
                                    setIsValidMaxAmount(isValid);
                                }}
                                getError={() => { }}
                            />
                        </div>
                        <div key={maxAmountErrorMessage} className='mt-1 w-full text-xs text-defaultRed'>{maxAmountErrorMessage}</div>
                    </div>
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
                                setIsValidMaxAmount(true);
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div className='Filter_DatePickerRange'>
                        <DatepickerRange
                            id='bilDate'
                            label='Bill Date'
                            className='!pt-[3px]'
                            startYear={new Date().getFullYear()}
                            endYear={new Date().getFullYear()}
                            value={billDateRange}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setBillDateRange(value)
                                setIsValidMaxAmount(true);
                            }}
                            getError={() => { }}
                        />
                    </div>
                    <div className='Filter_DatePickerRange'>
                        <DatepickerRange
                            id='dueDate'
                            label='Due Date'
                            className='!pt-[3px]'
                            startYear={new Date().getFullYear()}
                            endYear={new Date().getFullYear()}
                            value={dueDateRange}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setDueDateRange(value)
                                setIsValidMaxAmount(true);
                            }}
                            getError={() => { }}
                        />
                    </div>
                    <div>
                        <Select
                            id='assignee'
                            label='Assignee'
                            placeholder={'Please Select'}
                            defaultValue={assigneeValue + ""}
                            options={assigneeOptions}
                            getValue={(value) => {
                                setAssigneeValue(value)
                                setIsResetClicked(false)
                            }}
                            getError={() => ''}
                        />
                    </div>
                    <div>
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
                        variant={(isFilterChanged && isValidMaxAmount) ? 'btn-primary' : 'btn'}
                        disabled={(isFilterChanged && isValidMaxAmount) ? false : true}>
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