'use client'

import ImportIcon from '@/assets/Icons/ImportIcon'
import SortIcon from '@/assets/Icons/SortIcon'
import SyncIcon from '@/assets/Icons/SyncIcon'
import CreateIcon from '@/assets/Icons/billposting/CreateIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import ImportModal from '@/components/Common/Modals/ImportModal'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { vendorDropdown } from '@/store/features/bills/billSlice'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { importVendorData, syncVendor, vendorGetList, vendorUpdateStatus } from '@/store/features/vendor/vendorSlice'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BasicTooltip, Button, CheckBox, DataTable, Loader, Toast } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import { Actions } from '../DataTableActions'
import Filter from '../Filter'
import VendorAddScreen from '../VendorAddScreen'

const ListVendors: React.FC = () => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const { filterFields } = useAppSelector((state) => state.vendor)

  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isVendorPermission = getModulePermissions(processPermissionsMatrix, "Vendor") ?? {}
  const isVendorView = isVendorPermission?.View ?? false;
  const isVendorCreate = isVendorPermission?.Create ?? false;
  const isVendorEdit = isVendorPermission?.Edit ?? false;
  const isVendorSync = isVendorPermission?.Sync ?? false;
  const isVendorImport = isVendorPermission?.Import ?? false;

  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const vendorEditid = searchParams.get('id') ?? 0

  const [EditId, setEditId] = useState<number | null>()
  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [paymentMethodOption, setPaymentMethodOption] = useState<any>([])
  const [isIntermediate, setIsIntermediate] = useState<any>({
    isEnable: false,
    isChecked: false,
  })
  const [selectedRows, setSelectedRows] = useState<any>([])
  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1

  const [orderBy, setOrderBy] = useState<number | null>(1)
  const [orderColumnName, setOrderColumnName] = useState<string>("VendorId")
  const [hoveredColumn, setHoveredColumn] = useState<string>("");

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [inactiveId, setInactiveId] = useState<number>(0)
  const [vendorName, setVendorName] = useState<string>('')
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [vendorList, setVendorList] = useState<any>([])
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [recordNumber, setRecordNumber] = useState<string>('')
  const [vendorStatus, setVendorStatus] = useState<boolean>(false)

  const [isVendorAddScreenOpen, setIsVendorAddScreenOpen] = useState<boolean>(false)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  let nextPageIndex: number = 1
  const lazyRows: number = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const columns: any = [
    {
      header: vendorList.length !== 0 && (
        <CheckBox
          id='select-all'
          intermediate={isIntermediate.isEnable}
          checked={isIntermediate.isChecked}
          onChange={(e) => handleSelectAll(e)}
          disabled={vendorList.length === 0}
        />
      ),
      accessor: 'check',
      sortable: false,
      colStyle: '!w-[30px]',
      colalign: 'right',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('VendorId')} onMouseEnter={() => setHoveredColumn("VendorId")} onMouseLeave={() => setHoveredColumn("")}>
        Vendor Id <SortIcon orderColumn="VendorId" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "VendorId"}></SortIcon>
      </div>,
      accessor: 'VendorId',
      sortable: false,
      colStyle: '!w-[70px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Name')} onMouseEnter={() => setHoveredColumn("Name")} onMouseLeave={() => setHoveredColumn("")}>
        Vendor Name <SortIcon orderColumn="Name" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "Name"}></SortIcon>
      </div>,
      accessor: 'Name',
      sortable: false,
      colStyle: '!w-[100px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PhoneNumber')} onMouseEnter={() => setHoveredColumn("PhoneNumber")} onMouseLeave={() => setHoveredColumn("")}>
        Phone Number <SortIcon orderColumn="PhoneNumber" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "PhoneNumber"}></SortIcon>
      </div>,
      accessor: 'PhoneNumber',
      sortable: false,
      colStyle: '!w-[90px] !tracking-[0.02em]',
      colalign: 'right',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Email')} onMouseEnter={() => setHoveredColumn("Email")} onMouseLeave={() => setHoveredColumn("")}>
        Email Address <SortIcon orderColumn="Email" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "Email"}></SortIcon>
      </div>,
      accessor: 'Email',
      sortable: false,
      colStyle: '!w-[110px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PreferredPaymentMethod')} onMouseEnter={() => setHoveredColumn("PreferredPaymentMethod")} onMouseLeave={() => setHoveredColumn("")}>
        Preferred Payment Method <SortIcon orderColumn="PreferredPaymentMethod" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "PreferredPaymentMethod"}></SortIcon>
      </div>,
      accessor: 'PreferredPaymentMethodStr',
      sortable: false,
      colStyle: '!w-[150px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Payables')} onMouseEnter={() => setHoveredColumn("Payables")} onMouseLeave={() => setHoveredColumn("")}>
        Payables <SortIcon orderColumn="Payables" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "Payables"}></SortIcon>
      </div>,
      accessor: 'Payables',
      sortable: false,
      colStyle: '!w-[100px] !tracking-[0.02em]',
      colalign: 'right',
    },
    {
      header: '',
      accessor: isVendorEdit ? 'action' : "",
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: "right"
    }
  ]

  useEffect(() => {
    if (!isVendorView) {
      router.push('/manage/companies');
    }
  }, [isVendorView]);

  useEffect(() => {
    if (vendorEditid) {
      setEditId(Number(vendorEditid))
      setIsVendorAddScreenOpen(true)
    } else {
      setIsVendorAddScreenOpen(false)
    }
  }, [vendorEditid])

  // For Sorting Data
  const handleSortColumn = (name: string) => {
    setOrderColumnName(name)
    setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
  }

  // function for select All row (Checkboxes)
  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = vendorList.filter((row: any) => row.Status === true).map((row: any) => row.Id)
      setSelectedRows(newSelecteds)
      return
    }
    setSelectedRows([])
  }

  useEffect(() => {
    if (selectedRows?.length > 0 && vendorList.length === selectedRows.length) {
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

  //Vendor Dropdown List API
  const getVendorDropdown = () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ label: item.label, value: String(item.value) }))
      setVendorOptions(mappedList)
    })
  }

  //Payment Method Dropdown API
  const getPaymentMethodDropdown = () => {
    performApiAction(dispatch, getPaymentMethods, null, (responseData: any) => {
      setPaymentMethodOption(responseData);
    });
  };

  // Vendor List API
  const getVendorList = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setVendorList([])
      setItemsLoaded(0)
      setIsLoading(true)
    }
    try {
      setIsLazyLoading(true)
      const params = {
        FilterObj: {
          VendorIds: filterFields?.VendorIds.map(item => parseInt(item)) ?? [],//list string
          PaymentMethod: filterFields?.PaymentMethod.map(item => parseInt(item)) ?? [],//list int
          Status: filterFields?.StatusIds.map(item => parseInt(item)) ?? [],//list int
          MinPayables: filterFields?.MinPayables != "" ? Number(filterFields?.MinPayables) : null,//Decimal
          MaxPayables: filterFields?.MaxPayables != "" ? Number(filterFields?.MaxPayables) : null,//Decimal
          SortColumn: orderColumnName ?? '',//Column to sort
          SortOrder: orderBy//0 for asc 1 for desc
        },
        Index: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }
      const { payload, meta } = await dispatch(vendorGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setVendorList(payload?.ResponseData?.List)
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
            updatedData = [...vendorList, ...newList]
          }

          setVendorList(updatedData)
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
    getVendorList(1)
  }, [refreshTable, filterFields, CompanyId, orderBy])

  useEffect(() => {
    if (CompanyId) {
      getVendorDropdown()
    }
  }, [CompanyId, refreshTable])

  useEffect(() => {
    if (CompanyId) {
      getPaymentMethodDropdown()
    }
  }, [CompanyId])

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getVendorList()
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

  //Sync API
  const handleSync = async () => {
    setIsSyncing(true)
    modalClose()
    performApiAction(dispatch, syncVendor, null, (responseData: any) => {
      if (responseData.ResponseStatus === 'Success') {
        getVendorList(1)
        Toast.success(`Vendor(s) Synced!`)
        setIsSyncing(false)
      }
      else {
        Toast.error('Error', `${responseData.ErrorData.Error}`)
        setIsSyncing(false)
      }
    }, () => {
      // ErrorData
      setIsSyncing(false)
    })
  }

  const handleFilterOpen = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleDrawerOpen = () => {
    setIsVendorAddScreenOpen(true)
  }

  const modalClose = () => {
    setIsSyncModalOpen(false)
    setIsInactiveModalOpen(false)
    setInactiveId(0)
    setVendorName('')
    setIsImportModalOpen(false)
  }

  const handleModalClose = (type: string) => {
    setIsVendorAddScreenOpen(false)
    setEditId(null)
    if (type === "Save") {
      setRefreshTable(!refreshTable)
    }
  }

  const handleMenuChange = (actionName: string, id: number, recordNumber: string, Status: boolean, vendorName: string) => {
    if (actionName === 'Edit Details') {
      setEditId(id)
      setIsVendorAddScreenOpen(true)
    } else {
      setVendorStatus(Status)
      setRecordNumber(recordNumber)
      setInactiveId(id)
      setVendorName(vendorName)
      if (!Status) {
        handleInactiveVendor(id, recordNumber, Status, vendorName)
      } else {
        handleInactiveModal()
      }
    }
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
  }

  //DataTable Data
  const vendorListData = vendorList && vendorList?.map((d: any) =>
    new Object({
      check: (
        <CheckBox
          id={`BTP-${d.Id}`}
          className={`${d?.Status ? '' : 'opacity-50 pointer-events-none cursor-default'}`}
          checked={isRowSelected(d.Id)}
          onChange={() => handleRowSelect(d.Id)}
        />
      ),
      VendorId: <label className={`${d?.Status ? '' : 'opacity-50'}`}>{d?.VendorId}</label>,
      Name: d?.Name.length > 19
        ? <BasicTooltip position='right' content={d?.Name} className='!m-0 !p-0 !z-[4]'>
          <label
            className={`cursor-pointer text-sm !w-[110px] ${d?.Status ? '' : 'opacity-50'}`}
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {d?.Name}
          </label>
        </BasicTooltip>
        : <label className={`font-proxima text-sm ${d?.Status ? '' : 'opacity-50'}`}>{d?.Name}</label>,
      PhoneNumber: <label className={`${d?.Status ? '' : 'opacity-50'}`}>{d?.PhoneNumber}</label>,
      Email: <label className={`font-proxima text-sm break-all ${d?.Status ? '' : 'opacity-50'}`}>{d?.Email}</label>,
      PreferredPaymentMethodStr: <label className={`${d?.Status ? '' : 'opacity-50'}`}>{d?.PreferredPaymentMethodStr}</label>,
      Payables: <label className={`font-proxima text-sm !font-bold !tracking-[0.02em] ${d?.Status ? '' : 'opacity-50'}`}>
        ${formatCurrency(d?.Payables)}
      </label>,
      action: <Actions id={d?.Id} vendorName={d?.Name} recordNumber={d?.RecordNo} status={d?.Status} actions={d?.Status ? ['Edit Details', 'Inactive'].filter(Boolean) : ['Active']} handleClick={handleMenuChange} />
    })
  )

  const handleInactiveModal = () => {
    setIsInactiveModalOpen(true)
  }

  const handleInactiveVendor = (id: any, recordNumber: string, vendorStatus: boolean, vendorName: string) => {
    setIsInactiveModalOpen(false)
    const params = {
      CompanyId: CompanyId,
      Id: id,
      RecordNo: recordNumber,
      Status: !vendorStatus,
      Name: vendorName
    }
    performApiAction(dispatch, vendorUpdateStatus, params, () => {
      // SuccessData
      getVendorList(1)
      Toast.success('Status Updated!')
      setInactiveId(0)
      setVendorName('')
      setRecordNumber('')
      setVendorStatus(false)
    }, () => {
      // ErrorData
      setInactiveId(0)
      setVendorName('')
      setRecordNumber('')
      setVendorStatus(false)
    })
  }

  //Import API
  const handleImport = async () => {
    if (!selectedFile) {
      Toast.error('Error', 'Please select a CSV or Excel file for importing data.')
    } else {
      setIsImporting(true)
      modalClose()
      const params = {
        Files: selectedFile,
      }

      performApiAction(dispatch, importVendorData, params, (responseData: any) => {
        // SuccessData
        if (responseData.SuccessCount > 0) {
          Toast.success(`${responseData.SuccessCount} Record Imported!`)
        }
        getVendorList(1)
        setIsImporting(false);
        setSelectedFile(null);
      }, () => {
        // ErrorData
        setIsImporting(false);
        setSelectedFile(null);
      }, (WarningData: any) => {
        // WarningData
        if (WarningData.SuccessCount > 0) {
          Toast.success(`${WarningData.SuccessCount} Record Imported!`)
        }
        WarningData.InSufficientData.map((data: any) => {
          Toast.warning(`${data.ErrorMessage}`)
        })
        getVendorList(1)
        setIsImporting(false);
        setSelectedFile(null);
      })
    }
  }

  const handleDuplicateClick = () => {
    router.push('/vendors-duplication')
  }

  let noDataContent

  if (vendorListData.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-[calc(100vh-155px)] w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className='sticky flex h-[44px] w-full items-center justify-center border-b border-b-[#ccc]'>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }

  return (
    <Wrapper>
      {/* Navbar */}
      {isVendorAddScreenOpen
        ? <VendorAddScreen EditId={EditId ?? 0} isOpen={isVendorAddScreenOpen} onClose={(value: string) => handleModalClose(value)} />
        :
        <>
          <div className='sticky top-0 z-[6] flex !h-[50px] w-full items-center justify-between bg-whiteSmoke laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
            <div className='flex items-center'>
              <label className='font-proxima flex items-center text-base font-bold tracking-[0.02em] text-darkCharcoal'>Vendors</label>
            </div>
            <div className='flex items-center gap-5'>
              {selectedRows.length > 1
                ? <Button
                  className={`h-7 rounded-full flex !justify-center !items-center laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]`}
                  variant='btn-primary'
                  onClick={handleInactiveModal}>
                  <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>INACTIVE</label>
                </Button>
                : <>
                  {/* <BasicTooltip position='bottom' content='Vendor Duplication' className='!z-[6] !cursor-pointer !px-0'>
                  <div className='mb-1 -mr-1 flex justify-center items-center cursor-pointer' onClick={handleDuplicateClick}>
                    <FraudDetectionIcon />
                  </div>
                </BasicTooltip> */}
                  <BasicTooltip position='bottom' content='Filter' className='!z-[6] !cursor-pointer !px-0'>
                    <div className='flex justify-center items-center cursor-pointer' onClick={handleFilterOpen}>
                      <FilterIcon />
                    </div>
                  </BasicTooltip>
                  {isVendorCreate && <BasicTooltip position='bottom' content='Create' className='!z-[6] !cursor-pointer !px-0'>
                    <div className='flex justify-center items-center cursor-pointer' onClick={handleDrawerOpen}>
                      <CreateIcon />
                    </div>
                  </BasicTooltip>}
                  {(accountingTool === 4 && isVendorImport) ? <BasicTooltip content={`Import`} position='bottom' className='!z-[6] !px-0'>
                    <div className="overflow-hidden flex justify-center items-center">
                      <div className={`${isImporting && 'animate-spin-y'}`} onClick={() => setIsImportModalOpen(true)}>
                        <ImportIcon />
                      </div>
                    </div>
                  </BasicTooltip>
                    : accountingTool != 4 && isVendorSync && <BasicTooltip position='bottom' content='Sync' className='!z-[6] !cursor-pointer !px-0'>
                      <div className={`flex justify-center items-center cursor-pointer ${isSyncing && 'animate-spin'}`} onClick={() => setIsSyncModalOpen(true)}>
                        <SyncIcon />
                      </div>
                    </BasicTooltip>}
                </>}
            </div>
          </div>

          {/* DataTable */}
          <div className='h-[calc(100vh-112px)] overflow-auto max-[425px]:mx-1 custom-scroll'>
            <div className={`${vendorList.length === 0 ? 'h-11' : 'h-auto'}`}>
              <DataTable
                columns={columns}
                data={vendorList.length > 0 ? vendorListData : []}
                hoverEffect
                sticky
                zIndex={5}
                lazyLoadRows={lazyRows}
                isTableLayoutFixed
                getExpandableData={() => { }}
                getRowId={() => { }}
              />
              {isLazyLoading && !isLoading && (
                <Loader size='sm' helperText />
              )}
              <div ref={tableBottomRef} />
            </div>
            {noDataContent}
            {/* <DataLoadingStatus isLoading={isLoading} data={vendorList} /> */}
          </div>

          {/* Sync Modal */}
          <ConfirmationModal
            title='Sync'
            content={`Are you sure you want to sync Vendor ?`}
            isModalOpen={isSyncModalOpen}
            modalClose={modalClose}
            handleSubmit={handleSync}
            colorVariantNo='btn-outline-primary'
            colorVariantYes='btn-primary'
          />

          {/* Inactive Modal */}
          {isInactiveModalOpen && <ConfirmationModal
            title='Inactive Vendor'
            content={`Are you sure you want to inactive ${inactiveId > 0 ? "this vendor?" : "these vendors?"}`}
            isModalOpen={isInactiveModalOpen}
            modalClose={modalClose}
            handleSubmit={() => handleInactiveVendor(inactiveId, recordNumber, vendorStatus, vendorName)}
            colorVariantNo='btn-outline-error'
            colorVariantYes='btn-error'
          />}

          {/* Import Modal */}
          {isImportModalOpen && <ImportModal
            isModalOpen={isImportModalOpen}
            modalClose={modalClose}
            handleSubmit={handleImport}
            sampleFile="vendorSampleData"
            getValue={(value: any) => setSelectedFile(value)}
          />}

          {/* For Filter Menu */}
          <Filter
            vendorOption={vendorOptions}
            paymentMethodOption={paymentMethodOption}
            isFilterOpen={isFilterOpen}
            onClose={() => handleFilterOpen()}
          />
        </>}
    </Wrapper>
  )
}

export default ListVendors