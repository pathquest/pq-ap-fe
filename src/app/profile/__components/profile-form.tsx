/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import agent from '@/api/axios'
import ChevronLeftIcon from '@/assets/Icons/ChevronLeftIcon'
import Mail from '@/assets/Icons/profile/Mail'
import Location from '@/assets/Icons/profile/Location'
import Call from '@/assets/Icons/profile/Call'
import AccountCircle from '@/assets/Icons/profile/AccountCircle'
import Drawer from '@/components/Drawer/Drawer'
import DrawerOverlay from '@/components/Drawer/DrawerOverlay'
import NavBar from '@/components/Navbar'

import { Avatar, Button, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getUserImage } from '@/store/features/profile/profileSlice'
import { useAppDispatch } from '@/store/configureStore'

export interface ProfileData {
  first_name: string
  last_name: string
  phone: string
  email: string
  address: string
  country_id: string
  country: string
  state_id: string
  state: string
  city_id: string
  city: string
  postal_code: string
  timezone: string
  time_zone: string
  products: Product[]
  user_image?: string
}

export interface Product {
  name: string
}

const ProfileForm: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [edit, setEdit] = useState<string>('')
  const [isOpen, setOpen] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  const globalData = (data: any) => {
    data?.user_image && onGetUserImage(data?.user_image)
    setProfileData(data)
  }

  //Get User Image API
  const onGetUserImage = (imageNames: string) => {
    const params = {
      fileName: imageNames,
    }
    performApiAction(dispatch, getUserImage, params, (responseData: any) => {
      setImagePreview(responseData)
    })
  }

  const userConfig = async () => {
    try {
      const response = await agent.APIs.getUserConfig()
      if (response.ResponseStatus === 'Success') {
        localStorage.setItem('UserId', response.ResponseData.UserId)
        localStorage.setItem('OrgId', response.ResponseData.OrganizationId)
        localStorage.setItem('IsAdmin', response.ResponseData.IsAdmin)
        localStorage.setItem('IsOrgAdmin', response.ResponseData.IsOrganizationAdmin)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (arg1: boolean, arg2: string) => {
    setOpen(arg1)
    setEdit(arg2)
  }

  useEffect(() => {
    userConfig()
  }, [])

  return (
    <div className={`h-screen overflow-y-auto`}>
      <DrawerOverlay isOpen={isOpen} handleEdit={handleEdit} />
      <Drawer isOpen={isOpen} edit={edit} handleEdit={handleEdit} profileData={profileData} />
      {/* Navigation Bar */}
      <NavBar onData={globalData} isFormOpen={isOpen} />
      <div className='relative flex !flex-col items-center justify-center pb-5'>
        <div className='relative flex h-36 w-full bg-[#02B89D]'>
          <div className='flex items-center justify-start pl-[148px]'>
            <span className='mr-2.5 cursor-pointer' onClick={() => router.push('/manage/companies')}>
              <ChevronLeftIcon bgColor='whiteSmoke' />
            </span>
          </div>
          <div className='absolute bottom-[-50px] left-1/2 -translate-x-1/2 transform'>
            <div className='flex h-28 w-28 items-center justify-center rounded-full bg-white'>
              {profileData && profileData?.user_image !== '' ? (
                <Avatar
                  imageUrl={imagePreview}
                  variant='large'
                  className='!h-[108px] !w-[110px]'
                />
              ) : profileData && profileData?.first_name !== '' ? (
                <Avatar
                  imageUrl={''}
                  name={`${profileData?.first_name} ${profileData?.last_name}`}
                  variant='large'
                  className='!h-[103px] !w-[100px]'
                />
              ) : (
                <Avatar imageUrl={''} variant='large' className='!h-[103px] !w-[100px]' />
              )}
            </div>
          </div>
        </div>

        <div className='flex w-full flex-col items-center justify-center'>
          <div className='mt-16 flex w-[45%] justify-between gap-2'>
            <div className='flex w-1/2 flex-col gap-7'>
              <div className='flex gap-3'>
                <span className='flex items-center'>
                  <AccountCircle />
                </span>
                <Typography className='text-[16px] text-darkCharcoal tracking-[0.02em]'>
                  {profileData?.first_name} {profileData?.last_name}
                </Typography>
              </div>
              <div className='flex gap-3'>
                <span className='flex items-center'>
                  <Mail />
                </span>
                <Typography className='text-[16px] text-darkCharcoal'>{profileData?.email}</Typography>
              </div>
            </div>
            <div className='flex w-1/2 flex-col gap-7'>
              <div className='flex gap-3'>
                <span className='flex items-center'>
                  <Call />
                </span>
                <Typography className='text-[16px] text-darkCharcoal'>{profileData?.phone}</Typography>
              </div>
              <div className='flex gap-3'>
                <span className='flex items-center'>
                  <Location />
                </span>
                <Typography className='flex-wrap text-[16px] text-darkCharcoal'>{profileData?.address ?? '-'}</Typography>
              </div>
            </div>
          </div>

          <Button
            tabIndex={0}
            className={`mt-8 flex h-9 w-36 items-center justify-center rounded-full`}
            variant='btn-primary'
            disabled={profileData === null ? true : false}
            onClick={() => handleEdit(true, 'profile')}
          >
            <Typography type='h6' className='!text-[14px] !font-semibold !uppercase !tracking-[0.02em]'>
              Edit Profile
            </Typography>
          </Button>

          <div className='mt-8 flex w-[50%] flex-col items-center border-t border-[#D8D8D8] p-5'>
            <span className='text-[18px] font-semibold !uppercase'>Profile Password</span>
            <span className='flex pt-5 text-center text-[14px] text-[#6E6D7A]'>
              Changing your password will sign you out of all your devices. You will need to enter your new password on all your
              devices.
            </span>
            <Button
              tabIndex={0}
              className={`mt-8 flex h-9 w-48 items-center justify-center rounded-full`}
              variant='btn-outline-primary'
              onClick={() => {
                handleEdit(true, 'password')
              }}
            >
              <Typography type='h6' className='!text-[14px] !font-semibold !uppercase !tracking-[0.02em]'>
                Change Password
              </Typography>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
