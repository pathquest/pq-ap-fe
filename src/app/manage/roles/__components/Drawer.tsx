import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useCompanyContext } from '@/context/companyContext'
import { useAppDispatch } from '@/store/configureStore'
import { roleGetById, saveRole } from '@/store/features/role/roleSlice'
import { Button, CheckBox, Close, DataTable, Text, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

interface DrawerProps {
  onOpen: boolean
  onClose: () => void
  EditId?: number
  DuplicateId?: number
}

const RoleDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId, DuplicateId }) => {
  const { CompanyId } = useCompanyContext()
  const dispatch = useAppDispatch()

  const [roleName, setRoleName] = useState<string>('')
  const [roleNameError, setRoleNameError] = useState<boolean>(false)

  const [roleDescription, setRoleDescription] = useState<string>('')
  const [roleDescriptionError, setRoleDescriptionError] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [permissionList, setPermissionList] = useState<any[]>([])
  const [subRolePermission, setSubRolePermission] = useState([])

  let updatedRoleId: number | undefined
  if (EditId !== 0) {
    updatedRoleId = EditId
  } else if (DuplicateId !== 0) {
    updatedRoleId = DuplicateId
  } else {
    updatedRoleId = 0
  }

  //User Get Data API
  const getRoleDataById = () => {
    const params = {
      RoleId: updatedRoleId,
    }
    performApiAction(dispatch, roleGetById, params, (responseData: any) => {
      setRoleName(responseData.RoleData?.RoleName || '')
      setRoleDescription(responseData.RoleData?.RoleDescription || '')
      setSubRolePermission(responseData.List)
      setPermissionList(responseData.PermissionIds)
    })
  }

  useEffect(() => {
    getRoleDataById()
  }, [onOpen, EditId, DuplicateId])

  //Nested 1st Level Datatable Header
  const nestedHeaders: any = [
    {
      header: 'MODULE',
      accessor: 'Key',
      sortable: false,
      colalign: 'left',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'VIEW',
      accessor: 'View',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'EDIT',
      accessor: 'Edit',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'CREATE',
      accessor: 'Create',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'IMPORT',
      accessor: 'Import',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[16%] !tracking-[0.02em]',
    },
    {
      header: 'SYNC',
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

  const updatedRoleData = subRolePermission && subRolePermission?.map(
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
              columns={nestedHeaders}
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
                              columns={nestedHeaders}
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

  const setErrorTrue = () => {
    setRoleNameError(true)
    setRoleDescriptionError(true)
  }

  const initialData = () => {
    setRoleName('')
    setRoleNameError(false)
    setRoleDescription('')
    setRoleDescriptionError(false)
    setPermissionList([])
    setIsLoading(false)
  }

  const clearAllData = async () => {
    await setErrorTrue()
    await initialData()
    onClose()
  }

  useEffect(() => {
    initialData()
  }, [onOpen])

  function handleResponse(payload: any) {
    if (!payload) {
      return // Handle unexpected case where payload is missing
    }

    setIsLoading(false)

    switch (payload.ResponseStatus) {
      case 'Success':
        Toast.success(`Role ${EditId ? 'updated' : 'added'} successfully.`)
        initialData()
        onClose()
        break
      case 'Failure':
        Toast.error('Error', 'Please Enter unique role name.')
        break
      default:
        Toast.error('Error', `${!payload?.Message ? 'Something went wrong!' : payload?.Message}`)
    }
  }

  //Save Data API
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    roleName.trim().length <= 0 && setRoleNameError(true)
    roleDescription.trim().length <= 0 && setRoleDescriptionError(true)

    if (permissionList.length === 0) {
      Toast.error('Error', 'Please select at least one permission.')
    }

    if (roleName.trim().length > 0 && roleDescription.trim().length > 0 && permissionList.length > 0) {
      setIsLoading(true)
      const params = {
        role: {
          RoleId: EditId ?? 0,
          RoleName: roleName,
          RoleDescription: roleDescription,
          IsStandard: true,
          CompanyId: Number(CompanyId),
          FromRoleId: DuplicateId ?? 0,
        },
        rolePermission: {
          RoleId: 0,
          ProcessList: permissionList,
        },
      }
      try {
        const { payload, meta } = await dispatch(saveRole(params))

        if (meta?.requestStatus === 'fulfilled') {
          handleResponse(payload)
        } else {
          setIsLoading(false)
          Toast.error(`${payload?.status} : ${payload?.statusText}`)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleInputChange = (value: any, name: string) => {
    const pattern = /^[a-zA-Z0-9\s]*$/
    if (pattern.test(value)) {
      name === 'roleName' && setRoleName(value)
      name === 'roleDescription' && setRoleDescription(value)
    }
  }

  return (
    <div
      className={`fixed right-0 top-0 z-20 flex h-full  w-3/4 flex-col justify-between overflow-y-auto bg-white shadow max-[768px]:w-11/12 hd:w-[931px] 2xl:w-[931px] 3xl:w-[931px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
    >
      <div className='!h-[60px] sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='py-[15px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {DuplicateId ? 'Duplicate' : EditId ? 'Edit' : 'Add'} Role
        </label>
        <div className='pt-2.5' onClick={clearAllData}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='m-5 flex gap-5'>
        <div className='flex'>
          <Text
            label='Role Name'
            id='roleName'
            name='roleName'
            value={roleName}
            validate
            placeholder='Please Enter Role Name'
            maxLength={50}
            pattern='/^\d{1,50}$/g'
            hasError={roleNameError}
            getValue={(value: any) => handleInputChange(value, 'roleName')}
            getError={() => { }}
          />
        </div>
        <div className='flex-grow'>
          <Text
            label='Role Description'
            id='roleDescription'
            value={roleDescription}
            name='roleDescription'
            validate
            placeholder='Please Enter Role Description'
            maxLength={100}
            pattern='/^\d{1,50}$/g'
            hasError={roleDescriptionError}
            getValue={(value: any) => handleInputChange(value, 'roleDescription')}
            getError={() => { }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className='mt-1 w-full flex-1 overflow-auto custom-scroll'>
        <DataTable
          columns={nestedHeaders}
          data={updatedRoleData}
          expandable
          getExpandableData={() => { }}
          getRowId={() => { }}
          sticky
        />
      </div>

      <div className='!h-[66px] sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
        <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={clearAllData} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
            <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
          </Button>
          <Button
            type='submit'
            onClick={handleSubmit}
            className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RoleDrawer