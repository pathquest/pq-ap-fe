import { Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy'
import { MenuIcon, Typography } from 'pq-ap-lib'

interface ActionsProps {
    actions: any
    id: number
    vendorName: string
    recordNumber: string
    status: boolean
    handleClick: (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any) => void
}

export const Actions: React.FC<ActionsProps> = ({ actions, id, recordNumber, status, vendorName, handleClick }) => {
    return (
        <Dropdown>
            <MenuButton className={'!border-none !bg-transparent'} >
                <MenuIcon size='small' direction='meatball' classname={'!w-full'} />
            </MenuButton>
            <Menu className='!z-[5] !w-[168px] !-ml-6 !-mt-2 '>
                {actions.map((action: any) => (
                    <MenuItem key={action + Math.random()} className='!font-proxima !font-normal !text-black' onClick={() => { handleClick(action, id, recordNumber, status, vendorName) }}>
                        <Typography type='h6' className='!font-normal'>
                            {action}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Dropdown>
    )
}

