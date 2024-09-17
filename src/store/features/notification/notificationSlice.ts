import agent from '@/api/axios'
import { GetEmailTemplate, ReadDeleteAllNotificationProps, SaveEmailTemplate, SaveNotificationMatrix, SaveSummaryData, UpdateSummaryStatus } from '@/models/notification'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  token: string
}

const initialState: ProfileState = {
  token: '',
}

export const getNotificationMatrix = createAsyncThunk('auth/getNotificationMatrix', async (_, thunkAPI) => {
  try {
    return await agent.Notification.getNotificationMatrix()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveNotificationMatrix = createAsyncThunk(
  'notification/saveNotificationMatrix',
  async (data: SaveNotificationMatrix, thunkAPI) => {
    try {
      return await agent.Notification.saveNotificationMatrix(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getEmailTemplate = createAsyncThunk('notification/getEmailTemplate', async (data: GetEmailTemplate, thunkAPI) => {
  try {
    return await agent.Notification.getEmailTemplate(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getSlugDropdown = createAsyncThunk('notification/getSlugDropdown', async (data: { Id: number }, thunkAPI) => {
  try {
    return await agent.Notification.getSlugDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveEmailTemplate = createAsyncThunk('notification/saveEmailTemplate', async (data: SaveEmailTemplate, thunkAPI) => {
  try {
    return await agent.Notification.saveEmailTemplate(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const updateSummaryStatus = createAsyncThunk(
  'notification/updateSummaryStatus',
  async (data: UpdateSummaryStatus, thunkAPI) => {
    try {
      return await agent.Notification.updateSummaryStatus(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getSummaryData = createAsyncThunk('auth/getSummaryData', async (_, thunkAPI) => {
  try {
    return await agent.Notification.getSummaryData()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveSummaryData = createAsyncThunk('notification/saveSummaryData', async (data: SaveSummaryData, thunkAPI) => {
  try {
    return await agent.Notification.saveSummaryData(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getNotificationList = createAsyncThunk('auth/getNotificationList', async (_, thunkAPI) => {
  try {
    return await agent.Notification.getNotificationList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const readAllNotifications = createAsyncThunk(
  'notification/readAllNotifications',
  async (data: ReadDeleteAllNotificationProps, thunkAPI) => {
    try {
      return await agent.Notification.readAllNotifications(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (data: ReadDeleteAllNotificationProps, thunkAPI) => {
    try {
      return await agent.Notification.deleteAllNotifications(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const resetEmailTemplate = createAsyncThunk(
  'notification/resetemailtemplate',
  async (data: { id: number}, thunkAPI) => {
    try {
      return await agent.Notification.resetEmailTemplate(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
  },
})

export const { setToken } = notificationSlice.actions
