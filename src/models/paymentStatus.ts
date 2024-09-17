export interface PaymentStatusListOptions {
  CompanyId: number | null | undefined
  LocationIds: null | any[]
  VendorIds: any[] | null
  Status: null | any[]
  PaymentMethod: null | any[]
  StartDate: Date | null | string
  EndDate: Date | null | string
  OrderColumn: string | null
  OrderBy: string | null | number | boolean
  PageNumber: number
  PageSize: number
  IsDownload: boolean | null
  ExportType: number | null
}

export interface SavePaymentStatusColumnMappingOptions {
  Id: number | null | undefined
  UserId: number | null | undefined
  ColumnList: string
}

export interface SetCancelPaymentOptions {
  PaymentId: number | null | undefined
}

export interface GetPaymentStatusColumnMappingOptions {
  UserId: number | null
}

export interface BillAttachment {
  BillNumber: string;
  DueDate: string;
  AmountDue: number;
  AmountToPay: number;
  Discount: number | null;
}

export interface BillListItem {
  Id: number;
  PaymentDate: number;
  Vendor: string;
  VendorId: string;
  Bills: number;
  Amount: number;
  StatusName: string;
  Status: number;
  PaymentMethod: string;
  Method: number;
  AvailCredit: number;
  BillsAttachment: BillAttachment[];
}

export interface FilterObject {
  LocationIds: string[];
  VendorIds: string[];
  PaymentMethod: string[];
  StartDate: string | null;
  EndDate: string | null;
};

export interface DateFormatOptions {
  month?: 'short' | 'long';
  day?: 'numeric' | '2-digit';
  year?: 'numeric' | '2-digit';
};

export interface Option {
  label: string
  value: string
  isEnable?: boolean
  IsUsed?: boolean
}

export interface ColumnFilterDropdownProps {
  headers: any[]
  visibleHeaders: any[]
  columnId?: number
  getMappingListData?: any
  moduleType: number
}

export interface StatusType {
  statusList: Option[];
}
export interface StatusListData {
  label: string
  value: string
}

export interface FilterProps {
  locationOption: Option[]
  vendorOption: Option[]
  paymentMethodOption: Option[]
  isFilterOpen: boolean
  onClose: () => void
}