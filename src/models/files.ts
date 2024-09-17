export interface HistoryGetListProps {
  PageNumber: number
  PageSize: number
  Source: string[]
  UserIds: string[]
  Process: string[]
  BillNo: (string | undefined)[];
  LocationIds: string[]
  StartDate: string | null
  EndDate: string | null
}

export interface LinkBillToExistingBillProps {
  AccountPayableId: number | null
  DocumentId: number | null
  FilePath: string
  FileName: string
}

export interface HandleHistoryDocumentRetryProps {
  Id: number
}

export interface HistoryFilterFormFieldsProps {
  fh_source?: string[]
  fh_received_uploaded?: string[]
  fh_uploaded_date?: string
  fh_bill_number?: string[]
  fh_process?: string[]
  fh_locations?: string[]
}

export type Column = {
  header: any
  accessor: string
  sortable: boolean
  colType?: 'number' | 'string' | 'boolean' | 'date'
  colStyle?: string
  rowStyle?: string
  colalign?: 'left' | 'center' | 'right'
}

export interface BillNumberProps {
  label: string
  value: string
}
