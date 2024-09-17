import React, { useState } from 'react'

export default function SendReminder() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ color: isHovered ? '#02B89D' : '#6E6D7A' }}

      >
        <mask id='mask0_35323_80738' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='24' height='24'>
          <rect width='24' height='24' fill='#D9D9D9' />
        </mask>
        <g mask='url(#mask0_35323_80738)'>
          <path
            d='M0.951172 16.6161V3.00259C0.951172 2.61807 1.10402 2.32487 1.40971 2.12302C1.71542 1.92118 2.04138 1.89319 2.3876 2.03904L16.2236 7.89771H16.0115C15.5032 7.91246 15.013 7.97618 14.5408 8.08888C14.0687 8.20157 13.6285 8.35516 13.2204 8.54965L2.67483 4.08545V8.32866L8.90668 9.83143L2.67483 11.3342V15.5774L9.24487 12.7796C9.12111 13.1096 9.02461 13.4477 8.95537 13.7939C8.88614 14.1402 8.84783 14.4731 8.84046 14.7928V14.8282L2.40527 17.5796C2.05905 17.7255 1.73015 17.6975 1.41856 17.4956C1.10697 17.2938 0.951172 17.0006 0.951172 16.6161Z'
            fill={isHovered ? '#02B89D' : '#6E6D7A'}
          />
          <path
            d='M22.3166 15.6325C22.3166 18.7138 19.8188 21.2117 16.7377 21.2117C13.6565 21.2117 11.1587 18.7138 11.1587 15.6325C11.1587 12.5511 13.6565 10.0533 16.7377 10.0533C19.8188 10.0533 22.3166 12.5511 22.3166 15.6325Z'
            stroke={isHovered ? '#02B89D' : '#6E6D7A'}
            strokeWidth='1.47372'
          />
          <path
            d='M16.2109 13.5273V16.8865C16.2109 16.9437 16.253 16.9921 16.3096 17.0002L17.7899 17.2117'
            stroke={isHovered ? '#02B89D' : '#6E6D7A'}
            strokeWidth='1.47372'
            strokeLinecap='round'
          />
        </g>
      </svg>
    </div>
  )
}
