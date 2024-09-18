import agent from '@/api/axios'
import { VendorDropdownListOptions, VendorGetByIdOptions, VendorGetDropdownListOptions, VendorGetListOptions, VendorUpdateStatusOptions } from '@/models/vendor'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
  filterFields: {
    VendorIds: string[],
    PaymentMethod: string[],
    StatusIds: string[],
    MinPayables: string,
    MaxPayables: string,
  }
}

const initialState: ProfileState = {
  token: '',
  filterFields: {
    VendorIds: [],
    PaymentMethod: [],
    StatusIds: [],
    MinPayables: '',
    MaxPayables: '',
  },
}

export const vendorDropdownList = createAsyncThunk('vendor/vendorDropdownList', async (data: VendorDropdownListOptions, thunkAPI) => {
  try {
    return await agent.Vendor.vendorDropdownList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const vendorGetDropdownList = createAsyncThunk('vendor/vendorGetDropdownList', async (data: VendorGetDropdownListOptions, thunkAPI) => {
  try {
    return await agent.Vendor.vendorGetDropdownList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const vendorGetList = createAsyncThunk('vendor/vendorGetList', async (data: VendorGetListOptions, thunkAPI) => {
  try {
    return await agent.Vendor.vendorGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const syncVendor = createAsyncThunk('vendor/syncVendor', async (_, thunkAPI) => {
  try {
    return await agent.Vendor.syncVendor()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveVendor = createAsyncThunk('vendor/saveVendor', async (data: any, thunkAPI) => {
  try {
    return await agent.Vendor.saveVendor(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const vendorGetById = createAsyncThunk('vendor/vendorGetById', async (data: VendorGetByIdOptions, thunkAPI) => {
  try {
    return await agent.Vendor.vendorGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const vendorUpdateStatus = createAsyncThunk('vendor/vendorUpdateStatus', async (data: VendorUpdateStatusOptions, thunkAPI) => {
  try {
    return await agent.Vendor.vendorUpdateStatus(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const importVendorData = createAsyncThunk('vendor/importVendorData', async (data: any, thunkAPI) => {
  try {
    return await agent.Vendor.importVendorData(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const accountClassification = createAsyncThunk('vendor/accountClassification', async (_, thunkAPI) => {
  try {
    return await agent.Vendor.accountClassification()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setFilterFields: (state, action) => {
      state.filterFields = action.payload
    },
  },
})

export const { setToken, setFilterFields } = vendorSlice.actions
