'use client'

import agent from '@/api/axios'
import { ProfileData } from '@/app/profile/__components/profile-form'
import { Toast } from 'pq-ap-lib'
import React, { ReactNode, useEffect, useState } from 'react'
import Navbar from './Navbar'

interface WrapperProps {
  children: ReactNode
  onData?: any
}

const WrapperManage: React.FC<WrapperProps> = ({ children, onData }: any) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const response = await agent.APIs.getUserProfile()
        const data = response.ResponseData
        setProfileData(data)
        onData(data)
      } catch (error) {
        console.error(error)
      }
    }

    getProfileData()
  }, [])

  return (
    <div className='flex h-screen w-full select-none flex-col justify-between min-[1024px]:flex'>
      <Toast position='top_center' />

      {/* Navigation */}
      <div className='sticky top-0 z-[7] w-full bg-white'>
        <Navbar onData={profileData} />
      </div>

      {/* Main Content */}
      <main className='h-full w-full overflow-auto bg-white'>{children}</main>
    </div>
  )
}

export default WrapperManage
