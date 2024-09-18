'use client'

import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import React, { useEffect } from 'react'
import BillApproval from './BillApproval'
import PaymentApproval from './PaymentApproval'
import { useSearchParams } from 'next/navigation'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import Wrapper from '@/components/Common/Wrapper'

const ListApproval: React.FC = () => {
  const dispatch = useAppDispatch()
  const { approvalDropdownFields } = useAppSelector((state) => state.billApproval)

  const searchParams = useSearchParams()
  const id = searchParams.get('approvalId') ?? ''

  useEffect(() => {
    if (id == '1' || id == '2') {
      dispatch(setApprovalDropdownFields(id))
    } else {
      dispatch(setApprovalDropdownFields('1'))
    }
  }, [id])

  return (
    <>
      {approvalDropdownFields == '1' ? <BillApproval /> : <PaymentApproval />}
    </>
  )
}

export default ListApproval