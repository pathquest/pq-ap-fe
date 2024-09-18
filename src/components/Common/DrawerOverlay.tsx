const DrawerOverlay = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null

  return <div className='fixed bottom-0 left-0 right-0 top-0 z-[8] bg-black opacity-40' onClick={onClose} />
}

export default DrawerOverlay
