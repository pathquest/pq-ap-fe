export interface GetFieldMappings {
  CompanyId: number | null | undefined
  ProcessType: number
}

export interface SaveFieldMappings {
  CompanyId: number | null | undefined
  ProcessType: number
  MainFieldConfiguration:any[]
  LineItemConfiguration:any[]
}
