'use client'

import { usePathname } from 'next/navigation'
import { Typography } from 'pq-ap-lib'
import React from 'react'
import { Category } from '../types'
import Link from 'next/link'
import useSupportCategoryList from '../_api/useSupportCategoryList'

function SupportCategory() {
  const pathName = usePathname()
  const CategoryName = useSupportCategoryList();
  let homePageSegment = pathName?.split('/')[1]

  return (
    <div className='bg-whiteSmoke p-8'>
      <div className='mb-8'>
        <Typography type='h3' className='!text-base !font-semibold !font-candara'>
          Support Categories
        </Typography>
      </div>
      <div className='flex flex-row flex-wrap gap-y-7'>
        {CategoryName && !!CategoryName.length &&
         CategoryName.map((category: Category) => {
          return (
            <div className='flex xs:w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-row items-center gap-x-4' key={category.id}>
              <div className='h-1.5 w-1.5 rounded-full bg-[#333333]'></div>
              <Link href={`/${homePageSegment}/${category.attributes?.Slug}`}>
              <Typography type='h5' className='!text-sm text-[#333333]'>
                {category.attributes?.Name}
              </Typography>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SupportCategory
