import agent from '@/api/axios'
import { GLAccountByIdOptions, GLAccountDropdownOptions, GLAccountGetListOptions, SaveGLAccountOptions, SyncGLAccountMasterOptions, UpdateGLAccountStatusOptions } from '@/models/glAccountMaster'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const syncGLAccountMaster = createAsyncThunk(
  'glAccount/syncGLAccountMaster',
  async (_, thunkAPI) => {
    try {
      return await agent.GLAccount.syncGLAccountMaster()
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const updateAccountStatus = createAsyncThunk('glAccount/updateAccountStatus', async (data: UpdateGLAccountStatusOptions, thunkAPI) => {
  try {
    return await agent.GLAccount.updateAccountStatus(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const glAccountGetById = createAsyncThunk('glAccount/glAccountGetById', async (data: GLAccountByIdOptions, thunkAPI) => {
  try {
    return await agent.GLAccount.glAccountGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveGLAccount = createAsyncThunk('glAccount/saveGLAccount', async (data: SaveGLAccountOptions, thunkAPI) => {
  try {
    return await agent.GLAccount.saveGLAccount(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const glAccountGetList = createAsyncThunk(
  'glAccount/glAccountGetList',
  async (data: GLAccountGetListOptions, thunkAPI) => {
    try {
      return await agent.GLAccount.glAccountGetList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const GLAccountDropdown = createAsyncThunk(
  'glAccount/GLAccountDropdown',
  async (data: GLAccountDropdownOptions, thunkAPI) => {
    try {
      return await agent.GLAccount.GLAccountDropdown(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

//No Accounting Tool
export const importGLAccountData = createAsyncThunk(
  'glAccount/importGLAccountData',
  async (data: any, thunkAPI) => {
    try {
      return await agent.GLAccount.importGLAccountData(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const GLAccountDropdownWithType = createAsyncThunk(
  'glAccount/GLAccountDropdownWithType',
  async (data: GLAccountDropdownOptions, thunkAPI) => {
    try {
      return await agent.GLAccount.GLAccountDropdownWithType(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const glAccountSlice = createSlice({
  name: 'glAccount',
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

export const { setToken } = glAccountSlice.actions
