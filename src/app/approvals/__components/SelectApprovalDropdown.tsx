
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import { Select } from 'pq-ap-lib'
import React from 'react'
import { approvalOptions } from './data/ApprovalDropdownData'

const SelectApprovalDropdown: React.FC = () => {
    const dispatch = useAppDispatch()
    const { approvalDropdownFields } = useAppSelector((state) => state.billApproval)

    const handleValue = (value:string) => {
        dispatch(setApprovalDropdownFields(value))
    }

    return (
        <Select
            id={'approval_selection'}
            className='processTypeSelection'
            options={approvalOptions}
            defaultValue={approvalDropdownFields}
            value={approvalDropdownFields}
            getValue={(value) => handleValue(value)}
            getError={() => {}}
            noborder
        />
    )
}

export default SelectApprovalDropdown