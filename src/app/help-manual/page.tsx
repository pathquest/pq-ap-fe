'use client'

import { Card, Loader, Typography } from 'pq-ap-lib'
import React from 'react'
import { CategoryList } from './types'
import { usePathname, useRouter } from 'next/navigation'
import useHomeCategoryList from './_api/useHomeCategoryList'

function Page() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, categories] = useHomeCategoryList();

  const handleCategoryClick = (cateory: CategoryList) => {
    router.push(`${pathname}/${cateory.attributes.Slug}`)
  }

  return (
    <div>
      {loading ? (
        <Loader size='sm' />
      ) : (
        <div className='m-auto w-[85%]'>
          <div className='my-8 text-center'>
            <Typography type='h1' className='!text-3xl font-medium text-[#333333] '>
              All Module
            </Typography>
          </div>
          <div className='mb-16 flex flex-row flex-wrap gap-3'>
            {categories && !!categories.length ? (
              categories.map((category: CategoryList) => {
                return (
                  <React.Fragment key={category.id}>
                    <Card className=' cursor-pointer !shadow-none border-lightSilver border-[1px] hover:bg-[#f6f6f6] hover:border-[#0ab8a3] transition-all'>
                      <div className='flex w-[16rem] flex-col gap-y-2 p-4' onClick={() => handleCategoryClick(category)}>
                        <img
                          src={`${category.attributes?.Icon?.data?.attributes?.url}`}
                          width={'40px'}
                          height={'40px'}
                          className='m-auto'
                        />
                        <Typography type='h4' className='text-center !text-base font-semibold text-[#333333]'>
                          {category.attributes?.Name}
                        </Typography>
                        <Typography type='text' className='max-w-xs text-center text-base text-[#6E6D7A]'>
                          {`${category.attributes?.ShortDescription?.length >50 ? category.attributes.ShortDescription.slice(0, 50)+'...':category.attributes?.ShortDescription}`}
                        </Typography>
                      </div>
                    </Card>
                  </React.Fragment>
                )
              })
            ) : (
              <Typography type='h3' className='text-xl'>
                Not Found{' '}
              </Typography>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
