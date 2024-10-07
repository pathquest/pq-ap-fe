import { Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy'
import { MenuIcon, Typography } from 'pq-ap-lib'

interface ActionsProps {
    actions: any
    id: number
    Guid: string
    amount: string
    vendorId: number
    actionRowId: (arg1: any) => void
    handleClick: (actionName: any, id: any, Guid: any, vendorId: any, amount: any) => void
}

export const Actions: React.FC<ActionsProps> = ({ actions, id, Guid, vendorId, amount, handleClick, actionRowId }) => {
    const handleRowClick = (id: any) => {
        actionRowId(id)
    }

    return (
        <Dropdown>
            <MenuButton className={'!border-none !bg-transparent'} onClick={() => handleRowClick(id)}>
                <MenuIcon size='small' direction='meatball' classname={'!w-full'} />
            </MenuButton>
            <Menu className='!z-[5] !w-[200px] !-mt-2 !-ml-4'>
                {actions.map((action: any) => (
                    <MenuItem key={action + Math.random()} className='!font-proxima !font-normal !text-black' onClick={() => { handleClick(action, id, Guid, vendorId, amount) }}>
                        <Typography type='h6' className='!font-normal'>
                            {action}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Dropdown>
    )
}