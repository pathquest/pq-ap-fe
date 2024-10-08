/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import agent from '@/api/axios'
import { fetchAPIsData } from '@/api/server/common'
import FileModal from '@/app/bills/__components/FileModal'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import SplitDrawer from '@/app/bills/__components/SplitDrawer'
import ImageIcon from '@/assets/Icons/ImageIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import LeftDoubleArrowIcon from '@/assets/Icons/billposting/LeftDoubleArrowIcon'
import RightDoubleArrowIcon from '@/assets/Icons/billposting/RightDoubleArrowIcon'
import { storageConfig } from '@/components/Common/pdfviewer/config'
import { BillPostingFilterFormFieldsProps, EditBillPostingDataProps } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { documentGetList, setFilterFormFields, setIsFormDocuments, setIsVisibleSidebar } from '@/store/features/bills/billSlice'
import { convertStringsDateToUTC } from '@/utils'
import { getPDFUrl, getRoundValue, getViewUpdatedDataFromDetailsResponse, initialBillPostingFilterFormFields, returnKeyValueObjForFormFields, taxTotalAmountCalculate, totalAmountCalculate } from '@/utils/billposting'
import { BlobServiceClient } from '@azure/storage-blob'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Badge, DataTable, Loader, Toast, Typography } from 'pq-ap-lib'
import { Resizable } from 're-resizable'
import { useEffect, useRef, useState } from 'react'
import ViewReportWrapper from './ViewReportWrapper'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'

const PDFViewer = dynamic(() => import('@/app/bills/__components/PDFViewer'), {
  ssr: false,
})

const ViewReportBill = () => {
  const { isVisibleSidebar, selectedProcessTypeInList, filterFormFields } = useAppSelector((state) => state.bill)
  const processtype = selectedProcessTypeInList

  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const AccountingTool = session?.user?.AccountingTool

  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [termOptions, setTermOptions] = useState<any>([])
  const [accountOptions, setAccountOptions] = useState<any>([])
  const [locationOptions, setLocationOptions] = useState<any>([])
  const [processOptions, setProcessOptions] = useState<any>([])
  const [statusOptions, setStatusOptions] = useState<any>([])
  const [userOptions, setUserOptions] = useState<any>([])
  const [lineItemFieldColumns, setLineItemFieldColumns] = useState<any>([])

  const [mainFieldListOptions, setMainFieldListOptions] = useState<any>([])
  const [lineItemFieldListOptions, setLineItemFieldListOptions] = useState<any>([])

  const [documentDetailByIdData, setDocumentDetailByIdData] = useState<any>({})

  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const { id } = useParams()
  const rightBoxRef = useRef<any>(null)

  const billListsRef = useRef<HTMLDivElement>(null)

  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [rowIds, setRowIds] = useState<number[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isFileModal, setFileModal] = useState(false)
  const [isFileRecord, setIsFileRecord] = useState<any>({
    FileName: '',
    PageCount: '',
    BillNumber: '',
  })

  const [boxWidth, setBoxWidth] = useState(0)
  const [isHandleResize, setIsHandleResize] = useState<boolean>(false)
  const [mainFieldAmount, setMainFieldAmount] = useState<any>(null)

  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [processCheck, setProcessCheck] = useState<boolean>(false)
  const [processSelection, setProcessSelection] = useState<string>('1')
  const [billLists, setBillLists] = useState<any>([])

  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false)
  const [isApplyFilter, setIsApplyFilter] = useState<boolean>(false)

  const [formFields, setFormFields] = useState<{ [x: string]: string | number | null | any }>([])
  const [lineItemsFieldsData, setLineItemsFieldsData] = useState<EditBillPostingDataProps[]>([])

  const [imgUrl, setImgUrl] = useState<string>('')
  const [pdfUrl, setPDFUrl] = useState<string>('')

  const [isVisibleLeftSidebar, setIsVisibleLeftSidebar] = useState<boolean>(isVisibleSidebar)
  const [selectedBillItems, setSelectedBillItems] = useState<any>([])
  const [activeBill, setActiveBill] = useState(id)

  const [numberOfPages, setNumberOfPages] = useState<number | null>(null)

  const [fileBlob, setFileBlob] = useState<any>('')

  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)
  const [PDFUrlModal, setPDFModalUrl] = useState<any>('')

  const [isEndReached, setIsEndReached] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(1)

  const [apiDataCount, setApiDataCount] = useState(0)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpenInNewWindow, setOpenInNewWindow] = useState<boolean>(false)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)

  const [isNewWindowUpdate, setIsNewWindowUpdate] = useState(false)
  const [currentWindow, setCurrentWindow] = useState<any>(null)
  const [isFormFieldsChanged, setIsFormFieldsChanged] = useState<boolean>(false)

  const [isResetFilter, setIsResetFilter] = useState<boolean>(false)
  const [localFilterFormFields, setLocalFilterFormFields] = useState<BillPostingFilterFormFieldsProps>(filterFormFields)

  const router = useRouter()
  const dispatch = useAppDispatch()
  const userId = localStorage.getItem('UserId')
  const searchParams = useSearchParams()
  const checkActivityStatus = searchParams.get('activity') ?? false

  const lazyRows = 10

  const handleScroll = () => {
    const element = billListsRef.current
    if (element && element.scrollTop + element.clientHeight === element.scrollHeight && billLists.length < apiDataCount) {
      setIsEndReached(true)
    } else {
      setIsEndReached(false)
    }
  }

  const getCurrentBillDetails = async (keyValueMainFieldObj: any, keyValueLineItemFieldObj: any, vendorOptions: any, termOptions: any, accountOptions: any) => {
    try {
      const response = await agent.APIs.getDocumentDetails({
        Id: Number(activeBill as string),
        UserId: Number(userId as string),
        ApprovalType: 0,
      })
      if (response?.ResponseStatus === 'Success') {
        const responseData = response?.ResponseData
        setDocumentDetailByIdData(responseData)

        const { newLineItems, updatedDataObj } = await getViewUpdatedDataFromDetailsResponse(
          responseData,
          keyValueMainFieldObj,
          keyValueLineItemFieldObj,
          vendorOptions,
          termOptions,
          accountOptions
        )

        if (newLineItems.length === 0) {
          setMainFieldAmount(responseData?.Amount)
        }

        setLineItemsFieldsData(newLineItems)
        setFormFields(updatedDataObj)
        setIsFormFieldsChanged(true)

        await getPDFUrl(
          responseData?.FilePath,
          responseData?.FileName,
          setPDFUrl,
          setImgUrl,
          setFileBlob,
          setIsPdfLoading,
          isNewWindowUpdate,
          currentWindow,
          openInNewWindow,
          setIsNewWindowUpdate
        )
      }
    } catch (error) {
      Toast.error('Something Went Wrong!')
    }
  }

  useEffect(() => {
    if (activeBill) {
      const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
        mainFieldListOptions,
        lineItemFieldListOptions
      )
      getCurrentBillDetails(keyValueMainFieldObj, keyValueLineItemFieldObj, vendorOptions, termOptions, accountOptions)
    }
  }, [activeBill])

  const fetchFieldMappingData = async () => {
    setIsLoading(true)
    const {
      vendorOptions,
      termOptions,
      accountOptions,
      fieldMappingConfigurations,
      lineItemFieldColumns,
    } = await fetchAPIsData(processtype, AccountingTool as number, 'view', CompanyId as number)

    setVendorOptions(vendorOptions)
    setTermOptions(termOptions)
    setAccountOptions(accountOptions)
    setLineItemFieldColumns(lineItemFieldColumns)

    const mainFieldConfiguration = [
      ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration
    ]
    const lineItemConfiguration = [
      ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration
    ]

    const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
      mainFieldConfiguration,
      lineItemConfiguration
    )

    setMainFieldListOptions(mainFieldConfiguration)
    setLineItemFieldListOptions(lineItemConfiguration)

    if (activeBill) {
      getCurrentBillDetails(keyValueMainFieldObj, keyValueLineItemFieldObj, vendorOptions, termOptions, accountOptions)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (CompanyId) {
      fetchFieldMappingData()
    }
  }, [CompanyId])

  useEffect(() => {
    if (isFormFieldsChanged) {
      fetchFieldMappingData()
    }
  }, [isFormFieldsChanged])

  useEffect(() => {
    const updateBoxWidth = () => {
      if (rightBoxRef.current) {
        setBoxWidth(rightBoxRef.current.offsetWidth)
      }
    }

    setTimeout(() => {
      updateBoxWidth()
      window.addEventListener('resize', updateBoxWidth)

      return () => {
        window.removeEventListener('resize', updateBoxWidth)
      }
    }, 100)
  }, [rightBoxRef, isVisibleLeftSidebar, isLeftSidebarCollapsed, isHandleResize])

  useEffect(() => {
    selectedProcessTypeInList && setProcessSelection(selectedProcessTypeInList.toString())
  }, [selectedProcessTypeInList])

  const fetchBillsData = async (pageIndex?: number) => {
    const dateRangeVal = filterFormFields.ft_datepicker.split('to')
    let UserId
    switch (filterFormFields.ft_assignee) {
      case '1':
        UserId = userId
        break
      case '3':
        UserId = '0'
        break
      case '2':
        UserId = filterFormFields.ft_select_users.join(',')
        break
      default:
        UserId = null
        break
    }
    const params = {
      UserId: UserId,
      Status: filterFormFields.ft_status.join(',') ?? null,
      LocationIds:
        filterFormFields.ft_location && filterFormFields.ft_location.length > 0 ? filterFormFields.ft_location.join(',') : null,
      ProcessType: parseInt(selectedProcessTypeInList as string),
      VendorIds:
        filterFormFields.ft_vendor && filterFormFields.ft_vendor.length > 0 ? filterFormFields.ft_vendor.join(',') : null,
      StartDate: convertStringsDateToUTC(dateRangeVal[0].trim()) ?? null,
      EndDate: convertStringsDateToUTC(dateRangeVal[1].trim()) ?? null,
      SortColumn: 'CreatedOn',
      SortOrder: 1,
      PageNumber: pageIndex,
      PageSize: lazyRows,
    }

    try {
      const { payload, meta } = await dispatch(documentGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          if (processCheck && payload?.ResponseData?.List.length !== 0) {
            setProcessCheck(false)

            setCurrentPageIndex(pageIndex ?? 1)

            const responseData = payload?.ResponseData
            const newList = responseData?.List || []
            const newTotalCount = responseData?.ListCount || 0

            setApiDataCount(newTotalCount)

            let updatedData = []
            if (pageIndex === 1) {
              updatedData = [...newList]
              setShouldLoadMore(true)
            } else {
              updatedData = [...billLists, ...newList]
            }
            setBillLists(updatedData)
            setItemsLoaded(updatedData.length)

            setIsApplyFilter(false)
            setIsResetFilter(false)

            dispatch(setIsFormDocuments(payload?.ResponseData?.List[0].IsFromDocuments))
            router.push(`/bills/view/${payload?.ResponseData?.List[0].Id}`)
            return
          }
          if (processCheck && payload?.ResponseData?.List.length === 0) {
            setProcessCheck(false)
            let selectedProcess
            switch (parseInt(processSelection)) {
              case 1:
                selectedProcess = 'Accounts Payable'
                break
              case 2:
                selectedProcess = 'Accounts Adjustment'
                break
              case 3:
                selectedProcess = 'Other'
                break
              default:
                break
            }
            Toast.error(`No Record Found in process ${selectedProcess}`)
            router.push(`/bills`)
            return
          }

          setCurrentPageIndex(pageIndex ?? 1)

          const responseData = payload?.ResponseData
          const newList = responseData?.List || []
          const newTotalCount = responseData?.ListCount || 0

          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setShouldLoadMore(true)
          } else {
            updatedData = [...billLists, ...newList]
          }
          setBillLists(updatedData)
          setItemsLoaded(updatedData.length)
          setIsEndReached(false)

          setIsApplyFilter(false)
          setIsResetFilter(false)
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
    if (isApplyFilter) {
      fetchBillsData(1)
    }
  }, [isApplyFilter])

  useEffect(() => {
    if (isEndReached && !isLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
      fetchBillsData(currentPageIndex + 1)
    }
  }, [isEndReached])

  useEffect(() => {
    fetchBillsData(1)
  }, [processSelection])

  const handleApplyFilter = async () => {
    if (isResetFilter) {
      await dispatch(setFilterFormFields(initialBillPostingFilterFormFields))
      if (initialBillPostingFilterFormFields.ft_assignee === '2') {
        if (initialBillPostingFilterFormFields.ft_select_users.length === 0) {
          Toast.error('Please select at least one user.')
          return
        }
      }
      setIsApplyFilter(true)
      setIsOpenFilter(false)
      return
    }
    if (localFilterFormFields.ft_assignee === '2') {
      if (localFilterFormFields.ft_select_users.length === 0) {
        Toast.error('Please select at least one user.')
        return
      }
    }
    dispatch(
      setFilterFormFields({
        ...localFilterFormFields,
      })
    )
    setIsApplyFilter(true)
    setIsOpenFilter(false)
  }

  let totalAmount = totalAmountCalculate(lineItemsFieldsData)
  let taxTotalAmount = taxTotalAmountCalculate(lineItemsFieldsData)

  const formattedTotalAmountValue = String(getRoundValue(totalAmount).toFixed(2)).slice(0, 13)
  const formattedTotalTaxAmountValue = String(getRoundValue(taxTotalAmount).toFixed(2)).slice(0, 13)

  const onHandleForward = (activeBill: any) => {
    dispatch(setIsVisibleSidebar(isVisibleLeftSidebar))

    const index = billLists.findIndex((object: any) => {
      return object.Id == activeBill
    })

    const nextBillId = billLists.length === index + 1 ? billLists[0].Id : billLists[index + 1].Id
    const nextBillFormDocuments =
      billLists.length === index + 1 ? billLists[0].IsFromDocuments : billLists[index + 1].IsFromDocuments
    setActiveBill(nextBillId)
    setIsNewWindowUpdate(true)

    dispatch(setIsFormDocuments(nextBillFormDocuments))
    window.history.replaceState(null, '', `/bills/edit/${nextBillId}?module=bills`)
  }

  const onHandleBackword = (activeBill: any) => {
    dispatch(setIsVisibleSidebar(isVisibleLeftSidebar))

    const index = billLists.findIndex((object: any) => {
      return object.Id == activeBill
    })

    const previousBillId = index === 0 ? billLists[billLists.length - 1].Id : billLists[index - 1].Id
    const previousBillFormDocuments =
      index === 0 ? billLists[billLists.length - 1].IsFromDocuments : billLists[index - 1].IsFromDocuments
    setActiveBill(previousBillId)
    setIsNewWindowUpdate(true)

    dispatch(setIsFormDocuments(previousBillFormDocuments))
    window.history.replaceState(null, '', `/bills/edit/${previousBillId}?module=bills`)
  }

  const onChangeSelectedBillItem = (activeBill: any) => {
    dispatch(setIsVisibleSidebar(true))

    const activeBillObj = billLists.find((object: any) => {
      return object.Id == activeBill
    })

    setActiveBill(activeBillObj?.Id)
    setIsNewWindowUpdate(true)

    window.history.replaceState(null, '', `/bills/edit/${activeBillObj?.Id}?module=bills`)
  }

  const onToggleLeftSidebar = () => {
    setIsVisibleLeftSidebar(!isVisibleLeftSidebar)
  }

  const onSetNumberOfPages = (value: number) => {
    setNumberOfPages(value)
  }

  const handleProcessCheck = (value: any) => {
    setProcessCheck(value)
  }

  const handleResize = () => {
    setIsHandleResize((prev) => !prev)
  }

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')

    setTimeout(() => {
      if (newWindow && newWindow.document) {
        newWindow.document.title = fileName
      }
    }, 1000)

    setOpenInNewWindow(true)
    setCurrentWindow(newWindow)

    const intervalId = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(intervalId)
        setOpenInNewWindow(false)
        setCurrentWindow(null)
      }
    }, 500)
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

        setPDFModalUrl(url)
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

  if (Object.keys(formFields).length === 0) return null

  return (
    <ViewReportWrapper
      billLists={billLists}
      processSelectionOptions={processOptions}
      processSelection={processSelection}
      setProcessSelection={setProcessSelection}
      filterFormFields={filterFormFields}
      handleApplyFilter={handleApplyFilter}
      isOpenFilter={isOpenFilter}
      setIsOpenFilter={setIsOpenFilter}
      lineItemsFieldsData={lineItemsFieldsData}
      isVisibleLeftSidebar={isVisibleLeftSidebar}
      documentDetailByIdData={documentDetailByIdData}
      handleForward={onHandleForward}
      handleBackword={onHandleBackword}
      selectedBillItems={selectedBillItems}
      setSelectedBillItems={setSelectedBillItems}
      activeBill={activeBill}
      onChangeSelectedBillItem={onChangeSelectedBillItem}
      pdfUrl={pdfUrl}
      statusSelectionOptions={statusOptions}
      locationOptions={locationOptions}
      userOptions={userOptions}
      vendorOptions={vendorOptions}
      handleProcessCheck={handleProcessCheck}
      totalAmount={totalAmount}
      isMainFieldConfiguration={mainFieldListOptions}
      setIsResetFilter={setIsResetFilter}
      localFilterFormFields={localFilterFormFields}
      setLocalFilterFormFields={setLocalFilterFormFields}
      billListsRef={billListsRef}
      handleScroll={handleScroll}
      setIsVisibleLeftSidebar={(value: boolean) => setIsVisibleLeftSidebar(value)}
      isLoading={isLoading}
    >
      {
        isLoading || !isFormFieldsChanged ? (
          <div className='flex h-full w-full items-center justify-center'>
            <Loader size='md' helperText />
          </div>
        ) : (
          <div className='mb-5 border-solid border-[#D8D8D8] md:flex'>
            <div className='flex h-full w-full pt-5'>
              {!isOpenInNewWindow && (
                <Resizable
                  className='border-r-2 border-[#888] pr-2'
                  minWidth={'20%'}
                  maxWidth={'70%'}
                  enable={{
                    top: false,
                    right: true,
                    bottom: false,
                    left: false,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: false,
                    topLeft: false,
                  }}
                  onResize={handleResize}
                  defaultSize={{
                    width: '50%',
                    height: '100%',
                  }}
                >
                  <span className='pl-5 text-[16px] font-bold font-proxima tracking-[0.02em]'>Document</span>
                  <div className='group relative mt-[15px] border-b border-r border-t border-[#D8D8D8]'>
                    {!documentDetailByIdData?.FilePath ? (
                      <span className='flex h-[100vh] w-full items-center justify-center border-r border-lightSilver'>
                        <ImageIcon />
                      </span>
                    ) : (
                      <>
                        {imgUrl !== '' ? (
                          <img src={`${imgUrl}`} alt='abc' className='h-[100vh]' />
                        ) : (
                          <PDFViewer
                            key={isVisibleLeftSidebar + ""}
                            isVisibleLeftSidebar={isVisibleLeftSidebar}
                            pdfFile={pdfUrl}
                            onOpen={() => setIsOpenDrawer(true)}
                            heightClass='h-[100vh]'
                            defaultScale={isVisibleLeftSidebar ? 0.6 : 0.8}
                            documentDetailByIdData={documentDetailByIdData}
                            billNumber={
                              Array.isArray(id)
                                ? id
                                  .map((value) => billLists.find((item: any) => item.Id === parseInt(value))?.BillNumber || '')
                                  .join(', ')
                                : billLists.find((value: any) => value.Id === parseInt(id))?.BillNumber || ''
                            }
                            getNumberOfPages={onSetNumberOfPages}
                            fileName={documentDetailByIdData?.FileName}
                            fileBlob={fileBlob}
                            isPdfLoading={isPdfLoading}
                            openInNewWindow={openInNewWindow}
                          />
                        )}
                      </>
                    )}

                    <SplitDrawer
                      billNumber={documentDetailByIdData?.BillNumber}
                      numberOfPages={numberOfPages}
                      fileName={documentDetailByIdData?.FileName}
                      id={id}
                      pdfFile={pdfUrl}
                      onOpen={isOpenDrawer}
                      onClose={() => setIsOpenDrawer(false)}
                      fileBlob={fileBlob}
                    />
                    {processSelection !== '4' && !checkActivityStatus && (
                      <div
                        className={`absolute left-0 top-[50%] z-[4] translate-y-1/2 cursor-pointer rounded-r-md bg-[#E6E6E6] px-2 py-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                        onClick={onToggleLeftSidebar}
                      >
                        {isVisibleLeftSidebar ? <LeftDoubleArrowIcon /> : <RightDoubleArrowIcon />}
                      </div>
                    )}
                  </div>
                </Resizable>
              )}
              <div className='ml-[34px] mr-[11px] w-full flex-grow overflow-auto'>
                <span className='text-[16px] font-bold font-proxima tracking-[0.02em]'>Document edited</span>

                <div ref={rightBoxRef} className='mt-[15px] flex h-auto flex-col overflow-hidden border border-[#D8D8D8]'>
                  <div className='flex border-b border-[#D8D8D8] px-5 py-[14px]'>
                    <div className='!py-0 !pl-0 !pr-1 !font-proxima !text-[14px]'>
                      <span className='text-[16px] font-proxima tracking-[0.02em]'>BILL INFO : </span>
                      <span className='break-all pl-[18px] text-[16px] font-bold font-proxima tracking-[0.02em]'>{documentDetailByIdData?.BillNumber}</span>
                    </div>
                  </div>

                  <div className='custom-scroll h-[92vh] w-full overflow-auto '>
                    <div className='view_mainFields grid grid-cols-2 px-5 py-2'>
                      {Object.entries(formFields).map(([key, value], index) => {
                        const fieldLabel = mainFieldListOptions?.find((item: any) => item?.Name === key)?.Label ?? ''

                        return <div key={key} className='py-3'>
                          <div className={`text-sm text-darkCharcoal font-proxima tracking-[0.02em] ${key == "attachment" ? `flex ${(index === 0 || (index % 2 === 0)) ? 'justify-start' : 'justify-end'}` : ""}`}>
                            {fieldLabel ? fieldLabel : key} : {key == "attachment" ? (
                              <div className='relative flex items-center'>
                                {value !== null && (
                                  <>
                                    <span className='absolute -top-3 left-2'>
                                      <Badge badgetype='error' variant='dot' text={value.length.toString()} />
                                    </span>
                                    <span className='cursor-pointer' onClick={() => handleOpenAttachFile(value?.Id)}>
                                      <AttachIcon />
                                    </span>

                                    {isOpenAttchFile && value?.Id === rowIds[0] && (
                                      <div
                                        ref={dropdownRef}
                                        className={`absolute ${(index === 0 || (index % 2 === 0)) ? '-left-10' : 'right-0'} top-6 !z-[99] flex w-[400px] flex-col rounded-md border border-[#cccccc] bg-white p-5 shadow-md`}
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
                                                    onClick={async () => {
                                                      await getPDFUrl(
                                                        d.FilePath,
                                                        d.FileName,
                                                        setPDFModalUrl,
                                                        setImgUrl,
                                                        (fileBlob: Blob) => {
                                                          openInNewWindow(fileBlob, d.FilePath);
                                                        },
                                                        () => { },
                                                        isNewWindowUpdate,
                                                        currentWindow,
                                                        openInNewWindow,
                                                        setIsNewWindowUpdate
                                                      );
                                                      setIsFileRecord({
                                                        FileName: d.FileName,
                                                        PageCount: d.PageCount,
                                                        BillNumber: value?.BillNumber,
                                                      })
                                                      // setOpenAttachFile(false)
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
                              </div>
                            ) : value}
                          </div>
                        </div>
                      })}
                    </div>

                    {lineItemsFieldsData && lineItemsFieldsData.length > 0 && (
                      <div className={`custom-scroll !z-0 overflow-auto w-full`}>
                        <DataTable
                          getExpandableData={() => { }}
                          columns={lineItemFieldColumns}
                          data={lineItemsFieldsData}
                          sticky
                          hoverEffect
                          isTableLayoutFixed={true}
                          userClass='!z-0'
                          getRowId={() => { }}
                        />
                      </div>
                    )}

                    <div className='flex flex-col items-end px-5 pb-[40px] pt-[30px]'>
                      <div className='mb-2 flex w-60 flex-row justify-between'>
                        <span className='text-sm font-proxima tracking-[0.02em]'>Sub Total</span>
                        <span className='min-w-[20%] text-end text-sm font-semibold font-proxima tracking-[0.02em]'>
                          {
                            lineItemsFieldsData?.length > 0
                              ? !lineItemsFieldsData?.[0]?.amount
                                ? '$' + mainFieldAmount?.toFixed(2)?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                : '$' + (formattedTotalAmountValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                              : '$' + mainFieldAmount
                          }
                          {/* ${formattedTotalAmountValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} */}
                        </span>
                      </div>
                      {AccountingTool === 3 && (
                        <div className='mb-2 flex w-60 flex-row justify-between'>
                          <span className='text-sm font-proxima tracking-[0.02em]'>Tax Total</span>
                          <span className='w-[20%] text-end text-sm font-semibold font-proxima tracking-[0.02em]'>${formattedTotalTaxAmountValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                        </div>
                      )}
                      <div className='mb-2 flex w-60 flex-row justify-between'>
                        <span className={`text-sm font-proxima tracking-[0.02em]`}>Total Amount</span>
                        <span className='min-w-[20%] text-end text-sm font-semibold font-proxima tracking-[0.02em]'>
                          {
                            lineItemsFieldsData?.length > 0
                              ? !lineItemsFieldsData?.[0]?.amount
                                ? '$' + mainFieldAmount?.toFixed(2)?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                : '$' + (formattedTotalAmountValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                              : '$' + mainFieldAmount
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      {isFileModal && ['pdf'].includes(isFileRecord.FileName.split('.').pop().toLowerCase()) && (
        <FileModal
          isFileRecord={isFileRecord}
          setIsFileRecord={setIsFileRecord}
          PDFUrl={PDFUrlModal}
          isOpenDrawer={isOpenDrawer}
          setPDFUrl={(value: any) => setPDFModalUrl(value)}
          setIsOpenDrawer={(value: boolean) => setIsOpenDrawer(value)}
          setFileModal={(value: boolean) => setFileModal(value)}
          fileBlob={fileBlob}
          isPdfLoading={isPdfLoading}
          openInNewWindow={openInNewWindow}
        />
      )}
    </ViewReportWrapper>
  )
}

export default ViewReportBill