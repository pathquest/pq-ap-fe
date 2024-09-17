
export const CompanyStaticId = 7
export const UserStaticId = 38
export const DeleteStatusStaticId = 9
export const SentStatusStaticId = 3
export interface AssignUserProps {
  enableCheckboxes?: boolean
  value?: AssignUserOption[]
  userData: AssignUserOption[]
  top?: number | null
  left?: number | null
  right?: number | null
  bottom?: number | null
  selectedStates?: any
  setSelectedStates?: any
  getData?: (value: AssignUserOption[]) => void
  setValue?: (value: AssignUserOption[]) => void
  dropdownAssignUserRef?: any
  isOpenAssignUserDropDown?: boolean
  setIsOpenAssignUserDropDown?: any
  width: any
  labelRequired?: boolean
  dropdownWidth?: any
  // Id?:any
}
export interface MergeDocDrawerProps {
  isOpen: boolean
  onClose: (key: boolean) => void
  removeItem: (value: any) => void
  selectedBillItems: Array<string>
  billLists?: any
  pdfUrl?: string
}

export interface Icons {
  onClose: (key?: boolean) => void
  Id?: number
  selectedRow?: any
  Status?: number
  billListsData?: any
  UserId?: number
  IsFromDocuments?: boolean
  processSelection: any
}

export interface ActivityDrawerProps {
  isOpen: boolean
  onClose: (key: boolean) => void
  GUID?: string
  noCommentBox: boolean
  selectedPayableId: number | null
}

export interface AssignUserOption {
  name: string
  id: any
}
export interface BillPostingFilterFormFieldsProps {
  ft_status: string[]
  ft_overview_status: string[]
  ft_assignee: string
  ft_process: string
  ft_select_users: any
  ft_vendor: any
  ft_datepicker: string
  ft_location: any
}

export interface EditBillPostingDataProps {
  Id?: number
  DocumentId?: number | null
  amount?: number | string
  taxamount?: number | string
  Description?: string
  Quantity?: number | null
  UnitPrice?: number | null
}

export interface VisibilityMoveToDropDown {
  isShow: boolean
  index: number | null
}

export interface DocumentGetListOptions {
  UserId: string | null
  Status: string | null
  LocationIds: string | null
  ProcessType: number | string
  VendorIds: string | null
  StartDate: string | null
  EndDate: string | null
  PageSize: number
  PageNumber: number | undefined
  SortColumn: string | null
  SortOrder: number | null
}

export interface DocumentGetOverviewListOptions {
  Status: any
  ProcessType: number | string
  VendorIds: any
  StartDate: string | null
  EndDate: string | null
  PageSize: number
  PageNumber: number | undefined
  SortColumn: string | null
  SortOrder: number | null
}

export interface DocumentDropdownOptionsProps {
  value: string
  label: string
}

export interface FilterObjVendorProps {
  VendorCode: string | null
  CompanyName: string | null
  Email: string | null
  PhoneNumber: string | null
  City: string | null
  State: string | null
  ZipCode: string | null
  Status: number | null
  GlobalFilter: string | null
}

export interface FilterObjLocation {
  LocationId: string | null
  Name: string | null
  FullyQualifiedName: string | null
  Status: boolean | null
}

export interface UserListOptionsProps {
  GlobalSearch: string
  CompanyIds: number[]
  StatusFilter: number | null //ALL= null, Active = 1, InActive = 0
  PageIndex: number | null
  PageSize: number | null
}

export interface RemoveDocumentOptionsProps {
  Id: number
  CompanyId: number
}

export interface DeleteDocumentOptionsProps {
  IdsDataList: any[]
  StatusId: number
}

export interface DeleteDocumentOverviewOptionsProps {
  AccountPayableId: number
  ActionReason?: string
}

export interface AssigneeOptionsProps {
  CompanyId: number
}

export interface AssignDocumentToUserOptionsProps {
  IdsDataList: any[]
  UserId: number
}

export interface GetFieldMappingOptionsProps {
  CompanyId: number
  ProcessType: number
}

export interface GetDocumentByIdOptionsProps {
  Id: number
  ApprovalType?: number | null
  UserId?: number | null
}

export interface MergeDocumentOptionsProps {
  Ids: number[]
  FileName: string
}

type RangeListOptions = {
  RangeName: string
  RangeFrom: number
  RangeTo: number
}
export interface SplitDocumentOptions {
  DocumentUploadId: number
  SplitType: number
  SplitByPageType: number | null
  PagesToExtract: string
  Prefix: string
  RangeWiseName: boolean
  PageIntervalToExtract: number | null
  RangeList: RangeListOptions[]
}
export interface GetOcrDocumentOptions {
  CompanyId: number
}
export interface GetColumnMappingListOptionsProps {
  UserId: number
}
export interface FormFieldOptionTypes {
  Id: number
  Name: string
  FieldType: string
  Label: string
  Value: string
  IsRequired: boolean
  IsActive: boolean
  Options: null
  Type: number
  IsSystemDefined: boolean
}
export interface VendorListOptions {
  CompanyId: number | null,
  IsActive?: boolean
}

export interface IntermediateType {
  isEnable: boolean
  isChecked: boolean
}

export interface FileRecordType {
  FileName: string | undefined
  PageCount: string | undefined
  BillNumber: string | undefined
}
