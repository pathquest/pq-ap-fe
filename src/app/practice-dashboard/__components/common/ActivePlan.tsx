import React from 'react'
import CheckActiveIcon from '@/assets/Icons/practice_dashboard/CheckActiveIcon'

import { activePlanData } from '@/data/practDashboard'

function ActivePlan() {
  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-col gap-5 p-5'>
        <div className='flex items-center justify-center gap-2'>
          <span className='text-[18px] font-semibold'>{activePlanData.price}</span>
          <span className='text-[14px]'>{activePlanData.billingPeriod}</span>
        </div>
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <span>
              <CheckActiveIcon />
            </span>
            <span className='text-[14px]'>Next Billing Date - {activePlanData.nextBillingDate}</span>
          </div>
          <div className='flex items-center gap-2 py-5'>
            <span>
              <CheckActiveIcon />
            </span>
            <span className='text-[14px]'>Total Limit - {activePlanData.totalLimit}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span>
              <CheckActiveIcon />
            </span>
            <span className='text-[14px]'>Current Consumption - {activePlanData.currentConsumption}</span>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center border-t border-lightSilver py-3 text-[14px] font-semibold'>
        <span>Remaining Bills - {activePlanData.remainingBills}</span>
      </div>
    </div>
  )
}

export default ActivePlan
