import React from 'react'
import Image from 'next/image'

const TMSIcon = (props) => {
  return (
    <>
      {props.bgColor === '#F4F4F4' ? (
        <div>
          <Image src='/tms.svg' alt='Logo' width={50} height={50} priority />
        </div>
      ) : (
        <div>
          <Image src='/tmsIcon.svg' alt='Logo' width={50} height={50} priority />
        </div>
      )}
    </>
  )
}

export default TMSIcon
