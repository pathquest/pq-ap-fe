import { billingInfoHeaders } from '@/data/practDashboard'
import { Avatar, Loader, Typography } from 'pq-ap-lib'
import React from 'react'
import DataTableDashboard from '../common/DataTableDashboard'

function BillingInfo({ billingInfoData, isLoading }: any) {
  const table_Data =
    billingInfoData &&
    billingInfoData.map((d: any, index: any) => {
      const paymentMethods = d?.PaymentMethodDetails.reduce((acc: any, method: any) => {
        acc[method.PaymentMethod] = method
        return acc
      }, {})

      return {
        Id: <Typography className='font-proxima text-sm'>{index + 1}</Typography>,
        CompanyName: (
          <div className='flex cursor-pointer items-center gap-2 !font-semibold'>
            {d?.CompanyImage ? <Avatar imageUrl={''} variant='small' /> : <Avatar variant='small' name={d?.CompanyName} />}
            {d?.CompanyName}
          </div>
        ),
        TotalBillPosted: <label>{d?.TotalBillPosted}</label>,
        CheckUsage: <label>{paymentMethods[1]?.PaymentCount ?? 0}</label>,
        AchUsage: <label>{paymentMethods[4]?.PaymentCount ?? 0}</label>,
        AchUsagePlus: (
          <label className='!font-bold'>${paymentMethods[4]?.Amount ? parseFloat(paymentMethods[4]?.Amount).toFixed(2) : (0).toFixed(2)}</label>
        ),
        VirtualCardUsage: (
          <label className='!font-bold'>
            ${paymentMethods[5]?.Amount ? parseFloat(paymentMethods[5]?.Amount).toFixed(2) : (0).toFixed(2)}
          </label>
        ),
        CheckCharges: (
          <label className='!font-bold'>
            ${paymentMethods[1]?.OtherCharges ? parseFloat(paymentMethods[1]?.OtherCharges).toFixed(2) : (0).toFixed(2)}
          </label>
        ),
        AchCharges: (
          <label className='!font-bold'>
            ${paymentMethods[4]?.OtherCharges ? parseFloat(paymentMethods[4]?.OtherCharges).toFixed(2) : (0).toFixed(2)}
          </label>
        ),
      }
    })

  let noDataContent

  if (table_Data.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className={`fixed flex h-[59px] w-full items-center justify-center border-b border-b-[#ccc]`}>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }

  return (
    <div>
      <div className={`stickyTable custom-scroll h-[calc(100vh-150px)] overflow-scroll`}>
        <div className={`mainTable ${billingInfoData.length !== 0 && 'h-0'}`}>
          <DataTableDashboard
            columns={billingInfoHeaders}
            data={table_Data}
            hoverEffect={true}
            sticky
            getExpandableData={() => {}}
            getRowId={() => {}}
            stickyPostion='!top-0'
          />
        </div>
        {noDataContent}
      </div>
    </div>
  )
}

export default BillingInfo
