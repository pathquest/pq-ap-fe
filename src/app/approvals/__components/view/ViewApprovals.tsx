/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import agent from '@/api/axios'
import ApprovalModal from '@/app/approvals/__components/ApprovalModal'
import SplitDrawer from '@/app/bills/__components/SplitDrawer'
import AcceptIcon from '@/assets/Icons/AcceptIcon'
import ChevronLeftIcon from '@/assets/Icons/ChevronLeftIcon'
import ReassignIcon from '@/assets/Icons/ReassignIcon'
import RejectIcon from '@/assets/Icons/RejectIcon'
import ActivityIcon from '@/assets/Icons/billposting/ActivityIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import { EditBillPostingDataProps } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { billReAssign, billsApproval, setApprovalDropdownFields } from '@/store/features/billApproval/approvalSlice'
import { companyAssignUser } from '@/store/features/company/companySlice'
import { getPDFUrl, getRoundValue, getViewUpdatedDataFromDetailsResponse, returnKeyValueObjForFormFields, totalAmountCalculate } from '@/utils/billposting'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { Badge, DataTable, Loader, Select, Textarea, Toast, BasicTooltip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'
import ViewApprovalsWrapper from './ViewApprovalsWrapper'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import { BlobServiceClient } from '@azure/storage-blob'
import FileModal from '@/app/bills/__components/FileModal'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { useSession } from 'next-auth/react'
import { fetchAPIsData } from '@/api/server/common'
import { storageConfig } from '@/components/Common/pdfviewer/config'
import ImageIcon from '@/assets/Icons/ImageIcon'
import { Resizable } from 're-resizable'
import { formatFileSize } from '@/components/Common/Functions/FormatFileSize'

const PDFViewer = dynamic(() => import('@/app/bills/__components/PDFViewer'), {
  ssr: false,
})

const ViewApprovals = ({ processtype }: any) => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const AccountingTool = session?.user?.AccountingTool

  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [termOptions, setTermOptions] = useState<any>([])
  const [accountOptions, setAccountOptions] = useState<any>([])
  const [lineItemFieldColumns, setLineItemFieldColumns] = useState<any>([])

  const [mainFieldListOptions, setMainFieldListOptions] = useState<any>([])
  const [lineItemFieldListOptions, setLineItemFieldListOptions] = useState<any>([])

  const { approvalDropdownFields } = useAppSelector((state) => state.billApproval)

  const [documentDetailByIdData, setDocumentDetailByIdData] = useState<any>({})

  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
  const { id } = useParams()
  const rightBoxRef = useRef<any>(null)

  const [boxWidth, setBoxWidth] = useState(0)

  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)

  const [formFields, setFormFields] = useState<{ [x: string]: string | number | null | any }>([])
  const [isFormFieldsChanged, setIsFormFieldsChanged] = useState<boolean>(false)
  const [lineItemsFieldsData, setLineItemsFieldsData] = useState<EditBillPostingDataProps[]>([])

  const [imgUrl, setImgUrl] = useState<string>('')
  const [pdfUrl, setPDFUrl] = useState<string>('')

  const [numberOfPages, setNumberOfPages] = useState<number | null>(null)

  const [fileBlob, setFileBlob] = useState<any>('')
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)

  const [isNewWindowUpdate, setIsNewWindowUpdate] = useState(false)
  const [currentWindow, setCurrentWindow] = useState<any>(null)

  const [isApprovalModal, setIsApprovalModal] = useState<boolean>(false)
  const [isReassignModal, setIsReassignModal] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('')
  const [reAssignReason, setReAssignReason] = useState<string>('')
  const [selectedAssignee, setSelectedAssignee] = useState<number>(0)
  const [reasonError, setReasonError] = useState<boolean>(false)
  const [reasonHasError, setReasonHasError] = useState<boolean>(false)
  const [reAssignReasonError, setReAssignReasonError] = useState<boolean>(false)
  const [reAssigneeDropError, setReAssigneeDropError] = useState<boolean>(false)
  const [isRejectedBill, setIsRejectedBill] = useState<boolean>(false)
  const [assignee, setAssignee] = useState<OptionType[]>([])
  const [reAssignReasonHasError, setReAssignReasonHasError] = useState<boolean>(false)
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isHandleResize, setIsHandleResize] = useState<boolean>(false)

  const [PDFUrlModal, setPDFModalUrl] = useState<any>('')
  const [isOpenAttchFile, setOpenAttachFile] = useState<boolean>(false)
  const [rowIds, setRowIds] = useState<number[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isFileModal, setFileModal] = useState(false)
  const [isFileRecord, setIsFileRecord] = useState<any>({
    FileName: '',
    PageCount: '',
    BillNumber: '',
  })

  const Approvar = documentDetailByIdData.BillApprovar
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userId = localStorage.getItem('UserId')
  const batchId = localStorage.getItem('BatchId')

  const getCurrentBillDetails = async (keyValueMainFieldObj: any, keyValueLineItemFieldObj: any) => {
    try {
      const response = await agent.APIs.getDocumentDetails({
        Id: Number(id as string),
        ApprovalType: Number(approvalDropdownFields),
        UserId: Number(userId),
      })
      if (response?.ResponseStatus === 'Success') {
        const responseData = response?.ResponseData
        setDocumentDetailByIdData(responseData)

        const { newLineItems, updatedDataObj } = getViewUpdatedDataFromDetailsResponse(
          responseData,
          keyValueMainFieldObj,
          keyValueLineItemFieldObj,
          vendorOptions,
          termOptions,
          accountOptions
        )

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

    if (id) {
      getCurrentBillDetails(keyValueMainFieldObj, keyValueLineItemFieldObj)
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
  }, [rightBoxRef, isLeftSidebarCollapsed, isHandleResize])

  let totalAmount = totalAmountCalculate(lineItemsFieldsData)
  const formattedTotalAmountValue = String(getRoundValue(totalAmount)).slice(0, 13)

  const onSetNumberOfPages = (value: number) => {
    setNumberOfPages(value)
  }

  const handleClose = () => {
    dispatch(setApprovalDropdownFields(approvalDropdownFields === '1' ? '1' : approvalDropdownFields === '2' ? '2' : '1'))
    router.push('/approvals')
  }

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

  const handleAssignDropDown = () => {
    const params = {
      CompanyId: Number(id),
    }
    performApiAction(dispatch, companyAssignUser, params, (responseData: any) => {
      let userId = localStorage.getItem('UserId')
      let data = responseData || []

      // Check if userId exists in responseData
      let filteredResponseData = data.filter((data: any) => data.value !== userId)

      // Set assignee with filtered data or direct data
      setAssignee(filteredResponseData.length > 0 ? filteredResponseData : data)
    })
  }

  // For Approve and reject bill
  const billApproval = (status: number) => {
    const ids = [id]
      ; (reason.trim().length <= 0 || reason.trim().length > 150) && setReasonError(true)

    const approvalDetailList = [{
      Ids: documentDetailByIdData.Id ?? 0,
      BatchId: Number(batchId) ?? 0
    }];

    if ((status === 2 && !(reason.trim().length <= 0 || !reasonHasError)) || status === 1) {
      const params = {
        ApprovalDetailList: approvalDetailList,
        // Ids: ids.map((id) => Number(id)),
        StatusId: status, // Pending = 0,Approved = 1,Rejected = 2,Reasigned = 3 -- only for backend,
        Remark: status === 1 ? null : reason,
      }
      performApiAction(dispatch, billsApproval, params, () => {
        setIsApprovalModal(false)
        clearAll()
        localStorage.removeItem('BatchId')
        Toast.success(
          `Bill No.${documentDetailByIdData?.BillNumber} ${status == 1 ? 'Approved!' : 'Rejected!'}`
        )
        router.push('/approvals')
      })
    }
  }

  // Re-Assign handle Submit
  const reassign = () => {
    const ids = [id]
    selectedAssignee <= 0 && setReAssigneeDropError(true)
      ; (reAssignReason.trim().length === 0 || reAssignReason.trim().length > 150) && setReAssignReasonError(true)
    if (selectedAssignee > 0 && reAssignReason.trim().length > 0 && reAssignReasonHasError) {
      const params = {
        Ids: ids.map((id) => Number(id)),
        AssigneeId: `${selectedAssignee}`, // Pending = 0,Approved = 1,Rejected = 2,Reasigned = 3 -- only for backend,
        Remark: reAssignReason,
      }
      performApiAction(dispatch, billReAssign, params, () => {
        setIsApprovalModal(false)
        clearAll()
        Toast.success(`Bill No.${documentDetailByIdData?.BillNumber} Re-assigned!`)
        router.push('/approvals')
      })
    }
  }

  const clearAll = () => {
    setReason('')
    setReAssignReason('')
    setSelectedAssignee(0)
    setReasonError(false)
    setReAssignReasonError(false)
    setReAssigneeDropError(false)
    setIsRejectedBill(false)
    setIsReassignModal(false)
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

  const handleOpenAttachFile = (Id: number) => {
    setOpenAttachFile(!isOpenAttchFile)
    setRowIds([Id])
  }

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

  const handleResize = () => {
    setIsHandleResize((prev) => !prev)
  }

  return (
    <ViewApprovalsWrapper>
      <div className='sticky  top-0 z-[6] flex h-[50px] items-center justify-between bg-whiteSmoke'>
        <div className='mx-3 flex cursor-pointer place-content-center' onClick={handleClose}>
          <ChevronLeftIcon bgColor='white' />
        </div>
        {Number(documentDetailByIdData?.BillApprovalStatus) === 0 && Approvar?.includes(Number(userId)) ? (
          <ul className={`visible} flex items-center gap-[15px] pr-[30px]`}>
            <li onClick={() => setOpenDrawer(true)}>
              <BasicTooltip position='bottom' content='Activities' className='!font-proxima !text-[14px]'>
                <ActivityIcon />
              </BasicTooltip>
            </li>
            <li>
              <BasicTooltip position='bottom' content='Approve' className='!z-9'>
                <div
                  onClick={() => {
                    setIsApprovalModal(true)
                  }}
                >
                  <AcceptIcon />
                </div>
              </BasicTooltip>
            </li>
            <li>
              <BasicTooltip position='bottom' content='Reject' className='!z-9'>
                <div
                  onClick={() => {
                    setIsRejectedBill(true)
                  }}
                >
                  <RejectIcon />
                </div>
              </BasicTooltip>
            </li>
            <li>
              <BasicTooltip position='bottom' content='Re-assign' className='!z-9'>
                <div
                  onClick={() => {
                    setIsReassignModal(true)
                    handleAssignDropDown()
                  }}
                >
                  <ReassignIcon />
                </div>
              </BasicTooltip>
            </li>
          </ul>
        ) : (
          <div className='pr-4' onClick={() => setOpenDrawer(true)}>
            <BasicTooltip position='left' content='Activities' className='!font-proxima !text-[14px]'>
              <ActivityIcon />
            </BasicTooltip>
          </div>
        )}
      </div>
      {
        isLoading || !isFormFieldsChanged ? (
          <div className='flex h-full w-full items-center justify-center'>
            <Loader size='md' helperText />
          </div>
        ) : (
          <div className='mb-5 border-solid border-lightSilver md:flex'>
            <div className='flex h-full w-full pt-5'>
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
                <div className='group relative mt-[15px] border-b border-r border-t border-lightSilver'>
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
                          billNumber={documentDetailByIdData?.BillNumber}
                          fileName={documentDetailByIdData?.FileName}
                          pdfFile={pdfUrl}
                          onOpen={() => setIsOpenDrawer(true)}
                          // heightClass='h-[580px]'
                          heightClass='h-[100vh]'
                          documentDetailByIdData={documentDetailByIdData}
                          isSplitVisible={false}
                          getNumberOfPages={onSetNumberOfPages}
                          fileBlob={fileBlob}
                          isPdfLoading={isPdfLoading}
                          openInNewWindow={openInNewWindow}
                        />
                      )}
                    </>
                  )}

                  <SplitDrawer
                    numberOfPages={numberOfPages}
                    fileName={documentDetailByIdData?.FileName}
                    id={id}
                    pdfFile={pdfUrl}
                    onOpen={isOpenDrawer}
                    onClose={() => setIsOpenDrawer(false)}
                    fileBlob={fileBlob}
                  />
                </div>
              </Resizable>
              <div className='ml-[34px] mr-[11px] w-full flex-grow overflow-auto'>
                <span className='text-[16px] font-bold font-proxima tracking-[0.02em]'>Document edited</span>

                <div ref={rightBoxRef} className='mt-[15px] flex h-auto flex-col overflow-hidden border border-lightSilver'>
                  <div className='flex border-b border-lightSilver px-5 py-[14px]'>
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
                          <div className={`text-sm text-darkCharcoal font-proxima tracking-[0.02em] ${(key == "attachment" || key == "Attachment") ? `flex ${(index === 0 || (index % 2 === 0)) ? 'justify-start' : 'justify-end'}` : ""}`}>
                            {fieldLabel ? fieldLabel : key} : {key == "attachment" || key == "Attachment" ? (
                              <div className='relative flex items-center'>
                                {value !== null && (
                                  <>
                                    <span className='absolute -top-[11px] left-[5px]'>
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
                        <span className='min-w-[20%] text-end text-sm font-semibold font-proxima tracking-[0.02em]'>${Number(formattedTotalAmountValue).toFixed(2)}</span>
                      </div>
                      <div className='mb-2 flex w-60 flex-row justify-between'>
                        <span className={`text-sm font-proxima tracking-[0.02em]`}>Total Amount</span>
                        <span className='min-w-[20%] text-end text-sm font-semibold font-proxima tracking-[0.02em]'>${Number(formattedTotalAmountValue).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Acticity Drawer */}
      <ActivityDrawer
        noCommentBox={true}
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        GUID={documentDetailByIdData?.GUID}
        selectedPayableId={parseInt(id as string)}
      />

      {/* ApprovedBill */}
      <ApprovalModal
        onOpen={isApprovalModal}
        onClose={() => setIsApprovalModal(false)}
        handleSubmit={() => {
          billApproval(1)
        }}
        modalTitle='Approve'
        modalContent={
          <>
            <p className='text-[16px]'>Are you sure you want to approve this bill ?</p>
          </>
        }
        actionName='Yes'
      />

      {/* reject modal */}
      <ApprovalModal
        onOpen={isRejectedBill}
        onClose={() => clearAll()}
        handleSubmit={() => {
          billApproval(2)
        }}
        modalTitle='Reject'
        modalContent={
          <>
            <Textarea
              maxChar={150}
              id='rejected'
              label='Add reason'
              validate
              getValue={(value) => setReason(value)}
              getError={(e) => {
                setReasonHasError(e)
              }}
              hasError={reasonError}
              rows={5}
              placeholder='Please enter the reason for rejecting this bill.'
            ></Textarea>
          </>
        }
      />

      {/* Reassign modal */}
      <ApprovalModal
        onOpen={isReassignModal}
        onClose={() => clearAll()}
        handleSubmit={() => {
          reassign()
        }}
        modalTitle='Re-assign'
        modalContent={
          <>
            <Select
              id={'assignee'}
              label='Select Assignee'
              options={assignee}
              defaultValue={selectedAssignee}
              value={selectedAssignee}
              getValue={(value) => {
                setReAssigneeDropError(false)
                setSelectedAssignee(value)
              }}
              getError={(e) => { }}
              hasError={reAssigneeDropError}
              validate
            />
            <div className='pt-5'>
              <Textarea
                maxChar={150}
                id='reason'
                label='Add Reason'
                validate
                getValue={(value) => setReAssignReason(value)}
                getError={(e) => {
                  setReAssignReasonHasError(e)
                }}
                hasError={reAssignReasonError}
                rows={5}
                placeholder='Enter the Re-assign Reason'
              ></Textarea>
            </div>
          </>
        }
      />

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

      <DrawerOverlay isOpen={openDrawer} />
    </ViewApprovalsWrapper>
  )
}

export default ViewApprovals
