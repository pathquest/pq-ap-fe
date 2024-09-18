export interface SyncMasterOptions {
  CompanyId: number | undefined
}

export interface SyncMasterProps {
  data: SyncMasterOptions
  tab: string
}

export interface UpdateMasterOptions {
  CompanyId: string | undefined
  Id: number | undefined
  RecordNo: string | undefined
  Status: boolean
  Name: string
}

export interface UpdateMasterProps {
  data: UpdateMasterOptions
  tab: string
}

export interface ClassByIdOptions {
  CompanyId: string | undefined
  Id: number | undefined
}

export interface DepartmentByIdOptions {
  CompanyId: string | undefined
  Id: number | undefined
}

export interface LocationByIdOptions {
  CompanyId: string | undefined
  Id: number | undefined
}

export interface LocationListDropdownOptions {
  CompanyId: string | undefined
}

export interface LocationGetDropdownListOptions {
  CompanyId: string | undefined
  ProcessType: string | undefined
  RuleId: number | null | undefined
  Vendor: any
}

export interface ProjectByIdOptions {
  CompanyId: string | undefined
  Id: number | undefined
}

export interface SaveClassOptions {
  CompanyId: number | undefined
  Id: number | undefined
  ClassCode: string
  Description: string
  RecordNo: string | undefined
  Name: string
  ParentId: string
  ParentName: string
  Status: boolean
  FullyQualifiedName: string
}

export interface SaveDepartmentOptions {
  CompanyId: number | undefined
  Id: number | undefined
  DepartmentCode: string | undefined
  RecordNo: string | undefined
  Title: string | undefined
  Status: boolean
}

export interface SaveLocationOptions {
  CompanyId: number | undefined
  Id: number | undefined
  Name: string
  RecordNo: string | undefined
  Status: boolean
  FullyQualifiedName: string
  LocationCode: string
  ParentId: string
  ParentName: string
  TaxId: string
}

export interface SaveProjectOptions {
  CompanyId: number | undefined
  Id: number | undefined
  ProjectCode: string | undefined
  RecordNo: string | undefined
  Name: string | undefined
  Description: string | undefined
  Category: string | undefined
  Status: boolean
}

export interface ClassGetListOptions {
  FilterObj: {
    ClassId: string | undefined
    Name: string | undefined
    FullyQualifiedName: string | undefined
    Status: string | undefined | null
    GlobalFilter: string | undefined
  }
  CompanyId: number | undefined
  Index: number | null
  PageSize: number | null
}

export interface DepartmentGetListOptions {
  FilterObj: {
    DepartmentCode: string | undefined
    Title: string | undefined
    Status: boolean | null
    GlobalFilter: string | undefined
  }
  CompanyId: number | undefined
  Index: number | null
  PageSize: number | null
}

export interface LocationGetListOptions {
  FilterObj: {
    LocationId: string | undefined
    Name: string | undefined
    Status: string | undefined | null
    FullyQualifiedName: string | undefined
  }
  CompanyId: number | undefined
  Index: number
  PageSize: number
}

export interface ProjectGetListOptions {
  FilterObj: {
    ProjectId: string | undefined
    Name: string | undefined
    Category: string | undefined
    Status: boolean | null
    GlobalFilter: string | undefined
  }
  CompanyId: number | undefined
  Index: number
  PageSize: number
}

export interface DimensionRemoveOptions {
  CompanyId: string | undefined
  Id: number | undefined
  RecordNo: number | null | undefined
}
