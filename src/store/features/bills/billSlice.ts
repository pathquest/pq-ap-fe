import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import agent from '@/api/axios'
import {
  BillPostingFilterFormFieldsProps,
  GetOcrDocumentOptions,
  SplitDocumentOptions,
  VendorListOptions,
  AssignDocumentToUserOptionsProps,
  AssigneeOptionsProps,
  DeleteDocumentOptionsProps,
  DocumentGetListOptions,
  GetColumnMappingListOptionsProps,
  GetDocumentByIdOptionsProps,
  GetFieldMappingOptionsProps,
  MergeDocumentOptionsProps,
  RemoveDocumentOptionsProps,
  UserListOptionsProps,
  DocumentGetOverviewListOptions,
  DeleteDocumentOverviewOptionsProps,
} from '@/models/billPosting'
import { format, subMonths } from 'date-fns'

const firstDayOfPreviousMonth = subMonths(new Date(), 1)
const formattedDate = format(firstDayOfPreviousMonth, 'MM/dd/yyyy')
const formattedCurrentDate = format(new Date(), 'MM/dd/yyyy')

interface AuthState {
  IsFromDocuments: boolean
  billStatus: number
  selectedProcessTypeInList: number | string
  filterFormFields: BillPostingFilterFormFieldsProps
  isVisibleSidebar: boolean
}

const initialState: AuthState = {
  isVisibleSidebar: true,
  IsFromDocuments: false,
  billStatus: 0,
  selectedProcessTypeInList: '1',
  filterFormFields: {
    ft_status: ['1', '2', '6', '8'],
    ft_assignee: '1',
    ft_process: ['1','2'],
    ft_select_users: [],
    ft_overview_status: ['1','2','3','4','5'],
    ft_vendor: null,
    ft_datepicker: `${formattedDate} to ${formattedCurrentDate}`,
    ft_location: null,
  },
}

export const documentGetList = createAsyncThunk('bill/documentGetList', async (data: DocumentGetListOptions, thunkAPI) => {
  try {
    return await agent.Bill.documentGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const documentBillsOverviewList = createAsyncThunk('bill/documentBillsOverviewList', async (data: DocumentGetOverviewListOptions, thunkAPI) => {
  try {
    return await agent.Bill.documentBillsOverviewList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const documentGetStatusList = createAsyncThunk('auth/documentGetStatusDropdown', async (_, thunkAPI) => {
  try {
    return await agent.Bill.documentGetStatusList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getVendorList = createAsyncThunk('auth/getVendorList', async (data: VendorListOptions, thunkAPI) => {
  try {
    return await agent.Bill.getVendorList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getProcessList = createAsyncThunk('auth/getProcessList', async (_, thunkAPI) => {
  try {
    return await agent.Bill.getProcessList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getLocationList = createAsyncThunk('auth/getLocationList', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getLocationList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getUserList = createAsyncThunk('auth/getUserList', async (data: UserListOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.getUserList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const removeDocument = createAsyncThunk('auth/removeDocument', async (data: RemoveDocumentOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.removeDocument(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const deleteDocument = createAsyncThunk('auth/deleteDocument', async (data: DeleteDocumentOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.deleteDocument(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const deleteOverviewDocument = createAsyncThunk('auth/deleteOverviewDocument', async (data: DeleteDocumentOverviewOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.deleteOverviewDocument(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})


export const getfieldmappings = createAsyncThunk('bill/getfieldmappings', async (data: GetFieldMappingOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.getfieldmappings(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getAssigneeList = createAsyncThunk('bill/getAssigneeList', async (data: AssigneeOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.getAssigneeList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const assignDocumentsToUser = createAsyncThunk(
  'bill/assignDocumentsToUser',
  async (data: AssignDocumentToUserOptionsProps, thunkAPI) => {
    try {
      return await agent.Bill.assignDocumentsToUser(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const documentDetailById = createAsyncThunk('bill/documentDetailById', async (data: GetDocumentByIdOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.documentDetailById(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const mergeDocuments = createAsyncThunk('bill/mergeDocuments', async (data: MergeDocumentOptionsProps, thunkAPI) => {
  try {
    return await agent.Bill.mergeDocuments(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const splitDocuments = createAsyncThunk('bill/splitDocuments', async (data: SplitDocumentOptions, thunkAPI) => {
  try {
    return await agent.Bill.splitDocuments(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getocrDocument = createAsyncThunk('bill/getocrDocument', async (_, thunkAPI) => {
  try {
    return await agent.Bill.getocrDocument()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const accountPayableSave = createAsyncThunk('bill/accountPayableSave', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.accountPayableSave(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getColumnMappingList = createAsyncThunk(
  'bill/getColumnMappingList',
  async (data: GetColumnMappingListOptionsProps, thunkAPI) => {
    try {
      return await agent.Bill.getColumnMappingList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getColumnMappingOverviewList = createAsyncThunk(
  'bill/getColumnMappingOverviewList',
  async (data: GetColumnMappingListOptionsProps, thunkAPI) => {
    try {
      return await agent.Bill.getColumnMappingOverviewList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getColumnMappingBillsOverview = createAsyncThunk(
  'bill/getColumnMappingBillsOverview',
  async (data: GetColumnMappingListOptionsProps, thunkAPI) => {
    try {
      return await agent.Bill.getColumnMappingBillsOverview(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const saveColumnMappingList = createAsyncThunk('bill/saveColumnMappingList', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.saveColumnMappingList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const uploadAttachment = createAsyncThunk('bill/uploadAttachment', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.uploadAttachment(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const processTypeChangeByDocumentId = createAsyncThunk(
  'bill/processTypeChangeByDocumentId',
  async (data: any, thunkAPI) => {
    try {
      return await agent.Bill.processTypeChangeByDocumentId(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const vendorDropdown = createAsyncThunk('bill/vendorDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.vendorDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const termDropdown = createAsyncThunk('bill/termDropdown', async (data: VendorListOptions, thunkAPI) => {
  try {
    return await agent.Bill.termDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const deletelineItem = createAsyncThunk('bill/deletelineItem', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.deletelineItem(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getGLAccountDropdown = createAsyncThunk('bill/getGLAccountDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getGLAccountDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getClassDropdown = createAsyncThunk('bill/getClassDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getClassDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getProductServiceDropdown = createAsyncThunk('bill/getProductServiceDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getProductServiceDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getCustomerDropdown = createAsyncThunk('bill/getCustomerDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getCustomerDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getProjectDropdown = createAsyncThunk('bill/getProjectDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getProjectDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getDepartmentDropdown = createAsyncThunk('bill/getDepartmentDropdown', async (data: any, thunkAPI) => {
  try {
    return await agent.Bill.getDepartmentDropdown(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveOverviewColumnMapping = createAsyncThunk(
  'bill/saveOverviewColumnMapping',
  async (data: any, thunkAPI) => {
    try {
      return await agent.Bill.saveOverviewColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setSelectedStatus: (state, action) => {
      state.billStatus = action.payload
    },
    setIsFormDocuments: (state, action) => {
      state.IsFromDocuments = action.payload
    },
    setSelectedProcessTypeFromList: (state, action) => {
      state.selectedProcessTypeInList = action.payload
    },
    setFilterFormFields: (state, action) => {
      state.filterFormFields = action.payload
    },
    setIsVisibleSidebar: (state, action) => {
      state.isVisibleSidebar = action.payload
    },
  },
})

export const {
  setIsFormDocuments,
  setSelectedStatus,
  setSelectedProcessTypeFromList,
  setFilterFormFields,
  setIsVisibleSidebar,
} = billSlice.actions