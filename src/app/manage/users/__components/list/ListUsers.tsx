'use client'

import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import PlusIcon from '@/assets/Icons/PlusIcon'
import Actions from '@/components/Common/DatatableActions/DatatableActions'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import WrapperManage from '@/components/Common/WrapperManage'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { companyListDropdown } from '@/store/features/company/companySlice'
import { assignCompanyToUser, deleteUser, getAssignUsertoCompany, userGetList, userUpdateStatus } from '@/store/features/user/userSlice'
import { convertStringsToIntegers } from '@/utils'
import { Button, DataTable, Loader, MultiSelectChip, SaveCompanyDropdown, Switch, Toast, Tooltip } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import Drawer from '../Drawer'
import RoleDrawer from '../RoleDrawer'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface UserData {
  id: number
  name: string
  email: string
  phone: number | null
  country: string
  state: string
  timezone: string
  role: string
  status: any
  company: any
  imageName: string
  action: any
}

const ListUsers: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const UserId = Number(session?.user?.user_id) ?? 0
  const dispatch = useAppDispatch()
  const router = useRouter();

  const { orgPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isManageUserView = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Users", "View");
  const isManageUserCreate = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Users", "Create");
  const isManageUserEdit = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Users", "Edit");

  const [companyList, setCompanyList] = useState([])
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isManageRightsOpen, setIsManageRightsOpen] = useState<boolean>(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState<boolean>(false)
  const [selectedFilterdCompany, setSelectedFilterdCompany] = useState([])
  const [selectedFilterdStatus, setSelectedFilterdStatus] = useState([])
  const [editId, setEditId] = useState<number | undefined | null>()
  const [userData, setUserData] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [assignCompany, setAssignCompany] = useState([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [rowId, setRowId] = useState<number>(0)
  const [orgId, setOrgId] = useState<number | null>(null)
  const [statusFilterValue, setStatusFilterValue] = useState<boolean | null>(null)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [loaderCounter, setLoaderCounter] = useState(0)
  const [apiDataCount, setApiDataCount] = useState(0)
  const [checkloader, setCheckLoader] = useState(true)
  const [initialFilterValues, setInitialFilterValues] = useState({
    company: [],
    status: [],
  })
  const [isSwitchClicked, setIsSwitchClicked] = useState<boolean>(false)

  useEffect(() => {
    if (!isManageUserView) {
      router.push('/manage/companies');
    }
  }, [isManageUserView]);

  const status = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' },
  ]

  let nextPageIndex: number = 1
  const lazyRows = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const updateData = (newList: any[], pageIndex: number | undefined): any[] => {
    if (pageIndex === 1) {
      setIsLoading(false)
      setShouldLoadMore(true)
      return [...newList]
    } else {
      return [...userData, ...newList]
    }
  }

  const getNewList = (responseData: any) => {
    return responseData?.List || []
  }

  const getNewTotalCount = (responseData: any) => {
    return responseData?.TotalCount || 0
  }

  const updateLoader = (isLoading: boolean, openDrawer: boolean): void => {
    setIsLoading(isLoading)
    setLoaderCounter(openDrawer ? 1 : 0)
    setShouldLoadMore(!isLoading)
    setCheckLoader(true)
  }

  //User Data API
  const getUserData = async (pageIndex?: number) => {
    // setIsLoading(true)
    if (pageIndex === 1) {
      setUserData([])
      setItemsLoaded(0)
    }
    const params = {
      GlobalSearch: '',
      CompanyIds: convertStringsToIntegers(selectedFilterdCompany),
      StatusFilter: statusFilterValue, // ALL= null, Active = 1, InActive = 0
      PageIndex: pageIndex || nextPageIndex, // Use provided pageIndex or nextPageIndex
      PageSize: lazyRows,
    }
    try {
      const { payload, meta } = await dispatch(userGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
          const newList = getNewList(responseData)
          const newTotalCount = getNewTotalCount(responseData)
          setApiDataCount(newTotalCount)

          let updatedData = updateData(newList, pageIndex)

          const sortedRoles = updatedData.sort((a: any, b: any) => {
            // Sort "IsOrgAdmin": true roles first
            if (a.IsOrgAdmin && !b.IsOrgAdmin) {
              return -1; // a comes before b
            } else if (!a.IsOrgAdmin && b.IsOrgAdmin) {
              return 1; // b comes before a
            } else {
              return 0; // no change in order
            }
          });
          setUserData(sortedRoles)
          setItemsLoaded(updatedData.length)
          setSelectedCompanies(payload?.ResponseData?.List.assignedCompanies)

          setShouldLoadMore(itemsLoaded < newTotalCount)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      updateLoader(false, isOpenDrawer)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
          nextPageIndex = Math.ceil(itemsLoaded / lazyRows) + 1
          getUserData(nextPageIndex)
        }
      },
      { threshold: 0 }
    )

    if (tableBottomRef.current) {
      observer.observe(tableBottomRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [isLoading, shouldLoadMore, itemsLoaded, tableBottomRef, apiDataCount])

  // Get All CompanyList
  const getCompanyList = () => {
    performApiAction(dispatch, companyListDropdown, null, (responseData: any) => {
      setCompanyList(responseData)
    })
  }

  // Update Status API
  const updateStatus = (id: any, is_Active: any) => {
    const params = {
      Id: id,
      Status: !is_Active,
    }
    performApiAction(dispatch, userUpdateStatus, params, (responseData: any) => {
      Toast.success('Status Updated!')
      setRefreshTable(!refreshTable)
      setIsSwitchClicked(false)
    }, () => {
      setIsSwitchClicked(false)
    })
  }

  //Company List Dropdown API
  const getAssignCompany = () => {
    const params = {
      UserId: rowId,
    }
    performApiAction(dispatch, getAssignUsertoCompany, params, (responseData: any) => {
      setAssignCompany(responseData)
    })
  }

  // Save Assign company by user API
  const saveAssignCompany = () => {
    const params = {
      UserId: rowId,
      CompanyIds: convertStringsToIntegers(selectedCompanies),
    }
    performApiAction(dispatch, assignCompanyToUser, params, () => {
      setRefreshTable(!refreshTable)
    })
  }

  // Delete User API
  const handleUserDelete = () => {
    setIsRemoveOpen(false)
    const params = {
      UserId: rowId,
    }
    performApiAction(dispatch, deleteUser, params, () => {
      Toast.success('User Removed!')
      setRefreshTable(!refreshTable)
    })
  }

  const columns: any = [
    {
      header: '#',
      accessor: 'id',
      sortable: false,
      colalign: 'left',
      colStyle: '!pl-5 !w-[30px]',
    },
    {
      header: 'NAME',
      accessor: 'name',
      sortable: false,
    },
    {
      header: 'E-MAIL ID',
      accessor: 'email',
      sortable: false,
    },
    {
      header: 'COMPANIES',
      accessor: 'companies',
      sortable: false,
      colStyle: '!w-[120px]',
    },
    {
      header: 'ROLES',
      accessor: 'role',
      sortable: false,
    },
    {
      header: 'STATUS',
      accessor: 'status',
      sortable: false,
      colStyle: '!w-[140px]',
    },
    {
      header: '',
      accessor: isManageUserEdit ? 'action' : "",
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[30px]',
    },
  ]

  const handleMenuChange = (actionName: string, id: number) => {
    setRowId(id)
    switch (actionName) {
      case 'Manage Rights':
        setEditId(id)
        setIsManageRightsOpen(!isManageRightsOpen)
        break
      case 'Edit':
        setEditId(id)
        setIsOpenDrawer(!isOpenDrawer)
        break
      case 'Remove':
        setIsRemoveOpen(!isRemoveOpen)
        break
      default:
        break
    }
  }

  const handleDrawerClose = (type: string) => {
    setIsOpenDrawer(false)
    setEditId(null)
    if (type === 'Save') {
      setRefreshTable(!refreshTable)
    }
  }

  const handleFilterOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFilterOpen(true)
    setInitialFilterValues({ company: selectedFilterdCompany, status: selectedFilterdStatus })
    getCompanyList()
  }

  const handleFilterClose = () => {
    setIsFilterOpen(false)
    setSelectedFilterdCompany(initialFilterValues.company)
    setSelectedFilterdStatus(initialFilterValues.status)
    checkIfFiltersChanged(initialFilterValues)
  }

  const onReset = () => {
    setSelectedFilterdCompany([])
    setSelectedFilterdStatus([])
    setStatusFilterValue(null)
    checkIfFiltersChanged({ company: [], status: [] })
  }

  const handleFilterSubmit = () => {
    setRefreshTable(!refreshTable)
    setCheckLoader(false)
    setIsFilterOpen(false)
    setIsApplyButtonDisabled(true)
    setInitialFilterValues({ company: selectedFilterdCompany, status: selectedFilterdStatus })
  }

  const handleStatusFilter = (value: any) => {
    setSelectedFilterdStatus(value)
    checkIfFiltersChanged({ company: selectedFilterdCompany, status: value })

    switch (value.toString()) {
      case '0':
        setStatusFilterValue(false)
        break
      case '1':
        setStatusFilterValue(true)
        break
      default:
        setStatusFilterValue(null)
        break
    }
  }

  const handleCompanyFilter = (value: any) => {
    setSelectedFilterdCompany(value)
    checkIfFiltersChanged({ company: value, status: selectedFilterdStatus })
  }

  const checkIfFiltersChanged = (currentFilters: any) => {
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(initialFilterValues)
    setIsApplyButtonDisabled(!filtersChanged)
  }

  useEffect(() => {
    setIsLoading(true)
    getUserData(1)
  }, [refreshTable])

  useEffect(() => {
    if (!isManageRightsOpen) {
      getAssignCompany()
    }
  }, [rowId, isManageRightsOpen])

  // when user click on action icon set a id
  const handleIdGet = (id: number) => {
    setRowId(id)
  }

  const isUserDisabled = (user: any) => {
    const isCurrentUser = user?.id === UserId
    const isAdminUser = user?.IsOrgAdmin
    return isCurrentUser || isAdminUser
  }

  const updatedUserData = userData && userData?.map(
    (e: any, index: number) =>
      new Object({
        id: <label className='font-proxima text-sm tracking-[0.02em] !pl-3'>{index + 1}</label>,
        name: e?.first_name + ' ' + e?.last_name,
        email: e?.email,
        companies: (
          <div className={`${isManageUserEdit ? "" : "pointer-events-none opacity-80"} CompanyList_manageuser w-full`} onClick={() => setRowId(e.id)}>
            <SaveCompanyDropdown
              id={e?.id}
              showAvatar={5}
              noborder
              options={assignCompany}
              values={e?.assignedCompanies}
              getError={() => { }}
              getValue={(values: any) => setSelectedCompanies(values)}
              Savebtn
              onSaveClick={saveAssignCompany}
              disabled={e?.IsOrgAdmin}
            />
          </div>
        ),
        role: e?.roleName,
        status: (
          <div
            className={`${isManageUserEdit ? "" : "pointer-events-none opacity-80"} ${isSwitchClicked ? "pointer-events-none cursor-default" : " cursor-pointer"} ${e?.id == UserId || e?.IsOrgAdmin === true ? 'pointer-events-none' : ''}`}
            onClick={() => {
              setRowId(e?.id)
              updateStatus(e?.id, e?.is_Active)
              setIsSwitchClicked(true)
            }}
          >
            <Switch checked={e.is_Active} disabled={isUserDisabled(e)} />
          </div>
        ),
        action: (
          <>
            {e?.IsOrgAdmin === false && (
              <Actions
                id={e?.id}
                actions={[
                  'Manage Rights',
                  'Edit',
                  UserId !== rowId ? e?.IsOrgAdmin === false && 'Remove' : false,
                ].filter(Boolean)}
                actionRowId={() => handleIdGet(e?.id)}
                handleClick={handleMenuChange}
              />
            )}
          </>
        ),
      })
  )

  const modalClose = () => {
    setIsRemoveOpen(false)
    setRowId(0)
  }

  const handleToggleChange = () => {
    setIsOpenDrawer(true)
  }

  // set a dynamic orgId
  const globalData = (data: any) => {
    setOrgId(data?.orgId)
  }

  return (
    <>
      <WrapperManage onData={globalData}>
        {/* NavBar */}
        <div className={`sticky top-0 z-[6] ${isManageRightsOpen ? 'hidden' : 'block'}`}>
          <div className='relative flex !h-[66px] items-center justify-between bg-whiteSmoke px-5'>
            <div className='flex items-center'>
              <label className='font-proxima flex cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Manage User</label>
            </div>
            <div className='flex items-center gap-5'>
              <div className='flex h-6 items-center justify-center '>
                <Tooltip position='bottom' content='Filter' className='!z-[6] !cursor-pointer !px-0'>
                  <div className='flex justify-center items-center cursor-pointer' onClick={handleFilterOpen}>
                    <FilterIcon />
                  </div>
                </Tooltip>
              </div>
              <Button className={`${isManageUserCreate ? "block" : "hidden"} rounded-full !h-9 laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]`} variant='btn-primary' onClick={handleToggleChange}>
                <div className='flex justify-center items-center font-bold'>
                  <span className='mr-[8px]'>
                    <PlusIcon color={'#FFF'} />
                  </span>
                  <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>CREATE USER</label>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        <div
          className={`${isFilterOpen &&
            'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
            }`}>
          <div
            tabIndex={-1}
            className={`top-28 z-30 w-[531px] outline-none rounded border border-lightSilver bg-pureWhite ${isFilterOpen ? 'absolute translate-x-0 right-[212px]' : ' fixed translate-x-full right-0'} transition-transform duration-300 ease-in-out`}>
            {/* Header */}
            <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
              <span className='font-proxima text-lg font-medium text-darkCharcoal tracking-[0.02em]' tabIndex={-1}>Filter</span>
              <Button className='rounded-sm !text-base' variant="error" onClick={onReset}>
                Reset All
              </Button>
            </div>

            {/* Content */}
            <div className='grid grid-cols-2 gap-5 p-5'>
              <div className='w-full'>
                <MultiSelectChip
                  id='company'
                  label='Company'
                  placeholder='Please select'
                  options={companyList}
                  type='checkbox'
                  defaultValue={selectedFilterdCompany}
                  getValue={(value: any) => handleCompanyFilter(value)}
                  getError={() => { }}
                  onSelect={() => { }}
                />
              </div>
              <div className='w-full'>
                <MultiSelectChip
                  id='status'
                  label='Status'
                  placeholder='Please select'
                  options={status}
                  type='checkbox'
                  defaultValue={selectedFilterdStatus}
                  getValue={(value: any) => handleStatusFilter(value)}
                  getError={() => { }}
                  onSelect={() => { }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end border-t border-lightSilver shadow-inner laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
              <Button tabIndex={0} onClick={handleFilterClose} className='!h-9 rounded-full !p-0 !m-0' variant='btn-outline-primary'>
                <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
                  CANCEL
                </label>
              </Button>
              <Button
                type='submit'
                tabIndex={0}
                onClick={handleFilterSubmit}
                className={`h-9 rounded-full !p-0 !m-0`}
                variant={isApplyButtonDisabled ? 'btn' : 'btn-primary'}
                disabled={isApplyButtonDisabled ? true : false}>
                <label className="cursor-pointer laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">
                  APPLY FILTER
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Role Drawer */}
        <RoleDrawer
          onOpen={isManageRightsOpen}
          onClose={() => setIsManageRightsOpen(false)}
          userId={editId ? editId : 0}
        />

        {/* Data Table */}
        <div className='h-[calc(100vh-145px)] approvalMain custom-scroll overflow-auto max-[425px]:mx-1'>
          <div className={`${userData.length !== 0 && 'h-0'}`}>
            <DataTable
              columns={columns}
              data={userData.length > 0 ? updatedUserData : []}
              hoverEffect={true}
              sticky
              isTableLayoutFixed
              getExpandableData={() => { }}
              lazyLoadRows={lazyRows}
              getRowId={() => { }}
            />
            {isLoading && loaderCounter === 1 && checkloader && <Loader size='sm' helperText />}

            <div ref={tableBottomRef} />
          </div>
          <DataLoadingStatus isLoading={isLoading} data={userData} />
        </div>

        {/* Remove Modal */}
        <ConfirmationModal
          title='Remove'
          content='Are you sure you want to remove the user ?'
          isModalOpen={isRemoveOpen}
          modalClose={modalClose}
          handleSubmit={handleUserDelete}
          colorVariantNo='btn-outline'
          colorVariantYes='btn-error'
        />

        {/*  Drawer */}
        <Drawer onOpen={isOpenDrawer} onClose={(value: string) => handleDrawerClose(value)} EditId={editId} />

        {/* Drawer Overlay */}
        <DrawerOverlay isOpen={isOpenDrawer} onClose={undefined} />
      </WrapperManage>
    </>
  )
}

export default ListUsers