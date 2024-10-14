import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { ApLedgercolumns, SelectRangeReportPeriodByList } from '@/data/reports'
import { useAppDispatch } from '@/store/configureStore'
import { vendorBalanceDetail } from '@/store/features/reports/reportsSlice'
import { convertStringsDateToUTC } from '@/utils'
import { format } from 'date-fns'
import { Button, DataTable, Datepicker, DatepickerRange,BasicTooltip, Loader, MultiSelectChip, Select, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

function APLedger({ vendorOptions, locationOptions, setAPLedgerParams }: any) {
  const dispatch = useAppDispatch()
  const [reportPeriod, setReportPeriod] = useState<string>('')
  const [vendorBillDate, setVendorBillDate] = useState<string>('')
  const [vendorStartDate, setVendorStartDate] = useState<string>('')

  const [runReport, setRunReport] = useState<boolean>(false)
  const [selectDateRangeStatus, setSelectDateRangeStatus] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apLedgerData, setApLedgerData] = useState([])
  const [locationValue, setLocationValue] = useState<string[]>([])
  const [viewByValue, setViewByValue] = useState<number>(2)
  const [reportPeriodValue, setReportPeriodValue] = useState<number>(1)
  const [vendorValue, setVendorValue] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState<boolean>(true)

  const nestedColumns: any = [
    {
      header: '',
      accessor: '',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[40px]',
    },
    {
      header: 'Date',
      accessor: 'BillDate',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[150px] !tracking-[0.02em]',
    },
    {
      header: 'Transaction Type',
      accessor: 'TransactionType',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[180px] !tracking-[0.02em]',
    },
    {
      header: 'Bill Number',
      accessor: 'BillNumber',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[150px] !tracking-[0.02em]',
    },
    {
      header: 'Location',
      accessor: 'Location',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[120px] !tracking-[0.02em]',
    },
    {
      header: 'Due Date',
      accessor: 'DueDate',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[120px] !tracking-[0.02em]',
    },
    {
      header: 'Charges',
      accessor: 'Charges',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[120px] !tracking-[0.02em]',
    },
    {
      header: 'Payments',
      accessor: 'Payments',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[120px] !tracking-[0.02em]',
    },
    {
      header: 'Balance',
      accessor: 'Balance',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[120px] !tracking-[0.02em]',
    },
  ]

  const getTransactionTypeLabel = (transactionType: number): string => {
    switch (transactionType) {
      case 1:
        return 'Accounts Payable'
      case 2:
        return 'Accounts Adjustment'
      case 3:
        return 'Other'
      case 4:
        return 'Balance Forward'
      default:
        return ''
    }
  }

  const table_Data: any =
    apLedgerData &&
    apLedgerData.map((d: any) => {
      return {
        Vendor:
          d.Vendor?.length > 20 ? (
            <BasicTooltip position='right' content={d.Vendor} className='!m-0 !p-0 '>
              <label
                className='cursor-pointer font-semibold'
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.Vendor ?? null}
              </label>
            </BasicTooltip>
          ) : (
            <label className='font-proxima font-semibold text-sm tracking-[0.02em]'>{d.Vendor ?? null}</label>
          ),
        details: (
          <div className={`custom-scroll max-h-64 w-full overflow-y-auto`}>
            <DataTable
              columns={nestedColumns}
              noHeader
              data={
                d.Data?.length > 0 &&
                d.Data.map(
                  (nestedData: any) =>
                    new Object({
                      ...nestedData,
                      BillDate: (
                        <div className='flex items-center gap-4 font-medium'>
                          <span className='font-proxima !text-sm !tracking-[0.02em]'>
                            {nestedData?.BillDate !== null ? format(nestedData.BillDate, 'MM/dd/yyyy') : null}
                          </span>
                        </div>
                      ),
                      Location: <Typography>{nestedData.Location ?? null}</Typography>,
                      DueDate: (
                        <div className='flex items-center gap-4 font-medium'>
                          <span className='font-proxima !text-sm !tracking-[0.02em]'>
                            {nestedData?.DueDate !== null ? format(nestedData.DueDate, 'MM/dd/yyyy') : null}
                          </span>
                        </div>
                      ),
                      TransactionType: <Typography>{getTransactionTypeLabel(nestedData.TransactionType)}</Typography>,
                      Charges: (
                        <div className='flex items-center gap-4 font-medium'>
                          <label className='font-proxima text-sm !font-bold  !tracking-[0.02em] text-[#333333]'>
                            {nestedData.TransactionType !== 4
                              ? nestedData?.Charges
                                ? `${parseFloat(nestedData.Charges) < 0 ? '-' : ''}$${Math.abs(parseFloat(nestedData.Charges)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                }`
                                : `$${(0).toFixed(2)}` : null
                            }
                          </label>
                        </div>
                      ),
                      Payments: (
                        <div className='flex items-center gap-4 font-medium'>
                          <label className='font-proxima text-sm !font-bold  !tracking-[0.02em] text-[#333333]'>
                            {nestedData.TransactionType !== 4
                              ? nestedData?.Payments
                                ? `${parseFloat(nestedData.Payments) < 0 ? '-' : ''}$${Math.abs(parseFloat(nestedData.Payments)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                }`
                                : `$${(0).toFixed(2)}` : null
                            }
                          </label>
                        </div>
                      ),
                      Balance: (
                        <div className='flex items-center gap-4 font-medium'>
                          <label className='font-proxima text-sm !font-bold  !tracking-[0.02em] text-[#333333]'>
                            {nestedData?.OpeningBalance
                              ? `${parseFloat(nestedData.OpeningBalance) < 0 ? '-' : ''}$${Math.abs(parseFloat(nestedData.OpeningBalance)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              }`
                              : `$${(0).toFixed(2)}`
                            }
                          </label>
                        </div>
                      ),
                    })
                )
              }
              sticky
              hoverEffect
              getExpandableData={() => { }}
              getRowId={() => { }}
            />
            <div
              className={`sticky bottom-0 mt-[-2px] flex h-[48px] w-full items-center justify-end border-y border-black bg-whiteSmoke`}
            >
              <div className='flex gap-20'>
                <label className={`font-proxima text-sm !font-semibold uppercase !tracking-[0.02em]`}>Closing Balance </label>
                <label
                  className={`pr-2 font-proxima text-sm !font-bold !tracking-[0.02em]`}>
                  {d?.TotalVendorAmount
                    ? `${parseFloat(d?.TotalVendorAmount) < 0 ? '-' : ''}$${Math.abs(parseFloat(d?.TotalVendorAmount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${(0).toFixed(2)}`
                  }
                </label>
              </div>
            </div>
          </div>
        ),
      }
    })

  const handleSubmit = () => {
    setIsLoading(true)
    if (reportPeriod.trim().length > 0) {
      const dateRangeVal = reportPeriod?.split('to')
      const params = {
        Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
        LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
        StartDate:
          reportPeriodValue === 8
            ? dateRangeVal[0]?.trim() === ''
              ? null
              : convertStringsDateToUTC(dateRangeVal[0]?.trim()) ?? null
            : convertStringsDateToUTC(vendorStartDate),
        EndDate:
          reportPeriodValue === 8
            ? dateRangeVal[1]?.trim() === ''
              ? null : convertStringsDateToUTC(dateRangeVal[1]?.trim()) ?? null
            : convertStringsDateToUTC(reportPeriod),
        ViewBy: 1,
        PaymentStatus: null,
      }
      performApiAction(
        dispatch,
        vendorBalanceDetail,
        params,
        (responseData: any) => {
          const updatedResponseData = responseData.map((vendor: any) => {
            const newObject = {
              VendorId: '',
              VendorName: '',
              Location: '',
              TransactionType: 4,
              BillNumber: '',
              DueDate: null,
              BillDate: vendorBillDate,
              Amount: null,
              Charges: null,
              Payments: null,
              OpeningBalance: vendor?.OpeningVendorAmount,
            }
            return {
              ...vendor,
              Data: [newObject, ...vendor.Data],
            }
          })

          // Updating the state with the new Data array
          setApLedgerData(updatedResponseData)
          setRunReport(true)
          setIsLoading(false)
          updatedResponseData.length > 0 && setIsExpanded(false)
        },
        () => {
          setIsLoading(false)
        }
      )
    } else {
      setRunReport(false)
      setIsLoading(false)
      Toast.error('Please select the date range in order to run the report')
    }
  }

  const getSpecificDateForReportPeriod = (value: any) => {
    let currentDate = new Date()

    const getPreviousDate = (date: any) => {
      let previousDate = new Date(date)
      previousDate.setDate(date.getDate() - 1)
      return previousDate
    }

    switch (value) {
      case 1:
        let firstDayOfMonth1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        setVendorBillDate(formatDate(firstDayOfMonth1))
        return {
          startDate: formatDate(firstDayOfMonth1),
          endDate: formatDate(currentDate),
        }

      case 2: // This Week (Mon)
        let firstDayOfWeekMonday = new Date(currentDate)
        let dayOfWeek = currentDate.getDay()
        let diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        firstDayOfWeekMonday.setDate(diff)
        let lastDayOfWeekMonday = new Date(firstDayOfWeekMonday)
        lastDayOfWeekMonday.setDate(firstDayOfWeekMonday.getDate() + 6)
        setVendorBillDate(formatDate(getPreviousDate(firstDayOfWeekMonday)))
        return {
          startDate: formatDate(firstDayOfWeekMonday),
          endDate: formatDate(lastDayOfWeekMonday),
        }

      case 3:
        let previousMonday = new Date(currentDate)
        let previousSunday = new Date(currentDate)
        let previousWeekStart = currentDate.getDate() - currentDate.getDay() - 6
        previousMonday.setDate(previousWeekStart)
        previousSunday.setDate(previousWeekStart + 6)
        setVendorBillDate(formatDate(getPreviousDate(previousMonday)))
        return {
          startDate: formatDate(previousMonday),
          endDate: formatDate(previousSunday),
        }

      case 4:
        let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        setVendorBillDate(formatDate(firstDayOfMonth))
        return {
          startDate: formatDate(firstDayOfMonth),
          endDate: formatDate(currentDate),
        }

      case 5:
        let firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        let lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
        setVendorBillDate(formatDate(firstDayOfLastMonth))
        return {
          startDate: formatDate(firstDayOfLastMonth),
          endDate: formatDate(lastDayOfLastMonth),
        }

      case 6:
        let firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1)
        setVendorBillDate(formatDate(firstDayOfYear))
        return {
          startDate: formatDate(firstDayOfYear),
          endDate: formatDate(currentDate),
        }

      case 7:
        let firstDayOfLastYear = new Date(currentDate.getFullYear() - 1, 0, 1)
        let lastDayOfLastYear = new Date(currentDate.getFullYear() - 1, 11, 31)
        setVendorBillDate(formatDate(firstDayOfLastYear))
        return {
          startDate: formatDate(firstDayOfLastYear),
          endDate: formatDate(lastDayOfLastYear),
        }

      default:
        return {
          startDate: '',
          endDate: '',
        }
    }
  }

  const formatDate = (date: any) => {
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  useEffect(() => {
    const { startDate, endDate }: any = getSpecificDateForReportPeriod(1)
    setReportPeriod(`${endDate}`)
    setVendorStartDate(`${startDate}`)
  }, [])

  useEffect(() => {
    setVendorValue(vendorOptions.map((option: any) => String(option.value)))
    setLocationValue(locationOptions.map((option: any) => String(option.value)))
    setRunReport(false)
    setApLedgerData([])
  }, [vendorOptions, locationOptions])

  useEffect(() => {
    const dateRangeVal = reportPeriod?.split('to')
    const params = {
      Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
      LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
      StartDate:
        reportPeriodValue === 8
          ? dateRangeVal[0]?.trim() === ''
            ? null
            : convertStringsDateToUTC(dateRangeVal[0]?.trim()) ?? null
          : vendorStartDate !== ''
            ? convertStringsDateToUTC(vendorStartDate)
            : null,
      EndDate:
        reportPeriodValue === 8
          ? dateRangeVal[1]?.trim() === ''
            ? null : convertStringsDateToUTC(dateRangeVal[1]?.trim()) ?? null
          : reportPeriod !== ''
            ? convertStringsDateToUTC(reportPeriod)
            : null,
      ViewBy: 1,
      PaymentStatus: null,
    }
    setAPLedgerParams(params)
  }, [vendorValue, reportPeriodValue, reportPeriod, viewByValue, locationValue, vendorStartDate])

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
        <div className='sticky flex h-[44px] w-full items-center justify-center border-b border-b-[#ccc]'>
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
                options={SelectRangeReportPeriodByList}
                getValue={(value) => {
                  setReportPeriodValue(value)
                  if (value === 8) {
                    setSelectDateRangeStatus(true)
                    setReportPeriod('')
                  } else {
                    setSelectDateRangeStatus(false)
                    const { startDate, endDate } = getSpecificDateForReportPeriod(value)
                    setReportPeriod(`${endDate}`)
                    setVendorStartDate(`${startDate}`)
                  }
                }}
                getError={() => ''}
              />
            </div>

            <div className='flex flex-col w-full'>
              {!selectDateRangeStatus ? (
                <Datepicker
                  key={reportPeriod}
                  id='ft_datepicker123'
                  label='As of'
                  value={reportPeriod}
                  startYear={1900}
                  endYear={2099}
                  getValue={(value: any) => {
                    if (value) {
                      setReportPeriodValue(reportPeriodValue)
                      setReportPeriod(value)
                    }
                  }}
                  getError={() => { }}
                  disabled
                />
              ) : (
                <DatepickerRange
                  key={reportPeriod}
                  id='ft_datepicker'
                  label='Select Date'
                  value={reportPeriod}
                  startYear={1900}
                  endYear={2099}
                  getValue={(value) => {
                    setReportPeriod(value)
                    const dateRangeVal = reportPeriod?.split('to')
                    setVendorBillDate(dateRangeVal[0])
                  }}
                  getError={() => { }}
                />
              )}
            </div>
            {/* <div>
                <Select
                  id={'ft_viewby'}
                  label='View By'
                  placeholder={'Please Select'}
                  defaultValue={viewByValue}
                  options={ViewByList}
                  getValue={(value) => setViewByValue(value)}
                  getError={() => ''}
                />
              </div> */}
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
                getError={() => { }}
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
            <div className='col-span-4 flex justify-end items-center w-full py-2.5'>
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
          </div>
        )}
      </div>

      {runReport && (
        <div className={`custom-scroll stickyTable ${isExpanded ? 'h-[calc(100vh-335px)]' : 'h-[calc(100vh-162px)]'} overflow-auto`}>
          <div className={`mainTable ${apLedgerData.length === 0 ? 'h-11' : 'h-auto'}`}>
            <DataTable
              columns={ApLedgercolumns}
              data={table_Data}
              sticky
              zIndex={2}
              hoverEffect
              expandable
              isExpanded
              expandOneOnly={false}
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

export default APLedger
