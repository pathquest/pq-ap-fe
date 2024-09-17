import React from 'react'

const PlusIcon = ({ color }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4.5" y="11.5" width="15" height="1" rx="0.5" fill={color} stroke={color} />
      <rect x="11.5" y="19.5" width="15" height="1" rx="0.5" transform="rotate(-90 11.5 19.5)" fill={color} stroke={color} />
    </svg>
  )
}

export default PlusIcon
