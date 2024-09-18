import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import agent from '@/api/axios'
import {
  PaymentGetListProps,
  PaymentColumnMappingProps,
  SaveColumnMappingProps,
  ProfileStateProps,
  MarkaspaidProps,
  VendorAgingListProps,
  VendorAgingDaysDrpdwn,
  VendorCreditListProps,
  BankAccDropDownProps,
  MoveBillToPayProps,
  BillDetailsPayload,
  PaymentPayload,
  BillDetailsProps,
  getPaymentMethodsProps,
} from '@/models/billsToPay'
import {
  ActivityListOptions,
  ActivityNotificationOptions,
  ActivityWatcherListOptions,
  SaveActivityListOptions,
  SaveWatcherListOptions,
  UpdateResloved,
} from '@/models/activity'

const initialState: ProfileStateProps = {
  token: '',
  startDay: 1,
  endDay: 30,
  currentPath: '',
  vendorIdList: [],
  agingFilter: 0,
  allvendorOptions: [],

  filterFormFields: {
    paymentStatus: ['1', '2'],
    location: [],
    dueDateFrom: '',
    dueDateTo: '',
    dueDateRange: '',
    isDaysClicked: 0,
    isDueDateClicked: 1,
    startDay: null,
    endDay: null,
  },
  selectedVendors: [],
}

export const getStatusList = createAsyncThunk('billsToPay/getStatusList', async (_, thunkAPI) => {
  try {
    return await agent.BillsToPay.getStatusList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getAgingFilterDropdown = createAsyncThunk('billsToPay/getAgingFilterDropdown', async (_, thunkAPI) => {
  try {
    return await agent.BillsToPay.getAgingFilterDropdown()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const paymentGetList = createAsyncThunk('billsToPay/paymentGetList', async (data: PaymentGetListProps, thunkAPI) => {
  try {
    return await agent.BillsToPay.paymentGetList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPaymentMethods = createAsyncThunk(
  'billsToPay/getPaymentMethods',
  async (_, thunkAPI) => {
    try {
      return await agent.BillsToPay.getPaymentMethods()
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getPaymentMethodsbyVendor = createAsyncThunk(
  'billsToPay/getPaymentMethodsbyVendor',
  async (data: getPaymentMethodsProps, thunkAPI) => {
    try {
      return await agent.BillsToPay.getPaymentMethodsbyVendor(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getLocationDropdownList = createAsyncThunk('billsToPay/getLocationDropdownList', async (data: any, thunkAPI) => {
  try {
    return await agent.BillsToPay.getLocationDropDownList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getBankAccountDrpdwnList = createAsyncThunk('billsToPay/getBankAccountDrpdwnList', async (_, thunkAPI) => {
  try {
    return await agent.BillsToPay.getBankAccountDrpdwnList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPaymentColumnMapping = createAsyncThunk(
  'billsToPay/getPaymentColumnMapping',
  async (data: PaymentColumnMappingProps, thunkAPI) => {
    try {
      return await agent.BillsToPay.getPaymentColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const savePaymentColumnMapping = createAsyncThunk(
  'BillsToPay/savePaymentColumnMapping',
  async (data: SaveColumnMappingProps, thunkAPI) => {
    try {
      return await agent.BillsToPay.savePaymentColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const markAsPaidBill = createAsyncThunk(
  'BillsToPay/markAsPaidBill',
  async (data: MarkaspaidProps, thunkAPI) => {
    try {
      return await agent.BillsToPay.markAsPaidBill(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const moveBillToPay = createAsyncThunk('BillsToPay/moveBillToPay', async (data: MoveBillToPayProps, thunkAPI) => {
  try {
    return await agent.BillsToPay.moveBillToPay(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getVendorAginglist = createAsyncThunk(
  'BillsToPay/getVendorAginglist',
  async (data: VendorAgingListProps, thunkAPI) => {
    try {
      return await agent.BillsToPay.getVendorAginglist(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getVendorAgingDaysDrpdwn = createAsyncThunk(
  'billsToPay/getVendorAgingDaysDrpdwn',
  async (data: VendorAgingDaysDrpdwn, thunkAPI) => {
    try {
      return await agent.BillsToPay.getVendorAgingDaysDrpdwn(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getVendorCreditList = createAsyncThunk(
  'billsToPay/getVendorCreditList',
  async (data: VendorCreditListProps, thunkAPI) => {
    try {
      return await agent.BillsToPay.getVendorCreditList(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const BillDetails = createAsyncThunk('billsToPay/BillDetails', async (data: BillDetailsProps, thunkAPI) => {
  try {
    return await agent.BillsToPay.BillDetails(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getautomaticvendorcredit = createAsyncThunk(
  'billsToPay/getautomaticvendorcredit',
  async (data: BillDetailsPayload, thunkAPI) => {
    try {
      return await agent.BillsToPay.getautomaticvendorcredit(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const sendForPay = createAsyncThunk('billsToPay/sendForPay', async (data: PaymentPayload, thunkAPI) => {
  try {
    return await agent.BillsToPay.sendForPay(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getActivityList = createAsyncThunk('Activity/getActivityList', async (data: ActivityListOptions, thunkAPI) => {
  try {
    return await agent.Activity.getActivityList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getWatcherList = createAsyncThunk('Activity/getWatcherList', async (data: ActivityWatcherListOptions, thunkAPI) => {
  try {
    return await agent.Activity.getWatcherList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveActivityList = createAsyncThunk('Activity/saveActivityList', async (data: SaveActivityListOptions, thunkAPI) => {
  try {
    return await agent.Activity.saveActivityList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const saveWatcherList = createAsyncThunk('Activity/saveWatcherList', async (data: SaveWatcherListOptions, thunkAPI) => {
  try {
    return await agent.Activity.saveWatcherList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const updateResolved = createAsyncThunk('Activity/updateResolved', async (data: UpdateResloved, thunkAPI) => {
  try {
    return await agent.Activity.updateResolved(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const storeNotification = createAsyncThunk(
  'Activity/storeNotification',
  async (data: ActivityNotificationOptions, thunkAPI) => {
    try {
      return await agent.Activity.storeNotification(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const billsToPay = createSlice({
  name: 'billsToPay',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setStartDay: (state, action) => {
      state.startDay = action.payload
    },
    setEndDay: (state, action) => {
      state.endDay = action.payload
    },
    setFilterFormFields: (state, action) => {
      state.filterFormFields = action.payload
    },
    setVendorIdList: (state, action) => {
      state.vendorIdList = action.payload
    },
    setAllVendorOptions: (state, action) => {
      state.allvendorOptions = action.payload
    },
    setCurrentPath: (state, action) => {
      state.currentPath = action.payload
    },
    setAgingFilterValue: (state, action) => {
      state.agingFilter = action.payload === '' ? 0 : action.payload
    },
    setSelectedVendors: (state, action) => {
      state.selectedVendors = action.payload
    },
  },
})

export const {
  setToken,
  setStartDay,
  setEndDay,
  setFilterFormFields,
  setVendorIdList,
  setCurrentPath,
  setAgingFilterValue,
  setAllVendorOptions,
  setSelectedVendors,
} = billsToPay.actions
