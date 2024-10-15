import AvatarWithText from '@/app/manage/companies/__components/AvatarWithText'
import CompaniesModal from '@/app/manage/companies/__components/CompaniesModal'
import Drawer from '@/app/manage/companies/__components/Drawer'
import Actions from '@/components/Common/DatatableActions/DatatableActions'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import { useCompanyContext } from '@/context/companyContext'
import { companyHeaders, companyListHeaders, companyListNestedHeaders, ManageCompaniesData } from '@/data/practDashboard'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import {
  AssignUserToCompany,
  companyGetList,
  conncetQb,
  conncetXero,
  manageCompanyAssignUser,
  performCompanyActions,
  redirectQb,
  redirectXero,
  sageCompanyConnect,
  sageCompanyReconnect,
  sageUserConnect,
} from '@/store/features/company/companySlice'
import { setIsRefresh, setSelectedCompany } from '@/store/features/user/userSlice'
import {
  Avatar,
  Button,
  Close,
  CompanyList,
  DataTable,
  Loader,
  Modal,
  ModalContent,
  ModalTitle,
  Password,
  Select,
  Text,
  Toast,
  Typography,
} from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { convertStringsToIntegers } from '@/utils'
import { invalidateSessionCache } from '@/api/axios'

interface IntacctEntityProps {
  LOCATIONID: string
  NAME: string
  RECORDNO: string | null
}

interface Item {
  clientname: string
  clientid: number
}

interface OrgData {
  orgId: number
}

interface IntacctData {
  NAME: string
  LOCATIONID: number
}

interface List {
  Id: number
  Name: string
  AccountingTool: number | null
  IsActive: boolean
  // Add other properties as needed
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

interface ManageCompanyType {
  orgIdValue: number | null
  session: any
  selectedAccountingTool: any
  selectedFilterdCompany: any
  selectedAssignUser: any
  isOpenCompanyModal: any
  setOpenCompaniesModal: any
}

function ManageCompanyList({ orgIdValue, session, selectedAccountingTool, selectedFilterdCompany, selectedAssignUser, isOpenCompanyModal, setOpenCompaniesModal }: ManageCompanyType) {
  const dispatch = useAppDispatch()
  const { update } = useSession()
  const router = useRouter()
  const user = session ? session?.user : {}
  const [selectedRowId, setSelectedRowId] = useState(0)
  const [accountingTool, setAccountingTool] = useState<number | null>()
  const { isRefresh } = useAppSelector((state) => state.user)
  const { setAccountingToolType } = useCompanyContext()

  const [qboCompanyData, setQboCompanyData] = useState<any[] | null>(null)
  const [xeroCompanyData, setXeroCompanyData] = useState<any[] | null>(null)

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
  const [intacctComDropIdError, setIntacctComDropIdError] = useState<boolean>(false)

  // Second dropdown for intacct
  const [intacctEntityListIdError, setIntacctEntityListIdError] = useState<boolean>(false)
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [isNoAccountingToolCompany, setIsNoAccountingToolCompany] = useState<boolean>(false)
  const [intacctComClientId, setIntacctComClientId] = useState<string>('')

  const [intacctEntityListId, setIntacctEntityListId] = useState('')
  const [intacctEntityList, setIntacctEntityList] = useState([])
  const [editId, setEditId] = useState<number | undefined | null>()
  const [intacctEntities, setIntacctEntities] = useState<IntacctEntityProps[]>([])
  const [intacctComDropList, setIntacctComDropList] = useState([])

  const [manageCompanyList, setManageCompanyList] = useState<Company[]>([])

  // for intacct dropdown
  const [entityVisiable, setEntityVisiable] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isConfirmCancel, setIsConfirmCancel] = useState(false)

  // for loader
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [openDeactivateModal, setOpenDeactivateModal] = useState<boolean>(false)
  const [openActivateModal, setOpenActivateModal] = useState<boolean>(false)
  const [openDisconnectModal, setOpenDisconnectModal] = useState<boolean>(false)
  const [openRemoveModal, setOpenRemoveModal] = useState(false)

  // for assign user dropdown
  const [assignDropDownData, setAssignDropDownData] = useState([])

  // for asign user dropdown in table
  const [rowId, setRowId] = useState<number | null>(0)
  const [assignUserSelectIds, setAssignUserSelectIds] = useState<number[]>([])

  useEffect(() => {
    if (intacctComDropId.length >= 0) {
      handelCompanyIntacct()
    }
  }, [intacctComDropId])

  // for save Assign user to company
  const saveAssignUser = () => {
    const params = {
      CompanyId: rowId,
      UserIds: assignUserSelectIds,
    }
    performApiAction(dispatch, AssignUserToCompany, params, () => {
      getCompanyList()
      Toast.success('User Assigned!')
    })
  }

  const handleAssignDropDown = () => {
    const params = {
      CompanyId: rowId,
    }
    performApiAction(dispatch, manageCompanyAssignUser, params, (response: any) => {
      setAssignDropDownData(response)
    })
  }

  useEffect(() => {
    handleAssignDropDown()
  }, [rowId])

  //For no accounting tool company
  useEffect(() => {
    if (isNoAccountingToolCompany) {
      setAccountingTool(4)
      setOpenDrawer(true)
      setOpenCompaniesModal(false)
    }
  }, [isNoAccountingToolCompany])

  const qbConnect = () => {
    if (localStorage.getItem('qbcode') && localStorage.getItem('realmId') && localStorage.getItem('state')) {
      const params = {
        code: localStorage.getItem('qbcode'),
        realmId: localStorage.getItem('realmId'),
        CompanyId: localStorage.getItem('state'),
      }
      performApiAction(dispatch, conncetQb, params, (responseData: any) => {
        setQboCompanyData(responseData)
        localStorage.setItem('qbotoken', responseData?.TokenId)
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

  // this function is company column click in table and redirect to bills page
  const handleRowClick = async (list: List) => {
    invalidateSessionCache();
    await update({ ...user, CompanyId: list?.Id, AccountingTool: list?.AccountingTool, CompanyName: list.Name })

    dispatch(setSelectedCompany({ label: list?.Name, value: list?.Id, accountingTool: list?.AccountingTool }))
    router.push('/bills')
  }

  // when user click on action icon set a id
  const handleIdGet = (id: number, accountingTool: number) => {
    setSelectedRowId(id)
    setAccountingTool(accountingTool)
  }

  const handleActions = async (actionType: string, actionId: number, CompanyName: string) => {
    setSelectedRowId(actionId)
    invalidateSessionCache();
    await update({ ...user, CompanyId: actionId, CompanyName: CompanyName })

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
      default:
        break
    }
  }

  const table_Data =
    manageCompanyList &&
    manageCompanyList.map((list: any, index: any) => {
      const actions =
        list?.AccountingTool === 4
          ? ['Edit', 'Remove']
          : [
            'Edit',
            list?.IsActive ? 'Deactivate' : 'Activate',
            list?.IsConnected ? 'Disconnect' : 'Connect',
            'Remove',
          ]

      return {
        Id: <Typography className='font-proxima text-sm'>{index + 1}</Typography>,
        Name: (
          <div
            className={`flex cursor-pointer items-center gap-2 ${list?.IsActive ? '' : 'opacity-[50%]'}`}
            onClick={() => handleRowClick(list)}
          >
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
            <div className={`${list?.IsActive ? '' : 'opacity-[50%]'}`}>
              Last updated on {formatDate(list?.UpdatedOn)}{' '}
            </div>
          ) : (
            <div className={`${list?.IsActive ? '' : 'opacity-[50%]'}`}>
              Created on {formatDate(list?.CreatedOn)}
            </div>
          ),
        AssignUsers: (
          <div
            className={`${!list?.IsActive ? 'pointer-events-none opacity-50' : ''} userList_managecompany w-3/4`}
            onClick={() => setRowId(list?.Id)}
          >
            <CompanyList
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
            localStorage.getItem('xerocode')
            localStorage.getItem('state')
          } else {
            setOpenDrawer(true)
          }
          removeItemFromLocalStorage()
        },
        () => {
          // setIsLoading(false)
        }
      )
    }
  }

  function removeItemFromLocalStorage() {
    localStorage.removeItem('xerocode')
    localStorage.removeItem('state')
  }

  useEffect(() => {
    handleXeroIntegration()
    qbConnect()
  }, [])

  const toggleIntacctModal = () => {
    setOpenIntacctModal((prev) => !prev)
  }

  // clear data for intacct modal
  const clearData = () => {
    setIntacctCompanyIdError(false)
    setIntacctUserIdError(false)
    setIntacctPasswordError(false)
    setIntacctComDropIdError(false)
    setIntacctEntityListIdError(false)
  }

  // Main Modal
  const openInnerModalIntacct = () => {
    setIntacctComDropId('')
    toggleIntacctModal()
    if (!openIntacctModal) {
      clearData()
    }
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false)
    setSelectedRowId(0)
    setIsRefresh(!isRefresh)
    // setShouldLoadMore(true)
    setIsNoAccountingToolCompany(false)
    setEditId(0)
  }

  // Get All CompanyList
  const getCompanyList = async () => {
    setIsLoading(true)
    try {
      const params = {
        Name: '',
        AccountingToolIds: selectedAccountingTool.length > 0 ? convertStringsToIntegers(selectedAccountingTool) : [],
        CompanyIds: selectedFilterdCompany.length > 0 ? convertStringsToIntegers(selectedFilterdCompany) : [],
        AssignUserIds: selectedAssignUser.length > 0 ? convertStringsToIntegers(selectedAssignUser) : [],
        PageIndex: 1,
        PageSize: 1000,
      }
      const { payload, meta } = await dispatch(companyGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
          const updatedData: any = ManageCompaniesData.map((company) => {
            if (company.Id === 1) {
              // Update condition as necessary
              return {
                ...company,
                companyList: responseData.List,
              }
            }
            return company
          })
          // setManageCompanyList(updatedData)
          setManageCompanyList(responseData.List)
          setAssignUserSelectIds(payload?.ResponseData?.List?.AssigedUsers)
          setIsLoading(false)
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

  // intacct company value clear in dropdown
  const handleIntacctClear = () => {
    setOpenIntacctModal(false)
    setEntityVisiable(false)
    setIntacctEntityListId('')
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
            getCompanyList()
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

      getCompanyList()
    })
  }

  useEffect(() => {
    getCompanyList()
  }, [selectedAccountingTool, selectedAssignUser, selectedFilterdCompany])

  let noDataContent

  if (table_Data.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className={`fixed flex h-[44px] w-full items-center justify-center border-b border-b-[#ccc]`}>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }

  return (
    <div>
      <div className={`stickyTable custom-scroll h-[calc(100vh-160px)] overflow-auto`}>
        <div className={`mainTable ${manageCompanyList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={companyListHeaders}
            data={table_Data}
            hoverEffect={true}
            sticky
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
        </div>
        {noDataContent}
      </div>

      {/* Drawer Overlay */}
      <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />

      {/*  Drawer */}
      <Drawer
        onOpen={openDrawer}
        onClose={handleDrawerClose}
        hasEditId={editId}
        accountingTool={accountingTool}
        CompanyData={(qboCompanyData ? qboCompanyData[0] : null) || (xeroCompanyData ? xeroCompanyData[0] : null)}
        getCompanyList={() => getCompanyList()}
        IntacctUserId={intacctUserId}
        IntacctPassword={intacctPassword}
        IntacctAccountinToolId={intacctComDropId}
        IntacctCompanyId={intacctCompanyId}
        IntacctLocationId={intacctEntityListId}
        orgId={orgIdValue}
        recordNo={intacctEntities?.find((item) => item?.LOCATIONID === intacctEntityListId)?.RECORDNO ?? ''}
        setShowCancelModal={setShowCancelModal}
        isConfirmCancel={isConfirmCancel}
      />

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
        content='By removing, the company and its data will be permanantly removed form the system." Are you sure you want to remove this company?'
        isModalOpen={openRemoveModal}
        modalClose={() => handleRemoveModal()}
        handleSubmit={() => performCompanyAction(selectedRowId, 3)}
        colorVariantNo='btn-outline'
        colorVariantYes='btn-error'
      />

      {/*  Create Company Popup */}
      {isOpenCompanyModal && (
        <CompaniesModal
          onOpen={isOpenCompanyModal}
          onClose={() => setOpenCompaniesModal(false)}
          onConnectQb={handleConnectQb}
          onConnectXero={handleConnectXero}
          onConnectIntacct={openInnerModalIntacct}
          getValue={(value: boolean) => {
            setIsNoAccountingToolCompany(value)
          }}
        />
      )}

      {/* Intacct Connection Modal(Company Select Modal) */}
      {intacctCompanyModal && (
        <Modal isOpen={true} onClose={() => handleIntacctClear()} width='800px'>
          <ModalTitle>
            <div className='flex flex-col px-4 py-3'>
              <Typography type='h5' className='!font-bold'>
                Connect to Sage Intacct
              </Typography>
            </div>

            <button className='p-3' onClick={() => setIntacctCompantModal(false)}>
              <Close variant='medium' />
            </button>
          </ModalTitle>

          <ModalContent>
            <div className='m-3 flex flex-row justify-center'>
              <div className='mb-2 mr-6  flex h-full w-full max-w-[500px] flex-col items-center rounded'>
                <div className='w-full'>
                  <span className='text-[35px]'>Connecting to Intacct Sage</span>
                </div>
                <div className='ml-4 flex w-full items-center justify-start'>
                  <span className='text-[15px]'>It will take a few moments.Please do not close window.</span>
                </div>
                <div className='my-4 w-[50%]'>
                  <span className='font-medium'>Please Select Company</span>
                </div>
                <div className='mb-2 w-[65%] overflow-visible'>
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
                  <div className='mb-4 mt-4 w-[65%] overflow-visible'>
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
                        <div className='items-center'>CONNECT TO SAGE INTACCT</div>
                      </div>
                    ) : (
                      <Typography type='h6' className='!font-bold'>
                        CONNECT TO SAGE INTACCT
                      </Typography>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Open Intacct connection Modal */}
      {openIntacctModal && (
        <Modal isOpen={true} onClose={() => setOpenIntacctModal(false)} width='400px'>
          <ModalTitle>
            <div className='flex flex-col px-4 py-3'>
              <Typography type='h5' className='!font-bold'>
                Connect to Sage Intacct
              </Typography>
            </div>

            <button className='p-3' onClick={() => setOpenIntacctModal(false)}>
              <Close variant='medium' />
            </button>
          </ModalTitle>

          <ModalContent>
            <div className='m-3 flex flex-row justify-center p-2'>
              <div className='mb-2 mr-6  flex h-full w-full max-w-sm flex-col items-center overflow-hidden rounded'>
                <Text
                  placeholder='Company ID'
                  value={intacctCompanyId}
                  getValue={(e) => setIntacctCompanyId(e)}
                  getError={() => { }}
                  hasError={intacctCompanyIdError}
                  validate
                />
                <div className='my-4 w-full'>
                  <Text
                    placeholder='User ID'
                    value={intacctUserId}
                    getValue={(e) => setIntacctUserId(e)}
                    getError={() => { }}
                    hasError={intacctUserIdError}
                    validate
                  />
                </div>
                <div className='mb-2 w-full'>
                  <Password
                    placeholder='Password'
                    name='password'
                    novalidate
                    validate
                    getValue={(e) => setIntacctPassword(e)}
                    getError={() => { }}
                    hasError={intacctPasswordError}
                    autoComplete='off'
                  />
                </div>
                <Typography className='text-gray-600'>
                  You must autorize pathquest in your intacct web service.order to grant us acess your data{' '}
                  <span className='cursor-pointer text-[16.5px] text-[#0592C6]'>Click Here </span>
                  for instructions.
                </Typography>
                <Button
                  className={`btn-sm $ mx-2 my-3 !h-[36px] !w-auto rounded-md font-semibold ${isLoading ? 'pointer-events-none opacity-80' : ''
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
                        <div className='items-center'>CONNECT TO SAGE INTACCT</div>
                      </div>
                    ) : (
                      <Typography type='h6' className='!font-bold'>
                        CONNECT TO SAGE INTACCT
                      </Typography>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}

export default ManageCompanyList
