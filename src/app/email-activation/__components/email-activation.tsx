'use client'
import BackArrow from '@/assets/Icons/BackArrow'
import EmailIcon from '@/assets/Icons/Email'
import Footer from '@/components/Footer'
import { emailActivation } from '@/utils/local'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Typography } from 'pq-ap-lib'

export default function EmailActivation() {
  const Email = useSearchParams()
  const email = Email.get('email')

  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center px-2'>
        <span className='absolute top-0 pt-5'>
          <Image src='/logo.png' alt='Logo' className='w-[194px] hd:w-[200px] 2xl:w-[200px]' width={200} height={50} priority />
        </span>
        <span className='flex items-center justify-center'>
          <EmailIcon />
        </span>

        <Typography type='h3' className='pt-4 hd:pt-5 2xl:pt-5  text-center font-bold text-primary tracking-wide'>
          {emailActivation?.title}
        </Typography>

        <Typography type='h5' className='pt-2.5  text-center !font-light font-proxima tracking-wide'>
          {emailActivation?.subTitle}
        </Typography>

        <Typography type='h6' className='pb-2 text-center !font-bold text-primary font-proxima tracking-[0.02em]'>
          {email}
        </Typography>

        <div className='backLoignWrapper flex justify-center pt-3 '>
          <Link href='signin'>
            <div className='backArrow flex items-center justify-center'>
              <BackArrow />
              <div className='ml-2.5  '>
                <Typography type='text' className='!text-sm !font-normal text-primary  '>
                  {emailActivation?.backButton}
                </Typography>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <span className='absolute bottom-0 left-0 w-full'>
        <Footer />
      </span>
    </>
  )
}
