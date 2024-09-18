'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from 'pq-ap-lib'
import React from 'react'

const DashboardContent: React.FC = () => {
  const router = useRouter()

  const handlePageRoute = () => {
    router.push('/dashboard')
  }
  
  return (
    <div className='flex w-screen h-screen flex-col justify-between items-center'>
        <Image
          src="/404.jpg"
          width={1000}
          height={100}
          alt="404 page"
        />
      <div className='mb-10'>
        <Button variant='btn-secondary' onClick={handlePageRoute} >
          Go to Home Page
        </Button>
      </div>

    </div>
  )
}

export default DashboardContent
