import agent from '@/api/axios'
import { GLAccountOptions, ProductServiceGetListOptions, SyncProductServiceMasterOptions } from '@/models/product&ServiceMaster'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const syncProductServiceMaster = createAsyncThunk(
  'productService/syncProductServiceMaster',
  async (_, thunkAPI) => {
    try {
      return await agent.ProductService.syncProductServiceMaster()
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const productServiceGetList = createAsyncThunk(
  'productService/productServiceGetList',
  async (data: ProductServiceGetListOptions, thunkAPI) => {
    try {
      return await agent.ProductService.productServiceGetList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const glAccountList = createAsyncThunk('productService/glAccountList', async (data: GLAccountOptions, thunkAPI) => {
  try {
    return await agent.ProductService.glAccountList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const productServiceSlice = createSlice({
  name: 'productService',
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

export const { setToken } = productServiceSlice.actions
