'use client'

import agent, { invalidateSessionCache } from '@/api/axios'
import { ssoUrl } from '@/api/server/common'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader, Toast } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

const QuickbookAuthSuccess = ({ session }: any) => {
  const user = session ? session?.user : {}
  const router = useRouter()
  const { update } = useSession()

  const searchParams = useSearchParams()
  const accessToken = searchParams.get('code')

  const [loader, setLoader] = useState(true)

  useEffect(() => {
    const sendToken = async () => {
      if (accessToken !== '') {
        try {
          const response = await agent.APIs.qboLogin(`/qbo-signin?qbocode=${accessToken}`)

          if (response.ResponseStatus === 'Success') {
            setLoader(false)
            const data = response.Message
            if (data === null) {
              Toast.success('Success', 'You are successfully logged in.')
            } else {
              Toast.success('Success', data)
            }

            const { Token, RefreshToken } = response.ResponseData

            invalidateSessionCache();
            await update({ ...user, access_token: Token, refresh_token: RefreshToken })

            //api call to check if product selected
            hasProduct()
          } else {
            setLoader(false)
            const data = response.Message
            if (data === 'invalid request!') {
              Toast.error(data || 'Failed please try again later.', 'please try after sometime.')
              router.push(`${ssoUrl}/signin`)
            } else {
              const data = response.Message
              if (data === null) {
                Toast.error('Error', 'Failed please try again later.')
              } else {
                Toast.error('Error', data)
              }
              router.push(`${ssoUrl}/signin`)
            }
          }
        } catch (error) {
          setLoader(false)
          console.error(error)
        }
      }
    }
    if (accessToken !== '') {
      sendToken()
    }
  }, [accessToken])

  const hasProduct = async () => {
    const response = await agent.APIs.getUserProfile()

    if (response?.ResponseStatus === 'Success') {
      const isMapped = response?.ResponseData.products.some((product: any) => product.is_mapped)

      if (isMapped) {
        router.push('/profile')
      } else {
        router.push('/products')
      }
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center pt-5'>
      {loader && (
        <div className='flex min-h-screen flex-col items-center justify-center gap-2'>
          <Loader helperText />
        </div>
      )}
    </div>
  )
}

export default QuickbookAuthSuccess
