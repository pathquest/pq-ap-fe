import React from 'react'
import CheckActiveIcon from '@/assets/Icons/practice_dashboard/CheckActiveIcon'

function Insights({ InsightsData }: any) {
  const getPreviousMonthYear = () => {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;

    // Format month and year
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      month: monthNames[prevMonth],
    };
  };

  const { month } = getPreviousMonthYear();

  return (
    <div className='flex w-[300px] bg-white z-10 flex-col rounded-md border border-lightSilver p-4'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-center'>
          <span className='text-[14px] font-semibold'>Quick Insights for the {month} Month</span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            Total amount spent for accounts payable is <u>${InsightsData?.TotalAmountSpent == null ? '0.00' : parseFloat(InsightsData?.TotalAmountSpent).toFixed(2)}</u>
          </span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            Total <u>{InsightsData?.NewVendors > 1 ? `${InsightsData?.NewVendors} new vendors` : `${InsightsData?.NewVendors} new vendor`} </u>  added during the month.
          </span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            <u>${InsightsData?.SavedAmount == null ? '0.00' : parseFloat(InsightsData?.SavedAmount).toFixed(2)} saved</u> by paying bills before due date.
          </span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            <u>{InsightsData?.UncategorizedExpence > 1 ? `${InsightsData?.UncategorizedExpence} bills` : `${InsightsData?.UncategorizedExpence} bill`}</u> classified as uncategorized expenses.
          </span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            <u>{InsightsData?.RejectedBills > 1 ? `${InsightsData?.RejectedBills} bills` : `${InsightsData?.RejectedBills} bill`} </u> out of {InsightsData?.TotalBills} <u>rejected</u> by the approver.
          </span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            TAT <u>missed</u> for {InsightsData?.TatMissed > 1 ? `${InsightsData?.TatMissed} bills` : `${InsightsData?.TatMissed} bill`}.
          </span>
        </div>
        <div className='flex items-start'>
          <span>
            <CheckActiveIcon />
          </span>
          <span className='px-2 text-[14px]'>
            <u>{InsightsData?.DisputedBills > 1 ? `${InsightsData?.DisputedBills} bills` : `${InsightsData?.DisputedBills} bill` }</u> flagged as <u>disputed</u> for the discussion with suppliers.
          </span>
        </div>
      </div>
    </div>
  )
}

export default Insights
