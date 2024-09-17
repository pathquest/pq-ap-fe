export interface SyncVendorOptions {
  CompanyId: string | undefined
}
export interface VendorDropdownListOptions {
  CompanyId: string | undefined
}
export interface VendorGetDropdownListOptions {
  CompanyId: string | undefined
  ProcessType: string | undefined
  RuleId: number | null | undefined
}

export interface FilterObjDataOptions {
  VendorIds: any
  PaymentMethod: any,
  Status: any,
  MinPayables: number | null,
  MaxPayables: number | null,
  SortColumn: string
  SortOrder: number | null
}
export interface VendorGetListOptions {
  FilterObj: FilterObjDataOptions
  Index: number
  PageSize: number
}

export interface BillingAddressOptions {
  address: string
  countryName: string
  stateName: string
  cityName: string
  zipCode: string
}

export interface AddressOptions {
  address: string | null
  countryName: string | null
  stateName: string | null
  cityName: string | null
  zipCode: string | null
}

export interface BankDetailsOptions {
  accNo: string | null
}

type CardInfoProps = string | number | null

export interface CreditCardDetails {
  cardNo: CardInfoProps
  validTill: CardInfoProps
  cvv: CardInfoProps
}

export interface ContactDetailsOptions {
  email: string | null
  website: string | null
  shippingSameAs: boolean
}

export interface PaymentInfoOptions {
  defPymtMethod: string | number | null
  pymtPriority: number | null
  apTermId: string | number | null
  glAccountId: string | number | null
  defPymtDate: string | number | null
  showTermDiscount: boolean | null
  bankDetails: BankDetailsOptions
  creditCardDetails: CreditCardDetails
}

interface VendorPayment {
  AccountingNumber?: string;
  AccountingType?: string;
  RoutingNumber?: string;
  Email?: string;
  RequirePin?: boolean;
  Check_Address?: string | number;
  Check_City?: string | number;
  Check_State?: string | number;
  Check_Country?: string | number;
  Check_PostalCode?: string;
}

export interface SaveVendorOptions {
  Id: number;
  VendorId: number | null;
  RecordNo: string;
  CompanyId: number;
  Name: string;
  CheckName: string;
  Email: string;
  PhoneNumber: string;
  AccountingTool: number;
  Address: string;
  Country: string;
  State: string;
  City: string;
  Zip: string;
  Notes: string;
  Attachment: any;
  Term: any;
  AccountNumber: string;
  RoutingNumber: string;
  AccountType: string;
  AccountClassification: string;
  GLAccount: string;
  PaymentMethod: string;
  CardNumber: string;
  ValidTill: string;
  CVV: string;
  PhoneCountryCode: string;
  PhoneAreaCode: string;
  Token: any;
  PreferredPaymentMethod: number;
  PaymentEnablement: boolean;
  VendorPayments: VendorPayment[];
}
export interface VendorGetByIdOptions {
  CompanyId: number
  Id: number | undefined
}

export interface VendorUpdateStatusOptions {
  CompanyId: number
  Id: any
  RecordNo: string
  Status: boolean
}

export interface VendorListOption {
  Id: number
  VendorId: string
  Name: string
  City: string
  State: string
  Zip: string
  pqStatus: string
  payables: string
  RecordNo: string
  Status: boolean
  action: any
}

export interface Option {
  label: string
  value: number
}

export interface TermOption {
  RecordNo: string
  Name: string
  label: string
  value: string
}