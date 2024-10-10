import { AsOfReportPeriodByList, BillsPaymentcolumns, GroupByListVendorAging, ViewByList } from '@/data/reports'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { Button, DataTable, Datepicker, Loader, MultiSelectChip, Select, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { convertStringsDateToUTC } from '@/utils'
import { billPayments } from '@/store/features/reports/reportsSlice'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { format } from 'date-fns'
import DoubleArrowDown from '@/assets/Icons/notification/DoubleArrowDown'
import DownArrowIcon from '@/assets/Icons/billposting/DownArrowIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { setIsVisibleSidebar, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import { useRouter } from 'next/navigation'

function BillPayment({ vendorOptions, locationOptions, setBillPaymentParams }: any) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [runReport, setRunReport] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [billPaymentsData, setBillPaymentsData] = useState([])

  const [vendorValue, setVendorValue] = useState<string[]>([])
  const [locationValue, setLocationValue] = useState<string[]>([])
  const [viewByValue, setViewByValue] = useState<number>(2)
  const [groupByValue, setGroupByValue] = useState<number>(1)
  const [reportPeriodValue, setReportPeriodValue] = useState<number>(1)
  const [reportPeriod, setReportPeriod] = useState<string>('')

  const handleSubmit = () => {
    setIsLoading(true)
    if (reportPeriod.trim().length > 0) {
      const params = {
        Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
        LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
        StartDate: null,
        EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
        ViewBy: viewByValue,
        GroupBy: groupByValue,
        PageNumber: 1,
        PageSize: 100,
        SortColumn: 'BillNumber',
        SortOrder: 0,
      }
      performApiAction(
        dispatch,
        billPayments,
        params,
        (responseData: any) => {
          const List = responseData
          setBillPaymentsData(List)
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

  const getNestedColumns = (groupByValue: any) => {
    return [
      {
        header: groupByValue === 1 ? 'Due Date' : 'Vendor',
        accessor: 'Vendor',
        sortable: false,
        colalign: 'left',
        colStyle: '!w-[120px]',
      },
      {
        header: 'Bill Number',
        accessor: 'BillNumber',
        sortable: false,
        colalign: 'left',
        colStyle: '!w-[120px]',
      },
      {
        header: 'Bill Date',
        accessor: 'BillDate',
        sortable: false,
        colalign: 'left',
        colStyle: '!w-[120px]',
      },
      {
        header: 'Location',
        accessor: 'Location',
        sortable: false,
        colalign: 'left',
        colStyle: '!w-[120px]',
      },
      {
        header: 'Payment Status',
        accessor: 'PaymentStatus',
        sortable: false,
        colalign: 'left',
        colStyle: '!w-[120px]',
      },
      {
        header: 'Amount',
        accessor: 'Amount',
        sortable: false,
        colalign: 'right',
        colStyle: '!w-[120px]',
      },
    ]
  }

  const [columns, setColumns] = useState<any>(getNestedColumns(groupByValue))

  const nestedColumns = [
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[35px]',
    },
    ...columns,
  ]
  const table_Data = billPaymentsData?.map(
    (e: any) =>
      new Object({
        Vendor:
          e.ParentColumn?.length > 20 ? (
            <label
              title={e.ParentColumn}
              className='cursor-pointer font-semibold'
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {e.ParentColumn ?? null}
            </label>
          ) : (
            <label className='font-proxima font-semibold text-sm'>{e.ParentColumn ?? null}</label>
          ),
        details: (
          <div className={`custom-scroll max-h-64 w-full !min-w-full overflow-y-auto`}>
            <DataTable
              columns={nestedColumns}
              noHeader
              data={
                e.PamentsData?.length > 0 &&
                e.PamentsData.map(
                  (e: any) =>
                    new Object({
                      ...e,
                      Vendor: (
                        <label className='font-proxima text-sm'>
                          {groupByValue === 1
                            ? `${e.DueDate !== null ? format(e.DueDate, 'MM/dd/yyyy') : null}`
                            : e.Vendor ?? null}{' '}
                        </label>
                      ),
                      BillNumber: <div
                        className='w-4/5 cursor-pointer'
                        onClick={() => {
                          dispatch(setIsVisibleSidebar(false))
                          e.Id && router.push(`/reports/view/${e.Id}`)
                        }}
                      >
                        <Typography className='!text-sm text-darkCharcoal !tracking-[0.02em]'>{e.BillNumber ? e.BillNumber : ''}</Typography>
                      </div>,
                      BillDate: <Typography>{e.BillDate !== null ? format(e.BillDate, 'MM/dd/yyyy') : null}</Typography>,
                      Location: <Typography>{e.Location ?? null}</Typography>,
                      PaymentStatus: <Typography className='!text-sm'>{e.PaymentStatus ?? null}</Typography>,
                      Amount: (
                        <Typography className='font-proxima text-sm !font-bold'>
                          ${e?.Amount ? parseFloat(e.Amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (0).toFixed(2)}
                        </Typography>
                      ),
                    })
                )
              }
              sticky
              hoverEffect
              getExpandableData={() => { }}
              getRowId={() => { }}
            />
          </div>
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
    if (groupByValue) {
      setRunReport(false)
      setIsExpanded(true)
      setColumns(getNestedColumns(groupByValue))
    }
  }, [groupByValue])

  useEffect(() => {
    setVendorValue(vendorOptions.map((option: any) => String(option.value)))
    setLocationValue(locationOptions.map((option: any) => String(option.value)))
    setRunReport(false)
    setBillPaymentsData([])
  }, [vendorOptions, locationOptions])

  useEffect(() => {
    const params = {
      Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
      LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
      StartDate: null,
      EndDate: reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
      ViewBy: viewByValue,
      GroupBy: groupByValue,
    }
    setBillPaymentParams(params)
  }, [reportPeriod, vendorValue, viewByValue, locationValue, groupByValue])

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
        <div className={`flex h-[44px] w-full items-center justify-center border-b border-b-[#ccc]`}>
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
              <Select
                id={'ft_groupby'}
                label='Group By'
                placeholder={'Please Select'}
                defaultValue={groupByValue}
                options={GroupByListVendorAging}
                getValue={(value) => setGroupByValue(value)}
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
            <div className='col-span-2 flex justify-end items-center w-full py-2.5'>
              <Button
                type='submit'
                onClick={() => handleSubmit()}
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
            } overflow-auto`}
        >
          <div className={`mainTable ${billPaymentsData.length !== 0 && 'h-0'}`}>
            <DataTable
              zIndex={2}
              columns={columns}
              data={table_Data}
              sticky
              hoverEffect
              expandable
              isExpanded
              expandOneOnly={false}
              isTableLayoutFixed={true}
              getExpandableData={() => { }}
              getRowId={() => { }}
            />
          </div>
          {noDataContent}
        </div>
      )}
    </>
  )
}

export default BillPayment
