import React from 'react'

import CheckActiveIcon from '@/assets/Icons/practice_dashboard/CheckActiveIcon'
import RejectIcon from '@/assets/Icons/practice_dashboard/RejectIcon'

import { tableDataCashBack } from '@/data/practDashboard'

function CashBack({ totalVirtualCard }: any) {
  const isInRange = (value: number, range: string): boolean => {
    const parseValue = (val: string): number => {
      const isInThousands = /K$/i.test(val)
      const isInMillions = /M$/i.test(val)
      const multiplier = isInThousands ? 1000 : isInMillions ? 1000000 : 1
      return parseFloat(val.replace(/[^\d.-]/g, '')) * multiplier
    }

    const parts = range.split('-')
    if (parts.length === 2) {
      const lowerBound = parseValue(parts[0])
      const upperBound = parseValue(parts[1])
      if (!isNaN(lowerBound) && !isNaN(upperBound)) {
        return value >= lowerBound && value <= upperBound
      }
    } else if (range.charAt(0) === '>' && range.length > 1) {
      const lowerBound = parseValue(range.slice(1))
      if (!isNaN(lowerBound)) {
        return value > lowerBound
      }
    } else if (range.charAt(0) === '<' && range.length > 1) {
      const upperBound = parseValue(range.slice(1))
      if (!isNaN(upperBound)) {
        return value < upperBound
      }
    }
    return false
  }

  return (
    <>
      <table className='m-2 w-full border-collapse border border-black'>
        <thead className='border border-black'>
          <tr className='text-[14px] font-semibold'>
            <th className='w-[40%] border-r border-r-[#D8D8D8] p-2'>Payment Method</th>
            <th className='w-[30%] border-r border-r-[#D8D8D8] p-2'>Range</th>
            <th className='w-[30%] p-2'>Rebate %</th>
          </tr>
        </thead>
        <tbody className='px-2'>
          {tableDataCashBack.map((item, index) => (
            <React.Fragment key={index}>
              {item.ranges.map((range, idx) => (
                <tr key={`${index}-${idx}`} className={index === 0 ? '' : 'border-t border-black'}>
                  {idx === 0 && (
                    <td
                      rowSpan={item.ranges.length}
                      className={`w-[40%] border-r border-r-[#D8D8D8] p-2 text-center text-[14px] font-semibold`}
                    >
                      {item.paymentMethodId === 1
                        ? `${item.paymentMethod} $${parseInt(totalVirtualCard).toFixed(2) ?? `0.00`}`
                        : `${item.paymentMethod} $5,202.63`}
                    </td>
                  )}
                  <td
                    className={`${index === 0 && idx === 2 ? 'border-b border-r border-b-black' : ''} ${
                      index === 1 && idx === 1 ? 'border-r' : 'border-b border-r'
                    } w-[30%] border-[#D8D8D8] px-3 py-2 text-[14px]`}
                  >
                    <span className='flex items-center gap-1'>
                      {isInRange(totalVirtualCard, range.range) ? <CheckActiveIcon /> : <RejectIcon />}
                      {range.range}
                    </span>
                  </td>
                  <td
                    className={`${index === 0 && idx === 2 ? 'border-b border-black' : ''} ${
                      index === 1 && idx === 1 ? '' : 'border-b'
                    } w-[30%] border-r-[#D8D8D8] px-3 py-2 text-[14px]`}
                  >
                    {range.rebate}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default CashBack
