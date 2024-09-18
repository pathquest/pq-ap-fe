'use client'

import ApprovalModal from '@/app/approvals/__components/ApprovalModal'
import FileModal from '@/app/bills/__components/FileModal'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import AcceptIcon from '@/assets/Icons/AcceptIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import HistoryIcon from '@/assets/Icons/HistoryIcon'
import InfoIcon from '@/assets/Icons/infoIcon'
import ReassignIcon from '@/assets/Icons/ReassignIcon'
import RejectIcon from '@/assets/Icons/RejectIcon'
import SendReminder from '@/assets/Icons/SendReminder'
import SortIcon from '@/assets/Icons/SortIcon'
import Download from '@/components/Common/Custom/Download'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import usePdfViewer from '@/components/Common/pdfviewer/pdfViewer'
import { FileRecordType } from '@/models/billPosting'
import { Option } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getPaymentApprovalList, paymentReAssign, paymentsApproval } from '@/store/features/billApproval/approvalSlice'
import { vendorDropdown } from '@/store/features/bills/billSlice'
import { getBankAccountDrpdwnList, getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { companyAssignUser } from '@/store/features/company/companySlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge, CheckBox, DataTable, Loader, Select, Textarea, Toast, BasicTooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ReasonOption, dummyData } from '../data/ApprovalDropdownData'
import Filter from '../Filter/PaymentFilter'
import SelectApprovalDropdown from '../SelectApprovalDropdown'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'
import Wrapper from '@/components/Common/Wrapper'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'

const PaymentApproval: React.FC = () => {
  const router = useRouter()
  const userId = useMemo(() => localStorage.getItem('UserId'), [])
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const { paymentApprovalFilterFields } = useAppSelector((state) => state.billApproval)
  const { showPDFViewerModal, PDFUrl, setPDFUrl, fileBlob, isPdfLoading } = usePdfViewer()
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  const dispatch = useAppDispatch()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-200px)]')
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false)

  const [vendorOption, setVendorOption] = useState<any>([])
  const [isIntermediate, setIsIntermediate] = useState<any>({
    isEnable: false,
    isChecked: false,
  })
  const [selectedRows, setSelectedRows] = useState<any>([])
  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1

  const [orderBy, setOrderBy] = useState<number | null>(1)
  const [orderColumnName, setOrderColumnName] = useState<string | null>(null)
  const [sortOrders, setSortOrders] = useState<{ [key: string]: null | 'asc' | 'desc' }>({
    VendorName: null,
    ApprovalStatus: null,
    BankAccount: null,
    PaymentMethodName: null,
    TotalAmount: null,
  })

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [paymentApprovalList, setPaymentApprovalList] = useState<any>(dummyData)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [paymentMethodOption, setPaymentMethodOption] = useState<Option[]>([])
  const [isApprovalModalLoader, setIsApprovalModalLoader] = useState<boolean>(false)

  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentVendorName, setPaymentVendorName] = useState<string>('')

  const [assignee, setAssignee] = useState<OptionType[]>([])
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false)

  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false)
  const [reAssigneeDropError, setReAssigneeDropError] = useState<boolean>(false)
  const [selectedAssignee, setSelectedAssignee] = useState<number>(0)

  const [reAssignReason, setReAssignReason] = useState<string>('')
  const [reAssignReasonError, setReAssignReasonError] = useState<boolean>(false)
  const [reAssignReasonHasError, setReAssignReasonHasError] = useState<boolean>(false)

  const [reasonValue, setReassonValue] = useState<string>('')
  const [reasonSelect, setReasonSelect] = useState<string>('')
  const [reasonDropdownError, setReasonDropdownError] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('')
  const [reasonError, setReasonError] = useState<boolean>(false)
  const [reasonHasError, setReasonHasError] = useState<boolean>(false)
  const [rowPaymentId, setRowPaymentId] = useState<number>(0)
  const [selectedRowId, setSelectedRowId] = useState<number>(0)

  const [rejectedReason, setRejectedReason] = useState('')

  const [isFileModal, setFileModal] = useState(false)
  const [isFileRecord, setIsFileRecord] = useState<FileRecordType>({ FileName: '', PageCount: '', BillNumber: '' })
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)

  // const [approvalSelectionOption, setApprovalSelectionOption] = useState<OptionType[]>([])
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [historyHoveredRow, setHistoryHoveredRow] = useState<any>({})

  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [selectedHistoryBillId, setSelectedHistoryBillId] = useState<number | null>(null)

  const [isOpenMoveTo, setOpenMoveTo] = useState<boolean>(false)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [bankAccountOption, setBankAccountOption] = useState([])

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  let nextPageIndex: number = 1
  const lazyRows: number = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const commonParams = {
    Vendor: paymentApprovalFilterFields?.VendorIds.map(item => parseInt(item)) ?? [],
    Status: paymentApprovalFilterFields?.ApprovalStatusIds.map(item => parseInt(item)) ?? [],
    PaymentMethod: paymentApprovalFilterFields?.PaymentMethodIds.map(item => parseInt(item)) ?? [],
    BankAccount: paymentApprovalFilterFields?.BankAccountIds.map(item => parseInt(item)) ?? [],
    MaxAmount: Number(paymentApprovalFilterFields?.MaxAmount) != 0 ? Number(paymentApprovalFilterFields?.MaxAmount) : null,
    MinAmount: Number(paymentApprovalFilterFields?.MinAmount) != 0 ? Number(paymentApprovalFilterFields?.MinAmount) : null,
    SortColumn: orderColumnName,
    SortOrder: orderBy,
  }

  const columns: any = [
    {
      header: paymentApprovalList.length !== 0 && (
        <CheckBox
          id='select-all'
          intermediate={isIntermediate.isEnable}
          checked={isIntermediate.isChecked}
          onChange={(e) => handleSelectAll(e)}
          disabled={paymentApprovalList.length === 0}
        />
      ),
      accessor: 'check',
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: 'right',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('VendorName')}>
        VENDOR NAME <SortIcon order={sortOrders['VendorName']}></SortIcon>
      </div>,
      accessor: 'VendorName',
      sortable: false,
      colStyle: '!w-[150px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('ApprovalStatus')}>
        APPROVAL STATUS <SortIcon order={sortOrders['ApprovalStatus']}></SortIcon>
      </div>,
      accessor: 'ApprovalStatus',
      sortable: false,
      colStyle: '!w-[170px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('BankAccount')}>
        BANK ACCOUNT <SortIcon order={sortOrders['BankAccount']}></SortIcon>
      </div>,
      accessor: 'BankAccount',
      sortable: false,
      colStyle: '!w-[170px] !tracking-[0.02em]'
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PaymentMethodName')}>
        PAYMENT METHOD <SortIcon order={sortOrders['PaymentMethodName']}></SortIcon>
      </div>,
      accessor: 'PaymentMethodName',
      sortable: false,
      colStyle: '!w-[190px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('TotalAmount')}>
        TOTAL PAYMENT AMOUNT <SortIcon order={sortOrders['TotalAmount']}></SortIcon>
      </div>,
      accessor: 'TotalAmount',
      sortable: false,
      colStyle: '!w-[200px] !tracking-[0.02em]',
      colalign: 'right',
    },
    {
      header: '',
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[320px]',
      colalign: "right"
    }
  ]

  // Nested Data Columns
  const nestedColumns: any = [
    {
      header: 'BILL NUMBER',
      accessor: 'BillNumber',
      colStyle: '!pl-[106px] !tracking-[0.02em] !w-[150px]',
    },
    {
      header: 'PAYMENT STATUS',
      accessor: 'PaymentStautsName',
      colStyle: '!tracking-[0.02em] !w-[80px]',
    },
    {
      header: 'DUE DATE',
      accessor: 'DueDate',
      colStyle: '!tracking-[0.02em] !w-[80px]',
    },
    {
      header: 'PAYMENT AMOUNT',
      accessor: 'PaymentAmount',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[80px]',
    },
    {
      header: '',
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[118px]',
      colalign: "right"
    }
  ]

  // Nested Data Attachment Columns
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

  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-full laptop:w-[calc(100vw-85px)]' : 'w-full laptop:w-[calc(100vw-200px)]')
  }, [isLeftSidebarCollapsed])

  // For Sorting Data
  const handleSortColumn = (name: string) => {
    const currentSortOrder = sortOrders[name]
    let newSortOrder: 'asc' | 'desc'

    if (currentSortOrder === 'asc') {
      newSortOrder = 'desc'
    } else {
      newSortOrder = 'asc'
    }

    setSortOrders({ ...sortOrders, [name]: newSortOrder })
    setOrderColumnName(name)
    switch (name) {
      case 'VendorName':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'ApprovalStatus':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'BankAccount':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'PaymentMethodName':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'TotalAmount':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      default:
        break
    }
  }

  // function for select All row (Checkboxes)
  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      // const newSelecteds = approvalListData.filter((row: any) => row.Status === true).map((row: any) => row.Id)
      const newSelecteds = paymentApprovalList.filter((row: any) => row.ApprovalStatus === 0 && !row.IsPostByUser).map((row: any) => row.PaymentId)
      setSelectedRows(newSelecteds)
      setIsAllChecked(true)
      return
    }
    setSelectedRows([])
    setIsAllChecked(false)
  }

  useEffect(() => {
    if (selectedRows?.length > 0 && paymentApprovalList.length === selectedRows.length) {
      setIsIntermediate({
        isEnable: false,
        isChecked: true,
      })
    } else if (selectedRows?.length > 1) {
      setIsIntermediate({
        isEnable: true,
        isChecked: true,
      })
    } else {
      setIsIntermediate({
        isEnable: false,
        isChecked: false,
      })
    }
  }, [selectedRows])

  //Approver Dropdown List API
  const getApproverDropdown = () => {
    performApiAction(dispatch, getBankAccountDrpdwnList, null, (responseData: any) => {
      setBankAccountOption(responseData)
    })
  }

  const getPaymentMethodDropdownList = () => {
    performApiAction(dispatch, getPaymentMethods, null, (responseData: any) => {
      setPaymentMethodOption(responseData)
    })
  }

  // Reassign Assignee dropdown
  const handleAssignDropDown = () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, companyAssignUser, params, (responseData: any) => {
      let filteredResponseData = responseData.filter((data: any) => data.value !== userId)
      setAssignee(filteredResponseData.length > 0 ? filteredResponseData : responseData)
    })
  }

  useEffect(() => {
    getPaymentMethodDropdownList()
    handleAssignDropDown()
  }, [])

  //Vendor Dropdown List API
  const getVendorDropdown = () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ label: item.label, value: String(item.value) }))
      setVendorOption(mappedList)
    })
  }

  // Payment Approval List API
  const getPaymentsApprovalList = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setPaymentApprovalList([])
      setItemsLoaded(0)
      setIsLoading(true)
    }
    try {
      setIsLazyLoading(true)
      const params = {
        ...commonParams,
        PageSize: lazyRows,
        PageNumber: pageIndex || nextPageIndex,
        IsDownload: false,
        ExportType: null,
      }
      const { payload, meta } = await dispatch(getPaymentApprovalList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setPaymentApprovalList(payload?.ResponseData?.List)
          const responseData = payload?.ResponseData
          const newList = responseData?.List || []
          const newTotalCount = responseData?.TotalCount || 0
          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLazyLoading(false)
            setIsLoading(false)
            setShouldLoadMore(true)
          } else {
            updatedData = [...paymentApprovalList, ...newList]
          }

          setPaymentApprovalList(updatedData)
          setItemsLoaded(updatedData.length)
          setIsLazyLoading(false)
          setIsLoading(false)

          if (itemsLoaded >= newTotalCount) {
            setShouldLoadMore(false);
          }
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLazyLoading(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getPaymentsApprovalList(1)
  }, [refreshTable, paymentApprovalFilterFields, CompanyId, orderBy])

  useEffect(() => {
    if (CompanyId) {
      getVendorDropdown()
    }
  }, [CompanyId, refreshTable])

  useEffect(() => {
    if (CompanyId) {
      getApproverDropdown()
    }
  }, [CompanyId])

  // For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getPaymentsApprovalList()
        }
      },
      { threshold: 0 }
    )

    if (tableBottomRef.current) {
      observer.observe(tableBottomRef.current)
      nextPageIndex = Math.ceil(itemsLoaded / lazyRows) + 1
    }

    return () => {
      observer.disconnect()
    }
  }, [shouldLoadMore, itemsLoaded, tableBottomRef])

  const handleFilterOpen = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  // function for row select (CheckBox)
  const handleRowSelect = (id: any) => {
    const selectedIndex = selectedRows.indexOf(id)
    let newSelected: any = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1))
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1))
    }

    setSelectedRows(newSelected)
    setIsAllChecked(newSelected.length >= 2)
  }

  // view mode row click
  const handleView = (id: any) => {
    router.push(`/approvals/view/${id}`)
  }

  const handleOpenAttachFile = (Id: any) => {
    setIsFilterOpen(false)
    setOpenMoveTo(false)
    setOpenAttachFile(!isOpenAttchFile)
    setSelectedRowId(Id)
  }

  const handleFileOpen = (filePath: any, fileName: string) => {
    showPDFViewerModal(filePath, fileName)
    setFileModal(!isFileModal)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenAttachFile(false)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  //DataTable Data
  const approvalListData = paymentApprovalList && paymentApprovalList?.map((d: any) =>
    new Object({
      ...d,
      check: (
        <CheckBox
          id={`BTP-${d.PaymentId}`}
          className={`${d?.ApprovalStatus === 0 ? '' : 'opacity-50 pointer-events-none cursor-default'}`}
          checked={isRowSelected(d.PaymentId)}
          onChange={() => handleRowSelect(d.PaymentId)}
          disabled={d.ApprovalStatus === 1 || d.ApprovalStatus === 2 || d.IsPostByUser ? true : false}
        />
      ),
      VendorName: d?.VendorName && d?.VendorName.length > 22
        ? <BasicTooltip position='right' content={d?.VendorName} className='!m-0 !p-0 !z-[4]'>
          <label
            className="cursor-pointer text-sm w-full"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
            {d?.VendorName}
          </label>
        </BasicTooltip>
        : <label className="font-proxima text-sm">{d?.VendorName}</label>,
      ApprovalStatus: (
        <Typography className='!text-[14px] text-[#333] !flex items-center'>
          {d.ApprovalStatusName}
          {d.ApprovalStatus === 2 && (
            <span className='mt-2'>
              <BasicTooltip
                position='left'
                content={<><strong>{reasonValue}</strong> <br /> {rejectedReason}</>}
                className='!z-9'>
                <InfoIcon />
              </BasicTooltip>
            </span>
          )}
        </Typography>
      ),
      BankAccount: <Typography className='font-proxima text-sm !tracking-[0.02em] break-words'>{d?.BankAccount}</Typography>,
      TotalAmount: <Typography className='pr-3.5 font-proxima text-sm !font-bold !tracking-[0.02em] text-[#333333]'>${formatCurrency(d?.TotalAmount)}</Typography>,
      action: hoveredRow === d.PaymentId && (
        <div className='overflow-hidden h-full w-full'>
          <div className='slideLeft relative flex h-full justify-end'>
            {(d.ApprovalStatus === 0 && !d.IsPostByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Approve' className='!z-9'>
                  <div
                    onClick={() => {
                      setSelectedRows([d?.PaymentId])
                      setRowPaymentId(d.PaymentId)
                      setIsApprovalModalOpen(true)
                      setPaymentVendorName(d?.VendorName)
                      setPaymentAmount(d?.TotalAmount)
                    }}>
                    <AcceptIcon />
                  </div>
                </BasicTooltip>
              </div>
            )}
            {(d.ApprovalStatus === 0 && !d.IsPostByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Reject' className='!z-9'>
                  <div
                    onClick={() => {
                      setSelectedRows([d?.PaymentId])
                      setRowPaymentId(d.PaymentId)
                      setIsRejectModalOpen(true)
                      setPaymentVendorName(d?.VendorName)
                      setPaymentAmount(d?.TotalAmount)
                    }}
                  >
                    <RejectIcon />
                  </div>
                </BasicTooltip>
              </div>
            )}
            {(d.ApprovalStatus === 0 && !d.IsPostByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Re-assign' className='!z-9'>
                  <div
                    onClick={() => {
                      setIsReassignModalOpen(true)
                      setSelectedRows([d?.PaymentId])
                      setRowPaymentId(d.PaymentId)
                      setPaymentVendorName(d?.VendorName)
                      setPaymentAmount(d?.TotalAmount)
                    }}
                  >
                    <ReassignIcon />
                  </div>
                </BasicTooltip>
              </div>
            )}
            {(d.ApprovalStatus === 0 && d.IsPostByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Send Reminder' className='!z-9'>
                  <div>
                    <SendReminder />
                  </div>
                </BasicTooltip>
              </div>
            )}
          </div>
        </div>
      ),
      details: (
        <div className={`custom-scroll stickyTable w-full bg-white overflow-visible `}>
          <DataTable
            columns={nestedColumns}
            isTableLayoutFixed={true}
            data={
              d.BillDetail?.length > 0 ?
                d.BillDetail.map(
                  (nestedData: any) =>
                    new Object({
                      ...nestedData,
                      BillNumber:
                        <div className='flex w-full justify-between'>
                          <label className='!ml-[98px] w-full break-all font-medium cursor-pointer font-proxima !text-[14px] !tracking-[0.02em] text-[#333333]' onClick={() => handleView(nestedData.AccountPayableId)} >{nestedData.BillNumber}</label>
                          <div className='relative mr-4'>
                            {nestedData.Attachments?.length > 0 && (
                              <div className='overflow-y-auto'>
                                <div className='flex cursor-pointer justify-end' onClick={() => handleOpenAttachFile(nestedData.AccountPayableId)}>
                                  <div className='absolute left-1 -top-2.5'>
                                    <Badge badgetype='error' variant='dot' text={nestedData.Attachments.length.toString()} />
                                  </div>
                                  <AttachIcon />
                                </div>

                                {isOpenAttchFile && nestedData.AccountPayableId == selectedRowId && (
                                  <div
                                    ref={dropdownRef}
                                    className='absolute !z-[4] flex w-[443px] max-h-64 flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md'>
                                    <div className='overflow-y-auto'>
                                      <DataTable
                                        columns={attachfileheaders}
                                        data={nestedData.Attachments.map(
                                          (fileData: any) =>
                                            new Object({
                                              ...fileData,
                                              FileName: (
                                                <div className='flex cursor-pointer items-center gap-1'
                                                  onClick={() => {
                                                    handleFileOpen(fileData.FilePath, fileData.FileName)
                                                    setIsFileRecord({ FileName: fileData.FileName, PageCount: fileData.PageCount, BillNumber: nestedData.BillNumber })
                                                    setOpenAttachFile(false)
                                                  }}>
                                                  <GetFileIcon FileName={fileData.FileName} />
                                                  <span className='w-52 truncate' title={fileData.FileName}>
                                                    {fileData.FileName} &nbsp;
                                                  </span>
                                                </div>
                                              ),
                                              Size: <Typography className='!text-[14px] text-[#333]'>{formatFileSize(fileData.Size)}</Typography>,
                                            })
                                        )}
                                        sticky
                                        hoverEffect
                                        getExpandableData={() => { }}
                                        getRowId={() => { }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>,
                      DueDate: (
                        <div className='flex items-center gap-4 font-medium'>
                          <span className='font-proxima !text-sm !tracking-[0.02em]'>{formatDate(nestedData.DueDate)}</span>
                        </div>
                      ),
                      PaymentStautsName: <label className='font-medium !tracking-[0.02em]'>{nestedData.PaymentStautsName}</label>,
                      PaymentAmount: (
                        <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
                          ${formatCurrency(nestedData.PaymentAmount)}
                        </label>
                      ),
                      action:
                        historyHoveredRow === nestedData.AccountPayableId && (
                          <div className='slideLeft relative flex h-full justify-end'>
                            <div className='flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                              <BasicTooltip position='left' content='History' className='!z-[2] !cursor-pointer'>
                                <span
                                  onClick={() => {
                                    setSelectedHistoryBillId(nestedData.AccountPayableId)
                                    setOpenDrawer(true)
                                  }}>
                                  <HistoryIcon />
                                </span>
                              </BasicTooltip>
                            </div>
                          </div>
                        )
                    })
                ) : []
            }
            hoverEffect
            getExpandableData={() => { }}
            getRowId={(value: any) => {
              setHistoryHoveredRow(value?.AccountPayableId)
            }}
          />
          {d.BillDetail?.length > 0 ? "" : <div className='pl-[106px] flex h-[59px] !text-sm !tracking-[0.02em] items-center border-b border-b-[#ccc]'>There is no data available at the moment.</div>}
          <div className={`mt-[-2px] flex h-1 items-center  border-t border-darkCharcoal`}></div>
        </div>
      ),
    })
  )

  const TotalAmount = useMemo(() => {
    return paymentApprovalList
      ?.filter((row: any) => selectedRows.includes(row.PaymentId))
      .reduce((total: any, row: any) => total + row.TotalAmount, 0);
  }, [paymentApprovalList, selectedRows]);

  const setPaymentApproval = (status: number) => {
    let reasonLengthError = false
    if (reason.trim().length <= 0 || reason.trim().length > 150) {
      reasonLengthError = true
    }
    setReasonError(reasonLengthError)

    let reasonDropdownError = false
    if (reasonSelect.length <= 0) {
      reasonDropdownError = true
    }
    setReasonDropdownError(reasonDropdownError)

    let remark = null
    let reasonType = null

    if (status === 2) {
      remark = reason
      reasonType = reasonSelect
    }

    if ((status === 2 && !(reason.trim().length <= 0 || !reasonHasError)) || status === 1) {
      setIsLoading(true)
      const approvalDetailList = paymentApprovalList
        .filter((row: any) => selectedRows.includes(row.PaymentId))
        .map((row: any) => ({
          PaymentId: row.PaymentId,
          AccountPayableId: row.BillDetail ? row.BillDetail.map((bill: any) => bill.AccountPayableId) : [],
          BatchId: row.BatchId
        }));

      const params = {
        ApprovalDetailList: approvalDetailList,
        StatusId: status,
        ReasonType: reasonType,
        Remark: remark,
      };

      performApiAction(dispatch, paymentsApproval, params, () => {
        setRefreshTable(!refreshTable)
        modalClose()
        setSelectedRows([])
        setIsAllChecked(false)
        const action = status == 1 ? 'approved' : 'rejected'
        const message =
          selectedRows.length > 1
            ? `Payment requests for ${selectedRows.length} vendors have been ${action} successfully!`
            : `Payment request of $${formatCurrency(paymentAmount)} for ${paymentVendorName} has been ${action} successfully!`
        Toast.success(message)
      }, () => {
        setIsLoading(false)
      })
    }
  }

  // Re-Assign handle Submit
  const setPaymentReAssign = () => {
    selectedAssignee <= 0 && setReAssigneeDropError(true)
      ; (reAssignReason.trim().length === 0 || reAssignReason.trim().length > 150) && setReAssignReasonError(true)
    if (selectedAssignee > 0 && reAssignReason.trim().length > 0 && reAssignReasonHasError) {
      setIsLoading(true)
      const approvalDetailList = paymentApprovalList
        .filter((row: any) => selectedRows.includes(row.PaymentId))
        .map((row: any) => ({
          BatchId: row.BatchId,
          AccountPayableId: row.BillDetail ? row.BillDetail.map((bill: any) => bill.AccountPayableId) : []
        }));
      const params = {
        ApprovalDetailList: approvalDetailList,
        AssigneeId: Number(selectedAssignee),
        Remark: reAssignReason,
      }

      performApiAction(dispatch, paymentReAssign, params, () => {
        Toast.success(`Payment request of $${formatCurrency(paymentAmount)} for ${paymentVendorName} has been re-assigned successfully!`)
        setRefreshTable(!refreshTable)
        modalClose()
        setSelectedRows([])
        setIsAllChecked(false)
        setPaymentAmount('')
        setPaymentVendorName('')
      }, () => {
        setIsLoading(false)
      })
    }
  }

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
  }

  const modalClose = () => {
    // Reject
    setReassonValue('')
    setReasonSelect('')
    setReasonDropdownError(false)
    setReason('')
    setReasonError(false)
    setReasonHasError(false)

    // Reassign
    setReAssignReason('')
    setSelectedAssignee(0)
    setReAssignReasonError(false)
    setReAssigneeDropError(false)
    setIsReassignModalOpen(false)
    setReAssignReasonHasError(false)

    setIsRejectModalOpen(false)
    setIsApprovalModalOpen(false)
    setIsApprovalModalLoader(false)
  }

  return (
    <Wrapper>
      {/* Navbar */}
      <div className='sticky top-0 z-[6] flex h-[66px] w-full items-center justify-between bg-whiteSmoke px-5'>
        <div>
          <SelectApprovalDropdown />
        </div>
        <div className='flex w-full items-center justify-end'>
          {selectedRows.length > 0
            ? <div className="flex gap-10 justify-end items-center">
              <div className='text-sm tracking-[0.02em] font-proxima'>
                <label className="pe-2 font-bold text-darkCharcoal">Total Selected :</label> {selectedRows.length} Bills
              </div>
              <div className='text-sm tracking-[0.02em] font-proxima'>
                <label className="pe-2 font-bold text-darkCharcoal">Total Pay :</label> ${TotalAmount}
              </div>
              <div className='flex items-center h-full laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
                <BasicTooltip position='bottom' content='Approve' className='!z-9 !px-0 !py-1'>
                  <div onClick={() => { setIsApprovalModalOpen(true) }}>
                    <AcceptIcon />
                  </div>
                </BasicTooltip>
                <BasicTooltip position='bottom' content='Reject' className='!z-9 !px-0 !py-1'>
                  <div onClick={() => { setIsRejectModalOpen(true) }}>
                    <RejectIcon />
                  </div>
                </BasicTooltip>
              </div>
            </div>
            : <div className='w-full flex justify-end items-center laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
              <div className='flex justify-center items-center mt-1' onClick={() => setIsFilterOpen(true)}>
                <BasicTooltip position='bottom' content='Filter' className='!px-0 !pb-2.5 !font-proxima !text-sm'>
                  <FilterIcon />
                </BasicTooltip>
              </div>
              <div className='flex justify-center items-center mt-0.5'>
                <Download url={`${process.env.API_BILLSTOPAY}/paymentapproval/getlist`} params={commonParams} fileName='Payment_approval' />
              </div>
            </div>}
        </div>
      </div>

      {/* DataTable */}
      <div className={`h-[calc(100vh-145px)] custom-scroll approvalMain overflow-auto approvalMain max-[425px]:mx-1 ${tableDynamicWidth}`}>
        <div className={`expandableTable ${paymentApprovalList.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            zIndex={5}
            columns={columns}
            data={approvalListData ?? []}
            hoverEffect
            sticky
            isExpanded
            expandOneOnly={false}
            lazyLoadRows={lazyRows}
            isTableLayoutFixed={true}
            expandable
            getExpandableData={(data: any) => {
              setSelectedRowId(data.PaymentId)
            }}
            getRowId={(value: any) => {
              if (!isOpenMoveTo) {
                setHoveredRow(value?.PaymentId)
                setRejectedReason(value?.Remark)
                setReassonValue(value?.ReasonType)
              }
            }}
          />
          {isLazyLoading && !isLoading && (
            <Loader size='sm' helperText />
          )}
          <div ref={tableBottomRef} />
        </div>
        {paymentApprovalList.length === 0 ? (
          isLoading ?
            <div className='flex h-[calc(94vh-150px)] w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div>
            : <div className='flex h-[59px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
        ) : ''}
      </div>

      {/* For Filter Menu */}
      <Filter
        vendorOption={vendorOption}
        bankAccountOption={bankAccountOption}
        paymentMethodOption={paymentMethodOption}
        isFilterOpen={isFilterOpen}
        onClose={() => handleFilterOpen()}
      />

      {/* Acticity Drawer */}
      <ActivityDrawer
        noCommentBox={true}
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        selectedPayableId={selectedHistoryBillId}
      />
      <DrawerOverlay isOpen={openDrawer} />

      {/* Payment Approved Modal */}
      <ConfirmationModal
        title='Approve'
        content={selectedRows.length > 1
          ? `Are you sure you want to approve the selected payment request?`
          : `Are you sure you want to approve this payment request?`}
        isModalOpen={isApprovalModalOpen}
        modalClose={modalClose}
        handleSubmit={() => setPaymentApproval(1)}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {/* Payment Reject modal */}
      <ApprovalModal
        onOpen={isRejectModalOpen}
        onClose={modalClose}
        approvalModalLoader={isApprovalModalLoader}
        handleSubmit={() => setPaymentApproval(2)}
        modalTitle='Reject'
        modalContent={
          <>
            <div className='mb-3'>
              <Select
                label='Reason Type'
                id='Add Reason'
                options={ReasonOption || []}
                defaultValue={reasonSelect}
                getValue={(value: string) => {
                  setReasonSelect(value)
                }}
                getError={(e) => { }}
                hasError={reasonDropdownError}
                validate
              />
            </div>
            <Textarea
              maxChar={150}
              id='rejected'
              label='Detail'
              validate
              getValue={(value) => setReason(value)}
              getError={(e) => {
                setReasonHasError(e)
              }}
              hasError={reasonError}
              rows={5}
              placeholder='Please enter the reason for rejecting this payment request.'
            ></Textarea>
          </>
        }
      />

      {/* Re-assign modal */}
      <ApprovalModal
        onOpen={isReassignModalOpen}
        onClose={modalClose}
        approvalModalLoader={isApprovalModalLoader}
        handleSubmit={setPaymentReAssign}
        modalTitle='Re-assign'
        modalContent={
          <>
            <Select
              id={'assignee'}
              label='Select Assignee'
              options={assignee}
              defaultValue={selectedAssignee}
              value={selectedAssignee}
              getValue={(value) => {
                setReAssigneeDropError(false)
                setSelectedAssignee(value)
              }}
              getError={(e) => { }}
              hasError={reAssigneeDropError}
              validate
            />
            <div className='pt-5'>
              <Textarea
                maxChar={150}
                id='Reassign_reason'
                label='Add Reason'
                validate
                getValue={(value) => setReAssignReason(value)}
                getError={(e) => {
                  setReAssignReasonHasError(e)
                }}
                hasError={reAssignReasonError}
                rows={5}
                placeholder='Enter the Re-assign Reason'
              ></Textarea>
            </div>
          </>
        }
      />

      {/* Rejected Reason */}
      {/* <ApprovalModal
        onOpen={isRejectedReasonModalOpen}
        onClose={() => setIsRejectedReasonModalOpen(false)}
        modalTitle='Rejected Reason'
        handleSubmit={() => setIsRejectedReasonModalOpen(false)}
        actionName='OK'
        modalContent={<p>{rejectedReason}</p>}
        cancelNoRequired
      /> */}

      {
        isFileModal &&
        isFileRecord.FileName &&
        typeof isFileRecord.FileName === 'string' &&
        ['pdf'].includes(isFileRecord.FileName.split('.').pop()?.toLowerCase() ?? '') && (
          <FileModal
            isFileRecord={isFileRecord}
            setIsFileRecord={setIsFileRecord}
            PDFUrl={PDFUrl}
            isOpenDrawer={isOpenDrawer}
            setPDFUrl={(value: any) => setPDFUrl(value)}
            setIsOpenDrawer={(value: boolean) => setIsOpenDrawer(value)}
            setFileModal={(value: boolean) => setFileModal(value)}
            fileBlob={fileBlob}
            isPdfLoading={isPdfLoading}
            isFileNameVisible={true}
            openInNewWindow={openInNewWindow}
          />
        )
      }
    </Wrapper >
  )
}

export default PaymentApproval