import fetchStrapiData from './strapi_fetch_api'

const fetchSearchResult = async (delaySearchQuery: string) => {
  const query = `/question-and-answers?populate[Category][fields][0]=Slug&populate[SubCategory][fields][0]=Slug&fields[0]=Question&filters[Question][$containsi]=${delaySearchQuery}`
  try {
    const response = await fetchStrapiData(`${query}`)
    return response
  } catch (error) {
    console.error('Error', error)
  }
}

export default fetchSearchResult
