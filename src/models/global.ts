export interface SearchResultOptions {
  ModuleType: string
  SearchKey: string
  PageNumber: number
  PageSize: number
}

export interface GetSearchHistoryOptions {
  ModuleType: string
}

export interface SaveSearchHistoryOptions {
  ModuleType: string
  SearchKey: string
  DisplayKey: string
  AccountPayableId: number
  IsFromDocument: boolean
  ModuleSubType: string
}

export interface GlobalSearchResultRes {
  Amount: number
  BillDate: string
  BillNumber: string
  Id: number
  ModuleSubType: string
  ModuleType: string
  PODate: string
  PONumber: string
  TotalOutStanding: number
  VendorEmail: string
  VendorId: string
  VendorName: string
}
