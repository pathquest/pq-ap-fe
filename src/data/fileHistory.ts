
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
  {
    id: '4',
    label: 'Existing Vendor Document',
  },
]

export const columns:any = [
  {
    header: 'RECEIVED/UPLOADED',
    accessor: 'UserName',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'SOURCE',
    accessor: 'ProviderTypeName',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'UPLOADED DATE & TIME',
    accessor: 'UploadedDate',
    sortable: false,
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
    header: 'ATTACHMENTS',
    accessor: 'Attachments',
    sortable: false,
    colStyle: '!w-[120px] !tracking-[0.02em]',
    colalign:'right'
  },
  {
    header: '',
    accessor: '',
    sortable: false,
    colStyle: '!w-[20px] !tracking-[0.02em]',
  },
]

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
