import ColFilterIcon from '@/assets/Icons/billposting/ColFilterIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { Button, CheckBox, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface ColumnFilterDropdownProps {
  headers: any[]
  visibleHeaders: any[]
  columnId?: number
  getMappingListData?: any
  url?: any
}

const ColumnFilter: React.FC<ColumnFilterDropdownProps> = ({
  headers,
  visibleHeaders,
  columnId: getColMapId,
  getMappingListData,
  url
}) => {
  const header = headers.flatMap(item => Array.isArray(item) ? item[0].trim() : item);
  const visibleHeader = visibleHeaders.flatMap(item => Array.isArray(item) ? item[0].trim() : item);
  const dispatch = useAppDispatch()

  const userId = localStorage.getItem('UserId')
  const dropdownColumnRef = useRef<HTMLDivElement>(null)

  const [selectedHeaders, setSelectedHeaders] = useState<Object[]>([...visibleHeader])
  const [initialHeaders, setInitialHeaders] = useState<Object[]>([...visibleHeader]);
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isColumnChanged, setIsColumnChanged] = useState<boolean>(false);

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (dropdownColumnRef.current && !dropdownColumnRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    },
    [dropdownColumnRef]
  )

  useEffect(() => {
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [handleOutsideClick])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const toggleHeader = (h: string) => {
    const updatedHeaders = selectedHeaders.includes(h)
      ? selectedHeaders.filter((header) => header !== h)
      : [...selectedHeaders, h]
    setSelectedHeaders(updatedHeaders)
    const isChanged = JSON.stringify(updatedHeaders.sort()) !== JSON.stringify(initialHeaders.sort());
    setIsColumnChanged(isChanged);
  }

  const applyChanges = async () => {
    setIsLoading(true);

    if (selectedHeaders.length < 4) {
      Toast.error('Please select at least 4 columns.');
      setIsLoading(false);
      return;
    }

    const data = header.map((h: Object) => (selectedHeaders.includes(h) ? { label: h, value: true } : { label: h, value: false }))
    const obj = data.reduce((acc: any, { label, value }: any) => {
      acc[label] = value
      return acc
    }, {})

    try {
      setFocusedIndex(-1);
      const params = {
        Id: getColMapId,
        UserId: parseInt(userId!),
        ColumnList: JSON.stringify(obj),
      }
      performApiAction(dispatch, url, params, () => {
        Toast.success('Columns Updated !!')
        getMappingListData()
        setInitialHeaders([...selectedHeaders]);
        setIsColumnChanged(false);
        setIsOpen(false);
        setIsLoading(false);
      })
    } catch (error) {
      console.error(error)
      setIsLoading(false);
    }
  }

  const handelCancel = () => {
    setSelectedHeaders([...visibleHeader])
    setIsColumnChanged(false);
    setIsOpen(false)
  }

  const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, h: string, index: number) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement && e.target.tagName == "SPAN") {
      e.preventDefault();
      toggleHeader(h)
    } else if (e.key === "ArrowUp" && index > 0 && isOpen) {
      e.preventDefault();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowDown" && index < header.length - 1 && isOpen) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    }
  };

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
            {header.map((h, index) => (
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

export default ColumnFilter