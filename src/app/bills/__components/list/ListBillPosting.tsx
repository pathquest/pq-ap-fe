'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AvatarSelect, Badge, CheckBox, DataTable, Loader, Select, Toast, Tooltip, Typography } from 'pq-ap-lib'

import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import CreateIcon from '@/assets/Icons/billposting/CreateIcon'
import DeleteIcon from '@/assets/Icons/billposting/DeleteIcon'
import DropdownIcon from '@/assets/Icons/billposting/DropdownIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import RestoreIcon from '@/assets/Icons/billposting/RestoreIcon'
import SyncIcon from '@/assets/Icons/billposting/SyncIcon'
import TabMoveIcon from '@/assets/Icons/billposting/TabMoveIcon'
import UploadIcon from '@/assets/Icons/billposting/UploadIcon'
import ViewIcon from '@/assets/Icons/billposting/ViewIcon'
import ViewModeIcon from '@/assets/Icons/billposting/ViewModeIcon'

import AssignUser from '@/app/bills/__components/AssignUser'
import ColumnFilterDropdown from '@/app/bills/__components/ColumnFilterDropdown'
import Create from '@/app/bills/__components/Create'
import FilterPopover from '@/app/bills/__components/FilterPopover'
import View from '@/app/bills/__components/View'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import { attachfileheaders, moveToOptions } from '@/data/billPosting'
import {
  AssignUserOption,
  BillPostingFilterFormFieldsProps,
  FileRecordType,
  IntermediateType,
  VisibilityMoveToDropDown,
} from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import {
  assignDocumentsToUser,
  deleteDocument,
  documentGetList,
  getAssigneeList,
  getColumnMappingList,
  processTypeChangeByDocumentId,
  setFilterFormFields,
  setIsFormDocuments,
  setIsVisibleSidebar,
  setSelectedProcessTypeFromList,
} from '@/store/features/bills/billSlice'
import { format, parseISO } from 'date-fns'

import FileModal from '@/app/bills/__components/FileModal'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import SortIcon from '@/assets/Icons/SortIcon'
import DeleteWithReason from '@/components/Modals/DeleteWithReason'
import { setSearchSelectedModule } from '@/store/features/globalSearch/globalSearchSlice'
import { convertStringsDateToUTC } from '@/utils'
import { billStatusEditable, getPDFUrl, getTimeDifference, initialBillPostingFilterFormFields } from '@/utils/billposting'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import BillDuplicationIcon from '@/assets/Icons/BillDuplicationIcon'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'

const ListBillPosting = ({ vendorOptions, locationOptions, statusOptions, processOptions }: any) => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const [isOpen, setOpen] = useState<boolean>(false)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [isVisibleTextValue, setVisibleTextValue] = useState<boolean>(false)
  const [isHandleErrorValue, setHandleErrorValue] = useState<boolean>(false)
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false)
  const [isOpenCreate, setOpenCreate] = useState<boolean>(false)
  const [isOpenView, setOpenView] = useState<boolean>(false)
  const [isOpenMoveTo, setOpenMoveTo] = useState<boolean>(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false)
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [isFileModal, setFileModal] = useState<boolean>(false)
  const [isDeleteModal, setDeleteModal] = useState<boolean>(false)
  const [isFilterApplyChange, setIsFilterApplyChange] = useState<boolean>(true)
  const [isOpenAssignUserDropDown, setIsOpenAssignUserDropDown] = useState<boolean>(false)

  const [processSelection, setProcessSelection] = useState<string>('1')
  const [assigneeValueRow, setAssigneeValueRow] = useState<string[]>([])
  const [billLists, setBillLists] = useState<any>([])
  const [deleteId, setDeleteId] = useState(-1)
  const [deleteIds, setDeleteIds] = useState([])
  const [filterRowsAssignee, setFilterRowsAssignee] = useState([])
  const [filterRowsMoveTo, setFilterRowsMoveTo] = useState([])
  const [getMapColId, setMapColId] = useState(-1)

  const [sortOrder, setSortOrder] = useState<number | null>(1)
  const [filterName, setFilterName] = useState<string | null>(null)

  const [isRestoreFields, setIsRestoreFields] = useState<any>({
    id: 0,
    isFromDocuments: false,
    Status: 0,
  })

  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownCreateRef = useRef<HTMLDivElement>(null)
  const dropdownViewRef = useRef<HTMLDivElement>(null)
  const dropdownFilterRef = useRef<HTMLDivElement>(null)
  const dropdownMoveToRef = useRef<HTMLDivElement>(null)
  const dropdownAssignUserRef = useRef<HTMLDivElement>(null)

  const [selectedRows, setSelectedRows] = useState<any>([])
  const [assignList, setAssigneList] = useState([])
  const [assignListRow, setAssigneListRow] = useState([])
  const [inProcessCount, setInProcessCount] = useState(0)

  const [headersDropdown, setHeadersDropdown] = useState<any>([])
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [selectedStates, setSelectedStates] = useState<AssignUserOption[]>([])

  const [isIntermediate, setIsIntermediate] = useState<IntermediateType>({
    isEnable: false,
    isChecked: false,
  })

  const [isFileRecord, setIsFileRecord] = useState<FileRecordType>({
    FileName: '',
    PageCount: '',
    BillNumber: '',
  })

  const [billPostingHeaders, setBillPostingHeaders] = useState<any>([])
  const [isOpenMoveToDropDown, setIsOpenMoveToDropDown] = useState<VisibilityMoveToDropDown>({
    isShow: false,
    index: null,
  })
  const [PDFUrl, setPDFUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rowId, setRowId] = useState<number>(0)

  const [columnListVisible, setColumnListVisible] = useState<any>([])

  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-200px)]')
  const [isResetFilter, setIsResetFilter] = useState<boolean>(false)
  const [editedValues, setEditedValues] = useState({
    reason: '',
  })

  const [fileBlob, setFileBlob] = useState<string | Blob>('')
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)
  const [isApplyFilter, setIsApplyFilter] = useState<boolean>(false)

  const [currentWindow, setCurrentWindow] = useState<any>(null)
  const [isNewWindowUpdate, setIsNewWindowUpdate] = useState(false)
  const [duplicateBillCount, setDuplicateBillCount] = useState<number | null>(null)

  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedProcessTypeInList, filterFormFields } = useAppSelector((state) => state.bill)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  const [localFilterFormFields, setLocalFilterFormFields] = useState<BillPostingFilterFormFieldsProps>(filterFormFields)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)

  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [apiDataCount, setApiDataCount] = useState(0)
  const [sortOrders, setSortOrders] = useState<{ [key: string]: null | 'asc' | 'desc' }>({
    BillNumber: null,
    BillDate: null,
    DueDate: null,
    Status: null,
    Amount: null,
  })

  let nextPageIndex: number = 1

  const lazyRows = 10
  const tableBottomRef = useRef<HTMLDivElement>(null)
  const userId = localStorage.getItem('UserId')

  const otherProcessColumn = [
    {
      header: (
        <div className='flex cursor-pointer items-center gap-1.5 !tracking-[0.02em]' onClick={() => handelColumn('BillNumber')}>
          Bill No. <SortIcon order={sortOrders['BillNumber']}></SortIcon>
        </div>
      ),
      accessor: 'BillNumber',
      visible: true,
      sortable: false,
      colalign: 'left',
      colStyle: 'w-[159px] !uppercase !tracking-[0.02em]',
    },
    {
      header: (
        <div className='flex cursor-pointer items-center gap-1.5 !tracking-[0.02em]' onClick={() => handelColumn('UploadedDate')}>
          Uploaded Date <SortIcon order={sortOrders['UploadedDate']}></SortIcon>
        </div>
      ),
      accessor: 'UploadedDate',
      visible: true,
      sortable: false,
      colalign: 'left',
      colStyle: 'w-[140px] !uppercase !tracking-[0.02em]',
    },
    {
      header: 'Vendor Name',
      accessor: 'VendorName',
      visible: true,
      sortable: true,
      colalign: 'left',
      colStyle: 'w-[160px] !uppercase !tracking-[0.02em]',
    },
    {
      header: (
        <div className='flex cursor-pointer items-center gap-1.5 !tracking-[0.02em]' onClick={() => handelColumn('Amount')}>
          AMOUNT <SortIcon order={sortOrders['Amount']}></SortIcon>
        </div>
      ),
      accessor: 'Amount',
      visible: true,
      sortable: false,
      colalign: 'right',
      colStyle: 'w-[100px] !uppercase',
    },
  ]

  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          fetchBillsData()
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
  }, [shouldLoadMore, itemsLoaded, tableBottomRef.current])

  useEffect(() => {
    dispatch(setSearchSelectedModule('2'))
  }, [])

  useEffect(() => {
    fetchBillsData(1)
  }, [selectedProcessTypeInList, sortOrder, CompanyId])

  useEffect(() => {
    if (isApplyFilter) {
      fetchBillsData(1)
    }
  }, [isApplyFilter])

  useEffect(() => {
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-85px)]')
    } else {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-200px)]')
    }
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    selectedProcessTypeInList && setProcessSelection(selectedProcessTypeInList.toString())
  }, [selectedProcessTypeInList])

  const showPDFViewerModal = async (filePath: any, fileName: any) => {
    if (filePath) {
      await getPDFUrl(
        filePath,
        fileName,
        setPDFUrl,
        null,
        setFileBlob,
        setIsPdfLoading,
        isNewWindowUpdate,
        currentWindow,
        openInNewWindow,
        setIsNewWindowUpdate
      )
    }
  }

  useEffect(() => {
    let headersSelection: any = []
    const isAnyCheckboxVisible = billLists.filter((row: any) => !billStatusEditable.includes(row.Status)).length

    if (selectedProcessTypeInList === '3') {
      headersSelection = [
        {
          header:
            billLists.length === isAnyCheckboxVisible ? (
              <CheckBox
                id='select-all'
                intermediate={isIntermediate.isEnable}
                checked={isIntermediate.isChecked}
                onChange={(e) => handleSelectAll(e)}
                disabled
              />
            ) : (
              <CheckBox
                id='select-all'
                intermediate={isIntermediate.isEnable}
                checked={isIntermediate.isChecked}
                onChange={(e) => handleSelectAll(e)}
              />
            ),
          accessor: 'check',
          sortable: false,
          colStyle: '!w-[50px]',
          colalign: 'center',
        },
        ...otherProcessColumn,
      ]
    } else {
      Array.from(Array(columnListVisible.length + 2)).forEach((x, i) => {
        if (i === 0) {
          headersSelection = [
            ...headersSelection,
            {
              header:
                billLists.length === isAnyCheckboxVisible ? (
                  <CheckBox
                    id='select-all'
                    intermediate={isIntermediate.isEnable}
                    checked={isIntermediate.isChecked}
                    onChange={(e) => handleSelectAll(e)}
                    disabled
                  />
                ) : (
                  <CheckBox
                    id='select-all'
                    intermediate={isIntermediate.isEnable}
                    checked={isIntermediate.isChecked}
                    onChange={(e) => handleSelectAll(e)}
                  />
                ),
              accessor: 'check',
              sortable: false,
              colStyle: '!w-[50px]',
              colalign: 'center',
            },
          ]
        } else if (i === 1) {
          if (columnListVisible[0]?.header === 'Bill No.' || columnListVisible[0]?.header === 'Adjustment Number') {
            headersSelection = [...headersSelection, columnListVisible[0]]
          } else {
            headersSelection = [...headersSelection, columnListVisible[i - 1]]
          }
        } else if (i === 2) {
          headersSelection = [
            ...headersSelection,
            {
              header: 'TAT',
              accessor: 'tat',
              sortable: false,
              colalign: 'left',
              colStyle: '!w-[80px]',
            },
          ]
        } else {
          headersSelection = [...headersSelection, columnListVisible[i - 2]]
        }
      })
    }

    setBillPostingHeaders(headersSelection)
  }, [columnListVisible, billLists])

  useEffect(() => {
    if (duplicateBillCount) {
      Toast.success('Duplicate Record Found')
    }
  }, [duplicateBillCount]);

  const fetchBillsData = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setBillLists([])
      setItemsLoaded(0)
      setIsLoading(true)
    }
    if (CompanyId) {
      const dateRangeVal = filterFormFields.ft_datepicker.split('to')
      let UserId
      switch (filterFormFields.ft_assignee) {
        case '1':
          UserId = userId
          break
        case '3':
          UserId = '0'
          break
        case '2':
          UserId = filterFormFields.ft_select_users.join(',')
          break
        default:
          UserId = null
          break
      }
      const params = {
        UserId: UserId,
        Status: filterFormFields.ft_status.join(',') ?? null,
        LocationIds:
          filterFormFields.ft_location && filterFormFields.ft_location.length > 0 ? filterFormFields.ft_location.join(',') : null,
        ProcessType: parseInt(`${selectedProcessTypeInList}`),
        VendorIds:
          filterFormFields.ft_vendor && filterFormFields.ft_vendor.length > 0 ? filterFormFields.ft_vendor.join(',') : null,
        StartDate: convertStringsDateToUTC(dateRangeVal[0].trim()) ?? null,
        EndDate: convertStringsDateToUTC(dateRangeVal[1].trim()) ?? null,
        SortColumn: filterName ?? 'CreatedOn',
        SortOrder: sortOrder,
        PageNumber: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }
      try {
        setIsLazyLoading(true)
        const { payload, meta } = await dispatch(documentGetList(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            setInProcessCount(payload?.ResponseData?.InProcessCount)

            const responseData = payload?.ResponseData
            const newList = responseData?.List || []
            const newTotalCount = responseData?.ListCount || 0
            setApiDataCount(newTotalCount)
            setDuplicateBillCount(responseData?.DocumentDuplicateCount)

            let updatedData = []
            if (pageIndex === 1) {
              updatedData = [...newList]
              setIsLoading(false)
              setIsLazyLoading(false)
              setShouldLoadMore(true)
            } else {
              updatedData = [...billLists, ...newList]
            }
            setBillLists(updatedData)
            setItemsLoaded(updatedData.length)
            setIsLazyLoading(false)

            setIsApplyFilter(false)
            setIsResetFilter(false)
            setIsLoading(false)

            if (itemsLoaded >= newTotalCount) {
              setShouldLoadMore(false);
            }
          } else {
            // responseFailure()
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
        } else {
          // responseFailure()
          Toast.error(`${payload?.status} : ${payload?.statusText}`)
        }
      } catch (error) {
        // responseFailure()
        console.error(error)
      } finally {
        setIsLoading(false)
        setIsLazyLoading(false)
      }
    }
  }

  const getMappingListData = async () => {
    const params = {
      UserId: parseInt(userId!),
      ProcessType: parseInt(selectedProcessTypeInList as string),
    }

    try {
      const { payload, meta } = await dispatch(getColumnMappingList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setMapColId(payload?.ResponseData?.Id)
          const obj = JSON.parse(payload?.ResponseData?.ColumnList)
          const data = Object.entries(obj).map(([label, value]: any) => {
            let columnStyle = ''
            let sortable = true
            switch (label) {
              case 'Bill No.':
                columnStyle = 'w-[159px]'
                sortable = false
                break
              case 'Uploaded Date':
                columnStyle = 'w-[160px]'
                sortable = false
                break
              case 'Vendor Name':
                columnStyle = 'w-[160px]'
                break
              case 'Amount':
                columnStyle = 'w-[130px]'
                sortable = false
                break
              case 'Status':
                columnStyle = 'w-[140px]'
                break
              case 'Assignee':
                columnStyle = 'w-[180px]'
                sortable = false
                break
              case 'Source':
                columnStyle = 'w-[110px]'
                break
              case 'Last Updated Date':
                columnStyle = 'w-[160px]'
                break
              case 'Last Updated By':
                columnStyle = 'w-[160px]'
                break
              default:
                break
            }

            let headerContent

            if (label.props !== undefined) {
              headerContent = <span onClick={() => handelColumn(label.props.children)}>{label.props.children}</span>
            } else if (label === 'Amount') {
              headerContent = (
                <span className='flex cursor-pointer items-center gap-1.5 !tracking-[0.02em] font-proxima' onClick={() => handelColumn('Amount')}>
                  Amount<SortIcon order={sortOrders['Amount']}></SortIcon>
                </span>
              )
            } else if (label === 'Uploaded Date') {
              headerContent = (
                <span className='flex cursor-pointer items-center gap-1.5 !tracking-[0.02em] font-proxima' onClick={() => handelColumn('CreatedOn')}>
                  Uploaded Date<SortIcon order={sortOrders['CreatedOn']}></SortIcon>
                </span>
              )
            } else if (label === 'Bill No.' || label === 'Adjustment Number') {
              headerContent = (
                <span className='flex cursor-pointer items-center gap-1.5 !tracking-[0.02em] font-proxima' onClick={() => handelColumn('BillNumber')}>
                  {label === 'Bill No.' ? 'Bill No.' : label === 'Adjustment Number' && 'Adjustment Number'}

                  <SortIcon order={sortOrders['BillNumber']}></SortIcon>
                </span>
              )
            } else {
              headerContent = label
            }

            return {
              header: headerContent,
              accessor:
                label === 'Adjustment Number' || label === 'Bill No.' ? 'BillNumber' : label === 'Status' ? 'StatusName' : label.split(' ').join(''),
              visible: value,
              sortable: label === 'Adjustment Number' ? false : sortable,
              colalign: 'left',
              colStyle: `${columnStyle} !uppercase !tracking-[0.02em] font-proxima`,
            }
          })
          const dataVisible = data.filter((h: any) => h.visible === true)

          const Arr =
            dataVisible &&
            dataVisible.map((item: any) => {
              if (item?.accessor === 'Amount') {
                return {
                  ...item,
                  colalign: 'right',
                }
              } else {
                return item
              }
            })
          setColumnListVisible(Arr)
          setHeadersDropdown(data)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAssigneData = async () => {
    if (CompanyId) {
      const params = {
        CompanyId: parseInt(`${CompanyId}`),
      }

      try {
        const { payload, meta } = await dispatch(getAssigneeList(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            const assigneeList = payload?.ResponseData.map((e: any) => {
              return { name: e.label, id: e.value }
            })

            const assigneeListRow = payload?.ResponseData.map((e: any) => {
              return { label: e.label, value: e.value }
            })

            setAssigneList(assigneeList)
            setAssigneListRow(assigneeListRow)
          } else {
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
        } else {
          Toast.error(`${payload?.status} : ${payload?.statusText}`)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    fetchAssigneData()
  }, [])

  const handelColumn = (name: string) => {

    const currentSortOrder = sortOrders[name]
    let newSortOrder: 'asc' | 'desc'

    if (currentSortOrder === 'asc') {
      newSortOrder = 'desc'
    } else {
      newSortOrder = 'asc'
    }

    setSortOrders({ ...sortOrders, [name]: newSortOrder })

    if (name === 'BillNumber' || name === 'Amount' || name === 'CreatedOn') {
      setFilterName(name)
      setSortOrder((prevValue) => (prevValue === 1 ? 0 : 1))
    }
  }

  useEffect(() => {
    getMappingListData()
  }, [processSelection, assigneeValueRow, CompanyId])

  useEffect(() => {
    if (selectedRows?.length > 0 && billLists?.length === selectedRows?.length) {
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

    const filteredAssigneeRecords =
      billLists &&
      billLists?.filter(
        (item: any) =>
          selectedRows && selectedRows?.includes(item.Id) && (item?.StatusName === 'New' || item?.StatusName === 'Drafted')
      )
    const filteredMoveToRecords =
      billLists &&
      billLists?.filter(
        (item: any) =>
          selectedRows && selectedRows?.includes(item?.Id) && (item?.StatusName === 'New' || item?.StatusName === 'Drafted')
      )
    setFilterRowsAssignee(filteredAssigneeRecords)
    setFilterRowsMoveTo(filteredMoveToRecords)
  }, [selectedRows, billLists])

  useEffect(() => {
    const newArr =
      billPostingHeaders &&
      billPostingHeaders.map((item: any) => {
        if (item?.accessor === 'check') {
          return {
            header: (
              <CheckBox
                id='select-all'
                intermediate={isIntermediate.isEnable}
                checked={isIntermediate.isChecked}
                onChange={(e) => handleSelectAll(e)}
              />
            ),
            accessor: 'check',
            sortable: false,
            colStyle: '!w-[50px]',
            colalign: 'center',
          }
        } else if (item?.accessor === 'Amount') {
          return {
            ...item,
            colalign: 'right',
          }
        } else {
          return item
        }
      })
    setBillPostingHeaders(newArr)
  }, [isIntermediate])

  useEffect(() => {
    if (
      isOpenAttchFile ||
      isOpenFilter ||
      isOpenCreate ||
      isOpenView ||
      isOpenMoveToDropDown.isShow ||
      isOpenAssignUserDropDown
    ) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenAttchFile, isOpenFilter, isOpenCreate, isOpenView, isOpenMoveToDropDown.isShow, isOpenAssignUserDropDown])

  const handleHeaderToggle = (headers: any) => {
    const newBillPostingHeaders = headers.map((item: string) => {
      const found = billPostingHeaders.some((el: any) => el.header === item)
      if (found) {
        return billPostingHeaders.find((i: any) => i.header === item)
      } else {
        const findItem = headersDropdown.find((h: any) => (h.header.props ? h?.header?.props?.children : h?.header === item))
        if (!findItem) {
          return {
            header: (
              <CheckBox
                id='select-all'
                intermediate={isIntermediate.isEnable}
                checked={isIntermediate.isChecked}
                onChange={(e) => handleSelectAll(e)}
              />
            ),
            accessor: 'check',
            sortable: false,
            colStyle: '!w-[50px]',
            colalign: 'center',
          }
        } else {
          return headersDropdown.find((h: any) => (h.header.props ? h?.header?.props?.children : h?.header === item))
        }
      }
    })

    const newHeaders = headers.filter((data: any) => typeof data == 'string' && data !== 'TAT')
    const newColumnListVisible = newHeaders
      .map((item: any) => {
        const found = columnListVisible.some((el: any) => el.header === item)
        if (found) {
          return columnListVisible.find((i: any) => i.header === item)
        } else {
          const findItem = headersDropdown.some((h: any) => (h.header.props ? h?.header?.props?.children : h?.header === item))
          if (findItem) {
            return headersDropdown.find((h: any) => (h.header.props ? h?.header?.props?.children : h?.header === item))
          } else {
            return null
          }
        }
      })
      .filter((item: any) => item !== undefined && item !== null)

    setBillPostingHeaders(newBillPostingHeaders)
    setColumnListVisible(newColumnListVisible)
  }

  const handleOpen = (arg1: boolean) => {
    setIsOpenFilter(false)
    setOpenCreate(false)
    setOpenView(false)
    setOpen(arg1)
  }

  const columns = [
    ...billPostingHeaders,
    {
      header: (
        billPostingHeaders.length > 0 && (<span className='pl-5'>
          {selectedProcessTypeInList !== '3' && (
            <ColumnFilterDropdown
              headers={headersDropdown.map((h: any) => (h?.header.props ? h?.header?.props?.children?.[0] : h?.header))}
              visibleHeaders={billPostingHeaders.map((h: any) =>
                h?.header.props ? h?.header?.props?.children?.[0] : h?.header
              )}
              isOpen={isOpen}
              getColMapId={getMapColId}
              setOpen={handleOpen}
              getMappingListData={getMappingListData}
              handleHeaderToggle={handleHeaderToggle}
              setMapColId={() => setMapColId(-1)}
            />
          )}
        </span>)
      ),
      accessor: 'actions',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[290px]',
    },
  ];

  const handleOpenAttachFile = (Id: number) => {
    setOpenView(false)
    setIsOpenFilter(false)
    setOpenMoveTo(false)
    setIsOpenAssignUserDropDown(false)
    setOpenAttachFile(!isOpenAttchFile)
    setRowId(Id)
  }

  const table_Data: Object[] =
    billLists &&
    billLists.map((d: any, i: number) => {
      const UpdatedOn = d.UpdatedOn !== null ? parseISO(d.UpdatedOn) : null
      const formattedUpdatedOn = UpdatedOn !== null && formatDate(d.UpdatedOn)

      const CreatedOn = d.CreatedOn !== null ? parseISO(d.CreatedOn) : null
      const formattedCreatedOn = CreatedOn !== null && formatDate(d.CreatedOn)
      const timeDifference = getTimeDifference(CreatedOn)
      const TATOVER = 1
      const NORMAL = 3

      const updatedByName: any = d.UpdatedBy
        ? assignListRow.find((item: any) => item.value == d.UpdatedBy)
        : assignListRow.find((item: any) => item.value == d.CreatedBy)
      const locationName: any = locationOptions && locationOptions.find((item: any) => item.value == d.LocationId)

      return {
        ...d,
        tat: (
          <div className='!z-0 flex w-full justify-between'>
            <Typography className='!text-sm text-darkCharcoal '>{timeDifference.value}&nbsp;</Typography>
            {timeDifference.TATStatus !== NORMAL && (
              <Tooltip
                position='right'
                content={`${timeDifference.TATStatus === TATOVER ? 'TAT Over' : 'TAT 25% remaining'}`}
                className='!z-9 !font-proxima !text-sm'
              >
                <span
                  className={`flex !h-[6px] !w-[6px] rounded-full ${timeDifference.TATStatus === TATOVER ? 'bg-[#FB2424]' : 'bg-[#FDB663]'
                    }`}
                ></span>
              </Tooltip>
            )}
          </div>
        ),
        BillNumber: (
          <>
            <div className='flex w-full justify-between'>
              <div
                className='w-4/5 cursor-pointer'
                onClick={() => {
                  dispatch(setIsFormDocuments(d.IsFromDocuments))
                  dispatch(setIsVisibleSidebar(false))
                  d.Id && router.push(`/bills/view/${d.Id}`)
                }}
              >
                <Typography className='pl-0 !text-sm text-darkCharcoal'>{d.BillNumber ? d.BillNumber : ''}</Typography>
              </div>

              <div className='relative mr-4 w-1/5'>
                {d.Attachments?.length > 0 && (
                  <div className=''>
                    <div className='flex cursor-pointer justify-end' onClick={() => handleOpenAttachFile(d.Id)}>
                      <div className='absolute -right-2 -top-3'>
                        <Badge badgetype='error' variant='dot' text={d.Attachments.length.toString()} />
                      </div>
                      <AttachIcon />
                    </div>

                    {isOpenAttchFile && d.Id === rowId && (
                      <div
                        ref={dropdownRef}
                        className='absolute !z-[4] flex w-[443px] flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md'
                      >
                        <DataTable
                          getExpandableData={() => { }}
                          columns={attachfileheaders}
                          data={d.Attachments.map(
                            (e: any) =>
                              new Object({
                                ...d,
                                FileName: (
                                  <div
                                    className='flex cursor-pointer items-center gap-1'
                                    onClick={() => {
                                      handleFileOpen(e.FilePath, e.FileName)
                                      setIsFileRecord({ FileName: e.FileName, PageCount: e.PageCount, BillNumber: d.BillNumber })
                                      setOpenAttachFile(false)
                                    }}
                                  >
                                    <GetFileIcon FileName={e.FileName} />
                                    <span className='w-52 truncate' title={e.FileName}>
                                      {e.FileName} &nbsp;
                                    </span>
                                  </div>
                                ),
                                Size: <Typography className='!text-sm text-darkCharcoal'>{formatFileSize(e.Size)}</Typography>,
                              })
                          )}
                          sticky
                          hoverEffect
                          getRowId={() => { }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ),
        Source: <Typography className='!text-sm text-darkCharcoal'>{d.ProviderTypeName}</Typography>,
        UploadedDate: <Typography className='!text-sm text-darkCharcoal'>{formattedCreatedOn}</Typography>,
        VendorName: <Typography className='!text-sm text-darkCharcoal'>{d.VendorName ? d.VendorName : ''}</Typography>,
        StatusName: <Typography className='!text-sm text-darkCharcoal'>{d.StatusName}</Typography>,
        Amount: (
          <Typography className='!text-sm !font-bold text-darkCharcoal'>{`${d?.Amount ? `$${parseFloat(d?.Amount).toFixed(2) ?? '0.00'}` : '$0.00'}`}</Typography>
        ),
        Assignee: (
          <>
            <AvatarSelect
              avatarSize='x-small'
              liAvatarSize='x-small'
              id={`${d.UserId}`}
              placeholder={'Assignee name'}
              className='billPostingUserAssignDrop'
              defaultValue={d?.UserId.toString()}
              value={assigneeValueRow}
              options={assignListRow}
              getValue={(value: any) => handleAssigneeRow(value, d.Id)}
              getError={() => ''}
              noborder
              search
              disabled={!billStatusEditable.includes(d.Status) ? true : false}
            />
          </>
        ),
        check: (
          <>
            <CheckBox
              className='checkboxCssChange'
              id={d.Id}
              checked={isRowSelected(d.Id)}
              onChange={() => handleRowSelect(d.Id)}
              disabled={!billStatusEditable.includes(d.Status) ? true : false}
            />
          </>
        ),
        LastUpdatedDate: (
          <Typography className='!text-sm text-darkCharcoal'>
            {formattedUpdatedOn ? formattedUpdatedOn : formattedCreatedOn}
          </Typography>
        ),
        DocumentName: <label className='!w-[170px] overflow-hidden text-ellipsis !text-sm font-proxima tracking-[0.02em] text-darkCharcoal'>{d.FileName ? d.FileName : ''}</label>,
        Pages: <Typography className='!text-sm text-darkCharcoal'>{d.PageCount ? d.PageCount : ''}</Typography>,
        LastUpdatedBy: <Typography className='!text-sm text-darkCharcoal'>{updatedByName && updatedByName?.label}</Typography>,
        Location: <Typography className='!text-sm text-darkCharcoal'>{locationName && locationName?.label}</Typography>,
        actions: hoveredRow?.Id === d.Id && (
          <div className='overflow-hidden h-full w-full'>
            <div className='slideLeft relative flex h-full justify-end'>
              <div
                className={`z-0 flex items-center border-l ${d.Status !== 3 && d.Status !== 4 && d.Status !== 7 ? 'border-r' : ''
                  } border-[#cccccc] px-4`}
              >
                <Tooltip position='left' content='View bill' className='!z-10 !font-proxima !text-sm'>
                  <div
                    className='cursor-pointer'
                    onClick={() => {
                      dispatch(setIsFormDocuments(d.IsFromDocuments))
                      dispatch(setIsVisibleSidebar(false))
                      d.Id && router.push(`/bills/view/${d.Id}`)
                    }}
                  >
                    <ViewModeIcon height={'21'} width={'23'} />
                  </div>
                </Tooltip>
              </div>

              {billStatusEditable.includes(d.Status) && (
                <div className='flex h-full cursor-pointer items-center justify-center border-r border-[#cccccc] px-4'>
                  <div
                    className='!z-0 flex items-center justify-center'
                    onClick={() =>
                      setIsOpenMoveToDropDown({
                        isShow: true,
                        index: i,
                      })
                    }
                  >
                    <Tooltip position='left' content='Move To' className='!z-10 !font-proxima !text-sm'>
                      <div className='flex items-center'>
                        <TabMoveIcon />
                        <span className='!z-0 pl-1.5'>
                          <DropdownIcon />
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              )}

              {billStatusEditable.includes(d.Status) && (
                <div
                  className='z-0 flex cursor-pointer items-center border-[#cccccc] px-4'
                  onClick={() => {
                    setDeleteId(d.Id)
                    setDeleteModal(true)
                  }}
                >
                  <Tooltip position='left' content='Delete' className='!z-10 !font-proxima !text-sm'>
                    <div>
                      <DeleteIcon />
                    </div>
                  </Tooltip>
                </div>
              )}

              {d.Status === 9 && (
                <div
                  className='z-0 flex cursor-pointer items-center border-[#cccccc] px-4'
                  onClick={() => {
                    setIsRestoreModalOpen(true)
                    setIsRestoreFields({
                      id: d.Id,
                      isFromDocuments: d.IsFromDocuments,
                      Status: d.Status,
                    })
                  }}
                >
                  <Tooltip position='left' content='Restore' className='!z-10 !font-proxima !text-sm'>
                    <RestoreIcon />
                  </Tooltip>
                </div>
              )}

              {isOpenMoveToDropDown.isShow && isOpenMoveToDropDown.index === i && (
                <div
                  ref={dropdownMoveToRef}
                  className='absolute right-20 top-6 !z-10 flex h-auto w-[210px]  flex-col rounded-md border border-[#cccccc] bg-white shadow-lg'
                >
                  <div className='flex flex-col items-start justify-start'>
                    {moveToOptions &&
                      moveToOptions
                        .filter((m) => {
                          if (d.ProcessType === 1) {
                            return m.value !== 1
                          } else if (d.ProcessType === 2) {
                            return m.value !== 2
                          } else if (d.ProcessType === 3) {
                            return m.value !== 3
                          } else {
                            return true
                          }
                        })
                        .map((item, index) => {
                          return (
                            <span
                              className='flex w-full cursor-pointer items-center justify-start px-[15px] py-[11px] !text-sm hover:bg-blue-50'
                              onClick={() => rowMoveCategory(item.value, index, d.Id)}
                              key={`${item.value}`}
                            >
                              <Typography>{item?.label}</Typography>
                            </span>
                          )
                        })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }
    })

  const rowMoveCategory = async (value: any, i: any, id: number) => {
    setIsOpenMoveToDropDown({
      isShow: false,
      index: i,
    })

    const selectedListWithDocuments = billLists
      .map((item: any) => {
        if (id === item.Id) {
          return item.Id
        }
      })
      .filter(Boolean)

    const categoryUpdatePramas = {
      IdsDataList: selectedListWithDocuments,
      CurrentProcessType: parseInt(selectedProcessTypeInList.toString()),
      ProcessType: value,
    }

    try {
      const { payload, meta } = await dispatch(processTypeChangeByDocumentId(categoryUpdatePramas))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          fetchBillsData(1)
          Toast.success('Successfully item moved!!')
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = billLists.filter((row: any) => billStatusEditable.includes(row.Status)).map((row: any) => row.Id)
      setSelectedRows(newSelecteds)
      return
    }
    setSelectedRows([])
  }

  const handleSetValue = async (value: AssignUserOption[]) => {
    setSelectedStates(value)
    setIsOpenMoveToDropDown({
      isShow: false,
      index: null,
    })

    const selectedListWithDocuments = billLists
      .map((item: any) => {
        if (selectedRows.includes(item.Id)) {
          return item.Id
        }
      })
      .filter(Boolean)

    const params = {
      IdsDataList: selectedListWithDocuments,
      UserId: parseInt(value[0].id, 10),
      ProcessType: parseInt(selectedProcessTypeInList as string),
    }
    try {
      const { payload, meta } = await dispatch(assignDocumentsToUser(params))
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setIsOpenAssignUserDropDown(false)
          fetchBillsData(1)
          setSelectedStates([])
          setSelectedRows([])
          if (billLists.length === 0) {
            setIsIntermediate({
              isEnable: false,
              isChecked: false,
            })
          }
          Toast.success(`Assignee has been changed successfully`)
        } else {
          setSelectedStates([])
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        setSelectedStates([])
        setDeleteModal(false)
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenAttachFile(false)
    }

    if (dropdownFilterRef.current && !dropdownFilterRef.current.contains(event.target as Node)) {
      setIsOpenFilter(false)
    }

    if (dropdownCreateRef.current && !dropdownCreateRef.current.contains(event.target as Node)) {
      setOpenCreate(false)
    }

    if (dropdownViewRef.current && !dropdownViewRef.current.contains(event.target as Node)) {
      setOpenView(false)
    }

    if (dropdownAssignUserRef.current && !dropdownAssignUserRef.current.contains(event.target as Node)) {
      setIsOpenAssignUserDropDown(false)
    }

    if (dropdownMoveToRef.current && !dropdownMoveToRef.current.contains(event.target as Node)) {
      setIsOpenMoveToDropDown({
        isShow: false,
        index: null,
      })
    }
  }

  const handleFileOpen = (filePath: any, fileName: string) => {
    showPDFViewerModal(filePath, fileName)
    setFileModal(!isFileModal)
  }

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
  }

  const handleFilterIconOpen = () => {
    setIsOpenFilter(!isOpenFilter)

    setLocalFilterFormFields({
      ...filterFormFields,
      ft_location: filterFormFields.ft_location === null ? locationOptions.map((option: any) => option.value) : filterFormFields.ft_location,
      ft_vendor: filterFormFields.ft_vendor === null ? vendorOptions.map((option: any) => option.value) : filterFormFields.ft_vendor,
    })

    setOpenAttachFile(false)
    setOpenView(false)
    setOpenCreate(false)
  }

  const handleCreateIconOpen = () => {
    setOpenCreate(!isOpenCreate)
    setOpenAttachFile(false)
    setOpenView(false)
    setIsOpenFilter(false)
  }

  const handleViewIconOpen = () => {
    setOpenView(!isOpenView)
    setOpenAttachFile(false)
    setOpenCreate(false)
    setIsOpenFilter(false)
  }

  const modalRestoreClose = () => {
    setIsRestoreModalOpen(false)
  }

  const handleDelete = async (removeDocId: any, deleteDocIds: any[]) => {
    if (isVisibleTextValue) {
      if (isHandleErrorValue) {
        if (removeDocId !== -1) {
          const selectedListWithDocuments = billLists
            .map((item: any) => {
              if (removeDocId === item.Id) {
                return item.Id
              }
            })
            .filter(Boolean)

          const params = {
            IdsDataList: selectedListWithDocuments,
            StatusId: 9,
            ActionReason: editedValues?.reason,
          }
          try {
            const { payload, meta } = await dispatch(deleteDocument(params))
            const dataMessage = payload?.Message

            if (meta?.requestStatus === 'fulfilled') {
              if (payload?.ResponseStatus === 'Success') {
                setVisibleTextValue(false)
                setDeleteModal(false)
                setDeleteId(0)
                setDeleteIds([])
                fetchBillsData(1)
                Toast.success('Successfully item deleted!!')
              } else {
                setDeleteModal(false)
                Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
              }
            } else {
              setDeleteModal(false)
              Toast.error(`${payload?.status} : ${payload?.statusText}`)
            }
          } catch (error) {
            console.error(error)
          }
        } else if (deleteDocIds) {
          const selectedListWithDocuments = billLists
            .map((item: any) => {
              if (deleteDocIds.includes(item.Id)) {
                return item.Id
              }
            })
            .filter(Boolean)

          const params = {
            IdsDataList: selectedListWithDocuments,
            StatusId: 9,
            ActionReason: editedValues?.reason,
          }
          try {
            const { payload, meta } = await dispatch(deleteDocument(params))
            const dataMessage = payload?.Message

            if (meta?.requestStatus === 'fulfilled') {
              if (payload?.ResponseStatus === 'Success') {
                setVisibleTextValue(false)
                setDeleteModal(false)
                setDeleteIds([])
                setDeleteId(-1)
                fetchBillsData(1)
                setSelectedRows([])
                if (billLists.length === 0) {
                  setIsIntermediate({
                    isEnable: false,
                    isChecked: false,
                  })
                }
                Toast.success('Successfully items deleted!!')
              } else {
                setDeleteModal(false)
                Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
              }
            } else {
              setDeleteModal(false)
              Toast.error(`${payload?.status} : ${payload?.statusText}`)
            }
          } catch (error) {
            console.error(error)
          }
        }
      } else {
        setEditedValues({
          reason: editedValues.reason,
        })
      }
    }
  }

  const handleAssigneeRow = async (value: any, id: any) => {
    setAssigneeValueRow(value)
    const selectedListWithDocuments = billLists
      .map((item: any) => {
        if (id === item.Id) {
          return item.Id
        }
      })
      .filter(Boolean)

    const params = {
      IdsDataList: selectedListWithDocuments,
      UserId: parseInt(value),
      ProcessType: parseInt(selectedProcessTypeInList as string),
    }

    try {
      const { payload, meta } = await dispatch(assignDocumentsToUser(params))
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          fetchBillsData(1)
          Toast.success(`Assignee has been changed successfully`)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        setDeleteModal(false)
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleApplyFilter = async () => {
    setIsFilterApplyChange(false)
    if (isResetFilter) {
      await dispatch(setFilterFormFields(initialBillPostingFilterFormFields))
      if (initialBillPostingFilterFormFields.ft_assignee === '2') {
        if (initialBillPostingFilterFormFields.ft_select_users.length === 0) {
          Toast.error('Please select at least one user.')
          return
        }
      }
      setIsApplyFilter(true)
      setIsOpenFilter(false)
      return
    }
    if (localFilterFormFields.ft_assignee === '2') {
      if (localFilterFormFields.ft_select_users.length === 0) {
        Toast.error('Please select at least one user.')
        return
      }
    }
    dispatch(
      setFilterFormFields({
        ...localFilterFormFields,
      })
    )
    setIsApplyFilter(true)
    setIsOpenFilter(false)
  }

  const onSelectCategory = async (value: number) => {
    const selectedListWithDocuments = billLists
      .map((item: any) => {
        if (selectedRows.includes(item.Id)) {
          return item.Id
        }
      })
      .filter(Boolean)

    const categoryUpdatePramas = {
      IdsDataList: selectedListWithDocuments,
      CurrentProcessType: parseInt(selectedProcessTypeInList.toString()),
      ProcessType: value,
    }

    try {
      const { payload, meta } = await dispatch(processTypeChangeByDocumentId(categoryUpdatePramas))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          fetchBillsData(1)
          setSelectedRows([])
          if (billLists.length === 0) {
            setIsIntermediate({
              isEnable: false,
              isChecked: false,
            })
          }
          Toast.success('Successfully items moved!!')
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (isOpenAssignUserDropDown || hoveredRow?.Id !== null) {
      setIsOpenMoveToDropDown({
        isShow: false,
        index: null,
      })
    }
  }, [isOpenAssignUserDropDown, hoveredRow?.Id])

  const handleCancel = () => {
    setIsOpenFilter(false)
  }

  const handleRestore = async () => {
    const selectedListWithDocuments = [isRestoreFields.id]

    const params = {
      IdsDataList: selectedListWithDocuments,
      StatusId: 1,
    }
    try {
      const { payload, meta } = await dispatch(deleteDocument(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setIsRestoreModalOpen(false)
          setIsRestoreFields({})
          fetchBillsData(1)
          Toast.success('Successfully item restored!!')
        } else {
          setDeleteModal(false)
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        setDeleteModal(false)
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onClickMoveToDropdown = () => {
    setIsOpenMoveToDropDown({
      isShow: true,
      index: null,
    })

    setIsOpenAssignUserDropDown(false)
  }

  const onClickDeleteMultipleBills = () => {
    setDeleteIds(selectedRows)
    setDeleteId(-1)
    setDeleteModal(true)
  }

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
    setCurrentWindow(newWindow)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    if (currentWindow && !currentWindow.closed) {
      currentWindow.location.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      setTimeout(function () {
        currentWindow.document.title = fileName
      }, 1000)
    } else {
      openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
    }
  }

  const handlePossibleDuplication = () => {
    router.push('/possible-duplication')
  }

  const fileExtensions = isFileRecord && isFileRecord?.FileName?.split('.')?.pop()?.toLowerCase()

  let noDataContent

  if (table_Data.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className='fixed flex h-[59px] w-full items-center justify-center border-b border-b-[#ccc]'>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }

  return (
    <>
      <Wrapper masterSettings={false}>
        <div className='billsMain'>
          <div className={`sticky top-0 ${isOpenFilter ? 'z-[99]' : 'z-[6]'} w-full`}>
            <div className='relative flex h-[66px] items-center justify-between bg-lightGray laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
              <div className='selectMain'>
                <Select
                  id={'process_selection'}
                  options={processOptions}
                  defaultValue={processSelection}
                  value={processSelection}
                  getValue={(value) => {
                    if (value === '3') {
                      dispatch(
                        setFilterFormFields({
                          ...filterFormFields,
                          ft_assignee: '1',
                        })
                      )
                    }
                    dispatch(setSelectedProcessTypeFromList(value))
                    setProcessSelection(value)
                    setSelectedRows([])
                  }}
                  getError={() => ''}
                  noborder
                />
              </div>

              <ul className='flex items-center gap-5'>
                {processSelection !== '3' && (<>
                  <label className={`text-sm font-proxima tracking-[0.02em] text-darkCharcoal ${inProcessCount == 0 ? "hidden" : "block"}`}>{inProcessCount} Files is in automation.</label>
                  <li className={`mt-1.5`} tabIndex={0}>
                    <Tooltip position='bottom' content='Sync' className='!z-10 !font-proxima !text-sm !px-0'>
                      <div className={`${inProcessCount > 0 && 'animate-spin'}`}>
                        <SyncIcon />
                      </div>
                    </Tooltip>
                  </li>
                </>)}

                <li className={`mt-1.5 relative`} tabIndex={0} onClick={handlePossibleDuplication}>
                  <Tooltip position='bottom' content='Possible Duplication' className='!z-10 !font-proxima !text-sm'>
                    <BillDuplicationIcon />
                  </Tooltip>
                  {(duplicateBillCount && duplicateBillCount > 0) ? <div className='cursor-pointer absolute right-1 top-0 z-10' onClick={handlePossibleDuplication}>
                    <Badge badgetype='error' variant='dot' text={`${duplicateBillCount}`} effect={duplicateBillCount != 0 ? true : false} />
                  </div> : null}
                </li>

                {selectedRows.length > 1 ? (
                  <>
                    {filterRowsAssignee.length === selectedRows.length && selectedProcessTypeInList !== '3' && (
                      <li
                        className='mt-1.5'
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpenAssignUserDropDown(true)}
                      >
                        <Tooltip position='bottom' content='Assignee' className='!z-10 !font-proxima !text-sm !px-0'>
                          <AssignUser
                            width={60}
                            selectedStates={selectedStates}
                            setSelectedStates={handleSetValue}
                            userData={assignList}
                            // setValue={(value) => handleSetValue(value)}
                            // getData={(value) => handleAssignValue(value)}
                            dropdownAssignUserRef={dropdownAssignUserRef}
                            isOpenAssignUserDropDown={isOpenAssignUserDropDown}
                            setIsOpenAssignUserDropDown={setIsOpenAssignUserDropDown}
                            right={0}
                          />
                        </Tooltip>
                      </li>
                    )}

                    {filterRowsMoveTo.length === selectedRows.length && (
                      <li
                        className='flex cursor-pointer items-center justify-center p-1'
                        onClick={onClickMoveToDropdown}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClickMoveToDropdown()}
                      >
                        <Tooltip position='bottom' content='Move To' className='!z-[6] !m-0 !font-proxima !text-sm'>
                          <TabMoveIcon />
                        </Tooltip>
                        <span className='pl-2'>
                          <DropdownIcon />
                        </span>
                      </li>
                    )}

                    <div
                      className='cursor-pointer mt-1.5'
                      onClick={onClickDeleteMultipleBills}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClickDeleteMultipleBills()}
                    >
                      <Tooltip position='bottom' content='Delete' className='!z-[6] !m-0 !px-0 !font-proxima !text-sm'>
                        <DeleteIcon />
                      </Tooltip>
                    </div>

                    {isOpenMoveToDropDown.isShow && isOpenMoveToDropDown.index === null && (
                      <div
                        ref={dropdownMoveToRef}
                        className='absolute right-20 top-12 !z-10 flex h-auto w-[180px]  flex-col rounded-md bg-white shadow-lg'
                      >
                        <div className='flex flex-col items-start justify-start'>
                          {moveToOptions &&
                            moveToOptions
                              .filter((m) => {
                                if (parseInt(processSelection) === 1) {
                                  return m.value !== 1
                                } else if (parseInt(processSelection) === 2) {
                                  return m.value !== 2
                                } else if (parseInt(processSelection) === 3) {
                                  return m.value !== 3
                                } else {
                                  return true
                                }
                              })
                              .map((item, index) => {
                                return (
                                  <span
                                    className='flex w-full cursor-pointer items-center justify-start px-[15px] py-[11px] !text-sm hover:bg-blue-50'
                                    onClick={() => {
                                      onSelectCategory(item.value)
                                    }}
                                    key={`${item.value}`}
                                  >
                                    <Typography>{item?.label}</Typography>
                                  </span>
                                )
                              })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <li
                      onClick={handleFilterIconOpen}
                      className='mt-1.5'
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFilterIconOpen()}
                    >
                      <Tooltip position='bottom' content='Filter' className='!z-[6] !font-proxima !text-sm !px-0'>
                        <FilterIcon />
                      </Tooltip>
                    </li>
                    {processSelection !== '3' && (
                      <li
                        onClick={() => router.push('/fileupload')}
                        className='mt-1.5'
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push('/fileupload')}
                      >
                        <Tooltip position='bottom' content='File Upload' className='!z-[6] !font-proxima !text-sm !px-0'>
                          <UploadIcon height={'24'} width={'24'} />
                        </Tooltip>
                      </li>
                    )}
                    <li
                      onClick={handleCreateIconOpen}
                      className='mt-[7px]'
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCreateIconOpen()}
                    >
                      <Tooltip position='bottom' content='Create' className='!z-[6] !font-proxima !text-sm !px-0'>
                        <CreateIcon />
                      </Tooltip>
                      {isOpenCreate && (
                        <div
                          ref={dropdownCreateRef}
                          className='absolute right-20 top-12 !z-[999] flex h-auto flex-col rounded-md bg-white shadow-lg'
                        >
                          <Create />
                        </div>
                      )}
                    </li>
                    {selectedProcessTypeInList !== '3' && billLists.length > 0 && (
                      <li
                        onClick={handleViewIconOpen}
                        className='mt-[7px]'
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleViewIconOpen()}
                      >
                        <Tooltip position='bottom' content='Mode' className='!z-[6] !font-proxima !text-sm !px-0'>
                          <ViewIcon />
                        </Tooltip>
                        {isOpenView && (
                          <div
                            ref={dropdownViewRef}
                            className='absolute right-6 top-12 !z-10 flex h-auto flex-col rounded-md bg-white py-2 shadow-lg'
                          >
                            <View
                              Id={billLists[0]?.Id}
                              IsFromDocuments={billLists[0]?.IsFromDocuments}
                              Status={billLists[0]?.Status}
                              UserId={billLists[0]?.UserId}
                              billListsData={billLists}
                              selectedRow={selectedRows}
                              onClose={() => { }}
                            />
                          </div>
                        )}
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
            <FilterPopover
              filterApplyChange={isFilterApplyChange}
              billList={billLists}
              isOpenFilter={isOpenFilter}
              onClose={() => setIsOpenFilter(false)}
              filterFormFields={filterFormFields}
              onCancel={handleCancel}
              onApply={handleApplyFilter}
              onResetFilter={(value: boolean) => setIsResetFilter(value)}
              onReset={() => {
                setIsResetFilter(true)
                setLocalFilterFormFields({
                  ...initialBillPostingFilterFormFields,
                  ft_location: locationOptions.map((option: any) => option.value),
                  ft_vendor: vendorOptions.map((option: any) => option.value),
                })
              }}
              processSelection={processSelection}
              statusOptions={statusOptions}
              locationOptions={locationOptions}
              userOptions={assignListRow}
              vendorOptions={vendorOptions}
              localFilterFormFields={localFilterFormFields}
              setLocalFilterFormFields={setLocalFilterFormFields}
            />
          </div>

          <div className={`custom-scroll h-[calc(100vh-145px)] overflow-auto ${tableDynamicWidth}`}>
            <div className={`mainTable ${billLists.length !== 0 && 'h-0'}`}>
              <DataTable
                zIndex={5}
                getExpandableData={() => { }}
                getRowId={(value: any) => {
                  if (!isOpenMoveTo) {
                    setHoveredRow(value)
                  }
                }}
                columns={columns}
                data={(billPostingHeaders.length > 0 && billLists.length > 0) ? table_Data : []}
                sticky
                hoverEffect
                isTableLayoutFixed={true}
                userClass='innerTable sticky'
                lazyLoadRows={lazyRows}
              />
              {isLazyLoading && !isLoading && (
                <Loader size='sm' helperText />
              )}
              <div ref={tableBottomRef} />
            </div>
            {noDataContent}
          </div>
        </div>

        {isFileModal && ['pdf'].includes(fileExtensions ?? '') && (
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
            openInNewWindow={openInNewWindow}
          />
        )}

        <ConfirmationModal
          title='Restore'
          content={`Are you sure you want to restore the bill?`}
          isModalOpen={isRestoreModalOpen}
          modalClose={modalRestoreClose}
          handleSubmit={handleRestore}
          colorVariantNo='btn-outline-primary'
          colorVariantYes='btn-primary'
        />

        <DeleteWithReason
          setHandleErrorMsg={(value: any) => setHandleErrorValue(value)}
          isTextVisible={isVisibleTextValue}
          setVisibleTextValue={(value: boolean) => setVisibleTextValue(value)}
          onOpen={isDeleteModal}
          onClose={() => {
            setVisibleTextValue(false)
            setDeleteModal(false)
          }}
          handleSubmit={() => handleDelete(deleteId, deleteIds)}
          editedValues={editedValues}
          setEditedValues={setEditedValues}
        />
      </Wrapper>
    </>
  )
}

export default ListBillPosting
