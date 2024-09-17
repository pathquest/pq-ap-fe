import agent from '@/api/axios'
import { ApTermDropdownOptions, ApTermGetListOptions, SaveTermOptions, SyncApTermMasterOptions, TermByIdOptions, UpdateTermStatusOptions } from '@/models/aptermMaster'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const syncApTermMaster = createAsyncThunk(
  'apterm/syncApTermMaster',
  async (_, thunkAPI) => {
    try {
      return await agent.ApTerm.syncApTermMaster()
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const updateTermStatus = createAsyncThunk('apTerm/updateTermStatus', async (data: UpdateTermStatusOptions, thunkAPI) => {
  try {
    return await agent.ApTerm.updateTermStatus(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

//No Accounting Tool
export const importApTermData = createAsyncThunk(
  'apterm/importApTermData',
  async (data: any, thunkAPI) => {
    try {
      return await agent.ApTerm.importApTermData(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const aptermGetList = createAsyncThunk(
  'apterm/aptermGetList',
  async (data: ApTermGetListOptions, thunkAPI) => {
    try {
      return await agent.ApTerm.aptermGetList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const aptermDropdown = createAsyncThunk(
  'apterm/aptermDropdown',
  async (data: ApTermDropdownOptions, thunkAPI) => {
    try {
      return await agent.ApTerm.aptermDropdown(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)
export const termGetById = createAsyncThunk('apterm/termGetById', async (data: TermByIdOptions, thunkAPI) => {
  try {
    return await agent.ApTerm.termGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveTerm = createAsyncThunk('apterm/saveTerm', async (data: SaveTermOptions, thunkAPI) => {
  try {
    return await agent.ApTerm.saveTerm(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const aptermSlice = createSlice({
  name: 'apterm',
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

export const { setToken } = aptermSlice.actions
