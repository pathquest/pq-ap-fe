import agent from '@/api/axios'
import { GetSearchHistoryOptions, SaveSearchHistoryOptions, SearchResultOptions } from '@/models/global'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  searchSelectedModule: string
}

const initialState: ProfileState = {
  searchSelectedModule: '6',
}

export const getSearchHistory = createAsyncThunk('global/getSearchHistory', async (data: GetSearchHistoryOptions, thunkAPI) => {
  try {
    return await agent.Global.getSearchHistory(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveSearchHistory = createAsyncThunk(
  'global/saveSearchHistory',
  async (data: SaveSearchHistoryOptions, thunkAPI) => {
    try {
      return await agent.Global.saveSearchHistory(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getSearchResult = createAsyncThunk('global/getSearchResult', async (data: SearchResultOptions, thunkAPI) => {
  try {
    return await agent.Global.getSearchResult(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const globalSearch = createSlice({
  name: 'globalSearch',
  initialState,
  reducers: {
    setSearchSelectedModule: (state, action) => {
      state.searchSelectedModule = action.payload
    },
  },
})

export const { setSearchSelectedModule } = globalSearch.actions
