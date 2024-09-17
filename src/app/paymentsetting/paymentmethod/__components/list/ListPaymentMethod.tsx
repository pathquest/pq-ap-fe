'use client'

import Wrapper from '@/components/Common/Wrapper'
import { Typography } from 'pq-ap-lib'
import React from 'react'

const ListPaymentMethod: React.FC = () => {
  return (
    <Wrapper masterSettings={true}>
      {/* Navbar */}
      <div className='sticky  top-0 z-[6] flex h-[66px] items-center justify-between bg-whiteSmoke'>
        <div className='mx-3 flex place-content-center'>
          <Typography type='h5' className='flex items-center justify-center text-center !font-bold'>
            Payment Method
          </Typography>
        </div>
      </div>
    </Wrapper>
  )
}

export default ListPaymentMethod
