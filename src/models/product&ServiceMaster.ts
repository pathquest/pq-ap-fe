export interface SyncProductServiceMasterOptions {
  CompanyId: string | undefined
}

export interface ProductServiceGetListOptions {
  FilterObj: {
    Name: string | undefined
    Type: string | undefined
    Description: string | undefined
    UnitPrice: string | undefined
    Status: string | undefined
    GlobalFilter: string | undefined
  }
  CompanyId: number | null
  Index: number | null
  PageSize: number | null
}

export interface ProductServiceByIdOptions {
  CompanyId: string | undefined
  Id: number | undefined
}

export interface SaveProductServiceOptions {
  CompanyId: string | undefined
  Id: number | undefined
  ClassCode: string
  Description: string
  RecordNo: string | undefined
  Name: string
  ParentId: string
  ParentName: string
  Status: string | undefined | null
  FullyQualifiedName: string
}

export interface ProductServiceRemoveOptions {
  CompanyId: string | undefined
  Id: number | undefined
  RecordNo: number | null | undefined
}

export interface SyncGLAccountMasterOptions {
  CompanyId: string | undefined
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
  CompanyId: string | undefined
  Index: number | null
  PageSize: number | null
}

export interface GLAccountOptions {
  CompanyId: string | undefined
}
