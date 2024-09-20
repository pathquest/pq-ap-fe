'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import GlobalSearch from './Icons/GlobalSearch'
import DownArrowIcon from '@/assets/Icons/billposting/DownArrowIcon'
import ShoppingCart from './Icons/ShoppingCart'
import ReceiptLong from './Icons/ReceiptLong'
import AccountBalance from './Icons/AccountBalance'
import ApprovalDelegation from './Icons/ApprovalDelegation'
import Analytics from './Icons/Analytics'
import FramePerson from './Icons/FramePerson'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'

import SearchBills from './Icons/SearchBills'
import SearchVendor from './Icons/SearchVendor'
import SearchPurchaseOrder from './Icons/SearchPurchaseOrder'
import SearchPayments from './Icons/SearchPayments'
import SearchApprovals from './Icons/SearchApprovals'
import SearchReports from './Icons/SearchReports'
import useDebouncedValue from '@/hooks/useDebounce'
import {
  getSearchHistory,
  getSearchResult,
  saveSearchHistory,
  setSearchSelectedModule,
} from '@/store/features/globalSearch/globalSearchSlice'
import { format, parseISO } from 'date-fns'
import { GlobalSearchResultRes, SaveSearchHistoryOptions } from '@/models/global'
import { useRouter } from 'next/navigation'
import { setIsFormDocuments, setIsVisibleSidebar, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import { setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'

interface SearchComponentProps {
  children?: ReactNode
}

const fieldKeys: any = {
  '1': ['PONumber', 'VendorName', 'PODate', 'Amount'],
  '2': ['BillNumber', 'VendorName', 'BillDate', 'Amount', 'ModuleSubType'],
  '4': ['BillNumber', 'VendorName', 'BillDate', 'Amount'],
  '3': ['BillNumber', 'VendorName', 'BillDate', 'Amount'],
  '5': ['Reports'],
  '6': ['VendorName', 'VendorEmail', 'TotalOutStanding'],
}

const SearchComponent = ({ children }: SearchComponentProps): JSX.Element => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const inputRef = useRef<any>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchHistoryRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<any>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)

  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<GlobalSearchResultRes[]>([])
  const [searchHistoryResults, setSearchHistoryResults] = useState([])
  const [totalResultCount, setTotalResultCount] = useState(null)

  const debouncedSearchTerm = useDebouncedValue(searchValue, 500)

  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [isSearchHistoryVisible, setIsSearchHistoryVisible] = useState(false)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)

  const [selectedIcon, setSelectedIcon] = useState(<SearchVendor />)

  const [isEndReached, setIsEndReached] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(1)

  const [apiDataCount, setApiDataCount] = useState(0)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)

  const [focused, setFocused] = useState(false)
  const onFocus = () => setFocused(true)
  const onBlur = () => setFocused(false)

  const onDownArrowClick = () => {
    setIsSearchHistoryVisible(false)
    setIsSearchModalVisible(false)
    setIsDropdownVisible(!isDropdownVisible)
  }

  const { searchSelectedModule } = useAppSelector((state) => state.global)
  const lazyRows = 11

  const dropDownOptions = [
    // {
    //   value: '1',
    //   label: 'Purchase Order',
    //   icon: <ShoppingCart />,
    // },
    {
      value: '2',
      label: 'Bills',
      icon: <ReceiptLong />,
    },
    {
      value: '4',
      label: 'Payments',
      icon: <AccountBalance />,
    },
    {
      value: '3',
      label: 'Approvals',
      icon: <ApprovalDelegation />,
    },
    {
      value: '5',
      label: 'Reports',
      icon: <Analytics />,
    },
    {
      value: '6',
      label: 'Vendor',
      icon: <FramePerson />,
    },
  ]

  const handleScroll = () => {
    const element = modalRef.current
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      setIsEndReached(true)
    } else {
      setIsEndReached(false)
    }
  }

  const fetchSearchResult = async (pageIndex?: number) => {
    try {
      const params = {
        ModuleType: searchSelectedModule,
        SearchKey: debouncedSearchTerm,
        PageNumber: Number(pageIndex),
        PageSize: lazyRows,
      }
      const { payload, meta } = await dispatch(getSearchResult(params))

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setSearchResults(payload?.ResponseData?.List)
          setTotalResultCount(payload?.ResponseData?.TotalCount)

          setCurrentPageIndex(pageIndex ?? 1)

          const responseData = payload?.ResponseData
          const newList = responseData?.List || []
          const newTotalCount = responseData?.TotalCount || 0

          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLoading(false)
            setShouldLoadMore(true)
          } else {
            updatedData = [...searchResults, ...newList]
          }
          setSearchResults(updatedData)
          setItemsLoaded(updatedData.length)
          setIsEndReached(false)

          setIsSearchModalVisible(true)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (isEndReached && !isLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
      fetchSearchResult(currentPageIndex + 1)
    }
  }, [isEndReached])

  useEffect(() => {
    const onSearchComplete = async () => {
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 3 && debouncedSearchTerm.trim() !== "") {
        fetchSearchResult(1)
      }
    }
    onSearchComplete()
  }, [debouncedSearchTerm])

  useEffect(() => {
    switch (searchSelectedModule) {
      case '1':
        setSelectedIcon(<SearchPurchaseOrder />)
        break
      case '2':
        setSelectedIcon(<SearchBills />)
        break
      case '4':
        setSelectedIcon(<SearchPayments />)
        break
      case '3':
        setSelectedIcon(<SearchApprovals />)
        break
      case '5':
        setSelectedIcon(<SearchReports />)
        break
      case '6':
        setSelectedIcon(<SearchVendor />)
        break
    }
  }, [searchSelectedModule])

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownVisible(false)
    }
    if (searchHistoryRef.current && !searchHistoryRef.current.contains(event.target as Node)) {
      setIsSearchHistoryVisible(false)
    }
    if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
      setIsSearchModalVisible(false)
    }
  }

  useEffect(() => {
    if (focused && searchValue.length === 0) {
      fetchSearchHistory(searchSelectedModule)
    }
  }, [focused, searchValue])

  useEffect(() => {
    if (isDropdownVisible || isSearchHistoryVisible || isSearchModalVisible) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isDropdownVisible, isSearchHistoryVisible, isSearchModalVisible])

  const selectedModuleField = fieldKeys[searchSelectedModule]

  const fetchSearchHistory = async (value: string) => {
    try {
      const params = {
        ModuleType: value,
      }
      const response = await dispatch(getSearchHistory(params))

      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response?.payload?.ResponseStatus === 'Success') {
          setSearchHistoryResults(response?.payload?.ResponseData)
          setIsDropdownVisible(false)
          if (inputRef && inputRef.current !== null) {
            inputRef.current.focus()
            setIsSearchHistoryVisible(true)
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onModuleSelection = async (value: string) => {
    setSearchValue('')
    dispatch(setSearchSelectedModule(value))

    fetchSearchHistory(value)
  }

  const onSearchHistorySelect = (id: number, IsFromDocument: boolean, ModuleType: string, subModule: string) => {
    if (ModuleType === '2') {
      if (subModule === 'Account Payable') {
        dispatch(setSelectedProcessTypeFromList(1))
      }
      if (subModule === 'Account Adjustment') {
        dispatch(setSelectedProcessTypeFromList(2))
      }
      dispatch(setIsFormDocuments(IsFromDocument))
      dispatch(setIsVisibleSidebar(false))
      router.push(`/bills/view/${id}`)
    }
    if (ModuleType === '3') {
      if (subModule === 'BillApproval') {
        dispatch(setApprovalDropdownFields('1'))
        router.push(`/approvals/BillApproval/view/${id}`)
      }
      if (subModule === 'PaymentApproval') {
        dispatch(setApprovalDropdownFields('2'))
        router.push(`/approvals/PaymentApproval/view/${id}`)
      }
    }
    if (ModuleType === '4') {
      router.push(`/payments/billtopay/${id}`)
    }
    setIsSearchHistoryVisible(false)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      if (searchValue && searchValue.length >= 3 && searchValue.trim() !== "") {
        fetchSearchResult(1)
      }
    }
  }

  const onClickSearchResult = async (displayKey: string[], id: number, subModule: string, IsFromDocument: boolean) => {
    try {
      const params: SaveSearchHistoryOptions = {
        ModuleType: searchSelectedModule,
        SearchKey: searchValue.trim(),
        DisplayKey: JSON.stringify(displayKey),
        AccountPayableId: id,
        IsFromDocument: IsFromDocument,
        ModuleSubType: subModule,
      }

      const response = await dispatch(saveSearchHistory(params))

      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response?.payload?.ResponseStatus === 'Success') {
          switch (searchSelectedModule) {
            case '1':
              return
            case '2':
              dispatch(setIsFormDocuments(IsFromDocument))
              if (subModule === 'Account Payable') {
                dispatch(setSelectedProcessTypeFromList(1))
              }
              if (subModule === 'Account Adjustment') {
                dispatch(setSelectedProcessTypeFromList(2))
              }
              dispatch(setIsVisibleSidebar(false))
              router.push(`/bills/view/${id}`)
              return
            case '3':
              if (subModule === 'BillApproval') {
                dispatch(setApprovalDropdownFields('1'))
                router.push(`/approvals/BillApproval/view/${id}`)
              }
              if (subModule === 'PaymentApproval') {
                dispatch(setApprovalDropdownFields('2'))
                router.push(`/approvals/PaymentApproval/view/${id}`)
              }
              return
            case '4':
              router.push(`/payments/billtopay/${id}`)
              return
            case '5':
              return
            case '6':
              return
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onChangeSearchField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    setIsSearchHistoryVisible(false)
  }

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, history: any, index: number) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement && e.target.tagName == "DIV") {
      onSearchHistorySelect(
        history?.AccountPayableId,
        history?.IsFromDocument,
        history?.ModuleType,
        history?.ModuleSubType
      )
    } else if (e.key === "ArrowUp" && index > 0 && isSearchHistoryVisible) {
      e.preventDefault();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowDown" && index < searchHistoryResults.length - 1 && isSearchHistoryVisible) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    }
  };

  return (
    <div
      className={`${
        isDropdownVisible || isSearchHistoryVisible || isSearchModalVisible
          ? 'border border-solid border-[#02B89D]'
          : 'border border-solid border-transparent'
      } relative flex items-center justify-center rounded-[300px] bg-[#F4F4F4] px-[10px] laptop:px-[12px] 2xl:px-[15px] py-[3px] hover:border hover:border-solid hover:border-[#02B89D]`}
    >
      <div className='flex cursor-pointer items-center' onClick={() => onDownArrowClick()}>
        <div>
          <GlobalSearch />
        </div>
        <div className='px-[12px]'>
          <DownArrowIcon />
        </div>
        <div>{selectedIcon}</div>
      </div>
      <div className='mx-[10px] h-[14px] w-[1px] bg-[#6E6D7A]' />
      <div>
        <input
          ref={inputRef}
          type='text'
          value={searchValue}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={`Search in ${dropDownOptions.find((item) => item.value === searchSelectedModule)?.label}`}
          className='searchPlaceholder w-[200px] 2xl:w-[250px] bg-[#F4F4F4] font-proxima text-[14px] font-medium text-[#333333] placeholder:text-[#6E6D7A] focus:outline-none'
          onChange={onChangeSearchField}
          onKeyDown={(e) => handleKeyDown(e)}
        />

        {isSearchHistoryVisible && searchHistoryResults && searchHistoryResults.length > 0 && (
          <div
            ref={searchHistoryRef}
            className='absolute left-0 top-[34px] min-w-[250px] rounded-[4px] border border-solid border-[#D8D8D8] bg-white shadow-[0px_6px_28px_0px_#00000029]'
          >
            <div>
              {searchHistoryResults &&
                searchHistoryResults.map((history: any, index: number) => {
                  const historyData = JSON.parse(history?.DisplayKey)
                  const fieldLength = historyData.length
                  return (
                    <div className='border-b border-solid border-[#D8D8D8] px-[20px] py-[8px] hover:bg-[#EEF4F8]'>
                      <div className='w-max max-w-[550px]'>
                        <div
                          key={index}
                          onClick={() =>
                            onSearchHistorySelect(
                              history?.AccountPayableId,
                              history?.IsFromDocument,
                              history?.ModuleType,
                              history?.ModuleSubType
                            )
                          }
                          tabIndex={isSearchHistoryVisible ? 0 : -1}
                          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleListItemKeyDown(e, history, index)}
                          ref={(el) => {
                            if (index === focusedIndex) {
                              el?.focus();
                            }
                          }}
                          className={`flex cursor-pointer flex-wrap items-center whitespace-nowrap font-proxima text-[14px]`} //${isSelected ? 'bg-gray-200' : ''}
                        >
                          {historyData &&
                            historyData.map((item: string, inx: number) => {
                              return (
                                item && (
                                  <>
                                    <div
                                      className={`whitespace-nowrap text-[#333333] ${
                                        item.includes('$') ? 'flex justify-end font-bold' : ''
                                      }`}
                                    >
                                      {item}
                                    </div>
                                    {inx + 1 < fieldLength && <div className='mx-[10px] h-[12px] w-[1px] bg-[#333333]' />}
                                  </>
                                )
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {searchValue && searchValue.length >= 1 && searchValue.length < 3 && (
        <div className='absolute left-0 top-[34px] rounded-[4px] border border-solid border-[#D8D8D8] bg-white py-[6px] shadow-[0px_6px_28px_0px_#00000029] z-10'>
          <div className='whitespace-nowrap px-[20px] py-[6px] font-proxima text-[14px]'>Enter minimum 3 character to search</div>
        </div>
      )}

      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          className='absolute left-0 top-[34px] w-[250px] rounded-[4px] border border-solid border-[#D8D8D8] bg-white py-[6px] shadow-[0px_6px_28px_0px_#00000029] z-10'
        >
          {dropDownOptions &&
            dropDownOptions.map((options, index) => {
              return (
                <div
                  key={index}
                  className={`flex items-center px-[22px] py-[10px] hover:bg-[#EEF4F8] ${
                    options.value === searchSelectedModule ? 'bg-[#EEF4F8]' : ''
                  }`}
                  onClick={() => onModuleSelection(options.value)}
                >
                  <div className='mr-[10px]'>{options.icon}</div>
                  <div className='font-proxima text-[14px]'>{options.label}</div>
                </div>
              )
            })}
        </div>
      )}

      {isSearchModalVisible && searchValue.length !== 0 && (
        <div
          ref={searchModalRef}
          className='absolute left-0 top-[34px] overflow-hidden rounded-[4px] border border-solid border-[#D8D8D8] bg-white shadow-[0px_6px_28px_0px_#00000029] z-10'
        >
          {totalResultCount === 0 ? (
            <div className='w-[500px] bg-[#F6F6F6] py-[15px] text-center text-sm text-[#6E6D7A]'>No Result Found</div>
          ) : (
            <>
              <div className='border-b border-solid border-[#333333] bg-[#F6F6F6] px-[20px] py-[8px] font-proxima text-sm text-[#6E6D7A]'>
                Check out this similar. <b className='font-proxima text-sm text-[#6E6D7A]'>{totalResultCount} Result Found</b>
              </div>
              <div className='vertical-scroll custom-scroll-filter !max-h-[382px] overflow-y-scroll' onScroll={handleScroll}>
                <div ref={modalRef}>
                  {searchResults &&
                    searchResults.map((res: any) => {
                      return (
                        <div className='border-b border-solid border-[#D8D8D8] px-[20px] py-[8px] hover:bg-[#EEF4F8]'>
                          <div className='w-max max-w-[550px]'>
                            <div
                              className='flex cursor-pointer flex-wrap items-center whitespace-nowrap font-proxima text-[14px]'
                              onClick={() => {
                                const selectedRow =
                                  selectedModuleField &&
                                  selectedModuleField.map((fieldName: string) =>
                                    fieldName === 'TotalOutStanding' || fieldName === 'Amount'
                                      ? `$${res[fieldName]}`
                                      : fieldName === 'BillDate' || fieldName === 'PODate'
                                        ? res[fieldName]
                                          ? format(parseISO(res?.[fieldName]), 'dd/MM/yyyy')
                                          : ''
                                        : res[fieldName]
                                  )
                                onClickSearchResult(selectedRow, res.Id, res.ModuleSubType, res.IsFromDucumet)
                              }}
                            >
                              {selectedModuleField &&
                                selectedModuleField.map((fieldName: any, index: any) => {
                                  return (
                                    res[fieldName] && (
                                      <>
                                        <div
                                          className={`whitespace-nowrap text-[#333333] ${
                                            fieldName === 'TotalOutStanding' || fieldName === 'Amount'
                                              ? 'flex justify-end font-bold'
                                              : ''
                                          }
                                    `}
                                        >
                                          {fieldName === 'TotalOutStanding' || fieldName === 'Amount'
                                            ? `$${res[fieldName]}`
                                            : fieldName === 'BillDate' || fieldName === 'PODate'
                                              ? res[fieldName]
                                                ? format(parseISO(res?.[fieldName]), 'dd/MM/yyyy')
                                                : ''
                                              : res[fieldName]}
                                        </div>
                                        {index + 1 < selectedModuleField.length && (
                                          <div className='mx-[10px] h-[12px] w-[1px] bg-[#333333]' />
                                        )}
                                      </>
                                    )
                                  )
                                })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchComponent