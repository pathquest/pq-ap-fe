import React from 'react'

interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrawerOverlay: React.FC<DrawerOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  localStorage.removeItem('xerocode')
  localStorage.removeItem('qbcode')
  localStorage.removeItem('realmId')
  localStorage.removeItem('state')
  return <div className='fixed bottom-0 left-0 right-0 top-0 z-[7] bg-black opacity-40' />
}

export default DrawerOverlay
