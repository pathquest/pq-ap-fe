export const MonthOptions = [
  { value: '1', label: 'First Day of the Month' },
  { value: '2', label: '15th Day of the Month' },
  { value: '3', label: 'Last Day of the Month' },
]

export const getInlineStyle = (type: string) => {
  return {
    className: '!w-9 !h-9 !rounded-md !border-[1px] !border-lightSilver',
  }
}

export const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const getCurrentYear = new Date().getFullYear().toString()


export interface TriggerData {
  MatrixId: number
  TriggerName: string
  Email: boolean
  Portal: boolean
  Mobile: boolean
  EmailDisable: boolean
  PortalDisable: boolean
  MobileDisable: boolean
}

export interface TransformedTriggerData {
  MatrixId: number
  Email: boolean
  Portal: boolean
  Mobile: boolean
}

export interface ModuleData {
  ModuleId: number
  ModuleName: string
  Triggers: TriggerData[]
}

export interface TableColumn {
  header: string
  accessor: string
  sortable: boolean
  colType?: 'number' | 'string' | 'boolean' | 'date'
  colStyle?: string
  rowStyle?: string
  colalign?: 'left' | 'center' | 'right'
}

