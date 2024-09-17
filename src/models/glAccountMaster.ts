export interface SyncGLAccountMasterOptions {
  CompanyId: number
}

export interface GLAccountGetListOptions {
  FilterObj: {
    AccountNo: string | undefined
    Name: string | undefined
    FullyQualifiedName: string | undefined
    AccountType: string | undefined
    ClosingType: string | undefined
    NormalBalance: string | undefined
    CurrentBalance: string | undefined
    Status: string | undefined
    GlobalFilter: string | undefined
  }
  CompanyId: number | null
  Index: number | null
  PageSize: number | null
}

export interface GLAccountDropdownOptions {
  CompanyId: number
}

export interface GLAccountByIdOptions {
  CompanyId: number
  Id: number | undefined
}

export interface SaveGLAccountOptions {
  CompanyId: number
  Id: number | undefined
  RecordNo: string | undefined
  Name: string | undefined
  AccountCode: string | undefined
  AccountType: string | undefined
}

export interface UpdateGLAccountStatusOptions {
  CompanyId: number
  Id: number | undefined
  RecordNo: string | undefined
  Status: boolean | null
}
