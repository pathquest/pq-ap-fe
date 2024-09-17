'use server'

import ProductList from './__components/ProductList'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserProfile, ssoUrl } from '@/api/server/common'

export default async function ProductsPage() {
  const session = await auth()
  const userProfile: any = await getUserProfile()
  const isMapped = userProfile.products.some((product: any) => product.is_mapped)
  const token = session?.user?.access_token
  
  if(isMapped) {
    return redirect(`/profile?token=${token}`)
  }

  if (!session) {
    return redirect(`${ssoUrl}/signin`)
  }

  return <ProductList />
}
