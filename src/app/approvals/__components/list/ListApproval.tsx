'use client'

import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import { setSearchSelectedModule } from '@/store/features/globalSearch/globalSearchSlice'
import React, { useEffect } from 'react'
import BillApproval from './BillApproval'
import PaymentApproval from './PaymentApproval'
const ListApproval: React.FC = () => {
  const { approvalDropdownFields } = useAppSelector((state) => state.billApproval)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setSearchSelectedModule('3'))
    dispatch(setApprovalDropdownFields('1'))
  }, [])

  return (
    <>
      {approvalDropdownFields == '1' ? <BillApproval /> : <PaymentApproval />}
    </>
  )
}

export default ListApproval