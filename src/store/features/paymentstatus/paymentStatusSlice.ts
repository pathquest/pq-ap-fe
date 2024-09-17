import agent from '@/api/axios'
import { GetPaymentStatusColumnMappingOptions, PaymentStatusListOptions, SavePaymentStatusColumnMappingOptions, SetCancelPaymentOptions } from '@/models/paymentStatus'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
  statusIdList: string[]
  filterFields: {
    LocationIds: string[],
    VendorIds: string[],
    PaymentMethod: string[],
    StartDate: string,
    EndDate: string,
  }
}

const initialState: ProfileState = {
  token: '',
  statusIdList: [],
  filterFields: {
    LocationIds: [],
    VendorIds: [],
    PaymentMethod: [],
    StartDate: '',
    EndDate: '',
  },
}

export const paymentStatusGetList = createAsyncThunk('paymentStatus/paymentStatusGetList', async (data: PaymentStatusListOptions, thunkAPI) => {
  try {
    return await agent.PaymentStatus.paymentStatusGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
}
)

export const getPaymentStatusColumnMapping = createAsyncThunk('paymentStatus/getPaymentStatusColumnMapping', async (data: GetPaymentStatusColumnMappingOptions, thunkAPI) => {
  try {
    return await agent.PaymentStatus.getPaymentStatusColumnMapping(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
}
)

export const savePaymentStatusColumnMapping = createAsyncThunk('paymentStatus/savePaymentStatusColumnMapping', async (data: SavePaymentStatusColumnMappingOptions, thunkAPI) => {
  try {
    return await agent.PaymentStatus.savePaymentStatusColumnMapping(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
}
)

export const paymentStatusDropdown = createAsyncThunk('paymentStatus/paymentStatusDropdown', async (_, thunkAPI) => {
  try {
    return await agent.PaymentStatus.paymentStatusDropdown()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
}
)

export const setCancelPayment = createAsyncThunk('paymentStatus/setCancelPayment', async (data: SetCancelPaymentOptions, thunkAPI) => {
  try {
    return await agent.PaymentStatus.setCancelPayment(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const paymentStatusSlice = createSlice({
  name: 'paymentStatus',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setStatusIdList: (state, action) => {
      state.statusIdList = action.payload
    },
    setFilterFields: (state, action) => {
      state.filterFields = action.payload
    },
  },
})

export const { setToken, setFilterFields, setStatusIdList } = paymentStatusSlice.actions