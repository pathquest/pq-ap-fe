'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const XeroConnect = () => {
  const router = useRouter()
  const getAccessCode = useSearchParams()
  const code = getAccessCode.get('code') || ''
  const state = getAccessCode.get('state') || ''

  useEffect(() => {
    if (code) {
      localStorage.setItem('xerocode', code)
      localStorage.setItem('state', state)
      router.push('/manage/companies')
    }
  }, [code, router])

  return <></>
}

export default XeroConnect
