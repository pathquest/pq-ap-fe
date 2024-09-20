import { AssignedFilterData, FilterOverviewProcessType, FilterOverviewStatus } from '@/data/billPosting'
import { BillPostingFilterFormFieldsProps } from '@/models/billPosting'
import { useAppSelector } from '@/store/configureStore'
import { convertStringsToIntegers } from '@/utils'
import { Button, DatepickerRange, MultiSelectChip, Select, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface FilterPopoverProps {
  onClose: (val: boolean) => void
  filterFormFields?: BillPostingFilterFormFieldsProps
  onCancel?: () => void
  onApply?: () => void
  onReset?: () => void
  onResetFilter: (value: boolean) => void
  billList?: any
  processSelection?: string
  statusOptions?: any
  locationOptions?: any
  userOptions?: any
  vendorOptions?: any
  localFilterFormFields?: any
  setLocalFilterFormFields?: any
  isOpenFilter?: boolean
  activeBill?: any
  filterApplyChange?: any
}

function FilterPopover({
  onClose,
  isOpenFilter,
  filterFormFields,
  activeBill,
  onReset,
  onCancel,
  onApply,
  onResetFilter,
  filterApplyChange,
  processSelection,
  statusOptions,
  locationOptions,
  userOptions,
  vendorOptions,
  localFilterFormFields,
  setLocalFilterFormFields,
  billList,
}: FilterPopoverProps) {
  const [isFilterChanged, setIsFilterChanged] = useState(false)

  const { selectedProcessTypeInList } = useAppSelector((state) => state.bill)
  const dropDownRef = useRef<HTMLDivElement>(null)

  const userId = localStorage.getItem('UserId')

  const filterUserOption = (options: any, userId: any) => {
    return options.filter((option: any) => option.value !== userId)
  }

  useEffect(() => {
    if (JSON.stringify(localFilterFormFields) !== JSON.stringify(filterFormFields)) {
      setIsFilterChanged(true)
    } else {
      setIsFilterChanged(false)
    }
  }, [localFilterFormFields])

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

  let dynamicClass

  if (activeBill) {
    dynamicClass = isOpenFilter ? 'absolute left-[400px] translate-x-0' : 'fixed left-0 -translate-x-full'
  } else {
    dynamicClass = isOpenFilter
      ? `absolute ${billList?.length > 0 ? 'right-[150px]' : selectedProcessTypeInList === '3' ? 'right-[80px]' : 'right-[120px]'
      } translate-x-0`
      : 'fixed right-0 translate-x-full'
  }

  const includedOptions = statusOptions.filter((option: any) =>
    localFilterFormFields.ft_status.includes(option.value)
  );

  const otherOptions = statusOptions.filter((option: any) =>
    !localFilterFormFields.ft_status.includes(option.value)
  );

  const filteredOptions = includedOptions.concat(otherOptions) ?? [];

  return (
    <>
      <div
        className={`${isOpenFilter &&
          'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
          }`}
      >
        <div
          ref={dropDownRef}
          className={`top-28 z-30 w-[793px] rounded border border-lightSilver bg-pureWhite ${dynamicClass} transition-transform duration-300 ease-in-out`}
        >
          <div className='flex items-center justify-between border-b border-b-lightSilver px-5 py-3' tabIndex={-1}>
            <div className='flex items-center justify-between gap-[10px]' tabIndex={-1}>
              <span className='text-lg font-medium text-black'>Filter</span>
            </div>
            <Button className='rounded-sm !text-base' variant="error" onClick={onReset}>
              Reset All
            </Button>
          </div>

          <div className='m-5 grid grid-cols-3 items-center gap-5'>
            {processSelection === '4' && (
              <>
                <MultiSelectChip
                  type='checkbox'
                  id={'ft_process'}
                  label='Process'
                  placeholder={'Process'}
                  defaultValue={localFilterFormFields?.ft_process ?? []}
                  options={FilterOverviewProcessType ?? []}
                  getValue={(value) => {
                    onResetFilter(false)
                    setLocalFilterFormFields({
                      ...localFilterFormFields,
                      ft_process: value,
                    })
                  }}
                  getError={() => ''}
                  onSelect={() => ''}
                />
                <MultiSelectChip
                  type='checkbox'
                  id={'ft_overview_status'}
                  label='Status'
                  placeholder={'Status'}
                  defaultValue={localFilterFormFields?.ft_overview_status ?? []}
                  options={FilterOverviewStatus ?? []}
                  getValue={(value) => {
                    onResetFilter(false)
                    setLocalFilterFormFields({
                      ...localFilterFormFields,
                      ft_overview_status: value,
                    })
                  }}
                  getError={() => ''}
                  onSelect={() => { }}
                />
              </>
            )}
            {processSelection !== '3' && processSelection !== '4' && (
              <>
                <MultiSelectChip
                  type='checkbox'
                  id={'ft_status'}
                  label='Status'
                  placeholder={'Status'}
                  defaultValue={localFilterFormFields?.ft_status}
                  options={filteredOptions?.filter((i: any) => i.value !== '12') ?? []}
                  getValue={(value) => {
                    onResetFilter(false)
                    setLocalFilterFormFields({
                      ...localFilterFormFields,
                      ft_status: value,
                    })
                  }}
                  getError={() => ''}
                  onSelect={() => { }}
                />
                {processSelection !== '4' && (
                  <Select
                    id={'ft_assignee'}
                    label='Assignee'
                    placeholder={'Assignee'}
                    value={localFilterFormFields?.ft_assignee}
                    defaultValue={localFilterFormFields?.ft_assignee}
                    options={AssignedFilterData ?? []}
                    getValue={(value) => {
                      onResetFilter(false)
                      setLocalFilterFormFields({
                        ...localFilterFormFields,
                        ft_assignee: value,
                        ft_select_users: value !== '2' ? [] : localFilterFormFields?.ft_select_users,
                      })
                    }}
                    getError={() => ''}
                  />
                )}
              </>
            )}

            {localFilterFormFields?.ft_assignee === '2' && processSelection !== '3' && (
              <div>
                <MultiSelectChip
                  type='checkbox'
                  id={'ft_select_users'}
                  label='Select Users'
                  placeholder={'Select users'}
                  defaultValue={localFilterFormFields?.ft_select_users}
                  options={userOptions.value !== userId ? filterUserOption(userOptions ?? [], userId) : []}
                  getValue={(value) => {
                    onResetFilter(false)
                    setLocalFilterFormFields({
                      ...localFilterFormFields,
                      ft_select_users: value,
                    })
                  }}
                  getError={() => ''}
                  onSelect={() => { }}
                />
              </div>
            )}

            <MultiSelectChip
              type='checkbox'
              id={'ft_vendor'}
              label='Vendor'
              placeholder={'Vendor'}
              defaultValue={localFilterFormFields?.ft_vendor ?? []}
              options={vendorOptions ?? []}
              getValue={(value) => {
                onResetFilter(false)
                setLocalFilterFormFields({
                  ...localFilterFormFields,
                  ft_vendor: convertStringsToIntegers(value),
                })
              }}
              getError={() => ''}
              onSelect={() => { }}
            />

            <div className='Filter_DatePickerRange DateRangePickerCstmClassBills'>
              <DatepickerRange
                id='ft_datepicker'
                label='Date Range'
                className='!pt-2.5'
                value={localFilterFormFields?.ft_datepicker}
                startYear={1995}
                endYear={2050}
                getValue={(value) => {
                  onResetFilter(false)
                  setLocalFilterFormFields({
                    ...localFilterFormFields,
                    ft_datepicker: value,
                  })
                }}
                getError={() => { }}
              />
            </div>

            {processSelection !== '4' && (
              <MultiSelectChip
                type='checkbox'
                id={'ft_location'}
                label='Location'
                placeholder={'Location'}
                defaultValue={localFilterFormFields?.ft_location ?? []}
                options={locationOptions ?? []}
                getValue={(value) => {
                  onResetFilter(false)
                  setLocalFilterFormFields({
                    ...localFilterFormFields,
                    ft_location: convertStringsToIntegers(value),
                  })
                }}
                getError={() => ''}
                onSelect={() => { }}
              />
            )}
          </div>

          <div className='flex items-center justify-end gap-5 border-t border-t-lightSilver p-[15px]'>
            <Button
              tabIndex={0}
              className='flex h-9 w-24 items-center justify-center rounded-full'
              variant='btn-outline-primary'
              onClick={onCancel}>
              <Typography type='h6' className='!text-[16px] !font-semibold'>
                CANCEL
              </Typography>
            </Button>
            <Button
              tabIndex={0}
              className={`h-9 w-32 rounded-full font-medium xsm:!px-1`}
              variant={isFilterChanged ? 'btn-primary' : 'btn'}
              disabled={isFilterChanged ? false : true}
              onClick={onApply}>
              <Typography type='h6' className='!text-[16px] !font-semibold'>
                APPLY FILTER
              </Typography>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default React.memo(FilterPopover)