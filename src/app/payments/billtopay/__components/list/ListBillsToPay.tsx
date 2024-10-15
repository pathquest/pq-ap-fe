'use client'

import { BlobServiceClient } from '@azure/storage-blob'
import { format, parse } from 'date-fns'
import { usePathname, useRouter } from 'next/navigation'
import { Badge, BasicTooltip, Button, CheckBox, DataTable, Loader, Toast, Tooltip, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'

// Common components
import FileModal from '@/app/bills/__components/FileModal'
import Wrapper from '@/components/Common/Wrapper'
import VendorsDropdown from '../../components/dropdowns/Vendor'
import BillsOnHoldModal from '../../components/modals/BillsOnHoldModal'
import FilterModal from '../../components/modals/FilterModal'
import MarkAsPaidModal from '../../components/modals/MarkAsPaidModal'
import MoveBillsToPayModals from '../../components/modals/MoveBillsToPayModal'

// Icons
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import PaymentAgingIcon from '@/assets/Icons/PaymentAgingIcon'
import SortIcon from '@/assets/Icons/SortIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import ExclamationIcon from '@/assets/Icons/payments/ExclamationIcon'

// Store
import ColumnFilter from '@/components/Common/Custom/ColumnFilter'
import Download from '@/components/Common/Custom/Download'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import { storageConfig } from '@/components/Common/pdfviewer/config'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setIsVisibleSidebar, setSelectedStatus, vendorDropdown } from '@/store/features/bills/billSlice'
import { getPaymentColumnMapping, paymentGetList, savePaymentColumnMapping, setCurrentPath, setVendorIdList } from '@/store/features/billsToPay/billsToPaySlice'
import { setSearchSelectedModule } from '@/store/features/globalSearch/globalSearchSlice'
import { useSession } from 'next-auth/react'
import { Actions } from '../../components/DataTableActions/DataTableActions'
import MultipleVendorMultiplePaymentDetailsModal from '../../components/payment-details/MultipleVendorMultiplePaymentDetailsModal'
import SinglePaymentDetailsModal from '../../components/payment-details/SinglePaymentDetailsModal'
import SingleVendorMultiplePaymentDetailsModal from '../../components/payment-details/SingleVendorMultiplePaymentDetailsModal'

const ListBillsToPay: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()

  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isPaymentPermission = getModulePermissions(processPermissionsMatrix, "Payments") ?? {}
  const isBillsToPayEdit = isPaymentPermission["Bills to pay"]?.Edit ?? false;
  const isBillsToPayView = isPaymentPermission["Bills to pay"]?.View ?? false;

  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const { filterFormFields, vendorIdList } = useAppSelector((state) => state.billsToPayReducer)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const userId = localStorage.getItem('UserId')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedRows, setSelectedRows] = useState<any>([])
  const [selectRowsStatus, setSelectRowsStatus] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rowId, setRowId] = useState<number[]>([])
  const [isBillOnHoldClicked, setBillOnHoldClicked] = useState<boolean>(false)

  const [isSingleBillPaymentModalOpen, setIsSingleBillPaymentModalOpen] = useState<boolean>(false)
  const [isSingleVendorMultipleBillPayModalOpen, setIsSingleVendorMultipleBillPayModalOpen] = useState<boolean>(false)
  const [isMultipleVendorMultipleBillPayModalOpen, setIsMultipleVendorMultipleBillPayModalOpen] = useState<boolean>(false)

  const [isMarkAsPaidClicked, setMarkAsPaidClicked] = useState<boolean>(false)
  const [isBillsToPayClicked, setBillsToPayClicked] = useState<boolean>(false)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [isFilterClicked, setFilterClicked] = useState<boolean>(false)
  const [paymentList, setPaymentList] = useState<any[]>([])
  const [totalAmountToPay, setTotalAmountToPay] = useState<number>(0)
  const [fileBlob, setFileBlob] = useState<any>('')
  const [PDFUrl, setPDFUrl] = useState<any>('')
  const [tableDynamicWidth, setTableDynamicWidth] = useState('w-full w-[calc(100vw-180px)]')
  const [currSelectedBillDetails, setCurrSelectedBillDetails] = useState<any[]>([])
  const [isFileModal, setFileModal] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [headersDropdown, setHeadersDropdown] = useState<any>([])
  const [columnListVisible, setColumnListVisible] = useState<any>([])
  const [billsToPayHeaders, setBillsToPayHeaders] = useState<any>([])
  const [mapColId, setMapColId] = useState<number>(-1)
  const [vendorOptions, setVendorOptions] = useState<any>([])

  const [isVisibleActivities, setIsVisibleActivities] = useState<boolean>(false)
  const [selectedPayableId, setSelectedPayableId] = useState<number | null>(null)

  const [orderBy, setOrderBy] = useState<number | null>(1)
  const [orderColumnName, setOrderColumnName] = useState<string | null>('DueDate')
  const [hoveredColumn, setHoveredColumn] = useState<string>("");
  const [parsedColumnData, setParsedColumnData] = useState<any>([])

  const [isGuid, setGuid] = useState<string>('')
  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [loaderCounter, setLoaderCounter] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  const [checkLoader, setCheckLoader] = useState<boolean>(true)
  const [vendorsId, setVendorsId] = useState<any[]>([])
  let nextPageIndex: number = 1
  const lazyRows: number = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const [currentPayValue, setCurrentPayValue] = useState({
    billNumber: '',
    billDate: '',
    dueDate: '',
    vendorName: '',
    discount: null,
    payAmount: 0,
    remainingAmount: 0,
    accountPaybleId: null,
    vendorId: 0,
  })

  const [isIntermediate, setIsIntermediate] = useState<any>({
    isEnable: false,
    isChecked: false,
  })

  const [isFileRecord, setIsFileRecord] = useState<any>({
    FileName: '',
    PageCount: '',
    BillNumber: '',
  })

  useEffect(() => {
    if (!isBillsToPayView) {
      router.push('/manage/companies');
    }
  }, [isBillsToPayView]);

  useEffect(() => {
    dispatch(setSearchSelectedModule('4'))
  }, [])

  //Vendor List API
  const getAllVendorOptions = () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
      setVendorOptions(responseData)
      const allValues = responseData.map((option: any) => option.value);
      vendorIdList.length == 0 && dispatch(setVendorIdList(allValues))
    })
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('DataList')
    localStorage.removeItem('BillsData')
    localStorage.removeItem('totalPayableAmount')
    localStorage.removeItem('MultipleVendorTableData')
    localStorage.removeItem('billAmount')
    localStorage.removeItem('availCredits')
    localStorage.removeItem('PartialPaymentDataList')
    localStorage.removeItem('CreditData')
    localStorage.removeItem('PaymentMethodList')
    localStorage.removeItem('MultipleVendorCreditData')
    localStorage.removeItem('MultipleVendorPartialPaymentDataList')
  }

  useEffect(() => {
    setSelectedRows([])
    setSelectRowsStatus([])
    getAllVendorOptions()
    clearLocalStorage()
    setCurrSelectedBillDetails([])
  }, [CompanyId])

  const getDateParams = () => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const startDateFormatted = formatDate(lastMonth + '')

    const futureMonth = new Date()
    futureMonth.setMonth(futureMonth.getMonth() + 1)
    const endDateFormatted = formatDate(futureMonth + '')

    return { startDateFormatted, endDateFormatted }
  }

  const dateParams = getDateParams()
  let startDate
  let endDate

  if (filterFormFields?.dueDateFrom !== null) {
    startDate = filterFormFields?.dueDateFrom
  } else if (filterFormFields?.isDueDateClicked === 1) {
    startDate = dateParams.startDateFormatted
  } else {
    startDate = null
  }

  if (filterFormFields?.dueDateTo !== null) {
    endDate = filterFormFields?.dueDateTo
  } else if (filterFormFields?.isDueDateClicked === 1) {
    endDate = dateParams.endDateFormatted
  } else {
    endDate = null
  }

  const getPaymentListParams = {
    VendorIds: vendorIdList,
    LocationIds: filterFormFields?.location.map(item => parseInt(item)) ?? null,
    Status: filterFormFields?.paymentStatus ?? null,
    StartDay: filterFormFields?.startDay !== null ? filterFormFields?.startDay : null,
    EndDay: filterFormFields?.endDay !== null ? filterFormFields?.endDay : null,
    StartDate:
      typeof startDate === 'string' && startDate.length === 0
        ? null
        : typeof startDate === 'string'
          ? format(parse(startDate.trim(), 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss")
          : null,
    EndDate:
      typeof endDate === 'string' && endDate.length === 0
        ? null
        : typeof endDate === 'string'
          ? format(parse(endDate.trim(), 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss")
          : null,
    AgingFilter: 0,
    // OrderColumn: orderColumnName ?? null,
    // OrderBy: sortableFields[orderColumnName] ? 1 : 0,
    OrderColumn: 'DueDate',
    OrderBy: 0,
    IsDownload: false,
    // PageNumber: pageIndex || nextPageIndex,
    PageSize: lazyRows,
  }

  // const handleSelectVendors = (values: any) => {
  //   dispatch(setSelectedVendors(values))
  // }

  const handleModalClose = () => {
    setBillOnHoldClicked(false)
    setRowId([])
  }

  const handleClosePayBillModal = () => {
    setIsSingleBillPaymentModalOpen(false)
    setIsSingleVendorMultipleBillPayModalOpen(false)
    setIsMultipleVendorMultipleBillPayModalOpen(false)
    setRowId([])
    clearLocalStorage()
    setCurrentPayValue({
      billNumber: '',
      billDate: '',
      dueDate: '',
      vendorName: '',
      discount: null,
      vendorId: 0,
      payAmount: 0,
      remainingAmount: 0,
      accountPaybleId: null,
    })
  }

  const handleCloseMarkAsPaidModal = () => {
    setMarkAsPaidClicked(false)
    setRowId([])
  }

  const handleMoveBillsToPayModalClose = () => {
    setRowId([])
    setBillsToPayClicked(false)
  }

  const handleFilterClose = () => {
    setFilterClicked(false)
  }

  // Function to calculate the total AmountToPay for selected rows
  const calculateTotalAmountToPay = (selectedRows: any[]) => {
    let totalAmountToPay = 0

    selectedRows.forEach((selectedId) => {
      const selectedRow = paymentList.find((row) => row.Id === selectedId)
      if (selectedRow) {
        totalAmountToPay += selectedRow.RemanningDue
      }
    })

    // Format the total to have 2 decimal places
    return totalAmountToPay.toFixed(2)
  }

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

  const handleFileOpen = (filePath: any, fileName: string) => {
    showPDFViewerModal(filePath, fileName)
    setFileModal(!isFileModal)
  }

  const showPDFViewerModal = async (filePath: any, fileName: any) => {
    setIsPdfLoading(true)
    const storageAccount = storageConfig.storageAccount
    const containerName: any = storageConfig.containerName
    const sasToken = storageConfig.sassToken

    const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient?.getBlockBlobClient(`${filePath}`)
    try {
      const downloadBlockBlobResponse = await blockBlobClient.download(0)

      if (downloadBlockBlobResponse.blobBody) {
        const blob = await downloadBlockBlobResponse.blobBody
        const url = URL.createObjectURL(blob)

        if (!['pdf'].includes(fileName.split('.').pop().toLowerCase())) {
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
        }

        setPDFUrl(url)
        setFileBlob(blob)
        setIsPdfLoading(false)
      } else {
        setIsPdfLoading(false)
        console.error('Blob body is undefined')
      }
    } catch (error) {
      setIsPdfLoading(false)
      console.error('Error downloading blob:', error)
    }
  }
  const handleOpenAttachFile = (Id: number) => {
    setOpenAttachFile(!isOpenAttchFile)
    setRowId([Id])
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenAttachFile(false)
    }
  }

  // function for select All row (Checkboxes)
  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      const uniqueVendorIds = new Set()
      const uniqueIds: any[] = []

      tableData.forEach((row) => {
        if (!uniqueVendorIds.has(row.VendorId)) {
          uniqueVendorIds.add(row.VendorId)
          uniqueIds.push(row.VendorId)
        }
      })

      setVendorsId(uniqueIds)

      const newSelecteds = tableData.map((row: any) => row.Id)
      setSelectedRows(newSelecteds)

      const selectedBillDetails = paymentList.map((row: any) => ({
        VendorId: Number(row.VendorId),
        AccountPaybleId: row.Id,
        Amount: row.RemanningDue,
      }))

      setCurrSelectedBillDetails(selectedBillDetails)

      const selectedStatus = paymentList.map((row: any) => Number(row.PaymentStatus))
      setSelectRowsStatus(selectedStatus)

      // Calculate and log the totalAmountToPay for selected rows
      const totalAmount = calculateTotalAmountToPay(newSelecteds)
      setTotalAmountToPay(Number(totalAmount))
      return
    }

    setCurrSelectedBillDetails([])
    setSelectedRows([])
    setSelectRowsStatus([])
  }

  // function for row select (CheckBox)
  const handleRowSelect = (event: any, id: any, statusId: any, VendorId: number) => {
    setSelectedRows((prevSelectedRows: any) => {
      const selectedIndex = prevSelectedRows.indexOf(id)
      let newSelected: any[] = []
      let newStatuses: any[] = []

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(prevSelectedRows, id)
        newStatuses = newStatuses.concat(selectRowsStatus, Number(statusId))
      } else {
        newSelected = prevSelectedRows.filter((rowId: any) => rowId !== id)
        newStatuses = selectRowsStatus.filter((rowStatus: any, index: number) => prevSelectedRows[index] !== id)
      }

      const selectedBillDetails = paymentList
        .filter((row: any) => newSelected.includes(row.Id))
        .map((row: any) => ({
          VendorId: Number(row.VendorId),
          AccountPaybleId: row.Id,
          Amount: row.RemanningDue,
        }))
      setCurrSelectedBillDetails(selectedBillDetails)

      // Calculate and log the totalAmountToPay for selected rows
      const totalAmount = calculateTotalAmountToPay(newSelected)
      setTotalAmountToPay(Number(totalAmount))

      setSelectRowsStatus(newStatuses)

      const uniqueVendorIds = Array.from(new Set(selectedBillDetails.map((detail) => detail.VendorId)))
      setVendorsId(uniqueVendorIds)
      return newSelected
    })
  }

  // when user click on action icon set a id
  const handleIdGet = (id: number) => {
    setRowId([id])
  }

  const handleMenuChange = (actionName: string, id: number, Guid: string, vendorId: number, amount: number) => {
    switch (actionName) {
      case 'Mark as Paid':
        setMarkAsPaidClicked(true)
        setCurrSelectedBillDetails([
          {
            VendorId: vendorId,
            AccountPaybleId: id,
            Amount: amount,
          },
        ])
        break
      case 'Edit Bill':
        // router.push(`/payments/billtopay/edit/${id}`)
        // dispatch(setSelectedStatus(0))
        router.push(`/bills/edit/${id}?module=billsToPay`)
        dispatch(setSelectedStatus(0))
        dispatch(setIsVisibleSidebar(false))
        break
      case 'Move to Bills on Hold':
        setBillOnHoldClicked(true)
        break
      case 'Activities':
        setGuid(Guid)
        setSelectedPayableId(id)
        setIsVisibleActivities(true)
        break
      case 'Move to Bills to Pay':
        setBillsToPayClicked(true)
        break
      default:
        break
    }
  }

  // const handleMenuChangeForOnHold = (actionName: string, id: number) => {
  //   switch (actionName) {
  //     case 'Edit Bill':
  //       // router.push(`/payments/billtopay/edit/${id}`)
  //       // dispatch(setSelectedStatus(0))
  //       router.push(`/bills/edit/${id}`)
  //       dispatch(setSelectedStatus(0))
  //       break
  //     case 'Move to Bills to Pay':
  //       setBillsToPayClicked(true)
  //       break
  //     case 'Activities':
  //       break
  //     default:
  //       break
  //   }
  // }

  useEffect(() => {
    getBillsPaymentListData(1)
    setSelectedRows([])
    setSelectRowsStatus([])
  }, [orderBy, vendorIdList, filterFormFields, CompanyId])

  const getNewList = (responseData: any) => {
    return responseData?.List || []
  }

  const getNewTotalCount = (responseData: any) => {
    return responseData?.ListCount || 0
  }

  const handleErrorResponse = (dataMessage: any) => {
    Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
  }

  const handleStatusErrorResponse = (payload: any) => {
    Toast.error(`${payload?.status} : ${payload?.statusText}`)
  }

  const handleFinallyBlock = () => {
    setIsLoading(false)
    if (!isMarkAsPaidClicked || !isBillsToPayClicked) {
      setLoaderCounter(0)
    } else {
      setLoaderCounter(1)
    }
    setShouldLoadMore(true)
    setCheckLoader(true)
  }

  const responseFailure = () => {
    setIsLoading(false)
    setLoaderCounter(0)
    setApiDataCount(0)
  }

  const getBillsPaymentListData = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setCurrSelectedBillDetails([])
      setVendorsId([])
      setPaymentList([])
      setItemsLoaded(0)
    }

    setIsLoading(true)
    try {
      const params = {
        ...getPaymentListParams,
        OrderColumn: orderColumnName ?? '',
        OrderBy: orderBy ?? 0,
        PageNumber: pageIndex || nextPageIndex,
      }
      const { payload, meta } = await dispatch(paymentGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
          const newList = getNewList(responseData)
          const newTotalCount = getNewTotalCount(responseData)

          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLoading(false)
            setShouldLoadMore(true)
            setSelectedRows([])
            setRowId([])
            setSelectRowsStatus([])
          } else {
            updatedData = [...paymentList, ...newList]
          }
          setPaymentList(updatedData)
          setItemsLoaded(updatedData.length)
          setIsLoading(false)

          if (itemsLoaded >= newTotalCount) {
            setShouldLoadMore(false)
          }
        } else {
          responseFailure()
          handleErrorResponse(dataMessage)
        }
      } else {
        responseFailure()
        handleStatusErrorResponse(payload)
      }
    } catch (error) {
      responseFailure()
      console.error(error)
    } finally {
      handleFinallyBlock()
    }
  }

  // For Sorting Data
  const handleSortColumn = (name: string) => {
    setOrderColumnName(name)
    setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
  }

  // Column Mapping API
  const getMappingListData = () => {
    const params = {
      UserId: Number(userId),
    }
    performApiAction(dispatch, getPaymentColumnMapping, params, (responseData: any) => {
      setMapColId(responseData?.Id)
      const obj = JSON.parse(responseData?.ColumnList)
      setParsedColumnData(obj)
    })
  }

  useEffect(() => {
    dispatch(setCurrentPath(pathname))
  }, [])

  useEffect(() => {
    if (CompanyId) {
      getMappingListData()
    }
  }, [CompanyId])

  useEffect(() => {
    const data = Object.entries(parsedColumnData).map(([label, value]) => {
      let columnStyle = ''
      let colalign = ''
      switch (label) {
        case 'Due Date':
          columnStyle = '!w-[105px]'
          break
        case 'Bill Number':
          columnStyle = '!w-[135px] !pl-[15px]'
          break
        case 'Vendor':
          columnStyle = '!w-[180px]'
          colalign = 'left'
          break
        case 'Remaining':
          columnStyle = '!w-[120px]'
          colalign = 'right'
          break
        case 'Available Credit':
          columnStyle = '!w-[130px]'
          colalign = 'right'
          break
        case 'Bill Amount':
          columnStyle = '!w-[120px]'
          colalign = 'right'
          break
        case 'Payment Status':
          columnStyle = '!w-[130px]'
          break
        case 'Discount':
          columnStyle = '!w-[120px]'
          colalign = 'right'
          break
        case 'Location':
          columnStyle = '!w-[120px]'
          colalign = 'right'
          break
        case 'Bill Date':
          columnStyle = '!w-[120px]'
          break
        default:
          break
      }
      return {
        header:
          label === 'Due Date' ? (
            <div className='flex cursor-pointer items-center gap-1.5 group' onClick={() => handleSortColumn('DueDate')} onMouseEnter={() => setHoveredColumn("DueDate")} onMouseLeave={() => setHoveredColumn("")}>
              Due Date <SortIcon orderColumn="DueDate" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "DueDate"}></SortIcon>
            </div>
          ) : label === 'Bill Number' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('BillNumber')} onMouseEnter={() => setHoveredColumn("BillNumber")} onMouseLeave={() => setHoveredColumn("")}>
              Bill Number <SortIcon orderColumn="BillNumber" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "BillNumber"}></SortIcon>
            </div>
          ) : label === 'Vendor' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('VendorName')} onMouseEnter={() => setHoveredColumn("VendorName")} onMouseLeave={() => setHoveredColumn("")}>
              Vendor <SortIcon orderColumn="VendorName" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "VendorName"}></SortIcon>
            </div>
          ) : label === 'Bill Date' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('BillDate')} onMouseEnter={() => setHoveredColumn("BillDate")} onMouseLeave={() => setHoveredColumn("")}>
              Bill Date <SortIcon orderColumn="BillDate" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "BillDate"}></SortIcon>
            </div>
          ) : label === 'Remaining' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('RemanningDue')} onMouseEnter={() => setHoveredColumn("RemanningDue")} onMouseLeave={() => setHoveredColumn("")}>
              Remaining <SortIcon orderColumn="RemanningDue" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "RemanningDue"}></SortIcon>
            </div>
          ) : label == 'Available Credit' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('AvailableCredit')} onMouseEnter={() => setHoveredColumn("AvailableCredit")} onMouseLeave={() => setHoveredColumn("")}>
              Available Credit  <SortIcon orderColumn="AvailableCredit" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "AvailableCredit"}></SortIcon>
            </div>
          ) : label === 'Bill Amount' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('TotalAmount')} onMouseEnter={() => setHoveredColumn("TotalAmount")} onMouseLeave={() => setHoveredColumn("")}>
              Bill Amount <SortIcon orderColumn="TotalAmount" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "TotalAmount"}></SortIcon>
            </div>
          ) : label == 'Payment Status' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PaymentStatusName')} onMouseEnter={() => setHoveredColumn("PaymentStatusName")} onMouseLeave={() => setHoveredColumn("")}>
              Payment Status <SortIcon orderColumn="PaymentStatusName" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "PaymentStatusName"}></SortIcon>
            </div>
          ) : label,
        accessor: label.split(' ').join(''),
        visible: value,
        sortable: false,
        colalign: colalign,
        colStyle: `${columnStyle} !tracking-[0.02em]`,
      }
    })
    const dataVisible = data.filter((h) => h.visible === true)
    const Arr = dataVisible ? dataVisible.map((item) => item) : []
    setColumnListVisible(Arr)
    setHeadersDropdown(data)
  }, [orderBy, hoveredColumn, parsedColumnData])

  // Adding checkboxes before Headers
  useEffect(() => {
    const newArr = billsToPayHeaders && billsToPayHeaders.map((item: any) => {
      if (item?.accessor === 'check') {
        return {
          header: paymentList.length !== 0 && (
            <CheckBox
              id='select-all'
              intermediate={isIntermediate.isEnable}
              checked={isIntermediate.isChecked}
              onChange={(e) => handleSelectAll(e)}
              disabled={paymentList.length === 0}
            />
          ),
          accessor: 'check',
          sortable: false,
          colStyle: '!w-[50px]',
          colalign: 'center',
        }
      } else {
        return item
      }
    })
    setBillsToPayHeaders(newArr)
  }, [isIntermediate])

  // Adding Action Column at the end of Cols
  const columns: any = [
    ...billsToPayHeaders,
    {
      header: (
        <ColumnFilter
          headers={headersDropdown.map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          visibleHeaders={billsToPayHeaders.slice(1).map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          columnId={mapColId}
          getMappingListData={getMappingListData}
          url={savePaymentColumnMapping}
        />
      ),
      accessor: 'action',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[150px]',
    },
  ]

  // Adding checkboxes before Cols
  useEffect(() => {
    let headersSelection: any = []
    Array.from(Array(columnListVisible.length + 1)).forEach((x, i) => {
      if (i === 0) {
        headersSelection = [
          ...headersSelection,
          {
            header: paymentList.length !== 0 && (
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
      } else {
        headersSelection = [...headersSelection, columnListVisible[i - 1]]
      }
    })

    setBillsToPayHeaders(headersSelection)
  }, [columnListVisible])

  // Customizing Table Data
  const tableData = paymentList.map((d: any) => {
    const actionArray = [Number(d.PaymentStatus) === 3 ? "" : 'Mark as Paid', (isBillsToPayEdit && (d.PaymentStatusName == "Unpaid" || Number(d.PaymentStatus) == 3)) && 'Edit Bill', Number(d.PaymentStatus) === 3 ? 'Move to Bills to Pay' : 'Move to Bills on Hold', 'Activities'].filter(Boolean)

    const dueDate = new Date(d.DueDate)
    const today = new Date()
    dueDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const isPastDueDate = dueDate < today

    return {
      ...d,
      check: (
        <CheckBox
          id={`BTP-${d.Id}`}
          checked={isRowSelected(d.Id)}
          onChange={(event: any) => handleRowSelect(event, d.Id, d.PaymentStatus, d.VendorId)}
        />
      ),
      DueDate: (
        <div className='flex items-center w-full justify-between'>
          <span className='!text-sm font-proxima tracking-[0.02em] text-darkCharcoal'>{formatDate(d.DueDate)}</span>
          {isPastDueDate && <span className='h-2 w-2 rounded-full bg-[#DC3545]'></span>}
        </div>
      ),
      BillNumber: (
        <div className='flex w-[135px] justify-between gap-1'>
          <div
            className={`${d.Attachments !== null ? "w-[95px]" : "w-[125px]"}  cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal`}
            onClick={() => {
              router.push(`/payments/billtopay/${d.Id}`)
            }}
          >
            {d.BillNumber?.length > 12 ?
              <BasicTooltip position='right' content={d?.BillNumber} className='!m-0 !p-0 !z-[1]'>
                <label className="!pl-[8px] block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate">
                  {d?.BillNumber}
                </label>
              </BasicTooltip>
              : <label className={`cursor-pointer !pl-[8px] font-proxima text-sm w-full text-darkCharcoal tracking-[0.02em] break-words whitespace-nowrap`}>{d?.BillNumber}</label>}
          </div>
          <div className={`${d.Attachments !== null ? "w-[23px]" : ""} relative flex items-center`}>
            {d.Attachments !== null && (
              <>
                <div className='flex cursor-pointer justify-end' onClick={() => handleOpenAttachFile(d.Id)}>
                  <div className='absolute left-1 -top-2.5'>
                    <Badge badgetype='error' variant='dot' text={d.Attachments.length.toString()} />
                  </div>
                  <AttachIcon />
                </div>

                {isOpenAttchFile && d.Id === rowId[0] && (
                  <div
                    ref={dropdownRef}
                    className='absolute left-[5px] top-5 !z-[4] flex w-[443px] flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md'
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
                            Size: <Typography className='!text-[14px] text-[#333]'>{formatFileSize(e.Size)}</Typography>,
                          })
                      )}
                      sticky
                      hoverEffect
                      getRowId={() => { }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ),
      Vendor: d.VendorName?.length > 27
        ? <div className='w-[170px]'>
          <BasicTooltip position='right' content={d?.VendorName} className='!m-0 !p-0 !z-[1]'>
            <label className="block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate">
              {d?.VendorName}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`font-proxima text-sm w-full text-darkCharcoal tracking-[0.02em]`}>{d?.VendorName}</label>,
      BillDate: <Typography className='!text-sm !text-darkCharcoal !tracking-[0.02em]'>{formatDate(d.BillDate)}</Typography>,
      Remaining: d.RemanningDue && String(d.RemanningDue)?.length > 10
        ? <div className='w-[110px]'>
          <BasicTooltip position='right' content={`$${formatCurrency(d?.RemanningDue)}`} className='!m-0 !p-0 !z-[1]'>
            <label className="!pr-[10px] !font-bold block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate w-full">
              ${formatCurrency(d?.RemanningDue)}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`!pr-[10px] !text-sm !font-bold text-darkCharcoal font-proxima w-full tracking-[0.02em] text-end`}>${formatCurrency(d?.RemanningDue)}</label>,
      AvailableCredit: d.AvailableCredit && String(d.AvailableCredit)?.length > 13
        ? <div className='w-[120px]'>
          <BasicTooltip position='right' content={`$${formatCurrency(d?.AvailableCredit)}`} className='!m-0 !p-0 !z-[1]'>
            <label className="!pr-[10px] !font-bold block cursor-pointer text-sm font-proxima tracking-[0.02em] !text-[#1BB55C] truncate w-full">
              ${formatCurrency(d?.AvailableCredit)}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`!pr-[10px] !text-sm !font-bold !text-[#1BB55C] font-proxima w-full tracking-[0.02em] text-end`}>${formatCurrency(d?.AvailableCredit)}</label>,
      BillAmount: d.TotalAmount && String(d.TotalAmount)?.length > 10
        ? <div className='w-[110px]'>
          <BasicTooltip position='right' content={`$${formatCurrency(d?.TotalAmount)}`} className='!m-0 !p-0 !z-[1]'>
            <label className="!pr-[10px] !font-bold block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate w-full">
              ${formatCurrency(d?.TotalAmount)}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`!pr-[10px] !text-sm !font-bold text-darkCharcoal font-proxima w-full tracking-[0.02em] text-end`}>${formatCurrency(d?.TotalAmount)}</label>,
      PaymentStatus: d.PaymentStatusName?.length > 12
        ? <div className='w-[120px]'>
          <BasicTooltip position='right' content={d?.PaymentStatusName} className='!m-0 !p-0 !z-[1]'>
            <label className="block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate">
              {d?.PaymentStatusName}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`font-proxima text-sm w-full text-darkCharcoal tracking-[0.02em]`}>{d?.PaymentStatusName}</label>,
      Discount: d.Discount && String(d.Discount)?.length > 10
        ? <div className='w-[110px]'>
          <BasicTooltip position='right' content={d?.Discount ?? '-'} className='!m-0 !p-0 !z-[1]'>
            <label className="!font-bold block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate w-full">
              {d?.Discount ?? '-'}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`!text-sm !font-bold text-darkCharcoal font-proxima w-full tracking-[0.02em] text-end`}>{d?.Discount ?? '-'}</label>,
      Location: d.LocationName && d.LocationName?.length > 12
        ? <div className='w-[110px]'>
          <BasicTooltip position='left' content={d?.LocationName} className='!m-0 !p-0 !z-[1]'>
            <label className="block cursor-pointer text-sm font-proxima tracking-[0.02em] text-darkCharcoal truncate">
              {d?.LocationName}
            </label>
          </BasicTooltip>
        </div>
        : <label className={`font-proxima text-sm w-full text-darkCharcoal tracking-[0.02em]`}>{d?.LocationName}</label>,
      action: (
        <div className='flex items-center gap-3'>
          {Number(d.PaymentStatus) !== 3 && (
            <Button
              variant='btn-primary'
              disabled={selectedRows.length > 1}
              className={`flex !h-6 pb-1 items-center rounded-full cursor-pointer font-proxima font-semibold text-sm tracking-[0.02em] ${selectedRows.length > 1 ? 'opacity-30' : ''}`}
              onClick={() => {
                setVendorsId([d.VendorId])
                setIsSingleBillPaymentModalOpen(true)
                setCurrSelectedBillDetails([
                  {
                    VendorId: Number(d.VendorId),
                    AccountPaybleId: d.Id,
                    Amount: d.RemanningDue,
                  },
                ])

                setCurrentPayValue({
                  billNumber: d.BillNumber,
                  billDate: d.BillDate,
                  dueDate: d.DueDate,
                  vendorName: d.VendorName,
                  vendorId: Number(d.VendorId),
                  discount: d.Discount,
                  payAmount: d.TotalAmount,
                  remainingAmount: d.RemanningDue,
                  accountPaybleId: d.Id,
                })
                setRowId([d.Id])
              }}
            >
              PAY
            </Button>
          )}
          <Actions
            id={d.Id}
            amount={d.RemanningDue}
            vendorId={Number(d.VendorId)}
            actions={actionArray}
            Guid={d?.Guid}
            actionRowId={() => handleIdGet(d.Id)}
            handleClick={handleMenuChange}
          />
        </div>
      ),
    }
  })

  useEffect(() => {
    if (isOpenAttchFile) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenAttchFile])


  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-[calc(100vw-78px)] laptop:w-[calc(100vw-78px)] laptopMd:w-[calc(100vw-78px)]' : 'laptop:w-[calc(100vw-180px)] laptopMd:w-[calc(100vw-180px)]')
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    if (selectedRows.length > 0 && paymentList.length === selectedRows.length) {
      setIsIntermediate({
        isEnable: false,
        isChecked: true,
      })
    } else if (selectedRows.length > 1) {
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
  }, [selectedRows, paymentList])

  // For Lazy-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
          getBillsPaymentListData()
          setSelectedRows([])
          setRowId([])
          setSelectRowsStatus([])
          setCurrSelectedBillDetails([])
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
  }, [isLoading, shouldLoadMore, itemsLoaded, tableBottomRef])

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
  }

  const exclamationIconContent = (
    <div className='text-[14px]'>
      <p>Please select a single vendor to send <br />an attachment with payment request!</p>
    </div>
  );

  return (
    <Wrapper>
      {/* Navbar */}
      <div className={`sticky top-0 z-[6] flex !h-[50px] items-center justify-between border-b border-b-lightSilver bg-whiteSmoke sm:px-4 md:px-4 laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5 ${tableDynamicWidth}`}>

        <div className='min-w-fit'>
          <VendorsDropdown key={CompanyId} vendorOption={vendorOptions} />
        </div>
        {selectedRows.length > 1 ? (
          <ul className='flex items-center justify-center h-fit laptopMd:h-7 lg:h-7 xl:h-full'>
            {selectRowsStatus.every((status) => status === 3) ? (
              <li className='h-full place-content-center border-r border-r-lightSilver sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1'>
                <span
                  className='flex cursor-pointer items-center justify-center'
                  onClick={() => setBillsToPayClicked(!isBillsToPayClicked)}
                >
                  <CheckBox
                    id='bills-to-pay'
                    checked={isBillsToPayClicked}
                    onChange={(e) => setBillsToPayClicked(!e.target.checked)}
                  />
                  <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Move to Bills to Pay</label>
                </span>
              </li>
            ) : !selectRowsStatus.includes(3) ? (
              <>
                <li className='h-full place-content-center sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1 sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block'>
                  <span
                    className='flex cursor-pointer items-center justify-center'
                    onClick={() => setMarkAsPaidClicked(!isMarkAsPaidClicked)}
                  >
                    <CheckBox
                      id='mark-as-paid'
                      checked={isMarkAsPaidClicked}
                      onChange={(e) => setMarkAsPaidClicked(!e.target.checked)}
                    />
                    <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Mark as Paid</label>
                  </span>
                </li>
                <span className='w-[2px] h-7 border-r border-lightSilver sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block' />
                <li className='h-full place-content-center sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1 sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block'>
                  <span
                    className='flex cursor-pointer items-center justify-center'
                    onClick={() => setBillOnHoldClicked(!isBillOnHoldClicked)}
                  >
                    <CheckBox
                      id='on-hold'
                      checked={isBillOnHoldClicked}
                      onChange={(e) => setBillOnHoldClicked(!e.target.checked)}
                    />
                    <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Place bills on hold</label>
                  </span>
                </li>
                <span className='w-[2px] h-7 border-r border-lightSilver sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block' />
              </>
            ) : null}
            <li className='flex h-full items-center gap-[5px] sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 pt-[7px] pb-[3px]'>
              <span className='text-sm font-bold font-proxima'>{selectedRows.length}</span>
              <span className='text-sm font-proxima tracking-[0.02em]'>Bills Selected</span>
            </li>
            {!selectRowsStatus.includes(3) && (
              <>
                <li className='flex h-7 items-center gap-[5px] border-x border-lightSilver pt-[6px] pb-[4px] sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5'>
                  <Tooltip
                    className='!z-[8] !px-0 !py-2'
                    position='bottom'
                    content={exclamationIconContent}
                  >
                    <ExclamationIcon />
                  </Tooltip>
                  <span className='text-sm font-proxima tracking-[0.02em] pl-1.5 pt-0.5'>Amount to pay:</span>
                  <span className='text-sm font-proxima tracking-[0.02em] pt-1 font-bold'>${(totalAmountToPay).toFixed(2)}</span>
                </li>
                <li className='h-full mt-[5px] flex items-center sm:pl-3 md:pl-3 laptop:pl-3 laptopMd:pl-3 lg:pl-3 xl:pl-3 hd:pl-5 2xl:pl-5 3xl:pl-5'>
                  <Button
                    variant='btn-primary'
                    className='h-6 flex items-center justify-center rounded-full text-sm font-semibold px-5 pb-1 !font-proxima'
                    onClick={() => {
                      vendorsId.length === 1
                        ? setIsSingleVendorMultipleBillPayModalOpen(true)
                        : setIsMultipleVendorMultipleBillPayModalOpen(true)
                    }}>
                    PAY BILLS
                  </Button>
                </li>
              </>
            )}
          </ul>
        ) : (<>
          <div className='w-full h-full flex justify-end items-center laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
            <div className='h-full flex justify-center items-center' onClick={() => setFilterClicked(true)}>
              <Tooltip position='bottom' content='Filter' className='!px-0 !pb-1.5 !font-proxima !text-sm !z-[6]'>
                <FilterIcon />
              </Tooltip>
            </div>
            <div className='flex justify-center items-center pt-2 h-full' onClick={() => router.push('/payments/billtopay/aging')}>
              <Tooltip position='bottom' content='Payment Aging' className='!px-0 !pb-2.5 !font-proxima !text-sm !z-[6]'>
                <PaymentAgingIcon />
              </Tooltip>
            </div>
            <div className='flex justify-center items-center h-full pt-0.5'>
              <Download url={`${process.env.API_BILLSTOPAY}/payment/getlist`} params={getPaymentListParams} fileName='Bills_To_Pay' />
            </div>
          </div>
        </>
        )}
      </div>
      {(selectedRows.length > 1 && !selectRowsStatus.includes(3)) ? (
        <div className='flex items-center justify-end mr-5 sm:h-16 md:h-16 laptop:h-16 laptopMd:h-16 lg:h-16 xl:h-0 2xl:h-0'>
          <div className='h-7 place-content-center px-3 py-1 sm:block md:block laptop:block laptopMd:block lg:block xl:hidden 2xl:hidden'>
            <span
              className='flex cursor-pointer items-center justify-center gap-2'
              onClick={() => setMarkAsPaidClicked(!isMarkAsPaidClicked)}
            >
              <CheckBox
                id='mark-as-paid'
                checked={isMarkAsPaidClicked}
                onChange={(e) => setMarkAsPaidClicked(!e.target.checked)}
              />
              <label className='cursor-pointer text-sm'>Mark as Paid</label>
            </span>
          </div>
          <div className='h-7 place-content-center border-l border-lightSilver px-3 py-1 sm:block md:block laptop:block laptopMd:block lg:block xl:hidden 2xl:hidden'>
            <span
              className='flex cursor-pointer items-center justify-center gap-2'
              onClick={() => setBillOnHoldClicked(!isBillOnHoldClicked)}
            >
              <CheckBox
                id='on-hold'
                checked={isBillOnHoldClicked}
                onChange={(e) => setBillOnHoldClicked(!e.target.checked)}
              />
              <label className='cursor-pointer text-sm'>Place bills on hold</label>
            </span>
          </div>
        </div>) : ""}
      {/* Data Table */}
      <div className={`custom-scroll h-[calc(100vh-112px)] overflow-auto ${tableDynamicWidth}`}>
        <div className={`${paymentList.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            columns={columns}
            data={paymentList.length > 0 ? tableData : []}
            hoverEffect={true}
            sticky
            zIndex={5}
            getExpandableData={() => { }}
            getRowId={() => { }}
            isTableLayoutFixed
          />
          {isLoading && loaderCounter === 1 && checkLoader && <Loader size='sm' helperText />}
          <div ref={tableBottomRef} />
        </div>
        {/* <DataLoadingStatus isLoading={isLoading} data={paymentList} /> */}
        {paymentList.length === 0 ? (
          isLoading ?
            <div className='flex h-[calc(94vh-150px)] w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div>
            : <div className='flex h-[44px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
        ) : ''}
      </div>

      {isFileModal && ['pdf'].includes(isFileRecord.FileName.split('.').pop().toLowerCase()) && (
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

      <ActivityDrawer
        noCommentBox={false}
        isOpen={isVisibleActivities}
        onClose={() => setIsVisibleActivities(false)}
        GUID={isGuid}
        selectedPayableId={selectedPayableId}
      />
      <DrawerOverlay isOpen={isVisibleActivities} />

      {/* Modal for paying single bill */}
      {isSingleBillPaymentModalOpen && <SinglePaymentDetailsModal
        onOpen={isSingleBillPaymentModalOpen}
        onClose={handleClosePayBillModal}
        currentValues={currentPayValue || 0}
        onDataFetch={() => getBillsPaymentListData(1)}
      />}

      {/* Modal for paying single vendor multiple bill */}
      {isSingleVendorMultipleBillPayModalOpen && <SingleVendorMultiplePaymentDetailsModal
        onOpen={isSingleVendorMultipleBillPayModalOpen}
        onClose={handleClosePayBillModal}
        vendorId={vendorsId}
        totalAmountToPay={totalAmountToPay}
        selectedAccountPayableIds={selectedRows}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={() => getBillsPaymentListData(1)}
      />}

      {/* Modal for paying multiple vendor multiple bill */}
      {isMultipleVendorMultipleBillPayModalOpen && <MultipleVendorMultiplePaymentDetailsModal
        onOpen={isMultipleVendorMultipleBillPayModalOpen}
        onClose={handleClosePayBillModal}
        vendorsId={vendorsId}
        vendorOptions={vendorOptions}
        totalAmountToPay={totalAmountToPay}
        selectedAccountPayableIds={selectedRows}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={() => getBillsPaymentListData(1)}
      />}

      {/* Modal for moving a bill on hold. */}
      <BillsOnHoldModal
        onOpen={isBillOnHoldClicked}
        onClose={handleModalClose}
        selectedRowIds={rowId.length > 0 ? rowId : selectedRows}
        onDataFetch={() => getBillsPaymentListData(1)}
      />

      {/* Payment Details Modal when clicking on Mark as Paid */}
      <MarkAsPaidModal
        onOpen={isMarkAsPaidClicked}
        onClose={handleCloseMarkAsPaidModal}
        selectedRowIds={rowId.length > 0 ? rowId : selectedRows}
        onDataFetch={() => getBillsPaymentListData(1)}
        selectedBillDetails={currSelectedBillDetails}
      />

      {/* Modal for move the bills from on hold to - to pay */}
      <MoveBillsToPayModals
        onOpen={isBillsToPayClicked}
        onClose={handleMoveBillsToPayModalClose}
        selectedRowIds={rowId.length > 0 ? rowId : selectedRows}
        onDataFetch={() => getBillsPaymentListData(1)}
      />

      {/* Filter Modal */}
      <FilterModal onOpen={isFilterClicked} onClose={handleFilterClose} />
    </Wrapper>
  )
}

export default ListBillsToPay