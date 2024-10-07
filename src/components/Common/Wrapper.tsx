'use client'

import { ReactNode, useEffect, useState } from 'react'
import Sidebar from './Sidebar'

import agent from '@/api/axios'
import { ProfileData } from '@/app/profile/__components/profile-form'
import { usePathname } from 'next/navigation'
import { Toast } from 'pq-ap-lib'
import Navbar from './Navbar'
import { useAppSelector } from '@/store/configureStore'

interface WrapperProps {
  children: ReactNode
  masterSettings?: boolean
}

const Wrapper = ({ children, masterSettings }: WrapperProps): JSX.Element => {
  const pathname = usePathname()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-180px)]')
  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-full laptop:w-[calc(100vw-78px)]' : 'w-full laptop:w-[calc(100vw-180px)]')
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const response = await agent.APIs.getUserProfile()
        const data = response.ResponseData
        setProfileData(data)
      } catch (error) {
        console.error(error)
      }
    }
    getProfileData()
  }, [])

  return (
    <div
      className={`relative w-screen select-none flex-row laptop:flex ${pathname === '/bills' ||
          pathname === '/dashboard' ||
          pathname === '/history' ||
          pathname === '/payments/status' ||
          pathname === '/approvals' ||
          pathname === '/payments/billtopay' ||
          pathname === '/payments/billtopay/aging' ||
          pathname === '/payments/billtopay/aging/days' ||
          pathname === '/vendors' ||
          pathname === '/reports'
          ? 'overflow-hidden'
          : ''
        }`}
    >
      <Toast position='top_center' />
      <div className='flex flex-col bg-white'>
        <Sidebar isMasterSetting={masterSettings} />
      </div>
      <div className='flex h-screen w-full flex-col justify-between bg-white'>
        {/* Navigation */}
        <div className={`sticky top-0 z-[7] bg-white ${tableDynamicWidth}`}>
          <Navbar onData={profileData} />
        </div>

        {/* Main Content */}
        <main className='h-full w-full overflow-auto bg-white'>{children}</main>

        {/* Footer */}
        {/* <footer className='sticky bottom-0 w-full bg-white py-4 '>&nbsp;</footer> */}
      </div>
    </div>
  )
}

export default Wrapper
