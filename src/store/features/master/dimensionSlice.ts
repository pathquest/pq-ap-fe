import agent from '@/api/axios'
import {
  ClassByIdOptions,
  ClassGetListOptions,
  DepartmentByIdOptions,
  DepartmentGetListOptions,
  LocationByIdOptions,
  LocationGetDropdownListOptions,
  LocationGetListOptions,
  LocationListDropdownOptions,
  ProjectByIdOptions,
  ProjectGetListOptions,
  SaveClassOptions,
  SaveDepartmentOptions,
  SaveLocationOptions,
  SaveProjectOptions
} from '@/models/dimensionMaster'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const syncDimensionMaster = createAsyncThunk('dimension/syncDimensionMaster', async ({ tab }: any, thunkAPI) => {
  try {
    return await agent.Dimension.syncDimensionMaster(tab)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const updateDimensionMaster = createAsyncThunk('dimension/updateDimensionMaster', async ({ data, tab }: any, thunkAPI) => {
  try {
    return await agent.Dimension.updateDimensionMaster(data, tab)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

//No Accounting Tool
export const importDimensionData = createAsyncThunk(
  'dimension/importDimensionData',
  async ({ data, tab }: any, thunkAPI) => {
    try {
      return await agent.Dimension.importDimensionData(data, tab)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)


export const classGetList = createAsyncThunk('dimension/classGetList', async (data: ClassGetListOptions, thunkAPI) => {
  try {
    return await agent.Dimension.classGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const classGetById = createAsyncThunk('dimension/classGetById', async (data: ClassByIdOptions, thunkAPI) => {
  try {
    return await agent.Dimension.classGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveClass = createAsyncThunk('dimension/saveClass', async (data: SaveClassOptions, thunkAPI) => {
  try {
    return await agent.Dimension.saveClass(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const departmentGetList = createAsyncThunk(
  'dimension/departmentGetList',
  async (data: DepartmentGetListOptions, thunkAPI) => {
    try {
      return await agent.Dimension.departmentGetList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const departmentGetById = createAsyncThunk(
  'dimension/departmentGetById',
  async (data: DepartmentByIdOptions, thunkAPI) => {
    try {
      return await agent.Dimension.departmentGetById(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const saveDepartment = createAsyncThunk('dimension/saveDepartment', async (data: SaveDepartmentOptions, thunkAPI) => {
  try {
    return await agent.Dimension.saveDepartment(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const locationGetList = createAsyncThunk('dimension/locationGetList', async (data: LocationGetListOptions, thunkAPI) => {
  try {
    return await agent.Dimension.locationGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const locationGetById = createAsyncThunk('dimension/locationGetById', async (data: LocationByIdOptions, thunkAPI) => {
  try {
    return await agent.Dimension.locationGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const locationListDropdown = createAsyncThunk('dimension/locationListDropdown', async (data: LocationListDropdownOptions, thunkAPI) => {
  try {
    return await agent.Dimension.locationListDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const locationGetDropdownList = createAsyncThunk('dimension/locationGetDropdownList', async (data: LocationGetDropdownListOptions, thunkAPI) => {
  try {
    return await agent.Dimension.locationGetDropdownList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveLocation = createAsyncThunk('dimension/saveLocation', async (data: SaveLocationOptions, thunkAPI) => {
  try {
    return await agent.Dimension.saveLocation(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const projectGetList = createAsyncThunk('dimension/projectGetList', async (data: ProjectGetListOptions, thunkAPI) => {
  try {
    return await agent.Dimension.projectGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const projectGetById = createAsyncThunk('dimension/projectGetById', async (data: ProjectByIdOptions, thunkAPI) => {
  try {
    return await agent.Dimension.projectGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveProject = createAsyncThunk('dimension/saveProject', async (data: SaveProjectOptions, thunkAPI) => {
  try {
    return await agent.Dimension.saveProject(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const dimensionSlice = createSlice({
  name: 'dimension',
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

export const { setToken } = dimensionSlice.actions
