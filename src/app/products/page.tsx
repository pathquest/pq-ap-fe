'use server'

import ProductList from './__components/ProductList'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserProfile } from '@/api/server/common'

export default async function ProductsPage() {
  const session = await auth()
  const userProfile: any = await getUserProfile()
  const isMapped = userProfile.products.some((product: any) => product.is_mapped)

  if(isMapped) {
    return redirect('/profile')
  }

  if (!session) {
    return redirect('/signin')
  }

  return <ProductList />
}
