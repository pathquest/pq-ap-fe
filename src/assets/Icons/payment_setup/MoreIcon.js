import React from 'react'

function MoreIcon(props) {
  return (
    <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M18 23C19.1046 23 20 23.8954 20 25C20 26.1046 19.1046 27 18 27C16.8954 27 16 26.1046 16 25C16 23.8954 16.8954 23 18 23ZM18 16C19.1046 16 20 16.8954 20 18C20 19.1045 19.1046 20 18 20C16.8954 20 16 19.1045 16 18C16 16.8954 16.8954 16 18 16ZM20 11C20 9.89544 19.1046 9.00001 18 9.00001C16.8954 9.00001 16 9.89544 16 11C16 12.1046 16.8954 13 18 13C19.1046 13 20 12.1046 20 11Z'
        fill={props.fill}
      />
    </svg>
  )
}

export default MoreIcon
