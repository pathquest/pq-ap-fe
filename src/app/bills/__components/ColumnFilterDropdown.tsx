import agent from '@/api/axios'
import ColFilterIcon from '@/assets/Icons/billposting/ColFilterIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { useAppSelector } from '@/store/configureStore'
import { Button, CheckBox, Toast, Tooltip } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface ColumnFilterDropdownProps {
  headers: any[]
  visibleHeaders: any[]
  isOpen?: boolean
  getColMapId?: number
  setOpen: (arg1: boolean) => void
  setMapColId: () => void
  handleHeaderToggle: (header: string) => void
  isEdit?: boolean
  getMappingListData?: any
}

const ColumnFilterDropdown: React.FC<ColumnFilterDropdownProps> = ({
  headers,
  visibleHeaders,
  isOpen,
  getColMapId,
  setOpen,
  setMapColId,
  getMappingListData,
  isEdit = false,
}) => {
  const visibleHeader = visibleHeaders.map((item: any) => (Array.isArray(item) && item?.length > 0 ? item[0].trim() : item))
  const [selectedHeaders, setSelectedHeaders] = useState<any>(
    visibleHeaders.map((item: any) => (Array.isArray(item) && item?.length > 0 ? item[0].trim() : item))
  )
  const { selectedProcessTypeInList } = useAppSelector((state) => state.bill)
  const userId = localStorage.getItem('UserId')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isColumnChanged, setIsColumnChanged] = useState<boolean>(false);
  const [initialHeaders, setInitialHeaders] = useState<Object[]>([...visibleHeader]);

  const dropdownColumnRef = useRef<HTMLDivElement>(null)
  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownColumnRef.current && !dropdownColumnRef.current.contains(event.target as Node)) {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (selectedHeaders.includes('Adjustment No.') && selectedProcessTypeInList === '1') {
      const newSelectedHeaders = selectedHeaders.map((item: any) => (item === 'Adjustment No.' ? 'Bill No.' : item))
      setSelectedHeaders(newSelectedHeaders)
    }
    if (selectedHeaders.includes('Bill No.') && selectedProcessTypeInList === '2') {
      const newSelectedHeaders = selectedHeaders.map((item: any) => (item === 'Bill No.' ? 'Adjustment No.' : item))
      setSelectedHeaders(newSelectedHeaders)
    }
  }, [selectedProcessTypeInList])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpen])

  const toggleHeader = (header: any) => {
    const updatedHeaders = selectedHeaders.includes(header)
      ? selectedHeaders.filter((h: any) => h !== header)
      : [...selectedHeaders, header]
    setSelectedHeaders(updatedHeaders)
    const isChanged = JSON.stringify(updatedHeaders.sort()) !== JSON.stringify(initialHeaders.sort());
    setIsColumnChanged(isChanged);
  }

  function getKeyFromLabel(label: any) {
    if (label === 'Adjustment No.') {
      return 'Bill No.'
    }

    if (label.props !== undefined) {
      const children = label.props.children
      switch (children) {
        case 'Amount':
          return 'Amount'
        case 'Uploaded Date':
          return 'Uploaded Date'
        case 'Bill No.':
        case 'Adjustment No.':
          return 'Bill No.'
        default:
          return label
      }
    }

    return label
  }

  const applyChanges = async () => {
    setIsLoading(true);
    const data = headers
      .map((item: any) => (Array.isArray(item) && item?.length > 0 ? item[0].trim() : item))
      .map((h: any) => (selectedHeaders.includes(h) ? { label: h, value: true } : { label: h, value: false }))
    const obj = data.reduce((acc: any, { label, value }: any) => {
      let key = getKeyFromLabel(label)
      acc[key] = value
      return acc
    }, {})

    const selectedColumnLength = Object.values(obj).filter((value) => value === true).length
    if (selectedColumnLength < 4) {
      Toast.error('Please select atleast 4 column!')
      setIsLoading(false);
      return
    }

    const params = {
      Id: getColMapId,
      UserId: parseInt(userId!),
      ColumnList: JSON.stringify(obj),
    }

    if (!isEdit) {
      try {
        const response = await agent.APIs.saveColumnMappingList(params)
        if (response?.ResponseStatus === 'Success') {
          Toast.success('Columns Updated!')
          getMappingListData()
          setMapColId()
          setInitialHeaders([...selectedHeaders]);
          setIsLoading(false);
          setIsColumnChanged(false);
        }
      } catch (error) {
        Toast.error('Something Went Wrong!')
        setIsLoading(false);

      }
    }
    setOpen(false)
  }

  return (
    <div className='absolute right-2 top-1.5 cursor-pointer'>
      <span onClick={() => {
        isOpen ? setOpen(false) : setOpen(true)
      }}>
        <ColFilterIcon color={isOpen ? "#02B89D" : "#6E6D7A"} />
        {/* {isOpen
          ? <ColFilterIcon color={"#02B89D"} />
          : <Tooltip position='left' content='Add column' className='!font-proxima !text-[14px] !pl-1 !pr-0 !pt-0.5 !pb-0'>
            <ColFilterIcon color={"#6E6D7A"} />
          </Tooltip>
        } */}

      </span>

      {isOpen && (
        <div
          ref={dropdownColumnRef}
          className=' w-[215px] max-h-[251px] column-vertical-scroll custom-scroll-PDF absolute !top-8 right-0.5 !z-[999] flex flex-col rounded-md bg-white shadow-lg'
          style={{ boxShadow: '4px 6px 28px 0px rgba(0, 0, 0, 0.2)' }}
        >
          <div className='overflow-y-auto custom-scroll my-[6px]'>
            {headers.map((header) => (
              <span key={header} className='span hidePaymentSortIcon flex cursor-pointer p-2 font-normal hover:bg-whiteSmoke'>
                <CheckBox
                  className='checkbox'
                  id={header}
                  label={header}
                  checked={selectedHeaders.includes(header)}
                  onChange={() => toggleHeader(header)}
                />
              </span>
            ))}
          </div>
          <div className='sticky bottom-0 bg-white flex justify-center border-t border-lightSilver laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 px-[14.5px] py-4'>
            <Button
              onClick={() => {
                setOpen(false)
                setSelectedHeaders([...visibleHeaders])
                setIsColumnChanged(false);
              }}
              className={`btn-sm !h-7 rounded-full !w-[86px]`}
              variant='btn-outline-primary'>
              <label className={`h-[17px] mt-0.5 flex items-center justify-center cursor-pointer font-proxima font-semibold text-sm tracking-[0.02em]`}>
                CANCEL
              </label>
            </Button>
            <Button
              type='submit'
              tabIndex={isOpen ? 0 : -1}
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

export default ColumnFilterDropdown
