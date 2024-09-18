import React, { useCallback, useEffect, useRef, useState } from 'react'
import Building from './Icons/Building'
import ChevronDown from './Icons/ChevronDown'
import Search from './Icons/Search'
import Star from './Icons/Star'

import { Option } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setSelectedVendors, setVendorIdList } from '@/store/features/billsToPay/billsToPaySlice'
import { paymentStatusDropdown, setFilterFields, setStatusIdList } from '@/store/features/paymentstatus/paymentStatusSlice'
import { getAssignUsertoCompany, setIsRefresh, setSelectedCompany } from '@/store/features/user/userSlice'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Toast, Typography } from 'pq-ap-lib'
import { invalidateSessionCache } from '@/api/axios'

const Dropdown: React.FC = () => {
  const { data: session } = useSession()
  const { update } = useSession()
  const user = session ? session?.user : {}

  const userId = localStorage.getItem('UserId')

  const dropDownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [newCompanyList, setNewCompanyList] = useState<any[]>([])
  const CompanyId = session?.user?.CompanyId

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const { selectedCompany, isRefresh } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const selectedCompanyValue = selectedCompany?.value

  //Company List Dropdown API
  const getCompanyList = async () => {
    if (userId) {
      try {
        const params = {
          UserId: Number(userId),
        }

        const { payload, meta } = await dispatch(getAssignUsertoCompany(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            setNewCompanyList(payload?.ResponseData)
          } else {
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
        } else {
          Toast.error(`${payload?.status} : ${payload?.statusText}`)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  //Status List API
  const getAllStatusList = async () => {
    try {
      const { payload, meta } = await dispatch(paymentStatusDropdown())
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const allValues = payload?.ResponseData.map((option: Option) => option.value)
          dispatch(setStatusIdList(allValues))
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const index = newCompanyList.findIndex((item) => item.value == selectedCompanyValue)
    if (index === -1 && newCompanyList.length > 0) {
      index &&
        dispatch(
          setSelectedCompany({
            label: newCompanyList[0].label,
            value: newCompanyList[0].value,
            accountingTool: newCompanyList[0].accountingTool,
          })
        )
      index && getAllStatusList()
    }
  }, [newCompanyList])

  useEffect(() => {
    getCompanyList()
    const company = newCompanyList.find((item) => item.value == CompanyId)
    company &&
      dispatch(setSelectedCompany({ label: company.label, value: company?.value, accountingTool: company?.accountingTool }))
  }, [isRefresh])

  useEffect(() => {
    const labelObj = newCompanyList.find((item) => item.value == selectedCompanyValue)
    const label = labelObj ? labelObj.label : ''
    setSelectedValue(label)
  }, [selectedCompanyValue, newCompanyList])

  const handleInput = async (e: any) => {
    setSearchValue('')
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    if (newIsOpen !== isOpen) {
      await getCompanyList()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toLowerCase()
    setSearchValue(inputValue)
  }

  const handleSelect = async (label: string, value: string, accountingTool: number, clickOn: string) => {
    if (clickOn === 'label') {
      dispatch(setSelectedCompany({ label, value, accountingTool }))
      localStorage.setItem('CompanyId', value)
      invalidateSessionCache();
      await update({ ...user, CompanyId: value, CompanyName: label, AccountingTool: accountingTool })

      // dispatch(setVendorIdList([]))
      setSelectedValue(label)
      setIsOpen(false)
      dispatch(setFilterFields({ LocationIds: [], VendorIds: [], PaymentMethod: [], StartDate: '', EndDate: '' }))
      dispatch(setSelectedVendors([]))
      dispatch(setVendorIdList([]))
    } else {
      setIsOpen(true)
    }
  }

  // useEffect(() => {
  //   const index = companyList.findIndex((item) => item.value === selectedCompanyValue)
  //   setSelectedValue(companyList[index].label)
  // }, [companyList])

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    },
    [dropDownRef]
  )

  useEffect(() => {
    const prevIsOpen = isOpen

    return () => {
      if (isOpen !== prevIsOpen) {
        dispatch(setIsRefresh(!isRefresh))
      }
    }
  }, [isOpen])

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [handleOutsideClick])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.location.href = '/manage/companies'
    }
  }

  const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, option: any, index: number) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement && e.target.tagName == "LI") {
      setFocusedIndex(-1);
      handleSelect(option.label, option.value, option.accountingTool, 'label')
    } else if (e.key === "ArrowUp" && index > 0 && isOpen) {
      e.preventDefault();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowDown" && index < newCompanyList.length - 1 && isOpen) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    }
  };


  return (
    <div className='relative laptop:w-[270px] laptopMd:w-[270px] lg:w-[270px] xl:w-[270px] hd:w-[334px] 2xl:w-[334px] 3xl:w-[334px]'
      ref={dropDownRef}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}>
      <div className='flex h-10 w-full'>
        <div className='flex text-[1.5rem] !w-[30px] items-center justify-center'>
          <Building />
        </div>
        <div className='flex h-full w-full items-center  justify-center px-2'>
          <span
            className={`flex h-full pl-1  w-full cursor-pointer  items-center text-sm ${selectedValue === '' ? 'text-slatyGrey' : 'text-black'}`}
            onClick={handleInput}
          >{selectedValue === '' ? 'Select Company...' : selectedValue}
          </span>
        </div>
        <div
          className={`absolute right-[-5px] flex h-full !w-[20px] cursor-pointer items-center justify-center text-[1.6rem] transition-transform ${isOpen ? 'duration-400 rotate-180 text-primary' : 'text-slatyGrey duration-200'
            }`}
          onClick={handleInput}
        >
          <ChevronDown />
        </div>
      </div>

      <ul
        className={`absolute top-12 z-[5] w-full overflow-y-auto border-t-2 border-primary bg-pureWhite shadow-md transition-transform ${isOpen
          ? 'max-h-[500px] translate-y-0 opacity-100 transition-opacity duration-300'
          : 'max-h-0 translate-y-20 opacity-0 transition-opacity duration-300'
          } ${isOpen ? 'ease-out' : ''}`}
      >
        <li
          className={`bg-pureWhite sticky top-0 z-[5] flex cursor-pointer items-center  px-5 py-[15px] text-sm font-normal outline-none focus:bg-whiteSmoke`}
        >
          <div className={`absolute flex`}>
            <Search />
          </div>
          <input
            tabIndex={isOpen ? 0 : -1}
            placeholder='Search'
            onChange={handleInputChange}
            className={`w-full flex-grow cursor-pointer rounded  border border-lightSilver bg-transparent py-1 pl-6 text-sm font-normal text-darkCharcoal placeholder-darkCharcoal
                            outline-none placeholder:text-sm`}
          />
        </li>
        {newCompanyList?.length > 0 && newCompanyList?.some((option) => option.label.toLowerCase().startsWith(searchValue)) ? (
          newCompanyList?.map((option, index) => (
            <li
              key={option.label}
              className={` flex cursor-pointer items-center justify-between px-5 py-[10px] text-sm font-normal outline-none hover:bg-whiteSmoke focus:bg-whiteSmoke
                                  ${!option.label.toLowerCase().startsWith(searchValue) ? 'hidden' : ''}`}
              onKeyDown={(e) => handleListItemKeyDown(e, option, index)}
              tabIndex={isOpen ? 0 : -1}
              ref={(el) => {
                if (index === focusedIndex) {
                  el?.focus();
                }
              }}
            >
              {/* <div className="mx-2 flex-shrink-0 items-center text-[1.5rem] text-darkCharcoal">
                  <Avatar
                    variant="small"
                    name={option.label}
                    imageUrl={option.imageUrl}
                  />
                </div> */}
              <div className='mr-2.5 flex-shrink-0 items-center text-[1.5rem] text-darkCharcoal'>
                <Building />
              </div>
              <div
                className='flex flex-grow'
                onClick={() => {
                  if (option.label !== searchValue) {
                    handleSelect(option.label, option.value, option.accountingTool, 'label')
                  }
                }}
              >
                <Typography type='h6'>{option.label}</Typography>
              </div>
              <div className='ml-2 flex-shrink-0 items-center text-[1.5rem] text-darkCharcoal'>
                <Star data={option} />
              </div>
            </li>
          ))
        ) : (
          <span className='font-proxima flex cursor-pointer items-center px-5 py-[15px] text-sm font-medium hover:bg-whiteSmoke focus:bg-whiteSmoke  '>
            No matching data found.
          </span>
        )}
        <li
          className={`sticky bottom-0 z-[5] flex cursor-pointer items-center justify-center bg-white p-5 text-sm font-normal focus:bg-whiteSmoke`}
        >
          <Button
            className='!h-9 !w-full rounded-full'
            variant='btn-primary'
            tabIndex={isOpen ? 0 : -1}
            onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(event)}
          >
            <Link tabIndex={-1} className='!text-sm !tracking-[0.02em] !font-proxima outline-none font-semibold' href={`/manage/companies`}>
              MANAGE COMPANIES
            </Link>
          </Button>
        </li>
      </ul>
    </div>
  )
}

export default Dropdown
