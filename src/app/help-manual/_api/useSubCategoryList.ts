import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubCateoryList, SubCateoryListAPIResponse } from '../types'
import fetchStrapiData from './strapi_fetch_api'

const useSubCategoryList = () => {
  const pathName = usePathname()
  const [loading, setLoading] = useState<boolean>(true)
  const [subCategories, setSubCategories] = useState<SubCateoryList[]>([])
  const [activeCategoryName, setActiveCategoryName] = useState<string>('')

  useEffect(() => {
    const fetchSubCategories = async (path: string, CategoryPath: string) => {
      setLoading(true)
      try {
        const [response, category] = await Promise.all([fetchStrapiData(`${path}`), fetchStrapiData(`${CategoryPath}`)])
        const data: SubCateoryListAPIResponse = response
        const categoryName = category
        const activeCategoryName = categoryName?.data[0].attributes.Name

        setSubCategories(data?.data)
        setActiveCategoryName(activeCategoryName)
      } catch (error) {
        console.error('Error', error)
      } finally {
        setLoading(false)
      }
    }

    const categorySlug = pathName.split('/')?.[2]
    fetchSubCategories(
      `/sub-categories?sort[0]=Sequence:asc&filters[Category][Slug][$eq]=${categorySlug}&fields[0]=Slug&fields[1]=Name`,
      `/categories?filters[Slug][$eq]=${categorySlug}&fields[0]=Name`
    )
  }, [])

  return [loading, subCategories, activeCategoryName] as const
}

export default useSubCategoryList
