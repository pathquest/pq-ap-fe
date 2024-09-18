import agent from '@/api/axios'
import { handleResponse } from '@/api/server/common'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState: any = {
  filterFormFields: {
    ft_organizationName: 23,
    ft_companyName: [],
    ft_viewByMonth: '',
  },
}

export const companyDropdownbyOrg = createAsyncThunk('accountantDashboard/companyDropdownbyOrg', async (data: any, thunkAPI) => {
  try {
    return await agent.accountantDashboard.companyDropdownbyOrg(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const billingInfoList = createAsyncThunk('accountantDashboard/billingInfoList', async (data: any, thunkAPI) => {
  try {
    return await agent.accountantDashboard.billingInfoList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const accountingDashboardList = createAsyncThunk('accountantDashboard/accountingDashboardList', async (data: any, thunkAPI) => {
  try {
    return await agent.accountantDashboard.accountingDashboardList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export async function getOrganizationDropdown() {
  const response = await agent.accountantDashboard.organizationDropdown()
  return handleResponse(response)
}

export const accountantDashboard = createSlice({
  name: 'accountantDashboard',
  initialState,
  reducers: {
    setFilterFormFields: (state, action) => {
      state.filterFormFields = action.payload
    },
  },
})

export const { setFilterFormFields } = accountantDashboard.actions
