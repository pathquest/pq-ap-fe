'use client'

import agent from '@/api/axios'
import BellIcon from '@/assets/Icons/BellIcon'
import CloseIcon from '@/assets/Icons/billposting/ActivityDrawer/CloseIcon'
import MarkAsDoneIcon from '@/assets/Icons/notification/MarkAsDoneIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setNotificationCount } from '@/store/features/auth/authSlice'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import { setFilterFormFields, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import {
  deleteAllNotifications,
  getNotificationList,
  readAllNotifications,
} from '@/store/features/notification/notificationSlice'
import { format, subMonths } from 'date-fns'
import { Badge, Loader, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface Notification {
  Id: number
  Message: string
  CreatedOn: string
  ModuleId: number
  SubModuleType: number
  IsRead: boolean
  Route: string
  ModuleName: string
  RefrenceId: number | null
}

const BellIconComponent = () => {
  const [notificationList, setNotificationList] = useState<Notification[]>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false)
  const [groupedNotifications, setGroupedNotifications] = useState<{ [key: string]: Notification[] }>({})
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null)
  const [hoveredColor, setHoveredColor] = useState<string>('#6E6D7A')
  const [focusColor, setFocusColor] = useState<string>('#6E6D7A')
  const [loading, setLoading] = useState<boolean>(false)
  const [noData, setNoData] = useState<boolean>(false)
  const { selectedCompany } = useAppSelector((state) => state.user)
  const { notificationCount } = useAppSelector((state) => state.auth)
  const notificationRef = useRef<HTMLDivElement>(null)
  const HOST_URL = process.env.HOST_URL
  const dispatch = useAppDispatch()
  const { filterFormFields } = useAppSelector((state) => state.bill)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [notificationRef])

  useEffect(() => {
    if (isNotificationOpen) {
      GetNotificationList()
    } else {
      setNotificationList([])
      setFocusColor('')
    }
  }, [isNotificationOpen])

  useEffect(() => {
    setNoData(false)
  }, [selectedCompany])

  useEffect(() => {
    const grouped: { [key: string]: Notification[] } = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    notificationList.length > 0 &&
      notificationList.forEach((notification) => {
        const notificationDate = new Date(notification.CreatedOn)
        let dateLabel
        if (notificationDate.toDateString() === today.toDateString()) {
          dateLabel = 'Today'
        } else if (notificationDate.toDateString() === yesterday.toDateString()) {
          dateLabel = 'Yesterday'
        } else {
          dateLabel = notificationDate.toDateString()
        }

        if (grouped[dateLabel]) {
          grouped[dateLabel].push(notification)
        } else {
          grouped[dateLabel] = [notification]
        }
      })

    setGroupedNotifications(grouped)
  }, [notificationList])

  // Fetch Notification List Api
  const GetNotificationList = async () => {
    setLoading(true)
    performApiAction(
      dispatch,
      getNotificationList,
      null,
      (responseData: any) => {
        // SuccessData
        dispatch(setNotificationCount(responseData.UnReadCount))
        if (responseData.PortalNotifications.length === 0) {
          setNoData(true)
          setLoading(false)
        } else {
          setNotificationList(responseData.PortalNotifications)
          setLoading(false)
        }
      },
      () => {
        // ErrorData
        setLoading(false)
      }
    )
  }

  // Read All Notification List Api
  const ReadAllNotifications = async (NotificationId: number) => {
    const params = {
      Id: NotificationId,
    }
    performApiAction(dispatch, readAllNotifications, params, () => {
      // SuccessData
      GetNotificationList()
    })
  }

  // Delete All Notification List Api
  const DeleteAllNotifications = async (NotificationId: number) => {
    const params = {
      Id: NotificationId,
    }
    performApiAction(dispatch, deleteAllNotifications, params, () => {
      // SuccessData
      GetNotificationList()
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    const firstDayOfPreviousMonth = subMonths(new Date(), 1)
    const formattedDate = format(firstDayOfPreviousMonth, 'MM/dd/yyyy')
    const formattedCurrentDate = format(new Date(), 'MM/dd/yyyy')

    const { Id, Route, RefrenceId, SubModuleType, ModuleName } = notification
    let newURL = ''
    const buildURL = (base: string | undefined, path: string, id: string | null = null) =>
      id ? `/${base}/${path}/${id}` : `/${base}/${path}`

    const manageRoutes: any = {
      'manage/companies': () => `${HOST_URL}/${Route}`,
      '/bills': () => {
        dispatch(setSelectedProcessTypeFromList(SubModuleType))
        return RefrenceId ? buildURL(HOST_URL, `${Route}/view`, RefrenceId?.toString()) : buildURL(HOST_URL, Route)
      },
      '/billtopay': () => buildURL(HOST_URL, `payments${Route}`, RefrenceId?.toString()),
      '/status': () => buildURL(HOST_URL, `payments${Route}`, RefrenceId?.toString()),
      '/approvals': () => {
        dispatch(setApprovalDropdownFields(SubModuleType))
        if (!RefrenceId) {
          return buildURL(HOST_URL, Route)
        }
        return buildURL(HOST_URL, `${Route}/view`, RefrenceId?.toString())
      },
    }

    if (ModuleName === 'Activities') {
      dispatch(
        setFilterFormFields({
          ft_status: ['1', '2', '4', '6', '8'],
          ft_assignee: '1',
          ft_select_users: [],
          ft_vendor: null,
          ft_datepicker: `${formattedDate} to ${formattedCurrentDate}`,
          ft_location: null,
        })
      )
      newURL = `/bills/view/${RefrenceId}?activity=true`
    } else {
      newURL = manageRoutes[Route]?.() || `${HOST_URL}/404`
    }

    window.location.href = newURL
    ReadAllNotifications(Id)
  }

  const handleOpen = () => {
    setIsNotificationOpen(true)
    setFocusColor('#02B89D')
  }

  const handleClose = () => {
    setNotificationList([])
    setFocusColor('')
    setIsNotificationOpen(false)
  }

  return (
    <div ref={notificationRef} className='h-full'>
      <div
        className={`relative flex h-full w-8 2xl:w-10 cursor-pointer items-center justify-center border-b-2  ${
          isNotificationOpen ? 'border-primary bg-whiteSmoke' : 'border-transparent bg-transparent'
        } `}
        onClick={handleOpen}
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
          (e.key === 'Enter' || e.key === ' ') && setIsNotificationOpen(!isNotificationOpen)
        }
      >
        {isNotificationOpen ? (
          <BellIcon color={focusColor} />
        ) : (
          <Tooltip content={`Notifications`} position='bottom' className='z-10'>
            <BellIcon />
          </Tooltip>
        )}
        <div className='absolute right-1 top-2.5 z-10'>
          <Badge badgetype='error' variant='dot' text={`${notificationCount}`} effect={notificationCount != 0 ? true : false} />
        </div>
      </div>
      {isNotificationOpen && (
        <div
          className='absolute right-[253px] top-[63px] z-10 flex w-[500px] flex-col items-center rounded-md bg-white'
          style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)' }}
        >
          <div className='flex w-full justify-between border-b border-lightSilver p-4'>
            <Typography className='flex items-center !text-[20px] font-medium !text-[#333333]'>Notification</Typography>
            <div className='flex items-center justify-center'>
              {!noData && (
                <div
                  className='flex items-center justify-center'
                  onClick={() => ReadAllNotifications(0)}
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                    (e.key === 'Enter' || e.key === ' ') && ReadAllNotifications(0)
                  }
                >
                  <MarkAsDoneIcon />
                  <Typography
                    type='h6'
                    className='inline-block cursor-pointer pl-2 !text-[14px] !font-bold uppercase text-[#02b89d]'
                  >
                    Mark All As Read
                  </Typography>
                </div>
              )}
              <span
                tabIndex={0}
                className='ml-6 flex cursor-pointer items-center justify-center'
                onClick={handleClose}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
              >
                <CloseIcon width={24} height={24} />
              </span>
            </div>
          </div>

          {loading ? (
            <div className='flex h-[100px] w-full items-center justify-center'>
              <Loader size='sm' helperText />
            </div>
          ) : noData ? (
            <div className='flex h-[100px] w-full items-center justify-center'>
              <Typography className='!text-[14px] !font-bold uppercase'>No notification here</Typography>
            </div>
          ) : (
            <div className='custom-scroll flex max-h-[400px] w-full flex-col items-center overflow-auto'>
              {Object.keys(groupedNotifications).map((notificationDate) => (
                <div key={notificationDate} className='w-full'>
                  <div className='flex py-5'>
                    <div className='my-[8px]  flex h-[0.5px] w-full items-center justify-center bg-lightSilver text-[14px]'>
                      <span className='bg-white px-4 !text-center font-proxima font-semibold text-[#6E6D7A]'>
                        {notificationDate}
                      </span>
                    </div>
                  </div>
                  {groupedNotifications[notificationDate].map((notification) => (
                    <div
                      key={notification.Id}
                      className={`relative flex w-full cursor-pointer justify-between border-b border-b-lightSilver bg-[#F6F6F6] `}
                      onMouseEnter={() => setHoveredNotification(notification.Id)}
                      onMouseLeave={() => setHoveredNotification(null)}
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                        (e.key === 'Enter' || e.key === ' ') && handleNotificationClick(notification)
                      }
                    >
                      <div className='flex flex-col px-5 pt-4' onClick={() => handleNotificationClick(notification)}>
                        <Typography className='!text-[14px] !font-bold !text-[#333333]'>{notification.ModuleName}</Typography>
                        <Typography className='!font-proxima !text-[14px]'>{notification.Message}</Typography>
                        <Typography className='py-[10px] !text-[12px] text-[#6E6D7A]'>
                          {new Date(notification.CreatedOn + ' UTC').toLocaleDateString([], {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                          {', '}
                          {new Date(notification.CreatedOn + ' UTC').toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </Typography>
                      </div>
                      {hoveredNotification === notification.Id && (
                        <div
                          className='absolute bottom-0 right-0 mb-1 mr-2 cursor-pointer'
                          onClick={() => DeleteAllNotifications(notification.Id)}
                          onMouseEnter={() => setHoveredColor('#ff0000')}
                          onMouseLeave={() => setHoveredColor('#6E6D7A')}
                        >
                          <Tooltip position='left' content='Remove' className='!z-10 !p-1 !font-proxima !text-[14px]'>
                            <CloseIcon width={24} height={24} color={hoveredColor} />
                          </Tooltip>
                        </div>
                      )}
                      {!notification.IsRead && (
                        <div className='px-5 pt-4'>
                          <span className={`flex !h-[8px] !w-[8px] rounded-full bg-primary `}></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div
            className={`bottom-0 flex w-full items-center justify-center rounded-b-md bg-white ${
              noData && 'pointer-events-none'
            }  border-t border-lightSilver px-5 py-[15px] `}
            onClick={() => DeleteAllNotifications(0)}
          >
            <span
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                (e.key === 'Enter' || e.key === ' ') && DeleteAllNotifications(0)
              }
              className={`cursor-pointer font-proxima text-[14px] font-bold uppercase ${
                noData ? 'text-[#6E6D7A]' : 'text-primary'
              }`}
            >
              Clear All
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BellIconComponent
