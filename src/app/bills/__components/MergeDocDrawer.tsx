import agent from '@/api/axios'
import SplitDrawer from '@/app/bills/__components/SplitDrawer'
import CloseIcon from '@/assets/Icons/billposting/ActivityDrawer/CloseIcon'
import MergeIcon from '@/assets/Icons/billposting/MergeIcon'
import UnionIcon from '@/assets/Icons/billposting/mode/UnionIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { MergeDocDrawerProps } from '@/models/billPosting'
import { useAppSelector } from '@/store/configureStore'
import { BlobServiceClient } from '@azure/storage-blob'
import { useRouter } from 'next/navigation'
import { Button, Close, Text, Toast, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import PDFViewer from './PDFViewer'
import { storageConfig } from '@/components/Common/pdfviewer/config'

function MergeDocDrawer({ isOpen, onClose, selectedBillItems, removeItem, billLists }: MergeDocDrawerProps) {
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [isLoader, setIsLoader] = useState<boolean>(false)
  const [nameOfTheMergeDocument, setNameOfTheMergeDocument] = useState<string>('')
  const [newPDFUrl, setNewPDFUrl] = useState<string>('')
  const [mergedocTableData, setMergedocTableData] = useState<any[]>([])

  const [hasNameFieldErrors, setHasNameFieldErrors] = useState<boolean>(false)

  const [fileBlob, setFileBlob] = useState<any>('')
  const [pdfFileName, setPDFFileName] = useState('')
  const [billNumber, setBillNumber] = useState('')
  const [numberOfPages, setNumberOfPages] = useState<number | null>(null)
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)

  const router = useRouter()

  const { selectedCompany } = useAppSelector((state) => state.user)
  const CompanyId = selectedCompany?.value

  const showPDFViewer = async (path: any) => {
    setIsPdfLoading(true)
    if (path) {
      const storageAccount = storageConfig.storageAccount
      const containerName: any = storageConfig.containerName
      const sasToken = storageConfig.sassToken

      const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`)
      const containerClient = blobServiceClient.getContainerClient(containerName)
      const blockBlobClient = containerClient?.getBlockBlobClient(path)
      try {
        const downloadBlockBlobResponse = await blockBlobClient.download(0)

        if (downloadBlockBlobResponse.blobBody) {
          const blob = await downloadBlockBlobResponse.blobBody
          const url = URL.createObjectURL(blob)
          setNewPDFUrl(url)
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
  }

  const handleFileOpen = async (Id: any) => {
    const bill = billLists.filter((value: any) => (value.Id === Id ? value : null))
    if (!bill[0]?.FilePath.includes(`Documents/${parseInt(CompanyId)}/`)) {
      showPDFViewer(`Documents/${parseInt(CompanyId)}/${bill[0]?.FilePath}`)
      setPDFFileName(bill[0]?.FileName)
      setBillNumber(bill[0]?.BillNumber)
    } else {
      showPDFViewer(`${bill[0]?.FilePath}`)
      setPDFFileName(bill[0]?.FileName)
      setBillNumber(bill[0]?.BillNumber)
    }
  }

  useEffect(() => {
    const mergedoc_table_Data = selectedBillItems?.map((item: any) => {
      const itemObj = billLists.find((b: any) => b.Id === parseInt(item))

      return {
        IsFromDocuments: itemObj?.IsFromDocuments,
        id: itemObj?.Id,
        filename: itemObj?.FileName,
        no_of_pages: itemObj?.PageCount,
      }
    })
    setMergedocTableData(mergedoc_table_Data)
  }, [selectedBillItems, billLists])

  useEffect(() => {
    const billRow = billLists?.filter((value: any) =>
      mergedocTableData[0]?.id?.toString() === value?.Id?.toString() ? value : null
    )
    if (!billRow?.[0]?.FilePath?.includes(`Documents/${parseInt(CompanyId)}/`)) {
      showPDFViewer(`Documents/${parseInt(CompanyId)}/${billRow?.[0]?.FilePath}`)
    } else {
      showPDFViewer(`${billRow?.[0]?.FilePath}`)
    }
  }, [mergedocTableData])

  const onMergeDocument = async () => {
    setIsLoader(true)

    const params = {
      Ids: mergedocTableData.map((id) => id?.id),
      FileName: nameOfTheMergeDocument.endsWith('.pdf') ? nameOfTheMergeDocument : nameOfTheMergeDocument + '.pdf',
    }

    if (nameOfTheMergeDocument.trim().length === 0) {
      setIsLoader(false)
      setHasNameFieldErrors(true)
    }

    if (nameOfTheMergeDocument.trim().length !== 0 && selectedBillItems.length > 1) {
      try {
        const response = await agent.APIs.mergeDocuments(params)
        if (response?.ResponseStatus === 'Success') {
          // const responseOcr = await agent.APIs.getocrDocument()

          // if (responseOcr?.ResponseStatus === 'Success') {
            setIsLoader(false)
            setNameOfTheMergeDocument('')
            Toast.success('Documents Merged!')
            router.push('/bills')
          // }
        }
      } catch (error) {
        setIsLoader(false)
        Toast.error('Something Went Wrong!')
      }
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(mergedocTableData)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setMergedocTableData(items)
  }

  const onSetNumberOfPages = (value: number) => {
    setNumberOfPages(value)
  }

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
    <>
      <div
        className={`fixed bottom-0 right-0 top-0 z-50  flex h-screen w-[1100px] flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-white transition-transform duration-300 ease-in-out`}
      >
        <div className='z-50 h-full w-full bg-white'>
          <div className='flex items-center justify-between border-b-[1px] border-[#D8D8D8] p-[15px]'>
            <div className='flex flex-col'>
              <span className=''>
                <Typography className='!text-[18px] !font-bold !tracking-[0.02em] !text-darkCharcoal'>Merged Document</Typography>
              </span>
            </div>
            <div
              onClick={() => {
                onClose(false)
                setNameOfTheMergeDocument('')
                setHasNameFieldErrors(false)
              }}
            >
              <Close variant='medium' />
            </div>
          </div>
          <div className='flex h-[90vh] w-full p-6'>
            <div className='w-[740px] bg-gray-200 p-5'>
              <PDFViewer
                pdfFile={newPDFUrl}
                getNumberOfPages={onSetNumberOfPages}
                onOpen={() => setIsOpenDrawer(true)}
                isSplitDrawer
                billNumber={billNumber}
                fileName={pdfFileName}
                fileBlob={fileBlob}
                isPdfLoading={isPdfLoading}
                openInNewWindow={openInNewWindow}
              />
              <SplitDrawer
                billNumber={billNumber}
                numberOfPages={numberOfPages}
                pdfFile={newPDFUrl}
                onOpen={isOpenDrawer}
                onClose={() => setIsOpenDrawer(false)}
                fileName={pdfFileName}
                fileBlob={fileBlob}
              />
            </div>
            <div className='ml-4 flex w-[300px] flex-col'>
              <div className='pb-4'>
                <Text
                  type='text'
                  label='Name of Merged Document'
                  validate
                  id='text'
                  name='text'
                  max={20}
                  value={nameOfTheMergeDocument ?? ''}
                  placeholder='Please enter name'
                  getValue={(value) => setNameOfTheMergeDocument(value)}
                  getError={(value) => { }}
                  hasError={hasNameFieldErrors}
                />
              </div>
              <div className='flex h-[100vh] flex-col justify-between'>
                <div className='flex flex-col justify-start'>
                  <div className='flex h-12 w-full items-center justify-between border-b border-t border-[#000000] p-2 text-[14px] font-bold uppercase'>
                    <span>File Name</span>
                    <span>No Of Pages</span>
                  </div>
                  <div className='custom-scroll-PDF vertical-scroll !max-h-[55vh] overflow-scroll'>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId='droppable'>
                        {(provided) => (
                          <ul {...provided.droppableProps} ref={provided.innerRef} className='overflow-auto'>
                            {mergedocTableData?.map((item, index) => (
                              <Draggable key={item?.id} draggableId={item?.id?.toString()} index={index}>
                                {(provided) => (
                                  <li
                                    className='flex  h-12 items-center border-b border-[#E6E6E6] p-2 text-[14px]'
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div className='flex w-full justify-between p-2'>
                                      <div className='flex items-center'>
                                        <span>
                                          <UnionIcon />
                                        </span>
                                        <span
                                          className='w-32 cursor-pointer truncate pl-2'
                                          title={item.filename}
                                          onClick={() => handleFileOpen(item.id)}
                                        >
                                          {item.filename}
                                        </span>
                                      </div>
                                      <div className='flex justify-center'>
                                        <Typography>{item.no_of_pages} &nbsp;</Typography>
                                        {selectedBillItems.length > 2 && (
                                          <span className='cursor-pointer' onClick={() => removeItem(item.id)}>
                                            <Tooltip
                                              position='left'
                                              content='Remove'
                                              className='!z-10 !p-0 !font-proxima !text-[14px]'
                                            >
                                              <CloseIcon width={20} height={20} />
                                            </Tooltip>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>

                <Button variant='btn-primary' className='btn-md rounded-full' onClick={onMergeDocument}>
                  <div className={`flex w-full items-center justify-center`}>
                    {isLoader ? (
                      <div className='mx-2 animate-spin '>
                        <SpinnerIcon bgColor='#FFF' />
                      </div>
                    ) : (
                      <>
                        <div className='mx-1'>
                          <MergeIcon color='#FFFFFF' />
                        </div>
                        <Typography type='h6' className='!text-[14px] !font-bold'>
                          MERGE DOCUMENT
                        </Typography>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MergeDocDrawer
