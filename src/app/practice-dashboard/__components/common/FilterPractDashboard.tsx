import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { companyDropdownbyOrg } from '@/store/features/accountantDashboard/accountDashboardSlice'
import { Button, DatepickerYear, MultiSelect, MultiSelectChip, Select, Text, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface PractDashboardFilterPopoverProps {
  onClose: (val: boolean) => void
  onCancel?: () => void
  onApply?: () => void
  onReset?: () => void
  isOpenFilter?: boolean
  localFilterFormFields?: any
  filterFormFields?: any
  onResetFilter: (value: boolean) => void
  setLocalFilterFormFields?: any
  organizationOptions: any
  companyDropdownbyOrganization: any
}

function FilterPractDashboard({
  onClose,
  isOpenFilter,
  onReset,
  onCancel,
  onApply,
  localFilterFormFields,
  filterFormFields,
  setLocalFilterFormFields,
  organizationOptions,
  companyDropdownbyOrganization,
}: PractDashboardFilterPopoverProps) {
  const dropDownRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)
  const [isOrganizationChanged, setOrganizationChanged] = useState<boolean>(false)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        onClose(false)
      }
    }

    if (isOpenFilter) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpenFilter])

  let dynamicClass = isOpenFilter ? `absolute right-[120px] translate-x-0` : 'fixed right-0 translate-x-full'

  useEffect(() => {
    if (JSON.stringify(localFilterFormFields) !== JSON.stringify(filterFormFields)) {
      setIsFilterChanged(true)
    } else {
      setIsFilterChanged(false)
    }
  }, [localFilterFormFields])

  useEffect(() => {
    if (localFilterFormFields.ft_organizationName && isOrganizationChanged) {
      const params = {
        OrgIds: localFilterFormFields.ft_organizationName,
      }
      performApiAction(dispatch, companyDropdownbyOrg, params, (responseData: any) => {
        const mappedList =
          responseData.length > 0 ? responseData.map((item: any) => ({ label: item.label, value: String(item.value) })) : []
        setLocalFilterFormFields((prevFields: any) => ({
          ...prevFields,
          ft_companyName: mappedList.length > 0 ? mappedList.map((option: any) => String(option.value)) : [],
        }))
      })
    }
  }, [isOrganizationChanged, localFilterFormFields.ft_organizationName])

  const handleOrganizationChange = (value: any) => {
    setOrganizationChanged(true)
    setLocalFilterFormFields((prevFields: any) => ({
      ...prevFields,
      ft_organizationName: value,
    }))
  }

  const handleCompanyChange = (value: any) => {
    setIsFilterChanged(true)
    setLocalFilterFormFields((prevFields: any) => ({
      ...prevFields,
      ft_companyName: value,
    }))
  }

  const handleDateChange = (value: string) => {
    setIsFilterChanged(true)
    setLocalFilterFormFields((prevFields: any) => ({
      ...prevFields,
      ft_viewByMonth: value,
    }))
  }

  return (
    <>
      <div
        className={`${
          isOpenFilter &&
          'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-30 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
        }`}
      >
        <div
          ref={dropDownRef}
          className={`top-28 w-[793px] rounded border border-lightSilver bg-pureWhite ${dynamicClass} transition-transform duration-300 ease-in-out`}
        >
          <div className='flex items-center justify-between border-b border-[#cccccc] p-4'>
            <Typography className='!text-lg !font-medium text-black'>Filter</Typography>
            <div onClick={onReset}>
              <span className='cursor-pointer rounded p-2 text-[#DC3545] hover:bg-[#F8D7DA] hover:text-[#B02A37]'>Reset All</span>
            </div>
          </div>

          <div className='m-5 grid grid-cols-2 items-center gap-5'>
            {/* <Select
              id={'ft_organizationName'}
              label='Organization Name'
              placeholder={'Select Organization Name'}
              defaultValue={localFilterFormFields?.ft_organizationName}
              options={organizationOptions}
              getValue={handleOrganizationChange}
              getError={() => ''}
              onSelect={() => {}}
              disabled
            /> */}
            <Text
              id={'ft_organizationName'}
              label='Organization Name'
              value={'Zala'}
              getValue={() => {}}
              getError={() => ''}
              onSelect={() => {}}
              disabled
            />
            <MultiSelectChip
              type='checkbox'
              id={'ft_companyName'}
              label='Company Name'
              placeholder={'Select Company Name'}
              defaultValue={localFilterFormFields?.ft_companyName}
              options={companyDropdownbyOrganization}
              getValue={handleCompanyChange}
              getError={() => ''}
              onSelect={() => {}}
            />
          </div>
          <div className='m-5 grid grid-cols-2 items-center gap-5'>
            <div className='flex flex-col'>
              <DatepickerYear
                id='ft_viewByMonth'
                label='View By Month'
                value={localFilterFormFields?.ft_viewByMonth}
                startYear={1995}
                endYear={2050}
                getValue={handleDateChange}
                getError={() => {}}
              />
            </div>
          </div>

          <div className='flex items-center justify-end border-t border-lightSilver  shadow-inner'>
            <div className='mx-5 my-5'>
              <Button onClick={onCancel} className='h-9 w-24 rounded-full font-medium xsm:!px-1' variant='btn-outline-primary'>
                <Typography type='h6' className='!text-[16px] !font-semibold'>
                  CANCEL
                </Typography>
              </Button>
              <Button
                type='submit'
                onClick={onApply}
                className={`ml-5 h-9 w-32 rounded-full font-medium xsm:!px-1 `}
                variant={isFilterChanged ? 'btn-primary' : 'btn'}
                disabled={isFilterChanged ? false : true}
              >
                <Typography type='h6' className='!text-[16px] !font-semibold'>
                  APPLY FILTER
                </Typography>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FilterPractDashboard
