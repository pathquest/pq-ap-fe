export interface GLAccountGetListOptions {
  FilterObj: {
    ClassId: string | undefined
    Name: string | undefined
    FullyQualifiedName: string | undefined
    Status: string | undefined | null
    GlobalFilter: string | undefined
  }
  CompanyId: string | undefined
  Index: number | null
  PageSize: number | null
}

export interface GLAccountByIdOptions {
  CompanyId: string | undefined
  Id: number | undefined
}

export interface saveGLAccountOptions {
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

export interface GLAccountRemoveOptions {
  CompanyId: string | undefined
  Id: number | undefined
  RecordNo: number | null | undefined
}
