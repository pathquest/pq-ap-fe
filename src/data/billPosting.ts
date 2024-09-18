import { convertStringsDateToUTC } from '@/utils'
import { format } from 'date-fns'

const chatAllItems = [
  {
    avatar: 'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    name: 'Diana Yundt',
    typeLabel: 'Comment',
    dateTime: '09/03/2022, 10:30 am',
    msg: 'Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.',
    editAction: true,
    reminderAction: true,
  },
  {
    avatar: 'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    name: 'Diana Yundt',
    typeLabel: 'Comment',
    dateTime: '09/05/2022, 10:30 am',
    msg: 'Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.',
    editAction: true,
    reminderAction: true,
  },
  {
    avatar: 'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    name: 'Diana Yundt',
    typeLabel: 'Comment',
    dateTime: '09/05/2022, 10:30 am',
    msg: 'Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.Excepturi animi assumenda fuga voluptatum excepturi et velit ab nesciunt.',
    editAction: true,
    reminderAction: true,
  },
  {
    avatar: 'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    name: 'Diana Yundt',
    typeLabel: 'History',
    dateTime: '12/19/2023, 10:30 am',
    msg: 'Payment initiated of $5000 for ABx',
    editAction: false,
    reminderAction: false,
  },
  {
    avatar: 'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    name: 'Diana Yundt',
    typeLabel: 'Reminder',
    dateTime: '12/20/2023, 10:30 am',
    msg: 'Hi, Doreen Christiansen Please review your bill.',
    editAction: true,
    reminderAction: true,
  },
  {
    avatar: 'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    name: 'Diana Yundt',
    typeLabel: 'Reminder',
    dateTime: '12/20/2023, 10:30 am',
    msg: 'Hi, Doreen Christiansen Please review your bill.',
    editAction: true,
    reminderAction: true,
  },
]

const assignUsersList = [
  { name: 'Erika Bode', id: 1, url: '/avatar.png' },
  { name: 'Jhon Duo', id: 2, url: '/avatar.png' },
  { name: 'Brad Spinka ', id: 3, url: '/avatar.png' },
  { name: 'Mr. Domingo', id: 4, url: '/avatar.png' },
  { name: 'Arthur Mohr ', id: 5, url: '/avatar.png' },
  { name: 'Courtney Langworth', id: 6, url: '/avatar.png' },
  { name: 'Juana Hill IV', id: 7, url: '/avatar.png' },
  { name: 'Diana Yundt', id: 8, url: '/avatar.png' },
]

const AssignedFilterData = [
  { value: '1', label: 'Assigned to me' },
  { value: '2', label: 'Assigned to other' },
  { value: '3', label: 'Unassigned' },
]

const moveToOptions = [
  {
    label: 'Accounts Payable',
    value: 1,
  },
  {
    label: 'Accounts Adjustment',
    value: 2,
  },
  {
    label: 'Other',
    value: 3,
  },
]

const attachfileheaders: any = [
  {
    header: 'File Name',
    accessor: 'FileName',
    sortable: false,
    colalign: 'left',
  },
  {
    header: 'File Size',
    accessor: 'Size',
    sortable: false,
    colalign: 'right',
  },
]

const accountOptions = [
  {
    label: 'Account Payable',
    value: '1',
  },
  {
    label: 'Account Adjustment',
    value: '2',
  },
  {
    label: 'Other',
    value: '3',
  },
]

export const todayDate = convertStringsDateToUTC(format(new Date(), 'MM/dd/yyyy'))

const accountPayableObj = {
  Id: 0,
  CompanyId: null,
  ProcessType: null,
  UserId: null,
  TransactionDate: null,
  VendorId: null,
  BillNumber: null,
  Description: null,
  DueDate: null,
  GLPostingDate: null,
  OnHold: null,
  Amount: null,
  Status: null,
  PaidAmount: null,
  DueAmount: null,
  LocationId: null,
  BillDate: null,
  TermId: null,
  ActionReason: null,
  PONumber: null,
  Custom1: null,
  Custom2: null,
  Custom3: null,
  Custom4: null,
  Custom6: null,
  Custom7: null,
  Custom8: null,
  Custom9: null,
  Custom10: null,
}

const accountPayableAdditionalObj = {
  Id: 0,
  AccountPayableId: 0,
  BatchId: 0,
  RefrenceNumber: '',
  BillDate: todayDate,
  TATEndDate: todayDate,
  CurrencyCode: '',
  FromId: '',
  FromName: '',
  LineAmountTypes: 0,
  Total: 0,
  TotalTax: 0,
  PaidAmount: 0,
  PaymentDate: todayDate,
  PaymentStatus: 0,
  RecommendedToPayOn: '',
  SubtoTax: 0,
  HasAttachments: false,
  IsAttachmentsDownloaded: false,
  AttachmentIDs: '',
  Attempt: 0,
  DocumentPath: '',
  ExternalEntry: false,
  LastProcessTime: todayDate,
  custom1: '',
  custom2: '',
  custom3: '',
  custom4: '',
  custom5: '',
  custom6: '',
  custom7: '',
  custom8: '',
  MailingAddress: '',
  MissingDocument: '',
  ApBillReceiveDate: '',
  PodVerification: '',
  FixedAssets: '',
  Memo: '',
  Comment: '',
  AdjestmentReferenceNumber: '',
  Return: '',
  PoNumber: '',
  PermitNo: '',
  AmountsAre: '',
}

const accountPayableLineItemsObj = {
  Id: 0,
  AccountPayableId: 0,
  GLAccount: null,
  Amount: null,
  Memo: null,
  Description: null,
  Item: null,
  Class: null,
  Rate: null,
  Quantity: null,
  RecordNo: null,
  Tax: null,
  TaxAmount: null,
  TaxType: null,
  SalesAmount: null,
  UnitAmount: null,
  DiscountRate: null,
  ProductServiceId: null,
  Custom1: null,
  Custom2: null,
  Custom3: null,
  Custom4: null,
  Custom6: null,
  Custom7: null,
  Custom8: null,
  Custom9: null,
  Custom10: null,
}

export {
  AssignedFilterData,
  assignUsersList,
  accountOptions,
  chatAllItems,
  moveToOptions,
  attachfileheaders,
  accountPayableObj,
  accountPayableAdditionalObj,
  accountPayableLineItemsObj,
}
