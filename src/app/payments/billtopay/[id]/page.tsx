'use client'

import { BlobServiceClient } from '@azure/storage-blob'
import { useParams, useRouter } from 'next/navigation'
import { Badge, Button, CheckBox, DataTable, Loader, Toast, BasicTooltip, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'
// Common components
import FileModal from '@/app/bills/__components/FileModal'
import Wrapper from '@/components/Common/Wrapper'
import MarkAsPaidModal from '../components/modals/MarkAsPaidModal'
import MoveBillsToPayModals from '../components/modals/MoveBillsToPayModal'
// import PaymentDetailsModal from '../components/payment-details/PaymentDetailsModal'
// Icons
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import ActivityIcon from '@/assets/Icons/billposting/ActivityIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import BackArrow from '@/assets/Icons/payments/BackArrow'
// Store
import { EditBillPostingDataProps } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'

import { documentDetailById, getClassDropdown, getCustomerDropdown, getDepartmentDropdown, getGLAccountDropdown, getLocationList, getProductServiceDropdown, getProjectDropdown, getfieldmappings, termDropdown, vendorDropdown } from '@/store/features/bills/billSlice'
import { returnKeyValueObjForFormFields } from '@/utils/billposting'

import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import Overlay from '../components/modals/Overlay'
import SinglePaymentDetailsModal from '../components/payment-details/SinglePaymentDetailsModal'
import SingleVendorMultiplePaymentDetailsModal from '../components/payment-details/SingleVendorMultiplePaymentDetailsModal'
import MultipleVendorMultiplePaymentDetailsModal from '../components/payment-details/MultipleVendorMultiplePaymentDetailsModal'
import { storageConfig } from '@/components/Common/pdfviewer/config'

const BillFormat: React.FC = () => {
  const [isMarkAsPaidClicked, setMarkAsPaidClicked] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isSingleBillPaymentModalOpen, setIsSingleBillPaymentModalOpen] = useState<boolean>(false)
  const [isSingleVendorMultipleBillPayModalOpen, setIsSingleVendorMultipleBillPayModalOpen] = useState<boolean>(false)
  const [isMultipleVendorMultipleBillPayModalOpen, setIsMultipleVendorMultipleBillPayModalOpen] = useState<boolean>(false)

  const [isBillsToPayClicked, setBillsToPayClicked] = useState<boolean>(false)
  const [newIsRefresh, setIsNewRefresh] = useState(false)
  const [docDetailByIDData, setDocumentDetailByIdData] = useState<any>([])
  const [dataList, setDataList] = useState<any>([])
  const [rowIds, setRowIds] = useState<number[]>([])
  const [tableDynamicWidth, setTableDynamicWidth] = useState('w-full laptop:w-[calc(100vw-200px)]')
  const [currSelectedBillDetails, setCurrSelectedBillDetails] = useState<any[]>([])
  const [totalAmountToPay, setTotalAmountToPay] = useState<number>(0)
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [fileBlob, setFileBlob] = useState<any>('')
  const [PDFUrl, setPDFUrl] = useState<any>('')
  const [lineItemFieldColumns, setLineItemFieldColumns] = useState<any>([])
  const [vendorsId, setVendorsId] = useState<any[]>([])

  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [termOptions, setTermOptions] = useState<any>([])
  const [formFields, setFormFields] = useState<{ [x: string]: string | number | null | any }>([])
  const [locationOptions, setLocationOptions] = useState<any>([])
  const [productOptions, setProductOptions] = useState<any>([])

  const [accountOptions, setAccountOptions] = useState<any>([])
  const [classOptions, setClassOptions] = useState<any>([])
  const [customerOptions, setCustomerOptions] = useState<any>([])
  const [projectOptions, setProjectOptions] = useState<any>([])
  const [departmentOptions, setDepartmentOptions] = useState<any>([])

  const [lineItemsFieldsData, setLineItemsFieldsData] = useState<EditBillPostingDataProps[]>([])
  const [updatedFormFields, setUpdatedFormFields] = useState<{ [x: string]: string | number | null | any }>({})
  const [updatedFormLineItemsFields, setUpdatedFormLineItemsFields] = useState<any>([])
  const [companyConfigureList, setCompanyConfigureList] = useState<any>([])
  const [mainFieldListOptions, setMainFieldListOptions] = useState<any>([])

  const [mainFieldLableValueObj, setMainFieldLableValueObj] = useState<{ [x: string]: string | number | null | any }>({})

  const [isFileModal, setFileModal] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [currentPayValue, setCurrentPayValue] = useState({
    billNumber: '',
    billDate: '',
    dueDate: '',
    vendorId: 0,
    vendorName: '',
    discount: null,
    payAmount: 0,
    accountPaybleId: null,
  })
  const [isFileRecord, setIsFileRecord] = useState<any>({
    FileName: '',
    PageCount: '',
    BillNumber: '',
  })

  const { id } = useParams()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const billsToPayReducer = useAppSelector((state: { billsToPayReducer: any }) => state.billsToPayReducer)
  const userId = localStorage.getItem('UserId')
  // const [vendorsId, setVendorsId] = useState<any[]>([])

  const handleCloseMarkAsPaidModal = () => {
    setMarkAsPaidClicked(false)
    setRowIds([])
  }

  const handleClosePayBillModal = () => {
    localStorage.removeItem('billAmount')
    localStorage.removeItem('availCredits')
    localStorage.removeItem('PartialPaymentDataList')
    localStorage.removeItem('CreditData')
    setIsSingleBillPaymentModalOpen(false)
    setIsSingleVendorMultipleBillPayModalOpen(false)
    setIsMultipleVendorMultipleBillPayModalOpen(false)
    setCurrSelectedBillDetails([])
    setCurrentPayValue({
      billNumber: '',
      billDate: '',
      dueDate: '',
      vendorName: '',
      discount: null,
      vendorId: 0,
      payAmount: 0,
      accountPaybleId: null,
    })
  }

  const attachfileheaders: any = [
    {
      header: 'File Name',
      accessor: 'FileName',
      sortable: false,
      colalign: 'left',
    },
    {
      header: 'File Size',
      accessor: 'Size',
      sortable: false,
      colalign: 'right',
    },
  ]

  const handleFileOpen = (filePath: any, fileName: string) => {
    showPDFViewerModal(filePath, fileName)
    setFileModal(!isFileModal)
  }

  const showPDFViewerModal = async (filePath: any, fileName: any) => {
    setIsPdfLoading(true)
    const storageAccount = storageConfig.storageAccount
    const containerName: any = storageConfig.containerName
    const sasToken = storageConfig.sassToken

    const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient?.getBlockBlobClient(`${filePath}`)
    try {
      const downloadBlockBlobResponse = await blockBlobClient.download(0)

      if (downloadBlockBlobResponse.blobBody) {
        const blob = await downloadBlockBlobResponse.blobBody
        const url = URL.createObjectURL(blob)

        if (!['pdf'].includes(fileName.split('.').pop().toLowerCase())) {
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
        }

        setPDFUrl(url)
        setFileBlob(blob)
        setIsPdfLoading(false)
      } else {
        setIsPdfLoading(false)
        console.error('Blob body is undefined')
      }
    } catch (error) {
      setIsPdfLoading(false)
      console.error('Error downloading blob:', error)
    }
  }
  const handleOpenAttachFile = (Id: number) => {
    setOpenAttachFile(!isOpenAttchFile)
    setRowIds([Id])
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenAttachFile(false)
    }
  }

  function formatFileSize(bytes: any) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getListDropdownData = async (Name: any) => {
    const paramsWithId = {
      CompanyId: CompanyId,
    }
    switch (Name) {
      case 'vendor':
        const vendorOptions = await dispatch(
          vendorDropdown({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (vendorOptions?.meta?.requestStatus === 'fulfilled') {
          if (vendorOptions?.payload?.ResponseStatus === 'Success') {
            setVendorOptions(vendorOptions?.payload?.ResponseData)
          }
        }
        break
      case 'from':
        const fromOptions = await dispatch(
          vendorDropdown({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (fromOptions?.meta?.requestStatus === 'fulfilled') {
          if (fromOptions?.payload?.ResponseStatus === 'Success') {
            setVendorOptions(fromOptions?.payload?.ResponseData)
          }
        }
        break
      case 'term':
        const termOptions = await dispatch(
          termDropdown({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (termOptions?.meta?.requestStatus === 'fulfilled') {
          if (termOptions?.payload?.ResponseStatus === 'Success') {
            const newTermOptions = termOptions?.payload?.ResponseData?.map((item: any) => {
              return {
                label: item.Name,
                value: item.Id,
              }
            })
            setTermOptions(newTermOptions)
          }
        }
        break
      case 'account':
        const accountOptions = await dispatch(
          getGLAccountDropdown({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (accountOptions?.meta?.requestStatus === 'fulfilled') {
          if (accountOptions?.payload?.ResponseStatus === 'Success') {
            setAccountOptions(accountOptions?.payload?.ResponseData)
          }
        }
        break
      case 'class':
        const classOptions = await dispatch(
          getClassDropdown({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (classOptions?.meta?.requestStatus === 'fulfilled') {
          if (classOptions?.payload?.ResponseStatus === 'Success') {
            setClassOptions(classOptions?.payload?.ResponseData)
          }
        }
        break
      case 'product':
        const productOptions = await dispatch(getProductServiceDropdown(paramsWithId))
        if (productOptions?.meta?.requestStatus === 'fulfilled') {
          if (productOptions?.payload?.ResponseStatus === 'Success') {
            setProductOptions(productOptions?.payload?.ResponseData)
          }
        }
        break
      case 'customer':
        const customerOptions = await dispatch(
          getCustomerDropdown({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (customerOptions?.meta?.requestStatus === 'fulfilled') {
          if (customerOptions?.payload?.ResponseStatus === 'Success') {
            setCustomerOptions(customerOptions?.payload?.ResponseData)
          }
        }
        break
      case 'items':
        const itemsOptions = await dispatch(getProductServiceDropdown(paramsWithId))
        if (itemsOptions?.meta?.requestStatus === 'fulfilled') {
          if (itemsOptions?.payload?.ResponseStatus === 'Success') {
            setProductOptions(itemsOptions?.payload?.ResponseData)
          }
        }
        break
      case 'project':
        const projectOptions = await dispatch(getProjectDropdown(paramsWithId))
        if (projectOptions?.meta?.requestStatus === 'fulfilled') {
          if (projectOptions?.payload?.ResponseStatus === 'Success') {
            setProjectOptions(projectOptions?.payload?.ResponseData)
          }
        }
        break
      case 'department':
        const departmentParams = {
          FilterObj: {
            DepartmentCode: '',
            Title: '',
            Status: '',
            GlobalFilter: '',
          },
          CompanyId: CompanyId,
          Index: 1,
          PageSize: 1000,
        }
        const departmentOptions = await dispatch(getDepartmentDropdown(departmentParams))
        if (departmentOptions?.meta?.requestStatus === 'fulfilled') {
          if (departmentOptions?.payload?.ResponseStatus === 'Success') {
            setDepartmentOptions(departmentOptions?.payload?.ResponseData)
          }
        }
        break
      case 'location':
        const locationOptions = await dispatch(
          getLocationList({
            ...paramsWithId,
            IsActive: true,
          })
        )
        if (locationOptions?.meta?.requestStatus === 'fulfilled') {
          if (locationOptions?.payload?.ResponseStatus === 'Success') {
            setLocationOptions(locationOptions?.payload?.ResponseData)
          }
        }
        break
      default:
        return null
    }
  }

  const getFieldType = (LineItemConfiguration: any) => {
    return LineItemConfiguration && LineItemConfiguration.map((o: any) => {
      let columnStyle = ''
      let colalign = 'left'
      let sortable = false
      switch (o.Name) {
        case 'account':
          columnStyle = 'th-edit-account uppercase'
          break
        case 'rate':
          columnStyle = 'th-edit-unit-price uppercase'
          colalign = 'right'
          break
        case 'qty':
          columnStyle = 'th-edit-quantity uppercase'
          colalign = 'right'
          break
        case 'amount':
          columnStyle = 'th-edit-amount uppercase'
          colalign = 'right'
          break
        case 'memo':
          columnStyle = 'th-edit-memo uppercase'
          break
        case 'class':
          columnStyle = 'th-edit-class uppercase'
          break
        case 'location':
          columnStyle = 'th-edit-location uppercase'
          break
        case 'description':
          columnStyle = 'th-edit-description uppercase'
          break
        default:
          columnStyle = 'th-edit-common uppercase'
          break
      }
      return {
        header: o.Label,
        accessor: o.Name,
        sortable: sortable,
        colStyle: columnStyle,
        colalign: colalign,
      }
    })
  };

  const handleErrorResponse = (dataMessage: any) => {
    Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`);
  };

  const handleStatusErrorResponse = (payload: any) => {
    Toast.error(`${payload?.status} : ${payload?.statusText}`);
  };

  const fetchFieldMappingData = async () => {
    const params = {
      CompanyId: CompanyId,
      ProcessType: 1,
    }
    try {
      const { payload, meta } = await dispatch(getfieldmappings(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const mainFieldConfiguration = [
            ...payload?.ResponseData?.ComapnyConfigList?.MainFieldConfiguration?.DefaultList,
            ...payload?.ResponseData?.ComapnyConfigList?.MainFieldConfiguration?.CustomList
          ]
          const lineItemConfiguration = [
            ...payload?.ResponseData?.ComapnyConfigList?.LineItemConfiguration?.DefaultList,
            ...payload?.ResponseData?.ComapnyConfigList?.LineItemConfiguration?.CustomList
          ]
          setMainFieldListOptions(mainFieldConfiguration)
          mainFieldConfiguration?.map((item: any) => {
            getListDropdownData(item?.Name)
          })

          lineItemConfiguration?.map((item: any) => {
            getListDropdownData(item?.Name)
          })

          const fieldType: any = getFieldType(lineItemConfiguration);

          let lineItemsFieldsDataObj = {}
          lineItemConfiguration &&
            lineItemConfiguration.map((o: any) => {
              lineItemsFieldsDataObj = {
                ...lineItemsFieldsDataObj,
                [o.Name]: o.Value,
              }
            })

          setLineItemFieldColumns([
            {
              header: '#',
              accessor: 'Index',
              sortable: false,
              colStyle: 'th-edit-sr-no !font-normal',
            },
            ...fieldType,
            {
              header: '',
              accessor: 'actions',
              sortable: false,
              colStyle: 'th-edit-actions !font-normal',
              colalign: 'right',
            },
          ])

          if (id) {
            setCompanyConfigureList(payload?.ResponseData?.ComapnyConfigList)
            await fetchDocumentById(id, payload?.ResponseData?.ComapnyConfigList)
            setIsLoading(false)
          }
        } else {
          handleErrorResponse(dataMessage);
        }
      } else {
        handleStatusErrorResponse(payload);
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDocumentById = async (billId: any, fieldConfiguration: any) => {
    const mainFieldConfiguration = [
      ...fieldConfiguration?.MainFieldConfiguration?.DefaultList,
      ...fieldConfiguration?.MainFieldConfiguration?.CustomList
    ]
    const lineItemConfiguration = [
      ...fieldConfiguration?.LineItemConfiguration?.DefaultList,
      ...fieldConfiguration?.LineItemConfiguration?.CustomList
    ]

    const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
      mainFieldConfiguration,
      lineItemConfiguration
    )
    try {
      const { payload, meta } = await dispatch(
        documentDetailById({
          Id: Number(billId),
          ApprovalType: 1,
          UserId: Number(userId),
        })
      )
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          setDocumentDetailByIdData(payload?.ResponseData)
          setDataList(payload?.ResponseData.LineItems)
          setRowIds([payload?.ResponseData.Id])
          setIsLoading(false)

          const responseData = payload?.ResponseData

          let updatedDataObj: any = {}
          let labelValueObj: any = {}
          if (responseData) {
            setVendorsId([responseData.VendorId])
            for (const [key, value] of Object.entries(responseData)) {
              const filterObject = keyValueMainFieldObj.find((d: any) => d.value === key)
              if (!filterObject) {
                continue
              }
              const currentDate = new Date()

              let dropdownValue = ''
              const poNumberOptions: any = []

              switch (filterObject?.key) {
                case 'vendor':
                  dropdownValue =
                    (value && vendorOptions && vendorOptions?.length > 0) ? vendorOptions.find((item: any) => item?.value === Number(value))?.label : ''
                  break
                case 'term':
                  dropdownValue =
                    (value && termOptions && termOptions?.length > 0) ? termOptions.find((item: any) => item?.value == value)?.label : ''
                  break
                case 'pono':
                  dropdownValue =
                    (value && poNumberOptions && poNumberOptions?.length > 0) ? poNumberOptions?.find((item: any) => item.value === value).label : ''
                  break
              }

              if (filterObject) {
                updatedDataObj = {
                  ...updatedDataObj,
                  [filterObject?.key]:
                    filterObject?.key === 'date'
                      ? responseData?.BillDate
                        ? format(responseData?.BillDate, 'MM/dd/yyyy')
                        : format(currentDate, 'MM/dd/yyyy')
                      : filterObject?.key === 'duedate'
                        ? responseData?.DueDate
                          ? format(responseData?.DueDate, 'MM/dd/yyyy')
                          : format(currentDate, 'MM/dd/yyyy')
                        : filterObject?.key === 'glPostingDate'
                          ? responseData?.GLPostingDate
                            ? format(responseData?.GLPostingDate, 'MM/dd/yyyy')
                            : format(currentDate, 'MM/dd/yyyy')
                          : dropdownValue
                            ? dropdownValue
                            : value === true
                              ? 'Yes'
                              : value === false
                                ? 'No'
                                : filterObject?.options?.length > 0
                                  ? filterObject?.options?.find((item: any) => item?.value == value)?.label
                                  : value,
                }

                labelValueObj = {
                  ...labelValueObj,
                  [filterObject?.label]:
                    filterObject?.key === 'date'
                      ? responseData?.BillDate
                        ? format(responseData?.BillDate, 'MM/dd/yyyy')
                        : format(currentDate, 'MM/dd/yyyy')
                      : filterObject?.key === 'duedate'
                        ? responseData?.DueDate
                          ? format(responseData?.DueDate, 'MM/dd/yyyy')
                          : format(currentDate, 'MM/dd/yyyy')
                        : filterObject?.key === 'glPostingDate'
                          ? responseData?.GLPostingDate
                            ? format(responseData?.GLPostingDate, 'MM/dd/yyyy')
                            : format(currentDate, 'MM/dd/yyyy')
                          : dropdownValue
                            ? dropdownValue
                            : value === true
                              ? 'Yes'
                              : value === false
                                ? 'No'
                                : filterObject?.options?.length > 0
                                  ? filterObject?.options?.find((item: any) => item?.value == value)?.label
                                  : value,
                }
              }
            }

            if (responseData?.LineItems) {
              const newLineItems = responseData?.LineItems?.map(async (items: any, index: number) => {
                let updatedLineItemObj: any = {}
                for (const [key, value] of Object.entries(items)) {
                  const filterLineItemObject = keyValueLineItemFieldObj.find((d: any) => d.value === key)

                  if (!filterLineItemObject) {
                    continue
                  }

                  let dropdownValue = ''
                  switch (filterLineItemObject?.key) {
                    case 'account':
                      dropdownValue = value && accountOptions && accountOptions?.length > 0 &&
                        accountOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'class':
                      dropdownValue = value && classOptions && classOptions?.length > 0 &&
                        classOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'location':
                      dropdownValue = value && locationOptions && locationOptions?.length > 0 &&
                        locationOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'project':
                      dropdownValue = value && projectOptions && projectOptions?.length > 0 &&
                        projectOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'department':
                      dropdownValue = value && departmentOptions && departmentOptions?.length > 0 &&
                        departmentOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'product':
                      dropdownValue = value && productOptions && productOptions?.length > 0 &&
                        productOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'customer':
                      dropdownValue = value && customerOptions && customerOptions?.length > 0 &&
                        customerOptions.find((item: any) => item?.value === value)?.label
                      break
                    case 'items':
                      dropdownValue = value && productOptions && productOptions?.length > 0 &&
                        productOptions.find((item: any) => item?.value === value)?.label
                      break
                  }

                  let formattedValue;

                  if (filterLineItemObject) {
                    if (dropdownValue) {
                      formattedValue = dropdownValue;
                    } else if (value === true) {
                      formattedValue = 'Yes';
                    } else if (value === false) {
                      formattedValue = 'No';
                    } else if (filterLineItemObject?.options?.length > 0) {
                      const foundOption = filterLineItemObject?.options?.find((item: any) => item?.value === value);
                      formattedValue = foundOption?.label;
                    } else {
                      formattedValue = value;
                    }

                    updatedLineItemObj = {
                      ...updatedLineItemObj,
                      Index: index + 1,
                      Id: items?.Id,
                      [filterLineItemObject.key]: formattedValue,
                    };
                  }
                }
                return updatedLineItemObj
              })
              const updatedLineItems = await Promise.all(newLineItems)
              setUpdatedFormLineItemsFields(updatedLineItems)
              setIsNewRefresh(true)
            }
          }
          setUpdatedFormFields(updatedDataObj)
          setMainFieldLableValueObj(labelValueObj)
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
    const keyFieldArray = ['account', 'term', 'from', 'vendor']
    keyFieldArray &&
      keyFieldArray.map((itemField) => {
        getListDropdownData(itemField)
      })
    fetchFieldMappingData()
  }, [id, newIsRefresh])

  useEffect(() => {
    const fetchLocationData = async () => {
      const params = {
        FilterObj: {
          LocationId: '',
          Name: '',
          FullyQualifiedName: '',
          Status: true,
        },
        Search: '',
        CompanyId: CompanyId,
        Index: 1,
        PageSize: 1000,
      }
      performApiAction(dispatch, getLocationList, params, (responseData: any) => {
        setLocationOptions(responseData)
      })
    }

    const fetchVendorData = async () => {
      const params = {
        CompanyId: CompanyId,
      }
      performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
        setVendorOptions(responseData)
      })
    }
    fetchVendorData()
    fetchLocationData()
  }, [])

  useEffect(() => {
    setFormFields(updatedFormFields)
  }, [updatedFormFields])

  useEffect(() => {
    setLineItemsFieldsData(updatedFormLineItemsFields)
  }, [updatedFormLineItemsFields])

  useEffect(() => {
    setTableDynamicWidth(isLeftSidebarCollapsed ? "w-full laptop:w-[calc(100vw-85px)]" : "w-full laptop:w-[calc(100vw-200px)]")
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    if (isOpenAttchFile) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenAttchFile])

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
  }

  return (
    <Wrapper>
      {/* Navbar */}
      {docDetailByIDData.length !== 0 && docDetailByIDData && !isLoading ? (
        <>
          <div className='sticky top-0 z-[6] flex !h-[66px] items-center justify-between bg-lightGray sm:px-4 md:px-4 laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
            <span
              className='cursor-pointer'
              onClick={() => {
                router.push(billsToPayReducer.currentPath)
              }}>
              <BackArrow />
            </span>

            <ul className='flex items-center justify-center'>
              {docDetailByIDData?.OnHold === false && (docDetailByIDData?.Status !== 11 || 16) ? (
                <>
                  <li className='h-full place-content-center px-5 py-1 sm:hidden md:hidden laptop:hidden laptopMd:hidden lg:hidden xl:block'>
                    <span
                      className='flex cursor-pointer items-center justify-center'
                      onClick={() => {
                        setMarkAsPaidClicked(!isMarkAsPaidClicked)
                        setCurrSelectedBillDetails([
                          {
                            VendorId: docDetailByIDData?.VendorId,
                            AccountPaybleId: docDetailByIDData?.Id,
                            Amount: docDetailByIDData?.Amount,
                          },
                        ])
                      }}
                    >
                      <CheckBox
                        id='mark-as-paid'
                        checked={isMarkAsPaidClicked}
                        onChange={(e) => {
                          setMarkAsPaidClicked(!e.target.checked)
                          setCurrSelectedBillDetails([
                            {
                              VendorId: docDetailByIDData?.VendorId,
                              AccountPaybleId: docDetailByIDData?.Id,
                              Amount: docDetailByIDData?.Amount,
                            },
                          ])
                        }}
                      />
                      <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Mark as Paid</label>
                    </span>
                  </li>
                  <li className='h-7 px-5 pt-1.5 border-x border-lightSilver' onClick={() => setOpenDrawer(true)}>
                    <BasicTooltip position='bottom' content='Activities' className='!z-[6] !px-0 !pt-0'>
                      <ActivityIcon />
                    </BasicTooltip>
                  </li>
                  <li className='h-7 pl-5 pt-0.5'>
                    <Button
                      variant='btn-primary'
                      className='flex h-7 sm:h-7 md:h-7 laptop:h-7 laptopMd:h-7 lg:h-9 xl:h-7 items-center justify-center rounded-full text-sm font-bold sm:!px-4 md:!px-4 laptop:!px-4 laptopMd:!px-4 lg:!px-4 xl:!px-4 hd:!px-5 2xl:!px-5 3xl:!px-5 !pt-[8px] !font-proxima'
                      onClick={() => {
                        setCurrentPayValue({
                          billNumber: docDetailByIDData?.BillNumber,
                          vendorId: docDetailByIDData?.VendorId,
                          billDate: docDetailByIDData?.BillDate,
                          dueDate: docDetailByIDData?.DueDate,
                          vendorName: docDetailByIDData?.VendorName,
                          discount: null,
                          payAmount: docDetailByIDData?.Amount,
                          accountPaybleId: docDetailByIDData?.Id,
                        })

                        setCurrSelectedBillDetails([
                          {
                            VendorId: docDetailByIDData?.VendorId,
                            AccountPaybleId: docDetailByIDData?.Id,
                            Amount: docDetailByIDData?.Amount,
                          },
                        ])
                        setTotalAmountToPay(docDetailByIDData?.Amount)
                        vendorsId.length === 1
                          ? setIsSingleVendorMultipleBillPayModalOpen(true)
                          : setIsMultipleVendorMultipleBillPayModalOpen(true)
                      }}
                    >
                      PAY
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  {(docDetailByIDData?.Status !== 11 || 16) ? (
                    <li className='h-full place-content-center border-r border-r-lightSilver sm:px-3 md:px-3 laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-5 2xl:px-5 3xl:px-5 py-1'>
                      <span
                        className='flex cursor-pointer items-center justify-center'
                        onClick={() => setBillsToPayClicked(!isBillsToPayClicked)}
                      >
                        <CheckBox
                          id='bills-to-pay'
                          checked={isBillsToPayClicked}
                          onChange={(e) => setBillsToPayClicked(!e.target.checked)}
                        />
                        <label className='cursor-pointer text-sm font-proxima tracking-[0.02em] pt-0.5'>Move to Bills to Pay</label>
                      </span>
                    </li>
                  ) : (
                    <li className='py-1' onClick={() => setOpenDrawer(true)}>
                      <BasicTooltip position='bottom' content='Activities' className='!z-[6] !p-0'>
                        <ActivityIcon />
                      </BasicTooltip>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>

          <div className='items-between flex flex-wrap px-5 mt-5'>
            {Object.entries(mainFieldLableValueObj).map(([key, value], index) => {

              const fieldLabel = mainFieldListOptions?.find((item: any) => item?.Name === key)?.Label ?? ''
              return <div key={key} className='w-[33%] py-2' >
                <div className={`text-sm font-proxima tracking-[0.02em] text-darkCharcoal ${(key == "Attachment" || key == "attachment") ? `flex ${(index === 0 || (index % 2 === 0)) ? 'justify-start' : 'justify-end'}` : ""}`}>
                  {fieldLabel ? fieldLabel : key} : {(key == "Attachment" || key == "attachment") ? (
                    <div className='relative flex items-center'>
                      {value !== null && (
                        <>
                          <span className='absolute -top-3 left-1'>
                            <Badge badgetype='error' variant='dot' text={value?.length.toString()} />
                          </span>
                          <span className='cursor-pointer' onClick={() => handleOpenAttachFile(value?.Id)}>
                            <AttachIcon />
                          </span>

                          {isOpenAttchFile && value?.Id === rowIds[0] && (
                            <div
                              ref={dropdownRef}
                              className='absolute right-1 top-5 !z-[99] flex w-[443px] flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md'
                            >
                              <DataTable
                                getExpandableData={() => { }}
                                columns={attachfileheaders}
                                data={value.map(
                                  (d: any) =>
                                    new Object({
                                      ...d,
                                      FileName: (
                                        <div
                                          className='flex cursor-pointer items-center gap-1'
                                          onClick={() => {
                                            handleFileOpen(d.FilePath, d.FileName)
                                            setIsFileRecord({
                                              FileName: d.FileName,
                                              PageCount: d.PageCount,
                                              BillNumber: value?.BillNumber,
                                            })
                                            setOpenAttachFile(false)
                                          }}
                                        >
                                          <GetFileIcon FileName={d.FileName} />
                                          <span className='w-52 truncate' title={d.FileName}>
                                            {d.FileName} &nbsp;
                                          </span>
                                        </div>
                                      ),
                                      Size: <Typography className='!text-[14px] text-[#333]'>{formatFileSize(d.Size)}</Typography>,
                                    })
                                )}
                                sticky
                                hoverEffect
                                getRowId={() => { }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>) : value}
                </div>
              </div>
            })}
          </div>

          <div className='flex items-center py-2'>
            <Typography className='font-proxima px-5 !text-sm !font-bold uppercase !text-darkCharcoal tracking-[0.02em]'>
              Available Credit: $
              {docDetailByIDData && docDetailByIDData.AvailableCredit !== null && docDetailByIDData.AvailableCredit !== undefined
                ? docDetailByIDData.AvailableCredit.toFixed(2)
                : '0.00'}
            </Typography>
          </div>

          {lineItemsFieldsData && lineItemsFieldsData.length > 0 && (
            <div className={`custom-scroll approvalMain mt-2 h-[calc(100vh-52.8vh)] overflow-auto ${tableDynamicWidth}`}>
              <div className={`mainTable ${dataList && dataList.length !== 0 && 'h-0'}`}>
                <DataTable
                  columns={lineItemFieldColumns}
                  data={lineItemsFieldsData}
                  hoverEffect={true}
                  sticky
                  getRowId={() => { }}
                  getExpandableData={() => { }}
                  isTableLayoutFixed
                />
              </div>
              <DataLoadingStatus isLoading={isLoading} data={lineItemsFieldsData} />
            </div>
          )}

          <div className={`sticky bottom-0 flex ${tableDynamicWidth} z-[6] justify-end border-t border-lightSilver bg-white p-5`}>
            <div className='flex flex-col gap-3'>
              <span className='flex justify-between gap-20'>
                <Typography className='!text-sm !font-proxima !tracking-[0.02em]'>Total Amount</Typography>
                <Typography className='!text-sm !font-bold !text-darkCharcoal !font-proxima !tracking-[0.02em]'>${Number(docDetailByIDData?.Amount).toFixed(2)}</Typography>
              </span>
              <span className='flex justify-between gap-20'>
                <Typography className='!text-sm !font-proxima !tracking-[0.02em]'>Discount Amount</Typography>
                <Typography className='!text-sm !font-bold !text-darkCharcoal !font-proxima !tracking-[0.02em]'>0.00</Typography>
              </span>
              <span className='flex justify-between gap-20'>
                <Typography className='!text-sm !font-proxima !tracking-[0.02em]'>Sub Total</Typography>
                <Typography className='!text-sm !font-bold !text-darkCharcoal !font-proxima !tracking-[0.02em]'>${Number(docDetailByIDData?.Amount).toFixed(2)}</Typography>
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
      }

      {/* Modal for paying single bill */}
      {isSingleBillPaymentModalOpen && <SinglePaymentDetailsModal
        onOpen={isSingleBillPaymentModalOpen}
        onClose={handleClosePayBillModal}
        currentValues={currentPayValue || 0}
        onDataFetch={() => router.push('/payments/billtopay')}
      />}

      {/* Modal for paying single vendor multiple bill */}
      {isSingleVendorMultipleBillPayModalOpen && <SingleVendorMultiplePaymentDetailsModal
        onOpen={isSingleVendorMultipleBillPayModalOpen}
        onClose={handleClosePayBillModal}
        vendorId={vendorsId}
        totalAmountToPay={totalAmountToPay}
        selectedAccountPayableIds={rowIds}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={() => router.push('/payments/billtopay')}
      />}

      {/* Modal for paying multiple vendor multiple bill */}
      {isMultipleVendorMultipleBillPayModalOpen && <MultipleVendorMultiplePaymentDetailsModal
        onOpen={isMultipleVendorMultipleBillPayModalOpen}
        onClose={handleClosePayBillModal}
        vendorsId={vendorsId}
        vendorOptions={vendorOptions}
        totalAmountToPay={totalAmountToPay}
        selectedAccountPayableIds={rowIds}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={() => router.push('/payments/billtopay')}
      />}

      {/* Payment Details Modal when clicking on Mark as Paid */}
      <MarkAsPaidModal
        onOpen={isMarkAsPaidClicked}
        onClose={handleCloseMarkAsPaidModal}
        selectedRowIds={rowIds}
        selectedBillDetails={currSelectedBillDetails}
        onDataFetch={() => router.push(billsToPayReducer.currentPath)}
      />

      {/* Modal for move the bills from on hold to - to pay */}
      <MoveBillsToPayModals
        onOpen={isBillsToPayClicked}
        onClose={() => {
          setBillsToPayClicked(false)
        }}
        selectedRowIds={rowIds}
        onDataFetch={() => fetchDocumentById(id, companyConfigureList)}
      />

      {/* Acticity Drawer */}
      <ActivityDrawer
        noCommentBox={false}
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        GUID={docDetailByIDData?.GUID}
        selectedPayableId={parseInt(id as string)}
      />
      <Overlay isOpen={openDrawer} />

      {isFileModal && ['pdf'].includes(isFileRecord.FileName.split('.').pop().toLowerCase()) && (
        <FileModal
          isFileRecord={isFileRecord}
          setIsFileRecord={setIsFileRecord}
          PDFUrl={PDFUrl}
          isOpenDrawer={isOpenDrawer}
          setPDFUrl={(value: any) => setPDFUrl(value)}
          setIsOpenDrawer={(value: boolean) => setIsOpenDrawer(value)}
          setFileModal={(value: boolean) => setFileModal(value)}
          fileBlob={fileBlob}
          isPdfLoading={isPdfLoading}
          openInNewWindow={openInNewWindow}
        />
      )}
    </Wrapper >
  )
}

export default BillFormat
