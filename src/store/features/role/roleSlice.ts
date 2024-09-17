import agent from '@/api/axios'
import {
  PermissionListOptions,
  RoleGetIdOptions,
  RoleGetListOptions,
  RoleListOptions,
  RoleRemoveOptions,
  SavePermissionOptions,
  SaveRoleOptions,
} from '@/models/role'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const roleListDropdown = createAsyncThunk('role/roleListDropdown', async (data: RoleListOptions, thunkAPI) => {
  try {
    return await agent.Role.roleListDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const roleGetList = createAsyncThunk('role/roleGetList', async (data: RoleGetListOptions, thunkAPI) => {
  try {
    return await agent.Role.roleGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const permissionGetList = createAsyncThunk('role/permissionGetList', async (data: PermissionListOptions, thunkAPI) => {
  try {
    return await agent.Role.permissionGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const roleRemove = createAsyncThunk('role/roleRemove', async (data: RoleRemoveOptions, thunkAPI) => {
  try {
    return await agent.Role.roleRemove(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const savePermission = createAsyncThunk('role/savePermission', async (data: SavePermissionOptions, thunkAPI) => {
  try {
    return await agent.Role.savePermission(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveRole = createAsyncThunk('role/saveRole', async (data: SaveRoleOptions, thunkAPI) => {
  try {
    return await agent.Role.saveRole(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const roleGetById = createAsyncThunk('role/roleGetById', async (data: RoleGetIdOptions, thunkAPI) => {
  try {
    return await agent.Role.roleGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const roleSlice = createSlice({
  name: 'role',
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

export const { setToken } = roleSlice.actions
