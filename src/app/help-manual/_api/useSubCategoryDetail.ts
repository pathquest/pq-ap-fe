import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QAAttributes, QAAPIResponse, SubCategory, SubCategoryAPIResponse } from '../types'
import fetchStrapiData from './strapi_fetch_api'

const useSubCategoryDetail = (subCategory: string) => {
  const pathName = usePathname()
  const [loading, setLoading] = useState<boolean>(true)
  const [subCategoryDetail, setSubCategoryDetail] = useState<SubCategory>()
  const [questionAnswer, setQuestionAnswer] = useState<QAAttributes[]>([])
  const [breadcrumbItems, setBreadcrumbItems] = useState([{ label: 'Home', url: '/help-manual' }])

  async function fetchSubCategoryDetail(path: string, QAPath: string) {
    setLoading(true)

    try {
      const [response, qas] = await Promise.all([fetchStrapiData(`${path}`), fetchStrapiData(`${QAPath}`)])
      const data: SubCategoryAPIResponse = response
      const QAs: QAAPIResponse = qas

      const subcategoryTitle = data?.data[0]?.attributes?.Name
      const categoryNameSlug = data?.data[0]?.attributes?.Category?.data?.attributes

      setSubCategoryDetail(data?.data[0])
      setQuestionAnswer(QAs?.data)

      let homePageUrl = pathName?.split('/')[1]
      setBreadcrumbItems((prev) => [
        { label: 'Home', url: `/${homePageUrl}` },
        { label: categoryNameSlug?.Name, url: `/${homePageUrl}/${categoryNameSlug?.Slug}` },
        { label: subcategoryTitle, url: '#' },
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubCategoryDetail(
      `/sub-categories?filters[Slug][$eq]=${subCategory}&populate[Category][fields][0]=Name&populate[Category][fields][1]=Slug`,
      `/question-and-answers?filters[SubCategory][Slug][$eq]=${subCategory}`
    )
  }, [])

  return [loading, subCategoryDetail, questionAnswer, breadcrumbItems] as const
}

export default useSubCategoryDetail
