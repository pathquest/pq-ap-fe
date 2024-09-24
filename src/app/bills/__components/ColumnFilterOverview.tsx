import ColFilterIcon from '@/assets/Icons/billposting/ColFilterIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { ColumnFilterDropdownProps } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { saveOverviewColumnMapping } from '@/store/features/bills/billSlice'
import { saveApAgingDetailsColumnMapping } from '@/store/features/reports/reportsSlice'
import { Button, CheckBox, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const ColumnFilterOverview: React.FC<ColumnFilterDropdownProps & { maxHeight?: string }> = ({
  headers,
  visibleHeaders,
  columnId: getColMapId,
  getMappingListData,
}) => {
  const dispatch = useAppDispatch()
  const userId = localStorage.getItem('UserId')
  const dropdownColumnRef = useRef<HTMLDivElement>(null)

  const { selectedProcessTypeInList, filterFormFields } = useAppSelector((state) => state.bill)
  const [selectedHeaders, setSelectedHeaders] = useState<Object[]>([...visibleHeaders])
  const [initialHeaders, setInitialHeaders] = useState<Object[]>([...visibleHeaders]);
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [isColumnChanged, setIsColumnChanged] = useState<boolean>(false);

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (dropdownColumnRef.current && !dropdownColumnRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    },
    [dropdownColumnRef]
  )
  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [handleOutsideClick])

  // useEffect(() => {
  //   if (selectedHeaders.includes('Adjustment Number') && filterFormFields.ft_process === '1') {
  //     const newSelectedHeaders = selectedHeaders.map((item: any) => (item === 'Adjustment Number' ? 'Bill Number' : item))
  //     setSelectedHeaders(newSelectedHeaders)
  //   }
  //   if (selectedHeaders.includes('Bill Number') && filterFormFields.ft_process === '2') {
  //     const newSelectedHeaders = selectedHeaders.map((item: any) => (item === 'Bill Number' ? 'Adjustment Number' : item))
  //     setSelectedHeaders(newSelectedHeaders)
  //   }
  // }, [selectedProcessTypeInList, filterFormFields.ft_process])

  const toggleHeader = (header: Object) => {
    const updatedHeaders = selectedHeaders.includes(header)
      ? selectedHeaders.filter((h: Object) => h !== header)
      : [...selectedHeaders, header]
    setSelectedHeaders(updatedHeaders)
    const isChanged = JSON.stringify(updatedHeaders.sort()) !== JSON.stringify(initialHeaders.sort());
    setIsColumnChanged(isChanged);
  }

  function getKeyFromLabel(label: any) {
    // if (label === 'Adjustment Number') {
    //   return 'Bill Number'
    // }

    if (label.props !== undefined) {
      const children = label.props.children
      switch (children) {
        // case 'Bill Number':
        // case 'Adjustment Number':
        //   return 'Bill Number'
        case 'Bill/Adjustment Number':
          return 'Bill Number'
        default:
          return label
      }
    }

    return label
  }

  const applyChanges = async () => {
    setIsLoading(true)

    if (selectedHeaders.length < 4) {
      Toast.error('Please select at least 4 columns.')
      setIsLoading(false)
      return
    }

    const data = headers.map((h: Object) =>
      selectedHeaders.includes(h) ? { label: h, value: true } : { label: h, value: false }
    )
    const obj = data.reduce((acc: any, { label, value }: any) => {
      let key = getKeyFromLabel(label)
      acc[key] = value
      return acc
    }, {})

    try {
      setFocusedIndex(-1)
      const params = {
        Id: getColMapId,
        UserId: parseInt(userId!),
        ColumnList: JSON.stringify(obj),
      }
      const { payload, meta } = await dispatch(saveOverviewColumnMapping(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          Toast.success('Columns Updated !!')
          getMappingListData()
          setIsOpen(false)
          setIsLoading(false)
          setInitialHeaders([...selectedHeaders]);
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handelCancel = () => {
    setSelectedHeaders([...visibleHeaders])
    setIsOpen(false)
    setIsColumnChanged(false);
  }

  const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, header: string, index: number) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement && e.target.tagName == 'SPAN') {
      e.preventDefault()
      toggleHeader(header)
    } else if (e.key === 'ArrowUp' && index > 0 && isOpen) {
      e.preventDefault()
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowDown' && index < headers.length - 1 && isOpen) {
      e.preventDefault()
      setFocusedIndex(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className='mr-[15px] cursor-pointer'>
      <span onClick={handleToggle} tabIndex={0} onKeyDown={handleKeyDown} >
        <ColFilterIcon color={isOpen ? "#02B89D" : "#6E6D7A"} />
      </span>

      {isOpen && (
        <div
          ref={dropdownColumnRef}
          className='absolute max-h-[351px] w-[215px] !top-9 right-7 !z-[999] flex flex-col rounded-md bg-white'
          style={{ boxShadow: '4px 6px 28px 0px rgba(0, 0, 0, 0.2)' }}
        >
          <div className='overflow-y-auto custom-scroll my-[6px]'>
            {headers.map((h, index) => (
              <span key={h} className='h-[37px] span flex cursor-pointer px-[15px] py-[6.5px] font-normal hover:bg-whiteSmoke'
                tabIndex={isOpen ? 0 : -1}
                onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => handleListItemKeyDown(e, h, index)}
                ref={(el) => {
                  if (index === focusedIndex) {
                    el?.focus();
                  }
                }}>
                <CheckBox
                  tabIndex={-1}
                  className='checkbox !text-sm !font-proxima'
                  id={h}
                  label={h}
                  checked={selectedHeaders.includes(h)}
                  onChange={() => toggleHeader(h)}
                />
              </span>
            ))}
          </div>
          <div className='sticky bottom-0 bg-white flex justify-center border-t border-lightSilver laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 px-[14.5px] laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-5 2xl:py-5 3xl:py-5'>
            <Button
              onClick={handelCancel}
              className={`btn-sm !h-7 rounded-full !w-[86px]`}
              variant='btn-outline-primary'>
              <label className={`h-[17px] mt-0.5 flex items-center justify-center cursor-pointer font-proxima font-semibold text-sm tracking-[0.02em]`}>
                CANCEL
              </label>
            </Button>
            <Button
              type='submit'
              tabIndex={isOpen ? 0 : -1}
              onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => (e.key === 'Enter' || e.key === ' ') && applyChanges}
              onClick={applyChanges}
              className={`btn-sm !h-7 rounded-full !w-[80px] cursor-pointer ${(isLoading || !isColumnChanged) && 'pointer-events-none opacity-80'}`}
              variant={!isColumnChanged || isLoading ? 'btn' : 'btn-primary'}>
              <label className={`h-[17px] flex items-center justify-center cursor-pointer ${isLoading ? "animate-spin mx-[10px]" : "mt-0.5 font-proxima font-semibold text-sm tracking-[0.02em]"}`}>
                {isLoading ? <SpinnerIcon bgColor='#6E6D7A' /> : "APPLY"}
              </label>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColumnFilterOverview
