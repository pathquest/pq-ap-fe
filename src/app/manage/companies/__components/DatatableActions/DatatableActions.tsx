import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { MenuIcon, Typography } from 'pq-ap-lib'
import React from 'react'

interface ActionsProps {
  actions: any
  id: number
  companyName: any
  accountingTool: any
  actionRowId: (arg1: any, arg2?: any) => void
  handleClick: (arg1: any, arg2: any, arg3: any, arg4: any) => void
  menuClassName?: any
}

const Actions: React.FC<ActionsProps> = ({ actions, id, companyName, accountingTool, handleClick, actionRowId, menuClassName }) => {
  const handleRowClick = (id: any, accountingTool: any) => {
    actionRowId(id, accountingTool)
  }

  return (
    <Dropdown>
      <MenuButton className={'!border-none !bg-transparent !outline-black'}>
        <span onClick={() => handleRowClick(id, accountingTool)}><MenuIcon size='small' direction='meatball' classname={'!w-full'} /></span>
      </MenuButton>
      <Menu className={`!z-[6] !-ml-4 !-mt-2 !w-[${menuClassName ? menuClassName : '140px'}]`}>
        {actions.map((action: any) => (
          <MenuItem key={action} className='laptop:!h-full laptopMd:!h-full lg:!h-full xl:!h-full hd:!h-[44px] 2xl:!h-[44px] 3xl:!h-[44px] !outline-black !px-[15px]' onClick={() => { handleClick(action, id, companyName, accountingTool) }}>
            <label className="text-sm font-proxima text-[#212529] cursor-pointer">{action}</label>
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  )
}
export default Actions
