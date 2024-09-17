'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const QbConnect = () => {
  const router = useRouter()
  const getAccessCode = useSearchParams()
  const code = getAccessCode.get('code') || ''
  const realmId = getAccessCode.get('realmId') || ''
  const state = getAccessCode.get('state') || ''

  useEffect(() => {
    if (code && realmId) {
      localStorage.setItem('qbcode', code)
      localStorage.setItem('realmId', realmId)
      localStorage.setItem('state', state)
      router.push('/manage/companies')
    }
  }, [code, realmId, router])

  return <></>
}

export default QbConnect
