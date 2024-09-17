'use client'
import { RotateDirection, Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { getFilePlugin } from '@react-pdf-viewer/get-file'
import { pageNavigationPlugin, RenderCurrentPageLabelProps } from '@react-pdf-viewer/page-navigation'
import '@react-pdf-viewer/page-navigation/lib/styles/index.css'
import { rotatePlugin } from '@react-pdf-viewer/rotate'
import { RenderCurrentScaleProps, zoomPlugin } from '@react-pdf-viewer/zoom'
import { Loader, Tooltip, Typography } from 'pq-ap-lib'
import { useState } from 'react'

import PDFIcon from '@/assets/Icons/billposting/PDFIcon'
import DownloadIcon from '@/assets/Icons/billposting/PDFViewer/DownloadIcon'
import ExpandIcon from '@/assets/Icons/billposting/PDFViewer/ExpandIcon'
import LeftArrowIcon from '@/assets/Icons/billposting/PDFViewer/LeftArrowIcon'
import RightArrowIcon from '@/assets/Icons/billposting/PDFViewer/RightArrowIcon'
import RotateIcon from '@/assets/Icons/billposting/PDFViewer/RotateIcon'
import SplitIcon from '@/assets/Icons/billposting/PDFViewer/SplitIcon'
import ZoomInIcon from '@/assets/Icons/billposting/PDFViewer/ZoomInIcon'
import ZoomOutIcon from '@/assets/Icons/billposting/PDFViewer/ZoomOutIcon'
import ImageIcon from '@/assets/Icons/ImageIcon'
import { billStatusEditable } from '@/utils/billposting'

interface PDFViewerProps {
  pdfFile: string | undefined
  onOpen: () => void
  heightClass?: string
  documentDetailByIdData?: any
  isVisibleLeftSidebar?: any
  getNumberOfPages?: any
  isSplitDrawer?: boolean
  fileBlob?: any
  isPdfLoading?: boolean
  isSplitVisible?: boolean
  billNumber?: any
  fileName?: string
  openInNewWindow?: any
  isFileNameVisible?: any
  defaultScale?: any
}
function PDFViewer({
  pdfFile,
  onOpen,
  heightClass,
  documentDetailByIdData,
  isVisibleLeftSidebar,
  getNumberOfPages,
  isSplitDrawer = false,
  fileBlob,
  isPdfLoading,
  isSplitVisible = true,
  billNumber,
  fileName,
  openInNewWindow,
  defaultScale = 0.8,
  isFileNameVisible = false,
}: PDFViewerProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isActionsHovered, setIsActionsHovered] = useState<boolean>(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const billStatus = documentDetailByIdData?.Status

  const rotatePluginInstance = rotatePlugin()
  const { Rotate } = rotatePluginInstance

  const zoomPluginInstance = zoomPlugin()
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance

  const getFilePluginInstance = getFilePlugin({
    fileNameGenerator: (file) => {
      let fileExtension = fileName?.replace(/\.[^/.]+$/, '')
      const fileNameDisplay = `${fileExtension}_${billNumber}`
      return `${fileNameDisplay}`
    },
  })

  const { Download } = getFilePluginInstance

  const pageNavigationPluginInstance = pageNavigationPlugin()
  const { GoToNextPage, GoToPreviousPage, CurrentPageLabel } = pageNavigationPluginInstance

  return (
    <>
      <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
        <div className={`custom-scroll-PDF relative flex w-full flex-col overflow-auto ${heightClass ? heightClass : 'h-full'}`}>
          {isPdfLoading ? (
            <div className={`flex w-full items-center justify-center ${heightClass && isPdfLoading ? heightClass : 'h-[100vh]'}`}>
              <Loader size='sm' helperText />
            </div>
          ) : (
            <>
              {pdfFile ? (
                <div
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`flex w-full items-center justify-center ${heightClass && isPdfLoading ? heightClass : 'h-[100vh]'}`}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'contents',
                    }}
                  >
                    <Viewer
                      fileUrl={pdfFile}
                      defaultScale={defaultScale}
                      renderLoader={() => <Loader />}
                      plugins={[rotatePluginInstance, zoomPluginInstance, getFilePluginInstance, pageNavigationPluginInstance]}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <ImageIcon />
                </div>
              )}
            </>
          )}

          {pdfFile !== '' && (
            <div
              className={`sticky w-full bottom-0 left-1/2 flex justify-center p-4 ${isHovered || isActionsHovered ? 'visible h-auto' : 'invisible h-0'
                }`}
              style={{
                transition: 'bottom 0.9s ease-in-out',
              }}
              onMouseEnter={() => setIsActionsHovered(true)}
              onMouseLeave={() => setIsActionsHovered(false)}
            >
              <div className='item-center flex rounded-md bg-[#333333] laptop:px-2 laptopMd:px-2 lg:px-2 xl:px-2 hd:px-3 2xl:px-3 3xl:px-3 opacity-90'>
                <div className='pdfAction flex py-2'>
                  <div className='item-center flex'>
                    {documentDetailByIdData?.FileName && !isVisibleLeftSidebar && (
                      <div>
                        <div className='flex w-32 items-center'>
                          <PDFIcon fill='#ffffff' />
                          <span
                            title={documentDetailByIdData?.FileName}
                            className='w-32 overflow-hidden truncate text-ellipsis !font-proxima !text-[12px] text-white'
                          >
                            {documentDetailByIdData?.FileName}
                          </span>
                        </div>
                      </div>
                    )}
                    {isFileNameVisible && <div>
                      <div className='flex w-32 items-center'>
                        <PDFIcon fill='#ffffff' />
                        <span
                          title={fileName}
                          className='w-32 overflow-hidden truncate text-ellipsis !font-proxima !text-[12px] text-white'
                        >
                          {fileName}
                        </span>
                      </div>
                    </div>

                    }

                    <div className='pagination flex items-center laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-4 2xl:px-4 3xl:px-4'>
                      <GoToPreviousPage>
                        {(props: any) => (
                          <span className='cursor-pointer' onClick={props.onClick}>
                            <LeftArrowIcon />
                          </span>
                        )}
                      </GoToPreviousPage>
                      <CurrentPageLabel>
                        {(props: RenderCurrentPageLabelProps) => {
                          if (getNumberOfPages) {
                            getNumberOfPages(props.numberOfPages)
                            setTotalPages(props.numberOfPages)
                            setCurrentPage(props.currentPage)
                          }
                          return <></>
                        }}
                      </CurrentPageLabel>
                      <>
                        <span className='mx-2 flex h-4 w-4 items-center justify-center rounded-sm border border-[#fff] !font-proxima !text-[12px] text-[#fff]'>
                          {currentPage + 1}
                        </span>
                        <div className='flex w-[65px] items-center text-[#fff]'>
                          <Typography className='!font-proxima !text-[12px]'>of {totalPages ? totalPages : 0} Pages</Typography>
                        </div>
                      </>

                      <GoToNextPage>
                        {(props: any) => (
                          <span className='cursor-pointer' onClick={props.onClick}>
                            <RightArrowIcon />
                          </span>
                        )}
                      </GoToNextPage>
                    </div>
                  </div>

                  <div className='h-full w-[1px] bg-[#6E6D7A]' />

                  <div className='zoomSection flex items-center laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-4 2xl:px-4 3xl:px-4'>
                    <ZoomOut>
                      {(props: any) => (
                        <span onClick={props.onClick} className='cursor-pointer'>
                          <ZoomOutIcon />
                        </span>
                      )}
                    </ZoomOut>
                    <CurrentScale>
                      {(props: RenderCurrentScaleProps) => (
                        <Typography className='mx-2 !font-proxima !text-[12px] text-[#fff]'>{`${Math.round(
                          props.scale * 100
                        )}%`}</Typography>
                      )}
                    </CurrentScale>
                    <ZoomIn>
                      {(props: any) => (
                        <span onClick={props.onClick} className='cursor-pointer'>
                          <ZoomInIcon />
                        </span>
                      )}
                    </ZoomIn>
                  </div>

                  <div className='h-full w-[1px] bg-[#6E6D7A]' />

                  <div className='rotate flex items-center laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-4 2xl:px-4 3xl:px-4'>
                    <Tooltip
                      position='left'
                      content='Rotate'
                      className='!z-[6] !pb-0 !pl-0 !pr-0 !pt-0 !font-proxima !text-[14px]'
                    >
                      <Rotate direction={RotateDirection.Forward}>
                        {(props: any) => (
                          <span className='cursor-pointer' onClick={props.onClick}>
                            <RotateIcon />
                          </span>
                        )}
                      </Rotate>
                    </Tooltip>
                  </div>

                  <div className='h-full w-[1px] bg-[#6E6D7A]' />

                  <div className='download flex items-center laptop:px-3 laptopMd:px-3 lg:px-3 xl:px-3 hd:px-4 2xl:px-4 3xl:px-4'>
                    <Tooltip
                      position='left'
                      content='Download File'
                      className='!z-[6] !pb-0 !pl-0 !pr-0 !pt-0 !font-proxima !text-[14px]'
                    >
                      <Download>
                        {(props: any) => (
                          <span onClick={props.onClick} className='cursor-pointer'>
                            <DownloadIcon />
                          </span>
                        )}
                      </Download>
                    </Tooltip>
                  </div>
                </div>

                <div className='h-[22px] mt-2 w-[1px] bg-[#6E6D7A]' />

                <div className='flex py-2'>
                  {isSplitVisible &&
                    !isSplitDrawer &&
                    billStatusEditable.includes(billStatus) &&
                    totalPages !== 1 && (
                      <>
                        <div className='flex items-center laptop:px-1.5 laptopMd:px-1.5 lg:px-1.5 xl:px-1.5 hd:px-3 2xl:px-3 3xl:px-3'>
                          <Tooltip
                            position='left'
                            content='Split Document'
                            className='!z-[6] !pb-0 !pl-0 !pr-0 !pt-0 !font-proxima !text-[14px]'
                          >
                            <div className='cursor-pointer' onClick={onOpen}>
                              <SplitIcon />
                            </div>
                          </Tooltip>
                        </div>
                        <div className='h-full w-[1px] bg-[#6E6D7A]' />
                      </>
                    )}

                  <div className='flex items-center laptop:px-1.5 laptopMd:px-1.5 lg:px-1.5 xl:px-1.5 hd:px-3 2xl:px-3 3xl:px-3'>
                    <Tooltip
                      position='left'
                      content='Open in New Window'
                      className='!z-[6] !pb-0 !pl-2 !pr-0 !pt-0 !font-proxima !text-[14px]'
                    >
                      <div className='cursor-pointer' onClick={() => openInNewWindow(fileBlob, fileName)}>
                        <ExpandIcon />
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Worker>
    </>
  )
}

export default PDFViewer
