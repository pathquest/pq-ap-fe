import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='sticky bottom-0 bg-white flex items-center justify-between border-t border-[#E6E6E6] py-[21px] pl-[41px] pr-[27px] text-sm text-darkCharcoal smFooter:flex-col smFooter:gap-3 lgFooter:flex-row'>
      <span className='text-sm font-proxima'>PathQuest&#174;. All Rights Reserved.</span>
      <span>
        By logging in, you agree to our{' '}
        <Link href='https://pathquest.com/privacy' className='text-primary underline'>
          <label className='font-semibold text-sm font-proxima cursor-pointer'>Privacy Policy</label>
        </Link>{' '}
        and{' '}
        <Link href='https://pathquest.com/terms/' className='text-primary underline cursor-pointer'>
          <label className='font-semibold text-sm font-proxima cursor-pointer'>Client Agreement Service</label>
        </Link>
      </span>
    </div>
  )
}

export default Footer
