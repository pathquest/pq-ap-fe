export interface ApAgingDetailsProps {
  Vendors: string[] | null
  StartDate: null | string
  EndDate: null | string
  ViewBy: number | null
}

export interface GetApAgingDetailsColumnMappingOptions {
  UserId: number | null
  ModuleType: number | null
}

export interface SaveApAgingDetailsColumnMappingOptions {
  Id: number | null | undefined
  UserId: number | null | undefined
  ColumnList: string
  ModuleType: number | null
}
