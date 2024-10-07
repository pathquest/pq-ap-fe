export interface SaveBuyerBankOption {
  PaymentSetupId: number;
  AccountNumber: string;
  AccountingType: string;
  RoutingNumber: string;
  BankName: string;
  BranchId: string;
  AccountHolderName: string;
  Notes: string;
  PhoneNumber: string;
  Email: string;
  PrimaryContact: string;
  PayToContact: string;
  ReturnToContact: string;
  GlAccountType: string;
  GlAccountId: number;
  ServiceChargeGlId: number;
  IntEarnedGlId: number;
  DeptartmentId: string;
  LocationId: string;
  Address: {
    street1: string;
    city: number;
    state: number;
    country: number;
    postalCode: string;
  };
}

export interface UpdateBuyerBankOptions {
  PaymentSetupId: number | null
}

export interface UpdatePaymentMethodOptions {
  PaymentSetupMethodId: number | null | undefined
}

export interface GLAccountOption {
  label: string
  value: string
  type: string
}

export interface PaymentMethodOption {
  label: string
  value: string
}

export interface BankAccountListOption {
  AccountId: string
  IsActive: boolean
  PaymentSetupId: number
  PaymentSetupMethodId: number
  BankName: string
  Notes: string
  RoutingNumber: string
  AccountNumber: string
  AccountingType: string
}

export interface DeactivateBankAccountOptions {
  PaymentSetupId: number
}

export interface GetAllBankAccountOptions {
  Type: string
}

export interface PaymentMethodListOptions {
  ProviderId: string | undefined
}

export interface SavePaymentMethodOptions {
  PaymentSetupId: number
  PaymentSetupMethodId: number
  isAch: boolean | null
  isVcn: boolean | null
  isCheck: boolean | null
}

export interface SaveCheckMicroDepositOptions {
  PaymentSetupMethodId: number
  AccountId: string
  deposit1: number
  deposit2: number
}

export interface ApproveRejectCheckOptions {
  PaymentSetupMethodId: number
  AccountId: string
  isApprove: boolean
  isReject: boolean
}

export interface PreviewCheckImageOptions {
  AccountId: string
}

export interface SaveCheckPaymentMethodOptions {
  PaymentSetupId: string
  PaymentSetupMethodId: string
  AccountingType: string
  AccountNumber: string
  RoutingNumber: string
  BankName: string
  CheckStartNumber: string
  street1: string;
  city: number;
  state: number;
  country: number;
  postalCode: string;
  Signature: string | null
  isCheck: string
}

export interface PaymentSetupListOptions {
  isAch: boolean;
  isVcn: boolean;
  CheckStartNumber: number | null;
  isCheck: boolean;
  File: any;
  SignatureAttachmentPath: string | null;
  SignatureAttachmentName: string | null;
  SignatureAttachmentType: string | null;
  PaymentSetupId: number;
  PaymentSetupMethodId: number;
  AccountId: number | null;
  AccountNumber: string;
  AccountingType: null;
  AccountingTypeVal: number;
  RoutingNumber: string;
  BankName: string;
  BranchId: number | null;
  AccountHolderName: string | null;
  Notes: string | null;
  PhoneNumber: string | null;
  Email: string | null;
  PrimaryContact: string | null;
  PayToContact: string | null;
  ReturnToContact: string | null;
  GlAccountType: null;
  GlAccountId: number | null;
  ServiceChargeGlId: number | null;
  IntEarnedGlId: number | null;
  DefaultPayableGl: string | null;
  DefaultReceivableGl: string | null;
  LastReconciledValue: any;
  CutOffDate: any;
  DeptartmentId: number | null;
  LocationId: number | null;
  IsActive: boolean;
  IsVerified: boolean;
  isApproved: boolean;
  Name: string | null;
  UniqueId: string | null;
  Status: any;
  ExternalStatus: any;
  Address: {
    street1: string;
    city: number;
    state: number;
    country: number;
    postalCode: string;
  };
}
