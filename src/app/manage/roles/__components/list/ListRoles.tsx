'use client'
import PlusIcon from '@/assets/Icons/PlusIcon'
import Actions from '@/components/Common/DatatableActions/DatatableActions'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import WrapperManage from '@/components/Common/WrapperManage'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { permissionGetList, roleGetList, roleRemove } from '@/store/features/role/roleSlice'
import { ConfirmationModalContent } from '@/utils/local'
import { Button, CheckBox, DataTable, SearchBar, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import Drawer from '../Drawer'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import { useRouter } from 'next/navigation'

const ListRoles: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter();
  const { orgPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isManageRolesView = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Roles", "View");
  const isManageRoleCreate = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Roles", "Create");
  const isManageRoleEdit = hasSpecificPermission(orgPermissionsMatrix, "Settings", "Global Setting", "Manage Roles", "Edit");

  const [editId, setEditId] = useState<number | null>()
  const [duplicateId, setDuplicateId] = useState<number | null>()
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [subDataList, setSubDataList] = useState<any[]>([])
  const [subRolePermission, setSubRolePermission] = useState([])
  const [roleId, setRoleId] = useState<number>()
  const [isRemoveOpen, setIsRemoveOpen] = useState<boolean>(false)

  const [permissionList, setPermissionList] = useState<any[]>([])
  const [searchValue, setSearchValue] = useState<string>('')

  useEffect(() => {
    if (!isManageRolesView) {
      router.push('/manage/companies');
    }
  }, [isManageRolesView]);

  //Column Name
  const columns: any = [
    {
      header: 'Role Name',
      accessor: 'RoleName',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[16%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]',
    },
    {
      header: 'Description',
      accessor: 'RoleDescription',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[74%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]',
    },
    {
      header: '',
      accessor: isManageRoleEdit ? 'action' : "",
      sortable: false,
      colalign: 'right',
      colStyle: '!w-[6%]',
    },
  ]

  //Nested 1st Level Datatable Header
  const subHeaders: any = [
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

  //Role By Company Data API
  const getRoleByCompanyData = () => {
    const params = {
      CompanyId: 0,
      RoleId: 0,
      PageIndex: 0,
      PageSize: 1000,
      GlobalSearch: searchValue,
    }
    performApiAction(dispatch, roleGetList, params, (responseData: any) => {
      const sortedRoles = responseData.List.sort((a: any, b: any) => {
        // Sort "IsPublic": true roles first
        if (a.IsPublic && !b.IsPublic) {
          return -1; // a comes before b
        } else if (!a.IsPublic && b.IsPublic) {
          return 1; // b comes before a
        } else {
          return 0; // no change in order
        }
      });
      setSubDataList(sortedRoles)
      setIsLoading(false)
    })
  }

  //Role By Permission API
  const getRolePermissionData = () => {
    const params = {
      RoleId: roleId,
    }
    performApiAction(dispatch, permissionGetList, params, (responseData: any) => {
      const filteredList = responseData.List.map((item: any) => {
        if (item.Key === "Settings") {
          return {
            ...item,
            Children: item.Children.map((child: any) => {
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
      setSubRolePermission(filteredList)
      // setSubRolePermission(responseData.List)
      setPermissionList(responseData.PermissionIds)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    getRoleByCompanyData()
    getRolePermissionData()
  }, [refreshTable, roleId, searchValue])

  // Checkbox List
  const getCheckBoxes = (data: any) => {
    const checkboxPermissions = ['view', 'edit', 'create', 'import', 'sync']

    return checkboxPermissions.reduce(
      (checkboxes, permissionKey) => {
        const permission = data.Children?.find((child: any) => child.Key.toLowerCase() === permissionKey)
        const permissionId = permission && permission.Id

        if (permissionId !== undefined) {
          checkboxes[permissionKey.charAt(0).toUpperCase() + permissionKey.slice(1)] = (
            <CheckBox
              className='!pointer-events-none'
              readOnly
              id={permissionId}
              checked={permissionList.includes(permissionId)}
            />
          )
        }

        return checkboxes
      },
      {} as Record<string, JSX.Element>
    )
  }

  //Handle Action
  const handleMenuChange = (actionName: string, id: number) => {
    switch (actionName) {
      case 'Edit':
        setEditId(id)
        setIsOpenDrawer(!isOpenDrawer)
        break
      case 'Duplicate':
        setDuplicateId(id)
        setIsOpenDrawer(!isOpenDrawer)
        break
      case 'Remove':
        setRoleId(id)
        setIsRemoveOpen(!isRemoveOpen)
        break

      default:
        break
    }
  }

  // Datatable Data
  const roleListData = subDataList?.map(
    (e: any) =>
      new Object({
        RoleId: e?.RoleId,
        RoleName: e?.RoleName,
        RoleDescription: e?.RoleDescription,
        action: (
          <Actions
            id={e?.RoleId}
            actions={e?.IsPublic ? ['Duplicate'] : ['Edit', 'Duplicate', 'Remove']}
            handleClick={handleMenuChange}
            actionRowId={() => { }}
          />
        ),

        details: (
          <DataTable
            expandable
            getExpandableData={() => { }}
            sticky
            getRowId={() => { }}
            columns={subHeaders}
            data={
              subRolePermission?.length > 0
                ? subRolePermission?.map(
                  (data: any) =>
                    new Object({
                      ...data,
                      ...getCheckBoxes(data),
                      details:
                        data.Children?.length > 0 && data.Children[0]?.IsShowCheckBox === false ? (
                          <DataTable
                            sticky
                            noHeader
                            expandable
                            getExpandableData={() => { }}
                            getRowId={() => { }}
                            columns={subHeaders}
                            data={
                              data.Children?.length > 0
                                ? data.Children?.map(
                                  (nestedData: any) =>
                                    new Object({
                                      ...nestedData,
                                      ...getCheckBoxes(nestedData),
                                      details:
                                        nestedData?.Children.length > 0 && nestedData?.Children[0].IsShowCheckBox === false ? (
                                          <DataTable
                                            columns={subHeaders}
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
                        ) : (
                          ''
                        ),
                    })
                )
                : []
            }
          />
        ),
      })
  )

  const handleToggleChange = () => {
    setIsOpenDrawer(true)
  }

  const handleDrawerClose = () => {
    setIsOpenDrawer(false)
    setDuplicateId(0)
    setEditId(0)
    setRefreshTable(!refreshTable)
  }

  const modalClose = () => {
    setIsRemoveOpen(false)
  }

  // Delete Class API
  const handleDelete = () => {
    modalClose()
    const params = {
      RoleId: roleId,
    }
    performApiAction(dispatch, roleRemove, params, (responseData: any) => {
      Toast.success('Role Removed!')
      setRefreshTable(!refreshTable)
      setRoleId(0)
    })
  }

  return (
    <WrapperManage>
      {/* NavBar */}
      <div className='sticky top-0 z-[6] flex !h-[50px] items-center justify-between bg-whiteSmoke px-5'>
        <div className='flex items-center'>
          <label className='font-proxima flex items-center text-base font-bold tracking-[0.02em] text-darkCharcoal'>Manage Roles</label>
        </div>
        <div className='flex items-center gap-5'>
          <div className='flex h-6 items-center justify-center '>
            <SearchBar
              number={0}
              variant='animated'
              getValue={(value: any) => {
                setSearchValue(value)
              }}
            />
          </div>

          <Button className={`${isManageRoleCreate ? "block" : "hidden"} rounded-full !h-[36px] laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]`} variant='btn-primary' onClick={handleToggleChange}>
            <div className='flex justify-center items-center font-bold'>
              <span className='mr-[8px]'>
                <PlusIcon color={'#FFF'} />
              </span>
              <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>CREATE ROLE</label>
            </div>
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className='h-[calc(100vh-112px)] overflow-auto approvalMain custom-scroll max-[425px]:mx-1'>
        <div className={`${roleListData.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={roleListData.length > 0 ? roleListData : []}
            hoverEffect={true}
            sticky
            expandable
            userClass='uppercase'
            getExpandableData={(value: any) => {
              setRoleId(value.RoleId)
            }}
            getRowId={() => { }}
          />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={roleListData} />
      </div>

      {/* Remove Modal */}
      <ConfirmationModal
        title={ConfirmationModalContent.title('Remove')}
        content={ConfirmationModalContent.content('role')}
        isModalOpen={isRemoveOpen}
        modalClose={modalClose}
        handleSubmit={handleDelete}
        colorVariantNo='btn-outline'
        colorVariantYes='btn-error'
      />

      {/*  Drawer */}
      <Drawer
        onOpen={isOpenDrawer}
        onClose={handleDrawerClose}
        DuplicateId={typeof duplicateId === 'number' ? duplicateId : 0}
        EditId={typeof editId === 'number' ? editId : 0}
      />

      {/* Drawer Overlay */}
      <DrawerOverlay isOpen={isOpenDrawer} onClose={undefined} />
    </WrapperManage>
  )
}

export default ListRoles
