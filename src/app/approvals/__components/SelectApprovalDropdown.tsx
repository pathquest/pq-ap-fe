
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import { Select } from 'pq-ap-lib'
import React from 'react'

const SelectApprovalDropdown: React.FC = () => {
    const dispatch = useAppDispatch()
    const { approvalDropdownFields } = useAppSelector((state) => state.billApproval)

    const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
    const isApprovalView = getModulePermissions(processPermissionsMatrix, "Approval") ?? {}
    const isBillApprovalView = isApprovalView["Bill"]?.View ?? false;
    const isPaymentApprovalView = isApprovalView["Payment"]?.View ?? false;

    const handleValue = (value: string) => {
        dispatch(setApprovalDropdownFields(value))
    }

    const approvalOptions = [
        {
            label: 'Bill Approval',
            value: '1',
            isHidden: !isBillApprovalView,
        },
        {
            label: 'Payment Approval',
            value: '2',
            isHidden: !isPaymentApprovalView,
        },
        {
            label: 'Purchase Order Approval',
            value: '3',
            isEnable: false,
            isHidden: false
        },
    ].filter(option => !option.isHidden)

    return (
        <Select
            id={'approval_selection'}
            className='processTypeSelection'
            options={approvalOptions}
            defaultValue={approvalDropdownFields}
            value={approvalDropdownFields}
            getValue={(value) => handleValue(value)}
            getError={() => { }}
            noborder
        />
    )
}

export default SelectApprovalDropdown