'use client'

import { BillNumberProps, Column, HistoryFilterFormFieldsProps, LinkBillToExistingBillProps } from '@/models/files'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { Badge, BasicTooltip, Breadcrumb, DataTable, Loader, Select, Toast, Typography } from 'pq-ap-lib'
import { lazy, useEffect, useRef, useState } from 'react'

import agent from '@/api/axios'
import Download from '@/components/Common/Custom/Download'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'
import { attachfileheaders } from '@/data/billPosting'
import { columns, createOptions } from '@/data/fileHistory'
import { DocumentDropdownOptionsProps, FileRecordType } from '@/models/billPosting'
import { setIsFormDocuments } from '@/store/features/bills/billSlice'
import { getBillNumbersList, historyGetList, setFilterFormFields } from '@/store/features/files/filesSlice'
import { convertStringsDateToUTC } from '@/utils'
import { convertUTCtoLocal, getPDFUrl, limitString } from '@/utils/billposting'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import HistoryDetails from './HistoryDetails'
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { manageCompanyAssignUser } from '@/store/features/company/companySlice'

export const nestedColumns: Column[] = [
  {
    header: '',
    accessor: 'arrowspace',
    sortable: false,
    colStyle: '!w-[55px] !tracking-[0.02em]',
  },
  {
    header: 'File Name',
    accessor: 'FileName',
    sortable: false,
    colStyle: '!w-[130px] !tracking-[0.02em]',
  },
  {
    header: 'Bill No.',
    accessor: 'BillNo',
    sortable: false,
    colStyle: '!w-[160px] !tracking-[0.02em]',
  },
  {
    header: 'Process',
    accessor: 'APProviderType',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'Amount',
    accessor: 'Amount',
    sortable: false,
    colStyle: '!w-[125px] !pr-[30px] !tracking-[0.02em]',
    colalign: 'right',
  },
  {
    header: 'Uploaded Date & Time',
    accessor: 'UploadedDate',
    sortable: false,
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
    header: 'Pages',
    accessor: 'Pages',
    sortable: false,
    colStyle: '!w-[100px] !tracking-[0.02em]',
    colalign: 'right'
  },
  {
    header: 'Location',
    accessor: 'LocationName',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: '',
    accessor: 'Status',
    sortable: false,
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
    header: '',
    accessor: 'actions',
    sortable: false,
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
]

const DropboxIcon = lazy(() => import('@/assets/Icons/DropboxIcon'))
const EmailIcon = lazy(() => import('@/assets/Icons/EmailIcon'))
const FileUploadIcon = lazy(() => import('@/assets/Icons/FileUploadIcon'))
const FilesAddIcon = lazy(() => import('@/assets/Icons/FilesAddIcon'))
const FilesRetryIcon = lazy(() => import('@/assets/Icons/FilesRetryIcon'))
const HistorySystemUpdateIcon = lazy(() => import('@/assets/Icons/HistorySystemUpdate'))
const AttachIcon = lazy(() => import('@/assets/Icons/billposting/AttachIcon'))
const FilterIcon = lazy(() => import('@/assets/Icons/billposting/FilterIcon'))
const ConfirmationModal = lazy(() => import('@/components/Common/Modals/ConfirmationModal'))
const Wrapper = lazy(() => import('@/components/Common/Wrapper'))

const FileModal = lazy(() => import('@/app/bills/__components/FileModal'))
const GetFileIcon = lazy(() => import('@/app/bills/__components/GetFileIcon'))
const HistoryFilter = lazy(() => import('@/app/history/__components/HistoryFilter'))
const LinkToBillModal = lazy(() => import('@/app/history/__components/LinkToBillModal'))

const initialFilterFormFields: HistoryFilterFormFieldsProps = {
  fh_source: [],
  fh_received_uploaded: [],
  fh_uploaded_date: '',
  fh_bill_number: [],
  fh_process: [],
}

export default function ListFileHistory() {
  const lazyRows = 15
  let nextPageIndex: number = 1

  const dropdownRef = useRef<HTMLDivElement>(null)
  const tableBottomRef = useRef<HTMLDivElement>(null)
  const createModalRef = useRef<HTMLDivElement>(null)
  const exportOptionsRef = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isFilesPermission = getModulePermissions(processPermissionsMatrix, "Files") ?? {}
  const isFilesView = isFilesPermission?.View ?? false;
  const isFilesImport = isFilesPermission?.Import ?? false;

  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const { filterFormFields } = useAppSelector((state) => state.files)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const { selectedCompany } = useAppSelector((state) => state.user)
  const AccountingTool = selectedCompany?.accountingTool

  const [apiDataCount, setApiDataCount] = useState(0)
  const [userdetails, setUserDetails] = useState<any>({
    userId: 0,
    userName: '',
    uploadedDate: '',
    providerType: 0
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isVendorDetails, setIsVendorDetails] = useState<boolean>(false)

  const [localFilterFormFields, setLocalFilterFormFields] = useState<HistoryFilterFormFieldsProps>(filterFormFields)
  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-180px)]')

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false)
  const [isLinkToBillModalVisible, setIsLinkToBillModalVisible] = useState(false)

  const [historyLists, setHistoryLists] = useState<any>([])

  const [isResetFilter, setIsResetFilter] = useState<boolean>(false)
  const [isApplyFilter, setIsApplyFilter] = useState<boolean>(false)

  const [linkedBillObj, setLinkedBillObj] = useState<LinkBillToExistingBillProps>({
    AccountPayableId: null,
    DocumentId: null,
    FilePath: '',
    FileName: '',
  })

  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)
  const [PDFUrl, setPDFUrl] = useState<string>('')
  const [fileBlob, setFileBlob] = useState<string | Blob>('')
  const [isFileModal, setFileModal] = useState<boolean>(false)
  const [isFileRecord, setIsFileRecord] = useState<FileRecordType>({
    FileName: '',
    PageCount: '',
    BillNumber: '',
  })
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [isRetryLoading, setIsRetryLoading] = useState<boolean>(false)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)

  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [selectedBillNumber, setSelectedBillNumber] = useState<string>('')

  const [currentWindow, setCurrentWindow] = useState<any>(null)
  const [userOptions, setUserOptions] = useState<any>([])
  const [billNumberOptions, setBillNumberOptions] = useState<any>([])
  const [locationOptions, setLocationOptions] = useState<any>([])

  useEffect(() => {
    if (!isFilesView) {
      router.push('/manage/companies');
    }
  }, [isFilesView]);

  const getUserOptionDropdown = async () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, manageCompanyAssignUser, params, (response: any) => {
      setUserOptions(response)
    })
  }

  const getLocationOptionDropdown = () => {
    const params = {
      CompanyId: Number(CompanyId),
      IsActive: true,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      setLocationOptions(responseData)
    })
  }

  const getBillNumberOptionDropdown = async () => {
    performApiAction(dispatch, getBillNumbersList, null, (responseData: any) => {
      setBillNumberOptions(responseData)
    })
  }

  useEffect(() => {
    if (CompanyId) {
      getBillNumberOptionDropdown()
      getUserOptionDropdown()
      getLocationOptionDropdown()
    }
  }, [CompanyId])

  const fetchHistoryData = async (pageIndex?: number) => {
    if (pageIndex === 1) {
      setHistoryLists([])
      setItemsLoaded(0)
      setIsLoading(true)
    }
    if (CompanyId) {
      const dateRangeVal = filterFormFields?.fh_uploaded_date ? filterFormFields?.fh_uploaded_date?.split('to') : ''
      const billNumbersSelected =
        billNumberOptions
          .map((item: BillNumberProps) => {
            if (filterFormFields?.fh_bill_number?.includes(item?.value)) {
              return item.label
            }
          })
          .filter(Boolean) ?? []

      const params = {
        PageNumber: pageIndex || nextPageIndex,
        PageSize: lazyRows,
        Source: filterFormFields?.fh_source ? filterFormFields?.fh_source : [],
        UserIds: filterFormFields?.fh_received_uploaded ? filterFormFields?.fh_received_uploaded : [],
        Process: [],
        BillNo: [],
        LocationIds: [],
        StartDate: dateRangeVal[0] ? convertStringsDateToUTC(dateRangeVal[0]?.trim()) : null,
        EndDate: dateRangeVal[1] ? convertStringsDateToUTC(dateRangeVal[1]?.trim()) : null,
      }

      try {
        setIsLazyLoading(true)
        const { payload, meta } = await dispatch(historyGetList(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            const responseData = payload?.ResponseData
            const newList = responseData?.List || []
            const newTotalCount = responseData?.ListCount || 0

            setApiDataCount(newTotalCount)

            let updatedData = []
            if (pageIndex === 1) {
              updatedData = [...newList]
              setIsLoading(false)
              setIsLazyLoading(false)
              setShouldLoadMore(true)
            } else {
              updatedData = [...historyLists, ...newList]
            }
            setHistoryLists(updatedData)
            setItemsLoaded(updatedData.length)
            setIsLazyLoading(false)

            setIsApplyFilter(false)
            setIsResetFilter(false)
            setIsLoading(false)

            if (itemsLoaded >= newTotalCount) {
              setShouldLoadMore(false);
            }
          } else {
            // responseFailure()
            Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
          }
        } else {
          // responseFailure()
          Toast.error(`${payload?.status} : ${payload?.statusText}`)
        }
      } catch (error) {
        setIsLoading(false)
        Toast.error('Something Went Wrong!')
      } finally {
        setIsLoading(false)
        setIsLazyLoading(false)
      }
    }
  }

  useEffect(() => {
    if (CompanyId) {
      fetchHistoryData(1)
    }
  }, [CompanyId])

  useEffect(() => {
    if (isApplyFilter) {
      fetchHistoryData(1)
    }
  }, [isApplyFilter])

  useEffect(() => {
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-78px)]')
    } else {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-180px)]')
    }
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    if (isCreateModalVisible || isAttachmentVisible) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isCreateModalVisible, isAttachmentVisible])

  const handleOutsideClick = (event: MouseEvent) => {
    if (createModalRef.current && !createModalRef.current.contains(event.target as Node)) {
      setIsCreateModalVisible(false)
    }

    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsAttachmentVisible(false)
    }
  }

  const handleModalClick = () => {
    setIsConfirmModalVisible(true)
  }

  const ProviderIcon = ({ providerType, providerTypeName, onClick }: any) => {
    const Icon = providerType === 2 ? DropboxIcon : providerType === 3 ? EmailIcon : FileUploadIcon
    return (
      <BasicTooltip position='left' content={providerTypeName} className='!z-4 !font-proxima !text-sm'>
        <div onClick={onClick}>
          <Icon />
        </div>
      </BasicTooltip>
    )
  }

  const table_Data = historyLists?.map((d: any) => {
    const formattedUploadedDate = d?.UploadedDate && format(convertUTCtoLocal(d?.UploadedDate), 'MM/dd/yyyy, HH:mm:ss')
    return {
      ...d,
      UserName: <label className="font-proxima text-sm cursor-pointer" onClick={() => {
        setIsVendorDetails(true)
        setUserDetails({
          userId: d.UserId,
          userName: d.UserName,
          uploadedDate: formattedUploadedDate,
          ProviderType: d.ProviderType
        })
      }}>{d.UserName}</label>,
      ProviderTypeName: (
        <div className='pl-[14px]'>
          <ProviderIcon
            providerType={d.ProviderType}
            providerTypeName={d.ProviderTypeName}
            onClick={d.ProviderType === 3 ? handleModalClick : null}
          />
        </div>
      ),
      UploadedDate: <Typography className='!text-sm tracking-[0.02em] text-darkCharcoal'>{formattedUploadedDate}</Typography>,
      Actions: <HistorySystemUpdateIcon />,
    }
  })

  const handleFilterClose = () => {
    setIsFilterVisible(false)
  }

  const handleConfirmModalClose = () => {
    setIsConfirmModalVisible(false)
  }

  const handleOnCloseLinkToBillModal = () => {
    setIsLinkToBillModalVisible(false)
  }

  const handleApplyLinkToBill = async () => {
    try {
      const response = await agent.APIs.linkBillToExistingBill(linkedBillObj)

      if (response?.ResponseStatus === 'Success') {
        const responseData = response?.ResponseData
        if (responseData.IsUploaded) {
          fetchHistoryData(1)
          setIsLinkToBillModalVisible(false)
          Toast.success(`Attachment added to bill number: ${selectedBillNumber}`)
        }
      }
    } catch (error) {
      Toast.error('Something Went Wrong!')
    }
  }

  const handleApplyFilter = async () => {
    if (isResetFilter) {
      await dispatch(setFilterFormFields(initialFilterFormFields))
      setIsApplyFilter(true)
      setIsFilterVisible(false)
      return
    }
    dispatch(
      setFilterFormFields({
        ...localFilterFormFields,
      })
    )
    setIsApplyFilter(true)
    setIsFilterVisible(false)
  }

  const handleResetFilter = () => {
    setIsResetFilter(true)
    setLocalFilterFormFields(initialFilterFormFields)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          fetchHistoryData()
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
  }, [shouldLoadMore, itemsLoaded, tableBottomRef.current])

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
    setCurrentWindow(newWindow)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    if (currentWindow && !currentWindow.closed) {
      currentWindow.location.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      setTimeout(function () {
        currentWindow.document.title = fileName
      }, 1000)
    } else {
      openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
    }
  }

  const fileExtensions = isFileRecord && isFileRecord?.FileName?.split('.')?.pop()?.toLowerCase()

  let noDataContent

  if (table_Data.length === 0) {
    if (isLoading) {
      noDataContent = (
        <div className='flex h-[calc(100vh-160px)] w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className='fixed font-proxima flex h-[44px] w-full items-center justify-center border-b border-b-[#ccc]'>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }

  return (
    <Wrapper masterSettings={false}>
      {
        isVendorDetails ? (
          <HistoryDetails
            isDetailsOpen={isVendorDetails}
            userDetails={userdetails}
            userOptions={userOptions}
            billNumberOptions={billNumberOptions}
            locationOptions={locationOptions}
            onBack={(value: boolean) => {
              setIsVendorDetails(value)
            }} />
        ) : (
          <>
            <div className='sticky top-0 z-[6] flex !h-[50px] items-center justify-between bg-whiteSmoke laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
              <div className='flex items-center'>
                <label className='font-proxima flex items-center text-base font-bold tracking-[0.02em] text-darkCharcoal'>File History</label>
              </div>
              <div className='flex items-center laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
                <div className='flex justify-center items-center h-6 laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5 border-r border-lightSilver laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] text-darkCharcoal'>
                  Total Uploaded Files: <span className='font-bold text-darkCharcoal pl-1'> {apiDataCount}</span>
                </div>
                <div className='flex justify-center items-center mt-1' onClick={() => setIsFilterVisible(true)}>
                  <BasicTooltip position='bottom' content='Filter' className='!px-0 !pb-2.5 !font-proxima !text-sm'>
                    <FilterIcon />
                  </BasicTooltip>
                </div>

                <div className='flex justify-center items-center mt-0.5'>
                  <Download
                    url={`${process.env.API_FILEUPLOAD}/document/getlist`}
                    params={{}}
                    fileName='History'
                  />
                </div>

              </div>

            </div >
            <div className={`custom-scroll h-[calc(100vh-112px)] approvalMain overflow-auto ${tableDynamicWidth}`}>
              <div className={`historyTable !outline-none ${table_Data.length === 0 ? 'h-11' : 'h-auto'}`}>
                <DataTable
                  columns={columns}
                  data={table_Data ? table_Data : []}
                  sticky
                  hoverEffect
                  isTableLayoutFixed
                  // expandable
                  // isExpanded
                  // expandOneOnly={false}
                  lazyLoadRows={lazyRows}
                  getRowId={() => { }}
                  getExpandableData={() => { }}
                />
                {isLazyLoading && !isLoading && (
                  <Loader size='sm' helperText />
                )}
                <div ref={tableBottomRef} />
              </div>
              {noDataContent}
            </div>
          </>
        )
      }


      {
        isFileModal && ['pdf'].includes(fileExtensions ?? '') && (
          <FileModal
            isFileRecord={isFileRecord}
            setIsFileRecord={setIsFileRecord}
            PDFUrl={PDFUrl}
            isFileNameVisible={true}
            isOpenDrawer={isOpenDrawer}
            setPDFUrl={(value: any) => setPDFUrl(value)}
            setIsOpenDrawer={(value: boolean) => setIsOpenDrawer(value)}
            setFileModal={(value: boolean) => setFileModal(value)}
            fileBlob={fileBlob}
            isPdfLoading={isPdfLoading}
            openInNewWindow={openInNewWindow}
          />
        )
      }

      <HistoryFilter
        isFilterVisible={isFilterVisible}
        onCancel={handleFilterClose}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        filterFormFields={filterFormFields}
        localFilterFormFields={localFilterFormFields}
        setLocalFilterFormFields={setLocalFilterFormFields}
        receivedUserOptions={userOptions}
      />

      <LinkToBillModal
        isOpen={isLinkToBillModalVisible}
        onClose={handleOnCloseLinkToBillModal}
        modalTitle='Link to Bill'
        onApply={handleApplyLinkToBill}
        modalContent={
          <div className='mb-12'>
            <Select
              id={'linked_bill_number'}
              label='Bill Number'
              placeholder={'Please Select'}
              value={linkedBillObj?.AccountPayableId?.toString()}
              defaultValue={linkedBillObj?.AccountPayableId?.toString()}
              options={billNumberOptions ?? []}
              search
              getValue={(value) => {
                setLinkedBillObj({
                  ...linkedBillObj,
                  AccountPayableId: parseInt(value),
                })
                const billLabel: DocumentDropdownOptionsProps = billNumberOptions.find(
                  (item: DocumentDropdownOptionsProps) => item.value === value
                ) ?? { label: '', value: '' }
                setSelectedBillNumber(billLabel?.label ?? '')
              }}
              getError={() => ''}
            />
          </div>
        }
      />

      <ConfirmationModal
        title='Convert Mail Body'
        content='Do you want to convert this mail body to PDF?'
        isModalOpen={isConfirmModalVisible}
        modalClose={handleConfirmModalClose}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />
    </Wrapper >
  )
}