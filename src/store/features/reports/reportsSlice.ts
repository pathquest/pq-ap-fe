import agent from '@/api/axios'
import {
  BillAnalysisProps,
  SaveBillAnalysisColumnMappingOptions,
  GetBillAnalysisColumnMappingOptions,
} from '@/models/BillAnalysis'
import {
  SaveApAgingDetailsColumnMappingOptions,
  ApAgingDetailsProps,
  GetApAgingDetailsColumnMappingOptions,
} from '@/models/apAgingDetails'
import { ApAgingSummaryProps } from '@/models/apAgingSummary'
import { ApAgingSummaryDrawerProps } from '@/models/apAgingSummaryDrawer'
import { FavoriteStarOption } from '@/models/favoriteStar'
import { GetUnpaidBillsColumnMappingOptions, SaveUnpaidBillsColumnMappingOptions, UnpainBillsProps } from '@/models/unpaidBills'
import { VendorAgingGroupByProps } from '@/models/vendorAgingGroupBy'
import { VendorAgingSummaryProps } from '@/models/vendorAgingSummary'
import {
  VendorBalanceDetailProps,
  GetVendorBalanceDetailColumnMappingOptions,
  SaveVendorBalanceDetailColumnMappingOptions,
} from '@/models/vendorBalanceDetail'
import { VendorBalanceSummaryProps } from '@/models/vendorBalanceSummary'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ReportsState {
  selectedIndex: number
}

const initialState: ReportsState = {
  selectedIndex: 0,
}

export const getHeaderList = createAsyncThunk('reports/getHeaderList', async (_, thunkAPI) => {
  try {
    return await agent.Reports.getHeaderList()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getFavoriteStar = createAsyncThunk('reports/getFavoriteStar', async (data: FavoriteStarOption, thunkAPI) => {
  try {
    return await agent.Reports.getFavoriteStar(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const apAgingDetail = createAsyncThunk('reports/apAgingDetail', async (data: ApAgingDetailsProps, thunkAPI) => {
  try {
    return await agent.Reports.apAgingDetail(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getApAgingDetailsColumnMapping = createAsyncThunk(
  'reports/getApAgingDetailsColumnMapping',
  async (data: GetApAgingDetailsColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.getApAgingDetailsColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const saveApAgingDetailsColumnMapping = createAsyncThunk(
  'reports/saveApAgingDetailsColumnMapping',
  async (data: SaveApAgingDetailsColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.saveApAgingDetailsColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const apAgingSummary = createAsyncThunk('reports/apAgingSummary', async (data: ApAgingSummaryProps, thunkAPI) => {
  try {
    return await agent.Reports.apAgingSummary(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const apAgingSummaryDrawer = createAsyncThunk(
  'reports/apAgingSummaryDrawer',
  async (data: ApAgingSummaryDrawerProps, thunkAPI) => {
    try {
      return await agent.Reports.apAgingSummaryDrawer(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const unpaidBills = createAsyncThunk('reports/unpaidBills', async (data: UnpainBillsProps, thunkAPI) => {
  try {
    return await agent.Reports.unpaidBills(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getUnpaidBillsColumnMapping = createAsyncThunk(
  'reports/getUnpaidBillsColumnMapping',
  async (data: GetUnpaidBillsColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.getUnpaidBillsColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const saveUnpaidBillsColumnMapping = createAsyncThunk(
  'reports/saveUnpaidBillsColumnMapping',
  async (data: SaveUnpaidBillsColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.saveUnpaidBillsColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const vendorBalanceDetail = createAsyncThunk(
  'reports/vendorBalanceDetail',
  async (data: VendorBalanceDetailProps, thunkAPI) => {
    try {
      return await agent.Reports.vendorBalanceDetail(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const billPayments = createAsyncThunk(
  'reports/billPayments',
  async (data: any, thunkAPI) => {
    try {
      return await agent.Reports.billPayments(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const getVendorBalanceDetailColumnMapping = createAsyncThunk(
  'reports/getVendorBalanceDetailColumnMapping',
  async (data: GetVendorBalanceDetailColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.getVendorBalanceDetailColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const vendorBalanceSummary = createAsyncThunk(
  'reports/vendorBalanceSummary',
  async (data: VendorBalanceSummaryProps, thunkAPI) => {
    try {
      return await agent.Reports.vendorBalanceSummary(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const billAnalysis = createAsyncThunk('reports/billAnalysis', async (data: BillAnalysisProps, thunkAPI) => {
  try {
    return await agent.Reports.billAnalysis(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const billAnalysisDetail = createAsyncThunk('reports/billAnalysisDetail', async (data: any, thunkAPI) => {
  try {
    return await agent.Reports.billAnalysisDetail(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getBillAnalysisColumnMapping = createAsyncThunk(
  'reports/getBillAnalysisColumnMapping',
  async (data: GetBillAnalysisColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.getBillAnalysisColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const saveBillAnalysisColumnMapping = createAsyncThunk(
  'reports/saveBillAnalysisColumnMapping',
  async (data: SaveBillAnalysisColumnMappingOptions, thunkAPI) => {
    try {
      return await agent.Reports.saveBillAnalysisColumnMapping(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const vendorAgingGroupBy = createAsyncThunk(
  'reports/vendorAgingGroupBy',
  async (data: VendorAgingGroupByProps, thunkAPI) => {
    try {
      return await agent.Reports.vendorAgingGroupBy(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const vendorAgingSummary = createAsyncThunk(
  'reports/vendorAgingSummary',
  async (data: VendorAgingSummaryProps, thunkAPI) => {
    try {
      return await agent.Reports.vendorAgingSummary(data)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setData: (state, action) => {
      // state.data = action.payload
    },
    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload
    },
  },
})

export const { setData, setSelectedIndex } = reportsSlice.actions
