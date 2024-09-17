export interface AutomationGetRuleListOptions {
  CompanyId?: string
  PageNumber?: number | null
  PageSize?: number | null
}

export interface RuleActiveInactiveOptions {
  RuleId?: number | null
  ActiveInActive: number
  CompanyId?: string
}

export interface RuleByIdOptions {
  RuleId?: number | null
  CompanyId?: string
}

export interface SaveRuleOptions {
  RuleId?: number | null
  CompanyId?: string
  RuleName?: string
  ProcessType?: string
  RuleDetail?: string
  Description?: string
}