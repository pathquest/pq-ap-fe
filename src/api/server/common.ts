import { auth } from '@/auth'
import agent from '../axios'

export const handleResponse = (response: any) => {
  if (response?.ResponseStatus === 'Success') {
    return response.ResponseData
  }
}

export async function getVendorDropdown(companyId: number) {
  const response = await agent.APIs.vendorDropdown({ CompanyId: companyId, IsActive: true })
  return handleResponse(response)
}

export async function getLocationDropdown(companyId: number) {
  const response = await agent.APIs.locationDropdown({ CompanyId: companyId, IsActive: true })
  return handleResponse(response)
}

export async function getProcessDropdown() {
  const response = await agent.APIs.processDropdown()
  return handleResponse(response)
}

export async function getStatusDropdown() {
  const response = await agent.APIs.statusDropdown()
  return handleResponse(response)
}

export async function getTermDropdown(companyId: number) {
  const response = await agent.APIs.termDropdown({ CompanyId: companyId, IsActive: true })
  if (response.ResponseStatus === 'Success') {
    const newTermOptions = response?.ResponseData?.map((item: any) => {
      return {
        label: item.Name,
        value: item.Id,
      }
    })
    return {
      defaultTermOptionsRes: response?.ResponseData,
      termOptionsRes: newTermOptions,
    }
  }
}

export async function getAccountDropdown(companyId: number) {
  const response = await agent.APIs.accountDropdown({ CompanyId: companyId, IsActive: true })
  return handleResponse(response)
}

export async function getClassDropdown(companyId: number) {
  const response = await agent.APIs.classDropdown({ CompanyId: companyId, IsActive: true })
  return handleResponse(response)
}

export async function getProductServiceDropdown(companyId: number) {
  const response = await agent.APIs.productServiceDropdown({ CompanyId: companyId })
  return handleResponse(response)
}

export async function getCustomerDropdown(companyId: number) {
  const response = await agent.APIs.customerDropdown({ CompanyId: companyId, IsActive: true })
  return handleResponse(response)
}

export async function getProjectDropdown(companyId: number) {
  const response = await agent.APIs.projectDropdown({ CompanyId: companyId })
  return handleResponse(response)
}

export async function getDepartmentDropdown(companyId: number) {
  const response = await agent.APIs.departmentDropdown({ CompanyId: companyId })
  return handleResponse(response)
}

export async function getUserDropdown(companyId: number) {
  const response = await agent.APIs.userDropdown({ CompanyId: companyId })
  return handleResponse(response)
}

export async function getFieldMappingConfigurations(ProcessType: number, companyId: number) {
  const response = await agent.APIs.getFieldMappings({
    CompanyId: companyId,
    ProcessType,
  })
  return handleResponse(response)
}

export async function getBillNumberDropdown() {
  const response = await agent.APIs.getBillNumberDropdown()
  return handleResponse(response)
}

export const fetchAPIsData = async (processType: string | number, accountingTool: number, type: string = "", CompanyId: number) => {
  let vendorOptions: any = []
  let defaultTermOptions: any = []
  let termOptions: any = []
  let accountOptions: any = []
  let classOptions: any = []
  let productServiceOptions: any = []
  let customerOptions: any = []
  let projectOptions: any = []
  let departmentOptions: any = []
  let locationOptions: any = []

  const processOptions: any = await getProcessDropdown()
  const statusOptions: any = await getStatusDropdown()
  const userOptions: any = await getUserDropdown(Number(CompanyId))
  const fieldMappingConfigurations: any = await getFieldMappingConfigurations(Number(processType), Number(CompanyId))
  const mainFieldConfiguration = [
    ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration?.DefaultList,
    ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration?.CustomList
  ]
  const lineItemConfiguration = [
    ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration?.DefaultList,
    ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration?.CustomList
  ]
  const mainFieldConfigurationList = mainFieldConfiguration
  const lineItemConfigurationList = lineItemConfiguration
  const mainFieldConfigurationNames = mainFieldConfigurationList?.map((item: any) => item?.Name)
  const lineItemConfigurationNames = lineItemConfigurationList?.map((item: any) => item?.Name)
  const fieldMappingNames = [...mainFieldConfigurationNames, ...lineItemConfigurationNames]

  await Promise.all(
    fieldMappingNames.map(async (name: string) => {
      switch (name) {
        case 'vendor':
          vendorOptions = await getVendorDropdown(Number(CompanyId))
          break
        case 'from':
          vendorOptions = await getVendorDropdown(Number(CompanyId))
          break
        case 'term':
          let { defaultTermOptionsRes, termOptionsRes }: any = await getTermDropdown(Number(CompanyId))
          defaultTermOptions = defaultTermOptionsRes
          termOptions = termOptionsRes
          break
        case 'account':
          accountOptions = await getAccountDropdown(Number(CompanyId))
          break
        case 'class':
          classOptions = await getClassDropdown(Number(CompanyId))
          break
        case 'product':
          const responseData1 = await getProductServiceDropdown(Number(CompanyId))
          productServiceOptions = responseData1?.map((item: any) => {
            return {
              ...item,
              value: item.value + '-secondary',
            }
          })
          if (accountingTool === 2) {
            const responseData2 = await getAccountDropdown(Number(CompanyId))
            accountOptions = responseData2?.map((item: any) => {
              return {
                ...item,
                value: item.value + '-primary',
              }
            })
          }
          break
        case 'items':
          productServiceOptions = await getProductServiceDropdown(Number(CompanyId))
          break
        case 'customer':
          customerOptions = await getCustomerDropdown(Number(CompanyId))
          break
        case 'project':
          projectOptions = await getProjectDropdown(Number(CompanyId))
          break
        case 'department':
          departmentOptions = await getDepartmentDropdown(Number(CompanyId))
          break
        case 'location':
          locationOptions = await getLocationDropdown(Number(CompanyId))
          break
        default:
          return
      }
    })
  )

  const generateFormFields = Object.assign(
    {},
    ...(mainFieldConfigurationList?.map(({ Name, Value }: any) => ({
      [Name]: Name === 'placeThisBillOnHold' ? false : "",
    })) ?? [])
  )

  const generateFormFieldsErrorObj = Object.assign(
    {},
    ...(mainFieldConfigurationList?.filter(({ IsRequired }: any) => IsRequired)?.map(({ Name }: any) => ({ [Name]: false })) ??
      [])
  )

  const generateLinetItemFieldsErrorObj = Object.assign(
    { Index: 1 },
    ...(lineItemConfigurationList?.filter(({ IsRequired }: any) => IsRequired)?.map(({ Name }: any) => ({ [Name]: false })) ?? [])
  )

  const fieldType: any =
    lineItemConfigurationList &&
    lineItemConfigurationList.map((o: any) => {
      let columnStyle = ''
      let colalign = 'left'
      let sortable = false
      switch (o.Name) {
        case 'account':
          columnStyle = 'th-edit-account !w-[150px] !uppercase'
          break
        case 'rate':
          columnStyle = 'th-edit-unit-price !w-[150px] !uppercase'
          colalign = 'right'
          break
        case 'qty':
          columnStyle = 'th-edit-quantity !w-[150px] !uppercase'
          colalign = 'right'
          break
        case 'amount':
          columnStyle = 'th-edit-amount !w-[150px] !uppercase'
          colalign = 'right'
          break
        case 'memo':
          columnStyle = 'th-edit-memo !w-[150px] !uppercase'
          break
        case 'class':
          columnStyle = 'th-edit-class !w-[150px] !uppercase'
          break
        case 'location':
          columnStyle = 'th-edit-location !w-[150px] !uppercase'
          break
        case 'description':
          columnStyle = 'th-edit-description !w-[150px] !uppercase'
          break
        default:
          columnStyle = 'th-edit-common !w-[150px] !uppercase'
          break
      }
      return {
        header: o.Name === 'account' ? 'GL Account' : o.Label,
        accessor: type === 'view' ? o.Name : o.Label,
        sortable: sortable,
        colStyle: `${columnStyle} !tracking-[0.02em]`,
        colalign: colalign,
      }
    })

  const lineItemFieldColumns = [
    {
      header: '#',
      accessor: 'Index',
      sortable: false,
      colStyle: 'th-edit-sr-no !uppercase',
    },
    ...fieldType,
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      colStyle: 'th-edit-actions !uppercase',
      colalign: 'right',
    },
  ]

  let lineItemsFieldsDataObj = lineItemConfigurationList?.reduce((acc: any, o: any) => {
    return {
      ...acc,
      [o.Name]: "",
    }
  }, {})

  return {
    vendorOptions,
    termOptions,
    defaultTermOptions,
    accountOptions,
    classOptions,
    productServiceOptions,
    customerOptions,
    projectOptions,
    departmentOptions,
    locationOptions,
    processOptions,
    statusOptions,
    userOptions,
    fieldMappingConfigurations,
    generateFormFields,
    generateFormFieldsErrorObj,
    generateLinetItemFieldsErrorObj,
    lineItemFieldColumns,
    lineItemsFieldsDataObj,
  }
}

export async function getUserProfile() {
  const response = await agent.APIs.getUserProfile()
  return handleResponse(response)
}
