export interface BillAnalysisProps {
  Vendors: string[] | null
  StartDate: null | string
  EndDate: null | string
  ViewBy: number | null
  term: string[] | null
  paymentStatus: string[] | null
}

export interface GetBillAnalysisColumnMappingOptions {
  UserId: number | null
  ModuleType: number | null
}

export interface SaveBillAnalysisColumnMappingOptions {
  Id: number | null | undefined
  UserId: number | null | undefined
  ColumnList: string
  ModuleType: number | null
}
