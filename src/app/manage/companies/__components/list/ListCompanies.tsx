'use client'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Actions from '@/components/Common/DatatableActions/DatatableActions'
import React, { useEffect, useRef, useState } from 'react'

// Library Components
import AvatarWithText from '@/app/manage/companies/__components/AvatarWithText'
import CompaniesModal from '@/app/manage/companies/__components/CompaniesModal'
import Drawer from '@/app/manage/companies/__components/Drawer'
import DrawerOverlay from '@/app/manage/companies/__components/DrawerOverlay'
import FilterIcon from '@/assets/Icons/FilterIcons'
import PlusIcon from '@/assets/Icons/PlusIcon'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import WrapperManage from '@/components/Common/WrapperManage'
import { useCompanyContext } from '@/context/companyContext'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { AssignUserToCompany, companyGetList, companyListDropdown, conncetQb, conncetXero, filterAccounting, manageCompanyAssignUser, performCompanyActions, redirectQb, redirectXero, sageCompanyConnect, sageCompanyReconnect, sageUserConnect } from '@/store/features/company/companySlice'
import { setIsRefresh, setSelectedCompany, userGetManageRights, userListDropdown } from '@/store/features/user/userSlice'
import { convertStringsToIntegers } from '@/utils'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Avatar, Button, Close, CompanyList, DataTable, Loader, Modal, ModalContent, ModalTitle, MultiSelectChip, Password, SaveCompanyDropdown, Select, Text, Toast, Tooltip, Typography } from 'pq-ap-lib'
import agent, { invalidateSessionCache } from '@/api/axios'
import { getModulePermissions, hasSpecificPermission, hasViewPermission, processPermissions } from '@/components/Common/Functions/ProcessPermission'
import { setOrganizationName, setOrgPermissionsMatrix, setProcessPermissionsMatrix, setRoleId } from '@/store/features/profile/profileSlice'
import { permissionGetList } from '@/store/features/role/roleSlice'

interface Item {
  clientname: string
  clientid: number
}

interface List {
  Id: number
  Name: string
  AccountingTool: number | null
  IsActive: boolean
  IsFieldMappingSet: boolean
  // Add other properties as needed
}

interface IntacctData {
  NAME: string
  LOCATIONID: number
}
interface Company {
  IsActive: boolean
  UpdatedOn: string | null
  CreatedOn: string
  AssigedUsers: string[]
  userNames: string | null
  userIds: null
  Id: number
  Name: string
  AccountingTool: number
  CompanyImage: string
  IsConnected: boolean
}

interface OrgData {
  orgId: number
}

interface IntacctEntityProps {
  LOCATIONID: string
  NAME: string
  RECORDNO: string | null
}

const ListCompanies = () => {
  // const user = session ? session?.user : {}
  const { data: session } = useSession()
  const UserId = session?.user?.user_id
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlToken = session?.user?.access_token
  const user = session ? session?.user : {}

  const { update } = useSession()

  const { selectedCompany } = useAppSelector((state) => state.company)
  const selectedCompanyValue = selectedCompany?.value
  const { isRefresh } = useAppSelector((state) => state.user)
  const { processPermissionsMatrix, orgPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isManageCompanyCreate = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Company", "Create");
  const isManageCompanyEdit = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Company", "Edit");

  const dispatch = useAppDispatch()

  const filterMenuRef = useRef<HTMLUListElement>(null)
  const selectRef = useRef<HTMLDivElement>(null)

  const [openFilterBox, setOpenFilterBox] = useState<boolean>(false)
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [isNoAccountingToolCompany, setIsNoAccountingToolCompany] = useState<boolean>(false)
  const [openDeactivateModal, setOpenDeactivateModal] = useState<boolean>(false)
  const [openActivateModal, setOpenActivateModal] = useState<boolean>(false)
  const [openDisconnectModal, setOpenDisconnectModal] = useState<boolean>(false)
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false)
  const [isManageConfigurationDrawerOpen, setIsManageConfigurationDrawerOpen] = useState<boolean>(false)
  const [openCompaniesModal, setOpenCompaniesModal] = useState<boolean>(false)
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true)
  const [initialFilterValues, setInitialFilterValues] = useState({
    company: [],
    accountingTools: [],
    assignUser: [],
  })
  const [selectedRowId, setSelectedRowId] = useState(0)
  const [editId, setEditId] = useState<number | undefined | null>()
  const [qboCompanyData, setQboCompanyData] = useState<any[] | null>(null)
  const [xeroCompanyData, setXeroCompanyData] = useState<any[] | null>(null)
  const [companyList, setCompanyList] = useState<Company[]>([])
  const [accountingTool, setAccountingTool] = useState<number | null>()
  const [orgId, setOrgId] = useState<number | null>(null)

  const { setAccountingToolType } = useCompanyContext()

  // For intacct Modal validation
  const [openIntacctModal, setOpenIntacctModal] = useState<boolean>(false)
  const [intacctCompanyId, setIntacctCompanyId] = useState('')
  const [intacctCompanyIdError, setIntacctCompanyIdError] = useState(false)
  // intacct userId state
  const [intacctUserId, setIntacctUserId] = useState('')
  const [intacctUserIdError, setIntacctUserIdError] = useState(false)
  // intacct Password state
  const [intacctPassword, setIntacctPassword] = useState('')
  const [intacctPasswordError, setIntacctPasswordError] = useState(false)

  // intacct Company Select Modal
  const [intacctCompanyModal, setIntacctCompantModal] = useState<boolean>(false)
  const [intacctComDropId, setIntacctComDropId] = useState('')
  const [intacctComDropList, setIntacctComDropList] = useState([])
  const [intacctComDropIdError, setIntacctComDropIdError] = useState<boolean>(false)
  const [intacctComClientId, setIntacctComClientId] = useState<string>('')

  // Second dropdown for intacct
  const [intacctEntityList, setIntacctEntityList] = useState([])
  const [intacctEntityListId, setIntacctEntityListId] = useState('')
  const [intacctEntityListIdError, setIntacctEntityListIdError] = useState<boolean>(false)
  const [intacctEntities, setIntacctEntities] = useState<IntacctEntityProps[]>([])

  // for assign user dropdown
  const [assignDropDownData, setAssignDropDownData] = useState([])

  // For filter
  const [filterdCompany, setFilterdCompany] = useState([])
  const [selectedFilterdCompany, setSelectedFilterdCompany] = useState<any>([])
  const [filterdAccountingTool, setFilterdAccountingTool] = useState([])
  const [selectedAccountingTool, setSelectedAccountingTool] = useState<any>([])
  const [filterdAssignUser, setFilterdAssignUser] = useState([])
  const [selectedAssignUser, setSelectedAssignUser] = useState<any>([])

  // for asign user dropdown in table
  const [rowId, setRowId] = useState<number | null>(0)
  const [assignUserSelectIds, setAssignUserSelectIds] = useState<number[]>([])

  // for loader
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // for intacct dropdown
  const [entityVisiable, setEntityVisiable] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isConfirmCancel, setIsConfirmCancel] = useState(false)

  // Table Headers
  const headers: any = [
    {
      header: '#',
      accessor: 'Id',
      sortable: false,
      colStyle: '!w-[20px]',
      colalign: 'center'
    },
    {
      header: 'COMPANY',
      accessor: 'Name',
      sortable: false,
      colStyle: '!tracking-[0.02em] !font-bold !w-[130px]',
    },
    {
      header: 'CONNECTED WITH',
      accessor: 'AccountingTool',
      sortable: false,
      colStyle: '!tracking-[0.02em] !font-bold !w-[100px]',
    },
    {
      header: 'MODIFIED DATE',
      accessor: 'UpdatedOn',
      sortable: false,
      colStyle: '!tracking-[0.02em] !font-bold !w-[150px]',
    },
    {
      header: 'ASSIGN USER',
      accessor: 'AssignUsers',
      sortable: false,
      colStyle: '!tracking-[0.02em] !font-bold !w-[150px]',
    },
    {
      header: '',
      accessor: isManageCompanyEdit ? 'action' : "",
      sortable: false,
      colalign: "right",
      colStyle: '!w-[30px]'
    },
  ]

  const sidebarItems = [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Files', route: '/history' },
    { name: 'Bills', route: '/bills' },
    { name: 'Payments', route: '/payments' },
    { name: 'Approval', route: '/approvals' },
    { name: 'Reports', route: '/reports' },
    { name: 'Vendor', route: '/vendors' }
  ]

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [loaderCounter, setLoaderCounter] = useState(0)
  const [apiDataCount, setApiDataCount] = useState(0)
  const [checkloader, setCheckLoader] = useState(true)

  let nextPageIndex: number = 1
  const lazyRows = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (intacctComDropId.length >= 0) {
      handelCompanyIntacct()
    }
  }, [intacctComDropId])

  //For no accounting tool company
  useEffect(() => {
    if (isNoAccountingToolCompany) {
      setAccountingTool(4)
      setOpenDrawer(true)
      setOpenCompaniesModal(false)
    }
  }, [isNoAccountingToolCompany])

  // Redirect Url to the QuickBooks page
  const handleConnectQb = (companyId?: number) => {
    performApiAction(dispatch, redirectQb, null, (responseData: any) => {
      const clientId = responseData[0].Value
      const redirectUrl = responseData[4].Value
      const responseType = 'code'
      const scope = responseData[2].Value
      const state = companyId && companyId > 0 ? companyId : 0

      const url = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scope}&state=${state}`
      window.location.href = url
    })
  }

  const qbConnect = () => {
    if (localStorage.getItem('qbcode') && localStorage.getItem('realmId') && localStorage.getItem('state')) {
      const params = {
        code: localStorage.getItem('qbcode'),
        realmId: localStorage.getItem('realmId'),
        CompanyId: localStorage.getItem('state'),
      }
      performApiAction(dispatch, conncetQb, params, (responseData: any) => {
        setQboCompanyData(responseData)
        if (responseData?.Name === null) {
          Toast.success('Company Connected!')
          setOpenDrawer(false)
          getCompanyList()
          localStorage.removeItem('qbcode')
          localStorage.removeItem('realmId')
          localStorage.removeItem('state')
        } else {
          setOpenDrawer(true)
        }
        setAccountingTool(2)
        setAccountingToolType(2)
      })
    }
  }

  // Connect to the QuickBooks
  useEffect(() => {
    qbConnect()
  }, [])

  // Redirect Url to the Xero page
  const handleConnectXero = (companyId?: number) => {
    performApiAction(dispatch, redirectXero, null, (responseData: any) => {
      const client_id = responseData[0].Value
      const scope = responseData[2].Value
      const redirectUrl = responseData[4].Value
      const responseType = 'code'
      const state = companyId && companyId > 0 ? companyId : 0

      const url = `https://login.xero.com/identity/connect/authorize?client_id=${client_id}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scope}&&state=${state}`

      window.location.href = url
    })
  }

  function removeItemFromLocalStorage() {
    localStorage.removeItem('xerocode')
    localStorage.removeItem('state')
  }

  const handleXeroIntegration = () => {
    if (localStorage.getItem('xerocode') && localStorage.getItem('state')) {
      const params = {
        Code: localStorage.getItem('xerocode'),
        CompanyId: localStorage.getItem('state'),
      }
      performApiAction(
        dispatch,
        conncetXero,
        params,
        (responseData: any) => {
          setXeroCompanyData(responseData)
          if (responseData?.Name === null) {
            Toast.success('Company Connected!')
            setOpenDrawer(false)
            getCompanyList()
            localStorage.getItem('xerocode')
            localStorage.getItem('state')
          } else {
            setOpenDrawer(true)
          }
          removeItemFromLocalStorage()
        },
        () => {
          setIsLoading(false)
        }
      )
    }
  }

  // Connect to the Xero
  useEffect(() => {
    handleXeroIntegration()
  }, [])

  const toggleIntacctModal = () => {
    setOpenIntacctModal((prev) => !prev)
  }

  // connct to the Intacct
  // Main Modal
  const openInnerModalIntacct = () => {
    setIntacctComDropId('')
    toggleIntacctModal()
    if (!openIntacctModal) {
      clearData()
    }
  }

  const toggleIntacctCompanyModal = () => {
    setIntacctCompantModal((prev) => !prev)
  }

  // Inner modal for company select
  const OpenComapnyModalIntacct = () => {
    toggleIntacctCompanyModal()
    if (!intacctCompanyModal) {
      clearData()
    }
  }

  // clear data for intacct modal
  const clearData = () => {
    setIntacctCompanyIdError(false)
    setIntacctUserIdError(false)
    setIntacctPasswordError(false)
    setIntacctComDropIdError(false)
    setIntacctEntityListIdError(false)
  }

  // Api connect for Intacct
  const handelConnectIntacct = () => {
    intacctCompanyId.trim().length <= 0 && setIntacctCompanyIdError(true)
    intacctUserId.trim().length <= 0 && setIntacctUserIdError(true)
    intacctPassword.trim().length <= 0 && setIntacctPasswordError(true)
    if (intacctCompanyId.length > 0 && intacctUserId.length > 0 && intacctPassword.length > 0) {
      setIsLoading(true)
      const params = {
        IntacctCompanyId: intacctCompanyId,
        IntacctUserId: intacctUserId,
        IntacctUserPassword: intacctPassword,
        IntactClientId: intacctComClientId,
        CompanyId: null,
      }
      performApiAction(
        dispatch,
        sageUserConnect,
        params,
        (responseData: any) => {
          setOpenIntacctModal(false)
          let Data = responseData
          if (Data.length === 0) {
            Data = null
            Toast.error(`Invalid Credentials!`)
            setOpenIntacctModal(true)
          } else {
            Toast.success(`Successfully Connected!`)
            OpenComapnyModalIntacct()
            setIntacctComDropList(
              Data.map((item: Item) => ({
                label: item.clientname,
                value: item.clientid,
              }))
            )
            setEntityVisiable(false)
          }
          setIsLoading(false)
        },
        () => {
          setIsLoading(false)
        }
      )
    }
  }

  // This function is call for drawer
  const clearID = () => {
    setEditId(undefined)
  }

  //Company Connect for Intacct
  const handelCompanyIntacct = () => {
    if (intacctComDropId.length > 0) {
      const params = {
        IntacctCompanyId: intacctCompanyId,
        IntacctUserId: intacctUserId,
        IntacctUserPassword: intacctPassword,
        IntactClientId: intacctComClientId,
      }
      setIsLoading(true)
      performApiAction(
        dispatch,
        sageCompanyConnect,
        params,
        (responseData: any) => {
          let Data = responseData
          if (!Data || Data.length === 0) {
            setIntacctEntityListId('')
            setIntacctComDropIdError(false)
            setEntityVisiable(false)
          } else {
            setIntacctEntities(Data)
            setIntacctEntityList(
              Data.map((item: IntacctData) => ({
                label: item.NAME,
                value: item.LOCATIONID,
              }))
            )
            setIntacctComDropIdError(false)
            setEntityVisiable(true)
          }
          setIsLoading(false)
          setAccountingTool(1)
          setAccountingToolType(1)
        },
        () => {
          setIsLoading(false)
        }
      )
    }
  }

  // select company after connect intacct
  const handleCompanyIntacctConnect = () => {
    if (intacctComDropId.length <= 0) {
      setIntacctComDropIdError(true)
    }

    if (entityVisiable) {
      setIntacctEntityListIdError(intacctEntityListId.length <= 0)
    }
    if (intacctComDropId.length > 0 && (entityVisiable ? intacctEntityListId.length > 0 : true)) {
      setIsLoading(true)
      const params = {
        CompanyId: selectedRowId > 0 ? selectedRowId : 0,
        IntacctCompanyId: intacctCompanyId,
        IntacctUserId: intacctUserId,
        IntacctUserPassword: intacctPassword,
        IntactClientId: intacctComDropId,
        IntacctLocationId: intacctEntityListId,
      }
      performApiAction(
        dispatch,
        sageCompanyReconnect,
        params,
        (response: any) => {
          if (selectedRowId === 0) {
            setOpenDrawer(true)
            setOpenIntacctModal(false)
            setOpenCompaniesModal(false)
            setIntacctCompantModal(false)
          } else {
            Toast.success('Company Connected!')
            setOpenDrawer(false)
            setIntacctCompantModal(false)
            getCompanyList(1)
            setSelectedRowId(0)
          }
          setIsLoading(false)
          setAccountingTool(1)
          setAccountingToolType(1)
        },
        () => {
          setIsLoading(false)
        }
      )
    }
  }

  const updateData = (newList: any[], pageIndex: number | undefined): any[] => {
    if (pageIndex === 1) {
      setIsLoading(false)
      setShouldLoadMore(true)
      return [...newList]
    } else {
      return [...companyList, ...newList]
    }
  }

  const updateLoader = (isLoading: boolean, openDrawer: boolean): void => {
    setIsLoading(isLoading)
    setLoaderCounter(openDrawer ? 1 : 0)
    setShouldLoadMore(!isLoading)
    setCheckLoader(true)
  }

  const getNewList = (responseData: any) => {
    return responseData?.List || []
  }

  const getNewTotalCount = (responseData: any) => {
    return responseData?.TotalCount || 0
  }

  // Get All CompanyList
  const getCompanyList = async (pageIndex?: number) => {
    setIsLoading(true)
    if (pageIndex === 1) {
      setCompanyList([])
      setItemsLoaded(0)
    }
    try {
      const params = {
        Name: '',
        AccountingToolIds: convertStringsToIntegers(selectedAccountingTool),
        CompanyIds: convertStringsToIntegers(selectedFilterdCompany),
        AssignUserIds: convertStringsToIntegers(selectedAssignUser),
        PageIndex: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }
      const { payload, meta } = await dispatch(companyGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
          const newList = getNewList(responseData)
          const newTotalCount = getNewTotalCount(responseData)
          setApiDataCount(newTotalCount)

          let updatedData = updateData(newList, pageIndex)

          setCompanyList(updatedData)
          setItemsLoaded(updatedData.length)
          setAssignUserSelectIds(payload?.ResponseData?.List?.AssigedUsers)
          setIsLoading(false)

          setShouldLoadMore(itemsLoaded < newTotalCount)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      updateLoader(false, openDrawer)
    }
  }

  useEffect(() => {
    getCompanyList(1)
  }, [selectedCompanyValue, isRefresh])

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
          getCompanyList()
        }
      },
      { threshold: 0 }
    )

    if (tableBottomRef.current) {
      observer.observe(tableBottomRef.current)
      nextPageIndex = Math.ceil(itemsLoaded / lazyRows) + 1
    }

    return () => {
      observer.disconnect()
    }
  }, [isLoading, shouldLoadMore, itemsLoaded, tableBottomRef])

  // actions menu
  // Match a action and open a drawer
  const handleActions = async (actionType: string, actionId: number, CompanyName: string) => {
    setSelectedRowId(actionId)
    invalidateSessionCache();
    await update({ ...session?.user, CompanyId: actionId, CompanyName: CompanyName })

    switch (actionType.toLowerCase()) {
      case 'edit':
        setEditId(actionId)
        setOpenDrawer(true)
        break
      case 'deactivate':
        setOpenDeactivateModal(true)
        break
      case 'activate':
        setOpenActivateModal(true)
        break
      case 'disconnect':
        setOpenDisconnectModal(true)
        break
      case 'field mapping':
        router.push('/setup/apfieldmapping')
        localStorage.setItem("IsFieldMappingSet", "false")
        break
      case 'connect':
        {
          if (accountingTool === 1) openInnerModalIntacct()
          if (accountingTool === 2) handleConnectQb(actionId)
          if (accountingTool === 3) handleConnectXero(actionId)
        }
        break
      case 'remove':
        setOpenRemoveModal(true)
        break
      // case 'manage configuration':
      //   setIsManageConfigurationDrawerOpen(true)
      //   break
      default:
        break
    }
  }

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

  const getUserManageRights = (CompanyId: any) => {
    setCompanyList([])
    setIsLoading(true)
    const params = {
      UserId: UserId,
      CompanyId: Number(CompanyId),
    }
    performApiAction(dispatch, userGetManageRights, params, (responseData: any) => {
      const processedData = processPermissions(responseData);
      dispatch(setProcessPermissionsMatrix(processedData));
      const firstAllowedItem = sidebarItems.find(item => hasViewPermission(processedData, item.name))

      // router.push('/dashboard')
      if (processedData.length > 0) {
        if (firstAllowedItem && firstAllowedItem.name != "Payments") {
          router.push(firstAllowedItem.route)
        }
        else if (firstAllowedItem && firstAllowedItem.name == "Payments") {
          const isPaymentView = getModulePermissions(processedData, "Payments") ?? {}
          const isPaymentStatus = isPaymentView["Payment Status"]?.View ?? false;
          if (isPaymentStatus) {
            router.push('/payments/status')
          } else {
            router.push('/payments/billtopay')
          }
        }
        else {
          // If no permissions are found, you might want to redirect to a default page or show an error
          Toast.error('You do not have permission for any module.')
          setIsLoading(false)
          getCompanyList(1)
        }
      } else {
        Toast.error('You do not have permission for any module.')
        setIsLoading(false)
        getCompanyList(1)
      }
    })
  }

  // this function is company column click in table and redirect to bills page
  const handleRowClick = async (list: List) => {
    invalidateSessionCache();
    await update({ ...session?.user, CompanyId: list?.Id, AccountingTool: list?.AccountingTool, CompanyName: list.Name })

    dispatch(setSelectedCompany({ label: list?.Name, value: list?.Id, accountingTool: list?.AccountingTool }))
    if (list?.IsFieldMappingSet) {
      localStorage.removeItem('IsFieldMappingSet')
      getUserManageRights(list?.Id)
      // router.push('/dashboard')
    } else {
      Toast.error('Please complete Manage Configuration and Field Mapping setup')
    }
  }

  const userConfig = async () => {
    try {
      const response = await agent.APIs.getUserConfig()
      if (response.ResponseStatus === 'Success') {
        getRolePermissionData(response.ResponseData.RoleId)
        dispatch(setRoleId(response.ResponseData.RoleId))
        await update({
          ...user,
          org_id: response.ResponseData.OrganizationId,
          org_name: response.ResponseData.OrganizationName,
          user_id: response.ResponseData.UserId,
          is_admin: response.ResponseData.IsAdmin,
          is_organization_admin: response.ResponseData.IsOrganizationAdmin,
          role_id: response.ResponseData.RoleId
        })

        dispatch(setOrganizationName(response.ResponseData.OrganizationName))

        localStorage.setItem('UserId', response.ResponseData.UserId)
        localStorage.setItem('OrgId', response.ResponseData.OrganizationId)
        localStorage.setItem('IsAdmin', response.ResponseData.IsAdmin)
        localStorage.setItem('IsOrgAdmin', response.ResponseData.IsOrganizationAdmin)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getRolePermissionData = (roleId: any) => {
    const params = {
      RoleId: roleId ?? 0,
    }
    performApiAction(dispatch, permissionGetList, params, (responseData: any) => {
      const processedData = processPermissions(responseData);
      dispatch(setOrgPermissionsMatrix(processedData));
      dispatch(setProcessPermissionsMatrix(processedData));
    })
  }

  useEffect(() => {
    userConfig()
  }, [urlToken])

  // For Assign user dropdown menu click inside table

  const handleAssignDropDown = () => {
    const params = {
      CompanyId: rowId,
    }
    performApiAction(dispatch, manageCompanyAssignUser, params, (response: any) => {
      setAssignDropDownData(response)
    })
  }

  // for save Assign user to company
  const saveAssignUser = () => {
    const params = {
      CompanyId: rowId,
      UserIds: assignUserSelectIds,
    }
    performApiAction(dispatch, AssignUserToCompany, params, () => {
      getCompanyList(1)
    })
  }

  useEffect(() => {
    handleAssignDropDown()
  }, [rowId])

  // when user click on action icon set a id
  const handleIdGet = (id: number, accountingTool: number) => {
    setSelectedRowId(id)
    setAccountingTool(accountingTool)
  }

  // Show Table of Contents 'Manage Configuration'
  const companyData = companyList && companyList.map((list: any, index) => {
    const actions =
      list?.AccountingTool === 4
        ? ['Edit', 'Remove']
        : !list?.IsFieldMappingSet ? ['Field Mapping', 'Edit', list?.IsActive ? 'Deactivate' : 'Activate', list?.IsConnected ? 'Disconnect' : 'Connect', 'Remove'] : ['Edit', list?.IsActive ? 'Deactivate' : 'Activate', list?.IsConnected ? 'Disconnect' : 'Connect', 'Remove'].filter(Boolean)
    return {
      Id: <div className={`${list.IsActive ? '' : 'opacity-[50%]'}`}>{index + 1}</div>,
      Name: (
        <div
          className={`flex cursor-pointer items-center gap-2 ${list?.IsActive ? '' : 'opacity-[50%]'}`}
          onClick={() => handleRowClick(list)}>
          <Avatar variant='small' name={list?.Name} />
          {list?.Name}
        </div>
      ),
      AccountingTool: (
        <div className={`flex items-center gap-2 ${list?.IsActive ? '' : 'opacity-[50%]'}`}>
          <AvatarWithText toolId={list.AccountingTool} isConnected={list.IsConnected} />
        </div>
      ),
      UpdatedOn:
        list?.UpdatedOn !== null ? (
          <div className={`${list?.IsActive ? '' : 'opacity-[50%]'}`}>Last updated on {formatDate(list?.UpdatedOn)} </div>
        ) : (
          <div className={`${list?.IsActive ? '' : 'opacity-[50%]'}`}>Created on {formatDate(list?.CreatedOn)}</div>
        ),
      AssignUsers: (
        <div
        className={`${isManageCompanyEdit ? "" : "pointer-events-none opacity-80"} ${!list?.IsActive ? 'pointer-events-none opacity-50' : ''} userList_managecompany w-[150px]`}
          onClick={() => setRowId(list?.Id)}
        >
          <SaveCompanyDropdown
            id={`user-${list?.Id}`}
            showAvatar={5}
            noborder
            values={list?.AssigedUsers}
            options={assignDropDownData}
            getError={() => { }}
            getValue={(value: string[]) => {
              setAssignUserSelectIds(convertStringsToIntegers(value))
            }}
            Savebtn
            onSaveClick={saveAssignUser}
            disabled={!list?.IsActive}
          />
        </div>
      ),
      action: (
        <Actions
          id={list?.Id}
          accountingTool={list?.AccountingTool}
          actions={actions}
          optionalData={list?.Name}
          actionRowId={() => {
            handleIdGet(list?.Id, list?.AccountingTool)
          }}
          handleClick={handleActions}
        />
      ),
    }
  })

  // Perform the actions Deactivate, Activate, Remove and Disconnect
  const performCompanyAction = (selectedRowId: number | null, action: number) => {
    setOpenRemoveModal(false)
    setOpenDisconnectModal(false)
    setOpenDeactivateModal(false)
    setOpenActivateModal(false)
    const params = {
      CompanyId: Number(selectedRowId),
      Action: action,
    }
    performApiAction(dispatch, performCompanyActions, params, () => {
      setSelectedRowId(0)
      switch (action) {
        case 1:
          Toast.success('Company Deactivated!')
          break
        case 2:
          Toast.success('Company Disconnected!')
          break
        case 3:
          Toast.success('Company Removed!')
          dispatch(setIsRefresh(!isRefresh))
          break
        case 4:
          Toast.success('Company Activated!')
          break
        default:
          break
      }

      getCompanyList(1)
      setCheckLoader(false)
    })
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

  //Handle Filter menu open and close
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

  const handleFilter = () => {
    setOpenFilterBox(false)
    setCheckLoader(false)
    setIsApplyButtonDisabled(true)
    setInitialFilterValues({
      company: selectedFilterdCompany,
      accountingTools: selectedAccountingTool,
      assignUser: selectedAssignUser,
    })
    getCompanyList(1)
  }

  const handleFilterClose = () => {
    setSelectedFilterdCompany(initialFilterValues.company)
    setSelectedAccountingTool(initialFilterValues.accountingTools)
    setSelectedAssignUser(initialFilterValues.assignUser)
    setOpenFilterBox(false)
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

  //Handle create company modal open and close
  const handleCompaniesModal = () => {
    setOpenCompaniesModal(!openCompaniesModal)
  }

  //Handle Dectivate modal open and close
  const handleDeactivateModal = () => {
    setOpenDeactivateModal(!openDeactivateModal)
  }

  //Handle Active modal open and close
  const handleActivateModal = () => {
    setOpenActivateModal(!openActivateModal)
  }

  // Handle Disconnect modal open and close
  const handleDisconnectModal = () => {
    setOpenDisconnectModal(!openDisconnectModal)
  }

  // Handle Remove modal open and close
  const handleRemoveModal = () => {
    setOpenRemoveModal(false)
  }

  // const handleManageConfigurationDrawerClose = () => {
  //   setIsManageConfigurationDrawerOpen(false)
  // }

  // set a dynamic orgId
  const globalData = (data: OrgData) => {
    setOrgId(data?.orgId)
  }

  // intacct company value clear in dropdown
  const handleIntacctClear = () => {
    setOpenIntacctModal(false)
    setEntityVisiable(false)
    setIntacctEntityListId('')
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false)
    setSelectedRowId(0)
    setIsRefresh(!isRefresh)
    setShouldLoadMore(true)
    setIsNoAccountingToolCompany(false)
  }

  const onReset = () => {
    setSelectedFilterdCompany([])
    setSelectedAccountingTool([])
    setSelectedAssignUser([])
    checkIfFiltersChanged({ company: [], accountingTools: [], assignUser: [] })
  }


  return (
    <>
      <WrapperManage onData={globalData}>
        {/* NavBar */}
        <div className='sticky top-0 z-[6] flex !h-[66px] items-center justify-between bg-whiteSmoke px-5'>
          <div className='flex items-center'>
            <label className='font-proxima flex cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Manage Companies</label>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 items-center justify-center'>
              <Tooltip position='bottom' content='Filter' className='!z-[6] !cursor-pointer !px-0'>
                <div ref={selectRef} className='flex justify-center items-center cursor-pointer' onClick={handleFilterOpen}>
                  <FilterIcon />
                </div>
              </Tooltip>
            </div>

            <Button className={`${isManageCompanyCreate ? "block" : "hidden"} rounded-full !h-[36px] laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]`} variant='btn-primary' onClick={handleCompaniesModal}>
              <div className='flex justify-center items-center font-bold'>
                <span className='mr-[8px]'>
                  <PlusIcon color={'#FFF'} />
                </span>
                <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>CREATE COMPANY</label>
              </div>
            </Button>
          </div>
        </div>

        {/* Filter Modal */}
        <div className={`${openFilterBox &&
          'custom-scroll fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg-[rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out'
          }`}>
          <div
            tabIndex={-1}
            className={`top-28 z-30 w-[793px] outline-none rounded border border-lightSilver bg-pureWhite ${openFilterBox ? 'absolute translate-x-0 right-[250px]' : ' fixed translate-x-full right-0'} transition-transform duration-300 ease-in-out`}>
            {/* Header */}
            <div className='flex !h-[64px] items-center justify-between border-b border-b-lightSilver laptop:py-4 laptopMd:py-4 lg:py-4 xl:py-4 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
              <span className='font-proxima text-lg font-medium text-darkCharcoal tracking-[0.02em]' tabIndex={-1}>Filter</span>
              <Button className='rounded-sm !text-base' variant="error" onClick={onReset}>
                Reset All
              </Button>
            </div>

            {/* Content */}
            <div className='grid grid-cols-3 gap-5 p-5'>
              <div className='w-full'>
                <MultiSelectChip
                  id='company'
                  label='Company'
                  placeholder='Please select'
                  options={filterdCompany}
                  type='checkbox'
                  defaultValue={selectedFilterdCompany}
                  getError={() => { }}
                  getValue={(value: string[]) => {
                    handleCompanyFilter(value)
                  }}
                  onSelect={() => { }}
                />
              </div>
              <div className='w-full'>
                <MultiSelectChip
                  id='accounting tool'
                  placeholder='Please select'
                  label='Accounting Tool'
                  options={filterdAccountingTool}
                  type='checkbox'
                  defaultValue={selectedAccountingTool}
                  getValue={(value: string[]) => handleAccountingToolFilter(value)}
                  getError={() => { }}
                  onSelect={() => { }}
                />
              </div>
              <div className='w-full'>
                <MultiSelectChip
                  label='Assign User'
                  id='user'
                  placeholder='Please select'
                  type='checkbox'
                  defaultValue={selectedAssignUser}
                  options={filterdAssignUser}
                  getError={() => { }}
                  getValue={(value: string[]) => {
                    handleAssignUserFilter(value)
                  }}
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
                onClick={handleFilter}
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

        {/* Data Table */}
        <div className='h-[calc(100vh-145px)] approvalMain overflow-auto max-[425px]:mx-1'>
          <div className={`${companyData.length !== 0 && 'h-0'}`}>
            <DataTable
              columns={headers}
              data={companyData.length > 0 ? companyData : []}
              hoverEffect={true}
              sticky
              isTableLayoutFixed
              lazyLoadRows={lazyRows}
              getExpandableData={() => { }}
              getRowId={() => { }}
            />
            {isLoading && loaderCounter === 1 && checkloader && <Loader size='sm' helperText />}

            <div ref={tableBottomRef} />
          </div>

          {companyList.length === 0 ? (
            isLoading ?
              <div className='flex h-[calc(93vh-150px)] w-full items-center justify-center'>
                <Loader size='md' helperText />
              </div>
              : !isLoading && <div className='flex h-[59px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
                No records available at the moment.
              </div>
          ) : ''}
        </div>

        {/*  Create Company Popup */}
        {openCompaniesModal && (
          <CompaniesModal
            onOpen={openCompaniesModal}
            onClose={() => setOpenCompaniesModal(false)}
            onConnectQb={handleConnectQb}
            onConnectXero={handleConnectXero}
            onConnectIntacct={openInnerModalIntacct}
            getValue={(value: boolean) => {
              setIsNoAccountingToolCompany(value)
            }}
          />
        )}

        {/* Add Company Drawer */}
        <Drawer
          onOpen={openDrawer}
          onClose={handleDrawerClose}
          hasEditId={editId}
          accountingTool={accountingTool}
          CompanyData={(qboCompanyData ? qboCompanyData[0] : null) || (xeroCompanyData ? xeroCompanyData[0] : null)}
          getCompanyList={() => getCompanyList(1)}
          IntacctUserId={intacctUserId}
          IntacctPassword={intacctPassword}
          IntacctAccountinToolId={intacctComDropId}
          IntacctCompanyId={intacctCompanyId}
          IntacctLocationId={intacctEntityListId}
          clearID={clearID}
          orgId={orgId}
          recordNo={intacctEntities?.find((item) => item?.LOCATIONID === intacctEntityListId)?.RECORDNO ?? ''}
          setShowCancelModal={setShowCancelModal}
          isConfirmCancel={isConfirmCancel}
        />


        {/* Drawer Overlay */}
        <DrawerOverlay isOpen={openDrawer || isManageConfigurationDrawerOpen} onClose={() => { }} />

        {/* Cancel Modal Popup */}
        <ConfirmationModal
          title='Cancel Add'
          content='Are you sure you want to leave without saving?'
          isModalOpen={showCancelModal}
          modalClose={(value) => {
            setShowCancelModal(false)
            if (value === 'No') {
              setOpenDrawer(true)
            } else {
              setIsConfirmCancel(true)
            }
          }}
          handleSubmit={() => {
            setShowCancelModal(false)
            setIsConfirmCancel(true)
          }}
          colorVariantNo='btn-outline-primary'
          colorVariantYes='btn-primary'
        />

        {/* Deactivate Modal Popup */}
        <ConfirmationModal
          title='Deactivate'
          contentClassName="!h-[90px]"
          content='By deactivating, you may no longer have access to the company and its details" Are you sure you want to de-activate this company?'
          isModalOpen={openDeactivateModal}
          modalClose={() => handleDeactivateModal()}
          handleSubmit={() => performCompanyAction(selectedRowId, 1)}
          colorVariantNo='btn-outline-primary'
          colorVariantYes='btn-primary'
        />

        {/* Activate Modal Popup */}
        <ConfirmationModal
          title='Activate'
          content='Are you sure you want to activate the company?'
          isModalOpen={openActivateModal}
          modalClose={() => handleActivateModal()}
          handleSubmit={() => performCompanyAction(selectedRowId, 4)}
          colorVariantNo='btn-outline-primary'
          colorVariantYes='btn-primary'
        />

        {/* Disconnect Modal Popup */}
        <ConfirmationModal
          title='Disconnect'
          contentClassName="!h-[100px]"
          content='By disconnecting, you can acccess the company data, however loose the connection with the accounting tool. And, you will not be able to post/pay any bill. Are you sure you want to disconnect this company?'
          isModalOpen={openDisconnectModal}
          modalClose={() => handleDisconnectModal()}
          handleSubmit={() => performCompanyAction(selectedRowId, 2)}
          colorVariantNo='btn-outline-primary'
          colorVariantYes='btn-primary'
        />

        {/* Remove Modal Popup */}
        <ConfirmationModal
          title='Remove'
          contentClassName="!h-[90px]"
          content='By removing, the company and its data will be permanantly removed form the system." Are you sure you want to remove this company?'
          isModalOpen={openRemoveModal}
          modalClose={() => handleRemoveModal()}
          handleSubmit={() => performCompanyAction(selectedRowId, 3)}
          colorVariantNo='btn-outline'
          colorVariantYes='btn-error'
        />

        {/* Open Intacct connection Modal */}
        {openIntacctModal && (
          <Modal isOpen={true} onClose={() => setOpenIntacctModal(false)} width='400px'>
            <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
              <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Sage Intacct</div>
              <div className='pt-2.5' onClick={() => setOpenIntacctModal(false)}>
                <Close variant='medium' />
              </div>
            </ModalTitle>

            <ModalContent className='p-5'>
              <div className='flex flex-row justify-center'>
                <div className='flex h-full w-full max-w-sm flex-col items-center overflow-hidden rounded'>
                  <Text
                    placeholder='Please enter company ID'
                    value={intacctCompanyId}
                    getValue={(e) => setIntacctCompanyId(e)}
                    getError={() => { }}
                    hasError={intacctCompanyIdError}
                    validate
                  />
                  <div className='my-5 w-full'>
                    <Text
                      placeholder='Please enter user ID'
                      value={intacctUserId}
                      getValue={(e) => setIntacctUserId(e)}
                      getError={() => { }}
                      hasError={intacctUserIdError}
                      validate
                    />
                  </div>
                  <div className='mb-5 w-full'>
                    <Password
                      placeholder='Please enter password'
                      name='password'
                      novalidate
                      validate
                      getValue={(e) => setIntacctPassword(e)}
                      getError={() => { }}
                      hasError={intacctPasswordError}
                      autoComplete='off'
                    />
                  </div>
                  <Typography className='text-darkCharcoal'>
                    By clicking on Connect, you authorize PathQuest's AP to access your data through Intacct web service request.{' '}
                    {/* <span className='cursor-pointer text-[16.5px] text-[#0592C6]'>Click Here </span>
                    for instructions. */}
                  </Typography>
                  <Button
                    className={`btn-sm $ mx-2 mt-5 mb-3 !h-[36px] !w-auto rounded-md font-semibold ${isLoading ? 'pointer-events-none opacity-80' : ''
                      }`}
                    variant='btn-primary'
                    onClick={handelConnectIntacct}
                  >
                    <div className={`flex items-center justify-center`}>
                      {isLoading ? (
                        <div className='flex items-center justify-center'>
                          <div className='mx-2 animate-spin '>
                            <SpinnerIcon bgColor='#FFF' />
                          </div>
                          <div className='items-center'>CONNECT</div>
                        </div>
                      ) : (
                        <Typography type='h6' className='!font-bold'>
                          CONNECT
                        </Typography>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </ModalContent>
          </Modal>
        )}

        {/* Intacct Connection Modal(Company Select Modal) */}
        {intacctCompanyModal && (
          <Modal isOpen={true} onClose={() => handleIntacctClear()}>
            <ModalTitle>
              <div className='flex flex-col px-4 py-3'>
                <Typography type='h5' className='!font-bold'>
                  Connect
                </Typography>
              </div>

              <button className='p-3' onClick={() => setIntacctCompantModal(false)}>
                <Close variant='medium' />
              </button>
            </ModalTitle>

            <ModalContent>
              <div className='m-3 flex flex-row justify-center'>
                <div className='mb-2 flex h-full w-full max-w-[500px] flex-col items-center rounded'>
                  <div className='w-full flex items-center justify-center'>
                    <span className='text-[30px]'>Connecting to Sage Intacct </span>
                  </div>
                  <div className='ml-4 flex w-full items-center justify-center'>
                    <span className='text-[15px]'>It will take a while. Please do not close this window.</span>
                  </div>
                  <div className='my-4 w-full flex justify-center items-center'>
                    <span className='font-medium'>Company Selection</span>
                  </div>
                  <div className='mb-2 w-[65%] overflow-visible flex flex-col justify-center items-center'>
                    <Select
                      id='Company_dropdown'
                      className='!overflow-visible'
                      defaultValue={intacctComDropId}
                      search
                      options={intacctComDropList}
                      getValue={(value) => {
                        setIntacctComDropIdError(false)
                        setIntacctComDropId(value)
                        setIntacctComClientId(value)
                      }}
                      getError={() => { }}
                      hasError={intacctComDropIdError}
                      validate
                    />
                  </div>
                  {entityVisiable && (
                    <div className='mb-4 mt-4 w-[65%] overflow-visible flex justify-center items-center'>
                      <Select
                        id='Company_child_dropdown'
                        className='!overflow-visible'
                        defaultValue={intacctEntityListId}
                        search
                        options={intacctEntityList}
                        getValue={(value) => {
                          setIntacctEntityListId(value)
                          setIntacctEntityListIdError(false)
                        }}
                        getError={() => { }}
                        hasError={intacctEntityListIdError}
                        validate
                      />
                    </div>
                  )}

                  <Button
                    className={`btn-sm $ mx-2 my-3 !h-[36px] !w-auto rounded-md font-semibold ${isLoading ? 'pointer-events-none opacity-80' : ''
                      }`}
                    variant='btn-primary'
                    onClick={handleCompanyIntacctConnect}
                  >
                    <div className={`flex items-center justify-center`}>
                      {isLoading ? (
                        <div className='flex items-center justify-center'>
                          <div className='mx-2 animate-spin '>
                            <SpinnerIcon bgColor='#FFF' />
                          </div>
                          <div className='items-center'>CONNECT</div>
                        </div>
                      ) : (
                        <Typography type='h6' className='!font-bold'>
                          CONNECT
                        </Typography>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </ModalContent>
          </Modal>
        )}
      </WrapperManage>
    </>
  )
}

export default ListCompanies