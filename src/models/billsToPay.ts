export interface FilterFormFields {
  paymentStatus: any[]
  location: any[]
  dueDateFrom: null | string | Date
  dueDateTo: null | string | Date
  dueDateRange: string | any
  isDaysClicked: number | boolean
  isDueDateClicked: number | boolean
  startDay: null | number
  endDay: null | number
}

export interface ProfileStateProps {
  token: string
  startDay: any
  endDay: any
  currentPath: string
  filterFormFields: FilterFormFields
  vendorIdList: string[]
  agingFilter: number
  allvendorOptions: string[]
  selectedVendors: string[]
}

export interface PaymentGetListProps {
  LocationIds: string | null | any[]
  VendorIds: string[] | null
  Status: string | null | any[]
  StartDay: number | null
  EndDay: number | null
  StartDate: Date | null | string
  EndDate: Date | null | string
  AgingFilter: number | string
  OrderColumn: string | null
  OrderBy: string | null | number | boolean
  PageNumber: number
  PageSize: number
}

export interface SaveColumnMappingProps {
  Id: number | null | undefined
  UserId?: number | null
  ColumnList: string
}

export interface PaymentColumnMappingProps {
  UserId: number | null
}

export interface MarkaspaidProps {
  Ids?: number[]
  Status: number | null
  PaymentMethod?: number | null
  SelectedAccount?: number | null
  PaymentDate?: string | null
  Amount?: number | null
}

export interface MoveBillToPayProps {
  AccountPaybleId: number[]
  OnHold: boolean
  OnHoldReason: string
}

export interface getPaymentMethodsProps {
  VendorIds: number[]
}

export interface VendorAgingListProps {
  CompanyId: number | null
  VendorIds?: string[] | null
  FiterType?: number | null
  StartDay?: number | null | string
  EndDay?: number | null | string
  TypeOfAging: number | null
  PageSize: number | null
}

export interface VendorAgingDaysDrpdwn {
  CompanyId: number | null
  VendorIds?: string[] | null
  FiterType: number | null
}

export interface VendorCreditListProps {
  VendorId?: string | null
  CompanyId: number | null
}

export interface BillDetailsProps {
  VendorBills: any[]
}

export interface BankAccDropDownProps {
  VendorId: any
  CompanyId: number
}

export interface BillDetailsPayload {
  BillDetails: {
    VendorId: number
    BillId: number
    Amount: number
  }[]
}

interface Bill {
  AccountPaybleId: number
  Amount: number
  VendorId: string
}

interface Credit {
  AccountPaybleId: number
  UsedIn: any
  CreditAmount: number
  VendorId: string
}

export interface PaymentPayload {
  BillsList: Bill[]
  creditsList: Credit[]
  CompanyId: number
  PaymentGenrationType: number
  PaymentDate: string
  PaymentMethod: number
  BankAccount: number
  CreditUtilizeType: number
}
