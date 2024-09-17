import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Category, CategoryAPIResponse, QAAPIResponse, QAAttributes } from '../types'
import fetchStrapiData from '../_api/strapi_fetch_api'

const useCategoryDetail = (category: string) => {
  const pathName = usePathname()
  const [loading, setLoading] = useState<boolean>(true)
  const [categoryDetail, setCategoryDetail] = useState<Category>()
  const [questionAnswer, setQuestionAnswer] = useState<QAAttributes[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([{ label: 'Home', url: '/help-manual' }])

  useEffect(() => {
    const fetchCategoryData = async (path: string, QAPath: string) => {
      setLoading(true)
      try {
        const data: CategoryAPIResponse = await fetchStrapiData(path)
        const QAs: QAAPIResponse = await fetchStrapiData(QAPath)

        const categoryName = data.data[0]?.attributes?.Name
        setCategoryDetail(data?.data[0])
        setQuestionAnswer(QAs?.data)

        let homePageUrl = pathName.split('/')[1]
        setBreadcrumbs((prevBreadcrumbs) => [
          { label: 'Home', url: `/${homePageUrl}` },
          { label: categoryName, url: '#' },
        ])
      } catch (error) {
        console.error('Error', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData(
      `/categories?filters[Slug][$eq]=${category}`,
      `/question-and-answers?filters[Category][Slug][$eq]=${category}`
    )
  }, [])

  return [loading, categoryDetail, questionAnswer, breadcrumbs] as const
}

export default useCategoryDetail
