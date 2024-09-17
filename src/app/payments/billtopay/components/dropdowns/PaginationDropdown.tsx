import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface ActionsProps {
  label?: any
  actions: any
  handleClick: (arg1: any) => void
}

const PaginationDropdown: React.FC<ActionsProps> = ({ actions, handleClick, label }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
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

  return (
    <Dropdown>
      <MenuButton
        ref={dropdownRef}
        className={`flex !items-center !border-none !bg-transparent ${isOpen ? '!text-primary' : ''}`}
        onClick={() => { handleDropdownToggle() }}>
        <span className='text-sm'>{label}</span>
        <span className={`ml-2 text-base ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown />
        </span>
      </MenuButton>
      <Menu className='!z-[6] !-mt-2 !w-[100px]'>
        {actions.map((action: any) => (
          <MenuItem
            key={action.label}
            className='!font-proxima !font-normal !text-black'
            onClick={() => {
              handleClick(Number(action.label))
            }}
          >
            <Typography type='h6' className='!font-normal'>
              {action.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  )
}
export default PaginationDropdown