import agent from '@/api/axios'
import { SyncCurrencyMasterOptions, CurrencyGetListOptions, CurrencyDropdownOptions } from '@/models/currencyMaster'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const syncCurrencyMaster = createAsyncThunk(
  'currency/syncCurrencyMaster',
  async (_, thunkAPI) => {
    try {
      return await agent.Currency.syncCurrencyMaster()
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const currencyGetList = createAsyncThunk(
  'currency/currencyGetList',
  async (data: CurrencyGetListOptions, thunkAPI) => {
    try {
      return await agent.Currency.currencyGetList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const currencyDropdown = createAsyncThunk(
  'currency/currencyDropdown',
  async (data: CurrencyDropdownOptions, thunkAPI) => {
    try {
      return await agent.Currency.currencyDropdown(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
  },
  //   extraReducers: (builder) => {
  //     builder.addMatcher(isAnyOf(signInUser.fulfilled), (state, action) => {
  //       state.token = action.payload
  //     })
  //     builder.addMatcher(isAnyOf(signInUser.rejected), (state, action) => {
  //       throw action.payload
  //     })
  //   },
})

export const { setToken } = currencySlice.actions
