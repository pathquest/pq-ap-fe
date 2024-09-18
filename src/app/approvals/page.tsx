'use client'

import ListApprovalsPage from '@/app/approvals/__components/list/ListApproval'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch } from '@/store/configureStore'
import { setSearchSelectedModule } from '@/store/features/globalSearch/globalSearchSlice'
import React, { useEffect } from 'react'

const ApprovalsContent: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setSearchSelectedModule('3'))
  }, [])

  return <ListApprovalsPage />
}

export default ApprovalsContent