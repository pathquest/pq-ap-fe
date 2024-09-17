'use client'

import React from 'react'
import Sidebar from '../_components/Sidebar'
import SupportCategory from '../_components/SupportCategory'
import "../style/scrollbar-style.css"
import "../../../../public/styles/fonts/candara-font.css"

type pageProps = {
  children: React.ReactNode
}

function layout({ children }: pageProps) {
  return (
    <div className='m-auto mt-8 flex w-[85%] flex-row space-x-20 '>
      <div className='w-[20%]'>
        <Sidebar />
      </div>
      <div className='flex-1 text-justify'>
        <div>{children}</div>
        <div className='my-10'>
          <SupportCategory />
        </div>
      </div>
    </div>
  )
}

export default layout
