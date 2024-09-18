import { CheckBox, Text } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'

// icons
import CrossIcon from '@/assets/Icons/CrossIcon'
import SearchIcon from '@/assets/Icons/payments/SearchIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'

// Store
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { vendorDropdown } from '@/store/features/bills/billSlice'
import { setVendorIdList } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'

interface ActionsProps {
  handleClick?: (arg1: any) => void
}

const VendorsDropdown: React.FC<ActionsProps> = ({ handleClick = () => { } }) => {
  const [selectAll, setSelectAll] = useState(false)
  const [isVendorsOpen, setIsVendorsOpen] = useState(false)
  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [searchValueInput, setSearchValueInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [selectedValues, setSelectedValues] = useState<any[]>([])

  const dispatch = useAppDispatch()
  const dropdownRef = useRef<any>(null)
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const { selectedVendors } = useAppSelector((state) => state.billsToPayReducer)
  const { vendorIdList } = useAppSelector((state) => state.billsToPayReducer)

  useEffect(() => {
    setSelectedValues(vendorIdList);
  }, [CompanyId])

  const handleDropdownToggle = () => {
    setIsVendorsOpen((prevOpen: boolean) => !prevOpen)
  }

  const handleClickOutside = (event: any) => {
    const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target)
    const isCrossIconClicked = event.target.classList.contains('cross-icon-class')
    const isClearAllBtnClicked = event.target.classList.contains('clear-all-btn-class')
    if (!isInsideDropdown && !isCrossIconClicked && !isClearAllBtnClicked) {
      setIsVendorsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleSearch = (e: any) => {
    setSearchValueInput(e)
    setSearchValue(e.trim())
  }

  // Function for single and multiselection
  const handleSelectionChange = (value: any) => {
    setVendorOptions((prevOptions: any) => {
      const updatedOptions = prevOptions.map((option: any) => {
        if (option.value === value) {
          return {
            ...option,
            selected: !option.selected,
          }
        }
        return option
      })
      return updatedOptions
    })

    setSelectedValues((prevValues) => {
      const updatedValues = [...prevValues]
      const index = updatedValues.indexOf(value)
      if (index > -1) {
        updatedValues.splice(index, 1)
      } else {
        updatedValues.push(value)
      }

      // Update the selected state in filteredData
      setFilteredData((prevFilteredData) =>
        prevFilteredData.map((data) => {
          if (data.value === value) {
            return {
              ...data,
              selected: !data.selected,
            }
          }
          return data
        })
      )

      // Check if all options are selected
      const isAllSelected = updatedValues.length === vendorOptions.length
      setSelectAll(isAllSelected)
      handleClick(updatedValues)
      dispatch(setVendorIdList(updatedValues))
      return updatedValues
    })
  }

  // Function for Select-all dropdown
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll)
    setSelectedValues(() => {
      const updatedValues = !selectAll ? vendorOptions.map((option: any) => option.value) : []
      handleClick(updatedValues)
      dispatch(setVendorIdList(updatedValues))
      return updatedValues
    })

    setVendorOptions((prevOptions: any) => {
      return prevOptions.map((option: any) => ({
        ...option,
        selected: !selectAll,
      }))
    })
  }

  // Function for Clear All
  const handleClearAll = () => {
    setSelectAll(false)
    setSelectedValues([])
    setVendorOptions((prevOptions: any) => {
      return prevOptions.map((option: any) => ({
        ...option,
        selected: false,
      }))
    })
    setFilteredData((prevOptions: any) => {
      return prevOptions.map((option: any) => ({
        ...option,
        selected: false,
      }))
    })
    setSearchValueInput('')
    setSearchValue('')
    handleClick([])
    dispatch(setVendorIdList([]))
  }

  // Function to truncate label text
  function truncateLabel(label: string | undefined, maxLength: number): string {
    if (label && label.length > maxLength) {
      return label.substring(0, maxLength) + '...'
    }
    return label || ''
  }

  useEffect(() => {
    const fetchVendorData = async () => {
      const params = {
        CompanyId: CompanyId,
        isActive: true,
      }
      performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
        if (selectedVendors && selectedVendors.length > 0) {
          handleClick(selectedVendors)
          const allVendorIds = responseData.map((vendor: any) => vendor.value)
          setSelectedValues(allVendorIds)
          dispatch(setVendorIdList(allVendorIds))
          handleClick(allVendorIds)

          setVendorOptions(
            responseData.map((vendor: any) => ({
              ...vendor,
              selected: selectedVendors.includes(vendor.value) ? true : false,
            }))
          )
          setSelectAll(responseData.length === selectedVendors.length)
        } else {
          setVendorOptions(responseData)
          const isAllSelected = vendorIdList?.length === responseData?.length
          setSelectAll(isAllSelected)
        }
      })
    }
    fetchVendorData()
  }, [CompanyId])

  useEffect(() => {
    if (searchValue === '') {
      setFilteredData(vendorOptions)
    } else {
      const filteredData = vendorOptions.filter((data: { label: string }) =>
        data.label.toLowerCase().includes(searchValue.toLowerCase())
      )
      setFilteredData(filteredData)
    }
  }, [vendorOptions, searchValue])

  return (
    <div ref={dropdownRef}>
      <div onClick={handleDropdownToggle} className={`flex cursor-pointer items-center gap-[10px] ${isVendorsOpen ? 'text-primary' : 'text-slatyGrey'}`}>
        {vendorOptions?.length > 0 && selectAll ? (
          <span className='relative text-sm font-semibold text-black'>All Vendor</span>
        ) : vendorOptions?.length > 0 && selectedValues.length > 1 && !selectAll ? (
          <span className='relative text-sm font-semibold'>
            {truncateLabel(vendorOptions.find((v: any) => v.value === selectedValues[0])?.label, 22) +
              ' + ' +
              (selectedValues.length - 1)}
          </span>
        ) : vendorOptions?.length > 0 && selectedValues.length === 1 ? (
          <span className='relative text-sm font-semibold'>
            {truncateLabel(vendorOptions.find((v: any) => v.value === selectedValues[0])?.label, 22)}
          </span>
        ) : (
          <span className='relative text-sm font-semibold'>Select Vendor</span>
        )}

        <span className={isVendorsOpen ? 'rotate-180' : ''}>
          <ChevronDown />
        </span>
      </div>

      <div className={isVendorsOpen ? 'block' : 'hidden'}>
        <div className='absolute top-[50px] z-20 flex w-[275px] flex-col gap-1 rounded-md border border-lightSilver bg-white drop-shadow-xl'>
          {vendorOptions?.length > 0 ? (
            <>
              <div className='px-[15px]'>
                <Text
                  className='relative mt-3 rounded border border-lightSilver py-[11px] pl-[35px] pr-[35px] hover:border-primary'
                  getValue={(e) => handleSearch(e)}
                  getError={() => { }}
                  value={searchValueInput}
                  placeholder='Search'
                  noborder
                />
                <span className='absolute left-[26px] top-[26px]'>
                  <SearchIcon />
                </span>
                <span
                  className={`cross-icon-class ${searchValue.trim().length === 0 && 'hidden'
                    } absolute right-[24px] top-[21px] cursor-pointer`}
                  onClick={() => {
                    setSearchValue('')
                    setSearchValueInput('')
                  }}
                >
                  <CrossIcon />
                </span>
              </div>

              <div className='custom-scroll flex max-h-[49vh] w-full flex-col overflow-y-auto py-[10px]'>
                {searchValue.trim().length === 0 && (
                  <span className='flex w-full cursor-pointer gap-2 px-[16px] py-2 font-normal hover:bg-whiteSmoke'>
                    <CheckBox id='select-all-vendors' checked={selectAll} onChange={handleSelectAllChange} />
                    <label htmlFor='select-all-vendors' className='cursor-pointer text-sm'>
                      Select All
                    </label>
                  </span>
                )}
                {filteredData.map((value: any) => (
                  <span
                    key={value.value}
                    className='flex cursor-pointer gap-2 px-[16px] py-2 font-normal hover:bg-whiteSmoke'
                    onClick={() => handleSelectionChange(value.value)}
                  >
                    <CheckBox
                      id={value.value}
                      value={value.value}
                      checked={value.selected || false}
                      onChange={() => handleSelectionChange(value.value)}
                    />
                    <label htmlFor={value.value} className='cursor-pointer text-sm'>
                      {value.label}
                    </label>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span className='px-7 py-3'>No Data Available</span>
          )}

          <div className={`${selectedValues.length === 0 && 'hidden'} sticky bottom-0 w-full border-t border-lightSilver bg-white p-[15px] text-center`}>
            <a className='cursor-pointer text-base font-semibold text-primary' onClick={handleClearAll}>
              Clear All
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorsDropdown