import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { authSlice } from './features/auth/authSlice'
import { billApproval } from './features/billApproval/approvalSlice'
import { billSlice } from './features/bills/billSlice'
import { billsToPay } from './features/billsToPay/billsToPaySlice'
import { companySlice } from './features/company/companySlice'
import { files } from './features/files/filesSlice'
import { globalSearch } from './features/globalSearch/globalSearchSlice'
import { paymentSetupSlice } from './features/paymentsetting/paymentSetupSlice'
import { paymentStatusSlice } from './features/paymentstatus/paymentStatusSlice'
import { reportsSlice } from './features/reports/reportsSlice'
import { userSlice } from './features/user/userSlice'
import { vendorSlice } from './features/vendor/vendorSlice'
import { dashboardSlice } from './features/dashboard/dashboardSlice'
import { accountantDashboard } from './features/accountantDashboard/accountDashboardSlice'
import { profileSlice } from './features/profile/profileSlice'
import { cloudConfigurationSlice } from './features/cloudConfiguration/cloudConfigurationSlice'

const persistConfig = {
  key: 'root',
  storage,
}

const reducers = combineReducers({
  auth: authSlice.reducer,
  company: companySlice.reducer,
  dashboard: dashboardSlice.reducer,
  user: userSlice.reducer,
  paymentStatus: paymentStatusSlice.reducer,
  vendor: vendorSlice.reducer,
  bill: billSlice.reducer,
  billsToPayReducer: billsToPay.reducer,
  billApproval: billApproval.reducer,
  accountantDashboard: accountantDashboard.reducer,
  paymentSetupSlice: paymentSetupSlice.reducer,
  global: globalSearch.reducer,
  reports: reportsSlice.reducer,
  files: files.reducer,
  profile: profileSlice.reducer,
  cloudConfiguration:cloudConfigurationSlice.reducer
})

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector