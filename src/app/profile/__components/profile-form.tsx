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
import { useRouter, useSearchParams } from 'next/navigation'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getUserImage, setOrganizationName, setOrgPermissionsMatrix, setProcessPermissionsMatrix, setRoleId } from '@/store/features/profile/profileSlice'
import { useAppDispatch } from '@/store/configureStore'
import { useSession } from 'next-auth/react'
import { ssoUrl } from '@/api/server/common'
import { handleTokenSave } from '@/actions/server/auth'
import { permissionGetList } from '@/store/features/role/roleSlice'
import { processPermissions } from '@/components/Common/Functions/ProcessPermission'

export interface ProfileData {
  id:string
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

const ProfileForm = ({ session }: any) => {
  const user = session ? session?.user : {}
  const token = session?.user?.access_token
  const profilePreviousUrl = localStorage.getItem('profilePreviousUrl') ?? ''

  const router = useRouter()
  const { update } = useSession()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('token') ?? ''

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
        getRolePermissionData(response.ResponseData.RoleId)
        dispatch(setRoleId(response.ResponseData.RoleId))
        await update({
          ...user,
          email:response.ResponseData.UserEmail,
          org_id: response.ResponseData.OrganizationId,
          org_name: response.ResponseData.OrganizationName,
          user_id: response.ResponseData.UserId,
          is_admin: response.ResponseData.IsAdmin,
          is_organization_admin: response.ResponseData.IsOrganizationAdmin,
          role_id: response.ResponseData.RoleId
        })

        dispatch(setOrganizationName(response.ResponseData.OrganizationName))

        localStorage.setItem('UserId', response.ResponseData.UserId)
        localStorage.setItem('OrgId', response.ResponseData.OrganizationId)
        localStorage.setItem('IsAdmin', response.ResponseData.IsAdmin)
        localStorage.setItem('IsOrgAdmin', response.ResponseData.IsOrganizationAdmin)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getRolePermissionData = (roleId: any) => {
    const params = {
      RoleId: roleId ?? 0,
    }
    performApiAction(dispatch, permissionGetList, params, (responseData: any) => {
      const processedData = processPermissions(responseData);
      dispatch(setOrgPermissionsMatrix(processedData));
      dispatch(setProcessPermissionsMatrix(processedData));
    })
  }

  const handleEdit = (arg1: boolean, arg2: string) => {
    setOpen(arg1)
    setEdit(arg2)
  }

  const fetchUserData = async () => {
    userConfig()
  }

  useEffect(() => {
    fetchUserData()
  }, [urlToken])

  return (
    <div className={`h-screen overflow-y-auto`}>
      <DrawerOverlay isOpen={isOpen} handleEdit={handleEdit} />
      <Drawer isOpen={isOpen} edit={edit} handleEdit={handleEdit} profileData={profileData} />
      {/* Navigation Bar */}
      <NavBar onData={globalData} isFormOpen={isOpen} />
      <div className='relative flex !flex-col items-center justify-center pb-5'>
        <div className={`relative flex h-36 w-full items-center ${profilePreviousUrl ? 'justify-start' : 'justify-center'} bg-lightGray`}>
          {profilePreviousUrl ? (
            <div className='flex items-center !justify-start pl-[148px]'>
              <span className='mr-2.5 cursor-pointer' onClick={() => {
                router.push(`${profilePreviousUrl}`)
                localStorage.removeItem('profilePreviousUrl')
              }}>
                <ChevronLeftIcon bgColor='white' />
              </span>
            </div>
          ) : (
          <div
            className={`absolute rounded-md justify-center font-semibold items-center flex bg-[#02B89D] w-[50%] p-4 text-white top-0 select-none animate-slideDown`}
          >
            We're happy to see you on board! <u onClick={() => router.push('/manage/companies')} className='cursor-pointer pl-1'>Click here</u> &nbsp; to start with the process.
          </div>
          )}

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

          <div className='mt-8 flex w-[50%] flex-col items-center border-t border-lightSilver p-5'>
            <span className='text-[18px] font-semibold !uppercase'>Profile Password</span>
            <span className='flex pt-5 text-center text-[14px] text-[#6E6D7A]'>
              Changing your password will sign you out of all devices. Please log in again with the new password on each device.
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
