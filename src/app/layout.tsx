import { Inter } from 'next/font/google'

import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import ClientWrapper from './ClientWrapper'
import 'pq-ap-lib/dist/index.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <html lang='en'>
        <body className={inter.className} suppressHydrationWarning={true}>
          <ClientWrapper children={children} />
        </body>
      </html>
    </SessionProvider>
  )
}
