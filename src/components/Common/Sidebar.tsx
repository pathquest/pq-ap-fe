'use client'
import ApprovalIcon from '@/assets/Icons/ApprovalsIcon'
import BillsIcon from '@/assets/Icons/BillsIcon'
import BillsToPayIcon from '@/assets/Icons/BillsToPayIcon'
import CheckCutIcon from '@/assets/Icons/CheckCutIcon'
import ChevronLeftIcon from '@/assets/Icons/ChevronLeftIcon'
import DashboardIcon from '@/assets/Icons/DashboardIcon'
import MenuIcon from '@/assets/Icons/MenuIcon'
import PQlogoIcon from '@/assets/Icons/PQLogoIcon.js'
import PaymentStatusIcon from '@/assets/Icons/PaymentStatusIcon'
import PaymentsIcon from '@/assets/Icons/PaymentsIcon'
import PurchaseIcon from '@/assets/Icons/PurchaseIcon'
import ReportsIcon from '@/assets/Icons/ReportsIcon'
import VendorIcon from '@/assets/Icons/VendorIcon'
import DocumentHistoryIcon from '@/assets/Icons/DocumentHistoryIcon'

import styles from '@/assets/scss/styles.module.scss'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setLeftSidebarCollapsed } from '@/store/features/auth/authSlice'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface SidebarProps {
  isMasterSetting?: boolean
}

//Sidebar Props
interface SidebarItem {
  name: string
  href: string
  icon: any
}

//Settings Sidebar Props
interface SettingsSection {
  heading: string
  items: {
    name: string
    href: string
  }[]
}

const Sidebar = ({ isMasterSetting }: SidebarProps): JSX.Element => {
  const router = useRouter()
  const pathname = usePathname()

  const divRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const paymentsIconRef = useRef<HTMLDivElement>(null)

  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const [isCollapsed, setCollapse] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [windowSize, setWindowSize] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [topPosition, setTopPosition] = useState<number>(245)

  const handleDashboardIconClick = (value: any) => {
    switch (value) {
      case 'Dashboard':
        router.push('/dashboard')
        break
      case 'Files':
        router.push('/history')
        break
      case 'Purchase Order':
        router.push('/purchaseorder')
        break
      case 'Bills':
        router.push('/bills')
        break
      case 'Payments':
        setSelectedOption(value)
        break
      case 'Approvals':
        router.push('/approvals')
        break
      case 'Reports':
        router.push('/reports')
        break
      case 'Vendors':
        router.push('/vendors')
        break
      default:
        break
    }
  }

  const handleResize = () => {
    setWindowSize(window.innerWidth)
  }

  useEffect(() => {
    setWindowSize(window.innerWidth)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [isLeftSidebarCollapsed])

  const handleSettingChange = () => {
    const previousUrl = localStorage.getItem('previousUrl')
    router.push(`${previousUrl}`)
  }

  //Sidebar Data
  const sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      name: 'Files',
      href: '/history',
      icon: <DocumentHistoryIcon />,
    },
    // {
    //   name: 'Purchase Order',
    //   href: '/purchaseorder',
    //   icon: <PurchaseIcon />,
    // },
    {
      name: 'Bills',
      href: '/bills',
      icon: <BillsIcon />,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: (
        <span ref={paymentsIconRef}>
          <PaymentsIcon />
        </span>
      ),
    },
    {
      name: 'Approvals',
      href: '/approvals',
      icon: <ApprovalIcon />,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: <ReportsIcon />,
    },
    {
      name: 'Vendors',
      href: '/vendors',
      icon: <VendorIcon />,
    }
  ]

  const handlePageRoute = (value: any) => {
    switch (value) {
      case 'Status':
        router.push('/payments/status')
        break
      case 'BillsToPay':
        router.push('/payments/billtopay')
        break
      default:
        break
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      const selectDropdownRef = divRef.current && divRef.current.contains(event.target as Node)
      if (!selectDropdownRef) {
        setSelectedOption('')
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sidebarElement = sidebarRef.current
      const paymentsIconElement = paymentsIconRef.current

      if (sidebarElement && paymentsIconElement) {
        const sidebarScrollTop = sidebarElement.scrollTop
        const paymentsIconTop = paymentsIconElement.offsetTop

        const estimatedPaymentsIconTop = paymentsIconTop - sidebarScrollTop - 15
        setTopPosition(estimatedPaymentsIconTop)
        setSelectedOption('')
      }
    }

    if (sidebarRef.current) {
      sidebarRef.current.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  //Sidebar DashboardItems
  const DashboardItems = ({ pathname, isCollapsed }: any) => {
    return (
      <>
        {sidebarItems.map((item, index) => (
          <div
            onClick={() => {
              localStorage.removeItem('previousUrl')
              handleDashboardIconClick(item.name)
            }}
            key={item.name}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              (e.key === 'Enter' || e.key === ' ') && handleDashboardIconClick(item.name)
            }
            // href={item.href}
            className={`mb-1 flex cursor-pointer items-center whitespace-nowrap ${isCollapsed ? 'pl-4' : 'pl-[27px]'
              } border-l-[4px] hover:border-primary hover:bg-whiteSmoke
       ${(pathname.includes('bills') && item.name === 'Bills') || (pathname.includes('payments') && item.name === 'Payments')
                ? 'border-primary bg-whiteSmoke'
                : pathname === item.href
                  ? 'border-primary bg-whiteSmoke'
                  : 'border-pureWhite'
              }
       `}
          >
            {isCollapsed ? (
              <span className='pt-[16px] pb-[13.5px] pl-[10.5px]'>
                <Tooltip position='right' content={item.name} className='!py-0 !pl-0'>
                  {item.icon}
                </Tooltip>
              </span>
            ) : (
              <div className='flex items-center'>
                <span className='py-[17.68px]'>{item.icon}</span>
                <span className='select-none py-[14.5px] pl-[10px]'>
                  <Typography type='h6'>{item.name}</Typography>
                </span>
              </div>
            )}
          </div>
        ))}
      </>
    )
  }

  //Settings Sidebar Data
  const settings_data: SettingsSection[] = [
    {
      heading: 'MASTER',
      items: [
        {
          name: 'Dimensions',
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
          name: 'Product & Service',
          href: '/master/productservice',
        },
      ],
    },
    {
      heading: 'PAYMENT SETTING',
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
      heading: 'SETUP',
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

  //Settings Sidebar SettingItems
  const SettingItems = ({ pathname }: any) => {
    return (
      <>
        {settings_data.map((item, index) => (
          <div key={item.heading}>
            <Typography
              type='h6'
              className={`flex items-start pl-[20px] !font-bold !tracking-[0.02em] ${index > 0 ? 'pb-[5px] pt-[20px]' : 'pb-[5px] pt-[13px]'
                }`}
            >
              {item.heading}
            </Typography>
            {item.items.map((subItem) => {
              const isAutomation = subItem.name == 'Automation'
              const isActive = pathname === subItem.href

              const paddingClasses = isAutomation ? 'pt-[10px] pb-[20px]' : 'py-[10px]'
              const hoverClasses = 'hover:border-primary hover:bg-whiteSmoke hover:text-primary'
              const borderColorClasses = isActive ? 'border-primary bg-whiteSmoke text-primary' : 'border-pureWhite'
              const className = `flex items-center border-l-2 border-white ${paddingClasses} pl-[20px] ${hoverClasses} ${borderColorClasses}`
              return (
                <Link href={`${subItem.href}`} className={className} key={subItem.name}>
                  <Typography type='h6' className={` cursor-pointer !tracking-[0.02em]`}>
                    {subItem.name}
                  </Typography>
                </Link>
              )
            })}
          </div>
        ))}
      </>
    )
  }

  const handelSidebarCollaped = () => {
    setCollapse(!isCollapsed)
    dispatch(setLeftSidebarCollapsed(!isLeftSidebarCollapsed))
  }

  return (
    <>
      {/* Sidebar Dashboard */}
      <div
        ref={sidebarRef}
        className={`transition-width duration-300 ease-out ${isLeftSidebarCollapsed && !isMasterSetting ? 'laptop:w-[85px]' : 'laptop:w-[200px]'
          } flex flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-lightSilver text-darkCharcoal laptop:h-screen`}
      >
        <div className={`h-full overflow-y-auto`}>
          <div className={`sticky top-0 flex items-center justify-between ${isOpen && 'z-[7] bg-white'} `}>
            <span
              className={`!z-10 flex h-16 w-full items-center border-lightSilver bg-white px-6 py-4 text-[24px] font-medium text-primary laptop:border-b`}
            >
              <PQlogoIcon isCollapsed={isLeftSidebarCollapsed && !isMasterSetting} />
            </span>
            <span className='laptop:hidden'>
              <button
                className='group flex h-12 w-12 flex-col items-center justify-center rounded px-3'
                onClick={() => {
                  setIsOpen(!isOpen)
                }}
              >
                <div
                  className={`ease my-0.5 h-0.5 w-4 transform rounded-full bg-darkCharcoal transition duration-300 ${isOpen ? 'translate-y-3 rotate-45 opacity-50 group-hover:opacity-100' : 'opacity-50 group-hover:opacity-100'
                    }`}
                />
                <div
                  className={`ease my-0.5 h-0.5 w-4 transform rounded-full bg-darkCharcoal transition duration-300 ${isOpen ? 'opacity-0' : 'opacity-50 group-hover:opacity-100'
                    }`}
                />
                <div
                  className={`ease my-0.5 h-0.5 w-4 transform rounded-full bg-darkCharcoal transition duration-300 ${isOpen ? '-translate-y-3 -rotate-45 opacity-50 group-hover:opacity-100' : 'opacity-50 group-hover:opacity-100'
                    }`}
                />
              </button>
            </span>
          </div>

          {windowSize <= 991 ? (
            <>
              <div
                className={`absolute flex w-[183px] flex-col ${isMasterSetting ? 'top-[64px]' : 'top-[79px]'} z-[7]  bg-white  ${isOpen ? styles.expandDiv : styles.collapsedDiv
                  }`}
              >
                {isMasterSetting ? (
                  <>
                    <div className={`sticky flex py-3 ${windowSize <= 1023 ? '' : 'top-[64px]'} justify-start pl-[20px]`}>
                      <span className=' mr-2.5 cursor-pointer' onClick={handleSettingChange}>
                        <ChevronLeftIcon bgColor='whiteSmoke' />
                      </span>
                      <Typography type='h6' className='flex items-center justify-center text-center !font-bold'>
                        Configuration
                      </Typography>
                    </div>
                    <div
                      className={`absolute top-[79px] z-[7] flex flex-col  bg-white  ${isOpen ? styles.expandDiv : styles.collapsedDiv
                        }`}
                    ></div>
                    <SettingItems pathname={pathname} />
                  </>
                ) : (
                  <DashboardItems pathname={pathname} isCollapsed={isLeftSidebarCollapsed} />
                )}
              </div>
            </>
          ) : isMasterSetting ? (
            <>
              <div className='sticky top-[64px] flex justify-start bg-white py-3 pl-[20px]'>
                <span className=' mr-2.5 cursor-pointer' onClick={handleSettingChange}>
                  <ChevronLeftIcon bgColor='whiteSmoke' />
                </span>
                <Typography type='h6' className='flex items-center justify-center text-center !font-bold !tracking-widest'>
                  Configuration
                </Typography>
              </div>
              <div className=' custom-scroll h-5/6 overflow-auto'>
                <SettingItems pathname={pathname} />
              </div>
            </>
          ) : (
            <div className='overflow-y-auto h-[calc(100vh-140px)]'>
              <DashboardItems pathname={pathname} isCollapsed={isLeftSidebarCollapsed} />
            </div>
          )}
        </div>
        {/* Collapsed Icon  */}
        {windowSize >= 992 && !isMasterSetting && (
          <span
            tabIndex={0}
            className={`sticky bottom-0 bg-white py-[30px] pl-[29px] ${isLeftSidebarCollapsed ? 'pr-[50px]' : 'pr-[174px]'
              } cursor-pointer  border-t border-[#E6E6E6]`}
            onClick={handelSidebarCollaped}
            onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) =>
              (e.key === 'Enter' || e.key === ' ') && handelSidebarCollaped()
            }
          >
            <MenuIcon />
          </span>
        )}
      </div>

      <div
        ref={divRef}
        className={`${selectedOption === 'Payments' ? 'overflow-y-clip' : 'overflow-y-auto'} ${selectedOption == 'Payments' ? 'translate-x-0' : '!z-[-10] translate-x-1/2 opacity-0'
          } absolute w-[244px] rounded border border-lightSilver transition-transform duration-300 ease-in-out ${isLeftSidebarCollapsed ? 'left-[85px]' : 'left-[200px]'
          }  z-10 ml-[9px] bg-white`}
        style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)', top: `${topPosition}px` }}
      >
        <div className='absolute left-[-7px] top-[18px] h-[13px] w-[13px] rotate-45 border-b border-l border-lightSilver bg-white ' />
        <div className='w-full  border-b border-lightSilver px-6 py-[12.5px]'>Payments</div>
        <div
          className={`transition-height w-full duration-[400ms] ease-in-out ${selectedOption == 'Payments' ? 'h-[95px] delay-[350ms]' : 'h-0 delay-0 '
            }`}
        >
          <div
            tabIndex={selectedOption == 'Payments' ? 0 : -1}
            className='flex cursor-pointer py-[10px] hover:text-primary'
            onClick={() => handlePageRoute('BillsToPay')}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              (e.key === 'Enter' || e.key === ' ') && handlePageRoute('BillsToPay')
            }
          >
            <span className='pl-[27px] pr-5'>
              <BillsToPayIcon />
            </span>
            Bill to pay
          </div>
          {/* <div
            tabIndex={selectedOption == 'Payments' ? 0 : -1}
            className='pointer-events-none flex cursor-pointer py-[10px] hover:text-primary'
          >
            <span className='pl-[27px] pr-5'>
              <CheckCutIcon />
            </span>
            Check Cut
          </div> */}
          <div
            tabIndex={selectedOption == 'Payments' ? 0 : -1}
            className='flex cursor-pointer py-[10px] hover:text-primary'
            onClick={() => handlePageRoute('Status')}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              (e.key === 'Enter' || e.key === ' ') && handlePageRoute('Status')
            }
          >
            {' '}
            <span className='pl-[27px] pr-5'>
              <PaymentStatusIcon />
            </span>
            Payment Status
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
