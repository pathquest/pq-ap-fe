import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { BillAnalysisDetailColumns, GroupByList, SelectRangeReportPeriodByList, ViewByList } from '@/data/reports'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { billAnalysis, billAnalysisDetail, getBillAnalysisColumnMapping } from '@/store/features/reports/reportsSlice'
import { convertStringsDateToUTC, convertStringsToIntegers } from '@/utils'
import { format } from 'date-fns'
import { BasicTooltip, Button, CheckBox, DataTable, Datepicker, DatepickerRange, Loader, MultiSelectChip, Select, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'
import ColumnFilter from '../columnFilter/ColumnFilter'
import { setIsVisibleSidebar, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import { useRouter } from 'next/navigation'
// import ColumnFilter from '@/components/Common/Custom/ColumnFilter'

function BillAnalysis({ vendorOptions, locationOptions, setBillAnalysisParams, setDetailsView, termOptions }: any) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  const { selectedCompany } = useAppSelector((state) => state.user)
  const AccountingTool: any = selectedCompany?.accountingTool
  const userId = localStorage.getItem('UserId')

  const [mapColId, setMapColId] = useState<number>(-1)
  const [headersDropdown, setHeadersDropdown] = useState<Object[]>([])
  const [columnListVisible, setColumnListVisible] = useState<Object[]>([])
  const [billAnalysiscolumns, setBillAnalysiscolumns] = useState<Object[]>([])

  const [vendorValue, setVendorValue] = useState<string[]>([])
  const [termValue, setTermValue] = useState<string[]>([])
  const [paymentStatusValue, setPaymentStatusValue] = useState<string[]>([])
  const [locationValue, setLocationValue] = useState<string[]>([])
  const [billAnalysisData, setBillAnalysisData] = useState([])
  const [billAnalysisDetails, setBillAnalysisDetails] = useState([])

  const [viewByValue, setViewByValue] = useState<number>(2)
  const [reportPeriodValue, setReportPeriodValue] = useState<number>(1)
  const [reportPeriod, setReportPeriod] = useState<string>('')

  const [runReport, setRunReport] = useState<boolean>(false)
  const [isRunReportLoading, setIsRunReportLoading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectDateRangeStatus, setSelectDateRangeStatus] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)

  const [isCheckedValue, setIsCheckedValue] = useState<boolean>(false)
  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptopMd:w-[calc(100vw-200px)]')

  useEffect(() => {
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('w-full laptopMd:w-[calc(100vw-85px)]')
    } else {
      setTableDynamicWidth('w-full laptopMd:w-[calc(100vw-200px)]')
    }
  }, [isLeftSidebarCollapsed])

  const getMappingListData = () => {
    const params = {
      UserId: parseInt(userId!),
      ModuleType: 7,
    }
    performApiAction(dispatch, getBillAnalysisColumnMapping, params, (responseData: any) => {
      setMapColId(responseData?.Id)
      const obj = JSON.parse(responseData?.ColumnList)
      const data = Object.entries(obj).map(([label, value]) => {
        let columnStyle = ''
        let colalign = ''
        switch (label) {
          case 'VENDOR ID':
            columnStyle = '!w-[120px]'
            colalign = 'left'
            break
          case 'VENDOR NAME':
            columnStyle = '!w-[120px]'
            colalign = 'left'
            break
          case 'BILL STATUS':
            columnStyle = '!w-[180px]'
            colalign = 'left'
            break
          case 'LOCATION':
            columnStyle = '!w-[120px]'
            colalign = 'left'
            break
          case 'BILL DATE':
            columnStyle = '!w-[120px]'
            colalign = 'left'
            break
          case 'DUE DATE':
            columnStyle = '!w-[120px]'
            colalign = 'left'
            break
          case 'TERM':
            columnStyle = '!w-[100px]'
            colalign = 'left'
            break
          case 'BILL NUMBER':
            columnStyle = '!w-[120px]'
            colalign = 'left'
            break
          case 'AMOUNT':
            columnStyle = '!w-[120px]'
            colalign = 'right'
            break
          case 'PAYMENT STATUS':
            columnStyle = '!w-[150px]'
            colalign = 'left'
            break
          case 'PAID AMOUNT':
            columnStyle = '!w-[120px]'
            colalign = 'right'
            break
          case 'AMOUNT DUE':
            columnStyle = '!w-[120px]'
            colalign = 'right'
            break
          case 'TRANSACTION TYPE':
            columnStyle = '!w-[170px]'
            colalign = 'right'
            break
          default:
            break
        }

        return {
          header: label,
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

  const columns: any = [
    ...billAnalysiscolumns,
    !isCheckedValue && {
      header: (
        <ColumnFilter
          headers={headersDropdown.map((h: any) => (h?.header?.props ? h?.header?.props?.children : h?.header))}
          visibleHeaders={billAnalysiscolumns.map((h: any) => (h?.header?.props ? h?.header?.props?.children : h?.header))}
          columnId={mapColId}
          getMappingListData={getMappingListData}
          moduleType={7}
        />
      ),
      accessor: 'actions',
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[80px]',
    },
  ]

  const nestedColumns: any = [
    {
      header: '',
      accessor: '',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[30px]',
    },
    ...BillAnalysisDetailColumns,
  ]

  const handleColumnFilter = () => {
    const filteredColumns = columnListVisible.filter((column) => column !== undefined)
    setBillAnalysiscolumns(filteredColumns)
  }

  useEffect(() => {
    handleColumnFilter()
  }, [columnListVisible, billAnalysisData])

  const table_Data = billAnalysisData?.map(
    (e: any) =>
      new Object({
        VENDORID: <Typography>{e.VendorId ?? null}</Typography>,
        VENDORNAME:
          e.VENDORNAME?.length > 18 ? (
            <BasicTooltip position='right' content={e.VendorName} className='!m-0 !p-0 '>
              <label
                title={e.VendorName}
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
            </BasicTooltip>
          ) : (
            <label className='font-proxima text-sm tracking-[0.02em]'>{e.VendorName ?? null}</label>
          ),
        BILLSTATUS: <Typography>{e.BillStatusName ?? null}</Typography>,
        LOCATION: <Typography>{e.Location ?? null}</Typography>,
        BILLDATE: <Typography>{e.BillDate !== null ? format(e.BillDate, 'MM/dd/yyyy') : null}</Typography>,
        DUEDATE: <Typography>{e.DueDate !== null ? format(e.DueDate, 'MM/dd/yyyy') : null}</Typography>,
        Term: <Typography>{e.Term ?? null}</Typography>,
        BILLNUMBER: <div
          className='w-4/5 cursor-pointer'
          onClick={() => {
            dispatch(setIsVisibleSidebar(false))
            e.Id && router.push(`/reports/view/${e.Id}`)
          }}
        >
          <Typography className='!text-sm text-darkCharcoal !tracking-[0.02em]'>{e.BillNumber ? e.BillNumber : ''}</Typography>
        </div>,
        AMOUNT: <Typography className='font-semibold'>${e.Amount == null ? '0.00' : parseFloat(e.Amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>,
        PAYMENTSTATUS: (
          <Typography className='px-4'>
            {e.PaymentStatusName
              ? e.PaymentStatusName.charAt(0).toUpperCase() + e.PaymentStatusName.slice(1).toLowerCase()
              : null}
          </Typography>
        ),
        PAIDAMOUNT: (
          <Typography className='font-semibold'>
            ${e.PaidAmount ? parseFloat(e.PaidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (0).toFixed(2)}
          </Typography>
        ),
        AMOUNTDUE: (
          <Typography className='font-semibold'>${e.AmountDue == null ? '0.00' : parseFloat(e.AmountDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
        ),
        TRANSACTIONTYPE: (
          <Typography>{e.ProcessName ?? null}</Typography>
        )
      })
  )

  const table_Data_Details = billAnalysisDetails && billAnalysisDetails.map((d: any) => {
    return {
      VENDORID: <Typography className='font-semibold !text-sm !tracking-[0.02em]'>{d.VendorId ?? null}</Typography>,
      VENDORNAME:
        d.Vendor?.length > 18 ? (
          <BasicTooltip position='right' content={d.Vendor} className='!m-0 !p-0 '>
            <label
              className='font-semibold text-sm cursor-pointer'
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
          <label className='font-semibold font-proxima text-sm'>{d.Vendor ?? null}</label>
        ),
      details: (
        <div className={`custom-scroll max-h-64 w-full !min-w-full overflow-y-auto`}>
          <DataTable
            columns={nestedColumns}
            noHeader
            data={
              d.BillAnaSumm?.length > 0 &&
              d.BillAnaSumm.map(
                (e: any) =>
                  new Object({
                    ...e,
                    BILLSTATUS: <Typography>{e.BillStatusName ?? null}</Typography>,
                    LOCATION: <Typography>{e.Location ?? null}</Typography>,
                    BILLDATE: <Typography>{e.BillDate !== null ? format(e.BillDate, 'MM/dd/yyyy') : null}</Typography>,
                    DUEDATE: <Typography>{e.DueDate !== null ? format(e.DueDate, 'MM/dd/yyyy') : null}</Typography>,
                    Term: <Typography>{e.Term ?? null}</Typography>,
                    BILLNUMBER: <div
                      className='w-4/5 cursor-pointer'
                      onClick={() => {
                        dispatch(setIsVisibleSidebar(false))
                        e.Id && router.push(`/reports/view/${e.Id}`)
                      }}
                    >
                      <Typography className='!text-sm text-darkCharcoal !tracking-[0.02em]'>{e.BillNumber ? e.BillNumber : ''}</Typography>
                    </div>,
                    AMOUNT: (
                      <Typography className='font-semibold'>
                        ${e.Amount == null ? '0.00' : parseFloat(e.Amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    ),
                    PAYMENTSTATUS: (
                      <Typography className='px-4'>
                        {e.PaymentStatusName
                          ? e.PaymentStatusName.charAt(0).toUpperCase() + e.PaymentStatusName.slice(1).toLowerCase()
                          : null}
                      </Typography>
                    ),
                    PAIDAMOUNT: (
                      <Typography className='font-semibold'>
                        ${e.PaidAmount == null ? '0.00' : parseFloat(e.PaidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    ),
                    AMOUNTDUE: (
                      <Typography className='font-semibold'>
                        ${e.AmountDue == null ? '0.00' : parseFloat(e.AmountDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    ),
                    TRANSACTIONTYPE: (
                      <Typography>{e.ProcessName ?? null}</Typography>
                    )
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
    }
  })

  const handleSubmit = () => {
    setIsLoading(true)
    setIsRunReportLoading(true)
    if (
      reportPeriod.trim().length > 0
    ) {
      const dateRangeVal = reportPeriod?.split('to')
      const params = {
        Vendors: vendorValue.length > 0 ? vendorValue.length === vendorOptions.length ? null : vendorValue : null,
        LocationIds: locationValue.length > 0 ? locationValue.length === locationOptions.length ? null : locationValue : null,
        StartDate:
          reportPeriodValue === 8
            ? dateRangeVal[0]?.trim() === ''
              ? null
              : convertStringsDateToUTC(dateRangeVal[0]?.trim()) ?? null
            : null,
        EndDate:
          reportPeriodValue === 8
            ? dateRangeVal[1]?.trim() === ''
              ? null : convertStringsDateToUTC(dateRangeVal[1]?.trim()) ?? null
            : convertStringsDateToUTC(reportPeriod),
        ViewBy: viewByValue,
        TermIds: AccountingTool !== 3 ? termValue.length > 0 ? termValue.length === termOptions.length ? null : termValue : null : null,
        PaymentStatus: paymentStatusValue.length > 0 ? convertStringsToIntegers(paymentStatusValue) : null,
        PageNumber: 1,
        PageSize: 100,
        SortColumn: null,
        SortOrder: 0,
      }
      if (isCheckedValue) {
        performApiAction(
          dispatch,
          billAnalysisDetail,
          params,
          (responseData: any) => {
            const List = responseData
            setBillAnalysisDetails(List)
            setRunReport(true)
            setIsLoading(false)
            setIsRunReportLoading(false)
            List.length > 0 && setIsExpanded(false)
          },
          () => {
            setIsRunReportLoading(false)
            setIsLoading(false)
          }
        )
      } else {
        performApiAction(
          dispatch,
          billAnalysis,
          params,
          (responseData: any) => {
            const List = responseData.BillAnaSumm
            setBillAnalysisData(List)
            setRunReport(true)
            setIsLoading(false)
            setIsRunReportLoading(false)
            List.length > 0 && setIsExpanded(false)
          },
          () => {
            setIsLoading(false)
            setIsRunReportLoading(false)
          }
        )
      }
    } else {
      setRunReport(false)
      setIsLoading(false)
      setIsRunReportLoading(false)
      Toast.error('Please select the date range in order to run the report')
    }
  }

  useEffect(() => {
    const { startDate, endDate }: any = getSpecificDateForReportPeriod(1)
    setReportPeriod(`${endDate}`)
    setPaymentStatusValue(GroupByList.map((option: any) => String(option.value)))
  }, [])

  const getSpecificDateForReportPeriod = (value: any) => {
    let currentDate = new Date()

    switch (value) {
      case 1:
        let firstDayOfMonth1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
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
        return {
          startDate: formatDate(previousMonday),
          endDate: formatDate(previousSunday),
        }

      case 4:
        let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        return {
          startDate: formatDate(firstDayOfMonth),
          endDate: formatDate(currentDate),
        }

      case 5:
        let firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        let lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
        return {
          startDate: formatDate(firstDayOfLastMonth),
          endDate: formatDate(lastDayOfLastMonth),
        }

      case 6:
        let firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1)
        return {
          startDate: formatDate(firstDayOfYear),
          endDate: formatDate(currentDate),
        }

      case 7:
        let firstDayOfLastYear = new Date(currentDate.getFullYear() - 1, 0, 1)
        let lastDayOfLastYear = new Date(currentDate.getFullYear() - 1, 11, 31)
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
    setVendorValue(vendorOptions.map((option: any) => String(option.value)))
    setLocationValue(locationOptions.map((option: any) => String(option.value)))
    setTermValue(termOptions.map((option: any) => String(option.value)))
    setRunReport(false)
    setBillAnalysisDetails([])
    setBillAnalysisData([])
  }, [vendorOptions, locationOptions, termOptions])

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
          : null,
      EndDate:
        reportPeriodValue === 8
          ? dateRangeVal[1]?.trim() === ''
            ? convertStringsDateToUTC(dateRangeVal[1]?.trim())
            : null
          : reportPeriod !== '' ? convertStringsDateToUTC(reportPeriod) : null,
      ViewBy: viewByValue,
      TermIds: AccountingTool !== 3 ? termValue : null,
      PaymentStatus: paymentStatusValue.length > 0 ? convertStringsToIntegers(paymentStatusValue) : null,
      PageNumber: 1,
      PageSize: 100,
      SortColumn: null,
      SortOrder: 0,
    }
    setBillAnalysisParams(params)
    setDetailsView(isCheckedValue)
  }, [runReport, vendorValue, reportPeriod, viewByValue, termValue, paymentStatusValue, locationValue, isCheckedValue])

  const transformedVendorOptions = vendorOptions.map((option: any) => ({
    ...option,
    value: String(option.value),
  }))

  const transformedLocationOptions = locationOptions.map((option: any) => ({
    ...option,
    value: String(option.value),
  }))

  const transformedTermOptions = termOptions.map((option: any) => ({
    ...option,
    value: String(option.value),
  }))

  let noDataContent

  if (isCheckedValue ? table_Data_Details.length === 0 : table_Data.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className={`fixed flex h-[59px] w-full items-center justify-center border-b border-b-[#ccc]`}>
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
      <div
        className={`sticky top-0 z-[4] flex flex-col ${isExpanded ? 'h-[320px]' : 'h-[66px]'
          } items-start border-t border-lightSilver`}
      >
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
                  }
                }}
                getError={() => ''}
              />
            </div>
            <div className='flex flex-col'>
              {!selectDateRangeStatus ? (
                <Datepicker
                  key={reportPeriod}
                  id='ft_datepicker123'
                  label='As of'
                  value={reportPeriod}
                  startYear={1995}
                  endYear={2050}
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
                  startYear={1995}
                  endYear={2050}
                  getValue={(value) => {
                    setReportPeriod(value)

                  }}
                  getError={() => { }}
                />
              )}
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
                options={transformedVendorOptions.length > 0 ? transformedVendorOptions : []}
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
                options={transformedLocationOptions.length > 0 ? transformedLocationOptions : []}
                getValue={(value) => setLocationValue(value)}
                getError={() => ''}
                onSelect={() => { }}
              />
            </div>
            <div className='w-full'>
              <MultiSelectChip
                type='checkbox'
                id={'ft_status'}
                label='Payment Status'
                placeholder={'Please Select'}
                defaultValue={paymentStatusValue}
                options={GroupByList}
                getValue={(value) => {
                  setPaymentStatusValue(value)
                }}
                getError={() => ''}
                onSelect={() => { }}
              />
            </div>
            {AccountingTool !== 3 && (
              <div className='w-full'>
                <MultiSelectChip
                  type='checkbox'
                  id={'ft_term'}
                  label='Term'
                  placeholder={'Please Select'}
                  defaultValue={termValue}
                  options={transformedTermOptions.length > 0 ? transformedTermOptions : []}
                  getValue={(value) => setTermValue(value)}
                  getError={() => ''}
                  onSelect={() => { }}
                />
              </div>
            )}
            <div className='w-full flex items-center'>
              <div className='w-2/5'>
                <CheckBox
                  id='check'
                  className='!w-[10px] !font-proxima !text-sm !tracking-[0.02em]'
                  label='Detailed View'
                  checked={isCheckedValue}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      setIsCheckedValue(true)
                      setRunReport(false)
                      setBillAnalysisData([])
                    } else {
                      setIsCheckedValue(false)
                      setRunReport(false)
                      setBillAnalysisDetails([])
                    }
                  }}
                />
              </div>
              <div className='w-3/5 flex justify-end'>
                <Button
                  type='submit'
                  onClick={() => {
                    getMappingListData()
                    handleSubmit()
                  }}
                  className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
                  variant='btn-primary'>
                  <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin laptop:mx-[34px] laptopMd:mx-[34px] lg:mx-[34px] xl:mx-[34px] hd:mx-[41px] 2xl:mx-[41px] 3xl:mx-[41px]" : "!py-1.5 cursor-pointer font-proxima h-full laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                    {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "RUN REPORT"}
                  </label>
                </Button>
              </div>
            </div>
          </div>)}
      </div>

      {runReport && (
        <div
          className={`custom-scroll stickyTable ${isExpanded ? 'h-[calc(100vh-400px)]' : 'h-[calc(100vh-210px)]'
            } overflow-auto ${tableDynamicWidth}`}
        >
          <div
            className={`mainTable ${isCheckedValue ? billAnalysisDetails.length !== 0 : billAnalysisData.length !== 0 && 'h-0'}`}
          >
            <DataTable
              zIndex={2}
              columns={isCheckedValue ? BillAnalysisDetailColumns : columns}
              data={isCheckedValue ? table_Data_Details : table_Data}
              sticky
              hoverEffect
              isTableLayoutFixed
              isExpanded={isCheckedValue ? true : false}
              expandable
              expandOneOnly={isCheckedValue ? false : true}
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

export default BillAnalysis
