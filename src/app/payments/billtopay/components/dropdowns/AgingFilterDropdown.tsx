import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

// icons
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'

// Store
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setAgingFilterValue } from '@/store/features/billsToPay/billsToPaySlice'

interface ActionsProps {
  label?: any
  actions: any
  handleClick: (arg1: string, arg2: number) => void
}

const AgingFilterDropdwon: React.FC<ActionsProps> = ({ actions, handleClick, label }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<any>(null)
  const dispatch = useAppDispatch()
  const billsToPayReducer = useAppSelector((state) => state.billsToPayReducer)

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

  useEffect(() => {
    const matchingAction = actions.find((action: { label: string }) => {
      if (
        (billsToPayReducer.agingFilter === 0 && action.label === 'By Due Date') ||
        (billsToPayReducer.agingFilter === 1 && action.label === 'By Invoice Date') ||
        (billsToPayReducer.agingFilter === 2 && action.label === 'By GL Posting Date')
      ) {
        return true
      }
      return false
    })

    if (matchingAction) {
      handleClick(matchingAction.label, matchingAction.value)

      // Update the reducer values based on label
      if (matchingAction.label === 'By Due Date') {
        dispatch(setAgingFilterValue(0))
      } else if (matchingAction.label === 'By Invoice Date') {
        dispatch(setAgingFilterValue(1))
      } else if (matchingAction.label === 'By GL Posting Date') {
        dispatch(setAgingFilterValue(2))
      }
    }
  }, [billsToPayReducer.agingFilter, actions])

  return (
    <Dropdown>
      <MenuButton
        ref={dropdownRef}
        className={`flex !items-center !border-none !bg-transparent ${isOpen ? '!text-primary' : ''}`}
        onClick={() => {
          handleDropdownToggle()
        }}>
        <span className='text-sm'>{label}</span>
        <span className={`ml-2 text-base ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown />
        </span>
      </MenuButton>

      <Menu className={`z-[6] !-ml-6 !-mt-2 !w-[200px]`}>
        {actions.map((action: any, index: any) => (
          <MenuItem
            key={action.label}
            className='!font-proxima !font-normal !text-black'
            onClick={() => {
              handleClick(action.label, action.value)
              dispatch(setAgingFilterValue(parseInt(action.value)))
            }}>
            <Typography type='h6' className='!font-normal'>
              {action.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  )
}
export default AgingFilterDropdwon