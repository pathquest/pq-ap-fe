import agent from '@/api/axios'
import { AutomationGetRuleListOptions, RuleActiveInactiveOptions, RuleByIdOptions, SaveRuleOptions } from '@/models/automation'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const automationGetRuleList = createAsyncThunk('automation/automationGetRuleList', async (data: AutomationGetRuleListOptions, thunkAPI) => {
  try {
    return await agent.Automation.automationGetRuleList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const ruleActiveInactive = createAsyncThunk('automation/ruleActiveInactive', async (data: RuleActiveInactiveOptions, thunkAPI) => {
  try {
    return await agent.Automation.ruleActiveInactive(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const ruleGetById = createAsyncThunk('automation/ruleGetById', async (data: RuleByIdOptions, thunkAPI) => {
  try {
    return await agent.Automation.ruleGetById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveRule = createAsyncThunk('automation/saveRule', async (data: SaveRuleOptions, thunkAPI) => {
  try {
    return await agent.Automation.saveRule(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const automationSlice = createSlice({
  name: 'automation',
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

export const { setToken } = automationSlice.actions
