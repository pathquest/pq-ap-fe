'use client'
import { useSession } from 'next-auth/react'
import { useMediaQuery } from 'react-responsive'
import React, { useEffect, useRef, useState } from 'react'

import { Button, Loader, MultiSelectChip, NavigationBar, Toast, Tooltip, Typography } from 'pq-ap-lib'

import PlusIcon from '@/assets/Icons/PlusIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import ListDashboardIcon from '@/assets/Icons/practice_dashboard/ListDashboardIcon'
import GridIcon from '@/assets/Icons/practice_dashboard/GridIcon'

import WrapperManage from '@/components/Common/WrapperManage'

import { practDashboardData, practDashboardTabs } from '@/data/practDashboard'
import { format, subMonths } from 'date-fns'
import {
  accountingDashboardList,
  billingInfoList,
  companyDropdownbyOrg,
  setFilterFormFields,
} from '@/store/features/accountantDashboard/accountDashboardSlice'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import CashBack from './common/CashBack'
import ActivePlan from './common/ActivePlan'
import Card from './common/Card'
import FilterPractDashboard from './common/FilterPractDashboard'
import ManageCompanyList from './list/ManageCompanyList'
import BillingInfo from './list/BillingInfo'
import Download from '@/components/Common/Custom/Download'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { convertStringsDateToUTC } from '@/utils'
import { companyListDropdown, filterAccounting } from '@/store/features/company/companySlice'
import { userListDropdown } from '@/store/features/user/userSlice'
import ExportIcon from '@/assets/Icons/reports/ExportIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

interface OrgData {
  orgId: number
}

function AccountantDashboard({ organizationOptions, sessionData }: any) {
  const firstDayOfCurrentMonth = new Date()
  const formattedCurrentMonth = format(firstDayOfCurrentMonth, 'MM/yyyy')

  const { data: session } = useSession()
  const filterMenuRef = useRef<HTMLUListElement>(null)
  const token = session?.user?.access_token

  const CompanyId = Number(session?.user?.CompanyId) ?? 0
  const { filterFormFields } = useAppSelector((state) => state.accountantDashboard)

  const dispatch = useAppDispatch()

  const [tab, setTab] = useState<string>('accountant-dashboard')
  const isTablet = useMediaQuery({ query: '(max-width: 1023px)' })
  const [visibleTab, setVisibleTab] = useState<number>(2)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [billingInfoData, setBillingInfoData] = useState<any[]>([])
  const [accountingDashboardData, setAccountingDashboardData] = useState<any[]>([])
  const [totalAmountVirtualCard, setTotalAmountVirtualCard] = useState(0)
  const [localFilterFormFields, setLocalFilterFormFields] = useState<any>(filterFormFields)
  const [isResetFilter, setIsResetFilter] = useState<boolean>(false)
  const [showCashBackPopup, setShowCashBackPopup] = useState<boolean>(false)
  const [showCompnayDashboardView, setShowCompanyDashboardView] = useState<boolean>(false)
  const [showActivePlanPopup, setShowActivePlanPopup] = useState<boolean>(false)
  const [isOpenDashboardFilter, setIsOpenDashboardFilter] = useState<boolean>(false)
  const [isCompanyListView, setIsCompanyListView] = useState<boolean>(false)
  const [openIndex, setOpenIndex] = useState(null)
  const [companyDropdownbyOrganization, setCompanyDropdownbyOrganization] = useState<string[]>([])
  const [orgId, setOrgId] = useState<number | null>(null)
  const [isApplyFilter, setIsApplyFilter] = useState<boolean>(false)
  const [openFilterBox, setOpenFilterBox] = useState<boolean>(false)
  const [openCompaniesModal, setOpenCompaniesModal] = useState<boolean>(false)
  const [isExportLoading, setIsExportLoading] = useState<boolean>(false)
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true)
  const [initialFilterValues, setInitialFilterValues] = useState({
    company: [],
    accountingTools: [],
    assignUser: [],
  })

  // For filter
  const [filterdCompany, setFilterdCompany] = useState([])
  const [selectedFilterdCompany, setSelectedFilterdCompany] = useState<any>([])
  const [filterdAccountingTool, setFilterdAccountingTool] = useState([])
  const [selectedAccountingTool, setSelectedAccountingTool] = useState<any>([])
  const [filterdAssignUser, setFilterdAssignUser] = useState([])
  const [selectedAssignUser, setSelectedAssignUser] = useState<any>([])

  const initialFilterFormFields: any = {
    ft_organizationName: 23,
    ft_companyName: companyDropdownbyOrganization.map((option: any) => String(option.value)),
    ft_viewByMonth: formattedCurrentMonth,
  }

  useEffect(() => {
    if (isTablet) {
      setVisibleTab(1)
    } else {
      setVisibleTab(2)
    }
  }, [isTablet])

  const handleCancel = () => {
    setIsOpenDashboardFilter(false)
  }

  const handleApply = async () => {
    if (isResetFilter) {
      await dispatch(setFilterFormFields(initialFilterFormFields))
      setIsOpenDashboardFilter(false)
      setIsApplyFilter(true)
      return
    }
    dispatch(
      setFilterFormFields({
        ...localFilterFormFields,
      })
    )
    setIsApplyFilter(true)
    setIsOpenDashboardFilter(false)
  }

  const handleToggle = (index: any) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // set a dynamic orgId
  const globalData = (data: OrgData) => {
    setOrgId(data?.orgId)
  }

  function formatDateByMonthYear(monthYear: any) {
    const [month, year] = monthYear.split('/')
    const formattedDate = `${month}/01/${year}`
    return formattedDate
  }

  const getBillingInfo = () => {
    setIsLoading(true)
    const params = {
      Orgnization: [23],
      Company: filterFormFields.ft_companyName.map(Number),
      ViewByMonth: convertStringsDateToUTC(formatDateByMonthYear(filterFormFields.ft_viewByMonth)),
    }
    performApiAction(
      dispatch,
      billingInfoList,
      params,
      (responseData: any) => {
        let total = 0
        responseData.forEach((entry: any) => {
          entry.CompanyBillingInfoList.forEach((company: any) => {
            company.PaymentMethodDetails.forEach((payment: any) => {
              if (payment.PaymentMethod === 5) {
                total += payment.Amount
              }
            })
          })
        })
        setIsApplyFilter(false)
        setTotalAmountVirtualCard(total)
        setBillingInfoData(responseData[0].CompanyBillingInfoList)
        setIsLoading(false)
      },
      () => {
        setIsApplyFilter(false)
        setIsLoading(false)
      }
    )
  }

  const getAccountingDashboard = () => {
    setIsLoading(true)
    const params = {
      Orgnization: [23],
      Company: localFilterFormFields.ft_companyName.map(Number),
      ViewByMonth: convertStringsDateToUTC(formatDateByMonthYear(localFilterFormFields.ft_viewByMonth)),
    }
    performApiAction(
      dispatch,
      accountingDashboardList,
      params,
      (responseData: any) => {
        setIsApplyFilter(false)
        setAccountingDashboardData(responseData)
        setIsLoading(false)
      },
      () => {
        setIsApplyFilter(false)
        setIsLoading(false)
      }
    )
  }

  const fetchCompanybyOrg = () => {
    const params = {
      OrgIds: [23],
    }
    performApiAction(dispatch, companyDropdownbyOrg, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ label: item.label, value: String(item.value) }))
      setCompanyDropdownbyOrganization(mappedList)
    })
  }
  useEffect(() => {
    fetchCompanybyOrg()
  }, [])

  useEffect(() => {
    if (companyDropdownbyOrganization.length > 0) {
      setIsLoading(true)
      dispatch(
        setFilterFormFields({
          ft_companyName: companyDropdownbyOrganization.map((option: any) => String(option.value)),
          ft_organizationName: 23,
          ft_viewByMonth: formattedCurrentMonth,
        })
      )
      const params = {
        Company: companyDropdownbyOrganization.map((option: any) => parseInt(option.value)),
        Orgnization: [23],
        ViewByMonth: convertStringsDateToUTC(formatDateByMonthYear(formattedCurrentMonth)),
      }
      performApiAction(
        dispatch,
        accountingDashboardList,
        params,
        (responseData: any) => {
          setIsApplyFilter(false)
          setAccountingDashboardData(responseData)
          setIsLoading(false)
        },
        () => {
          setIsApplyFilter(false)
          setIsLoading(false)
        }
      )
    }
  }, [companyDropdownbyOrganization])

  useEffect(() => {
    if (tab === 'billInfo') {
      getBillingInfo()
    }
  }, [tab])

  useEffect(() => {
    if (isApplyFilter) {
      if (tab === 'billInfo') {
        getBillingInfo()
      } else {
        getAccountingDashboard()
      }
    }
  }, [isApplyFilter])

  // Filter menu close when user click outside
  useEffect(() => {
    const handlefilterclickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current?.contains(event.target as Node)) {
        setOpenFilterBox(false)
      }
    }
    window.addEventListener('click', handlefilterclickOutside)
    return () => {
      window.removeEventListener('click', handlefilterclickOutside)
    }
  }, [])

  const handleFilterClose = () => {
    setSelectedFilterdCompany(initialFilterValues.company)
    setSelectedAccountingTool(initialFilterValues.accountingTools)
    setSelectedAssignUser(initialFilterValues.assignUser)
    setOpenFilterBox(false)
  }

  const filterCompany = () => {
    performApiAction(dispatch, companyListDropdown, null, (responseData: any) => {
      setFilterdCompany(responseData)
    })
  }

  const filterAccountingTool = () => {
    performApiAction(dispatch, filterAccounting, null, (responseData: any) => {
      setFilterdAccountingTool(responseData)
    })
  }

  const filterAssignUser = () => {
    performApiAction(dispatch, userListDropdown, null, (responseData: any) => {
      setFilterdAssignUser(responseData)
    })
  }

  const handleFilterOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    filterCompany()
    filterAccountingTool()
    filterAssignUser()
    setInitialFilterValues({
      company: selectedFilterdCompany,
      accountingTools: selectedAccountingTool,
      assignUser: selectedAssignUser,
    })
    setOpenFilterBox(true)
  }

  const handleCompanyFilter = (value: any) => {
    setSelectedFilterdCompany(value)
    checkIfFiltersChanged({ company: value, accountingTools: selectedAccountingTool, assignUser: selectedAssignUser })
  }

  const handleAccountingToolFilter = (value: any) => {
    setSelectedAccountingTool(value)
    checkIfFiltersChanged({ company: selectedFilterdCompany, accountingTools: value, assignUser: selectedAssignUser })
  }

  const handleAssignUserFilter = (value: any) => {
    setSelectedAssignUser(value)
    checkIfFiltersChanged({ company: selectedFilterdCompany, accountingTools: selectedAccountingTool, assignUser: value })
  }

  const checkIfFiltersChanged = (currentFilters: any) => {
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(initialFilterValues)
    setIsApplyButtonDisabled(!filtersChanged)
  }

  const onReset = () => {
    setSelectedFilterdCompany([])
    setSelectedAccountingTool([])
    setSelectedAssignUser([])
    checkIfFiltersChanged({ company: [], accountingTools: [], assignUser: [] })
  }

  const dynamicClass = openFilterBox ? `absolute right-[120px] translate-x-0` : 'fixed right-0 translate-x-full'

  const handleFilter = () => {
    setOpenFilterBox(false)
    setIsApplyButtonDisabled(true)
    setInitialFilterValues({
      company: selectedFilterdCompany,
      accountingTools: selectedAccountingTool,
      assignUser: selectedAssignUser,
    })
  }

  //Handle create company modal open and close
  const handleCompaniesModal = () => {
    setOpenCompaniesModal(!openCompaniesModal)
  }

  const handleExport = async () => {
    setIsExportLoading(true)
    const params = {
      Orgnization: [23],
      Company: filterFormFields.ft_companyName.map(Number),
      ViewByMonth: convertStringsDateToUTC(formatDateByMonthYear(filterFormFields.ft_viewByMonth)),
      IsDownload: true,
    }
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `bearer ${token}`,
      },
      responseType: 'arraybuffer',
    }
    const response: AxiosResponse = await axios.post(`${process.env.API_DASHBOARD}/dashboard/getbillinginfolist`, params, config)

    if (response.status === 200) {
      if (response.data.ResponseStatus === 'Failure') {
        Toast.error('Please try again later.')
        setIsExportLoading(false)
      } else {
        const blob = new Blob([response.data], {
          type: response.headers['content-type'],
        })

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Billing Info.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        setIsExportLoading(false)
      }
    }
  }

  return (
    <WrapperManage onData={globalData}>
      {/* Dashboard NavBar */}
      <div className={`sticky top-0 z-[6]`}>
        <div className='relative flex justify-between bg-whiteSmoke px-4 py-[13px] '>
          <div className={`flex w-[40%] justify-start`}>
            <NavigationBar
              key={CompanyId}
              tabs={practDashboardTabs}
              visibleTab={visibleTab}
              getValue={(value) => setTab(value)}
            />
          </div>
          <div className='relative flex w-[60%] items-center justify-end'>
            <div className={`flex items-center ${tab === 'billInfo' && 'pr-5'}`}>
              <div
                className='mr-5 cursor-pointer rounded-[4px] border border-lightSilver bg-whiteSmoke px-2 py-[2px] text-[14px] hover:border-[#02B89D] hover:text-[#02B89D] hover:shadow-lg'
                onMouseEnter={() => setShowActivePlanPopup(true)}
                onMouseLeave={() => setShowActivePlanPopup(false)}
              >
                <span className='text-[#333333] text-[14px]'>Active Plan</span>
              </div>
              <div
                className='mr-8 cursor-pointer rounded-[4px] border border-lightSilver bg-whiteSmoke px-2 py-[2px] text-[14px] hover:border-[#02B89D] hover:text-[#02B89D] hover:shadow-lg'
                onMouseEnter={() => setShowCashBackPopup(true)}
                onMouseLeave={() => setShowCashBackPopup(false)}
              >
                <span className='text-[#333333] text-[14px]'>Cash Back</span>
              </div>
              <div
                className='mr-7 flex h-6 w-6 cursor-pointer items-center justify-center'
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpenDashboardFilter(true)}
                onClick={(e: any) => {
                  if (isCompanyListView) {
                    handleFilterOpen(e)
                  } else {
                    setIsOpenDashboardFilter(true)
                    setLocalFilterFormFields({ ...filterFormFields })
                  }
                }}
              >
                <Tooltip position='bottom' content={'Filter'} className='!z-[6] !py-2 !pl-0 !pr-0 !font-proxima'>
                  <FilterIcon />
                </Tooltip>
              </div>
              {tab !== 'billInfo' && (
                <div
                  className='mr-5 flex h-6 w-6 cursor-pointer items-center justify-center'
                  onClick={() => setIsCompanyListView(!isCompanyListView)}
                  onMouseEnter={() => setShowCompanyDashboardView(true)}
                  onMouseLeave={() => setShowCompanyDashboardView(false)}
                >
                  {/* <Tooltip
                    position={(showCompnayDashboardView && isCompanyListView) ? 'bottom' : 'left'}
                    content={(showCompnayDashboardView && isCompanyListView) ? 'Switch to Practice Dashboard' : 'Switch to List View'}
                    className='!z-[6] !px-2 !py-2'
                  > */}
                  {isCompanyListView ? <GridIcon /> : <ListDashboardIcon />}
                  {/* </Tooltip> */}
                </div>
              )}
              {tab === 'billInfo' && (
                <span onClick={handleExport}>
                  {isExportLoading ? (
                    <div className='pl-[10px] pr-[8px]'>
                      <div className='animate-spin'>
                        <SpinnerIcon bgColor='#6E6D7A' />
                      </div>
                    </div>
                  ) : (
                    <span className='cursor-pointer'>
                      <Tooltip position='bottom' content={'Export'} className='!z-[6] !pb-1 !font-proxima'>
                        <ExportIcon />
                      </Tooltip>
                    </span>
                  )}
                </span>
              )}
            </div>
            {showCashBackPopup && (
              <div
                className={`absolute ${
                  isCompanyListView ? 'right-[365px] top-12' : tab === 'billInfo' ? 'right-36 top-12' : 'right-32 top-12'
                } !z-10 flex w-[553px] rounded-md bg-white shadow-lg`}
              >
                <CashBack totalVirtualCard={totalAmountVirtualCard} />
              </div>
            )}

            {showActivePlanPopup && (
              <div
                className={`absolute ${
                  isCompanyListView ? '!top-12 right-[460px]' : tab === 'billInfo' ? '!right-60 !top-12' : '!right-60 !top-12'
                }  !z-10 flex w-auto rounded-md bg-white shadow-lg`}
              >
                <ActivePlan />
              </div>
            )}

            {isCompanyListView && tab !== 'billInfo' && (
              <Button className='rounded-full !px-6 !py-1.5' variant='btn-primary' onClick={handleCompaniesModal}>
                <div className='flex items-center'>
                  <span className='flex items-center px-1'>
                    <PlusIcon color={'white'} />
                  </span>
                  <label className='flex cursor-pointer items-center text-sm !font-semibold tracking-[0.02em]'>CREATE COMPANY</label>
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      {tab === 'accountant-dashboard' && (
        <>
          {isCompanyListView ? (
            <div>
              <ManageCompanyList
                orgIdValue={orgId}
                session={sessionData}
                isOpenCompanyModal={openCompaniesModal}
                setOpenCompaniesModal={(value: boolean) => setOpenCompaniesModal(value)}
                selectedAccountingTool={initialFilterValues.accountingTools}
                selectedFilterdCompany={initialFilterValues.company}
                selectedAssignUser={initialFilterValues.assignUser}
              />
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className='flex h-[calc(100vh-148px)] w-full items-center justify-center'>
                  <Loader size='md' helperText />
                </div>
              ) : (
                <div className='custom-scroll flex h-[calc(100vh-150px)] flex-col overflow-y-scroll px-3 py-5'>
                  {accountingDashboardData.map((org, index) => (
                    // <DashboardAccordion
                    //   key={index}
                    //   title={org.OrganizationName}
                    //   isOpen={openIndex === index}
                    //   onToggle={() => handleToggle(index)}
                    // >
                    <div className='grid w-full grid-cols-3 flex-wrap gap-5'>
                      {org.AccountingDashboardDetail.map((company: any, idx: any) => (
                        <Card key={idx} company={company} isLastCardInRow={(idx + 1) % 3 == 0} />
                      ))}
                    </div>
                    // </DashboardAccordion>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'billInfo' && (
        <>
          <BillingInfo billingInfoData={billingInfoData} isLoading={isLoading} />
        </>
      )}

      {isCompanyListView && tab !== 'billInfo' ? (
        <>
          {/* Company Filter Modal */}
          <div
            className={`${
              openFilterBox &&
              'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
            }`}
          >
            <ul
              className={`top-28 w-[793px] rounded border border-lightSilver ${dynamicClass} bg-pureWhite transition-transform duration-300 ease-in-out`}
            >
              <li className='flex items-center justify-between border-b border-lightSilver  px-4 py-3'>
                <div className='text-lg font-medium'>Filter</div>
                <div onClick={onReset}>
                  <span className='cursor-pointer rounded p-2 text-[#DC3545] hover:bg-[#F8D7DA] hover:text-[#B02A37]'>
                    Reset All
                  </span>
                </div>
              </li>
              <div className='m-5 grid grid-cols-2 items-center gap-5'>
                <MultiSelectChip
                  id='company'
                  label='Company'
                  placeholder='Please select'
                  options={filterdCompany}
                  type='checkbox'
                  defaultValue={selectedFilterdCompany}
                  getError={() => {}}
                  getValue={(value: string[]) => {
                    handleCompanyFilter(value)
                  }}
                  onSelect={() => {}}
                />
                <MultiSelectChip
                  id='accounting tool'
                  placeholder='Please select'
                  label='Accounting Tool'
                  options={filterdAccountingTool}
                  type='checkbox'
                  defaultValue={selectedAccountingTool}
                  getValue={(value: string[]) => handleAccountingToolFilter(value)}
                  getError={() => {}}
                  onSelect={() => {}}
                />
              </div>
              <div className='m-5 grid grid-cols-2 items-center gap-5'>
                <MultiSelectChip
                  label='Assign User'
                  id='user'
                  placeholder='Please select'
                  type='checkbox'
                  defaultValue={selectedAssignUser}
                  options={filterdAssignUser}
                  getError={() => {}}
                  getValue={(value: string[]) => {
                    handleAssignUserFilter(value)
                  }}
                  onSelect={() => {}}
                />
              </div>
              <li className='flex items-center justify-end border-t border-lightSilver  shadow-inner'>
                <div className='mx-5 my-3 '>
                  <Button
                    onClick={handleFilterClose}
                    className='h-9 w-24 rounded-full font-medium xsm:!px-1'
                    variant='btn-outline-primary'
                  >
                    <Typography type='h6' className='!text-[16px] !font-semibold'>
                      CANCEL
                    </Typography>
                  </Button>
                  <Button
                    type='submit'
                    onClick={handleFilter}
                    className={`ml-5 h-9 w-32 rounded-full font-medium xsm:!px-1`}
                    variant={!isApplyButtonDisabled ? 'btn-primary' : 'btn'}
                    disabled={isApplyButtonDisabled ? true : false}
                  >
                    <Typography type='h6' className='!text-[16px] !font-semibold'>
                      APPLY FILTER
                    </Typography>
                  </Button>
                </div>
              </li>
            </ul>
          </div>
        </>
      ) : tab === 'billInfo' && !isCompanyListView ? (
        <>
          <FilterPractDashboard
            onResetFilter={(value: boolean) => setIsResetFilter(value)}
            filterFormFields={filterFormFields}
            organizationOptions={organizationOptions}
            companyDropdownbyOrganization={companyDropdownbyOrganization}
            localFilterFormFields={localFilterFormFields}
            setLocalFilterFormFields={setLocalFilterFormFields}
            isOpenFilter={isOpenDashboardFilter}
            onReset={() => {
              setIsResetFilter(true)
              setLocalFilterFormFields(initialFilterFormFields)
            }}
            onClose={() => setIsOpenDashboardFilter(false)}
            onCancel={handleCancel}
            onApply={handleApply}
          />
        </>
      ) : (
        <>
          <FilterPractDashboard
            onResetFilter={(value: boolean) => setIsResetFilter(value)}
            filterFormFields={filterFormFields}
            organizationOptions={organizationOptions}
            companyDropdownbyOrganization={companyDropdownbyOrganization}
            localFilterFormFields={localFilterFormFields}
            setLocalFilterFormFields={setLocalFilterFormFields}
            isOpenFilter={isOpenDashboardFilter}
            onReset={() => {
              setIsResetFilter(true)
              setLocalFilterFormFields(initialFilterFormFields)
            }}
            onClose={() => setIsOpenDashboardFilter(false)}
            onCancel={handleCancel}
            onApply={handleApply}
          />
        </>
      )}
    </WrapperManage>
  )
}

export default AccountantDashboard
