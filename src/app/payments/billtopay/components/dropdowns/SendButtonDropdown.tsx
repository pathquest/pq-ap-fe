import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { Button } from 'pq-ap-lib'
import React, { useRef } from 'react'

// icons
import SendIcon from '@/assets/Icons/billposting/ActivityDrawer/SendIcon'

interface ActionsProps {
  handleClick?: any
}

const SendButtonDropdown: React.FC<ActionsProps> = ({ handleClick }) => {
  const dropdownRef = useRef<any>(null)

  return (
    <Dropdown>
      <MenuButton
        ref={dropdownRef}
        className={`flex !items-center !border-none !bg-transparent !p-0 `}
      >
        <Button variant='btn-primary' className='btn-md rounded-md'>
          <SendIcon />
        </Button>
      </MenuButton>
      <Menu className='z-[6] !-ml-5 !w-[200px]'>
        <MenuItem className='px-2 py-1' onClick={() => handleClick(1)}>
          <span className='text-sm font-medium text-[#212529]'>Send as Query</span>
        </MenuItem>
        <MenuItem className='px-2 py-1' onClick={() => handleClick(2)}>
          <span className='text-sm font-medium text-[#212529]'>Send as Comments</span>
        </MenuItem>
      </Menu>
    </Dropdown>
  )
}
export default SendButtonDropdown