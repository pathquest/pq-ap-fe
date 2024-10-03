export interface CompanyGetListOptions {
  Name: string
  AccountingToolIds: number[]
  CompanyIds: number[]
  AssignUserIds: number[]
  PageIndex: number | null
  PageSize: number | null
}

// country,state and city api already call in user so we can use this api

export interface SaveCompany {
  Id?: number | null
  Name: string
  EntityType: number | null
  Address: string
  CountryId: number | null
  StateId: number | null
  CityId: number | null
  ZipCode: string | number | null
  Phone: string
  OrgId?: number | null
  Email: string
  AccountingTool?: number | null
  AccToolCompanyId: string | null
  guid: string
  CompanyImage: string
  IntacctUserId: string | null
  IntacctPassword: string | null
  IntacctCompanyId: string | null
  IntacctLocationId: string | null
}

export interface CompanyDataById {
  Id?: number | null
}

export interface QbConncet {
  code: string | null
  realmId: string | null
  CompanyId: string | null
}

export interface XeroConncet {
  Code: string | null
  CompanyId: string | null
}

export interface ConncetSageUser {
  IntacctCompanyId: string
  IntacctUserId: string
  IntacctUserPassword: string
}

export interface ConncetSageCompany {
  IntacctCompanyId: string
  IntacctUserId: string
  IntacctUserPassword: string
  IntactClientId: string
}

export interface ReconncetSageCompany {
  CompanyId?: number | null
  IntacctCompanyId: string
  IntacctUserId: string
  IntacctUserPassword: string
  IntactClientId: string
  IntacctLocationId: string | ''
}

export interface CompanyIdDropDown {
  CompanyId: number | null
}

export interface AssignUserCompany {
  CompanyId: number | null
  UserIds: string[]
}

export interface UploadCompanyImage {
  file: File
  fileName: string
}

export interface GetCompanyImage {
  fileName: string
}

export interface PerformActions {
  CompanyId: number | null
  Action: number
}

export interface GetManageConfigurationOptions {
  CompanyId: number | null
}
