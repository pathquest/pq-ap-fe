import agent from '@/api/axios'
import {
  AssignUserCompany,
  CompanyDataById,
  CompanyGetListOptions,
  GetCompanyImage,
  PerformActions,
  SaveCompany,
  CompanyIdDropDown,
  ConncetSageCompany,
  ConncetSageUser,
  QbConncet,
  ReconncetSageCompany,
  XeroConncet,
} from '@/models/company'
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
  }
}

const initialState: ProfileState = {
  token: '',
  companyList: [],
  selectedCompany: {
    label: '',
    value: '',
  },
}

export const companyGetList = createAsyncThunk('company/companyGetList', async (data: CompanyGetListOptions, thunkAPI) => {
  try {
    return await agent.Company.companyGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const companyAssignUser = createAsyncThunk('company/companyAssignUser', async (data: CompanyIdDropDown, thunkAPI) => {
  try {
    return await agent.Company.companyAssignUser(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const manageCompanyAssignUser = createAsyncThunk(
  'company/manageCompanyAssignUser',
  async (data: CompanyIdDropDown, thunkAPI) => {
    try {
      return await agent.Company.manageCompanyAssignUser(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const companyListDropdown = createAsyncThunk('company/companyListDropdown', async (_, thunkAPI) => {
  try {
    return await agent.Company.companyListDropdown()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const uploadCompanyImage = createAsyncThunk('user/uploadCompanyImage', async (data: any, thunkAPI) => {
  try {
    return await agent.Company.uploadCompanyImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getCompanyImage = createAsyncThunk('user/getCompanyImage', async (data: GetCompanyImage, thunkAPI) => {
  try {
    return await agent.Company.getCompanyImage(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const performCompanyActions = createAsyncThunk('company/performCompanyActions', async (data: PerformActions, thunkAPI) => {
  try {
    return await agent.Company.performCompanyActions(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveCompany = createAsyncThunk('company/saveCompany', async (data: SaveCompany, thunkAPI) => {
  try {
    return await agent.Company.saveCompany(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const companyGetById = createAsyncThunk('company/companyGetById', async (data: CompanyDataById, thunkAPI) => {
  try {
    return await agent.Company.companyGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const redirectQb = createAsyncThunk('company/redirectQb', async (_, thunkAPI) => {
  try {
    return await agent.Company.redirectQb()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const conncetQb = createAsyncThunk('company/conncetQb', async (data: QbConncet, thunkAPI) => {
  try {
    return await agent.Company.conncetQb(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const redirectXero = createAsyncThunk('company/redirectXero', async (_, thunkAPI) => {
  try {
    return await agent.Company.redirectXero()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const conncetXero = createAsyncThunk('company/conncetXero', async (data: XeroConncet, thunkAPI) => {
  try {
    return await agent.Company.conncetXero(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const sageUserConnect = createAsyncThunk('company/sageUserConnect', async (data: ConncetSageUser, thunkAPI) => {
  try {
    return await agent.Company.sageUserConnect(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const sageCompanyConnect = createAsyncThunk('company/sageCompanyConnect', async (data: ConncetSageCompany, thunkAPI) => {
  try {
    return await agent.Company.sageCompanyConnect(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const sageCompanyReconnect = createAsyncThunk(
  'company/sageCompanyReconnect',
  async (data: ReconncetSageCompany, thunkAPI) => {
    try {
      return await agent.Company.sageCompanyReconnect(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const AssignUserToCompany = createAsyncThunk('company/AssignUserToCompany', async (data: AssignUserCompany, thunkAPI) => {
  try {
    return await agent.Company.AssignUserToCompany(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const filterAccounting = createAsyncThunk('company/filterAccounting', async (_, thunkAPI) => {
  try {
    return await agent.Company.filterAccounting()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setCompanyListItems: (state, action) => {
      state.companyList = action.payload
    },
    setSelectedCompany: (state, action) => {
      state.selectedCompany = action.payload
    },
    logout: (state) => {
      state.selectedCompany = { label: '', value: '' }
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

export const { setToken, setCompanyListItems, setSelectedCompany, logout } = companySlice.actions
