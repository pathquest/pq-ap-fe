export interface VendorBalanceDetailProps {
  Vendors?: string[] | null
  StartDate?: string | null
  EndDate?: string | null
  ViewBy?: number | null
  PaymentStatus?: number[] | null
  IsZeroBalance: boolean
}

export interface GetVendorBalanceDetailColumnMappingOptions {
  UserId: number | null
  ModuleType: number | null
}

export interface SaveVendorBalanceDetailColumnMappingOptions {
  Id?: number | null
  UserId?: number | null
  ColumnList: string
  ModuleType: number | null
}
