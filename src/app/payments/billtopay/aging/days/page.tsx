'use client'

import { BlobServiceClient } from '@azure/storage-blob'
import { usePathname, useRouter } from 'next/navigation'
import { Badge, Button, CheckBox, DataTable, Loader, Toast, Tooltip, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'

// Common components
import FileModal from '@/app/bills/__components/FileModal'
import Actions from '@/components/Common/DatatableActions/DatatableActions'
import Wrapper from '@/components/Common/Wrapper'
import AgingDaysDropdown from '../../components/dropdowns/AgingDaysDropdown'
import BillsOnHoldModal from '../../components/modals/BillsOnHoldModal'
import MarkAsPaidModal from '../../components/modals/MarkAsPaidModal'
import MoveBillsToPayModals from '../../components/modals/MoveBillsToPayModal'

// Icons
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import BackArrow from '@/assets/Icons/payments/BackArrow'
import ExclamationIcon from '@/assets/Icons/payments/ExclamationIcon'

// Store
import ColumnFilter from '@/components/Common/Custom/ColumnFilter'
import Download from '@/components/Common/Custom/Download'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setSelectedStatus, vendorDropdown } from '@/store/features/bills/billSlice'
import {
  getPaymentColumnMapping,
  paymentGetList,
  savePaymentColumnMapping,
  setCurrentPath,
  setEndDay,
  setStartDay,
} from '@/store/features/billsToPay/billsToPaySlice'

import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'
import { useSession } from 'next-auth/react'
import MultipleVendorMultiplePaymentDetailsModal from '../../components/payment-details/MultipleVendorMultiplePaymentDetailsModal'
import SinglePaymentDetailsModal from '../../components/payment-details/SinglePaymentDetailsModal'
import SingleVendorMultiplePaymentDetailsModal from '../../components/payment-details/SingleVendorMultiplePaymentDetailsModal'
import { storageConfig } from '@/components/Common/pdfviewer/config'
import SortIcon from '@/assets/Icons/SortIcon'

const PaymentAgingDays: React.FC = () => {
  const UserId = localStorage.getItem('UserId')

  const [isSingleBillPaymentModalOpen, setIsSingleBillPaymentModalOpen] = useState<boolean>(false)
  const [isSingleVendorMultipleBillPayModalOpen, setIsSingleVendorMultipleBillPayModalOpen] = useState<boolean>(false)
  const [isMultipleVendorMultipleBillPayModalOpen, setIsMultipleVendorMultipleBillPayModalOpen] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedRows, setSelectedRows] = useState<any>([])
  const [selectRowsStatus, setSelectRowsStatus] = useState<number[]>([])
  const [currentFilterLabel, setCurrentFilterLabel] = useState('')
  const [currentFilterValue, setCurrentFilterValue] = useState('')
  const [rowId, setRowId] = useState<number[]>([])
  const [isBillOnHoldClicked, setBillOnHoldClicked] = useState<boolean>(false)
  const [isMarkAsPaidClicked, setMarkAsPaidClicked] = useState<boolean>(false)
  const [isBillsToPayClicked, setBillsToPayClicked] = useState<boolean>(false)
  const [totalAmountToPay, setTotalAmountToPay] = useState<number>(0)
  const [dataList, setDataList] = useState<any[]>([])
  const [tableDynamicWidth, setTableDynamicWidth] = useState('w-full laptop:w-[calc(100vw-200px)]')
  const [currSelectedBillDetails, setCurrSelectedBillDetails] = useState<any[]>([])
  const [headersDropdown, setHeadersDropdown] = useState<any>([])
  const [columnListVisible, setColumnListVisible] = useState<any>([])
  const [billsToPayHeaders, setBillsToPayHeaders] = useState<any>([])
  const [mapColId, setMapColId] = useState(-1)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [fileBlob, setFileBlob] = useState<any>('')
  const [PDFUrl, setPDFUrl] = useState<any>('')
  const [isFileModal, setFileModal] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)

  const [orderBy, setOrderBy] = useState<number | null>()
  const [orderColumnName, setOrderColumnName] = useState<string | null>('DueDate')
  const [hoveredColumn, setHoveredColumn] = useState<string>("");
  const [parsedColumnData, setParsedColumnData] = useState<any>([])

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

  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [loaderCounter, setLoaderCounter] = useState(0)
  const [apiDataCount, setApiDataCount] = useState(0)
  const [checkLoader, setCheckLoader] = useState(true)

  const router = useRouter()
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const [vendorsId, setVendorsId] = useState<any[]>([])
  const billsToPayReducer = useAppSelector((state) => state.billsToPayReducer)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const [vendorOptions, setVendorOptions] = useState<any>([])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const tableBottomRef = useRef<HTMLDivElement>(null)
  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1
  const lazyRows = 70
  let nextPageIndex: number = 1

  const getAgingDaysPaymentListParams = {
    CompanyId: CompanyId,
    LocationIds: null,
    VendorIds: billsToPayReducer.vendorIdList,
    Status: ["1", "2", "3", "4"],
    StartDay: billsToPayReducer.startDay,
    EndDay: billsToPayReducer.endDay,
    StartDate: null,
    EndDate: null,
    AgingFilter: billsToPayReducer.agingFilter,
    // OrderColumn: lastClickedColumn.trim().length > 0 ? lastClickedColumn.trim() : null,
    // OrderBy: sortableFields[lastClickedColumn] ? 1 : 0,
    OrderColumn: 'DueDate',
    OrderBy: 0,
    PageSize: lazyRows,
    // PageNumber: pageIndex || nextPageIndex,
  }

  const handleModalClose = () => {
    setBillOnHoldClicked(false)
    setRowId([])
  }

  const handleClosePayBillModal = () => {
    localStorage.removeItem('billAmount')
    localStorage.removeItem('availCredits')
    localStorage.removeItem('PartialPaymentDataList')
    localStorage.removeItem('CreditData')
    setIsSingleBillPaymentModalOpen(false)
    setIsSingleVendorMultipleBillPayModalOpen(false)
    setIsMultipleVendorMultipleBillPayModalOpen(false)
    setRowId([])
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

  const handleFilterChange = (actionLabel: string, actionValue: string) => {
    setCurrentFilterLabel(actionLabel)
    setCurrentFilterValue(actionValue)
  }

  // Function to calculate the total AmountToPay for selected rows
  const calculateTotalAmountToPay = (selectedRows: any[]) => {
    let totalAmountToPay = 0

    selectedRows.forEach((selectedId) => {
      const selectedRow = dataList.find((row) => row.Id === selectedId)
      if (selectedRow) {
        totalAmountToPay += selectedRow.RemanningDue
      }
    })

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

      const selectedBillDetails = dataList.map((row: any) => ({
        VendorId: row.VendorId,
        AccountPaybleId: row.Id,
        Amount: row.RemanningDue,
      }))

      setCurrSelectedBillDetails(selectedBillDetails)

      const selectedStatus = dataList.map((row: any) => Number(row.PaymentStatus))
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
  const handleRowSelect = (event: any, id: any, statusId: any) => {
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

      const selectedBillDetails = dataList
        .filter((row: any) => newSelected.includes(row.Id))
        .map((row: any) => ({
          VendorId: row.VendorId,
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

  const actionArray = ['Mark as Paid', 'Edit Bill', 'Move to Bills on Hold']
  const actionArrForOnHold = ['Edit Bill', 'Move to Bills to Pay']

  // when user click on action icon set a id
  const handleIdGet = (id: number) => {
    setRowId([id])
  }

  const handleMenuChange = (actionName: string, id: number) => {
    switch (actionName) {
      case 'Mark as Paid':
        setMarkAsPaidClicked(true)
        break
      case 'Edit Bill':
        router.push(`/payments/billtopay/edit/${id}`)
        dispatch(setSelectedStatus(0))
        break
      case 'Move to Bills on Hold':
        setBillOnHoldClicked(true)
        break
      default:
        break
    }
  }

  const handleMenuChangeForOnHold = (actionName: string, id: number) => {
    switch (actionName) {
      case 'Edit Bill':
        router.push(`/payments/billtopay/edit/${id}`)
        dispatch(setSelectedStatus(0))
        break
      case 'Move to Bills to Pay':
        setBillsToPayClicked(true)
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (selectedRows.length > 0 && dataList.length === selectedRows.length) {
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
  }, [selectedRows])

  useEffect(() => {
    // Update the reducer values based on label
    if (currentFilterLabel === '00-30 Days') {
      dispatch(setStartDay(0))
      dispatch(setEndDay(30))
    } else if (currentFilterLabel === '31-60 Days') {
      dispatch(setStartDay(31))
      dispatch(setEndDay(60))
    } else if (currentFilterLabel === '61-90 Days') {
      dispatch(setStartDay(61))
      dispatch(setEndDay(90))
    } else if (currentFilterLabel === '90+ Days') {
      dispatch(setStartDay(91))
      dispatch(setEndDay(null))
    }
  }, [currentFilterLabel, billsToPayReducer.startDay, billsToPayReducer.endDay])

  useEffect(() => {
    getBillsPaymentListData(1)
  }, [orderBy, billsToPayReducer.startDay, billsToPayReducer.endDay, billsToPayReducer.agingFilter, billsToPayReducer.vendorIdList, billsToPayReducer.filterFormFields, CompanyId])

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

  // getList API
  const getBillsPaymentListData = async (pageIndex?: number) => {
    setIsLoading(true)

    if (pageIndex === 1) {
      setDataList([])
      setItemsLoaded(0)
    }

    const params = {
      ...getAgingDaysPaymentListParams,
      OrderColumn: orderColumnName ?? '',
      OrderBy: orderBy ?? 0,
      PageNumber: pageIndex || nextPageIndex,
      IsDownload: false,
    }

    try {
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
            updatedData = [...newList]
          }
          setDataList(updatedData)
          setItemsLoaded(updatedData.length)
          setIsLoading(false)

          if (itemsLoaded >= newTotalCount) {
            setShouldLoadMore(false)
          }
        } else {
          handleErrorResponse(dataMessage)
        }
      } else {
        handleStatusErrorResponse(payload)
      }
    } catch (error) {
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
      UserId: Number(UserId),
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
          columnStyle = '!w-[140px]'
          break
        case 'Bill Number':
          columnStyle = '!w-[150px]'
          break
        case 'Vendor':
          columnStyle = '!w-[180px]'
          colalign = 'left'
          break
        case 'Remaining':
          columnStyle = '!w-[160px]'
          colalign = 'right'
          break
        case 'Available Credit':
          columnStyle = '!w-[180px]'
          colalign = 'right'
          break
        case 'Bill Amount':
          columnStyle = '!w-[140px] !pr-[10px]'
          colalign = 'right'
          break
        case 'Payment Status':
          columnStyle = '!w-[140px]'
          break
        case 'Discount':
          columnStyle = '!w-[140px]'
          colalign = 'right'
          break
        case 'Location':
          columnStyle = '!w-[140px]'
          colalign = 'right'
          break
        case 'Bill Date':
          columnStyle = '!w-[100px]'
          break
        default:
          break
      }
      return {
        header:
          label === 'Due Date' ? (
            <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('DueDate')} onMouseEnter={() => setHoveredColumn("DueDate")} onMouseLeave={() => setHoveredColumn("")}>
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
    const newArr =
      billsToPayHeaders &&
      billsToPayHeaders.map((item: any) => {
        if (item?.accessor === 'check') {
          return {
            header: dataList.length !== 0 && (
              <CheckBox
                id='ad-select-all'
                intermediate={isIntermediate.isEnable}
                checked={isIntermediate.isChecked}
                onChange={(e) => handleSelectAll(e)}
                disabled={dataList.length === 0}
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
        headersDropdown.length > 0 ? <ColumnFilter
          headers={headersDropdown.map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          visibleHeaders={billsToPayHeaders.slice(1).map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          columnId={mapColId}
          getMappingListData={getMappingListData}
          url={savePaymentColumnMapping}
        /> : ""
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
          },
        ]
      } else {
        headersSelection = [...headersSelection, columnListVisible[i - 1]]
      }
    })

    setBillsToPayHeaders(headersSelection)
  }, [columnListVisible])

  // Customizing Table Data
  const tableData = dataList.map((d: any) => {
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
          onChange={(event: any) => handleRowSelect(event, d.Id, d.PaymentStatus)}
        />
      ),
      DueDate: (
        <div className='flex items-center gap-4'>
          <span className='!text-sm'>{formatDate(d.DueDate)}</span>
          {isPastDueDate && <span className='h-2 w-2 rounded-full bg-[#DC3545]'></span>}
        </div>
      ),
      BillNumber: (
        <div className='flex w-28 justify-between'>
          <div
            className='mr-5 cursor-pointer text-sm'
            onClick={() => {
              router.push(`/payments/billtopay/${d.Id}`)
            }}
          >
            {d.BillNumber?.length > 8 ? d.BillNumber.substring(0, 8) + '...' : d?.BillNumber}
          </div>
          <div className='relative flex items-center'>
            {d.Attachments !== null && (
              <>
                <span className='absolute -top-2.5 left-1'>
                  <Badge badgetype='error' variant='dot' text={d.Attachments?.length.toString()} />
                </span>
                <span className='cursor-pointer' onClick={() => handleOpenAttachFile(d.Id)}>
                  <AttachIcon />
                </span>

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
      Vendor:
        d.VendorName?.length > (billsToPayHeaders.length < 7 ? 30 : 19) ? (
          <Tooltip position='right' content={d.VendorName} className='!m-0 !p-0'>
            <label
              className='cursor-pointer'
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {d?.VendorName}
            </label>
          </Tooltip>
        ) : (
          <label className='font-proxima text-sm'>{d?.VendorName}</label>
        ),
      Remaining: (
        <Typography className='!pr-[15px] !text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d?.RemanningDue)}</Typography>
      ),
      AvailableCredit: (
        <Typography className='!pr-[10px] !text-sm !font-bold !text-[#1BB55C]'>${formatCurrency(d.AvailableCredit)}</Typography>
      ),
      BillAmount: <span className='!pr-[15px] !text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d?.TotalAmount)}</span>,
      PaymentStatus: <Typography className='!text-sm'>{d?.PaymentStatusName}</Typography>,
      Discount: <Typography className='!text-sm'>{d?.Discount ?? '-'}</Typography>,
      BillDate: <Typography className='!text-sm'>{formatDate(d?.BillDate)}</Typography>,
      Location: <Typography className='!text-sm'>{d?.LocationName}</Typography>,
      action: (
        <div className='flex items-center gap-3'>
          {Number(d.PaymentStatus) !== 3 && (
            <Button
              variant='btn-primary'
              disabled={selectedRows.length > 1}
              className={`flex !h-6 pb-1 items-center rounded-full cursor-pointer font-proxima font-semibold text-sm tracking-[0.02em] ${selectedRows.length > 1 ? 'opacity-30' : ''}`}
              onClick={() => {
                setIsSingleBillPaymentModalOpen(true)

                setCurrSelectedBillDetails([
                  {
                    VendorId: d.VendorId,
                    AccountPaybleId: d.Id,
                    Amount: d.RemanningDue,
                  },
                ])

                setCurrentPayValue({
                  billNumber: d.BillNumber,
                  billDate: d.BillDate,
                  dueDate: d.DueDate,
                  vendorName: d.VendorName,
                  vendorId: d.VendorId,
                  discount: d.Discount,
                  payAmount: d.AmountToPay,
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
            menuClassName='200px'
            id={d.Id}
            actions={Number(d.PaymentStatus) === 3 ? actionArrForOnHold : actionArray}
            actionRowId={() => handleIdGet(d.Id)}
            handleClick={Number(d.PaymentStatus) === 3 ? handleMenuChangeForOnHold : handleMenuChange}
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
    if (selectedRows.length > 0 && dataList.length === selectedRows.length) {
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
  }, [selectedRows, dataList])

  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-full laptop:w-[calc(100vw-85px)]' : 'w-full laptop:w-[calc(100vw-200px)]')
  }, [isLeftSidebarCollapsed])

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

  const getAllVendorOptions = () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
      setVendorOptions(responseData)
    })
  }

  useEffect(() => {
    getAllVendorOptions()
  }, [CompanyId])

  return (
    <Wrapper>
      {/* Navbar */}
      <div className='sticky top-0 z-[6]'>
        <div className='flex !h-[50px] items-center justify-between bg-lightGray sm:px-4 md:px-4 laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
          <div className='flex items-center gap-1'>
            <span
              className='cursor-pointer'
              onClick={() => {
                router.push('/payments/billtopay/aging')
              }}
            >
              <BackArrow />
            </span>

            {/* Days filter dropdown */}
            <AgingDaysDropdown label={`${currentFilterLabel} | ${currentFilterValue} bills`} handleClick={handleFilterChange} />
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
                      className='!z-[8] !p-0'
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
                      className='flex h-7 sm:h-7 md:h-7 laptop:h-7 laptopMd:h-7 lg:h-9 xl:h-7 items-center justify-center rounded-full text-sm font-bold sm:!px-4 md:!px-4 laptop:!px-4 laptopMd:!px-4 lg:!px-4 xl:!px-4 hd:!px-5 2xl:!px-5 3xl:!px-5 !pt-[8px] !font-proxima'
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
          ) : (
            <div className='flex justify-center items-center mt-1'>
              <Download url={`${process.env.API_BILLSTOPAY}/payment/getlist`} params={getAgingDaysPaymentListParams} fileName='Bills_To_Pay' />
            </div>
          )}
        </div>
      </div>

      {(selectedRows.length > 1 && !selectRowsStatus.includes(3)) ? (
        <div className='bg-lightGray flex items-center justify-end mr-5 sm:h-16 md:h-16 laptop:h-16 laptopMd:h-16 lg:h-[66px] xl:h-0 2xl:h-0'>
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

      {/* Datatable */}
      <div className={`custom-scroll h-[calc(100vh-128px)] approvalMain overflow-auto ${tableDynamicWidth}`}>
        <div className={`mainTable ${dataList.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            columns={columns}
            data={dataList.length > 0 ? tableData : []}
            hoverEffect={true}
            sticky
            getRowId={() => { }}
            getExpandableData={() => { }}
            isTableLayoutFixed
          />
          {isLoading && loaderCounter === 1 && checkLoader && <Loader size='sm' helperText />}
          <div ref={tableBottomRef} />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={dataList} />
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
          isPdfLoading={isPdfLoading}
          openInNewWindow={openInNewWindow}
        />
      )}

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
    </Wrapper>
  )
}

export default PaymentAgingDays