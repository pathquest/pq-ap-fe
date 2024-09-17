import React from 'react'

function ColFilterIcon({ color }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
      <path
        d='M6 20.5V9.5C6 9.0875 6.14688 8.73438 6.44063 8.44063C6.73438 8.14688 7.0875 8 7.5 8H22.5C22.9125 8 23.2656 8.14688 23.5594 8.44063C23.8531 8.73438 24 9.0875 24 9.5V20.5C24 20.9125 23.8531 21.2656 23.5594 21.5594C23.2656 21.8531 22.9125 22 22.5 22H7.5C7.0875 22 6.73438 21.8531 6.44063 21.5594C6.14688 21.2656 6 20.9125 6 20.5ZM7.5 20.5H11.5V9.5H7.5V20.5ZM13 20.5H17V9.5H13V20.5ZM18.5 20.5H22.5V9.5H18.5V20.5Z'
        fill={color}
      />
    </svg>
  )
}

export default ColFilterIcon
