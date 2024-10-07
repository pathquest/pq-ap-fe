import agent from '@/api/axios'
import { ApproveRejectCheckOptions, DeactivateBankAccountOptions, GetAllBankAccountOptions, PreviewCheckImageOptions, SaveBuyerBankOption, SaveCheckMicroDepositOptions, SaveCheckPaymentMethodOptions, SavePaymentMethodOptions, UpdateBuyerBankOptions, UpdatePaymentMethodOptions } from '@/models/paymentSetup'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
  customerKycStatus: string
}

const initialState: ProfileState = {
  token: '',
  customerKycStatus: 'Approved',
}

export const companyKYC = createAsyncThunk('PaymentSetup/companyKYC', async (_, thunkAPI) => {
  try {
    return await agent.PaymentSetup.companyKYC()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getKYCStatus = createAsyncThunk('PaymentSetup/getKYCStatus', async (_, thunkAPI) => {
  try {
    return await agent.PaymentSetup.getKYCStatus()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getBankAccountDropdown = createAsyncThunk('PaymentSetup/getBankAccountDropdown', async (data: GetAllBankAccountOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.getBankAccountDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const buyerBankList = createAsyncThunk('PaymentSetup/buyerBankList', async (_, thunkAPI) => {
  try {
    return await agent.PaymentSetup.buyerBankList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveBuyerBank = createAsyncThunk('PaymentSetup/saveBuyerBank', async (data: SaveBuyerBankOption, thunkAPI) => {
  try {
    return await agent.PaymentSetup.saveBuyerBank(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getBuyerBankById = createAsyncThunk('PaymentSetup/getBuyerBankById', async (data: UpdateBuyerBankOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.getBuyerBankById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const deactivateBankAccount = createAsyncThunk('PaymentSetup/deactivateBankAccount', async (data: DeactivateBankAccountOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.deactivateBankAccount(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const paymentMethodList = createAsyncThunk('PaymentSetup/paymentMethodList', async (_, thunkAPI) => {
  try {
    return await agent.PaymentSetup.paymentMethodList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const activateBankAccount = createAsyncThunk('PaymentSetup/activateBankAccount', async (data: DeactivateBankAccountOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.activateBankAccount(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const savePaymentMethod = createAsyncThunk('PaymentSetup/savePaymentMethod', async (data: SavePaymentMethodOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.savePaymentMethod(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveCheckMicroDeposit = createAsyncThunk('PaymentSetup/saveCheckMicroDeposit', async (data: SaveCheckMicroDepositOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.saveCheckMicroDeposit(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const approveRejectCheck = createAsyncThunk('PaymentSetup/approveRejectCheck', async (data: ApproveRejectCheckOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.approveRejectCheck(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPreviewCheckImage = createAsyncThunk('PaymentSetup/getPreviewCheckImage', async (data: PreviewCheckImageOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.getPreviewCheckImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveCheckPaymentMethod = createAsyncThunk('PaymentSetup/saveCheckPaymentMethod', async (data: SaveCheckPaymentMethodOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.saveCheckPaymentMethod(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPaymentMethodById = createAsyncThunk('PaymentSetup/getPaymentMethodById', async (data: UpdatePaymentMethodOptions, thunkAPI) => {
  try {
    return await agent.PaymentSetup.getPaymentMethodById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const syncBankAccount = createAsyncThunk('PaymentSetup/syncBankAccount', async (_, thunkAPI) => {
  try {
    return await agent.PaymentSetup.syncBankAccount()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const paymentSetupSlice = createSlice({
  name: 'paymentSetupSlice',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setCustomerKycStatus: (state, action) => {
      state.customerKycStatus = action.payload
    }
  }
})

export const { setToken, setCustomerKycStatus } = paymentSetupSlice.actions
