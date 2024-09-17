import { useEffect, useState } from 'react'
import agent from '@/api/axios'

const Star = ({ data }) => {
  const userId = localStorage.getItem('UserId')

  const [starred, setStarred] = useState(false)

  useEffect(() => {
    setStarred(data.is_favourite)
  }, [data])

  const handleStarClick = async (e) => {
    e.stopPropagation()
    const newStarredStatus = !starred // Toggle the starred state
    setStarred(newStarredStatus) // Update the starred state immediately

    const updatedCompanyId = data.value // Get the updated CompanyId
    await getData(!starred, updatedCompanyId, userId) // Call getData after setting CompanyId
  }

  const getData = async (newStarredStatus, CompanyId, userId) => {
    try {
      const response = await agent.APIs.favoriteByUser({
        Id: Number(userId),
        CompanyId: Number(CompanyId),
        IsFavorite: newStarredStatus,
      })

      if (response.ResponseStatus === 'Success') {
        setStarred(newStarredStatus)
      } else {
        const data = response.Message
        if (data === null) {
          Toast.error('Please try again later.')
        } else {
          Toast.error(data)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='#02B89D' xmlns='http://www.w3.org/2000/svg' onClick={handleStarClick}>
      <path
        d='M3.73686 20C3.88848 19.3701 4.03522 18.7656 4.18195 18.1661C4.62705 16.3576 5.06725 14.5491 5.51724 12.7407C5.55637 12.5933 5.52702 12.5121 5.41453 12.4155C3.6586 10.8712 1.90756 9.32182 0.151626 7.7775C0.112497 7.74194 0.0782587 7.70638 0 7.63526C0.361947 7.60986 0.679873 7.58446 0.997799 7.55905C3.04231 7.42189 5.08193 7.27965 7.12644 7.14757C7.26828 7.13741 7.29274 7.04597 7.33187 6.94437C8.18293 4.72441 9.03399 2.49936 9.88506 0.274321C9.9144 0.19304 9.94864 0.11684 9.99755 0C10.0367 0.0914402 10.066 0.1524 10.0856 0.20828C10.9464 2.44856 11.8073 4.69393 12.6584 6.93929C12.717 7.10185 12.8002 7.14249 12.9567 7.15265C14.473 7.24917 15.9892 7.35585 17.5055 7.46253C18.1903 7.50825 18.8701 7.55398 19.5549 7.5997C19.6919 7.60986 19.8239 7.62001 20 7.68097C19.9511 7.71145 19.8973 7.73686 19.8582 7.7775C18.112 9.31166 16.3659 10.8509 14.6197 12.3851C14.4779 12.507 14.4534 12.6086 14.4974 12.7965C15.0746 15.1181 15.642 17.4448 16.2142 19.7714C16.2289 19.8374 16.2436 19.9035 16.2631 20C16.1702 19.9441 16.1066 19.9035 16.043 19.8628C14.0866 18.5776 12.1301 17.2974 10.1785 16.0071C10.0465 15.9208 9.96332 15.9258 9.83125 16.0071C7.87479 17.2974 5.91343 18.5827 3.95207 19.873C3.88359 19.9086 3.8249 19.9441 3.73686 20Z'
        fill={starred ? '#02B89D' : '#C9DDEB'}
      />
    </svg>
  )
}

export default Star
