import agent from '@/api/axios'
import { HistoryFilterFormFieldsProps, HandleHistoryDocumentRetryProps, HistoryGetListProps, LinkBillToExistingBillProps } from '@/models/files'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface FilesState {
  filterFormFields: HistoryFilterFormFieldsProps
}

const initialState: FilesState = {
  filterFormFields: {
    fh_source: [],
    fh_received_uploaded: [],
    fh_uploaded_date: '',
    fh_bill_number: [],
    fh_process: []
  }
}

export const historyGetList = createAsyncThunk('files/historyGetList', async (data: HistoryGetListProps, thunkAPI) => {
  try {
    return await agent.Files.historyGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getBillNumbersList = createAsyncThunk('files/getBillNumbersList', async (_, thunkAPI) => {
  try {
    return await agent.Files.getBillNumbersList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const linkBillToExistingBill = createAsyncThunk('files/linkBillToExistingBill', async (data: LinkBillToExistingBillProps, thunkAPI) => {
  try {
    return await agent.Files.linkBillToExistingBill(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const handleHistoryDocumentRetry = createAsyncThunk('files/handleHistoryDocumentRetry', async (data: HandleHistoryDocumentRetryProps, thunkAPI) => {
  try {
    return await agent.Files.handleHistoryDocumentRetry(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const files = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFilterFormFields: (state, action) => {
      state.filterFormFields = action.payload
    }
  },
})

export const { setFilterFormFields } = files.actions