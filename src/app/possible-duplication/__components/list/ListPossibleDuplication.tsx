'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AvatarSelect, Badge, CheckBox, DataTable, Loader, Toast, Tooltip, Typography } from 'pq-ap-lib'

import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import DeleteIcon from '@/assets/Icons/billposting/DeleteIcon'
import DropdownIcon from '@/assets/Icons/billposting/DropdownIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import RestoreIcon from '@/assets/Icons/billposting/RestoreIcon'
import TabMoveIcon from '@/assets/Icons/billposting/TabMoveIcon'
import ViewModeIcon from '@/assets/Icons/billposting/ViewModeIcon'

import ColumnFilterDropdown from '@/app/bills/__components/ColumnFilterDropdown'
import FilterPopover from '@/app/bills/__components/FilterPopover'
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
    setIsVisibleSidebar
} from '@/store/features/bills/billSlice'
import { parseISO } from 'date-fns'

import FileModal from '@/app/bills/__components/FileModal'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import SortIcon from '@/assets/Icons/SortIcon'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import DeleteWithReason from '@/components/Modals/DeleteWithReason'
import { setSearchSelectedModule } from '@/store/features/globalSearch/globalSearchSlice'
import { convertStringsDateToUTC } from '@/utils'
import { billStatusEditable, getPDFUrl, getTimeDifference, initialBillPostingFilterFormFields } from '@/utils/billposting'
import { useSession } from 'next-auth/react'
import DuplicationEditIcon from '@/assets/Icons/DuplicateEditIcon'
import agent from '@/api/axios'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'

const ListPossibleDuplication = ({ vendorOptions, locationOptions, statusOptions, processOptions }: any) => {
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
                <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handelColumn('BillNumber')}>
                    Bill No. <SortIcon order={sortOrders['BillNumber']}></SortIcon>
                </div>
            ),
            accessor: 'BillNumber',
            visible: true,
            sortable: false,
            colalign: 'left',
            colStyle: 'w-[159px] !uppercase',
        },
        {
            header: (
                <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handelColumn('UploadedDate')}>
                    Uploaded Date <SortIcon order={sortOrders['UploadedDate']}></SortIcon>
                </div>
            ),
            accessor: 'UploadedDate',
            visible: true,
            sortable: false,
            colalign: 'left',
            colStyle: 'w-[140px] !uppercase',
        },
        {
            header: 'Vendor Name',
            accessor: 'VendorName',
            visible: true,
            sortable: true,
            colalign: 'left',
            colStyle: 'w-[160px] !uppercase',
        },
        {
            header: (
                <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handelColumn('Amount')}>
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
    }, [shouldLoadMore, itemsLoaded, tableBottomRef])

    useEffect(() => {
        dispatch(setSearchSelectedModule('2'))
    }, [])

    useEffect(() => {
        if (isApplyFilter) {
            fetchBillsData(1)
        }
    }, [isApplyFilter])

    useEffect(() => {
        fetchBillsData(1)
    }, [selectedProcessTypeInList, assigneeValueRow, sortOrder])

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
                                disabled
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
                                        disabled
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

    // const responseFailure = () => {
    //   setIsLoading(false)
    //   setLoaderCounter(0)
    //   setApiDataCount(0)
    // }

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
                const response = await agent.APIs.getDuplicateList(params)
                const dataMessage = response?.Message

                if (response?.ResponseStatus === 'Success') {
                    setInProcessCount(response?.ResponseData?.InProcessCount)

                    const responseData = response?.ResponseData
                    const newList = responseData?.List || []
                    const newTotalCount = responseData?.ListCount || 0
                    setApiDataCount(newTotalCount)

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
            } catch (error) {
                // responseFailure()
                console.log(error)
            } finally {
                setIsLoading(false)
                setIsLazyLoading(false)
            }
        }
    }

    useEffect(() => {
        if (CompanyId) {
            fetchBillsData(1)
        }
    }, [CompanyId])

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
                                columnStyle = 'w-[140px]'
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
                                <span className='flex cursor-pointer items-center gap-1.5' onClick={() => handelColumn('Amount')}>
                                    Amount<SortIcon order={sortOrders['Amount']}></SortIcon>
                                </span>
                            )
                        } else if (label === 'Uploaded Date') {
                            headerContent = (
                                <span className='flex cursor-pointer items-center gap-1.5' onClick={() => handelColumn('CreatedOn')}>
                                    Uploaded Date<SortIcon order={sortOrders['CreatedOn']}></SortIcon>
                                </span>
                            )
                        } else if (label === 'Bill No.' || label === 'Adjustment Number') {
                            headerContent = (
                                <span className='flex cursor-pointer items-center gap-1.5' onClick={() => handelColumn('BillNumber')}>
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
                            colStyle: `${columnStyle} !uppercase`,
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
            console.log(error)
        }
    }

    useEffect(() => {
        setIsLoading(true)

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
                    console.log(error)
                }
            }
        }

        if (CompanyId) {
            getMappingListData()
            fetchAssigneData()
        }
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
        if (CompanyId) {
            getMappingListData()
        }
    }, [processSelection, assigneeValueRow])

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
                                disabled
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
                                disabled
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
                <Tooltip position='left' content='Add column' className='!font-proxima !text-sm'>
                    <span className='pl-5'>
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
                    </span>
                </Tooltip>
            ),
            accessor: 'actions',
            sortable: false,
            colalign: 'right',
            colStyle: '!w-[150px]',
        },
    ]

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
                            id={'d.UserId'}
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
                            // disabled={!billStatusEditable.includes(d.Status) ? true : false}
                            disabled
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
                actions: (
                    <>
                        {d.Status !== 9 && <div className='relative flex h-full justify-end'>
                            <div className={`z-0 flex items-center px-2`}>
                                <Tooltip position='left' content='Edit' className='!z-10 !font-proxima !text-sm'>
                                    <div
                                        className='cursor-pointer'
                                        onClick={() => {
                                            dispatch(setIsFormDocuments(d.IsFromDocuments))
                                            dispatch(setIsVisibleSidebar(false))
                                            d.Id && router.push(`/bills/edit/${d.Id}?module=bills`)
                                        }}
                                    >
                                        <DuplicationEditIcon />
                                    </div>
                                </Tooltip>
                            </div>
                            <div
                                className='z-0 flex cursor-pointer items-center px-2'
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
                        </div>
                        }
                    </>
                ),
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
            console.log(error)
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

        setLocalFilterFormFields({ ...filterFormFields })

        setOpenAttachFile(false)
        setOpenView(false)
        setOpenCreate(false)
    }

    const modalRestoreClose = () => {
        setIsRestoreModalOpen(false)
    }

    const handleDelete = async (removeDocId: any) => {
        if (isVisibleTextValue) {
            if (isHandleErrorValue) {
                if (removeDocId !== -1) {
                    const params = {
                        IdsDataList: [removeDocId],
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
                        console.log(error)
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
            console.log(error)
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
            StatusId: isRestoreFields.isFromDocuments ? 1 : 2,
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
            console.log(error)
        }
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

    const handleBackPage = () => {
        router.push('/bills')
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
                        <div className='relative flex h-16 items-center justify-between bg-[#F4F4F4] px-[20px]'>
                            <div className='flex items-center justify-center'>
                                <span
                                    className='cursor-pointer rounded-full bg-white p-1.5'
                                    onClick={handleBackPage}
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBackPage()}
                                >
                                    <BackIcon />
                                </span>
                                <span className='pl-4 !text-sm font-semibold'>
                                    Bills Duplication
                                </span>

                            </div>

                            <ul className='flex items-center '>
                                <li
                                    onClick={handleFilterIconOpen}
                                    className='p-1'
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFilterIconOpen()}
                                >
                                    <Tooltip position='bottom' content='Filter' className='!z-[6] !font-proxima !text-sm'>
                                        <FilterIcon />
                                    </Tooltip>
                                </li>
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
                                setLocalFilterFormFields(initialBillPostingFilterFormFields)
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

                    <div className={`custom-scroll h-[calc(100vh-145px)] overflow-scroll ${tableDynamicWidth}`}>
                        <div className={`mainTable ${billLists.length !== 0 && 'h-0'}`}>
                            <DataTable
                                getExpandableData={() => { }}
                                getRowId={(value: any) => {
                                    if (!isOpenMoveTo) {
                                        setHoveredRow(value)
                                    }
                                }}
                                columns={columns}
                                data={billLists.length > 0 ? table_Data : []}
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
                    handleSubmit={() => handleDelete(deleteId)}
                    editedValues={editedValues}
                    setEditedValues={setEditedValues}
                />
            </Wrapper>
        </>
    )
}

export default ListPossibleDuplication
