export interface RoleListOptions {
  CompanyId: string | undefined
}

export interface RoleGetListOptions {
  CompanyId: number
  GlobalSearch: string
  RoleId: number | null
  PageIndex: number
  PageSize: number
}

type RoleInfoProps = number | null | undefined

export interface PermissionListOptions {
  RoleId: RoleInfoProps
}

export interface RoleRemoveOptions {
  RoleId: RoleInfoProps
}

export interface SavePermissionOptions {
  RoleId: RoleInfoProps
  ProcessList: string[]
}

export interface SaveRoleOptions {
  role: {
    RoleId: number | undefined
    RoleName: string
    RoleDescription: string
    IsStandard: boolean
    CompanyId: number | undefined
    FromRoleId: number | undefined
  }
  rolePermission: {
    RoleId: number | undefined
    ProcessList: string[]
  }
}

export interface RoleGetIdOptions {
  RoleId: RoleInfoProps
}
