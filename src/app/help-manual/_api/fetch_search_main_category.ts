import fetchStrapiData from './strapi_fetch_api'

const fetchSearchMainCategory = async (subCategorySlug: string) => {
  const query = `/sub-categories?filters[Slug][$eq]=${subCategorySlug}&populate[Category][fields][0]=Slug&fields[0]=id`
  try {
    const response = await fetchStrapiData(`${query}`)
    return response?.data[0]?.attributes?.Category?.data?.attributes?.Slug
  } catch (error) {
    console.error('Error', error)
  }
}

export default fetchSearchMainCategory
