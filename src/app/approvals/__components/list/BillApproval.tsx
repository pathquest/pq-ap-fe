'use client'

import ApprovalModal from '@/app/approvals/__components/ApprovalModal'
import FileModal from '@/app/bills/__components/FileModal'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import AcceptIcon from '@/assets/Icons/AcceptIcon'
import HistoryIcon from '@/assets/Icons/HistoryIcon'
import ReassignIcon from '@/assets/Icons/ReassignIcon'
import RejectIcon from '@/assets/Icons/RejectIcon'
import SendReminder from '@/assets/Icons/SendReminder'
import SortIcon from '@/assets/Icons/SortIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import InfoIcon from '@/assets/Icons/infoIcon'
import Download from '@/components/Common/Custom/Download'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate, utcFormatDate } from '@/components/Common/Functions/FormatDate'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import usePdfViewer from '@/components/Common/pdfviewer/pdfViewer'
import { FileRecordType } from '@/models/billPosting'
import { Option } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { billReAssign, billsApproval, getBillApprovalList } from '@/store/features/billApproval/approvalSlice'
import { vendorDropdown } from '@/store/features/bills/billSlice'
import { getBankAccountDrpdwnList } from '@/store/features/billsToPay/billsToPaySlice'
import { companyAssignUser } from '@/store/features/company/companySlice'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge, BasicTooltip, CheckBox, DataTable, Loader, Select, Textarea, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Filter from '../Filter/BillsFilter'
import SelectApprovalDropdown from '../SelectApprovalDropdown'

const BillApproval: React.FC = () => {
  const router = useRouter()
  const userId = useMemo(() => localStorage.getItem('UserId'), [])
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const { billApprovalFilterFields } = useAppSelector((state) => state.billApproval)
  const { showPDFViewerModal, PDFUrl, setPDFUrl, fileBlob, isPdfLoading } = usePdfViewer()
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  const dispatch = useAppDispatch()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-180px)]')
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false)

  const [vendorOption, setVendorOption] = useState<any>([])
  const [isIntermediate, setIsIntermediate] = useState<any>({
    isEnable: false,
    isChecked: false,
  })
  const [selectedRows, setSelectedRows] = useState<any>([])
  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1

  const [orderBy, setOrderBy] = useState<number | null>(1)
  const [orderColumnName, setOrderColumnName] = useState<string | null>('BillDate')
  const [hoveredColumn, setHoveredColumn] = useState<string>("");

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [billApprovalList, setBillApprovalList] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
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
  const [rowBillNumber, setRowBillNumber] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<number>(0)

  const [rejectedReason, setRejectedReason] = useState('')

  const [isFileModal, setFileModal] = useState(false)
  const [isFileRecord, setIsFileRecord] = useState<FileRecordType>({ FileName: '', PageCount: '', BillNumber: '' })
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)

  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [selectedHistoryBillId, setSelectedHistoryBillId] = useState<number | null>(null)

  const [isOpenMoveTo, setOpenMoveTo] = useState<boolean>(false)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [bankAccountOption, setBankAccountOption] = useState([])
  const [locationOption, setLocationOption] = useState<Option[]>([])

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  let nextPageIndex: number = 1
  const lazyRows: number = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const commonParams = {
    CompanyId: CompanyId,
    StatusId: billApprovalFilterFields?.ApprovalStatusIds.map(item => parseInt(item)) ?? [],
    BillNumber: billApprovalFilterFields?.BillNumber != "" ? billApprovalFilterFields?.BillNumber : null,
    Vendor: billApprovalFilterFields?.VendorIds.map(item => parseInt(item)) ?? [],
    MaxAmount: Number(billApprovalFilterFields?.MaxAmount) != 0 ? Number(billApprovalFilterFields?.MaxAmount) : null,
    MinAmount: Number(billApprovalFilterFields?.MinAmount) != 0 ? Number(billApprovalFilterFields?.MinAmount) : null,
    BillStartDate: utcFormatDate(billApprovalFilterFields?.BillStartDate),
    BillEndDate: utcFormatDate(billApprovalFilterFields?.BillEndDate),
    StartDueDate: utcFormatDate(billApprovalFilterFields?.StartDueDate),
    EndDueDate: utcFormatDate(billApprovalFilterFields?.EndDueDate),
    SortColumn: orderColumnName,
    SortOrder: orderBy,
    Location: billApprovalFilterFields?.LocationIds ? billApprovalFilterFields?.LocationIds.map(Number) : [],
    AssignedBy: Number(billApprovalFilterFields?.Assignee) != 0 ? Number(billApprovalFilterFields?.Assignee) : 1
  }

  const columns: any = [
    {
      header: (billApprovalFilterFields?.Assignee != "2" && billApprovalList.length !== 0) && (
        <CheckBox
          id='select-all'
          intermediate={isIntermediate.isEnable}
          checked={isIntermediate.isChecked}
          onChange={(e) => handleSelectAll(e)}
          disabled={billApprovalList.length === 0}
        />
      ),
      accessor: billApprovalFilterFields?.Assignee == "2" ? "" : 'check',
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: 'right',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('BillNumber')} onMouseEnter={() => setHoveredColumn("BillNumber")} onMouseLeave={() => setHoveredColumn("")}>
        Bill Number <SortIcon orderColumn="BillNumber" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "BillNumber"}></SortIcon>
      </div>,
      accessor: 'BillNumber',
      sortable: false,
      colStyle: '!w-[150px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('BillDate')} onMouseEnter={() => setHoveredColumn("BillDate")} onMouseLeave={() => setHoveredColumn("")}>
        Bill Date <SortIcon orderColumn="BillDate" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "BillDate"}></SortIcon>
      </div>,
      accessor: 'BillDate',
      sortable: false,
      colStyle: '!w-[170px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('VendorName')} onMouseEnter={() => setHoveredColumn("VendorName")} onMouseLeave={() => setHoveredColumn("")}>
        Vendor Name <SortIcon orderColumn="VendorName" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "VendorName"}></SortIcon>
      </div>,
      accessor: 'VendorName',
      sortable: false,
      colStyle: '!w-[170px] !tracking-[0.02em]'
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Status')} onMouseEnter={() => setHoveredColumn("Status")} onMouseLeave={() => setHoveredColumn("")}>
        Approval Status <SortIcon orderColumn="Status" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "Status"}></SortIcon>
      </div>,
      accessor: 'Status',
      sortable: false,
      colStyle: '!w-[180px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('DueDate')} onMouseEnter={() => setHoveredColumn("DueDate")} onMouseLeave={() => setHoveredColumn("")}>
        Due Date <SortIcon orderColumn="DueDate" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "DueDate"}></SortIcon>
      </div>,
      accessor: 'DueDate',
      sortable: false,
      colStyle: '!w-[100px] !tracking-[0.02em]',
      colalign: 'right',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Amount')} onMouseEnter={() => setHoveredColumn("Amount")} onMouseLeave={() => setHoveredColumn("")}>
        Payment Amount <SortIcon orderColumn="Amount" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "Amount"}></SortIcon>
      </div>,
      accessor: 'Amount',
      sortable: false,
      colStyle: '!w-[200px] !tracking-[0.02em]',
      colalign: 'right',
    },
    {
      header: '',
      accessor: billApprovalFilterFields?.Assignee == "2" ? "" : 'action',
      sortable: false,
      colStyle: '!w-[400px]',
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
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-78px)]')
    } else {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-180px)]')
    }
  }, [isLeftSidebarCollapsed])

  // For Sorting Data
  const handleSortColumn = (name: string) => {
    setOrderColumnName(name)
    setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
  }

  // function for select All row (Checkboxes)
  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      // const newSelecteds = approvalListData.filter((row: any) => row.Status === true).map((row: any) => row.Id)
      const newSelecteds = billApprovalList.filter((row: any) => row.Status === 0 && !row.IsPostedByUser).map((row: any) => row.AccountPayableId)
      setSelectedRows(newSelecteds)
      setIsAllChecked(true)
      return
    }
    setSelectedRows([])
    setIsAllChecked(false)
  }

  useEffect(() => {
    if (selectedRows?.length > 0 && billApprovalList.length === selectedRows.length) {
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

  const getLocationDropdown = () => {
    const params = {
      CompanyId: CompanyId,
      IsActive: true,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      setLocationOption(responseData)
    })
  }

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

  // Vendor List API
  const getApprovalList = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setBillApprovalList([])
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
      const { payload, meta } = await dispatch(getBillApprovalList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setBillApprovalList(payload?.ResponseData?.BillApprovalList)
          const responseData = payload?.ResponseData
          const newList = responseData?.BillApprovalList || []
          const newTotalCount = responseData?.ListCount || 0
          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLazyLoading(false)
            setIsLoading(false)
            setShouldLoadMore(true)
          } else {
            updatedData = [...billApprovalList, ...newList]
          }

          setBillApprovalList(updatedData)
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
    getApprovalList(1)
  }, [refreshTable, billApprovalFilterFields, CompanyId, orderBy])

  useEffect(() => {
    if (CompanyId) {
      getVendorDropdown()
      getLocationDropdown()
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
          getApprovalList()
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

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Pending'
      case 1:
        return 'Approved'
      case 2:
        return 'Rejected'
      default:
        return 'Reassigned'
    }
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
  const approvalListData = billApprovalList && billApprovalList?.map((d: any) =>
    new Object({
      ...d,
      check: (
        <CheckBox
          id={`BTP-${d.AccountPayableId}`}
          className={`${d?.Status === 0 ? '' : 'opacity-50 pointer-events-none cursor-default'}`}
          checked={isRowSelected(d.AccountPayableId)}
          onChange={() => handleRowSelect(d.AccountPayableId)}
          disabled={d.Status === 1 || d.Status === 2 || d.IsPostedByUser ? true : false}
        />
      ),
      BillNumber:
        <div className='flex w-full justify-between'>
          <label className='break-all font-medium cursor-pointer font-proxima !text-sm !tracking-[0.02em] text-darkCharcoal ' onClick={() => handleView(d.AccountPayableId)} >{d.BillNumber}</label>
          <div className='relative mr-4 w-1/5'>
            {d.Attachments?.length > 0 && (
              <div className='overflow-y-auto'>
                <div className='flex cursor-pointer justify-end' onClick={() => handleOpenAttachFile(d.AccountPayableId)}>
                  <div className='absolute right-[-13px] -top-2.5'>
                    <Badge badgetype='error' variant='dot' text={d.Attachments.length.toString()} />
                  </div>
                  <AttachIcon />
                </div>

                {isOpenAttchFile && d.AccountPayableId == selectedRowId && (
                  <div
                    ref={dropdownRef}
                    className='absolute !z-[4] flex w-[443px] max-h-64 flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md'>
                    <div className='overflow-y-auto'>
                      <DataTable
                        columns={attachfileheaders}
                        data={d.Attachments.map(
                          (fileData: any) =>
                            new Object({
                              ...fileData,
                              FileName: (
                                <div className='flex cursor-pointer items-center gap-1'
                                  onClick={() => {
                                    handleFileOpen(fileData.FilePath, fileData.FileName)
                                    setIsFileRecord({ FileName: fileData.FileName, PageCount: fileData.PageCount, BillNumber: d.BillNumber })
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
      Status: (
        <Typography className='!text-[14px] text-[#333] !flex items-center'>
          {getStatusText(d.Status)}
          {d.Status === 2 && (
            <span>
              <BasicTooltip
                position='left'
                content={rejectedReason}
                className='!z-9'>
                <InfoIcon />
              </BasicTooltip>
            </span>
          )}
        </Typography>
      ),
      BillDate: (
        <div className='flex items-center gap-4 font-medium'>
          <span className='font-proxima !text-sm !tracking-[0.02em]'>{formatDate(d.BillDate)}</span>
        </div>
      ),
      DueDate: (
        <div className='flex items-center gap-4 font-medium'>
          <span className='font-proxima !text-sm !tracking-[0.02em]'>{formatDate(d.DueDate)}</span>
        </div>
      ),
      Amount: (
        <label className='mr-3.5 font-proxima text-sm !font-bold !tracking-[0.02em]'>
          ${formatCurrency(d.Amount)}
        </label>
      ),
      action: hoveredRow === d.AccountPayableId && (
        <div className='overflow-hidden h-full w-full'>
          <div className='slideLeft relative flex h-full justify-end'>
            {(d.Status === 0 && !d.IsPostedByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Approve' className='!z-9'>
                  <div
                    onClick={() => {
                      setSelectedRows([d?.AccountPayableId])
                      setRowBillNumber(d.BillNumber)
                      setIsApprovalModalOpen(true)
                    }}>
                    <AcceptIcon />
                  </div>
                </BasicTooltip>
              </div>
            )}
            {(d.Status === 0 && !d.IsPostedByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Reject' className='!z-9'>
                  <div
                    onClick={() => {
                      setSelectedRows([d?.AccountPayableId])
                      setRowBillNumber(d.BillNumber)
                      setIsRejectModalOpen(true)
                    }}
                  >
                    <RejectIcon />
                  </div>
                </BasicTooltip>
              </div>
            )}
            <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
              <BasicTooltip position='left' content='History' className='!z-9'>
                <div
                  onClick={() => {
                    setOpenDrawer(true)
                    setSelectedHistoryBillId(d?.AccountPayableId)
                  }}
                >
                  <HistoryIcon />
                </div>
              </BasicTooltip>
            </div>
            {(d.Status === 0 && !d.IsPostedByUser && !isAllChecked && selectedRows.length == 0) && (
              <div className='z-0 flex w-[76px] cursor-pointer items-center border-l border-[#cccccc] px-4'>
                <BasicTooltip position='left' content='Re-assign' className='!z-9'>
                  <div
                    onClick={() => {
                      setIsReassignModalOpen(true)
                      setSelectedRows([d?.AccountPayableId])
                      setRowBillNumber(d.BillNumber)
                    }}
                  >
                    <ReassignIcon />
                  </div>
                </BasicTooltip>
              </div>
            )}
            {(d.Status === 0 && d.IsPostedByUser && !isAllChecked && selectedRows.length == 0) && (
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
      )
    })
  )

  const TotalAmount = useMemo(() => {
    const sum = billApprovalList
      ?.filter((row: any) => selectedRows.includes(row.AccountPayableId))
      .reduce((total: any, row: any) => total + row.Amount, 0);

    return Number(sum.toFixed(2));
  }, [billApprovalList, selectedRows]);

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
    handleAssignDropDown()
  }, [])

  const billApproval = (status: number) => {
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

    const approvalDetailList = billApprovalList
      .filter((row: any) => selectedRows.includes(row.AccountPayableId))
      .map((row: any) => ({
        Ids: row.AccountPayableId,
        BatchId: row.BatchId
      }));

    if ((status === 2 && !(reason.trim().length <= 0 || !reasonHasError)) || status === 1) {
      setIsLoading(true)
      const params = {
        ApprovalDetailList: approvalDetailList,
        // Ids: selectedRows,
        StatusId: status,
        Remark: remark,
      }

      const singleBillNumber = billApprovalList.find((item: any) => item.AccountPayableId == selectedRows[0]).BillNumber ?? ""

      performApiAction(dispatch, billsApproval, params, () => {
        modalClose()
        setRefreshTable(!refreshTable)
        setSelectedRows([])
        setIsAllChecked(false)
        const action = status == 1 ? 'Approved!' : 'Rejected!'
        const message = selectedRows.length > 1
          ? `${selectedRows.length} Bills ${action}`
          : `Bill No.${selectedRows.length == 1 ? singleBillNumber : rowBillNumber} ${action}`
        Toast.success(message)
      }, () => {
        setIsLoading(false)
      })
    }
  }

  // Re-Assign handle Submit
  const billReassign = () => {
    selectedAssignee <= 0 && setReAssigneeDropError(true)
      ; (reAssignReason.trim().length === 0 || reAssignReason.trim().length > 150) && setReAssignReasonError(true)
    if (selectedAssignee > 0 && reAssignReason.trim().length > 0 && reAssignReasonHasError) {
      setIsLoading(true)
      const params = {
        Ids: selectedRows,
        AssigneeId: Number(selectedAssignee),
        Remark: reAssignReason,
      }
      performApiAction(dispatch, billReAssign, params, () => {
        modalClose()
        setRefreshTable(!refreshTable)
        setSelectedRows([])
        setIsAllChecked(false)
        const message = selectedRows.length > 1
          ? `${selectedRows.length} Bills Re-assigned!`
          : `Bill No.${rowBillNumber} Re-assigned!`
        Toast.success(message)
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
  }

  return (
    <Wrapper>
      {/* Navbar */}
      <div className='sticky top-0 z-[6] flex !h-[50px] w-full items-center justify-between bg-whiteSmoke px-5'>
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
                <label className="pe-2 font-bold text-darkCharcoal">Total Pay :</label> ${(TotalAmount).toFixed(2)}
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
                {/* <BasicTooltip position='bottom' content='Re-assign' className='!z-9'>
                  <div onClick={() => { setIsReassignModalOpen(true) }}>
                    <ReassignIcon />
                  </div>
                </BasicTooltip> */}
              </div>
            </div>
            : <div className='w-full flex justify-end items-center laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
              <div className='flex justify-center items-center mt-1' onClick={() => setIsFilterOpen(true)}>
                <BasicTooltip position='bottom' content='Filter' className='!px-0 !pb-2.5 !font-proxima !text-sm'>
                  <FilterIcon />
                </BasicTooltip>
              </div>
              <div className='flex justify-center items-center mt-0.5'>
                <Download url={`${process.env.API_BILLS}/billapproval/getlist`} params={commonParams} fileName='Bill_approval' />
              </div>
            </div>}
        </div>
      </div>

      {/* DataTable */}
      <div className={`h-[calc(100vh-112px)] custom-scroll approvalMain overflow-auto ${tableDynamicWidth}`}>
        <div className={`${billApprovalList.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            zIndex={5}
            columns={columns}
            data={approvalListData ?? []}
            hoverEffect
            sticky
            lazyLoadRows={lazyRows}
            isTableLayoutFixed={true}
            getExpandableData={() => { }}
            getRowId={(value: any) => {
              if (!isOpenMoveTo) {
                setHoveredRow(value?.AccountPayableId)
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
        {billApprovalList.length === 0 ? (
          isLoading ?
            <div className='flex h-[calc(94vh-150px)] w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div>
            : <div className='flex h-[44px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
        ) : ''}
      </div>

      {/* For Filter Menu */}
      <Filter
        vendorOption={vendorOption}
        locationOption={locationOption}
        bankAccountOption={bankAccountOption}
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

      {/* Bill Approved Modal */}
      <ConfirmationModal
        title='Approve'
        content={selectedRows.length > 1
          ? `Are you sure you want to approve these bills?`
          : `Are you sure you want to approve this bill?`}
        isModalOpen={isApprovalModalOpen}
        modalClose={modalClose}
        handleSubmit={() => billApproval(1)}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {/* Bill Reject modal */}
      <ApprovalModal
        onOpen={isRejectModalOpen}
        onClose={modalClose}
        handleSubmit={() => billApproval(2)}
        modalTitle='Reject'
        modalContent={
          <Textarea
            maxChar={150}
            maxLength={150}
            id='rejected'
            label='Add Reason'
            validate
            getValue={(value) => setReason(value)}
            getError={(e) => {
              setReasonHasError(e)
            }}
            hasError={reasonError}
            rows={5}
            placeholder={selectedRows.length > 1
              ? `Please enter the reason for rejecting these bills`
              : `Please enter the reason for rejecting this bill`}

          />
        }
      />

      {/* Re-assign modal */}
      <ApprovalModal
        onOpen={isReassignModalOpen}
        onClose={modalClose}
        handleSubmit={billReassign}
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
              getError={() => { }}
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

      {isFileModal &&
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
            isFileNameVisible={true}
            isPdfLoading={isPdfLoading}
            openInNewWindow={openInNewWindow}
          />
        )}
    </Wrapper>
  )
}

export default BillApproval