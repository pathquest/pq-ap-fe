'use server'
import { ssoUrl } from '@/api/server/common'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const Home = async () => {
  const session = await auth()

  if (session) {
    return redirect(`${ssoUrl}/products`)
  } else {
    return redirect(`${ssoUrl}/signin`)
  }
}

export default Home
