export interface UnpainBillsProps {
  Vendors: string[] | null
  StartDate: null | string
  EndDate: null | string
  ViewBy: number | null
}

export interface GetUnpaidBillsColumnMappingOptions {
  UserId: number | null
  ModuleType: number | null
}

export interface SaveUnpaidBillsColumnMappingOptions {
  Id: number | null | undefined
  UserId: number | null | undefined
  ColumnList: string
  ModuleType: number | null
}
