import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'

interface ActionsProps {
  label?: any
  actions: any
  id: any
  RecordNo?: any
  actionRowId: (arg1: any, arg2?: any) => void
  handleClick: (arg1: any, arg2: any, arg3?: any) => void
}

const PaginationDropdown: React.FC<ActionsProps> = ({ actions, id, RecordNo, handleClick, actionRowId, label }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<any>(null)

  const handleRowClick = (id: any) => {
    actionRowId(id)
  }

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

  return (
    <div>
      <Dropdown>
        <MenuButton
          ref={dropdownRef}
          className={`flex !items-center !border-none !bg-transparent ${isOpen ? '!text-primary' : ''}`}
          onClick={() => {
            handleRowClick(id)
            handleDropdownToggle()
          }}
        >
          <span className='text-sm'>{label}</span>
          <span className={`ml-2 text-base ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
            <ChevronDown />
          </span>
        </MenuButton>
        <Menu className='!z-[6] !-mt-2 !w-[100px]'>
          {actions.map((action: any, index: any) => (
            <MenuItem
              key={`${action}`}
              className='!font-proxima !font-normal !text-black'
              onClick={() => {
                handleClick(action, id, RecordNo)
                setIsOpen(false)
              }}
            >
              <Typography type='h6' className='!font-normal'>
                {action}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Dropdown>
    </div>
  )
}
export default PaginationDropdown