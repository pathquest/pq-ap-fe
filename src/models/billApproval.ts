export interface GetBillApprovalLists {
  CompanyId?: number | null | string
  StatusId: number[]
  BillNumber: string | null
  MaxAmount: number | null
  MinAmount: number | null
  Vendor: number[]
  BillStartDate: string | null
  BillEndDate: string | null
  StartDueDate: string | null
  EndDueDate: string | null
  SortColumn?: string | null
  SortOrder?: number | null
  PageSize?: number | null
  PageNumber?: number | null
  Type?: number | null
}

export interface GetPaymentApprovalLists {
  Vendor: number[]
  PaymentMethod: number[]
  BankAccount: number[]
  Status: number[]
  MaxAmount: number | null
  MinAmount: number | null
  SortColumn: string | null
  SortOrder: number | null
  PageSize: number | null
  PageNumber: number | null
}

export interface BillApprovals {
  Ids?: number[]
  StatusId?: number | null
  Type?: number | null
}

export interface PaymentApprovals {
  ApprovalDetailList: any
}

export interface ReAssigns {
  Ids: number[] | undefined
  AssigneeId?: number | null
  Type?: number | null
}

export interface PaymentReAssigns {
  ApprovalDetailList: any
}

export interface Vendordropdown {
  CompanyId?: number | null
}

export interface FilterFormFields {
  ft_approal: string[]
  ft_billNumber: string
  ft_maxAmount?: number | null | string
  ft_minAmount?: number | null | string
  ft_vendor: string[]
  ft_billStartDate: string | null
  ft_tempBillDate: string[]
  ft_tempDueDate: string[]
  ft_dueDate: string
  ft_billDate: string
  ft_billEndDate: string | null
  ft_startDueDate: string | null
  ft_endDueDate: string | null
  ft_paymentStatus: string[]
  ft_paymentMethod: string[]
  ft_approverName: string[]
}
