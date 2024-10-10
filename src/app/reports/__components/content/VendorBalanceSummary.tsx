import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { AsOfReportPeriodByList, VendorBalanceSummarycolumns, ViewByList } from '@/data/reports'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setSelectedIndex, vendorAgingSummary } from '@/store/features/reports/reportsSlice'
import { convertStringsDateToUTC } from '@/utils'
import { Button, DataTable, Datepicker, Loader, MultiSelectChip, Select, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import VendorBalDetailedDrawer from '../drawer/VendorBalDetailedDrawer'
import { useSession } from 'next-auth/react'

interface VendorBalanceSummaryProps {
  vendorOptions: any
  locationOptions: any
  setVendorBalanceSummaryParams: any
  getVendorDetailedModalOpen: any
}

const VendorBalanceSummary: React.FC<VendorBalanceSummaryProps> = ({
  vendorOptions,
  locationOptions,
  setVendorBalanceSummaryParams,
  getVendorDetailedModalOpen,
}) => {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const { selectedIndex } = useAppSelector((state) => state.reports)

  const [vendorValue, setVendorValue] = useState<string[]>([])
  const [viewByValue, setViewByValue] = useState<number>(2)
  const [reportPeriod, setReportPeriod] = useState<string>('')
  const [vendorBalanceSummarys, setVendorBalanceSummarys] = useState([])

  const [runReport, setRunReport] = useState<boolean>(false)
  const [runReportLoading, setRunReportLoading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [vendorDetailedModalOpen, setVendorDetailedModalOpen] = useState<boolean>(false)
  const [vendorName, setvendorName] = useState<string>('')
  const [vendorIds, setVendorIds] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [reportPeriodValue, setReportPeriodValue] = useState<number>(1)

  const [isCheckedValue, setIsCheckedValue] = useState<boolean>(false)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [apiDataCount, setApiDataCount] = useState(0)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)

  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-200px)]')
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  let nextPageIndex: number = 1
  const lazyRows = 10
  const tableBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-85px)]')
    } else {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-200px)]')
    }
  }, [isLeftSidebarCollapsed])

  const columns = [
    ...VendorBalanceSummarycolumns,
    {
      header: <></>,
      accessor: 'actions',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[80px]',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          fetchBalanceSummary()
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

  const fetchBalanceSummary = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setVendorBalanceSummarys([])
      setItemsLoaded(0)
      setIsLoading(true)
    }
    if (CompanyId) {
      const params = {
        Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
        StartDate: null,
        EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
        ViewBy: viewByValue,
        GroupBy: null,
        IsZeroBalance: isCheckedValue,
        PageNumber: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }

      try {
        setIsLazyLoading(true)
        const { payload, meta } = await dispatch(vendorAgingSummary(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            const responseData = payload?.ResponseData
            const List = responseData?.SummaryData
            const newList = responseData?.SummaryData || []
            const newTotalCount = responseData?.BillCount || 0
            setApiDataCount(newTotalCount)
            setRunReport(true)
            setRunReportLoading(false)
            List.length > 0 && setIsExpanded(false)

            let updatedData: any = []
            if (pageIndex === 1) {
              updatedData = [...newList]
              setIsLoading(false)
              setIsLazyLoading(false)
              setShouldLoadMore(true)
            } else {
              updatedData = [...vendorBalanceSummarys, ...newList]
            }
            setVendorBalanceSummarys(updatedData)
            setItemsLoaded(updatedData.length)
            setIsLazyLoading(false)

            setIsLoading(false)

            if (itemsLoaded >= newTotalCount) {
              setShouldLoadMore(false);
            }
          } else {
            setRunReportLoading(false)
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
        } else {
          setRunReportLoading(false)
          Toast.error(`${payload?.status} : ${payload?.statusText}`)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setRunReportLoading(false)
        setIsLoading(false)
        setIsLazyLoading(false)
      }
      // performApiAction(
      //   dispatch,
      //   vendorAgingSummary,
      //   params,
      //   (responseData: any) => {
      //     const List = responseData
      //     setVendorBalanceSummarys(List)
      //     setRunReport(true)
      //     setIsLoading(false)
      //     List.length > 0 && setIsExpanded(false)
      //   },
      //   () => {
      //     setIsLoading(false)
      //   }
      // )
    }
  }

  const handleSubmit = () => {
    setRunReportLoading(true)
    if (reportPeriod.trim().length > 0) {
      fetchBalanceSummary(1)
    } else {
      setRunReport(false)
      setRunReportLoading(false)
      Toast.error('Please select the date in order to run the report')
    }
  }

  const table_Data = vendorBalanceSummarys?.map(
    (e: any) =>
      new Object({
        Date: <Typography>{e.BillDate}</Typography>,
        Vendor:
          e.VendorName?.length > 20 ? (
            <label
              title={e.Vendor}
              className='cursor-pointer'
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {e.VendorName ?? null}
            </label>
          ) : (
            <label
              className='cursor-pointer font-proxima text-sm'
              onClick={() => {
                getVendorDetailedModalOpen(true)
                setVendorDetailedModalOpen(true)
                setvendorName(e.VendorName)
                setVendorIds([e.VendorId])
              }}
            >
              {e.VendorName ?? null}
            </label>
          ),
        Current: <Typography className='font-semibold font-proxima tracking-[0.02em]'>{e?.Current > 0.00 ? `$${parseFloat(e?.Current).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(0).toFixed(2)}`}</Typography>,
        '1-30': <Typography className='font-semibold font-proxima tracking-[0.02em]'>{e?.['1-30'] > 0.00 ? `$${parseFloat(e?.['1-30']).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(0).toFixed(2)}`}</Typography>,
        '31-60': <Typography className='font-semibold font-proxima tracking-[0.02em]'>{e?.['31-60'] > 0.00 ? `$${parseFloat(e?.['31-60']).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(0).toFixed(2)}`}</Typography>,
        '61-90': <Typography className='font-semibold font-proxima tracking-[0.02em]'>{e?.['61-90'] > 0.00 ? `$${parseFloat(e?.['61-90']).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(0).toFixed(2)}`}</Typography>,
        '91+': <Typography className='font-semibold font-proxima tracking-[0.02em]'>{e?.['91+'] > 0.00 ? `$${parseFloat(e?.['91+']).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(0).toFixed(2)}`}</Typography>,
        Total: <Typography className='font-semibold font-proxima tracking-[0.02em]'>{`$${parseFloat(e?.Total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? (0).toFixed(2)}`}</Typography>,
      })
  )

  const transformedVendorOptions = vendorOptions.map((option: any) => ({
    ...option,
    value: String(option.value),
  }))

  const getSpecificDateForReportPeriod = (value: any) => {
    let currentDate = new Date()

    switch (value) {
      case 1: // Today
        currentDate.setDate(currentDate.getDate())
        return formatDate(currentDate)

      case 2: // Yesterday
        currentDate.setDate(currentDate.getDate() - 1)
        return formatDate(currentDate)

      case 3: // This Week (Mon)
        let firstDayOfWeekMonday = new Date(currentDate)
        let dayOfWeek = currentDate.getDay()
        let diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        firstDayOfWeekMonday.setDate(diff)

        return formatDate(firstDayOfWeekMonday)

      case 4: // Last Week (Mon)
        let previousSunday = new Date(currentDate)
        previousSunday.setDate(currentDate.getDate() - (currentDate.getDay() + 6)) // Adjust to previous week's Mon

        return formatDate(previousSunday)

      case 5: // This Month (End of Month)
        currentDate.setDate(currentDate.getDate())
        return formatDate(currentDate)

      case 6: // Last Month (End of Last Month)
        currentDate.setDate(0)
        return formatDate(currentDate)

      case 7: // This Year (End of Year)
        currentDate.setMonth(11) // December
        currentDate.setDate(31)
        return formatDate(currentDate)

      case 8:
        currentDate.setFullYear(currentDate.getFullYear() - 1)
        currentDate.setMonth(11) // December
        currentDate.setDate(31)
        return formatDate(currentDate)

      default:
        return ''
    }
  }

  const formatDate = (date: any) => {
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  useEffect(() => {
    const selectedDate = getSpecificDateForReportPeriod(1)
    setReportPeriod(selectedDate)
  }, [])

  useEffect(() => {
    setVendorValue(vendorOptions.map((option: any) => String(option.value)))
    setRunReport(false)
    setVendorBalanceSummarys([])
  }, [vendorOptions])

  useEffect(() => {
    const params = {
      Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
      StartDate: null,
      EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
      ViewBy: viewByValue,
      GroupBy: null,
      IsZeroBalance: isCheckedValue,
    }
    setVendorBalanceSummaryParams(params)
  }, [vendorValue, reportPeriod, viewByValue, isCheckedValue])

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

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  const handleDrawerClose = () => {
    getVendorDetailedModalOpen(false)
    setVendorDetailedModalOpen(false)
    dispatch(setSelectedIndex(selectedIndex))
    fetchBalanceSummary(1)
    // const params = {
    //   Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
    //   StartDate: null,
    //   EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
    //   ViewBy: viewByValue,
    //   GroupBy: null,
    //   IsZeroBalance: isCheckedValue,
    // }
    // performApiAction(
    //   dispatch,
    //   vendorAgingSummary,
    //   params,
    //   (responseData: any) => {
    //     const List = responseData
    //     setVendorBalanceSummarys(List)
    //     setRunReport(true)
    //     setIsLoading(false)
    //   },
    //   () => {
    //     setIsLoading(false)
    //   }
    // )
  }

  return (
    <>
      {vendorDetailedModalOpen ? (
        <VendorBalDetailedDrawer
          onOpen={vendorDetailedModalOpen}
          onClose={() => handleDrawerClose()}
          viewByValue={viewByValue}
          currentVendorName={vendorName}
          currentVendorId={vendorIds}
          StartDate={null}
          IsZeroBalance={isCheckedValue}
          GroupBy={1}
          EndDate={convertStringsDateToUTC(reportPeriod)}
        />
      ) : (
        <>
          <div
            className={`sticky top-0 z-[4] flex flex-col ${isExpanded ? 'h-[241px]' : 'h-[66px]'
              } items-start border-t border-lightSilver`}>
            <div className='flex w-full items-center justify-between bg-whiteSmoke h-[66px] px-5 py-4'>
              <div className='flex'>
                <Typography className='flex text-base items-center justify-center text-center !font-bold !font-proxima !tracking-[0.02em] !text-darkCharcoal'>
                  Filter Criteria
                </Typography>
              </div>
              <div
                className={`text-[1.6rem] flex cursor-pointer items-center justify-between transition-transform  ${isExpanded ? 'duration-400 rotate-180' : 'duration-200'}`}
                onClick={handleToggleExpand}>
                <ChevronDown />
              </div>
            </div>
            {isExpanded && (
              <div className={`${isExpanded ? 'z-[5]' : ''} w-full grid grid-cols-4 gap-5 p-5 border-b border-lightSilver`}>
                <div className='w-full'>
                  <Select
                    id={'ft_reportPeriod'}
                    label='Report Period'
                    placeholder={'Please Select'}
                    defaultValue={reportPeriodValue}
                    options={AsOfReportPeriodByList}
                    getValue={(value) => {
                      setReportPeriodValue(value)
                      const selectedDate = getSpecificDateForReportPeriod(value)
                      setReportPeriod(selectedDate)
                      if (value === 9) {
                        setReportPeriod('')
                      }
                    }}
                    getError={() => ''}
                  />
                </div>
                <div className='flex flex-col'>
                  <Datepicker
                    id='ft_datepicker'
                    label='As of'
                    value={reportPeriod}
                    startYear={1995}
                    endYear={2050}
                    getValue={(value: any) => {
                      if (value) {
                        const selectedDate = getSpecificDateForReportPeriod(reportPeriodValue)
                        if (!!value && !!reportPeriod && selectedDate !== value) {
                          setReportPeriodValue(9)
                          setReportPeriod(value)
                        } else {
                          setReportPeriodValue(reportPeriodValue)
                          setReportPeriod(value)
                        }
                      }
                    }}
                    getError={() => { }}
                  />
                </div>
                <div className='w-full'>
                  <Select
                    id={'ft_viewby'}
                    label='View By'
                    placeholder={'Please Select'}
                    defaultValue={viewByValue}
                    options={ViewByList}
                    getValue={(value) => setViewByValue(value)}
                    getError={() => ''}
                  />
                </div>
                <div className='w-full'>
                  <MultiSelectChip
                    type='checkbox'
                    id={'ft_vendor'}
                    label='Vendor'
                    placeholder={'Please Select'}
                    defaultValue={vendorValue}
                    options={transformedVendorOptions}
                    getValue={(value) => setVendorValue(value)}
                    getError={() => ''}
                    onSelect={() => { }}
                  />
                </div>
                {/* <div className='mt-4 flex items-center'>
                    <CheckBox
                      id='check'
                      checked={isCheckedValue}
                      onChange={(e: any) => (e.target.checked ? setIsCheckedValue(true) : setIsCheckedValue(false))}
                    />
                    <Typography className='pl-1'>Zero Balance Vendors</Typography>
                  </div> */}
                <div className='col-span-4 flex justify-end items-center w-full py-2.5'>
                  <Button
                    type='submit'
                    onClick={() => handleSubmit()}
                    className={`btn-sm !h-9 rounded-full ${runReportLoading && 'pointer-events-none opacity-80'}`}
                    variant='btn-primary'>
                    <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin laptop:mx-[34px] laptopMd:mx-[34px] lg:mx-[34px] xl:mx-[34px] hd:mx-[41px] 2xl:mx-[41px] 3xl:mx-[41px]" : "!py-1.5 cursor-pointer font-proxima h-full laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                      {runReportLoading ? <SpinnerIcon bgColor='#FFF' /> : "RUN REPORT"}
                    </label>
                  </Button>
                </div>
              </div>)}
          </div>

          {runReport && (
            <div
              className={`custom-scroll stickyTable ${isExpanded ? 'h-[calc(100vh-380px)]' : 'h-[calc(100vh-210px)]'
                } overflow-auto ${tableDynamicWidth}`}
            >
              <div className={`mainTable ${vendorBalanceSummarys.length !== 0 && 'h-0'}`}>
                <DataTable
                  zIndex={2}
                  columns={columns}
                  data={table_Data}
                  sticky
                  hoverEffect
                  isTableLayoutFixed={true}
                  userClass='innerTable sticky'
                  lazyLoadRows={lazyRows}
                  getExpandableData={() => { }}
                  getRowId={() => { }}
                />
                {isLazyLoading && !isLoading && (
                  <Loader size='sm' helperText />
                )}
                <div ref={tableBottomRef} />
              </div>
              {noDataContent}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default VendorBalanceSummary
