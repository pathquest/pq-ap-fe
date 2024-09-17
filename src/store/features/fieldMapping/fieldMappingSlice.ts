import agent from '@/api/axios'
import {
  GetFieldMappings, SaveFieldMappings
} from '@/models/fieldMapping'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'


interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const getFieldMappingData = createAsyncThunk('fieldMapping/getFieldMappingData', async (data: GetFieldMappings, thunkAPI) => {
  try {
    return await agent.FieldMapping.getFieldMappingData(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveFieldMappingData = createAsyncThunk('fieldMapping/saveFieldMappingData', async (data: SaveFieldMappings, thunkAPI) => {
  try {
    return await agent.FieldMapping.saveFieldMappingData(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const fieldMappingSlice = createSlice({
  name: 'fieldMapping',
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

export const { setToken } = fieldMappingSlice.actions
