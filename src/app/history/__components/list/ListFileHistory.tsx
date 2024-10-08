'use client'

import { BillNumberProps, Column, HistoryFilterFormFieldsProps, LinkBillToExistingBillProps } from '@/models/files'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { Badge, BasicTooltip, DataTable, Loader, Select, Toast, Typography } from 'pq-ap-lib'
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
import { historyGetList, setFilterFormFields } from '@/store/features/files/filesSlice'
import { convertStringsDateToUTC } from '@/utils'
import { convertUTCtoLocal, getPDFUrl, limitString } from '@/utils/billposting'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export const nestedColumns: Column[] = [
  {
    header: '',
    accessor: 'arrowspace',
    sortable: false,
    colStyle: '!w-[55px] !tracking-[0.02em]',
  },
  {
    header: 'FILE NAME',
    accessor: 'FileName',
    sortable: false,
    colStyle: '!w-[130px] !tracking-[0.02em]',
  },
  {
    header: 'BILL NO.',
    accessor: 'BillNo',
    sortable: false,
    colStyle: '!w-[160px] !tracking-[0.02em]',
  },
  {
    header: 'PROCESS',
    accessor: 'APProviderType',
    sortable: false,
    colStyle: '!w-[150px] !tracking-[0.02em]',
  },
  {
    header: 'AMOUNT',
    accessor: 'Amount',
    sortable: false,
    colStyle: '!w-[125px] !pr-[30px] !tracking-[0.02em]',
    colalign: 'right',
  },
  {
    header: 'UPLOADED DATE & TIME',
    accessor: 'UploadedDate',
    sortable: false,
    colStyle: '!w-[200px] !tracking-[0.02em]',
  },
  {
    header: 'PAGES',
    accessor: 'Pages',
    sortable: false,
    colStyle: '!w-[100px] !tracking-[0.02em]',
    colalign: 'right'
  },
  {
    header: 'LOCATION',
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

export default function ListFileHistory({ userOptions, billNumberOptions, locationOptions }: any) {
  const lazyRows = 10
  let nextPageIndex: number = 1

  const dropdownRef = useRef<HTMLDivElement>(null)
  const tableBottomRef = useRef<HTMLDivElement>(null)
  const createModalRef = useRef<HTMLDivElement>(null)
  const exportOptionsRef = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const router = useRouter()

  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId

  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const { filterFormFields } = useAppSelector((state) => state.files)
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const { selectedCompany } = useAppSelector((state) => state.user)
  const AccountingTool = selectedCompany?.accountingTool

  const [apiDataCount, setApiDataCount] = useState(0)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [localFilterFormFields, setLocalFilterFormFields] = useState<HistoryFilterFormFieldsProps>(filterFormFields)
  const [tableDynamicWidth, setTableDynamicWidth] = useState<string>('w-full laptop:w-[calc(100vw-200px)]')

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false)
  const [isLinkToBillModalVisible, setIsLinkToBillModalVisible] = useState(false)

  const [historyLists, setHistoryLists] = useState<any>([])

  const [isResetFilter, setIsResetFilter] = useState<boolean>(false)
  const [isApplyFilter, setIsApplyFilter] = useState<boolean>(false)

  const [selectedDocument, setSelectedDocument] = useState<number | null>(null)
  const [nestedRowId, setNestedRowId] = useState<number | null>(null)
  const [attachmentDocumentId, setAttachmentDocumentId] = useState<number | null>(null)

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

  const filteredNestedColumns: Column[] =
    nestedColumns &&
    nestedColumns
      .map((item) => {
        if (AccountingTool === 3 && item?.accessor === 'LocationName') {
          return undefined
        }
        return item
      })
      .filter((item): item is Column => !!item)

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
        Process: filterFormFields?.fh_process ? filterFormFields?.fh_process : [],
        BillNo: billNumbersSelected ? billNumbersSelected : [],
        LocationIds: filterFormFields.fh_locations ? filterFormFields.fh_locations : [],
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
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-85px)]')
    } else {
      setTableDynamicWidth('w-full laptop:w-[calc(100vw-200px)]')
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

  const handleCreateFile = (selectedDocument: number) => {
    setIsCreateModalVisible(true)
    setSelectedDocument(selectedDocument)
  }

  const handleRetryFile = async (documentId: number) => {
    setIsRetryLoading(true)
    try {
      const response = await agent.APIs.handleFileHistoryRetry({ Id: documentId })

      if (response?.ResponseStatus === 'Success') {
        const updatedHistoryLists = historyLists.map((historyItem: any) => {
          const updatedAttachmentData = historyItem.AttachmentData.map((attachmentItem: any) => {
            if (attachmentItem.DocumentsId === documentId) {
              return {
                ...attachmentItem,
                Status: 'Moved To Automation',
                IsShowOptions: false,
              };
            }
            return attachmentItem;
          });
        
          return {
            ...historyItem,
            AttachmentData: updatedAttachmentData,
          };
        });
        setHistoryLists(updatedHistoryLists)
        setIsRetryLoading(false)
      }
    } catch (error) {
      Toast.error('Something Went Wrong!')
    }
  }

  const handleModalClick = () => {
    setIsConfirmModalVisible(true)
  }

  const handleOpenAttachFile = (documentsId: number) => {
    setAttachmentDocumentId(documentsId)
    setIsAttachmentVisible(true)
  }

  const handleSelectedModule = (
    module: string,
    documentsId: number,
    isFromDocuments: boolean,
    filePath: string,
    fileName: string
  ) => {
    if (module === '1') {
      dispatch(setIsFormDocuments(isFromDocuments))
      router.push(`/bills/create/1/${documentsId}`)
    }
    if (module === '2') {
      dispatch(setIsFormDocuments(isFromDocuments))
      router.push(`/bills/create/2/${documentsId}`)
    }
    if (module === '3') {
      setIsCreateModalVisible(false)
      setIsLinkToBillModalVisible(true)

      setLinkedBillObj({
        ...linkedBillObj,
        DocumentId: documentsId,
        FilePath: filePath,
        FileName: fileName,
      })
    }
  }

  const showPDFViewerModal = async (filePath: any, fileName: any) => {
    if (filePath) {
      await getPDFUrl(filePath, fileName, setPDFUrl, null, setFileBlob, setIsPdfLoading, null, null, null, null)
    }
  }

  const handleFileOpen = (filePath: any, fileName: string) => {
    showPDFViewerModal(filePath, fileName)
    setFileModal(!isFileModal)
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

  const StatusIndicator = ({ status }: any) => {
    let backgroundColorClass

    if (status === 'Failed') {
      backgroundColorClass = 'bg-[#FB2424]'
    } else if (status === 'Deleted') {
      backgroundColorClass = 'bg-[#FDB663]'
    } else {
      backgroundColorClass = 'bg-[#02B89D]'
    }
    return (
      <div className='!z-0 flex w-full items-center'>
        <span className={`mr-2 flex !h-[6px] !w-[6px] rounded-full ${backgroundColorClass}`}></span>
        <Typography className='!text-sm text-darkCharcoal'>{status}&nbsp;</Typography>
      </div>
    )
  }

  const DataRow = ({
    d,
    nestedData,
    handleFileOpen,
    handleOpenAttachFile,
    setIsFileRecord,
    handleCreateFile,
    handleRetryFile,
    isRetryLoading,
    isCreateModalVisible,
    createOptions,
    selectedDocument,
    createModalRef,
  }: any) => {
    const formattedNestedUploadedDate =
      nestedData?.UploadedDate && format(convertUTCtoLocal(nestedData?.UploadedDate), 'MM/dd/yyyy, HH:mm:ss')

    let apProviderTypeText

    if (nestedData?.APProviderType === 1) {
      apProviderTypeText = 'Account Payable'
    } else if (nestedData?.APProviderType === 2) {
      apProviderTypeText = 'Account Adjustment'
    } else {
      apProviderTypeText = 'Others'
    }

    return {
      ...nestedData,
      FileName1: (
        <BasicTooltip position='right' content={nestedData.FileName} className='!z-[2] !p-0 !font-proxima !text-sm'>
          <span>{limitString(nestedData.FileName, 13)}</span>
        </BasicTooltip>
      ),
      FileName: nestedData.FileName && nestedData.FileName.length > 5
        ? <BasicTooltip position='right' content={nestedData.FileName} className='!m-0 !p-0 !z-[4]'>
          <span>{limitString(nestedData.FileName, 13)}</span>
        </BasicTooltip>
        : <label className="font-proxima text-sm cursor-pointer">{nestedData.FileName}</label>,
      APProviderType: apProviderTypeText,
      UploadedDate: <Typography className='!text-sm tracking-[0.02em] text-darkCharcoal'>{formattedNestedUploadedDate}</Typography>,
      BillNo: (
        <div className='flex w-full items-center justify-between'>
          <div
            className='w-4/5 cursor-pointer'
            onClick={() => {
              setIsFileRecord({
                FileName: nestedData.FileName,
                PageCount: nestedData.Pages,
                BillNumber: nestedData.BillNo,
              })
              handleFileOpen(nestedData.FilePath, nestedData.FileName)
            }}
          >
            <Typography className='pl-0 !text-sm text-darkCharcoal'>{nestedData.BillNo || ''}</Typography>
          </div>
          <div className='relative mr-4 w-1/5'>
            {nestedData.DocumentAttachment?.length > 0 && (
              <BasicTooltip position='right' content='Additional Attachments' className='!z-[2] !font-proxima !text-sm'>
                <div className='flex cursor-pointer justify-end' onClick={() => handleOpenAttachFile(nestedData?.DocumentsId)}>
                  <div className='absolute -top-1 right-0'>
                    <Badge badgetype='error' variant='dot' text={nestedData.DocumentAttachment.length.toString()} />
                  </div>
                  <AttachIcon />
                </div>
              </BasicTooltip>
            )}
            {isAttachmentVisible && attachmentDocumentId === nestedData?.DocumentsId && (
              <div
                ref={dropdownRef}
                className='absolute !z-[3] flex w-[443px] flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md'
              >
                <DataTable
                  getExpandableData={() => { }}
                  columns={attachfileheaders}
                  data={nestedData.DocumentAttachment.map((e: any) => ({
                    ...e,
                    FileName: (
                      <div
                        className='flex cursor-pointer items-center gap-1'
                        onClick={() => {
                          handleFileOpen(e.FilePath, e.FileName)
                          setIsFileRecord({
                            FileName: e.FileName,
                            PageCount: e.PageCount,
                            BillNumber: d.BillNumber,
                          })
                          setIsAttachmentVisible(false)
                        }}
                      >
                        <GetFileIcon FileName={e.FileName} />
                        <span className='w-52 truncate' title={e.FileName}>
                          {e.FileName} &nbsp;
                        </span>
                      </div>
                    ),
                    Size: <Typography className='!text-sm text-darkCharcoal'>{formatFileSize(e.FileSize)}</Typography>,
                  }))}
                  sticky
                  hoverEffect
                  getRowId={() => { }}
                />
              </div>
            )}
          </div>
        </div>
      ),
      Status: <StatusIndicator status={nestedData.Status} />,
      Amount: (
        <Typography className='!pr-[25px] !text-sm !font-bold text-darkCharcoal'>
          ${nestedData?.Amount ? formatCurrency(nestedData.Amount) : "0.00"}
        </Typography>
      ),
      actions: (
        <div className='relative flex h-full justify-end'>
          {nestedData?.IsShowOptions && (
            <div className='flex justify-center items-center'>
              <BasicTooltip position='left' content='Create' className='!z-[2] !font-proxima !text-sm'>
                <div className='cursor-pointer' onClick={() => handleCreateFile(nestedData?.DocumentsId)}>
                  <FilesAddIcon />
                </div>
              </BasicTooltip>
              {isRetryLoading && nestedRowId === nestedData?.DocumentsId ? (
                <div className='pointer-events-none cursor-default px-2 py-1.5'>
                  <div className='animate-spin'>
                    <SpinnerIcon bgColor='#6E6D7A' />
                  </div>
                </div>
              ) : (
                <BasicTooltip position='left' content='Retry' className={`${isRetryLoading ? 'pointer-events-none' : 'cursor-pointer'} !z-[2] !font-proxima !text-sm`}>
                  <div className='cursor-pointer' onClick={() => {
                    setNestedRowId(nestedData?.DocumentsId);
                    handleRetryFile(nestedData?.DocumentsId);
                  }}>
                    <FilesRetryIcon />
                  </div>
                </BasicTooltip>
              )}
            </div>
          )}
          {/* {isRetryLoading && <div className='spin'></div>} */}
          {selectedDocument === nestedData?.DocumentsId && isCreateModalVisible && (
            <div
              ref={createModalRef}
              className='absolute right-2 top-11 z-[99] w-[215px] bg-white shadow-[0px_4px_8px_0px_#00000026]'
            >
              {createOptions.map((option: any) => (
                <div
                  key={option.id}
                  onClick={() =>
                    handleSelectedModule(
                      option.id,
                      nestedData?.DocumentsId,
                      nestedData?.IsFromDocuments,
                      nestedData?.FilePath,
                      nestedData?.FileName
                    )
                  }
                  className='cursor-pointer px-3.5 py-2.5 font-proxima text-[14px] hover:bg-[#EEF4F8]'
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    }
  }

  const table_Data = historyLists?.map((d: any) => {
    const formattedUploadedDate = d?.UploadedDate && format(convertUTCtoLocal(d?.UploadedDate), 'MM/dd/yyyy, HH:mm:ss')
    return {
      ...d,
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
      details: (
        <div className='custom-scroll stickyTable h-auto max-h-[288px] overflow-auto border-b border-solid border-black'>
          <DataTable
            columns={filteredNestedColumns}
            data={
              d.AttachmentData?.length > 0 &&
              d.AttachmentData.map((nestedData: any) =>
                DataRow({
                  d,
                  nestedData,
                  handleFileOpen,
                  handleOpenAttachFile,
                  setIsFileRecord,
                  handleCreateFile,
                  handleRetryFile,
                  isRetryLoading,
                  isCreateModalVisible,
                  createOptions,
                  selectedDocument,
                  createModalRef,
                })
              )
            }
            hoverEffect
            isTableLayoutFixed
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
        </div>
      ),
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
        <div className='flex h-full w-full items-center justify-center'>
          <Loader size='md' helperText />
        </div>
      )
    } else {
      noDataContent = (
        <div className='fixed flex h-[59px] w-full items-center justify-center border-b border-b-[#ccc]'>
          No records available at the moment.
        </div>
      )
    }
  } else {
    noDataContent = ''
  }


  return (
    <Wrapper masterSettings={false}>
      <div className='sticky top-0 z-[6] flex !h-[66px] items-center justify-between bg-whiteSmoke laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='flex items-center'>
          <label className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base lg:text-base xl:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>File History</label>
        </div>

        <div className='flex items-center laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5'>
          <div className='flex justify-center items-center h-6 laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5 border-r border-lightSilver laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] text-darkCharcoal'>
            Total Uploaded Files: <span className='font-bold text-darkCharcoal'>{apiDataCount}</span>
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
      </div>

      <div className={`custom-scroll h-[calc(100vh-145px)] approvalMain overflow-auto ${tableDynamicWidth}`}>
        <div className={`historyTable !outline-none ${table_Data.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            columns={columns}
            data={table_Data ? table_Data : []}
            sticky
            hoverEffect
            isTableLayoutFixed
            expandable
            isExpanded
            expandOneOnly={false}
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

      {isFileModal && ['pdf'].includes(fileExtensions ?? '') && (
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
      )}

      <HistoryFilter
        isFilterVisible={isFilterVisible}
        onCancel={handleFilterClose}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        filterFormFields={filterFormFields}
        localFilterFormFields={localFilterFormFields}
        setLocalFilterFormFields={setLocalFilterFormFields}
        receivedUserOptions={userOptions}
        billNumberOptions={billNumberOptions}
        locationOptions={locationOptions}
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
    </Wrapper>
  )
}