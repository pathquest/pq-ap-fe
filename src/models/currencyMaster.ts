export interface SyncCurrencyMasterOptions {
  CompanyId: string | undefined
}

export interface CurrencyGetListOptions {
  CompanyId: number | null
  PageSize: number | null
  Index: number | null
  Search: string | undefined
  FilterObj: {
    Code: string | undefined
    Description: string | undefined
  }
}

export interface CurrencyDropdownOptions {
  CompanyId: string | undefined
}
