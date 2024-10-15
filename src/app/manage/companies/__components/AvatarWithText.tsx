import React from 'react'
import AnyIcon from '@/assets/Icons/AnyIcon'
import { Avatar, Typography } from 'pq-ap-lib'

interface AccountingToolData {
  name: string
  connectedImageUrl?: string
  disconnectedImageUrl?: string
}

const accountingToolData: { [key: number]: AccountingToolData } = {
  1: {
    name: 'Intact',
    connectedImageUrl: 'https://logowik.com/content/uploads/images/sage-new-20223308.jpg',
    disconnectedImageUrl: 'https://logowik.com/content/uploads/images/sage-new-20223308.jpg',
    // disconnectedImageUrl: 'https://vectorlogoseek.com/wp-content/uploads/2019/05/sage-intacct-inc-vector-logo.png',
  },
  2: {
    name: 'QBO',
    connectedImageUrl: 'https://www.cdnlogo.com/logos/q/8/quickbooks.svg',
    disconnectedImageUrl: 'https://www.cdnlogo.com/logos/q/8/quickbooks.svg',
  },
  3: {
    name: 'Xero',
    connectedImageUrl: 'https://www.vectorlogo.zone/logos/xero/xero-icon.svg',
    disconnectedImageUrl: 'https://www.vectorlogo.zone/logos/xero/xero-icon.svg',
  },
}

interface AvatarWithTextProps {
  toolId: number
  isConnected: boolean
}

const AvatarWithText: React.FC<AvatarWithTextProps> = ({ toolId, isConnected }) => {
  const tool = accountingToolData[toolId]
  if (!tool) {
    return (
      <>
        <div className='ml-0.5'>
          <AnyIcon size={28} />
        </div>
        <Typography className='!p-0 text-black'>No Accounting Tool</Typography>
      </>
    )
  }

  return (
    <>
      <Avatar
        variant='small'
        name={tool.name}
        imageUrl={
          isConnected ? tool.connectedImageUrl || tool.disconnectedImageUrl : tool.disconnectedImageUrl || tool.connectedImageUrl
        }
      />
      {isConnected ? tool.name : <Typography className='!p-0 text-red-500'>Disconnected</Typography>}
    </>
  )
}

export default AvatarWithText
