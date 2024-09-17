'use client'

import React from 'react'
import { Toast } from 'pq-ap-lib'
import { CompanyContextProvider } from '@/context/companyContext'

import { Provider } from 'react-redux'
import { persistor, store } from '@/store/configureStore'
import { PersistGate } from 'redux-persist/integration/react'

export default async function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toast position='top_center' />
        <CompanyContextProvider>{children}</CompanyContextProvider>
      </PersistGate>
    </Provider>
  )
}
