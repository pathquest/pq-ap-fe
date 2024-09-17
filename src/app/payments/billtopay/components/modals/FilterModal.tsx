import { Button, DatepickerRangeExpanded, MinMaxRange, MultiSelectChip, Radio, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

// Store
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getLocationDropdownList, getStatusList, setFilterFormFields } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'

const FilterModal = ({ onOpen, onClose }: any) => {
  const [isDaysClicked, setIsDaysClicked] = useState<number>(0)
  const [isDueDateClicked, setIsDueDateClicked] = useState<number>(1)
  const [statusOption, setStatusOptions] = useState<any[]>([])
  const [locationList, setLocationList] = useState<any[]>([])
  const [currSelectedLocation, setCurrLoaction] = useState<any[]>([])
  const [selectedStatus, setStatus] = useState<any[]>(['1', '2'])
  const [currStartDay, setCurrStartDay] = useState<any>(null)
  const [currEndDay, setCurrEndDay] = useState<any>(null)
  const [currDueDateRange, setCurrDueDateRange] = useState<string>('')
  const [defaultStartDate, setDefaultStartDate] = useState<string>('')
  const [defaultEndDate, setDefaultEndDate] = useState<string>('')
  const [isResetClicked, setIsResetClicked] = useState<boolean>(false)
  const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const filterModalRef = useRef<HTMLDivElement>(null)
  const { filterFormFields } = useAppSelector((state: { billsToPayReducer: any }) => state.billsToPayReducer)
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)

  const handleResetAll = () => {
    setDefaultValues()
    setCurrLoaction([])
    setStatus(['1', '2'])
    setCurrStartDay(null)
    setCurrEndDay(null)
    setCurrDueDateRange(`${defaultStartDate} ${defaultStartDate !== '' && defaultEndDate !== '' ? 'to' : ''} ${defaultEndDate}`)
    setIsDaysClicked(0)
    setIsDueDateClicked(1)
    setIsResetClicked(true)
    setIsFilterChanged(true)
  }

  const handleApplyChanges = () => {
    if (selectedStatus.length === 0) {
      Toast.error('Please select at least one payment status.')
      return
    }

    if (isResetClicked) {
      dispatch(
        setFilterFormFields({
          paymentStatus: ['1', '2'],
          location: [],
          dueDateFrom: defaultStartDate,
          dueDateTo: defaultEndDate,
          dueDateRange: `${defaultStartDate} to ${defaultEndDate}`,
          isDaysClicked: 0,
          isDueDateClicked: 1,
          startDay: null,
          endDay: null,
        })
      )
      setIsResetClicked(false)
    } else {
      const dueDateStart = currDueDateRange.split(' to ')[0];
      const dueDateEnd = currDueDateRange.split(' to ')[1];
      dispatch(
        setFilterFormFields({
          paymentStatus: selectedStatus,
          location: currSelectedLocation,
          dueDateFrom: dueDateStart,
          dueDateTo: dueDateEnd,
          dueDateRange: currDueDateRange,
          isDaysClicked: isDaysClicked,
          isDueDateClicked: isDueDateClicked,
          startDay: currStartDay,
          endDay: currEndDay,
        })
      )
    }
    onClose()
  }

  const handleClose = () => {
    setCurrLoaction(filterFormFields?.location)
    setStatus(filterFormFields?.paymentStatus)
    setCurrStartDay(filterFormFields?.startDay || null)
    setCurrEndDay(filterFormFields?.endDay || null)
    setCurrDueDateRange(
      filterFormFields?.dueDateRange ||
      `${defaultStartDate} ${defaultStartDate !== '' && defaultEndDate !== '' ? 'to' : ''} ${defaultEndDate}`
    )
    onClose()
  }

  // function to access days range-picker
  const handleDaysClicked = () => {
    setIsResetClicked(false)
    setIsFilterChanged(true);
    setIsDaysClicked(1)
    setIsDueDateClicked(0)
    setCurrStartDay(filterFormFields?.startDay !== null ? filterFormFields?.startDay : 1)
    setCurrEndDay(filterFormFields?.endDay !== null ? filterFormFields?.endDay : 30)
  }

  // function to access date range
  const handleDueDateClicked = () => {
    setIsResetClicked(false)
    setIsFilterChanged(true);
    setIsDaysClicked(0)
    setIsDueDateClicked(1)
    setCurrStartDay(null)
    setCurrEndDay(null)
  }

  // Payment Status List
  const fetchStatusData = async () => {
    performApiAction(dispatch, getStatusList, null, (responseData: any) => {
      setStatusOptions(responseData ?? [])
    })
  }

  const fetchLocationDropDownList = async () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, getLocationDropdownList, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
      setLocationList(mappedList ?? [])
    })
  }

  useEffect(() => {
    if (onOpen) {
      fetchStatusData()
      fetchLocationDropDownList()
    }
  }, [onOpen, CompanyId])

  const setDefaultValues = () => {
    // Calculate default start date (Last one month)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const startDateFormatted = formatDate(lastMonth + '')

    // Calculate default end date (future one month)
    // const futureMonth = new Date()
    // futureMonth.setMonth(futureMonth.getMonth() + 1)
    // const endDateFormatted = formatDate(futureMonth + '')

    const currentDate = new Date()
    const endDateFormatted = formatDate(currentDate + '')

    setDefaultStartDate(startDateFormatted)
    setDefaultEndDate(endDateFormatted)
  }

  useEffect(() => {
    if (onOpen) {
      setIsDueDateClicked(filterFormFields?.isDaysClicked === 1 ? 0 : 1)
      setIsDaysClicked(filterFormFields?.isDaysClicked === 0 ? 0 : 1)
      setCurrLoaction(filterFormFields?.location)
      setStatus(filterFormFields?.paymentStatus || ['1', '2'])
      setCurrDueDateRange(
        filterFormFields?.dueDateRange ||
        `${defaultStartDate} ${defaultStartDate !== '' && defaultEndDate !== '' ? 'to' : ''} ${defaultEndDate}`
      )
      setCurrStartDay(filterFormFields?.startDay || null)
      setCurrEndDay(filterFormFields?.endDay || null)
      setDefaultValues()
    }
  }, [onOpen, filterFormFields, defaultStartDate, defaultEndDate, locationList])

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (filterModalRef.current && !filterModalRef.current.contains(event.target)) {
        onClose()
      }
    }
    if (onOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onOpen, onClose])



  useEffect(() => {
    // Check if any filter option has been changed
    setCurrLoaction(filterFormFields?.location)
    setStatus(filterFormFields?.paymentStatus)
    setCurrStartDay(filterFormFields?.startDay || null)
    setCurrEndDay(filterFormFields?.endDay || null)
    setCurrDueDateRange(
      filterFormFields?.dueDateRange ||
      `${defaultStartDate} ${defaultStartDate !== '' && defaultEndDate !== '' ? 'to' : ''} ${defaultEndDate}`
    )
  }, [filterFormFields]);

  useEffect(() => {
    if (onOpen) {
      const isChanged =
        JSON.stringify(currSelectedLocation) !== JSON.stringify(filterFormFields?.location) ||
        JSON.stringify(selectedStatus) !== JSON.stringify(filterFormFields?.paymentStatus) ||
        currStartDay !== filterFormFields?.startDay ||
        currEndDay !== filterFormFields?.endDay ||
        isDaysClicked !== filterFormFields?.isDaysClicked ||
        isDueDateClicked !== filterFormFields?.isDueDateClicked ||
        currDueDateRange !== filterFormFields?.dueDateRange
      setIsFilterChanged(isChanged)
    }
  }, [
    onOpen,
    filterFormFields,
    currSelectedLocation,
    selectedStatus,
    currStartDay,
    currEndDay,
    isDaysClicked,
    isDueDateClicked,
    currDueDateRange,
  ])

  return (
    <div
      className={`${onOpen &&
        'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] outline-none transition-all duration-300 ease-in-out'
        }`}
    >
      <div
        ref={filterModalRef}
        className={`top-28 z-30 w-[543px] rounded border border-lightSilver bg-pureWhite outline-none ${onOpen ? 'absolute right-[110px] translate-x-0' : ' fixed right-0 translate-x-full'
          } transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
          <span className='font-proxima text-lg font-medium text-darkCharcoal tracking-[0.02em]' tabIndex={-1}>Filter</span>
          <Button className='rounded-sm !text-base' variant="error" onClick={handleResetAll}>
            Reset All
          </Button>
        </div>

        {/* Content */}
        <div className='grid grid-cols-2 gap-5 p-5'>
          <div className='w-full'>
            <MultiSelectChip
              type='checkbox'
              label='Location(s)'
              id='locations'
              options={locationList ?? []}
              defaultValue={currSelectedLocation ?? []}
              getValue={(e) => {
                setIsResetClicked(false)
                setIsFilterChanged(true);
                setCurrLoaction(e)
              }}
              getError={() => { }}
              onSelect={() => { }}
            />
          </div>
          <div className='w-full'>
            <MultiSelectChip
              type='checkbox'
              defaultValue={selectedStatus ?? []}
              label='Status'
              id='status'
              options={statusOption ?? []}
              getValue={(e) => {
                setIsResetClicked(false)
                setIsFilterChanged(true);
                setStatus(e)
              }}
              getError={() => { }}
              onSelect={() => { }}
            />
          </div>
          <div className='flex items-center justify-start w-fit col-span-2 gap-5 -ml-[9px]'>
            <Radio
              checked={isDaysClicked === 1}
              id='days'
              label='Days'
              name='filter'
              value={isDaysClicked}
              onChange={handleDaysClicked}
            />
            <Radio
              checked={isDueDateClicked === 1}
              id='due-date'
              label='Due Date'
              name='filter'
              value={isDueDateClicked}
              onChange={handleDueDateClicked}
            />
          </div>
          <div className='w-full col-span-2'>
            {isDaysClicked === 1 && <div className='w-[70%] pt-3 pb-[38px]'>
              <MinMaxRange
                minRange={currStartDay}
                maxRange={currEndDay}
                gap={4}
                variant='line'
                minValue={0}
                maxValue={120}
                getValue={(e1, e2) => {
                  setIsResetClicked(false)
                  setIsFilterChanged(true);
                  setCurrStartDay(e1)
                  setCurrEndDay(e2)
                }}
                Numbers
              />
            </div>}
            {isDueDateClicked === 1 && <div className='w-[70%] customDatePickerRangeExpandWidth'>
              <DatepickerRangeExpanded
                label='Due Date'
                startYear={2023}
                endYear={2025}
                id='due-date'
                getValue={(dateRange) => {
                  setIsResetClicked(false)
                  setCurrDueDateRange(dateRange)
                  setIsFilterChanged(true);
                }}
                value={currDueDateRange}
                getError={() => { }}
              />
            </div>}
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end border-t border-lightSilver shadow-inner laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button tabIndex={0} onClick={handleClose} className='!h-9 rounded-full !p-0 !m-0' variant='btn-outline-primary'>
            <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
              CANCEL
            </label>
          </Button>
          <Button
            type='submit'
            tabIndex={0}
            onClick={handleApplyChanges}
            className={`h-9 rounded-full !p-0 !m-0`}
            variant={isFilterChanged ? 'btn-primary' : 'btn'}
            disabled={isFilterChanged ? false : true}>
            <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
              APPLY FILTER
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal
