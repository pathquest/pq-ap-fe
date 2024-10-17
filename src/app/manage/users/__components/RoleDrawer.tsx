'use client'
import ChevronLeftIcon from '@/assets/Icons/ChevronLeftIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { processPermissions } from '@/components/Common/Functions/ProcessPermission'
import { useAppDispatch } from '@/store/configureStore'
import { setProcessPermissionsMatrix } from '@/store/features/profile/profileSlice'
import { SaveAssignRoles, getAssignUsertoCompany, userGetManageRights, userListDropdown } from '@/store/features/user/userSlice'
import { Button, CheckBox, DataTable, Select, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import BackArrow from '@/assets/Icons/payments/BackArrow'

interface DrawerProps {
  onOpen: boolean
  onClose: () => void
  userId: number
}

const RoleDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, userId }) => {
  const dispatch = useAppDispatch()

  const [users, setUsers] = useState<any>([])
  const [usersId, setUsersId] = useState<any>(userId)

  useEffect(() => {
    setUsersId(userId)
  }, [userId])

  const [company, setCompany] = useState<any>([])
  const [companyId, setCompanyId] = useState<number>(0)
  const [tableData, setTableData] = useState<any>([])
  const [permissionList, setPermissionList] = useState<any[]>([])
  const [isContentChanged, setIsContentChanged] = useState<boolean>(false)

  const isOrgAdmin = localStorage.getItem('IsOrgAdmin')
  const CurrentUserId = localStorage.getItem('UserId')

  //Nested 1st Level Datatable Header
  const nested1Headers: any = [
    {
      header: 'Module',
      accessor: 'Key',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'View',
      accessor: 'View',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'Edit',
      accessor: 'Edit',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'Create',
      accessor: 'Create',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'Import',
      accessor: 'Import',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'Sync',
      accessor: 'Sync',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
  ]

  const handleCheckBoxChange = (e: any) => {
    const permissionId = parseInt(e.target.id)

    setPermissionList((prevList) => {
      const updatedList = new Set(prevList)
      if (e.target.checked) {
        updatedList.add(permissionId)
      } else {
        updatedList.delete(permissionId)
      }
      return Array.from(updatedList)
    })
  }

  const getCheckBoxes = (data: any) => {
    const checkboxPermissions = ['view', 'edit', 'create', 'import', 'sync']

    return checkboxPermissions.reduce(
      (checkboxes, permissionKey) => {
        const permission = data.Children?.find((child: any) => child.Key.toLowerCase() === permissionKey)
        const permissionId = permission && permission.Id

        if (permissionId !== undefined) {
          checkboxes[permissionKey.charAt(0).toUpperCase() + permissionKey.slice(1)] = (
            <CheckBox onChange={handleCheckBoxChange} id={permissionId} checked={permissionList.includes(permissionId)} />
          )
        }

        return checkboxes
      },
      {} as Record<string, JSX.Element>
    )
  }

  const updatedRoleData = tableData?.map(
    (data: any) =>
      new Object({
        ...data,
        ...getCheckBoxes(data),
        details:
          data?.Children.length > 0 && data?.Children[0].IsShowCheckBox === false ? (
            <DataTable
              sticky
              noHeader
              expandable
              getExpandableData={() => { }}
              getRowId={() => { }}
              columns={nested1Headers}
              data={
                data?.Children?.length > 0
                  ? data.Children?.map(
                    (nestedData: any) =>
                      new Object({
                        ...nestedData,
                        ...getCheckBoxes(nestedData),
                        details:
                          nestedData?.Children.length > 0 && nestedData?.Children[0].IsShowCheckBox === false ? (
                            <DataTable
                              columns={nested1Headers}
                              sticky
                              noHeader
                              expandable
                              getExpandableData={() => { }}
                              getRowId={() => { }}
                              data={
                                nestedData?.Children?.length > 0
                                  ? nestedData.Children?.map(
                                    (innerNestedData: any) =>
                                      new Object({
                                        ...innerNestedData,
                                        ...getCheckBoxes(innerNestedData),
                                      })
                                  )
                                  : []
                              }
                            />
                          ) : '',
                      })
                  )
                  : []
              }
            />
          ) : '',
      })
  )

  useEffect(() => {
    getUserManageRights()
  }, [onOpen, usersId, companyId])

  //User Get Manage Rights Data API
  const getUserManageRights = () => {
    const params = {
      UserId: Number(usersId),
      CompanyId: Number(companyId),
    }
    performApiAction(dispatch, userGetManageRights, params, (responseData: any) => {
      // setTableData(responseData.List)
      const filteredList = responseData.List.map((item: any) => {
        if (item.Key === "Settings") {
          return {
            ...item,
            Children: item.Children.filter((child: any) => child.Key !== "Global Setting").map((child: any) => {
              if (child.Key === "Masters") {
                return {
                  ...child,
                  Children: child.Children.filter((grandChild: any) =>
                    !["Currency", "Tax Rate"].includes(grandChild.Key)
                  )
                };
              }
              if (child.Key === "Setup") {
                return {
                  ...child,
                  Children: child.Children.filter((grandChild: any) => grandChild.Key !== "Cloud Configuration")
                };
              }
              return child;
            })
          };
        }
        return item;
      });
      setTableData(filteredList);
      setPermissionList(responseData.PermissionIds)
      const processedData = processPermissions(responseData);
      dispatch(setProcessPermissionsMatrix(processedData));
    })
  }

  useEffect(() => {
    getUserDropDown()
  }, [usersId])

  // User Dropdown List API
  const getUserDropDown = () => {
    const params = {
      UserId: usersId,
    }
    performApiAction(dispatch, userListDropdown, params, (responseData: any) => {
      setUsers(responseData)
      getCompanyDropdown(usersId)
      setIsContentChanged((prev) => !prev)
    })
  }

  // Company Dropdown API
  const getCompanyDropdown = (usersId: any) => {
    const params = {
      UserId: parseInt(usersId),
    }
    performApiAction(dispatch, getAssignUsertoCompany, params, (responseData: any) => {
      setCompany(responseData)
      const checkedCompany = responseData.find((item: any) => item.isChecked)
      if (checkedCompany) {
        setCompanyId(checkedCompany.value)
      }
      setIsContentChanged((prev) => !prev)
    })
  }

  useEffect(() => {
    if (onOpen) {
      getUserDropDown()
    }
  }, [onOpen])

  //Save Data API
  const handleSubmit = (e: any) => {
    e.preventDefault()
    const params = {
      UserId: Number(usersId),
      CompanyId: Number(companyId),
      ProcessList: permissionList,
    }
    performApiAction(dispatch, SaveAssignRoles, params, () => {
      Toast.success(`${usersId ? 'Details Updated!' : 'Role Added!'} successfully.`)
      onClose()
    })
  }

  return (
    <>
      <div
        className={`fixed z-[6] flex h-[calc(100vh-65px)] w-screen flex-col justify-between overflow-y-auto bg-white max-[425px]:h-[80%] ${onOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-out`}
      >
        <div className='sticky top-0 flex w-full !h-[50px] justify-start bg-whiteSmoke p-5 gap-5'>
          <div className='flex items-center gap-3 h-full'>
            <span className='cursor-pointer' onClick={onClose}>
              <ChevronLeftIcon bgColor='white' />
            </span>
            <Typography type='h5' className='flex items-center tracking-[0.02em] text-darkCharcoal justify-center text-center !font-bold'>
              Admin Manage Rights
            </Typography>
          </div>
        </div>
        <div className='flex p-5 gap-5'>
          <div className=''>
            <Select
              key={String(isContentChanged)}
              id='user'
              name='user'
              label='User Name'
              options={users}
              defaultValue={usersId + ""}
              getValue={(value: any) => {
                setUsersId(value)
              }}
              getError={() => { }}
            />
          </div>
          <div className=''>
            <Select
              id='company'
              name='company'
              label='Company'
              options={company.filter((item: any) => item.isChecked)}
              defaultValue={companyId + ""}
              getValue={(value: any) => {
                setCompanyId(value)
              }}
              getError={() => { }}
            />
          </div>
        </div>
        {/* Data Table */}
        <div className='h-[calc(100vh-200px)] w-full overflow-y-auto max-[640px]:mx-1'>
          <DataTable
            expandable
            sticky
            getExpandableData={() => { }}
            getRowId={() => { }}
            columns={nested1Headers}
            data={updatedRoleData}
          />
        </div>
        <div className='!h-[60px] sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
          <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
            <Button onClick={onClose} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
              <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
            </Button>
            <Button
              type='submit'
              onClick={handleSubmit}
              className={`btn-sm !h-9 rounded-full ${isOrgAdmin && usersId === CurrentUserId && 'pointer-events-none opacity-80'}`}
              variant='btn-primary'>
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                SAVE
              </label>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
export default RoleDrawer
