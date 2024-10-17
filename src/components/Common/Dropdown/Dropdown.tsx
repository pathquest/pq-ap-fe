import React, { useCallback, useEffect, useRef, useState } from 'react'
import Building from './Icons/Building'
import ChevronDown from './Icons/ChevronDown'
import Search from './Icons/Search'
import Star from './Icons/Star'

import { invalidateSessionCache } from '@/api/axios'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setSelectedVendors, setVendorIdList } from '@/store/features/billsToPay/billsToPaySlice'
import { setFilterFields } from '@/store/features/paymentstatus/paymentStatusSlice'
import { setProcessPermissionsMatrix } from '@/store/features/profile/profileSlice'
import { getAssignUsertoCompany, setIsRefresh, setSelectedCompany, userGetManageRights } from '@/store/features/user/userSlice'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Toast, Typography } from 'pq-ap-lib'
import { performApiAction } from '../Functions/PerformApiAction'
import { getModulePermissions, hasViewPermission, processPermissions } from '../Functions/ProcessPermission'
import { setFilterFormFields } from '@/store/features/bills/billSlice'
import { initialBillPostingFilterFormFields } from '@/utils/billposting'

const Dropdown: React.FC = () => {
  const { data: session } = useSession()
  const { update } = useSession()
  const user: any = session ? session?.user : {}
  const CompanyId = Number(session?.user?.CompanyId)
  const UserId = session?.user?.user_id
  const router = useRouter()

  const dropDownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [newCompanyList, setNewCompanyList] = useState<any[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const { selectedCompany, isRefresh } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const selectedCompanyValue = selectedCompany?.value

  const sidebarItems = [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Files', route: '/history' },
    { name: 'Bills', route: '/bills' },
    { name: 'Payments', route: '/payments' },
    { name: 'Approval', route: '/approvals' },
    { name: 'Reports', route: '/reports' },
    { name: 'Vendor', route: '/vendors' }
  ]

  //Company List Dropdown API
  // const getCompanyList1 = async () => {
  //   if (UserId) {
  //     try {
  //       const params = {
  //         UserId: UserId,
  //       }

  //       const { payload, meta } = await dispatch(getAssignUsertoCompany(params))
  //       const dataMessage = payload?.Message

  //       if (meta?.requestStatus === 'fulfilled') {
  //         if (payload?.ResponseStatus === 'Success') {
  //           setNewCompanyList(payload?.ResponseData)
  //         } else {
  //           Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
  //         }
  //       } else {
  //         Toast.error(`${payload?.status} : ${payload?.statusText}`)
  //       }
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }
  // }

  const handleSelect = async (label: string, value: string, accountingTool: number, clickOn: string) => {
    setSearchValue('')
    if (clickOn === 'label') {
      dispatch(setSelectedCompany({ label, value, accountingTool }))
      localStorage.setItem('CompanyId', value)
      invalidateSessionCache();
      await update({ ...user, CompanyId: value, CompanyName: label, AccountingTool: accountingTool })
      await dispatch(setFilterFormFields(initialBillPostingFilterFormFields));
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

  const getCompanyList = () => {
    const params = {
      UserId: UserId,
    }
    performApiAction(dispatch, getAssignUsertoCompany, params, (responseData: any) => {
      const filteredList = responseData.filter((company: any) => company.isChecked);
      setNewCompanyList(filteredList)
    })
  }

  const getUserManageRights = () => {
    const params = {
      UserId: UserId,
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, userGetManageRights, params, (responseData: any) => {
      const processedData = processPermissions(responseData);
      dispatch(setProcessPermissionsMatrix(processedData));
      // const firstAllowedItem = sidebarItems.find(item => hasViewPermission(processedData, item.name))

      if (processedData.length > 0) {
        // if (firstAllowedItem && firstAllowedItem.name != "Payments") {
        //   router.push(firstAllowedItem.route)
        // }
        // else if (firstAllowedItem && firstAllowedItem.name == "Payments") {
        //   const isPaymentView = getModulePermissions(processedData, "Payments") ?? {}
        //   const isPaymentStatus = isPaymentView["Payment Status"]?.View ?? false;
        //   if (isPaymentStatus) {
        //     router.push('/payments/status')
        //   } else {
        //     router.push('/payments/billtopay')
        //   }
        // }
        // else {
        //   // If no permissions are found, you might want to redirect to a default page or show an error
        //   router.push('/404')
        // }
      } else {
        Toast.error('You do not have any permission for any module.')
        router.push('/manage/companies')
      }
    })
  }

  useEffect(() => {
    getUserManageRights()
  }, [CompanyId])

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
    }
  }, [newCompanyList])

  useEffect(() => {
    getCompanyList()
    const company = newCompanyList.find((item) => item.value == CompanyId)
    company && dispatch(setSelectedCompany({ label: company.label, value: company?.value, accountingTool: company?.accountingTool }))
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
    if (e.key === 'Enter') {
      e.preventDefault()
      window.location.href = '/manage/companies'
    }
  }

  const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, option: any, index: number) => {
    if ((e.key === 'Enter') && e.target instanceof HTMLElement && e.target.tagName == "LI") {
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
    <div className='relative laptop:w-[275px] laptopMd:w-[275px] lg:w-[275px] xl:w-[275px] hd:w-[334px] 2xl:w-[334px] 3xl:w-[334px]'
      ref={dropDownRef}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => (e.key === 'Enter') && setIsOpen(!isOpen)}>
      <div className='flex h-10 w-full gap-1'>
        <div className='flex text-[1.5rem] !w-[30px] items-center justify-center'>
          <Building />
        </div>
        <div className='flex h-full w-full items-center justify-center px-2'>
          <span
            className={`!font-proxima flex h-full pl-1 w-full cursor-pointer items-center text-sm ${selectedValue === '' ? 'text-slatyGrey' : 'text-black'}`}
            onClick={handleInput}
          >{selectedValue === '' ? 'Select Company' : selectedValue}
          </span>
        </div>
        <div
          className={`absolute right-[-10px] flex h-full !w-[20px] cursor-pointer items-center justify-center text-[1.6rem] transition-transform ${isOpen ? 'duration-400 rotate-180 text-primary' : 'text-slatyGrey duration-200'
            }`}
          onClick={handleInput}>
          <ChevronDown />
        </div>
      </div>

      <ul
        className={`absolute top-12 z-[5] w-[250px] overflow-y-auto border-t-2 border-primary bg-pureWhite shadow-md transition-transform ${isOpen
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
            key={isOpen + ""}
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
              className={`${option.label == selectedValue ? "bg-whiteSmoke" : "bg-pureWhite"} flex items-center justify-between px-5 py-[10px] text-sm font-normal outline-none hover:bg-whiteSmoke focus:bg-whiteSmoke
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
                className={`${option.label == selectedValue ? "pointer-events-none cursor-default" : "cursor-pointer"}  flex flex-grow`}
                onClick={() => {
                  if (option.label !== searchValue) {
                    localStorage.removeItem('IsFieldMappingSet')
                    handleSelect(option.label, option.value, option.accountingTool, 'label')
                  }
                }}
              >
                <Typography type='h6'>{option.label}</Typography>
              </div>
              <div className='cursor-pointer ml-2 flex-shrink-0 items-center text-[1.5rem] text-darkCharcoal'>
                <Star data={option} />
              </div>
            </li>
          ))
        ) : (
          <span className='font-proxima flex items-center px-5 py-[15px] text-sm font-medium hover:bg-whiteSmoke focus:bg-whiteSmoke  '>
            No matching data found.
          </span>
        )}
        <li
          className={`border-t border-lightSilver sticky bottom-0 z-[5] flex cursor-pointer items-center justify-center bg-white laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 text-sm font-normal focus:bg-whiteSmoke`}
        >
          <Button
            className='!h-9 !w-full rounded-full'
            variant='btn-primary'
            onClick={() => localStorage.removeItem('IsFieldMappingSet')}
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