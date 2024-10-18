export interface UserGetListOptions {
  GlobalSearch: string
  CompanyIds: number[]
  StatusFilter: boolean | null
  PageIndex?: number | null;
  PageSize: number
}

export interface UserUpdateStatusOptions {
  Id: string
  Status: boolean
}

export interface UserUpdateBIAccessOptions {
  user_id: string
  productId: number
}

export interface TimezoneListOptions {
  CountryId: number | null
}

export interface StateListOptions {
  CountryId: number | null
}

export interface CityListOptions {
  StateId: number | null
}

export interface UserDataOptions {
  UserId: number | null | undefined
}

export interface UserSaveDataOptions {
  id: number | null | undefined
  first_name: string
  last_name: string
  email: string
  phone: string
  guid: string
  user_image: string
  country_id: number
  state_id: number
  city_id: number
  postal_code: string
  time_zone: number
  companyIds: number[]
  orgid: number | null | undefined
  roleid: number
}

export interface UserGetManageRights {
  UserId: number | null | undefined
  CompanyId: number | null | undefined
}

export interface UserGetCompanyDropdown {
  UserId: number | null | undefined
}

export interface AssignCompanyToUser {
  UserId: number | null | undefined
  CompanyIds: number[]
}

export interface SaveManageRight {
  UserId: number | null | undefined
  CompanyId: number | null | undefined
  ProcessList: number[]
}

export interface UploadUserImage {
  file: File
  fileName: string
}

export interface GetUserImage {
  fileName: string
}

export interface UserDelete {
  UserId: number | null | undefined
}
