import { Column } from "@/models/files";

export const createOptions = [
  {
    id: '1',
    label: 'Accounts Payable',
  },
  {
    id: '2',
    label: 'Accounts Adjustment',
  },
  {
    id: '3',
    label: 'Existing Bill',
  },
  // {
  //   id: '4',
  //   label: 'Existing Vendor Document',
  // },
]

export const HistoryNestedColumns: Column[] = [
  {
      header: 'FILE NAME',
      accessor: 'FileName',
      sortable: false,
      colStyle: '!w-[160px] !tracking-[0.02em]',
  },
  {
      header: 'BILL NO.',
      accessor: 'BillNo',
      sortable: false,
      colStyle: '!w-[160px] !tracking-[0.02em]',
  },
  {
      header: 'PROCESS',
      accessor: 'APProviderType',
      sortable: false,
      colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
      header: 'AMOUNT',
      accessor: 'Amount',
      sortable: false,
      colStyle: '!w-[125px] !pr-[30px] !tracking-[0.02em]',
      colalign: 'right',
  },
  {
      header: 'UPLOADED DATE & TIME',
      accessor: 'UploadedDate',
      sortable: false,
      colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
      header: 'PAGES',
      accessor: 'Pages',
      sortable: false,
      colStyle: '!w-[100px] !tracking-[0.02em]',
      colalign: 'right'
  },
  {
      header: 'LOCATION',
      accessor: 'LocationName',
      sortable: false,
      colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
      header: '',
      accessor: 'Status',
      sortable: false,
      colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
      header: '',
      accessor: 'actions',
      sortable: false,
      colStyle: '!w-[200px] !tracking-[0.02em]',
  },
]

export const columns: any = [
  {
    header: 'Received/Uploaded',
    accessor: 'UserName',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'Source',
    accessor: 'ProviderTypeName',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'Uploaded Date & Time',
    accessor: 'UploadedDate',
    sortable: false,
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
    header: 'Attachments',
    accessor: 'Attachments',
    sortable: false,
    colStyle: '!w-[120px] !tracking-[0.02em]',
    colalign: 'right',
  },
  {
    header: '',
    accessor: '',
    sortable: false,
    colStyle: '!w-[20px] !tracking-[0.02em]',
  },
];

export const sourceOptions = [
  {
    label: 'File Upload',
    value: '1',
    imageUrl: '/file-upload.svg',
  },
  {
    label: 'Dropbox',
    value: '2',
    imageUrl: '/dropbox.svg',
  },
  {
    label: 'Email',
    value: '3',
    imageUrl: '/email.svg',
  },
  {
    label: 'Google Drive',
    value: '4',
    imageUrl: '/google-drive.svg',
  },
  {
    label: 'FTP',
    value: '5',
    imageUrl: '/ftp.svg',
  },
]

export const processOptions = [
  {
    label: 'Accounts Payable',
    value: '1',
  },
  {
    label: 'Accounts Adjustment',
    value: '2',
  },
  {
    label: 'Others',
    value: '3',
  },
]
