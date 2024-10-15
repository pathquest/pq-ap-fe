'use client'

import FraudDetectionIcon from '@/assets/Icons/FraudDetectionIcon'
import ImportIcon from '@/assets/Icons/ImportIcon'
import SortIcon from '@/assets/Icons/SortIcon'
import SyncIcon from '@/assets/Icons/SyncIcon'
import CreateIcon from '@/assets/Icons/billposting/CreateIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import ImportModal from '@/components/Common/Modals/ImportModal'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { vendorDropdown } from '@/store/features/bills/billSlice'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { importVendorData, syncVendor, vendorGetList, vendorUpdateStatus } from '@/store/features/vendor/vendorSlice'
import { useSession } from 'next-auth/react'
import { Button, CheckBox, DataTable, Loader, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import { Actions } from '../../../vendors/__components/DataTableActions'
import Filter from '../../../vendors/__components/Filter'
import VendorAddScreen from '../../../vendors/__components/VendorAddScreen'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import { useRouter } from 'next/navigation'

const ListVendorsDuplication: React.FC = () => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const { filterFields } = useAppSelector((state) => state.vendor)

  const dispatch = useAppDispatch()

  const [EditId, setEditId] = useState<number | null>()
  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [paymentMethodOption, setPaymentMethodOption] = useState<any>([])
  const [isIntermediate, setIsIntermediate] = useState<any>({
    isEnable: false,
    isChecked: false,
  })
  const [selectedRows, setSelectedRows] = useState<any>([])
  const isRowSelected = (id: any) => selectedRows.indexOf(id) !== -1

  const router = useRouter()

  const [orderBy, setOrderBy] = useState<number | null>(1)
  const [orderColumnName, setOrderColumnName] = useState<string>("VendorId")
  const [hoveredColumn, setHoveredColumn] = useState<string>("");

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [inactiveId, setInactiveId] = useState<number>(0)
  const [vendorName, setVendorName] = useState<string>('')
  const [isImport, setIsImport] = useState<boolean>(false)
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
      colStyle: '!w-[90px] !tracking-[0.02em]'
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('Email')} onMouseEnter={() => setHoveredColumn("Email")} onMouseLeave={() => setHoveredColumn("")}>
        Email Address <SortIcon orderColumn="Email" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "Email"}></SortIcon>
      </div>,
      accessor: 'Email',
      sortable: false,
      colStyle: '!w-[100px] !tracking-[0.02em]',
    },
    {
      header: <div className='flex cursor-pointer items-center gap-1.5' onClick={() => handleSortColumn('PreferredPaymentMethod')} onMouseEnter={() => setHoveredColumn("PreferredPaymentMethod")} onMouseLeave={() => setHoveredColumn("")}>
        Preferred Payment Method <SortIcon orderColumn="PreferredPaymentMethod" sortedColumn={orderColumnName} order={orderBy} isHovered={hoveredColumn == "PreferredPaymentMethod"}></SortIcon>
      </div>,
      accessor: 'PreferredPaymentMethodStr',
      sortable: false,
      colStyle: '!w-[110px] !tracking-[0.02em]',
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
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: "right"
    }
  ]

  // For Sorting Data
  const handleSortColumn = (name: string) => {
    setOrderColumnName(name)
    setOrderBy((prevValue) => (prevValue === 1 ? 0 : 1))
  }

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
      Name: d?.Name.length > 22
        ? <Tooltip position='right' content={d?.Name} className='!m-0 !p-0 !z-[4]'>
          <label
            className={`cursor-pointer text-sm w-[110px] ${d?.Status ? '' : 'opacity-50'}`}
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
        </Tooltip>
        : <label className={`font-proxima text-sm ${d?.Status ? '' : 'opacity-50'}`}>{d?.Name}</label>,
      PhoneNumber: <label className={`${d?.Status ? '' : 'opacity-50'}`}>{d?.PhoneNumber}</label>,
      Email: <label className={`font-proxima text-sm break-all ${d?.Status ? '' : 'opacity-50'}`}>{d?.Email}</label>,
      PreferredPaymentMethodStr: <label className={`${d?.Status ? '' : 'opacity-50'}`}>{d?.PreferredPaymentMethodStr}</label>,
      Payables: <label className={`font-proxima text-sm !font-bold !tracking-[0.02em] ${d?.Status ? '' : 'opacity-50'}`}>
        ${formatCurrency(d?.Payables)}
      </label>,
      action: <Actions id={d?.Id} vendorName={d?.Name} recordNumber={d?.RecordNo} status={d?.Status} actions={d?.Status ? ['Edit', 'Inactive'] : ['Active']} handleClick={handleMenuChange} />
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

  const handleBackPage = () => {
    router.push('/vendors')
  }

  return (
    <Wrapper>
      {/* Navbar */}
      {isVendorAddScreenOpen
        ? <VendorAddScreen EditId={EditId ?? 0} isOpen={isVendorAddScreenOpen} onClose={(value: string) => handleModalClose(value)} />
        :
        <>
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
              <span className='pl-4 !text-[14px] font-semibold'>
                Vendors Duplication
              </span>
            </div>
          </div>

          {/* DataTable */}
          <div className='h-[calc(100vh-112px)] overflow-auto max-[425px]:mx-1'>
            <div className={`${(vendorList.length !== 0) && 'h-0'}`}>
              <DataTable
                columns={columns}
                data={vendorList.length > 0 ? vendorListData : []}
                hoverEffect
                sticky
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
            <DataLoadingStatus isLoading={isLoading} data={vendorList} />
          </div>
        </>}
    </Wrapper>
  )
}

export default ListVendorsDuplication