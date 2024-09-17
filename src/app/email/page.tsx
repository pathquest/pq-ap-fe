'use client'

import Wrapper from '@/components/Common/Wrapper'
import React from 'react'
import image1 from '@/assets/images/EmailTemplate/activation_logo.png'
import image2 from '@/assets/images/EmailTemplate/activation_header_r_logo.png'
import image3 from '@/assets/images/EmailTemplate/email_otp.png'
import image4 from '@/assets/images/EmailTemplate/logo_dark.png'
import Image from 'next/image'

const email: React.FC = () => {
  return (
    <Wrapper>
      <Image src={image1} alt='Abc' />
      <Image src={image2} alt='Abc' />
      <Image src={image3} alt='Abc' />
      <Image src={image4} alt='Abc' />
    </Wrapper>
  )
}

export default email
