'use server'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const Home = async () => {
  const session = await auth()

  if (session) {
    return redirect('/products')
  } else {
    return redirect('/signin')
  }
}

export default Home
