import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { toInitCap } from '@/components/Common/Functions/FormatText'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { AsOfReportPeriodByList, ViewByList } from '@/data/reports'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getUnpaidBillsColumnMapping, unpaidBills } from '@/store/features/reports/reportsSlice'
import { convertStringsDateToUTC } from '@/utils'
import { format } from 'date-fns'
import { Button, DataTable, Datepicker, Loader, MultiSelectChip, Select, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'
import ColumnFilter from '../columnFilter/ColumnFilter'

function UnpaidBills({ vendorOptions, locationOptions, setUnpaidBillsParams }: any) {
  const dispatch = useAppDispatch()
  const userId = localStorage.getItem('UserId')

  const [mapColId, setMapColId] = useState<number>(-1)
  const [reportPeriodValue, setReportPeriodValue] = useState<number>(1)
  const [headersDropdown, setHeadersDropdown] = useState<Object[]>([])
  const [columnListVisible, setColumnListVisible] = useState<Object[]>([])
  const [unpaidBillscolumns, setUnpaidBillscolumns] = useState<Object[]>([])

  const [runReport, setRunReport] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [unpaidBillsData, setUnpaidBillsData] = useState([])

  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-180px)]')

  const [vendorValue, setVendorValue] = useState<string[]>([])
  const [locationValue, setLocationValue] = useState<string[]>([])
  const [viewByValue, setViewByValue] = useState<number>(2)
  const [reportPeriod, setReportPeriod] = useState<string>('')

  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-78px)]')
    } else {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-180px)]')
    }
  }, [isLeftSidebarCollapsed])

  const getMappingListData = async () => {
    const params = {
      UserId: parseInt(userId!),
      ModuleType: 6,
    }

    performApiAction(dispatch, getUnpaidBillsColumnMapping, params, (responseData: any) => {
      setMapColId(responseData?.Id)
      const obj = JSON.parse(responseData?.ColumnList)
      const data = Object.entries(obj).map(([label, value]) => {
        let columnStyle = ''
        let colalign = ''
        switch (label) {
          case 'VENDOR':
            columnStyle = '!pl-5 !w-[150px]'
            break
          case 'BILL DATE':
            columnStyle = '!w-[150px]'
            break
          case 'TRANSACTION TYPE':
            columnStyle = '!w-[200px]'
            break
          case 'BILL NUMBER':
            columnStyle = '!w-[150px]'
            colalign = 'left'
            break
          case 'LOCATION':
            columnStyle = '!w-[150px]'
            colalign = 'left'
            break
          case 'DUE DATE':
            columnStyle = '!w-[150px]'
            colalign = 'left'
            break
          case 'AGING DAYS':
            columnStyle = '!w-[150px]'
            colalign = 'left'
            break
          case 'AMOUNT':
            columnStyle = '!w-[150px]'
            colalign = 'right'
            break
          case 'OPEN BALANCE':
            columnStyle = '!w-[150px]'
            colalign = 'right'
            break
          default:
            break
        }

        return {
          header: toInitCap(label),
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
    })
  }

  const columns: any = [
    ...unpaidBillscolumns,
    {
      header: (
        <ColumnFilter
          headers={headersDropdown.map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          visibleHeaders={unpaidBillscolumns.map((h: any) => (h?.header.props ? h?.header?.props?.children : h?.header))}
          columnId={mapColId}
          getMappingListData={getMappingListData}
          moduleType={6}
          maxHeight={!isExpanded ? 'calc(100vh - 350px)' : 'calc(100vh - 360px)'}
        />
      ),
      accessor: 'actions',
      sortable: false,
      colStyle: '!w-[50px]',
    },
  ]

  const handleColumnFilter = () => {
    const filteredColumns = columnListVisible.filter((column) => column !== undefined)
    setUnpaidBillscolumns(filteredColumns)
  }

  useEffect(() => {
    handleColumnFilter()
  }, [columnListVisible, unpaidBillsData])

  const handleSubmit = () => {
    setIsLoading(true)
    if (reportPeriod.trim().length > 0) {
      const params = {
        Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
        LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
        StartDate: null,
        EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
        ViewBy: viewByValue,
      }

      performApiAction(
        dispatch,
        unpaidBills,
        params,
        (responseData: any) => {
          const List = responseData.UnpaidBills
          setUnpaidBillsData(List)
          setRunReport(true)
          setIsLoading(false)
          List.length > 0 && setIsExpanded(false)
        },
        () => {
          setIsLoading(false)
        }
      )
    } else {
      setRunReport(false)
      setIsLoading(false)
      Toast.error('Please select the date in order to run the report')
    }
  }

  const getProcessLabel = (process: number): string => {
    switch (process) {
      case 1:
        return 'Accounts Payable'
      case 2:
        return 'Accounts Adjustment'
      case 3:
        return 'Other'
      default:
        return ''
    }
  }

  const table_Data = unpaidBillsData?.map(
    (e: any) =>
      new Object({
        VENDOR:
          e.Vendor?.length > 18 ? (
            <label
              title={e.Vendor}
              className='cursor-pointer pl-3 font-proxima tracking-[0.02em]'
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {e.Vendor}
            </label>
          ) : (
            <label className='pl-3 font-proxima tracking-[0.02em]'>{e.Vendor ?? null}</label>
          ),
        BILLDATE: <Typography>{e.BillDate !== null ? format(e.BillDate, 'MM/dd/yyyy') : null}</Typography>,
        TRANSACTIONTYPE: <Typography>{getProcessLabel(e.TransactionType)}</Typography>,
        BILLNUMBER: <Typography>{e.BillNumber ?? null}</Typography>,
        LOCATION: <Typography>{e.Location ?? null}</Typography>,
        DUEDATE: <Typography>{e.DueDate !== null ? format(e.DueDate, 'MM/dd/yyyy') : null}</Typography>,
        AGINGDAYS: <Typography>{e.AgingDays ?? null}</Typography>,
        AMOUNT: (
          <Typography className='font-proxima text-sm !font-bold'>
            ${e?.Amount ? parseFloat(e.Amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (0).toFixed(2)}
          </Typography>
        ),
        OPENBALANCE: (
          <Typography className='font-proxima text-sm !font-bold'>
            ${e?.OpenBalance ? parseFloat(e.OpenBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (0).toFixed(2)}
          </Typography>
        ),
      })
  )

  const getSpecificDateForReportPeriod = (value: any) => {
    let currentDate = new Date()

    switch (value) {
      case 1: // Today
        currentDate.setDate(currentDate.getDate())
        return formatDate(currentDate)

      case 2: // Yesterday
        currentDate.setDate(currentDate.getDate() - 1)
        return formatDate(currentDate)

      case 3: // This Week (Sunday)
        let firstDayOfWeekMonday = new Date(currentDate)
        let dayOfWeek = currentDate.getDay()
        let diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        firstDayOfWeekMonday.setDate(diff)

        return formatDate(firstDayOfWeekMonday)

      case 4: // Last Week (Sunday)
        let previousSunday = new Date(currentDate)
        previousSunday.setDate(currentDate.getDate() - currentDate.getDay() - 7) // Adjust to previous week's Sunday

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
    setLocationValue(locationOptions.map((option: any) => String(option.value)))
    setRunReport(false)
    setUnpaidBillsData([])
  }, [vendorOptions, locationOptions])

  useEffect(() => {
    const params = {
      Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
      LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
      StartDate: null,
      EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
      ViewBy: viewByValue,
    }
    setUnpaidBillsParams(params)
  }, [reportPeriod, vendorValue, viewByValue, locationValue])

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
        <div className={`fixed font-proxima flex h-[44px] w-full items-center justify-center border-b border-b-[#ccc]`}>
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

  return (
    <>
      <div className={`sticky top-0 z-[4] flex flex-col ${isExpanded ? 'h-[225px]' : 'h-[51px]'} items-start border-t border-lightSilver`}>
        <div className='flex w-full items-center justify-between bg-whiteSmoke h-[50px] px-5 py-4'>
          <div className='flex'>
            <Typography className='flex !text-base items-center justify-center text-center !font-bold !font-proxima !tracking-[0.02em] !text-darkCharcoal'>
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
          <div className={`w-full grid grid-cols-4 gap-5 p-5 border-b border-lightSilver`}>
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
                startYear={1900}
                endYear={2099}
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
                options={vendorOptions.map((option: any) => ({
                  ...option,
                  value: String(option.value),
                }))}
                getValue={(value) => setVendorValue(value)}
                getError={() => ''}
                onSelect={() => { }}
              />
            </div>
            <div className='w-full'>
              <MultiSelectChip
                type='checkbox'
                id={'ft_location'}
                label='Location'
                placeholder={'Location'}
                defaultValue={locationValue}
                options={locationOptions.map((option: any) => ({
                  ...option,
                  value: String(option.value),
                }))}
                getValue={(value) => setLocationValue(value)}
                getError={() => ''}
                onSelect={() => { }}
              />
            </div>
            <div className='col-span-3 flex justify-end items-center w-full py-2.5'>
              <Button
                type='submit'
                onClick={() => {
                  handleSubmit()
                  getMappingListData()
                }}
                className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
                variant='btn-primary'>
                <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin laptop:mx-[34px] laptopMd:mx-[34px] lg:mx-[34px] xl:mx-[34px] hd:mx-[41px] 2xl:mx-[41px] 3xl:mx-[41px]" : "!py-1.5 cursor-pointer font-proxima h-full laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                  {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "RUN REPORT"}
                </label>
              </Button>
            </div>
          </div>)}
      </div>

      {runReport && (
        <div
          className={`custom-scroll stickyTable ${isExpanded ? 'h-[calc(100vh-335px)]' : 'h-[calc(100vh-162px)]'
            } overflow-auto ${tableDynamicWidth}`}
        >
          <DataTable
            zIndex={2}
            columns={columns}
            data={table_Data}
            sticky
            hoverEffect
            isTableLayoutFixed={true}
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
          {unpaidBillsData.length === 0 && noDataContent}
        </div>
      )}
    </>
  )
}

export default UnpaidBills
