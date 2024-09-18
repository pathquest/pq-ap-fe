import agent from '@/api/axios'
import {
  AssignCompanyToUser,
  CityListOptions,
  GetUserImage,
  SaveManageRight,
  StateListOptions,
  TimezoneListOptions,
  UserDataOptions,
  UserDelete,
  UserGetCompanyDropdown,
  UserGetListOptions,
  UserGetManageRights,
  UserSaveDataOptions,
  UserUpdateStatusOptions,
} from '@/models/user'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface CompanyListProps {
  label: string
  value: string
  accountingTool: number
}

interface ProfileState {
  token: string
  companyList: CompanyListProps[]
  selectedCompany: {
    label: string
    value: string
    accountingTool: number
  }
  isRefresh: boolean
  selectedCompanyId: number
}

const initialState: ProfileState = {
  token: '',
  companyList: [],
  selectedCompany: {
    label: '',
    value: '',
    accountingTool: 0,
  },
  isRefresh: false,
  selectedCompanyId: 0
}
export const userGetList = createAsyncThunk('user/userGetList', async (data: UserGetListOptions, thunkAPI) => {
  try {
    return await agent.User.userGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const userUpdateStatus = createAsyncThunk('user/userUpdateStatus', async (data: UserUpdateStatusOptions, thunkAPI) => {
  try {
    return await agent.User.userUpdateStatus(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const userSaveData = createAsyncThunk('user/userSaveData', async (data: UserSaveDataOptions, thunkAPI) => {
  try {
    return await agent.User.userSaveData(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const countryListDropdown = createAsyncThunk('user/countryListDropdown', async (_, thunkAPI) => {
  try {
    return await agent.User.countryListDropdown()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const userListDropdown = createAsyncThunk('user/userListDropdown', async (_, thunkAPI) => {
  try {
    return await agent.User.userListDropdown()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getAssignUsertoCompany = createAsyncThunk(
  'user/getAssignUsertoCompany',
  async (data: UserGetCompanyDropdown, thunkAPI) => {
    try {
      return await agent.User.getAssignUsertoCompany(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const assignCompanyToUser = createAsyncThunk('user/assignCompanyToUser', async (data: AssignCompanyToUser, thunkAPI) => {
  try {
    return await agent.User.assignCompanyToUser(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const uploadUserImage = createAsyncThunk('user/uploadUserImage', async (data: any, thunkAPI) => {
  try {
    return await agent.User.uploadUserImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getUserImage = createAsyncThunk('user/getUserImage', async (data: GetUserImage, thunkAPI) => {
  try {
    return await agent.User.getUserImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const deleteUser = createAsyncThunk('user/deleteUser', async (data: UserDelete, thunkAPI) => {
  try {
    return await agent.User.deleteUser(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const userGetDataById = createAsyncThunk('user/userGetDataById', async (data: UserDataOptions, thunkAPI) => {
  try {
    return await agent.User.userGetDataById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const userGetManageRights = createAsyncThunk('user/userGetManageRights', async (data: UserGetManageRights, thunkAPI) => {
  try {
    return await agent.User.userGetManageRights(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const timezoneListDropdown = createAsyncThunk('user/timezoneListDropdown', async (data: TimezoneListOptions, thunkAPI) => {
  try {
    return await agent.User.timezoneListDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const stateListDropdown = createAsyncThunk('user/stateListDropdown', async (data: StateListOptions, thunkAPI) => {
  try {
    return await agent.User.stateListDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const cityListDropdown = createAsyncThunk('user/cityListDropdown', async (data: CityListOptions, thunkAPI) => {
  try {
    return await agent.User.cityListDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const SaveAssignRoles = createAsyncThunk('user/SaveManageRight', async (data: SaveManageRight, thunkAPI) => {
  try {
    return await agent.User.SaveManageRight(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setCompanyList: (state, action) => {
      state.companyList = action.payload
    },
    setSelectedCompanyId: (state, action) => {
      state.selectedCompanyId = action.payload
    },
    setSelectedCompany: (state, action) => {
      state.selectedCompany = action.payload
    },
    setIsRefresh: (state, action) => {
      state.isRefresh = action.payload
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

export const { setToken, setCompanyList, setSelectedCompany, setIsRefresh, setSelectedCompanyId } = userSlice.actions
