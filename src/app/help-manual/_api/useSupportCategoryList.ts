import { useEffect, useState } from 'react'
import { Category, CategoryAPIResponse } from '../types'
import fetchStrapiData from '../_api/strapi_fetch_api'

const useSupportCategoryList = () => {
  const [CategoryName, setSubCategoryName] = useState<Category[]>([])

  useEffect(() => {
    async function fetchSupportingCategory(path: string) {
      try {
        const data: CategoryAPIResponse = await fetchStrapiData(path);
        setSubCategoryName(data?.data);
      } catch (error) {
        console.error('Error ', error);
      }
    }

    fetchSupportingCategory(`/categories?sort[0]=Sequence:asc&fields[0]=Slug&fields[1]=Name`)
  }, [])

  return CategoryName
}

export default useSupportCategoryList
