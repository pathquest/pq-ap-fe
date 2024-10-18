import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import agent from '@/api/axios'
import {
  SignInOptions,
  SignUpOptions,
  SocialSignInOptions,
  ForgotPasswordOptions,
  GenerateOtpOptions,
  ValidateOtpOptions,
  SetPasswordOptions,
  ReauthenticationProps, 
  DefaultProductOptions,
} from '@/models/auth'

interface AuthState {
  token: string
  isLeftSidebarCollapsed: boolean
  notificationCount: number
}

const initialState: AuthState = {
  token: '',
  isLeftSidebarCollapsed: false,
  notificationCount: 0,
}

export const signInUser = createAsyncThunk('auth/signInUser', async (data: SignInOptions, thunkAPI) => {
  try {
    return await agent.Auth.login(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const signUpUser = createAsyncThunk('auth/signUpUser', async (data: SignUpOptions, thunkAPI) => {
  try {
    return await agent.Auth.register(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const setDefaultProduct = createAsyncThunk('auth/setDefaultProduct', async (data: DefaultProductOptions, thunkAPI) => {
  try {
    return await agent.Auth.setDefaultProduct(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const socialSignInUser = createAsyncThunk('auth/socialSignInUser', async (data: SocialSignInOptions, thunkAPI) => {
  try {
    return await agent.Auth.socialLogin(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const forgotPasswordCall = createAsyncThunk('auth/forgotPassword', async (data: ForgotPasswordOptions, thunkAPI) => {
  try {
    return await agent.Auth.forgotPassword(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getQboConnectUrl = createAsyncThunk('auth/getQboConnectUrl', async (_, thunkAPI) => {
  try {
    return await agent.Auth.getQboConnectUrl()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const generateOtp = createAsyncThunk('auth/generateOtp', async (data: GenerateOtpOptions, thunkAPI) => {
  try {
    return await agent.Auth.generateOtp(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const validateOtp = createAsyncThunk('auth/validateOtp', async (data: ValidateOtpOptions, thunkAPI) => {
  try {
    return await agent.Auth.validateOtp(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const setPasswordUrl = createAsyncThunk('auth/setPassword', async (data: SetPasswordOptions, thunkAPI) => {
  try {
    return await agent.Auth.setPassword(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const reauthentication = createAsyncThunk('auth/reauthentication', async (data: ReauthenticationProps , thunkAPI) => {
  try {
    return await agent.Auth.reauthentication(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setLeftSidebarCollapsed: (state, action) => {
      state.isLeftSidebarCollapsed = action.payload
    },
    setNotificationCount: (state, action) => {
      state.notificationCount = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAnyOf(signInUser.fulfilled), (state, action) => {
      state.token = action.payload
    })
    builder.addMatcher(isAnyOf(signInUser.rejected), (state, action) => {
      throw action.payload
    })
  },
})

export const { setToken, setLeftSidebarCollapsed, setNotificationCount } = authSlice.actions
