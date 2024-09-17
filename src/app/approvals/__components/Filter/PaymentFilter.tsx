import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setPaymentApprovalFilterFields } from '@/store/features/billApproval/approvalSlice'
import { Button, MultiSelectChip, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

const Filter: React.FC<any> = ({
    vendorOption,
    bankAccountOption,
    paymentMethodOption,
    isFilterOpen,
    onClose,
}) => {
    // For Dynamic Company Id & AccountingTool
    const dispatch = useAppDispatch()
    const { paymentApprovalFilterFields } = useAppSelector((state) => state.billApproval)
    const dropDownRef = useRef<HTMLDivElement | null>(null)

    const [minAmount, setMinAmount] = useState<string>('')
    const [maxAmount, setMaxAmount] = useState<string>('')
    const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string[]>([])
    const [selectedVendor, setSelectedVendor] = useState<string[]>([])
    const [selectedBankAccount, setSelectedBankAccount] = useState<string[]>([])
    const [isResetClicked, setIsResetClicked] = useState<boolean>(false)
    const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)
    const [isValidMaxAmount, setIsValidMaxAmount] = useState<boolean>(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([])
    const [maxAmountErrorMessage, setMaxAmountErrorMessage] = useState<string>('')

    const statusOptions = [
        { label: 'Pending', value: '0' },
        { label: 'Approved', value: '1' },
        { label: 'Rejected', value: '2' },
    ]

    const resetFilter = () => {
        setSelectedApprovalStatus(['0']);
        setSelectedPaymentMethod([])
        setSelectedVendor([]);
        setSelectedBankAccount([]);
        setMinAmount('');
        setMaxAmount('');
        setIsResetClicked(true);
        setIsFilterChanged(true);
        setIsValidMaxAmount(true);
        setMaxAmountErrorMessage('')
    }

    const handleApplyChanges = () => {
        if (isResetClicked) {
            dispatch(setPaymentApprovalFilterFields({
                VendorIds: [],
                BankAccountIds: [],
                ApprovalStatusIds: ['0'],
                PaymentMethodIds: [],
                MinAmount: '',
                MaxAmount: ''
            }))
            setIsResetClicked(false)
        } else {
            dispatch(setPaymentApprovalFilterFields({
                VendorIds: selectedVendor ?? [],
                BankAccountIds: selectedBankAccount ?? [],
                ApprovalStatusIds: selectedApprovalStatus ?? [],
                PaymentMethodIds: selectedPaymentMethod ?? [],
                MinAmount: minAmount ?? '',
                MaxAmount: maxAmount ?? ''
            }))
        }
        onClose()
    }

    useEffect(() => {
        if (paymentApprovalFilterFields) {
            // Check if any filter option has been changed
            setSelectedApprovalStatus(paymentApprovalFilterFields.ApprovalStatusIds ?? [])
            setSelectedPaymentMethod(paymentApprovalFilterFields.PaymentMethodIds ?? [])
            setSelectedVendor(paymentApprovalFilterFields.VendorIds ?? [])
            setSelectedBankAccount(paymentApprovalFilterFields.BankAccountIds ?? [])
            setMinAmount(paymentApprovalFilterFields.MinAmount ?? "")
            setMaxAmount(paymentApprovalFilterFields.MaxAmount ?? "")
        }
    }, [paymentApprovalFilterFields]);

    useEffect(() => {
        if (isFilterOpen && paymentApprovalFilterFields) {
            const isChanged = JSON.stringify(selectedApprovalStatus) !== JSON.stringify(paymentApprovalFilterFields.ApprovalStatusIds) ||
                JSON.stringify(selectedVendor) !== JSON.stringify(paymentApprovalFilterFields.VendorIds) ||
                JSON.stringify(selectedPaymentMethod) !== JSON.stringify(paymentApprovalFilterFields.PaymentMethodIds) ||
                JSON.stringify(selectedBankAccount) !== JSON.stringify(paymentApprovalFilterFields.BankAccountIds) ||
                minAmount !== paymentApprovalFilterFields.MinAmount || maxAmount !== paymentApprovalFilterFields.MaxAmount
            setIsFilterChanged(isChanged);
        }
    }, [isFilterOpen, selectedApprovalStatus, selectedPaymentMethod, selectedVendor, selectedBankAccount, minAmount, maxAmount, paymentApprovalFilterFields]);

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
        if (paymentApprovalFilterFields) {
            setSelectedApprovalStatus(paymentApprovalFilterFields.ApprovalStatusIds)
            setSelectedVendor(paymentApprovalFilterFields.VendorIds)
            setSelectedPaymentMethod(paymentApprovalFilterFields.PaymentMethodIds ?? [])
            setSelectedBankAccount(paymentApprovalFilterFields.BankAccountIds)
            setMinAmount(paymentApprovalFilterFields.MinAmount)
            setMaxAmount(paymentApprovalFilterFields.MaxAmount)
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
                className={`top-28 z-30 w-[793px] outline-none rounded border border-lightSilver bg-pureWhite ${isFilterOpen ? 'absolute translate-x-0 right-[130px]' : ' fixed translate-x-full right-0'} transition-transform duration-300 ease-in-out`}>

                {/* Header */}
                <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
                    <span className='font-proxima text-lg font-medium text-black tracking-wider'>Filter</span>
                    <Button className='rounded-sm !text-base' variant="error" onClick={resetFilter}>
                        Reset All
                    </Button>
                </div>

                {/* Content */}
                <div className='grid grid-cols-3 gap-5 p-5 overflow-visible custom-scroll'>
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
                                setSelectedApprovalStatus(value)
                                setIsValidMaxAmount(true);
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
                                setIsValidMaxAmount(true);
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div>
                        <MultiSelectChip
                            id='bankAccount'
                            label='Bank Account'
                            options={bankAccountOption}
                            type='checkbox'
                            defaultValue={selectedBankAccount}
                            getValue={(value) => {
                                setIsResetClicked(false);
                                setIsFilterChanged(true);
                                setSelectedBankAccount(value)
                                setIsValidMaxAmount(true);
                            }}
                            getError={() => { }}
                            onSelect={() => { }}
                        />
                    </div>
                    <div>
                        <div className='flex justify-center items-center gap-5'>
                            <Text
                                label='Amount'
                                id='minAmount'
                                name='minAmount'
                                placeholder='Min'
                                maxLength={11}
                                value={minAmount}
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
                                className='mt-7'
                                id='maxAmount'
                                name='maxAmount'
                                placeholder='Max'
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
                </div>

                {/* Footer */}
                <div className='flex items-center justify-end gap-5 border-t border-t-lightSilver p-[15px]'>
                    <Button
                        tabIndex={0}
                        className='flex h-9 w-24 items-center justify-center rounded-full'
                        variant='btn-outline-primary'
                        onClick={handleCancel}>
                        <Typography type='h6' className='!text-[16px] !font-semibold'>
                            CANCEL
                        </Typography>
                    </Button>
                    <Button
                        tabIndex={0}
                        className={`h-9 w-32 rounded-full font-medium xsm:!px-1`}
                        variant={(isFilterChanged && isValidMaxAmount) ? 'btn-primary' : 'btn'}
                        disabled={(isFilterChanged && isValidMaxAmount) ? false : true}
                        onClick={handleApplyChanges}>
                        <Typography type='h6' className='!text-[16px] !font-semibold'>
                            APPLY FILTER
                        </Typography>
                    </Button>
                </div>
            </div>
        </div >
    )
}

export default Filter