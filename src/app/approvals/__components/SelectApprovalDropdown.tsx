
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import { useRouter } from 'next/navigation'
import { Select } from 'pq-ap-lib'
import React, { useEffect } from 'react'

const SelectApprovalDropdown: React.FC = () => {
    const dispatch = useAppDispatch()
    const router = useRouter();
    const { approvalDropdownFields } = useAppSelector((state) => state.billApproval)

    const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
    const isApprovalView = getModulePermissions(processPermissionsMatrix, "Approval") ?? {}
    const isBillApprovalView = isApprovalView["Bill"]?.View ?? false;
    const isPaymentApprovalView = isApprovalView["Payment"]?.View ?? false;

    const handleValue = (value: string) => {
        dispatch(setApprovalDropdownFields(value))
    }

    useEffect(() => {
        if (!isBillApprovalView && !isBillApprovalView) {
            router.push('/manage/companies');
        }
    }, [isBillApprovalView, isBillApprovalView]);

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
        // {
        //     label: 'Purchase Order Approval',
        //     value: '3',
        //     isEnable: false,
        //     isHidden: false
        // },
    ].filter(option => !option.isHidden)

    return (
        <div className='selectMain'>
            <Select
                id={'process_selection'}
                className='processTypeSelection'
                options={approvalOptions}
                defaultValue={approvalDropdownFields}
                value={approvalDropdownFields}
                getValue={(value) => handleValue(value)}
                getError={() => { }}
                noborder
            />
        </div>
    )
}

export default SelectApprovalDropdown