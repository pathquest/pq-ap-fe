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
import { getModulePermissions, hasSpecificPermission, hasViewPermission } from './Functions/ProcessPermission'

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
  isHeadingVisible: boolean
  items: {
    name: string
    href: string
    isVisible: boolean
  }[]
}

const Sidebar = ({ isMasterSetting }: SidebarProps): JSX.Element => {
  const router = useRouter()
  const pathname = usePathname()
  const IsFieldMappingSet = localStorage.getItem('IsFieldMappingSet') ?? 'true'

  const divRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const paymentsIconRef = useRef<HTMLDivElement>(null)

  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isPaymentView = getModulePermissions(processPermissionsMatrix, "Payments") ?? {}
  const isBillsToPayView = isPaymentView["Bills to pay"]?.View ?? false;
  const isPaymentStatusView = isPaymentView["Payment Status"]?.View ?? false;

  // Master
  const isDimensionView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "Dimension", "View");
  const isGLAccountView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "GL Account", "View");
  const isAPTermView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "AP Term", "View");
  const isCurrencyView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "Currency", "View");
  const isTaxRateView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "Tax Rate", "View");

  //Setup
  const isAPFieldMappingView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "AP Field Mapping", "View");
  const isNotificationView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Notification", "View");
  const isCloudConfigurationView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Cloud Configuration", "View");
  const isAutomationView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Automation", "View");
  const isPaymentSetupView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Payment Setup", "View");

  const [isCollapsed, setCollapse] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [windowSize, setWindowSize] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [topPosition, setTopPosition] = useState<number>(63)

  const calculateTopPosition = (index: number) => {
    const basePosition = 63
    const incrementPerPosition = 50
    return basePosition + (index * incrementPerPosition)
  }

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
      case 'Approval':
        router.push('/approvals')
        break
      case 'Reports':
        router.push('/reports')
        break
      case 'Vendor':
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
    if (IsFieldMappingSet === 'true') {
      const previousUrl = localStorage.getItem('previousUrl')
      router.push(`${previousUrl}`)
    }
  }

  //Sidebar Data
  const sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon isActive={pathname === "/dashboard" ? true : false} />,
    },
    {
      name: 'Files',
      href: '/history',
      icon: <DocumentHistoryIcon isActive={pathname === "/history" ? true : false} />,
    },
    // {
    //   name: 'Purchase Order',
    //   href: '/purchaseorder',
    //   icon: <PurchaseIcon isActive={pathname === "/purchaseorder" ? true : false} />,
    // },
    {
      name: 'Bills',
      href: '/bills',
      icon: <BillsIcon isActive={pathname.includes('bills') ? true : false} />,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: (
        <span ref={paymentsIconRef}>
          <PaymentsIcon isActive={pathname.includes('payments') ? true : false} />
        </span>
      ),
    },
    {
      name: 'Approval',
      href: '/approvals',
      icon: <ApprovalIcon isActive={pathname === "/approvals" ? true : false} />,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: <ReportsIcon isActive={pathname === "/reports" ? true : false} />,
    },
    {
      name: 'Vendor',
      href: '/vendors',
      icon: <VendorIcon isActive={pathname === "/vendors" ? true : false} />,
    }
  ].filter(item => hasViewPermission(processPermissionsMatrix, item.name))


  useEffect(() => {
    const paymentIndex = sidebarItems.findIndex(item => item.name === 'Payments')
    if (paymentIndex !== -1) {
      setTopPosition(calculateTopPosition(paymentIndex))
    }
  }, [sidebarItems])

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
            key={item.name}
            tabIndex={0}
            className={`pl-[22px] h-[50px] outline-none focus:border-primary focus:bg-whiteSmoke flex cursor-pointer items-center whitespace-nowrap  border-l-[4px] hover:border-primary hover:bg-whiteSmoke
                ${(pathname.includes('bills') && item.name === 'Bills') || (pathname.includes('payments') && item.name === 'Payments')
                ? 'border-primary bg-whiteSmoke text-primary'
                : pathname === item.href
                  ? 'border-primary bg-whiteSmoke text-primary'
                  : 'border-pureWhite'
              }`}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              (e.key === 'Enter') && handleDashboardIconClick(item.name)
            }
            onClick={() => {
              localStorage.removeItem('previousUrl')
              handleDashboardIconClick(item.name)
            }}
          // href={item.href}
          >
            {isCollapsed ? (
              <span className='w-full flex items-center justify-start'>
                <Tooltip position='right' content={item.name} className='!py-0 !pl-0'>
                  {item.icon}
                </Tooltip>
              </span>
            ) : (
              <div className='flex justify-center items-center'>
                <span className='h-full w-6 mr-2'>{item.icon}</span>
                <span className={`pt-1 h-full select-none flex justify-center items-center cursor-pointer text-sm tracking-[0.02em] font-proxima text-darkCharcoal ${pathname == item.href || (pathname.includes('payments') && item.name === 'Payments') ? "text-primary font-bold" : "font-medium"}`}>{item.name}</span>
              </div>
            )}
          </div>
        ))}
      </>
    )
  }

  //Settings Sidebar Data
  const masterItems: SettingsSection[] = [
    {
      heading: 'MASTER',
      isHeadingVisible: (isDimensionView || isGLAccountView || isAPTermView || true) ? true : false,
      items: [
        {
          name: 'Dimensions',
          href: '/master/dimension',
          isVisible: isDimensionView
        },
        {
          name: 'GL Account',
          href: '/master/glaccount',
          isVisible: isGLAccountView
        },
        {
          name: 'AP Term',
          href: '/master/apterm',
          isVisible: isAPTermView
        },
        // {
        //   name: 'Product & Service',
        //   href: '/master/productservice',
        //   isVisible: true
        // },
      ],
    },
    {
      heading: 'PAYMENT SETTING',
      isHeadingVisible: (isCurrencyView || isTaxRateView || isPaymentSetupView) ? true : false,
      items: [
        // {
        //   name: 'Currency',
        //   href: '/paymentsetting/currency',
        //   isVisible: isCurrencyView
        // },
        // {
        //   name: 'Tax Rate',
        //   href: '/paymentsetting/taxrate',
        //   isVisible: isTaxRateView
        // },
        // {
        //   name: 'Payment Method',
        //   href: '/paymentsetting/paymentmethod',
        // },
        {
          name: 'Payment Setup',
          href: '/paymentsetting/paymentsetup',
          isVisible: isPaymentSetupView
        },
      ],
    },
    {
      heading: 'SETUP',
      isHeadingVisible: (isAPFieldMappingView || isNotificationView || isCloudConfigurationView || isAutomationView) ? true : false,
      items: [
        {
          name: 'AP Field Mapping',
          href: '/setup/apfieldmapping',
          isVisible: isAPFieldMappingView
        },
        {
          name: 'Notification',
          href: '/setup/notification',
          isVisible: isNotificationView
        },
        {
          name: 'Cloud Configuration',
          href: '/setup/cloudconfiguration',
          isVisible: isCloudConfigurationView
        },
        {
          name: 'Automation',
          href: '/setup/automation',
          isVisible: isAutomationView
        },
      ],
    },
  ]

  //Settings Sidebar SettingItems
  const SettingItems = ({ pathname }: any) => {
    return (
      <>
        {masterItems.map((item, index) => (
          <div className={`${item.isHeadingVisible ? "block" : "hidden"}`} key={item.heading}>
            <Typography
              type='h6'
              className={`flex items-start pl-[20px] !font-bold !tracking-[0.02em] ${index > 0 ? 'pb-[5px] pt-[20px]' : 'pb-[5px] pt-[13px]'
                }`}
            >
              {item.heading}
            </Typography>
            {item.items.map((subItem) => {
              // const isAutomation = subItem.name == 'Automation'
              const isActive = pathname === subItem.href

              // const paddingClasses = isAutomation ? 'pt-[10px] pb-[20px]' : 'py-[10px]'
              const hoverClasses = 'hover:border-primary hover:bg-whiteSmoke hover:text-primary'
              const borderColorClasses = isActive ? 'border-primary bg-whiteSmoke text-primary' : 'border-pureWhite'
              const className = `${subItem.isVisible ? "flex" : "hidden"} flex items-center border-l-2 border-white ${IsFieldMappingSet === 'true' ? 'cursor-pointer' : 'cursor-default'} py-[10px] pl-[20px] ${hoverClasses} ${borderColorClasses}`
              return (
                <Link href={`${IsFieldMappingSet === 'true' ? subItem.href : ''}`} className={className} key={subItem.name}>
                  <Typography type='h6' className={`${IsFieldMappingSet === 'true' ? 'cursor-pointer' : 'cursor-default'} !tracking-[0.02em]`}>
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
        className={`transition-width duration-300 ease-out ${isLeftSidebarCollapsed && !isMasterSetting ? 'laptop:w-[78px]' : 'laptop:w-[180px]'
          } flex flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-lightSilver text-darkCharcoal laptop:h-screen`}
      >
        <div className={`h-full overflow-y-auto`}>
          <div className={`sticky top-0 flex items-center justify-between ${isOpen && 'z-[7] bg-white'} `}>
            <span className={`!z-10 flex h-[60px] w-full justify-center items-center border-lightSilver bg-white px-6 py-4 text-[24px] font-medium text-primary laptop:border-b`}>
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
                className={`!max-h-fit overflow-hidden absolute flex w-[200px] flex-col top-[59px] z-[7] bg-white  ${isOpen ? styles.expandDiv : styles.collapsedDiv
                  }`}
              >
                {isMasterSetting ? (
                  <>
                    <div className={`sticky flex py-3 ${windowSize <= 1023 ? '' : 'top-[64px]'} justify-start pl-[20px]`}>
                      {IsFieldMappingSet === 'true' && (
                        <span className={`cursor-pointer mr-2.5`} onClick={handleSettingChange}>
                          <ChevronLeftIcon bgColor='whiteSmoke' />
                        </span>
                      )}
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
                {IsFieldMappingSet === 'true' && (
                  <span className={`cursor-pointer mr-2.5`} onClick={handleSettingChange}>
                    <ChevronLeftIcon bgColor='whiteSmoke' />
                  </span>
                )}
                <Typography type='h6' className='flex items-center justify-center text-center !font-bold !tracking-widest'>
                  Configuration
                </Typography>
              </div>
              <div className='custom-scroll h-[calc(100vh-120px)] overflow-auto'>
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
            className={`!h-[66px] outline-none sticky bottom-0 focus:bg-whiteSmoke bg-white py-[30px] pl-[29px] ${isLeftSidebarCollapsed ? 'pr-[50px]' : 'pr-[174px]'
              } cursor-pointer  border-t border-[#E6E6E6]`}
            onClick={handelSidebarCollaped}
            onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) =>
              (e.key === 'Enter') && handelSidebarCollaped()
            }
          >
            <MenuIcon />
          </span>
        )}
      </div>
      <div
        ref={divRef}
        className={`${selectedOption === 'Payments' ? 'overflow-y-clip' : 'overflow-y-auto'} ${selectedOption == 'Payments' ? 'translate-x-0' : '!z-[-10] translate-x-1/2 opacity-0'
          } absolute w-[244px] rounded border border-lightSilver transition-transform duration-300 ease-in-out ${isLeftSidebarCollapsed ? 'left-[78px]' : 'left-[180px]'
          }  z-10 ml-[9px] bg-white`}
        style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)', top: `${topPosition}px` }}
      >
        <div className='absolute left-[-7px] top-[18px] h-[13px] w-[13px] rotate-45 border-b border-l border-lightSilver bg-white ' />
        <div className='w-full  border-b border-lightSilver px-6 py-[12.5px]'>Payments</div>
        <div className={` transition-height w-full duration-[400ms] ease-in-out ${selectedOption == 'Payments' ? `${(isBillsToPayView && isPaymentStatusView) ? "h-[95px]" : "h-[50px]"}  delay-[350ms]` : 'h-0 delay-0 '}`}>
          <div
            tabIndex={selectedOption == 'Payments' ? 0 : -1}
            className={`mainSidebarItem ${isBillsToPayView ? "flex" : "hidden"} cursor-pointer py-[10px] hover:text-primary font-proxima text-darkCharcoal`}
            onClick={() => handlePageRoute('BillsToPay')}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              (e.key === 'Enter') && handlePageRoute('BillsToPay')
            }
          >
            <span className='pl-[27px] pr-5 sidebarIcon'>
              <BillsToPayIcon />
            </span>
            Bills to pay
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
            className={`mainSidebarItem ${isPaymentStatusView ? "flex" : "hidden"} cursor-pointer py-[10px] hover:text-primary font-proxima text-darkCharcoal`}
            onClick={() => handlePageRoute('Status')}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              (e.key === 'Enter') && handlePageRoute('Status')
            }
          >
            <span className='pl-[27px] pr-5 sidebarIcon'>
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