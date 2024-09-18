import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import agent from '@/api/axios'
import { ProfileFormFieldsProps } from '@/models/formFields'
import { GetUserImage } from '@/models/user'

interface ProfileState {
  organizationName: string,
  processPermissionsMatrix: any[]
  orgPermissionsMatrix: any[]
  RoleId: number
}

const initialState: ProfileState = {
  organizationName: '',
  processPermissionsMatrix: [],
  orgPermissionsMatrix: [],
  RoleId: 0
}

export const getUserProfile = createAsyncThunk('profile/getUserProfile', async (_, thunkAPI) => {
  try {
    return await agent.Profile.getUserProfile()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getUserConfig = createAsyncThunk('profile/getUserConfig', async (_, thunkAPI) => {
  try {
    return await agent.Profile.getUserConfig()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getCountries = createAsyncThunk('profile/getCountries', async (_, thunkAPI) => {
  try {
    return await agent.Profile.getCountries()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getStates = createAsyncThunk('profile/getStates', async ({ id }: { id: number }, thunkAPI) => {
  try {
    return await agent.Profile.getStates(id)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getCities = createAsyncThunk('profile/getCities', async ({ id }: { id: number }, thunkAPI) => {
  try {
    return await agent.Profile.getCities(id)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getTimeZone = createAsyncThunk('profile/getTimeZone', async ({ id }: { id: number }, thunkAPI) => {
  try {
    return await agent.Profile.getTimeZone(id)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveUserProfile = createAsyncThunk('profile/saveUserProfile', async (data: ProfileFormFieldsProps, thunkAPI) => {
  try {
    return await agent.Profile.saveUserProfile(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const uploadUserImage = createAsyncThunk('user/uploadUserImage', async (data: any, thunkAPI) => {
  try {
    return await agent.Profile.uploadUserImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getUserImage = createAsyncThunk('user/getUserImage', async (data: GetUserImage, thunkAPI) => {
  try {
    return await agent.Profile.getUserImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setData: (state, action) => {
      // state.data = action.payload
    },
    setOrganizationName: (state, action) => {
      state.organizationName = action.payload
    },
    setProcessPermissionsMatrix: (state, action) => {
      state.processPermissionsMatrix = action.payload
    },
    setOrgPermissionsMatrix: (state, action) => {
      state.orgPermissionsMatrix = action.payload
    },
    setRoleId: (state, action) => {
      state.RoleId = action.payload
    },
  },
})

export const { setData, setOrganizationName, setProcessPermissionsMatrix, setOrgPermissionsMatrix, setRoleId } = profileSlice.actions
