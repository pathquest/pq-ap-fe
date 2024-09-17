import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

// icons
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'

// Store
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getVendorAgingDaysDrpdwn, setEndDay, setStartDay } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'

interface AgingDaysDropdownProps {
  label?: any
  handleClick: (arg1: any, arg2: any) => void
}

const AgingDaysDropdown: React.FC<AgingDaysDropdownProps> = ({ handleClick, label }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [agingDaysDrpdwnList, setAgingDaysDrpdwnList] = useState<any[]>([])

  const dispatch = useAppDispatch()
  const billsToPayReducer = useAppSelector((state) => state.billsToPayReducer)
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)

  const dropdownRef = useRef<any>(null)

  const handleDropdownToggle = () => {
    setIsOpen((prevOpen) => !prevOpen)
  }

  const handleClickOutside = (event: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // API
  useEffect(() => {
    const fetchVendorAgingDaysDropdown = async () => {
      const params = {
        CompanyId: CompanyId,
        VendorIds: billsToPayReducer.vendorIdList,
        FiterType: billsToPayReducer.agingFilter,
      }
      performApiAction(dispatch, getVendorAgingDaysDrpdwn, params, (responseData: any) => {
        setAgingDaysDrpdwnList(responseData ?? [])
      })
    }

    fetchVendorAgingDaysDropdown()
  }, [CompanyId, billsToPayReducer.vendorIdList, billsToPayReducer.agingFilter])

  useEffect(() => {
    const matchingAction = agingDaysDrpdwnList.find((action) => {
      if (
        (billsToPayReducer.startDay === 0 && billsToPayReducer.endDay === 30 && action.label === '00-30 Days') ||
        (billsToPayReducer.startDay === 31 &&
          (billsToPayReducer.endDay === 60 || billsToPayReducer.endDay === null) &&
          action.label === '31-60 Days') ||
        (billsToPayReducer.startDay === 61 &&
          (billsToPayReducer.endDay === 90 || billsToPayReducer.endDay === null) &&
          action.label === '61-90 Days') ||
        (billsToPayReducer.startDay === 91 && billsToPayReducer.endDay === null && action.label === '90+ Days')
      ) {
        return true
      }
      return false
    })

    if (matchingAction) {
      handleClick(matchingAction.label, matchingAction.value)

      // Update the reducer values based on label
      if (matchingAction.label === '00-30 Days') {
        dispatch(setStartDay(0))
        dispatch(setEndDay(30))
      } else if (matchingAction.label === '31-60 Days') {
        dispatch(setStartDay(31))
        dispatch(setEndDay(60))
      } else if (matchingAction.label === '61-90 Days') {
        dispatch(setStartDay(61))
        dispatch(setEndDay(90))
      } else if (matchingAction.label === '90+ Days') {
        dispatch(setStartDay(91))
        dispatch(setEndDay(null))
      }
    }
  }, [billsToPayReducer.startDay, billsToPayReducer.endDay, agingDaysDrpdwnList])

  return (
    <Dropdown>
      <MenuButton
        ref={dropdownRef}
        className={`flex !items-center !border-none !bg-transparent ${isOpen ? '!text-primary' : ''}`}
        onClick={() => {
          handleDropdownToggle()
        }}
      >
        <span className='text-sm'>{label}</span>
        <span className={`ml-2 text-base ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown />
        </span>
      </MenuButton>
      <Menu className={`z-[6] !-mt-2 !ml-8 !w-[220px]`}>
        {agingDaysDrpdwnList.map((action: any, index: any) => (
          <MenuItem
            key={action.label}
            className='!font-proxima !font-normal !text-black'
            onClick={() => {
              handleClick(action.label, action.value)
              setIsOpen(false)
            }}>
            <Typography type='h6' className='!font-normal'>
              {action.label} | {action.value} bills
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  )
}
export default AgingDaysDropdown