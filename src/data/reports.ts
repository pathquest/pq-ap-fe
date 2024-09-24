export const ViewByList = [
  { value: 2, label: 'Bill Date' },
  { value: 1, label: 'Due Date' },
]

export const AsOfReportPeriodByList = [
  { value: 1, label: 'Today' },
  { value: 2, label: 'Yesterday' },
  { value: 3, label: 'This Week' },
  { value: 4, label: 'Last Week' },
  { value: 5, label: 'This Month' },
  { value: 6, label: 'Last Month' },
  { value: 7, label: 'This Year' },
  { value: 8, label: 'Last Year' },
  { value: 9, label: 'As of' },
]

export const SelectRangeReportPeriodByList = [
  { value: 1, label: 'Today' },
  { value: 2, label: 'This Week' },
  { value: 3, label: 'Last Week' },
  { value: 4, label: 'This Month' },
  { value: 5, label: 'Last Month' },
  { value: 6, label: 'This Year' },
  { value: 7, label: 'Last Year' },
  { value: 8, label: 'Custom Range' },
]

export const VendorAgingViewList = [
  { value: 2, label: 'Bill Date' },
  { value: 1, label: 'Due Date' },
  { value: 3, label: 'GL Posting Date' },
]

export const GroupByList = [
  { value: '1', label: 'Partially Paid' },
  { value: '2', label: 'Paid' },
  { value: '3', label: 'Unpaid' },
]

export const GroupByListVendorAging = [
  { value: 1, label: 'Vendor' },
  { value: 2, label: 'Due Date' },
]

export const BillsPaymentData = [
  {
    Id: 1,
    Vendor: 'The Home Depot Inc.',
    BillNumber: 'INV1941',
    BillDate: 'June 10, 2024',
    TransactionType: 'Accounts Payable',
    CreatedDate: 'June 10, 2024',
    CreatedBy: 'Bhavik Shah',
    ModifiedBy: 'Ajay Shah',
    LastModified: 'June 10, 2024',
    Amount: '$100,000',
    Description: 'abc',
  },
  {
    Id: 2,
    Vendor: 'The Home Depot Inc.',
    BillNumber: 'INV1941',
    BillDate: 'June 10, 2024',
    TransactionType: 'Account Payable',
    CreatedDate: 'June 10, 2024',
    CreatedBy: 'Bhavik Shah',
    ModifiedBy: 'Ajay Shah',
    LastModified: 'June 10, 2024',
    Amount: '$100,000',
    Description: 'abc',
  },
]

export const BillAnalysisDetailColumns: any = [
  {
    header: 'VENDOR ID',
    accessor: 'VENDORID',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'VENDOR NAME',
    accessor: 'VENDORNAME',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'BILL STATUS',
    accessor: 'BILLSTATUS',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'TRANSACTION TYPE',
    accessor: 'TRANSACTIONTYPE',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'LOCATION',
    accessor: 'LOCATION',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'BILL DATE',
    accessor: 'BILLDATE',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'DUE DATE',
    accessor: 'DUEDATE',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'TERM',
    accessor: 'TERM',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'BILL NUMBER',
    accessor: 'BILLNUMBER',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'AMOUNT',
    accessor: 'AMOUNT',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'PAYMENT STATUS',
    accessor: 'PAYMENTSTATUS',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'PAID AMOUNT',
    accessor: 'PAIDAMOUNT',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'AMOUNT DUE',
    accessor: 'AMOUNTDUE',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },

]
export const BillsPaymentcolumns: any = [
  {
    header: 'VENDOR NAME',
    accessor: 'Vendor',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
    header: 'BILL NUMBER',
    accessor: 'BillNumber',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'LOCATION',
    accessor: 'Location',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'BILL DATE',
    accessor: 'BillDate',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },

  {
    header: 'AMOUNT',
    accessor: 'Amount',
    sortable: true,
    colalign: 'right',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
]

export const VendorSummaryDetail: any =[
  {
    header: 'VENDOR',
    accessor: 'Vendor',
    sortable: false,
    colalign: 'left',
    colStyle: '!pl-5 !w-[128px] !tracking-[0.02em]',
  },
  {
    header: 'BILL NUMBER',
    accessor: 'BillNumber',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[145px] !tracking-[0.02em]',
  },
  {
    header: 'BILL DATE',
    accessor: 'BillDate',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[125px] !tracking-[0.02em]',
  },
  {
    header: 'LOCATION',
    accessor: 'Location',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'TRANSACTION TYPE',
    accessor: 'TransactionType',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'REMAINING AMOUNT',
    accessor: 'Amount',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
]

export const VendorBalanceDetailcolumns: any = [
  {
    header: 'DAYS PER AGING',
    accessor: 'Vendor',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[180px] !tracking-[0.02em]',
  },

  {
    header: '',
    accessor: '',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[180px] !tracking-[0.02em]',
  },
  {
    header: '',
    accessor: '',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: '',
    accessor: '',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: '',
    accessor: '',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
]

export const VendorBalanceSummarycolumns: any = [
  {
    header: 'VENDOR',
    accessor: 'Vendor',
    sortable: false,
    colalign: 'left',
    colStyle: '!pl-5 !w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'CURRENT',
    accessor: 'Current',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: '1-30 Days',
    accessor: '1-30',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: '31-60 Days',
    accessor: '31-60',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: '61-90 Days',
    accessor: '61-90',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: '91+ Days',
    accessor: '91+',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'TOTAL',
    accessor: 'Total',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
]

export const ApLedgercolumns: any = [
  {
    header: 'DATE',
    accessor: 'Vendor',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'TRANSACTION TYPE',
    accessor: 'TransactionType',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'BILL NUMBER',
    accessor: 'BillNumber',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'LOCATION',
    accessor: 'Location',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'DUE DATE',
    accessor: 'DueDate',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'CHARGES',
    accessor: 'Charges',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'PAYMENTS',
    accessor: 'Payments',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'BALANCE',
    accessor: 'Balance',
    sortable: false,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
]

export const payableInvoiceDetailcolumns: any = [
  {
    header: 'DATE',
    accessor: 'Vendor',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'TRANSACTION TYPE',
    accessor: 'TransactionType',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[140px] !tracking-[0.02em]',
  },
  {
    header: 'BILL NUMBER',
    accessor: 'BillNumber',
    sortable: true,
    colalign: 'left',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'DUE DATE',
    accessor: 'DueDate',
    sortable: true,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'AMOUNT',
    accessor: 'Amount',
    sortable: true,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
  {
    header: 'BALANCE',
    accessor: 'Balance',
    sortable: true,
    colalign: 'right',
    colStyle: '!w-[120px] !tracking-[0.02em]',
  },
]
