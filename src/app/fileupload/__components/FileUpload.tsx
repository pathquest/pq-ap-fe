'use client'

import React, { lazy, useEffect, useRef, useState } from 'react'

//library components import
import { Button, Close, DataTable, ProgressBar, Select, Toast, Tooltip, Typography } from 'pq-ap-lib'

//Extra Component
import agent from '@/api/axios'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { Option } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { useSession } from 'next-auth/react'

//Icons imports
const CsvIcon = lazy(() => import('@/assets/Icons/fileUpload/CsvIcon'))
const DocIcon = lazy(() => import('@/assets/Icons/fileUpload/DocIcon'))
const ExcelIcon = lazy(() => import('@/assets/Icons/fileUpload/ExcelIcon'))
const FileIcon = lazy(() => import('@/assets/Icons/fileUpload/FileIcon'))
const FileUploadIcon = lazy(() => import('@/assets/Icons/fileUpload/FileUploadIcon'))
const ImageIcon = lazy(() => import('@/assets/Icons/fileUpload/ImageIcon'))
const LeftArrowIcon = lazy(() => import('@/assets/Icons/fileUpload/LeftArrowIcon'))
const PdfIcon = lazy(() => import('@/assets/Icons/fileUpload/PdfIcon'))
const RetryIcon = lazy(() => import('@/assets/Icons/fileUpload/RetryIcon'))

const UploadIcon = lazy(() => import('@/assets/Icons/billposting/UploadIcon'))
const ConfirmationModal = lazy(() => import('@/components/Common/Modals/ConfirmationModal'))
const Wrapper = lazy(() => import('@/components/Common/Wrapper'))

const empty = 0
const uploading = 1
const completed = 3
const failed = 4
const exists = 5

const MAX_FILES = 100
const MAX_TOTAL_SIZE_MB = 50

const columns: any = [
  {
    header: '#',
    accessor: 'id',
    sortable: false,
    colalign: 'center',
    colStyle: '!w-[6%]',
  },
  {
    header: 'FILE NAME',
    accessor: 'filename',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[40%] !tracking-[0.02em]',
  },
  {
    header: 'SIZE',
    accessor: 'size',
    sortable: false,
    colalign: 'left',
    colStyle: '!tracking-[0.02em]',
  },
  {
    header: '',
    accessor: 'progress',
    sortable: false,
    colalign: 'center',
  },
  {
    header: '',
    accessor: 'action',
    sortable: false,
    colalign: 'right',
  },
]

// Map file extensions to corresponding icons
const getFileIcon = (fileType: string): JSX.Element => {
  if (!fileType) {
    fileType = 'unknown'
  }
  const lowerCaseFileType = fileType.toLowerCase()

  switch (lowerCaseFileType) {
    case 'pdf':
      return <PdfIcon />
    case 'doc':
    case 'docx':
      return <DocIcon />
    case 'xls':
    case 'xlsx':
      return <ExcelIcon />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageIcon />
    case 'csv':
      return <CsvIcon />
    default:
      return <FileIcon />
  }
}

const FileUpload = ({ processOptions }: any) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [secondarySelectedFiles, setSecondaySelectedFiles] = useState<File[]>([])
  const [selectedLocation, setSelectedLocation] = useState<number | null | string>(null)
  const [processType, setProcessType] = useState<any | null>('1')
  const [fileData, setFileData] = useState<any[]>([])
  const [openRemoveModal, setOpenRemoveModal] = useState(false)
  const [fileToRemove, setFileToRemove] = useState<number>()
  const [isUploading, setIsUploading] = useState(false)
  const [showRetryIcon, setShowRetryIcon] = useState(false)
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(true)
  const [fileIndexStatus, setFileIndexStatus] = useState<number[]>([])
  const [succesCount, setSuccessCount] = useState<number>(0)
  const [isToast, setIsToast] = useState<boolean>(true)
  const [locationOption, setLocationOption] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { selectedCompany } = useAppSelector((state) => state.user)
  const selectedCompanyValue = selectedCompany?.value

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleBack = () => {
    window.history.back()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload({ target: { files } })
  }

  //Location Dropdown List API
  const getLocationDropdown = () => {
    setIsLoading(true)
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
      setLocationOption(mappedList)
      setIsLoading(false)
    }, () => {
      setIsLoading(true)
    })
  }

  useEffect(() => {
    if (CompanyId) {
      getLocationDropdown()
    }
  }, [CompanyId])

  const handleFileUpload = (e: any) => {
    setIsUploadButtonDisabled(false)
    setIsToast(true)

    const files = e.target.files
    if (locationOption.length > 0 && selectedLocation == null) {
      Toast.error('Please first select location')
      return
    }
    // Check if the total number of selected files exceeds the limit
    if (selectedFiles.length + files.length > MAX_FILES) {
      Toast.error(`You have selected the maximum number of files`)
      return
    }

    // Filter out directory entries and keep only files
    const validFiles = Array.from(files).filter((file) => (file as File).type !== '') as File[]

    // Check for null file types
    const filesWithNullType = validFiles.filter((file) => !file.type)
    if (filesWithNullType.length > 0) {
      Toast.error(`Unsupported file format, Please select a valid file format`)
      return
    }

    // Validate file formats
    const supportedFormats = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/csv',
    ]

    const invalidFiles = validFiles.filter((file) => !supportedFormats.includes(file.type))

    if (invalidFiles.length > 0) {
      Toast.error(`Unsupported file format, Please select a valid file format`)
      return
    }

    // Check if the total size of selected files exceeds the limit
    const totalSize =
      selectedFiles.reduce((acc, file) => acc + file.size, 0) + validFiles.reduce((acc, file) => acc + file.size, 0)

    if (totalSize / (1024 * 1024) > MAX_TOTAL_SIZE_MB) {
      Toast.error(`Total size of selected files exceeds the limit of ${MAX_TOTAL_SIZE_MB} MB.`)
      return
    }

    // Check for duplicate files
    const duplicateFiles = validFiles.filter((file) => selectedFiles.some((selectedFile) => selectedFile.name === file.name))

    if (duplicateFiles.length > 0) {
      Toast.error(`You selected file already exists`)
      return
    }
    setSelectedFiles((prevSelectedFiles: any) => [...prevSelectedFiles, ...validFiles])
    setSecondaySelectedFiles((prevSelectedFiles: any) => [...prevSelectedFiles, ...validFiles])
  }

  useEffect(() => {
    if (secondarySelectedFiles.length > 0) {
      setFileIndexStatus(() => secondarySelectedFiles.map((_: any, index: number) => (index === 0 ? uploading : empty)))
    }
  }, [secondarySelectedFiles])

  const handleOpenRemoveModal = (index: number) => {
    setFileToRemove(index)
    setOpenRemoveModal(true)
  }

  const handleRemoveFile = () => {
    setFileData((prevOptions) => prevOptions.filter((_, i) => i !== fileToRemove))
    setOpenRemoveModal(false)
    Toast.success('File has been successfully removed')
    setSelectedFiles((prevSelectedFiles) => {
      if (fileToRemove !== undefined && fileToRemove !== null) {
        const updatedFiles = [...prevSelectedFiles]
        updatedFiles.splice(fileToRemove, 1)
        return updatedFiles
      }
      return prevSelectedFiles
    })
    setFileIndexStatus((prev: any) => prev.filter((_: any, index: number) => index !== fileToRemove))
  }

  const handleClearData = () => {
    setFileData([])
    setIsUploading(false)
    setSelectedFiles([])
    setSecondaySelectedFiles([])
    setFileIndexStatus([])
    setSuccessCount(0)
    setShowRetryIcon(false)
  }

  let counter = 0

  const uploadFile = async (file: File, index: number, secondaryIndex?: number) => {
    const formData = new FormData()
    formData.append('Files', file)
    formData.append('ProcessType', `${processType}`)
    formData.append('LocationId', `${locationOption.length > 0 ? selectedLocation : 0}`)
    formData.append('CompanyId', `${selectedCompanyValue}`)
    setIsUploading(true)
    try {
      const response = await agent.APIs.uploadDocument(formData)
      if (response.ResponseStatus === 'Success') {
        if (response.ResponseData[0].IsUploaded) {
          setFileIndexStatus((prev: any) =>
            prev.map((p: any, index: number) => {
              if (index === counter) {
                return completed
              } else if (index === counter + 1) {
                return uploading
              } else {
                return p
              }
            })
          )
          counter++
          // Remove the successfully uploaded file from the selectedFiles array
          setTimeout(() => {
            setSelectedFiles((prevSelectedFiles) =>
              prevSelectedFiles.filter(
                (files: any) => files.name.toLowerCase() !== response.ResponseData[0].FileName.toLowerCase()
              )
            )
          }, 1500)
        }

        if (!response.ResponseData[0].IsUploaded) {
          if (response.ResponseData[0].ErrorMessage.toLowerCase() === 'already exists') {
            setFileIndexStatus((prev: any) =>
              prev.map((p: any, index: number) => {
                if (index === counter) {
                  return exists
                } else if (index === counter + 1) {
                  return uploading
                } else {
                  return p
                }
              })
            )
            counter++
          }
          if (response.ResponseData[0].ErrorMessage.toLowerCase() === 'failed') {
            setFileIndexStatus((prev: any) =>
              prev.map((p: any, index: number) => {
                if (index === counter) {
                  return failed
                } else if (index === counter + 1) {
                  return uploading
                } else {
                  return p
                }
              })
            )
            counter++
          }
        }
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error)
      setFileIndexStatus((prev: any) => prev.map((p: any, i: number) => (i === index ? failed : p)))
      // Display RetryIcon for the failed file
      setShowRetryIcon(true)
    }
  }

  const retryFile = async (file: File, i: number, secondaryIndex?: number) => {
    const formData = new FormData()
    formData.append('Files', file)
    formData.append('ProcessType', `${processType}`)
    formData.append('LocationId', `${selectedLocation}`)
    formData.append('CompanyId', `${selectedCompanyValue}`)
    setIsUploading(true)
    try {
      const response = await agent.APIs.uploadDocument(formData)
      if (response.ResponseStatus === 'Success') {
        if (response.ResponseData[0].IsUploaded) {
          setFileIndexStatus((prev: any) => prev.map((p: any, index: number) => (index === i ? completed : p)))
          // Remove the successfully uploaded file from the selectedFiles array
          setTimeout(() => {
            setFileIndexStatus((prev: any) =>
              prev.map((p: any, index: number) => (index === i ? completed : p)).filter((p: any) => p !== completed)
            )
            setSelectedFiles((prevSelectedFiles) =>
              prevSelectedFiles.filter(
                (files: any) => files.name.toLowerCase() !== response.ResponseData[0].FileName.toLowerCase()
              )
            )
          }, 1500)
        }
        if (!response.ResponseData[0].IsUploaded) {
          if (response.ResponseData[0].ErrorMessage.toLowerCase() === 'already exists') {
            setFileIndexStatus((prev: any) => prev.map((p: any, index: number) => (index === i ? exists : p)))
            counter++
          }
          if (response.ResponseData[0].ErrorMessage.toLowerCase() === 'failed') {
            setFileIndexStatus((prev: any) => prev.map((p: any, index: number) => (index === i ? failed : p)))
            counter++
          }
        }
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error)
      setFileIndexStatus((prev: any) => prev.map((p: any, index: number) => (index === i ? failed : p)))
      // Display RetryIcon for the failed file
      setShowRetryIcon(true)
    }
    setIsUploading(false)
  }

  const handleUpload = async () => {
    setIsUploadButtonDisabled(true)
    // Iterate through selectedFiles and upload files one by one
    for (let i = 0; i < selectedFiles.length; i++) {
      await uploadFile(selectedFiles[i], i)
    }
    setIsUploading(false)
  }

  const handleRetry = (index: number) => {
    const filename = selectedFiles[index].name
    // Find the index of the filename in the secondarySelectedFiles array
    const secondaryIndex = secondarySelectedFiles.findIndex((file) => file.name === filename)
    // You might want to reset the status of the file at the given index
    setFileIndexStatus((prev: any) => prev.map((p: any, i: number) => (i === index ? uploading : p)))
    // Call the uploadFile function with the specific file at the given index
    retryFile(selectedFiles[index], index, secondaryIndex)
  }

  // FileUpload OCR Api
  // const handleOcrFile = async () => {
  //   try {
  //     await agent.APIs.getocrDocument()
  //   } catch (error: any) {
  //     console.error(error)
  //   }
  // }

  useEffect(() => {
    setSuccessCount(() => fileIndexStatus.filter((file: number) => file === 3).length)
    if (fileIndexStatus.filter((file: number) => file === 3).length > 0 && isUploading === false && isToast === true) {
      // handleOcrFile()
      setTimeout(() => {
        Toast.success(`${succesCount + 1} File(s) uploaded and has been moved for the process of automation.`)
      }, 1500)
      setIsToast(false)
    }
  }, [fileIndexStatus])

  useEffect(() => {
    const newFileData = []
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const fileName = file.name
      let fileType: string | undefined = fileName.split('.').pop()
      if (!fileType) {
        fileType = 'unknown'
      }

      let progressContent

      if (isUploading && fileIndexStatus[i] === uploading) {
        progressContent = (
          <div className='flex w-72 items-center justify-center'>
            <Typography type='h6' className='w-[45%] italic will-change-contents'>
              Uploading...
            </Typography>
            <ProgressBar label='' variant='primary' progressDigit={false} progress={100} />
          </div>
        )
      } else if (fileIndexStatus[i] === completed || fileIndexStatus[i] === failed || fileIndexStatus[i] === exists) {
        progressContent = (
          <div className='flex w-72 items-center justify-center '>
            <div
              className={`${fileIndexStatus[i] === completed
                ? 'bg-primary'
                : fileIndexStatus[i] === failed
                  ? 'bg-[#FB2424]'
                  : 'bg-yellow-400'
                } mx-2 h-1.5 w-1.5 rounded-full`}
            ></div>
            <Typography type='h6'>
              {fileIndexStatus[i] === completed
                ? 'Moved into automation'
                : fileIndexStatus[i] === exists
                  ? 'Already exists'
                  : 'Failed'}
            </Typography>
          </div>
        )
      } else {
        progressContent = null
      }

      newFileData.push({
        id: i + 1,
        filename: (
          <div className='flex items-center justify-center'>
            <div className='mr-3'>{getFileIcon(fileType)}</div>
            <span>{fileName}</span>
          </div>
        ),
        size: `${(file.size / 1024).toFixed(2)} KB`,
        progress: progressContent,
        action: (
          <>
            {showRetryIcon && (
              <Tooltip position='left' content='Retry' className='!p-0'>
                <div onClick={() => handleRetry(i)}>
                  <RetryIcon />
                </div>
              </Tooltip>
            )}
            {
              <span className={`${isUploading && 'pointer-events-none opacity-50'} h-[35px]`}>
                <Tooltip position='left' content='Remove' className='!p-0'>
                  <div onClick={() => handleOpenRemoveModal(i)} className='ml-1 mr-2 pt-[5px]'>
                    <Close variant='medium' />
                  </div>
                </Tooltip>
              </span>
            }
          </>
        ),
      })
    }
    setFileData(newFileData)
  }, [selectedFiles, isUploading, fileIndexStatus])

  const openFileInput = () => {
    if (locationOption.length > 0 && selectedLocation === null) {
      Toast.error('Please first select location')
    } else {
      if (fileInputRef && fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  const handleIconClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault()
    openFileInput()
  }

  return (
    <>
      <Wrapper masterSettings={false}>
        <div className='main-cantainer'>
          <div className={`sticky top-0 z-[2] w-full`}>
            <div className={`flex items-center !h-[60px] justify-start border-b-[1px] border-lightSilver bg-whiteSmoke px-5`}>
              <button className='cursor-pointer' onClick={handleBack} disabled={isUploading}>
                <LeftArrowIcon />
              </button>
              <div className='pl-5 pr-10'>
                <Select
                  id={'processType'}
                  className='fileuploadHeaderSelectDrop'
                  defaultValue={processType}
                  options={processOptions.filter((item: any) => item.value !== '3')}
                  getValue={(value: number | null) => setProcessType(value)}
                  getError={() => ''}
                  noborder
                />
              </div>
              <div className={` ${locationOption.length > 0 ? "block" : "hidden"}`}>
                <Select
                  id={'locationSelect'}
                  className='fileuploadHeaderSelectDrop'
                  placeholder={'Select Location'}
                  options={locationOption}
                  getValue={(value: number | null | string) => setSelectedLocation(value)}
                  getError={() => ''}
                  noborder
                />
              </div>
            </div>
            {fileData.length > 0 && (
              <div className={`${isUploading && 'pointer-events-none'} flex items-center justify-between bg-white p-5`}>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`w-content flex h-full items-center justify-center rounded-full border-[1px] border-dashed border-lightSilver px-[30px] py-[10px] hover:border-primary hover:bg-[#EDFFFC]`}
                >
                  <div>
                    <label htmlFor='fileInput' className='custom-file-upload'>
                      <div className='mr-[10px] cursor-pointer rounded-sm'>
                        <UploadIcon height={'20'} width={'20'} />
                      </div>
                      <input
                        type='file'
                        id='fileInput'
                        accept=''
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        multiple
                      />
                    </label>
                  </div>
                  <div>
                    <Typography>
                      Drag and drop or{' '}
                      <span className='cursor-pointer text-primary' onClick={openFileInput}>
                        browse
                      </span>{' '}
                      to upload
                    </Typography>
                  </div>
                </div>
                <div onClick={handleClearData}>
                  <Button
                    className='btn-sm !h-9 rounded-full'
                    variant='btn-outline-primary'
                    onClick={handleUpload}>
                    <label className={`flex items-center justify-center cursor-pointer font-proxima font-bold h-full text-sm tracking-[0.02em] py-4 px-6 -mt-0.5`}>
                      CLEAR ALL
                    </label>
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div>
            {fileData.length > 0 ? (
              <div className='h-[calc(100vh-275px)] overflow-auto max-[425px]:mx-1 custom-scroll'>
                <div className={`${fileData.length === 0 ? 'h-11' : 'h-auto'}`}>
                  <DataTable
                    getExpandableData={() => { }}
                    columns={columns}
                    data={fileData}
                    sticky
                    hoverEffect
                    getRowId={() => { }}
                  />
                </div>
              </div>
            ) : (
              //File Uploading Container
              <div className={`p-5 text-center ${isLoading && 'pointer-events-none opacity-90'}`} onDragOver={handleDragOver} onDrop={handleDrop}>
                <div className='flex h-[calc(100vh-237px)] w-full flex-col items-center  justify-center rounded-md border-[1px] border-dashed border-lightSilver hover:border-primary hover:bg-[#EDFFFC]'>
                  <div>
                    <label htmlFor='fileInput' className='custom-file-upload'>
                      <div
                        className='cursor-pointer p-1 hover:bg-whiteSmoke'
                        onClick={handleIconClick}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <FileUploadIcon />
                      </div>
                      {/* {locationOption.length > 0 && selectedLocation !== null && ( */}
                      <input
                        type='file'
                        id='fileInput'
                        accept=''
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        multiple
                      />
                      {/* )} */}
                    </label>
                  </div>
                  <div className='pt-2'>
                    <Typography>
                      Drag and drop or{' '}
                      <span className='cursor-pointer text-primary' onClick={openFileInput}>
                        browse
                      </span>{' '}
                      to upload
                    </Typography>
                  </div>
                </div>
              </div>
            )}
            <div className='h-[66px] fileUploadWidth absolute bottom-0 box-border flex items-center justify-end border-t  border-lightSilver bg-white p-5 gap-5'>
              <Button
                className={`btn-sm !h-9 rounded-full !w-[94px]`}
                variant={`${isUploading ? "btn-outline" : 'btn-outline-primary'}`}
                disabled={isUploading}
                onClick={handleBack}>
                <label className="font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">CANCEL</label>
              </Button>
              <Button
                className='btn-sm !h-9 rounded-full !w-[95px]'
                variant={isUploadButtonDisabled ? 'btn' : 'btn-primary'}
                disabled={isUploadButtonDisabled}
                onClick={handleUpload}>
                <label className={`flex items-center justify-center cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                  UPLOAD
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Remove Modal Popup */}
        <ConfirmationModal
          title='Remove'
          content='Are you sure you want to remove this file from the list?'
          isModalOpen={openRemoveModal}
          modalClose={() => setOpenRemoveModal(false)}
          handleSubmit={handleRemoveFile}
          colorVariantNo='btn-outline'
          colorVariantYes='btn-error'
        />
      </Wrapper>
    </>
  )
}

export default FileUpload
