'use client'

import agent, { invalidateSessionCache } from '@/api/axios'
import { handleLoginError } from '@/utils'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader, Toast } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

const AuthSuccess = ({ session }: any) => {
  const user = session ? session?.user : {}
  const router = useRouter()
  const { update } = useSession()

  const [loader, setLoader] = useState(true)

  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access_token')!
  const token = searchParams.get('id_token')!

  useEffect(() => {
    const sendToken = async () => {
      if (accessToken === '' || token === '') return

      try {
        const response = await agent.APIs.socialLogin({
          SocialLoginType: 1,
          AccessToken: accessToken,
          Token: token,
        })

        setLoader(false)
        const dataMessage = response.Message

        if (response.ResponseStatus === 'Success') {
          Toast.success('Success', dataMessage || 'You are successfully logged in.')

          const { Token, RefreshToken } = response.ResponseData

          invalidateSessionCache();
          await update({ ...user, access_token: Token, refresh_token: RefreshToken })

          // api call to check if product selected
          hasProduct()
        } else {
          handleLoginError(dataMessage)
          router.push('/signin')
        }
      } catch (error) {
        setLoader(false)
        console.error(error)
      }
    }
    sendToken()
  }, [accessToken, token])

  const hasProduct = async () => {
    const response = await agent.APIs.getUserConfig()

    if (response?.ResponseStatus === 'Success') {
      const { UserId, OrganizationId, IsAdmin, IsOrganizationAdmin } = response.ResponseData
      const isMapped = response?.ResponseData.products.some((product: any) => product.is_mapped)

      localStorage.setItem('UserId', UserId)
      localStorage.setItem('OrgId', OrganizationId)
      localStorage.setItem('IsAdmin', IsAdmin)
      localStorage.setItem('IsOrgAdmin', IsOrganizationAdmin)

      if (isMapped) {
        router.push('/profile')
      } else {
        router.push('/products')
      }
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center pt-5'>
      <Toast position='top_right' />
      {loader && <Loader helperText />}
    </div>
  )
}

export default AuthSuccess
