'use client'

import FileModal from '@/app/bills/__components/FileModal'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import SortIcon from '@/assets/Icons/SortIcon'
import ActivityIcon from '@/assets/Icons/billposting/ActivityIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import ColumnFilter from '@/components/Common/Custom/ColumnFilter'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import usePdfViewer from '@/components/Common/pdfviewer/pdfViewer'
import { FileRecordType } from '@/models/billPosting'
import { BillListItem, Option, StatusListData } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { getPaymentStatusColumnMapping, paymentStatusDropdown, paymentStatusGetList, savePaymentStatusColumnMapping, setCancelPayment, setStatusIdList } from '@/store/features/paymentstatus/paymentStatusSlice'
import { vendorDropdownList } from '@/store/features/vendor/vendorSlice'
import { convertStringsDateToUTC } from '@/utils'
import { Badge, Breadcrumb, Button, DataTable, Loader, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import Status from '../dropdown/Status'
import Filter from '../modal/Filter'
import PaymentInfoIcon from '@/assets/Icons/PaymentInfoIcon'
import Download from '../dropdown/Download'
import RowDownload from '@/components/Common/Custom/Download'

const ListPaymentStatus: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { selectedCompany } = useAppSelector((state) => state.user)
  const { filterFields, statusIdList } = useAppSelector((state) => state.paymentStatus)
  const CompanyId = selectedCompany?.value
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { showPDFViewerModal, PDFUrl, setPDFUrl, fileBlob, isPdfLoading } = usePdfViewer()

  const userId = localStorage.getItem('UserId')
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedRowId, setSelectedRowId] = useState<number>(0)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [isFileModal, setFileModal] = useState(false)
  const [isFileRecord, setIsFileRecord] = useState<FileRecordType>({ FileName: '', PageCount: '', BillNumber: '' })
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)

  const [mapColId, setMapColId] = useState<number>(-1)
  const [orderBy, setOrderBy] = useState<number | null>(1)
  const [orderColumnName, setOrderColumnName] = useState<string | null>(null)
  const [headersDropdown, setHeadersDropdown] = useState<Object[]>([])
  const [paymentStatusHeaders, setPaymentStatusHeaders] = useState<Object[]>([])
  const [paymentStatusList, setPaymentStatusList] = useState<BillListItem[]>([])
  const [paymentDetailsList, setPaymentDetailsList] = useState<any[]>([])
  const [vendor, setVendor] = useState<string>('')
  const [isOpenDetailsView, setOpenDetailsView] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)
  const [columnListVisible, setColumnListVisible] = useState<Object[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false)
  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-200px)]')
  const [cancelPaymentId, setCancelPaymentId] = useState<number>(0)

  const [statusList, setStatusList] = useState<StatusListData[]>([])
  const [locationOption, setLocationOption] = useState<Option[]>([])
  const [vendorOption, setVendorOption] = useState<Option[]>([])
  const [paymentMethodOption, setPaymentMethodOption] = useState<Option[]>([])
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [selectedPayableId, setSelectedPayableId] = useState<number | null>(null)
  const [isInfoTextVisible, setIsInfoTextVisible] = useState<boolean>(false)
  const [isDownloadClicked, setIsDownloadClicked] = useState<boolean>(false)

  const [sortOrders, setSortOrders] = useState<{ [key: string]: null | 'asc' | 'desc' }>({
    Bills: null,
    Amount: null,
    PaymentDate: null,
    PaymentMethod: null,
    Vendor: null,
    AvailCredit: null,
    Status: null,
  })

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  let nextPageIndex: number = 1
  const lazyRows: number = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  // Nested Data Columns
  const nestedColumns: any = [
    {
      header: 'BILL NUMBER',
      accessor: 'BillNumber',
      colalign: 'left',
      colStyle: '!tracking-[0.02em] !w-[190px]',
    },
    {
      header: 'DUE DATE',
      accessor: 'DueDate',
      colStyle: '!tracking-[0.02em] !w-[100px]',
    },
    {
      header: 'REMAINING AMOUNT',
      accessor: 'RemainingAmount',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[150px]',
    },
    {
      header: 'BILL STATUS',
      accessor: 'BillStatus',
      colStyle: '!tracking-[0.02em] !w-[100px]',
    },
    {
      header: 'BILL AMOUNT',
      accessor: 'BillAmount',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[140px]',
    },
    {
      header: 'SELECTED FOR PAYMENT',
      accessor: 'SelectedForPayment',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[180px]',
    },
    {
      header: 'AVAILED CREDIT',
      accessor: 'AvailCredit',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[150px]',
    },
    {
      header: 'DISCOUNT',
      accessor: 'Discount',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[150px]',
    },
    {
      header: 'PAYABLE AMOUNT',
      accessor: 'PayableAmount',
      colalign: 'right',
      colStyle: '!tracking-[0.02em] !w-[150px]',
    },
    {
      header: '',
      accessor: 'Actions',
      colalign: 'right',
      colStyle: '!w-[80px] !pr-[15px]',
    },
  ]

  const baseParams = {
    CompanyId: parseInt(CompanyId),
    LocationIds: filterFields?.LocationIds ?? [],
    VendorIds: filterFields?.VendorIds ?? [],
    Status: statusIdList ?? [],
    StartDate:
      typeof filterFields?.StartDate === 'string' && filterFields?.StartDate.length === 0
        ? null
        : typeof filterFields?.StartDate === 'string'
          ? convertStringsDateToUTC(filterFields?.StartDate.trim())
          : null,
    EndDate:
      typeof filterFields?.EndDate === 'string' && filterFields?.EndDate.length === 0
        ? null
        : typeof filterFields?.EndDate === 'string'
          ? convertStringsDateToUTC(filterFields?.EndDate.trim())
          : null,
    PaymentMethod: filterFields?.PaymentMethod.map(Number) ?? [],
    OrderColumn: '',
    OrderBy: 0,
  }

  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-full laptop:w-[calc(100vw-85px)]' : 'w-full laptop:w-[calc(100vw-200px)]')
  }, [isLeftSidebarCollapsed])

  const handleColumnFilter = () => {
    const filteredColumns = columnListVisible.filter((column) => column !== undefined)
    setPaymentStatusHeaders(filteredColumns)
  }

  useEffect(() => {
    handleColumnFilter()
  }, [columnListVisible, paymentStatusList])

  //Status List API
  const getAllStatusList = () => {
    performApiAction(dispatch, paymentStatusDropdown, null, (responseData: any) => {
      setStatusList(responseData)
      const allValues = responseData.map((option: any) => option.value);
      statusIdList.length == 0 && dispatch(setStatusIdList(allValues))
    })
  }

  useEffect(() => {
    getAllStatusList()
  }, [])

  //Location Dropdown List API
  const getLocationDropdownList = () => {
    const params = {
      CompanyId: parseInt(CompanyId),
      IsActive: true,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      setLocationOption(responseData)
    })
  }

  //Vendor Dropdown List API
  const getVendorDropdownList = () => {
    const params = {
      CompanyId: parseInt(CompanyId),
      IsActive: true,
    }
    performApiAction(dispatch, vendorDropdownList, params, (responseData: any) => {
      setVendorOption(responseData)
    })
  }

  //Payment Method Dropdown List API
  const getPaymentMethodDropdownList = () => {
    performApiAction(dispatch, getPaymentMethods, null, (responseData: any) => {
      setPaymentMethodOption(responseData)
    })
  }

  //Payment Status List API
  const getPaymentStatusList = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setPaymentStatusList([])
      setItemsLoaded(0)
      setIsLoading(true)
    }
    try {
      setIsLazyLoading(true)
      const params: any = {
        ...baseParams,
        OrderColumn: orderColumnName ?? '',
        OrderBy: orderBy,
        PageNumber: pageIndex || nextPageIndex,
        PageSize: lazyRows,
        IsDownload: false,
        ExportType: 0,
      }
      const { payload, meta } = await dispatch(paymentStatusGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
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
            updatedData = [...paymentStatusList, ...newList]
          }
          setPaymentStatusList(updatedData)
          setItemsLoaded(updatedData.length)
          setIsLoading(false)
          setIsLazyLoading(false)

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

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
          getPaymentStatusList()
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

  // Get Column List For DataTable
  const getMappingListData = () => {
    const params = {
      UserId: parseInt(userId!),
    }
    performApiAction(dispatch, getPaymentStatusColumnMapping, params, (responseData: any) => {
      setMapColId(responseData?.Id)
      const obj = JSON.parse(responseData?.ColumnList)
      const data = Object.entries(obj).map(([label, value]) => {
        let columnStyle = ''
        let colalign = ''
        switch (label) {
          case 'Bills':
            columnStyle = '!w-[120px]'
            break
          case 'Payment Date':
            columnStyle = '!w-[150px]'
            break
          case 'Vendor':
            columnStyle = '!w-[170px]'
            break
          case 'Transaction Status':
            columnStyle = '!w-[200px]'
            break
          case 'Payment Method':
            columnStyle = '!w-[160px]'
            colalign = 'left'
            break
          case 'Total Bill Amount':
            columnStyle = '!w-[180px]'
            colalign = 'right'
            break
          case 'Selected for Payment':
            columnStyle = '!w-[230px]'
            colalign = 'right'
            break
          case 'Avail Credit':
            columnStyle = '!w-[180px]'
            colalign = 'right'
            break
          case 'Total Payable':
            columnStyle = '!w-[180px]'
            colalign = 'right'
            break
          default:
            break
        }

        return {
          header:
            label === 'Bills' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Bills')}>
                Bills <SortIcon order={sortOrders['Bills']}></SortIcon>
              </div>
            ) : label === 'Avail Credit' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('AvailCredit')}>
                Availed Credit <SortIcon order={sortOrders['AvailCredit']}></SortIcon>
              </div>
            ) : label === 'Payment Date' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PaymentDate')}>
                Payment Date <SortIcon order={sortOrders['PaymentDate']}></SortIcon>
              </div>
            ) : label === 'Vendor' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Vendor')}>
                Vendor <SortIcon order={sortOrders['Vendor']}></SortIcon>
              </div>
            ) : label === 'Transaction Status' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('TransactionStatus')}>
                Transaction Status <SortIcon order={sortOrders['TransactionStatus']}></SortIcon>
              </div>
            ) : label == 'Total Bill Amount' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('TotalBillAmount')}>
                Total Bill Amount  <SortIcon order={sortOrders['TotalBillAmount']}></SortIcon>
              </div>
            ) : label === 'Payment Method' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PaymentMethod')}>
                Payment Method <SortIcon order={sortOrders['PaymentMethod']}></SortIcon>
              </div>
            ) : label == 'Selected for Payment' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('SelectedForPayment')}>
                Selected for Payment <SortIcon order={sortOrders['SelectedForPayment']}></SortIcon>
              </div>
            ) : label == 'Total Payable' ? (
              <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('TotalPayable')}>
                Total Payable <SortIcon order={sortOrders['TotalPayable']}></SortIcon>
              </div>
            ) : label,
          accessor: label.split(' ').join(''),
          visible: value,
          sortable: false,
          colalign: colalign,
          colStyle: `${columnStyle} !tracking-[0.02em] !uppercase`,
        }
      })
      const dataVisible = data.filter((h) => h.visible === true)
      const Arr = dataVisible ? dataVisible.map((item) => item) : []
      setColumnListVisible(Arr)
      setHeadersDropdown(data)
    })
  }

  useEffect(() => {
    getPaymentStatusList(1)
  }, [refreshTable, statusIdList, CompanyId, filterFields, orderBy])

  useEffect(() => {
    if (CompanyId) {
      getMappingListData()
      getLocationDropdownList()
      getVendorDropdownList()
      getPaymentMethodDropdownList()
    }
  }, [CompanyId])

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
      case 'Bills':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'PaymentDate':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'Vendor':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'TransactionStatus':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'AvailCredit':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'TotalBillAmount':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'SelectedForPayment':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'PaymentMethod':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      case 'TotalPayable':
        setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
        break
      default:
        break
    }
  }

  const columns: any = [
    ...paymentStatusHeaders,
    {
      header: (
        <ColumnFilter
          headers={headersDropdown.map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          visibleHeaders={paymentStatusHeaders.map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          columnId={mapColId}
          getMappingListData={getMappingListData}
          url={savePaymentStatusColumnMapping}
        />
      ),
      accessor: 'actions',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[200px]',
    },
  ]

  const handleConfirmationModalOpen = (paymentId: number) => {
    setCancelPaymentId(paymentId)
    setIsConfirmationModalOpen(true)
  }

  const setCancelRequestForPayment = () => {
    setIsLoading(true)
    setPaymentStatusList([]);
    setIsConfirmationModalOpen(false)
    const params = {
      PaymentId: cancelPaymentId
    }
    performApiAction(dispatch, setCancelPayment, params, () => {
      Toast.success('Payment Transaction has been cancelled successfully!')
      setCancelPaymentId(0)
      setRefreshTable(!refreshTable)
    }, () => {
      setRefreshTable(!refreshTable)
    })
  }

  const handleOpenAttachFile = (Id: any) => {
    setIsFilterOpen(false)
    setOpenAttachFile(!isOpenAttchFile)
    setSelectedRowId(Id)
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

  const handleFileOpen = (filePath: any, fileName: string) => {
    showPDFViewerModal(filePath, fileName)
    setFileModal(!isFileModal)
  }

  // Table Data
  const paymentStatusData = paymentStatusList && paymentStatusList.map((d: any) => {
    return {
      Bills: (
        <label className={`font-proxima hover:cursor-pointer text-sm ${d.StatusName == 'Failed' ? 'flex items-center' : 'mx-[15px]'}`} >
          {d.StatusName == 'Failed' && <span className='mx-1 my-1 h-2 w-2 rounded-full bg-[#DC3545]'></span>}
          {d.Bills}
        </label>
      ),
      PaymentDate: <label className='font-proxima text-sm !tracking-[0.02em]'>{formatDate(d.PaymentDate)}</label>,
      Vendor:
        d?.Vendor && d?.Vendor.length > (paymentStatusHeaders.length < 7 ? 30 : 19) ?
          <Tooltip position='right' content={d.Vendor} className='!m-0 !p-0 !z-[4]'>
            <label
              className='cursor-pointer text-sm w-[170px]'
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              onClick={() => {
                setPaymentDetailsList(d?.BillsList)
                setVendor(d?.Vendor)
                setOpenDetailsView(true)
              }}>
              {d.Vendor}
            </label>
          </Tooltip>
          : <label className='font-proxima text-sm cursor-pointer' onClick={() => {
            setPaymentDetailsList(d?.BillsList)
            setVendor(d?.Vendor)
            setOpenDetailsView(true)
          }}>{d.Vendor}</label>,
      TransactionStatus: (
        <label className={`font-proxima break-words text-sm ${d.StatusName == 'Failed' ? 'text-red-500' : 'text-black'}`}>
          {d.StatusName}
        </label>
      ),
      PaymentMethod: <label className={`font-proxima break-words text-sm`}>{d.PaymentMethod}</label>,
      TotalBillAmount: <label className='font-proxima text-sm !font-bold !tracking-[0.02em] text-darkCharcoal'>${formatCurrency(d?.TotalBillAmount)}</label>,
      SelectedforPayment: <label className='font-proxima text-sm !font-bold !tracking-[0.02em] text-darkCharcoal'>${formatCurrency(d?.SelectedForPayment)}</label>,
      TotalPayable: <label className='font-proxima text-sm !font-bold !tracking-[0.02em] text-darkCharcoal'>${formatCurrency(d?.TotalPayable)}</label>,
      AvailCredit: <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>${formatCurrency(d?.AvailCredit)}</label>,
      actions: (
        <div className='ml-7 mr-[16px] flex items-center gap-5'>
          {((d.PaymentMethod == "Virtual Card" || d.PaymentMethod == "Check") && d.Status === 6) ? (
            <Button
              onClick={() => handleConfirmationModalOpen(d.PaymentId)}
              className={`btn-sm !h-7 rounded-full !w-[76px]`}
              variant='btn-outline-primary'>
              <label className={`h-[17px] mt-0.5 flex items-center justify-center cursor-pointer font-proxima font-semibold text-sm tracking-[0.02em]`}>
                CANCEL
              </label>
            </Button>
          ) : ""}
          <div className='mr-[3px] flex h-full justify-center items-center'>
            <RowDownload url={`${process.env.API_BILLSTOPAY}/paymentstatus/getlist`} params={baseParams} fileName='Payment_status' />
          </div>
        </div>
      ),
    }
  })

  // Table Details Data
  const paymentStatusDetailsData = paymentDetailsList && paymentDetailsList.map((nestedData: any) =>
    new Object({
      ...nestedData,
      BillNumber:
        <div className='flex w-full justify-between'>
          <label className=' w-full break-words font-medium font-proxima !text-[14px] !tracking-[0.02em] text-darkCharcoal'>{nestedData.BillNumber}</label>
          <div className='relative mr-4'>
            {nestedData.Attachments?.length > 0 && (
              <div className='overflow-y-auto'>
                <div className='flex cursor-pointer justify-end' onClick={() => handleOpenAttachFile(nestedData.Id)}>
                  <div className='absolute -right-2 -top-3'>
                    <Badge badgetype='error' variant='dot' text={nestedData.Attachments.length.toString()} />
                  </div>
                  <AttachIcon />
                </div>

                {isOpenAttchFile && nestedData.Id == selectedRowId && (
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
      SelectedForPayment: <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>${formatCurrency(nestedData?.SelectedForPayment)}</label>,
      BillAmount: <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>${formatCurrency(nestedData?.BillAmount)}</label>,
      AvailCredit: <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>${formatCurrency(nestedData?.AvailCredit)}</label>,
      DueDate: (
        <div className='flex items-center gap-4 font-medium'>
          <span className='font-proxima !text-sm !tracking-[0.02em]'>{formatDate(nestedData.DueDate)}</span>
        </div>
      ),
      RemainingAmount: (
        <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
          ${formatCurrency(nestedData.RemainingAmount)}
        </label>
      ),
      LocationName: <label className='font-medium !tracking-[0.02em] break-words'>{nestedData.LocationName}</label>,
      Discount: <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>${formatCurrency(nestedData.Discount)}</label>,
      PayableAmount: <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>${formatCurrency(nestedData.PayableAmount)}</label>,
      Actions: (
        <div className='mr-[18px]'>
          <Tooltip position='left' content='Activities' className='!z-[4] !cursor-pointer !p-0'>
            <span onClick={() => {
              setSelectedPayableId(nestedData.Id)
              setOpenDrawer(true)
            }}>
              <ActivityIcon />
            </span>
          </Tooltip>
        </div>),
    })
  )

  const handleFilterOpen = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const modalClose = () => {
    setIsConfirmationModalOpen(false)
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

  return (
    <Wrapper>
      <div className={`sticky top-0 ${isDownloadClicked ? "z-[7]" : "z-[6]"} flex h-[66px] w-full items-center justify-between bg-whiteSmoke px-5`}>
        {isOpenDetailsView ? (
          <Breadcrumb variant='/' items={[
            { label: 'Payment Status', goBack: () => setOpenDetailsView(false) },
            { label: vendor.toString(), url: '#' },
          ]} />
        ) : (
          <>
            <div className='w-1/3'>
              <Status key={CompanyId} statusList={statusList} />
            </div>
            <div className='w-full h-full flex justify-end items-center laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
              <div className='flex items-center h-full relative cursor-pointer'
                onMouseEnter={() => setIsInfoTextVisible(true)}
                onMouseLeave={() => setIsInfoTextVisible(false)}
              >
                <PaymentInfoIcon />
                {isInfoTextVisible && <span className='tracking-[0.02em] font-proxima text-sm text-darkCharcoal absolute bg-white w-[231px] right-0 top-12 rounded-md p-4 shadow-md'>
                  Payments can be canceled while "Under process". Once processed, cancellation is not possible.
                </span>}
              </div>
              <div ref={selectRef} className='h-full flex justify-center items-center' onClick={() => setIsFilterOpen(true)}>
                <Tooltip position='bottom' content='Filter' className='!px-0 !pb-2.5 !font-proxima !text-sm !z-[6]'>
                  <FilterIcon />
                </Tooltip>
              </div>
              <div className='flex h-full justify-center items-center'>
                <Download url={`${process.env.API_BILLSTOPAY}/paymentstatus/getlist`} params={baseParams} fileName='Payment_status' getDropdownOpen={(isOpen: any) => setIsDownloadClicked(isOpen)} />
              </div>
            </div>
          </>
        )}
      </div>
      {/* <div className={`custom-scroll h-[calc(100vh-145px)] approvalMain overflow-auto ${tableDynamicWidth}`}>
        <div className={`expandableTable ${paymentStatusData.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            columns={columns}
            data={paymentStatusData ?? []}
            hoverEffect
            sticky
            zIndex={5}
            lazyLoadRows={lazyRows}
            isTableLayoutFixed={true}
            expandable
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
          {isLazyLoading && !isLoading && (
            <Loader size='sm' helperText />
          )}
          <div ref={tableBottomRef} />
        </div>
        {paymentStatusData.length === 0 ? (
          isLoading ?
            <div className='flex h-[calc(94vh-150px)] w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div>
            : <div className='flex h-[59px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
        ) : ''}
      </div> */}

      {isOpenDetailsView ? (
        <>
          <div className={`custom-scroll h-[calc(100vh-145px)] approvalMain overflow-auto ${tableDynamicWidth}`}>
            <div className={`${paymentDetailsList.length === 0 ? 'h-11' : 'h-auto'}`}>
              <DataTable
                columns={nestedColumns}
                data={paymentStatusDetailsData ?? []}
                hoverEffect
                sticky
                zIndex={5}
                lazyLoadRows={lazyRows}
                isTableLayoutFixed={true}
                getExpandableData={(data: any) => {
                  setSelectedRowId(data.Id)
                }}
                getRowId={() => { }}
              />
              {isLazyLoading && !isLoading && (
                <Loader size='sm' helperText />
              )}
              <div ref={tableBottomRef} />
            </div>
            {paymentDetailsList.length === 0 ? (
              isLoading ?
                <div className='flex h-[calc(94vh-150px)] w-full items-center justify-center'>
                  <Loader size='md' helperText />
                </div>
                : <div className='flex h-[59px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
                  No records available at the moment.
                </div>
            ) : ''}
          </div>
        </>
      ) : (
        <div className={`custom-scroll h-[calc(100vh-145px)] approvalMain overflow-auto ${tableDynamicWidth}`}>
          <div className={`expandableTable ${paymentStatusData.length === 0 ? 'h-11' : 'h-auto'}`}>
            <DataTable
              columns={columns}
              data={paymentStatusData ?? []}
              hoverEffect
              sticky
              zIndex={5}
              lazyLoadRows={lazyRows}
              isTableLayoutFixed={true}
              getExpandableData={() => { }}
              getRowId={() => { }}
            />
            {isLazyLoading && !isLoading && (
              <Loader size='sm' helperText />
            )}
            <div ref={tableBottomRef} />
          </div>
          {paymentStatusData.length === 0 ? (
            isLoading ?
              <div className='flex h-[calc(94vh-150px)] w-full items-center justify-center'>
                <Loader size='md' helperText />
              </div>
              : <div className='flex h-[59px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
                No records available at the moment.
              </div>
          ) : ''}
        </div>
      )}


      {/* Activity Drawer */}
      <ActivityDrawer
        noCommentBox={false}
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        selectedPayableId={selectedPayableId}
      />
      <DrawerOverlay isOpen={openDrawer} />

      {/* For Filter Menu */}
      <Filter
        locationOption={locationOption}
        vendorOption={vendorOption}
        paymentMethodOption={paymentMethodOption}
        isFilterOpen={isFilterOpen}
        onClose={() => handleFilterOpen()}
      />

      {/* Void/Cancel Confirmation Modal */}
      <ConfirmationModal
        title='Confirmation'
        content='Are you sure you want to cancel payment request?'
        isModalOpen={isConfirmationModalOpen}
        modalClose={modalClose}
        handleSubmit={setCancelRequestForPayment}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {isFileModal && isFileRecord.FileName &&
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
            openInNewWindow={openInNewWindow}
          />
        )}
    </Wrapper>
  )
}

export default ListPaymentStatus