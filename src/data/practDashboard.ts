export const practDashboardData = [
  {
    OrganizationName: 'PGS',
    OrganizationId: 5,
    AccountingDashboardDetail: [
      {
        CompanyName: 'Intacct Demo',
        CompanyId: 3,
        CompanyImage: null,
        TotalBillPosted: 0,
        TotalBills: 200,
        PendingPaymentAproval: 2,
        PendingOverDueBills: 0,
        PossibleDuplication: 0,
        BillNotProcessed: 0,
        BillNotProcessedPercentage: 0,
        TotalAmountSpent: 0,
        NewVendors: 10,
        SavedAmount: 0,
        RejectedBills: 0,
        TatMissed: 0,
        DisputedBills: 0,
        UncategorizedExpence: 0,
      },
    ],
  },
]

export const practDashboardTabs = [
  { id: 'accountant-dashboard', label: 'ACCOUNTANT DASHBOARD' },
  { id: 'billInfo', label: 'BILLING INFO' },
]

export const tableDataCashBack = [
  {
    paymentMethodId: 1,
    paymentMethod: 'Virtual Card Current Usage',
    ranges: [
      { range: '<$500k', rebate: '0.5%' },
      { range: '$500k-$1M', rebate: '0.75%' },
      { range: '>$1M', rebate: '1.0%' },
    ],
  },
  {
    paymentMethodId: 2,
    paymentMethod: 'ACH+ Current Revenue',
    ranges: [
      { range: '$0-$10k', rebate: '30.00%', check: true },
      { range: '>$10k', rebate: '40.00%', check: false },
    ],
  },
]

export const activePlanData = {
  price: '$24.99',
  billingPeriod: 'Per Month',
  nextBillingDate: '05/05/2024',
  totalLimit: '1345 Bills',
  currentConsumption: '64 Bills',
  remainingBills: '1281 Bills',
}

export const insightsData = {
  totalAmountSpent: '$56,332',
  totalNewVendorsAdd: '32 new vendors',
  payingBillsDueDate: '$451 saved',
  uncategorizedExpense: '64 bills',
  rejectedByApprover: '18 bills',
  rejectedOutOff: '763',
  TATmissed: '106 bills',
  flaggedDisputed: '08 bills',
}

export const ManageCompaniesData = [
  {
    Id: 1,
    organizationName: 'Zala',
    companyList: [],
  },
]

export const BillingInfoData = [
  {
    OrganizationName: 'PGS',
    OrganizationId: 5,
    CompanyBillingInfoList: [
      {
        CompanyName: 'Intacct Demo',
        CompanyId: 3,
        CompanyImage: null,
        TotalBillPosted: 32,
        PaymentMethodDetails: [
          {
            PaymentMethod: 1,
            PaymentCount: 12,
            Amount: 500,
            OtherCharges: 48,
          },
          {
            PaymentMethod: 2,
            PaymentCount: 23,
            Amount: 509000,
            OtherCharges: 10,
          },
          {
            PaymentMethod: 5,
            PaymentCount: 34,
            Amount: 459000,
            OtherCharges: 10,
          },
        ],
      },
      {
        CompanyName: 'Intacct Demo',
        CompanyId: 3,
        CompanyImage: null,
        TotalBillPosted: 32,
        PaymentMethodDetails: [
          {
            PaymentMethod: 1,
            PaymentCount: 12,
            Amount: 500,
            OtherCharges: 48,
          },
        ],
      },
    ],
  },
  {
    OrganizationName: 'PGS2',
    OrganizationId: 52,
    CompanyBillingInfoList: [
      {
        CompanyName: 'Intacct Demo',
        CompanyId: 3,
        CompanyImage: null,
        TotalBillPosted: 32,
        PaymentMethodDetails: [
          {
            PaymentMethod: 1,
            PaymentCount: 12,
            Amount: 500,
            OtherCharges: 48,
          },
          {
            PaymentMethod: 2,
            PaymentCount: 23,
            Amount: 509000,
            OtherCharges: 10,
          },
          {
            PaymentMethod: 5,
            PaymentCount: 34,
            Amount: 459000,
            OtherCharges: 10,
          },
        ],
      },
      {
        CompanyName: 'Intacct Demo',
        CompanyId: 3,
        CompanyImage: null,
        TotalBillPosted: 32,
        PaymentMethodDetails: [
          {
            PaymentMethod: 1,
            PaymentCount: 12,
            Amount: 500,
            OtherCharges: 48,
          },
        ],
      },
    ],
  },
]

export const BillingInfoHeaders = [
  {
    header: '#',
    accessor: 'OrganizationId',
    sortable: false,
    colStyle: '!w-[4%]',
    group: '#',
    hideGroupLabel: true,
  },
  {
    header: 'ORGANIZATION NAME',
    accessor: 'OrganizationName',
    sortable: false,
    colStyle: '!w-[150px] !font-bold',
    group: 'ORGANIZATION NAME',
    hideGroupLabel: true,
  },
  {
    header: 'COMPANY NAME',
    accessor: 'CompanyName',
    sortable: false,
    colStyle: '!w-[180px] !font-bold',
    group: 'COMPANY NAME',
    hideGroupLabel: true,
  },
  {
    header: 'BILL POSTED',
    accessor: 'TotalBillPosted',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'BILL POSTED',
    hideGroupLabel: true,
  },
  {
    header: 'CHECK',
    accessor: 'CheckUsage',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'ACH',
    accessor: 'AchUsage',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'VIRTUAL CARD',
    accessor: 'VirtualCardUsage',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'CHECK CHARGES',
    accessor: 'CheckCharges',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'OTHER CHARGES',
    hideGroupLabel: false,
  },
  {
    header: 'ACH CHARGES',
    accessor: 'AchCharges',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'OTHER CHARGES',
    hideGroupLabel: false,
  },
]

export const BillingInfoNestedHeaders = [
  {
    header: '',
    accessor: '',
    sortable: false,
    colStyle: '!w-[220px]',
  },
  {
    header: 'ORGANIZATION NAME',
    accessor: 'OrganizationName',
    sortable: false,
    colStyle: '!w-[150px] !font-bold',
    group: 'ORGANIZATION NAME',
  },
  {
    header: 'COMPANY NAME',
    accessor: 'CompanyName',
    sortable: false,
    colStyle: '!w-[180px] !font-bold',
    group: 'COMPANY NAME',
  },
  {
    header: 'BILL POSTED',
    accessor: 'TotalBillPosted',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'BILL POSTED',
  },
  {
    header: 'CHECK',
    accessor: 'CheckUsage',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'USAGE',
  },
  {
    header: 'ACH',
    accessor: 'AchUsage',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'USAGE',
  },
  {
    header: 'VIRTUAL CARD',
    accessor: 'VirtualCardUsage',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'USAGE',
  },
  {
    header: 'CHECK CHARGES',
    accessor: 'CheckCharges',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'OTHER CHARGES',
  },
  {
    header: 'ACH CHARGES',
    accessor: 'AchCharges',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
    group: 'OTHER CHARGES',
  },
]

export const companyHeaders = [
  {
    header: '#',
    accessor: 'Id',
    sortable: false,
    colStyle: '!w-[20px]',
  },
  {
    header: 'ORGANIZATION NAME',
    accessor: 'organizationName',
    sortable: true,
    colStyle: '!w-[120px] !font-bold',
  },
  {
    header: 'COMPANY',
    accessor: 'Name',
    sortable: false,
    colStyle: '!w-[200px] !font-bold',
  },
  {
    header: 'CONNECTED WITH',
    accessor: 'AccountingTool',
    sortable: false,
    colStyle: '!w-[180px] !font-bold',
  },
  {
    header: 'MODIFIED DATE',
    accessor: 'UpdatedOn',
    sortable: false,
    colStyle: '!w-[190px] !font-bold',
  },
  {
    header: 'ASSIGN USER',
    accessor: 'AssignUsers',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
  },
  {
    header: '',
    accessor: 'action',
    sortable: false,
    colStyle: '!w-[6%]',
  },
]

export const companyListNestedHeaders = [
  {
    header: '',
    accessor: '',
    sortable: false,
    colStyle: '!w-[200px]',
  },
  {
    header: 'COMPANY',
    accessor: 'Name',
    sortable: false,
    colStyle: '!w-[250px] !font-bold',
  },
  {
    header: 'CONNECTED WITH',
    accessor: 'AccountingTool',
    sortable: false,
    colStyle: '!w-[180px] !font-bold',
  },
  {
    header: 'MODIFIED DATE',
    accessor: 'UpdatedOn',
    sortable: false,
    colStyle: '!w-[190px] !font-bold',
  },
  {
    header: 'ASSIGN USER',
    accessor: 'AssignUsers',
    sortable: false,
    colStyle: '!w-[120px] !font-bold',
  },
  {
    header: '',
    accessor: 'action',
    sortable: false,
    colStyle: '!w-[5%]',
  },
]

export const companyListHeaders = [
  {
    header: '#',
    accessor: 'Id',
    sortable: true,
    colStyle: '!w-[4%] !pl-[20px]',
  },
  {
    header: 'COMPANY',
    accessor: 'Name',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
  },
  {
    header: 'CONNECTED WITH',
    accessor: 'AccountingTool',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
  },
  {
    header: 'MODIFIED DATE',
    accessor: 'UpdatedOn',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
  },
  {
    header: 'ASSIGN USER',
    accessor: 'AssignUsers',
    sortable: false,
    colStyle: '!tracking-wide !font-bold !w-[15%]',
  },
  {
    header: '',
    accessor: 'action',
    sortable: false,
    colStyle: '!w-[5%]',
  },
]

export const billingInfoHeaders = [
  {
    header: '#',
    accessor: 'Id',
    sortable: false,
    colStyle: '!w-[4%]',
    hideGroupLabel: true,
  },
  {
    header: 'COMPANY NAME',
    accessor: 'CompanyName',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
    group: 'COMPANY NAME',
    hideGroupLabel: true,
  },
  {
    header: 'BILL POSTED',
    accessor: 'TotalBillPosted',
    sortable: false,
    colStyle: '!tracking-wide',
    group: 'BILL POSTED',
    hideGroupLabel: true,
  },
  {
    header: 'CHECK',
    accessor: 'CheckUsage',
    sortable: false,
    colStyle: '!tracking-wide',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'ACH',
    accessor: 'AchUsage',
    sortable: false,
    colStyle: '!tracking-wide',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'ACH+',
    accessor: 'AchUsagePlus',
    sortable: false,
    colStyle: '!tracking-wide',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'VIRTUAL CARD',
    accessor: 'VirtualCardUsage',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
    group: 'USAGE',
    hideGroupLabel: false,
  },
  {
    header: 'CHECK',
    accessor: 'CheckCharges',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
    group: 'OTHER CHARGES',
    hideGroupLabel: false,
  },
  {
    header: 'ACH',
    accessor: 'AchCharges',
    sortable: false,
    colStyle: '!tracking-wide !font-bold',
    group: 'OTHER CHARGES',
    hideGroupLabel: false,
  },
]
