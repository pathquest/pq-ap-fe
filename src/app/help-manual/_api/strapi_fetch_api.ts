const fetchStrapiData = async (path: string) => {
  try {
    const response = await fetch(`${process.env.STRAPI_URL}/api${path}`)
    if (!response.ok) {
      throw new Error('Failed to fetch data from Strapi')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error', error)
  }
}

export default fetchStrapiData
