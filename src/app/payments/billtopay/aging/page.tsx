'use client'

import { usePathname, useRouter } from 'next/navigation'
import { DataTable, Loader, Toast, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'

// Common components
import Wrapper from '@/components/Common/Wrapper'
import AgingFilterDropdwon from '../components/dropdowns/AgingFilterDropdown'
import VendorsDropdown from '../components/dropdowns/Vendor'

// Icons
import BackArrow from '@/assets/Icons/payments/BackArrow'

// Store
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { vendorDropdown } from '@/store/features/bills/billSlice'
import { getAgingFilterDropdown, getVendorAginglist, setCurrentPath, setEndDay, setStartDay, setVendorIdList } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'
import AgingDays from './agingDays'

const PaymentAging: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()

  const billsToPayReducer = useAppSelector((state) => state.billsToPayReducer)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingToolId = session?.user?.AccountingTool
  const selectedVendors = billsToPayReducer.selectedVendors
  const vendorIdList = billsToPayReducer.vendorIdList
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentFilterLabel, setCurrentFilterLabel] = useState('By Due Date')
  const [currentFilterValue, setCurrentFilterValue] = useState<number>(0)
  const [isAgingDaysModalOpen, setAgingsDaysModalOpen] = useState<boolean>(false)
  const [dataList, setDataList] = useState<any>([])
  const [agingFilterList, setAgingFilterList] = useState<any[]>([])
  const [startDay, setTempStartDay] = useState<string | null>(null)
  const [endDay, setTempEndDay] = useState<string | null>(null)
  const [currVendorIds, setCurrVendorIds] = useState<string[] | null>(null)
  const [currVendorName, setCurrVendorName] = useState<string>('')
  const [tableDynamicWidth, setTableDynamicWidth] = useState('w-full laptop:w-[calc(100vw-200px)]')
  const [refreshTable, setIsRefreshTable] = useState<boolean>(false)
  const [vendorOptions, setVendorOptions] = useState<any>([])

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [loaderCounter, setLoaderCounter] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  const [checkLoader, setCheckLoader] = useState<boolean>(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)

  let nextPageIndex: number = 1
  const lazyRows: number = 10
  const tableBottomRef = useRef<HTMLDivElement>(null)

  // Table Columns
  const columns: any = [
    { header: 'Vendor', accessor: 'VendorName', sortable: false, colStyle: '!w-[220px] uppercase sm:!pl-4 md:!pl-4 laptop:!pl-4 laptopMd:!pl-4 lg:!pl-4 xl:!pl-4 hd:!pl-5 2xl:!pl-5 3xl:!pl-5' },
    {
      header: (
        <span
          className='cursor-pointer uppercase text-primary underline'
          onClick={() => {
            router.push('/payments/billtopay/aging/days')
            dispatch(setStartDay(0))
            dispatch(setEndDay(30))
          }}
        >
          0 - 30 Days
        </span>
      ),
      accessor: 'Days0To30',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[140px]',
    },
    {
      header: (
        <span
          className='cursor-pointer uppercase text-primary underline'
          onClick={() => {
            router.push('/payments/billtopay/aging/days')
            dispatch(setStartDay(31))
            dispatch(setEndDay(60))
          }}
        >
          31 - 60 Days
        </span>
      ),
      accessor: 'Days31To60',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[140px]',
    },
    {
      header: (
        <span
          className='cursor-pointer uppercase text-primary underline'
          onClick={() => {
            router.push('/payments/billtopay/aging/days')
            dispatch(setStartDay(61))
            dispatch(setEndDay(90))
          }}
        >
          61 - 90 Days
        </span>
      ),
      accessor: 'Days61To90',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[140px]',
    },
    {
      header: (
        <span
          className='cursor-pointer uppercase text-primary underline'
          onClick={() => {
            router.push('/payments/billtopay/aging/days')
            dispatch(setStartDay(91))
            dispatch(setEndDay(null))
          }}
        >
          90+ Days
        </span>
      ),
      accessor: 'Days91Plus',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[140px]',
    },
    {
      header: <span className='uppercase'>Invoice Total</span>,
      accessor: 'Total',
      colalign: 'right',
      colStyle: '!w-[140px] !pr-[20px]',
      sortable: false,
    },
  ]

  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? 'w-full laptop:w-[calc(100vw-85px)]' : 'w-full laptop:w-[calc(100vw-200px)]')
  }, [isLeftSidebarCollapsed])

  const handleCloseAllocateCredit = () => {
    setIsRefreshTable(!refreshTable)
    setAgingsDaysModalOpen(false)
  }

  const handleFilterChange = (label: string, value: number) => {
    setCurrentFilterLabel(label)
    setCurrentFilterValue(value)
  }

  const getAllVendorAgingList = async (pageIndex?: number) => {
    setIsLoading(true)

    if (pageIndex === 1) {
      setDataList([])
      setItemsLoaded(0)
    }

    const params = {
      CompanyId: CompanyId,
      VendorIds: vendorIdList,
      FiterType: Number(currentFilterValue),
      StartDay: null,
      EndDay: null,
      TypeOfAging: 1,
      PageNumber: pageIndex || nextPageIndex,
      PageSize: lazyRows,
    }

    try {
      const { payload, meta } = await dispatch(getVendorAginglist(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
          const newList = responseData || []
          const newTotalCount = payload?.ResponseData?.length || 0

          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLoading(false)
            setShouldLoadMore(true)
          } else {
            updatedData = [...dataList, ...newList]
          }
          setDataList(updatedData)
          setItemsLoaded(updatedData.length)

          if (itemsLoaded >= newTotalCount) {
            setShouldLoadMore(false)
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
      setIsLoading(false)
      setLoaderCounter(0)
      setShouldLoadMore(true)
      setCheckLoader(true)
    }
  }

  useEffect(() => {
    getAllVendorAgingList(1)
  }, [currentFilterValue, vendorIdList, selectedVendors, CompanyId, refreshTable])

  useEffect(() => {
    // Fetch Aging Filter Dropdown List
    const fetchAgingFilterList = async () => {
      performApiAction(dispatch, getAgingFilterDropdown, null, (responseData: any) => {
        const modifiedOptions =
          Number(accountingToolId) === 1 ? responseData : responseData.filter((option: { value: string }) => option.value !== '2')

        setAgingFilterList(modifiedOptions)
      })
    }

    fetchAgingFilterList()
  }, [accountingToolId])

  useEffect(() => {
    // Resetting Days
    dispatch(setStartDay(0))
    dispatch(setEndDay(30))
    // setting current path
    dispatch(setCurrentPath(pathname))
  }, [])

  // Rendering Table_Data
  const tableData = dataList?.length > 0 && dataList.map((d: any) => {
    return {
      ...d,
      VendorName: <Typography className='!text-sm !pl-3'>{d.VendorName ?? '-'}</Typography>,
      Days0To30: (
        <span
          onClick={() => {
            setAgingsDaysModalOpen(true)
            setTempStartDay('0')
            setTempEndDay('30')
            setCurrVendorIds([d.VendorId])
            setCurrVendorName(d.VendorName)
          }}
        >
          <Typography className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>
            ${formatCurrency(d.Days0To30)}
            {''}&nbsp; {d.Days0To30 !== 0 ? `(${d.Days0To30Count})` : ''}
          </Typography>
        </span>
      ),
      Days31To60: (
        <span
          onClick={() => {
            setAgingsDaysModalOpen(true)
            setTempStartDay('31')
            setTempEndDay('60')
            setCurrVendorIds([d.VendorId])
            setCurrVendorName(d.VendorName)
          }}
        >
          <Typography className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>
            ${formatCurrency(d.Days31To60)}
            {''}&nbsp; {d.Days31To60 !== 0 ? `(${d.Days31To60Count})` : ''}
          </Typography>
        </span>
      ),
      Days61To90: (
        <span
          onClick={() => {
            setAgingsDaysModalOpen(true)
            setTempStartDay('61')
            setTempEndDay('90')
            setCurrVendorIds([d.VendorId])
            setCurrVendorName(d.VendorName)
          }}
        >
          <Typography className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>
            ${formatCurrency(d.Days61To90)}
            {''}&nbsp; {d.Days61To90 !== 0 ? `(${d.Days61To90Count})` : ''}
          </Typography>
        </span>
      ),
      Days91Plus: (
        <span
          onClick={() => {
            setAgingsDaysModalOpen(true)
            setTempStartDay('91')
            setTempEndDay(null)
            setCurrVendorIds([d.VendorId])
            setCurrVendorName(d.VendorName)
          }}
        >
          <Typography className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>
            ${formatCurrency(d.Days91Plus)}
            {''}&nbsp; {d.Days91Plus !== 0 ? `(${d.Days91PlusCount})` : ''}
          </Typography>
        </span>
      ),
      Total: <Typography className='!pr-[10px] !text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d.Total)}</Typography>,
    }
  })

  // For Lazy-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getAllVendorAgingList()
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

  useEffect(() => {
    getAllVendorOptions()
  }, [CompanyId])

  return (
    <Wrapper>
      {isAgingDaysModalOpen ? (
        <AgingDays
          onClose={handleCloseAllocateCredit}
          onOpen={isAgingDaysModalOpen}
          currentVendorId={currVendorIds}
          currentVendorName={currVendorName}
          currentFilter={Number(currentFilterValue)}
          startDay={startDay}
          endDay={endDay}
        />
      ) : (
        <>
          {/* Navbar */}
          <div className='sticky top-0 z-[6]'>
            <div className='relative flex !h-[50px] items-center justify-between bg-lightGray sm:px-4 md:px-4 laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
              <div className='flex items-center sm:gap-5 md:gap-5 laptop:gap-5 laptopMd:gap-5 lg:gap-5 xl:gap-5 hd:gap-[30px] 2xl:gap-[30px] 3xl:gap-[30px]'>
                <span
                  className='cursor-pointer'
                  onClick={() => {
                    router.push('/payments/billtopay')
                    dispatch(setStartDay(1))
                    dispatch(setEndDay(30))
                  }}>
                  <BackArrow />
                </span>

                {/* Vendors filter dropdown */}
                <div className='w-[155px]'>
                  <VendorsDropdown vendorOption={vendorOptions} />
                </div>
              </div>

              <AgingFilterDropdwon label={currentFilterLabel} actions={agingFilterList} handleClick={handleFilterChange} />
            </div>
          </div>

          <div className={`custom-scroll h-[calc(100vh-112px)] overflow-auto ${tableDynamicWidth}`}>
            <div className={`mainTable ${dataList?.length === 0 ? 'h-11' : 'h-auto'}`}>
              <DataTable
                columns={columns}
                data={dataList?.length > 0 ? tableData : []}
                hoverEffect={true}
                sticky
                getRowId={() => { }}
                getExpandableData={() => { }}
                lazyLoadRows={lazyRows}
                isTableLayoutFixed
              />
              {isLazyLoading && !isLoading && (

                <Loader size='sm' helperText />
              )}
              <div ref={tableBottomRef} />
            </div>
            <DataLoadingStatus isLoading={isLoading} data={dataList} />
          </div>
        </>
      )}
    </Wrapper>
  )
}

export default PaymentAging
