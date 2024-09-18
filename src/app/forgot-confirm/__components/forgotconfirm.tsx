'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Typography } from 'pq-ap-lib'
import BackArrow from '@/assets/Icons/BackArrow'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/Footer'
import { forgotConfirm } from '@/utils/local'

export default function ForgotConfirm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <div className='forgetWrapper flex flex-col items-center pt-5'>
        <Image src='/logo.png' alt='Logo' width={194} height={100} priority />

        <Typography type='h3' className='pb-2 pt-14 font-bold capitalize'>
          {forgotConfirm?.title}
        </Typography>

        <div className='content mb-2.5 text-[14px] tracking-[0.28px]'>
          {forgotConfirm?.message}
          <span className='text-primary'> {email}. </span>
        </div>

        <div className='flex max-w-[450px] items-center justify-center text-center text-[14px] tracking-[0.28px] xs:!px-5 md:!px-0'>
          {forgotConfirm?.description}
        </div>

        <div className='backLoignWrapper flex justify-center pt-5 '>
          <Link href='signin'>
            <div className='backArrow  flex items-center justify-center'>
              <BackArrow />
              <div className='ml-2.5  '>
                <Typography type='text' className='!text-[14px] !font-normal text-primary  '>
                  {forgotConfirm?.backButton}
                </Typography>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
