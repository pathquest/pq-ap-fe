import React from 'react'

export default function CloseIcon(props) {
  return (
    <div>
      <svg xmlns='http://www.w3.org/2000/svg' width={props.width} height={props.height} viewBox='0 0 24 24' fill='none'>
        <mask id='mask0_34114_46086' style={{ maskType: 'alpha' }} maskUnits='userSpaceOnUse' x='0' y='0' width='24' height='24'>
          <rect width='24' height='24'fill={props.color ? props.color : '#6E6D7A'} />
        </mask>
        <g mask='url(#mask0_34114_46086)'>
          <mask
            id='mask1_34114_46086'
            style={{ maskType: 'alpha' }}
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width='24'
            height='24'
          >
            <rect width='24' height='24' fill={props.color ? props.color : '#6E6D7A'} />
          </mask>
          <g mask='url(#mask1_34114_46086)'>
            <path
              d='M6.40148 18.6534L5.34766 17.5995L10.9477 11.9995L5.34766 6.39953L6.40148 5.3457L12.0015 10.9457L17.6015 5.3457L18.6553 6.39953L13.0553 11.9995L18.6553 17.5995L17.6015 18.6534L12.0015 13.0534L6.40148 18.6534Z'
              fill={props.color ? props.color : '#6E6D7A'} 
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
