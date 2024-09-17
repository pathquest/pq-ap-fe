import agent from '@/api/axios'
import { formatPeriodDate, utcFormatDate } from '@/components/Common/Functions/FormatDate';
import { dashboardOptions, InsightsOptions, vendorWiseMonthlyPaymentOptions } from '@/models/dashboard'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { format, parse } from 'date-fns'

interface FilterFields {
  LocationIds: string[];
  StartDate?: string;
  EndDate?: string;
  Period?: string;
  Date?: string;
  ProcessType?: string[];
}

interface ProfileState {
  token: string
  filterFields: {
    Summary: FilterFields;
    PostedBillsByMonth: FilterFields;
    VendorWiseMonthlyPayment: FilterFields;
    BillApprovalStatus: FilterFields;
    ProcessedVsPaymentNotApproved: FilterFields;
    PaymentApprovedVsPaidBeforeDueDate: FilterFields;
    OnTimeVsMissedProcessing: FilterFields;
  };
}

const today = new Date();
const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const month = String(today.getMonth() + 1).padStart(2, '0');
const year = today.getFullYear();
const formattedDate = `${month}/${year}`;

const initialState: ProfileState = {
  token: '',
  filterFields: {
    Summary: {
      LocationIds: [],
      Date: formattedDate,
      ProcessType: ['1', '2'],
    },
    PostedBillsByMonth: {
      LocationIds: [],
      StartDate: thisMonthStart ? formatPeriodDate(thisMonthStart) : '',
      EndDate: today ? formatPeriodDate(today) : '',
      Period: 'This Month',
    },
    OnTimeVsMissedProcessing: {
      LocationIds: [],
      StartDate: thisMonthStart ? formatPeriodDate(thisMonthStart) : '',
      EndDate: today ? formatPeriodDate(today) : '',
      Period: 'This Month',
    },
    VendorWiseMonthlyPayment: {
      LocationIds: [],
      StartDate: thisMonthStart ? formatPeriodDate(thisMonthStart) : '',
      EndDate: today ? formatPeriodDate(today) : '',
      Period: 'This Month',
    },
    BillApprovalStatus: {
      LocationIds: [],
      StartDate: thisMonthStart ? formatPeriodDate(thisMonthStart) : '',
      EndDate: today ? formatPeriodDate(today) : '',
      Period: 'This Month',
    },
    ProcessedVsPaymentNotApproved: {
      LocationIds: [],
      StartDate: thisMonthStart ? formatPeriodDate(thisMonthStart) : '',
      EndDate: today ? formatPeriodDate(today) : '',
      Period: 'This Month',
    },
    PaymentApprovedVsPaidBeforeDueDate: {
      LocationIds: [],
      StartDate: thisMonthStart ? formatPeriodDate(thisMonthStart) : '',
      EndDate: today ? formatPeriodDate(today) : '',
      Period: 'This Month',
    },
  },
};


export const getSummary = createAsyncThunk('dashboard/getSummary', async (data: dashboardOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getSummary(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getVendorWiseMonthlyPayment = createAsyncThunk('dashboard/getVendorWiseMonthlyPayment', async (data: vendorWiseMonthlyPaymentOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getVendorWiseMonthlyPayment(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getBillApprovalStatus = createAsyncThunk('dashboard/getBillApprovalStatus', async (data: dashboardOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getBillApprovalStatus(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPostedBillsByMonth = createAsyncThunk('dashboard/getPostedBillsByMonth', async (data: dashboardOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getPostedBillsByMonth(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getOnTimeProcessingVsMissedProcessingBills = createAsyncThunk('dashboard/getOnTimeProcessingVsMissedProcessingBills', async (data: dashboardOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getOnTimeProcessingVsMissedProcessingBills(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getProcessedVsPaymentNotApproved = createAsyncThunk('dashboard/getProcessedVsPaymentNotApproved', async (data: dashboardOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getProcessedVsPaymentNotApproved(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPayAfterDueDateVsPaidBeforeDueDateByMonth = createAsyncThunk('dashboard/getPayAfterDueDateVsPaidBeforeDueDateByMonth', async (data: dashboardOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getPayAfterDueDateVsPaidBeforeDueDateByMonth(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getInsights = createAsyncThunk('dashboard/getInsights', async (data: InsightsOptions, thunkAPI) => {
  try {
    return await agent.Dashboard.getInsights(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})


export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setSummaryFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.Summary = action.payload;
    },
    setPostedBillsByMonthFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.PostedBillsByMonth = action.payload;
    },
    setVendorWiseMonthlyPaymentFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.VendorWiseMonthlyPayment = action.payload;
    },
    setBillApprovalStatusFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.BillApprovalStatus = action.payload;
    },
    setProcessedVsPaymentNotApprovedFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.ProcessedVsPaymentNotApproved = action.payload;
    },
    setPaymentApprovedVsPaidBeforeDueDateFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.PaymentApprovedVsPaidBeforeDueDate = action.payload;
    },
    setOnTimeVsMissedProcessingFilter: (state, action: PayloadAction<FilterFields>) => {
      state.filterFields.OnTimeVsMissedProcessing = action.payload;
    }
  },
})

export const { setToken, setOnTimeVsMissedProcessingFilter, setSummaryFilter, setPostedBillsByMonthFilter, setVendorWiseMonthlyPaymentFilter, setBillApprovalStatusFilter, setProcessedVsPaymentNotApprovedFilter, setPaymentApprovedVsPaidBeforeDueDateFilter } = dashboardSlice.actions