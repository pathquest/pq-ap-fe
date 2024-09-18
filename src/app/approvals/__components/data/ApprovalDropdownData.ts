export const approvalOptions = [
  {
    label: 'Bill Approval',
    value: '1'
  },
  {
    label: 'Payment Approval',
    value: '2'
  },
  {
    label: 'Purchase Order Approval',
    value: '3',
    isEnable: false
  },
]

export const ReasonOption = [
  {
    label: 'Change Payment Detail',
    value: 'Change Payment Detail',
  },
  {
    label: 'Change Payment Method',
    value: 'Change Payment Method',
  },
  {
    label: 'Change Bank',
    value: 'Change Bank',
  },
  {
    label: 'Change Credit to apply',
    value: 'Change Credit to apply',
  },
  {
    label: 'Other',
    value: 'Other',
  },
]

export const dummyData = [
  {
    PaymentId: 1,
    ApprovalStatus: 0,
    ApprovalStatusName: "Pending",
    TotalAmount: 3750.50,
    PaymentMethod: 1,
    PaymentMethodName: "Check",
    IsPostedByUser: false,
    BankAccountId: 19,
    BankAccount: "SBI-Test",
    VendorName: "Fred Lau Haw'n Landscape Maint. Co. LLC",
    BatchId: 2,
    BillDetail: [
      {
        AccountPayableId: 1,
        DueDate: "2024-02-22T00:00:00",
        BillNumber: "011635401",
        PaymentStatus: 0,
        PaymentStatusName: "Unpaid",
        PaymentAmount: 3000.00,
        Attachments: [
          {
            Id: 1,
            FilePath: "20_06_2024/Attachment/104/212003.pdf",
            FileName: "212003.pdf",
            Size: 194867.0
          },
          {
            Id: 3,
            FilePath: "20_06_2024/Attachment/104/212003.pdf",
            FileName: "212003.pdf",
            Size: 194867.0
          },
          {
            Id: 4,
            FilePath: "20_06_2024/Attachment/104/213861.pdf",
            FileName: "213861.pdf",
            Size: 192579.0
          },
          {
            Id: 5,
            FilePath: "20_06_2024/Attachment/104/213653.pdf",
            FileName: "213653.pdf",
            Size: 194131.0
          },
          {
            Id: 9,
            FilePath: "21_06_2024/Attachment/104/demoprod2.pdf",
            FileName: "demoprod2.pdf",
            Size: 15693.0
          },
          {
            Id: 10,
            FilePath: "21_06_2024/Attachment/104/demoprod2.pdf",
            FileName: "demoprod2.pdf",
            Size: 15693.0
          },
          {
            Id: 11,
            FilePath: "21_06_2024/Attachment/104/demoprod2.pdf",
            FileName: "demoprod2.pdf",
            Size: 15693.0
          },
          {
            Id: 12,
            FilePath: "21_06_2024/Attachment/104/demoprod2.pdf",
            FileName: "demoprod2.pdf",
            Size: 15693.0
          }
        ]
      },
      {
        AccountPayableId: 2,
        BillNumber: "011635401",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      },
      {
        AccountPayableId: 3,
        BillNumber: "01163540112",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      },
      {
        AccountPayableId: 4,
        BillNumber: "01163547401",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      },
      {
        AccountPayableId: 5,
        BillNumber: "0116357547401",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      }
    ]
  },
  {
    PaymentId: 2,
    ApprovalStatus: 1,
    ApprovalStatusName: "Approved",
    TotalAmount: 3750.50,
    PaymentMethod: 1,
    PaymentMethodName: "Check",
    IsPostedByUser: true,
    BankAccountId: 19,
    BankAccount: "SBI-Test",
    VendorName: "AB Vendor",
    BatchId: 2,
    BillDetail: [
      {
        AccountPayableId: 6,
        DueDate: "2024-02-22T00:00:00",
        BillNumber: "011635486701",
        PaymentStatus: 0,
        PaymentStatusName: "Unpaid",
        PaymentAmount: 3000.00,
        Attachments: [
          {
            Id: 1,
            FilePath: "20_06_2024/Attachment/104/212003.pdf",
            FileName: "212003.pdf",
            Size: 194867.0
          },
          {
            Id: 3,
            FilePath: "20_06_2024/Attachment/104/212003.pdf",
            FileName: "212003.pdf",
            Size: 194867.0
          },
          {
            Id: 4,
            FilePath: "20_06_2024/Attachment/104/213861.pdf",
            FileName: "213861.pdf",
            Size: 192579.0
          },
          {
            Id: 5,
            FilePath: "20_06_2024/Attachment/104/213653.pdf",
            FileName: "213653.pdf",
            Size: 194131.0
          }
        ]
      },
      {
        AccountPayableId: 2,
        BillNumber: "011635401",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      },
      {
        AccountPayableId: 3,
        BillNumber: "01163540112",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      },
      {
        AccountPayableId: 4,
        BillNumber: "01163547401",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      },
      {
        AccountPayableId: 5,
        BillNumber: "0116357547401",
        PaymentStatus: "Unpaid",
        DueDate: "2024-02-22T00:00:00",
        PaymentAmount: 3000.00,
        Guid: "641c3e0f-b105-41e3-802c-18982689ef0e",
        Attachments: []
      }
    ]
  },
  {
    PaymentId: 3,
    ApprovalStatus: 2,
    ApprovalStatusName: "Rejected",
    TotalAmount: 3750.50,
    PaymentMethod: 1,
    PaymentMethodName: "Check",
    IsPostedByUser: true,
    BankAccountId: 19,
    BankAccount: "SBI-Test",
    VendorName: "Tech Solutions",
    BatchId: 2,
    BillDetail: null
  },
  {
    PaymentId: 4,
    ApprovalStatus: 1,
    ApprovalStatusName: "Approved",
    TotalAmount: 3750.50,
    PaymentMethod: 1,
    PaymentMethodName: "Check",
    IsPostedByUser: false,
    BankAccountId: 19,
    BankAccount: "SBI-Test",
    VendorName: "Office Depot",
    BatchId: 2,
    BillDetail: null
  },
  {
    PaymentId: 5,
    ApprovalStatus: 0,
    ApprovalStatusName: "Pending",
    TotalAmount: 3750.50,
    PaymentMethod: 1,
    PaymentMethodName: "Check",
    IsPostedByUser: false,
    BankAccountId: 19,
    BankAccount: "SBI-Test",
    VendorName: "Office Depot",
    BatchId: 1,
    BillDetail: [
      {
        AccountPayableId: 10,
        DueDate: "2024-02-22T00:00:00",
        BillNumber: "011635486701",
        PaymentStatus: 0,
        PaymentStatusName: "Unpaid",
        PaymentAmount: 3000.00,
      }]
  }
];