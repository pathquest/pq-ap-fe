import { usePathname, useRouter } from 'next/navigation'
import { Loader, Typography } from 'pq-ap-lib'
import React from 'react'
import { SubCateoryList } from '../types'
import useSubCategoryList from '../_api/useSubCategoryList'

function Sidebar() {
  const router = useRouter()
  const pathName = usePathname()
  const [loading, subCategories, activeCategoryName] = useSubCategoryList();
  
  const handleSubCategoryClick = (subCategory: SubCateoryList) => {
    const category = pathName.split('/')
    router.push(`/${category[1]}/${category[2]}/${subCategory.attributes?.Slug}`)
  }

  return (
    <>
      <div className='sticky top-4'>
        {activeCategoryName && (
          <div className='border-l-[2px] border-[#02b89d] bg-[#f6f6f6] p-2 px-4'>
            <Typography type='h2' className='!text-base font-normal  text-[#333333]'>
              {activeCategoryName}
            </Typography>
          </div>
        )}
        <div className='mt-3 flex flex-col space-y-1.5'>
          {loading ? (
            <Loader size='sm' />
          ) : (
            subCategories &&
            subCategories?.map((subCategory: SubCateoryList) => (
              <div
                key={subCategory.id}
                className='flex cursor-pointer items-center p-2'
                onClick={() => handleSubCategoryClick(subCategory)}
              >
                <div
                  className={`ml-2 mr-1 h-2 w-2 rounded-full ${
                    pathName.includes(subCategory.attributes?.Slug) ? 'bg-[#02b89d]' : 'bg-white'
                  }`}
                ></div>
                <Typography
                  type='h4'
                  className={`!text-base !font-normal ${
                    pathName.includes(subCategory.attributes?.Slug) ? 'text-[#02b89d] ' : 'text-[#333333]'
                  }`}
                >
                  {subCategory.attributes?.Name}
                </Typography>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
