import { processOptions, sourceOptions } from '@/data/fileHistory'
import { HistoryFilterFormFieldsProps } from '@/models/files'
import { useAppSelector } from '@/store/configureStore'
import { Button, CompanyList, DatepickerRange, MultiSelectChip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface InboxFilterProps {
  isFilterVisible: boolean
  filterFormFields?: HistoryFilterFormFieldsProps
  localFilterFormFields?: HistoryFilterFormFieldsProps
  setLocalFilterFormFields?: any
  onCancel?: () => void
  onApply?: () => void
  onReset?: () => void
  receivedUserOptions: any
}

const HistoryFilter = ({
  isFilterVisible,
  filterFormFields,
  localFilterFormFields,
  setLocalFilterFormFields,
  onCancel,
  onApply,
  onReset,
  receivedUserOptions,
}: InboxFilterProps) => {
  const filterModalRef = useRef<HTMLDivElement>(null)
  const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false)
  const { selectedCompany } = useAppSelector((state) => state.user)
  const AccountingTool = selectedCompany?.accountingTool

  useEffect(() => {
    if (JSON.stringify(localFilterFormFields) !== JSON.stringify(filterFormFields)) {
      setIsFilterChanged(true)
    } else {
      setIsFilterChanged(false)
    }
  }, [localFilterFormFields])

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (filterModalRef.current && !filterModalRef.current.contains(event.target)) {
        onCancel && onCancel()
      }
    }

    if (isFilterVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFilterVisible, onCancel])

  return (
    <div
      className={`${isFilterVisible &&
        'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
        }`}>
      <div
        ref={filterModalRef}
        className={`!p-0 top-28 z-30 w-[791px] rounded  border border-lightSilver bg-pureWhite ${isFilterVisible ? 'absolute laptop:right-[70px] laptopMd:right-[70px] lg:right-[70px] xl:right-[70px] hd:right-[75px] 2xl:right-[75px] 3xl:right-[75px] translate-x-0' : ' fixed right-0 translate-x-full'
          } transition-transform duration-300 ease-in-out`}
      >
        <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
          <span className='font-proxima text-lg font-medium text-black tracking-[0.02em]'>Filter</span>
          <Button className='rounded-sm !text-base' variant="error" onClick={onReset}>
            Reset All
          </Button>
        </div>

        <div className='historyFilter grid grid-cols-12 gap-5 p-5'>
              <div className='col-span-6'>
                <CompanyList
                  id={'fh_source'}
                  label='Source'
                  placeholder={'Please select'}
                  showAvatar={5}
                  checkbox={false}
                  avatarSize='x-small'
                  values={localFilterFormFields?.fh_source}
                  options={sourceOptions}
                  getError={() => { }}
                  getValue={(value: string[]) => {
                    if (setLocalFilterFormFields) {
                      setLocalFilterFormFields((prevState: any) => ({
                        ...prevState,
                        fh_source: value,
                      }))
                    }
                  }}
                  isSearchEnable={false}
                  isSelectAllEnable={false}
                />
              </div>
              <div className='col-span-6'>
                <CompanyList
                  id={'fh_received_uploaded'}
                  label='Received/Uploaded'
                  placeholder={'Please select'}
                  showAvatar={5}
                  checkbox={false}
                  avatarSize='x-small'
                  values={localFilterFormFields?.fh_received_uploaded}
                  options={receivedUserOptions}
                  getError={() => { }}
                  getValue={(value: string[]) => {
                    if (setLocalFilterFormFields) {
                      setLocalFilterFormFields((prevState: any) => ({
                        ...prevState,
                        fh_received_uploaded: value,
                      }))
                    }
                  }}
                  isSearchEnable={false}
                />
              </div>
            {/* </>
          )} */}
          <div className='col-span-6'>
            <DatepickerRange
              id='fh_uploaded_date'
              label='Uploaded Date'
              value={localFilterFormFields?.fh_uploaded_date}
              startYear={1995}
              endYear={2050}
              getValue={(value) => {
                if (setLocalFilterFormFields) {
                  setLocalFilterFormFields((prevState: any) => ({
                    ...prevState,
                    fh_uploaded_date: value,
                  }))
                }
              }}
              getError={() => { }}
            />
          </div>
        </div>

        <div className='flex items-center justify-end border-t border-lightSilver shadow-inner laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={onCancel} className='!h-9 rounded-full !p-0 !m-0' variant='btn-outline-primary'>
            <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
              CANCEL
            </label>
          </Button>
          <Button
            type='submit'
            onClick={onApply}
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

export default HistoryFilter