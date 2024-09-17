import React from 'react'

const Overlay = ({ isOpen, onClose, className }: any) => {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className={`fixed bottom-0 left-0 right-0 top-0 z-[8] bg-black opacity-40 transition-opacity duration-300 ease-in-out ${className}`}
    ></div>
  )
}

export default Overlay
