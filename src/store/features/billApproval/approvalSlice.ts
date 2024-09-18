import agent from '@/api/axios'
import { BillApprovals, GetBillApprovalLists, GetPaymentApprovalLists, PaymentApprovals, PaymentReAssigns, ReAssigns, Vendordropdown } from '@/models/billApproval'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface ApprovalState {
  paymentApprovalFilterFields: {
    VendorIds: string[],
    BankAccountIds: string[],
    ApprovalStatusIds: string[],
    PaymentMethodIds: string[],
    MinAmount: string,
    MaxAmount: string,
  },
  billApprovalFilterFields: {
    VendorIds: string[],
    ApprovalStatusIds: string[],
    BillNumber: string,
    MinAmount: string,
    MaxAmount: string,
    BillStartDate: string,
    BillEndDate: string,
    StartDueDate: string,
    EndDueDate: string,
    Assignee: string,
    LocationIds: string[],
  },
  approvalDropdownFields: any
}

const initialState: ApprovalState = {
  approvalDropdownFields: '1',
  paymentApprovalFilterFields: {
    VendorIds: [],
    BankAccountIds: [],
    ApprovalStatusIds: ['0'],
    PaymentMethodIds: [],
    MinAmount: '',
    MaxAmount: '',
  },
  billApprovalFilterFields: {
    VendorIds: [],
    ApprovalStatusIds: ['0'],
    BillNumber: '',
    MinAmount: '',
    MaxAmount: '',
    BillStartDate: '',
    BillEndDate: '',
    StartDueDate: '',
    EndDueDate: '',
    Assignee: '1',
    LocationIds: [],
  },
}

export const getBillApprovalList = createAsyncThunk('BillApproval/getBillApprovalList', async (data: GetBillApprovalLists, thunkAPI) => {
  try {
    return await agent.BillApproval.getBillApprovalList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
}
)

export const billsApproval = createAsyncThunk('BillApproval/billsApproval', async (data: BillApprovals, thunkAPI) => {
  try {
    return await agent.BillApproval.billsApproval(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const billReAssign = createAsyncThunk('BillApproval/billReAssign', async (data: ReAssigns, thunkAPI) => {
  try {
    return await agent.BillApproval.billReAssign(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const getPaymentApprovalList = createAsyncThunk('BillApproval/getPaymentApprovalList', async (data: GetPaymentApprovalLists, thunkAPI) => {
  try {
    return await agent.BillApproval.getPaymentApprovalList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
}
)

export const paymentsApproval = createAsyncThunk('BillApproval/paymentsApproval', async (data: PaymentApprovals, thunkAPI) => {
  try {
    return await agent.BillApproval.paymentsApproval(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const paymentReAssign = createAsyncThunk('BillApproval/paymentReAssign', async (data: PaymentReAssigns, thunkAPI) => {
  try {
    return await agent.BillApproval.paymentReAssign(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const vendorList = createAsyncThunk('BillApproval/vendorList', async (data: Vendordropdown, thunkAPI) => {
  try {
    return await agent.BillApproval.vendorList(data)
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const companyListDropdown = createAsyncThunk('company/companyListDropdown', async (_, thunkAPI) => {
  try {
    return await agent.Company.companyListDropdown()
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data })
  }
})

export const billApproval = createSlice({
  name: 'billApproval',
  initialState,
  reducers: {
    setApprovalDropdownFields: (state, action) => {
      state.approvalDropdownFields = action.payload
    },
    setPaymentApprovalFilterFields: (state, action) => {
      state.paymentApprovalFilterFields = action.payload
    },
    setBillApprovalFilterFields: (state, action) => {
      state.billApprovalFilterFields = action.payload
    }
  },
})

export const { setApprovalDropdownFields, setPaymentApprovalFilterFields, setBillApprovalFilterFields } = billApproval.actions
