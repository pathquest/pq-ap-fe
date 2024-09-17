export interface SyncApTermMasterOptions {
  CompanyId: number
}

export interface ApTermGetListOptions {
  CompanyId: number | null
  PageSize: number | null
  Index: number | null
}

export interface ApTermDropdownOptions {
  CompanyId: number
}

export interface TermByIdOptions {
  CompanyId: number
  Id: number | undefined
}

export interface SaveTermOptions {
  Id: number | undefined
  CompanyId: number
  RecordNo: string | undefined
  Name: string | undefined
  DueDays: number
  Status: boolean | null
  Description: string | undefined
}

export interface UpdateTermStatusOptions {
  CompanyId: number
  Id: number | undefined
  RecordNo: string | undefined
  Status: boolean | null
}