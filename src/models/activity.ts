export interface ActivityListOptions {
  Type: string
  BillGuid: string | undefined
}
export interface ActivityWatcherListOptions {
  SearchKey: string | undefined
  BillGuid: string | undefined
}

export interface SaveActivityListOptions {
  BillGuid: string | undefined
  Type: string | null
  Comment: string | null
  Tag: string | null
  ParentActivityId: string | null
  Attachment: string | null

}

export interface SaveWatcherListOptions {
  BillGuid: string | undefined
  WatcherIds: string | string[]
}

export interface WatchersProps {
  enableCheckboxes?: boolean
  value?: WatcherOptions[]
  userData: WatcherOptions[]
  selectedStates?: any
  onApply?: () => void
  setSelectedStates?: any
  loaderStatus?: boolean
  dropdownAssignUserRef?: any
  isOpenAssignUserDropDown?: boolean
  setIsOpenAssignUserDropDown?: any
  disabled?:boolean
}

export interface UpdateResloved {
  Id: number | null
}

export interface ActivityAttachmentList {
  ActivityId:number
  AttachmentType:string
  AttachmentPath:string
  AttachmentName:string
}
export interface ActivityList {
  Id: number
  Comment: string
  UserImage: string
  Username: string | null
  Tag: string | null
  ParentActivityId: string | null
  CreatedByName: string
  CreatedBy: number
  CreatedOn: string
  Status: boolean
  IsResolved: boolean
  ChildList: any[]
  SaveAttachments: any[]
  Attachments: any
  Type: string
  ActivityType: number | null
  BillGuid: string | null
}

export interface WatcherOptions {
  Id: number | string
  id: number | string
  UserName: string
  name: string
  FileName: string
  UserImage: string
  IsSelected: boolean
}

export interface FilterTagDataOptions {
  Id: number | string
  id: string
  UserName: string
  display: string
}

export interface ActivityNotificationOptions {
  title: string,
  message: string,
  user_id: string[],
}
