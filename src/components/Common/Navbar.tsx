import BIIcon from '@/assets/Icons/BI'
import HelpIcon from '@/assets/Icons/HelpIcon'
import PQlogoIcon from '@/assets/Icons/PQLogoIcon.js'
import SettingsIcon from '@/assets/Icons/SettingsIcon'
import SyncIcon from '@/assets/Icons/Sync'

import LogoutVector from '@/assets/Icons/VectorLogout'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import CompaniesDropdown from './Dropdown/Dropdown'

import BellIconComponent from '@/app/setup/notification/__components/BellIconComponent'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setNotificationCount } from '@/store/features/auth/authSlice'
import { getNotificationList } from '@/store/features/notification/notificationSlice'

import { WebPubSubClient } from '@azure/web-pubsub-client'
import { Avatar, Tooltip, Typography, Toast } from 'pq-ap-lib'
import SearchComponent from './GlobalSearch/SearchComponent'

import { handleSignOut } from '@/actions/server/auth'
import { useSession } from 'next-auth/react'
import Building from './Dropdown/Icons/Building'

const Navbar = ({ onData }: any) => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  
  const userId = localStorage.getItem('UserId')

  const router = useRouter()
  const pathname = usePathname()

  const settingRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false)
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false)
  const { isRefresh } = useAppSelector((state) => state.user)
  const { notificationCount } = useAppSelector((state) => state.auth)

  const [count, setCount] = useState(notificationCount)

  const dispatch = useAppDispatch()

  const globalSetting = [
    {
      heading: 'Global Setting',
      items: [
        { name: 'Manage Company', href: '/manage/companies' },
        { name: 'Manage Users', href: '/manage/users' },
        { name: 'Manage Roles', href: '/manage/roles' },
      ],
    },
  ]

  const settingsData = [
    {
      heading: 'Masters',
      items: [
        {
          name: 'Dimension',
          href: '/master/dimension',
        },
        {
          name: 'GL Account',
          href: '/master/glaccount',
        },
        {
          name: 'AP Term',
          href: '/master/apterm',
        },
        {
          name: 'Product Service',
          href: '/master/productservice',
        },
        // {
        //   name: 'Customers',
        //   href: '/master/customers',
        // },
      ],
    },
    {
      heading: 'Payment Policies',
      items: [
        {
          name: 'Currency',
          href: '/paymentsetting/currency',
        },
        {
          name: 'Tax Rate',
          href: '/paymentsetting/taxrate',
        },
        // {
        //   name: 'Payment Method',
        //   href: '/paymentsetting/paymentmethod',
        // },
        {
          name: 'Payment Setup',
          href: '/paymentsetting/paymentsetup',
        },
      ],
    },
    {
      heading: 'Setup',
      items: [
        {
          name: 'AP Field Mapping',
          href: '/setup/apfieldmapping',
        },
        {
          name: 'Notification',
          href: '/setup/notification',
        },
        {
          name: 'Cloud Configuration',
          href: '/setup/cloudconfiguration',
        },
        {
          name: 'Automation',
          href: '/setup/automation',
        },
      ],
    },
  ]

  const handleLogout = async () => {
    await handleSignOut()
  }

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (settingRef.current && !settingRef.current.contains(event.target as Node)) {
        setIsSettingOpen(false)
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    },
    [settingRef, helpRef, profileRef]
  )

  const GetNotificationUnReadCount = async () => {
    try {
      const { payload, meta } = await dispatch(getNotificationList())
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          dispatch(setNotificationCount(payload?.ResponseData.UnReadCount))
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (CompanyId) {
      GetNotificationUnReadCount()
    }
  }, [CompanyId])

  useEffect(() => {
    let userId = localStorage.getItem('UserId')
    const client = new WebPubSubClient({
      getClientAccessUrl: async () =>
        (await fetch(`${process.env.REALTIME_NOTIFICATION}/event-stream/get-access-token?userId=${userId}`)).text(),
    })

    const handleConnected = (e: any) => { }

    const handleServerMessage = (data: any) => {
      Toast.success(`${data?.message?.data?.message}`)
      if (data?.message?.data?.company_id === parseInt(`${CompanyId}`)) {
        setCount(() => notificationCount + 1)
      }

    }

   
    async function connect() {
      await client.start()
      client.on('connected', handleConnected)
      client.on('server-message', handleServerMessage)
    }
    connect()

    return () => {
      client.off('connected', handleConnected)
      client.off('server-message', handleServerMessage)
    }

  }, [])

  useEffect(() => {
    dispatch(setNotificationCount(count))
  }, [count])

  useEffect(() => {
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [handleOutsideClick])
  

  const settingsFocusedArr = ['/manage/users', '/manage/roles', '/manage/companies', '/practice-dashboard']
  const organizationFocusedArr = ['/practice-dashboard', '/manage/companies', '/manage/users', '/manage/roles']

  return (
    <>
      <div className='border-b border-lightSilver laptop:h-[64px] laptopMd:h-[64px] lg:h-[64px] xl:h-[64px] hd:h-[64px] 2xl:h-[64px] 3xl:h-[64px]'>
        <div className='grid md:!flex h-full w-full gap-5'>
          {settingsFocusedArr.includes(pathname) && (
            <div key={pathname} className='!w-[90px] flex items-center justify-center border-lightSilver laptop:border-r'>
              <PQlogoIcon isCollapsed={true} />
            </div>
          )}

          <div className='flex h-full w-full items-center justify-center laptop:!w-60 2xl:!w-80 !pl-5'>
            {!settingsFocusedArr.includes(pathname) ? (
              <CompaniesDropdown key={String(isRefresh)} />
            ) : (
              <div className='flex h-10 w-full -ml-10'>
                <div className='flex text-[1.5rem] !w-[30px] items-center justify-center'>
                  <Building />
                </div>
                <div className='flex h-full w-full items-center justify-center px-2'>
                  <span className={`flex h-full w-full font-proxima cursor-pointer items-center pl-1 text-sm text-black tracking-[0.02em]`}> ZALA</span>
                </div>
              </div>
            )}
          </div>

          {!settingsFocusedArr.includes(pathname) && (
            <div className='flex items-center justify-center'>
              <SearchComponent />
            </div>
          )}

          <div className='flex h-full w-full items-center justify-end gap-[15px] pr-5'>
            {!settingsFocusedArr.includes(pathname) && <BellIconComponent />}
            <div
              ref={settingRef}
              className={`relative z-10 flex h-full w-8 2xl:w-10 cursor-pointer items-center justify-center border-b-2 ${isSettingOpen ? 'border-primary bg-whiteSmoke' : 'border-transparent bg-transparent'
                } `}
              onClick={() => {
                setIsSettingOpen(true)
              }}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                (e.key === 'Enter' || e.key === ' ') && setIsSettingOpen(!isSettingOpen)
              }
            >
              {isSettingOpen ? (
                <SettingsIcon />
              ) : (
                <Tooltip content={`Settings`} position='bottom' className='z-10'>
                  <SettingsIcon />
                </Tooltip>
              )}
              {/* Setting Popup */}
              {isSettingOpen && (
                <div
                  style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)' }}
                  className={`flex ${settingsFocusedArr.includes(pathname) ? 'w-44' : 'h-[326px] w-[760px]'
                    } absolute right-0 top-[63px] bg-white`}
                >
                  {globalSetting.map((data) => (
                    <div
                      className={`flex bg-whiteSmoke ${settingsFocusedArr.includes(pathname) ? 'w-full' : 'w-1/4 border-r border-lightSilver '
                        } flex-col gap-4 px-6 py-7`}
                      key={data.heading}
                    >
                      <span className='border-b border-lightSilver pb-3 font-semibold font-proxima tracking-[0.02em]'>{data.heading}</span>
                      {data.items.map((element) => (
                        <Link
                          key={element.name}
                          href={`${element.href}`}
                          className='text-[14px] font-normal hover:text-primary font-proxima tracking-[0.02em]'
                          onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) =>
                            (e.key === 'Enter' || e.key === ' ') && router.push(element.href)
                          }
                        >
                          {element.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                  {!settingsFocusedArr.includes(pathname) &&
                    settingsData.map((data) => (
                      <div
                        className={`flex w-1/4 ${data.heading != 'Payment Policies' && 'pl-6 pr-6'}  flex-col gap-4 py-7`}
                        key={data.heading}
                      >
                        <span className='border-b border-lightSilver pb-3 font-proxima text-[16px] font-bold tracking-[0.02em]'>
                          {data.heading}
                        </span>
                        {data.items.map((element) => (
                          <Link
                            key={element.name}
                            href={`${element.href}`}
                            className='text-[14px] font-normal hover:text-primary font-proxima tracking-[0.02em] '
                            onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) =>
                              (e.key === 'Enter' || e.key === ' ') && router.push(element.href)
                            }
                            onClick={() => {
                              localStorage.setItem('previousUrl', window.location.href)
                              router.push(element.href)
                            }}
                          >
                            {element.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div
              ref={helpRef}
              className={`relative z-10 flex h-full w-8 2xl:w-10 cursor-pointer items-center justify-center border-b-2  ${isHelpOpen ? 'border-primary bg-whiteSmoke' : 'border-transparent bg-transparent'
                } `}
              onClick={() => setIsHelpOpen(true)}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                (e.key === 'Enter' || e.key === ' ') && setIsHelpOpen(!isHelpOpen)
              }
            >
              {isHelpOpen ? (
                <HelpIcon />
              ) : (
                <Tooltip content={`Help Center`} position='bottom' className='z-10'>
                  <HelpIcon />
                </Tooltip>
              )}
              {isHelpOpen && (
                <div
                  tabIndex={0}
                  className='absolute right-0 top-[63px] flex h-12 w-44 items-center bg-white px-3'
                  style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)' }}
                >
                  <Typography type='h6' className='inline-block cursor-pointer hover:font-bold hover:text-primary'>
                    Help
                  </Typography>
                </div>
              )}
            </div>
            <div className='flex h-10 w-8 2xl:w-10 cursor-pointer items-center justify-center'>
              <Tooltip content={`Last Synced`} position='bottom' className='z-10'>
                <SyncIcon />
              </Tooltip>
            </div>
            <div className='flex h-10 w-8 2xl:w-10 cursor-pointer items-center justify-center'>
              <Tooltip content={`Switch to BI`} position='bottom' className='z-10'>
                <BIIcon />
              </Tooltip>
            </div>
            <div
              ref={profileRef}
              className={`relative z-10 flex h-full w-8 2xl:w-10 cursor-pointer items-center justify-center border-b-2  ${isProfileOpen ? 'border-primary bg-whiteSmoke' : 'border-transparent bg-transparent'
                } `}
              onClick={() => {
                setIsProfileOpen(true)
              }}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                (e.key === 'Enter' || e.key === ' ') && setIsProfileOpen(!isProfileOpen)
              }
            >
              {isProfileOpen ? (
                <>
                  {onData && onData?.first_name != '' ? (
                    <Avatar name={`${onData?.first_name} ${onData?.last_name}`} variant='small' />
                  ) : (
                    <Avatar imageUrl='' variant='small' />
                  )}
                </>
              ) : (
                <Tooltip content={`My Account`} position='left' className='z-10 !px-1 !py-0'>
                  {onData && onData?.first_name != '' ? (
                    <Avatar name={`${onData?.first_name} ${onData?.last_name}`} variant='small' />
                  ) : (
                    <Avatar imageUrl='' variant='small' />
                  )}
                </Tooltip>
              )}

              {isProfileOpen && (
                <ul className='absolute right-0 top-[63px] w-44 bg-white' style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                  <Link
                    href='/profile'
                    onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) =>
                      (e.key === 'Enter' || e.key === ' ') && router.push('/profile')
                    }
                  >
                    <li className='flex h-12 w-auto border-b border-b-lightSilver px-3 py-2 hover:bg-lightGray hover:text-primary'>
                      <div className='ml-2 flex items-center justify-center'>
                        <Typography type='label' className='inline-block cursor-pointer text-sm font-normal'>
                          My Profile
                        </Typography>
                      </div>
                    </li>
                  </Link>
                  <li
                    className='flex h-12 w-full select-none rounded-b-md px-3 hover:bg-lightGray'
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent<HTMLLIElement>) => (e.key === 'Enter' || e.key === ' ') && handleLogout()}
                  >
                    <div className='ml-3 flex items-center justify-center'>
                      <LogoutVector />
                    </div>
                    <div className='ml-2 flex select-none items-center justify-center font-normal' onClick={() => handleLogout()}>
                      <Typography type='label' className='inline-block cursor-pointer text-sm hover:text-[#fb2424]'>
                        Logout
                      </Typography>
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
