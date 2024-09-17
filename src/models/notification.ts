import { TransformedTriggerData } from '@/data/notification'

export interface GetEmailTemplate {
  MatrixId: number
}

export interface SaveNotificationMatrix {
  UserNotificationList: TransformedTriggerData[]
}

export interface SaveEmailTemplate {
  Subject?: string | null
  Template?: string | null
  MatrixId: number
}

export interface UpdateSummaryStatus {
  Status: boolean
}

export interface SaveSummaryData {
  SummaryType: number
  Value?: string | null
}

export interface ReadDeleteAllNotificationProps {
  Id: number
}
