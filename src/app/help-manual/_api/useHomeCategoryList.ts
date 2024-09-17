import { useEffect, useState } from 'react'
import fetchStrapiData from './strapi_fetch_api'
import { CategoryList, CategoryListAPIResponse } from '../types'

const useHomeCategoryList = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<CategoryList[]>([])

  const query = '/categories?sort[0]=Sequence:asc&populate=*&fields[1]=Name&fields[2]=ShortDescription&fields[3]=Slug'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response: CategoryListAPIResponse = await fetchStrapiData(query)
        setCategories(response?.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return [loading, categories] as const
}

export default useHomeCategoryList
