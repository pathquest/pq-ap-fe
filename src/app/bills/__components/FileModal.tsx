import { Close, Tooltip, Typography } from 'pq-ap-lib'
import { useState } from 'react'
import PDFViewer from './PDFViewer'
import SplitDrawer from './SplitDrawer'

export default function FileModal({
  isFileRecord,
  setIsFileRecord,
  PDFUrl,
  setIsOpenDrawer,
  isOpenDrawer,
  setPDFUrl,
  setFileModal,
  fileBlob,
  isPdfLoading,
  openInNewWindow,
  isFileNameVisible
}: any) {
  const [numberOfPages, setNumberOfPages] = useState<number>(0)

  const onSetNumberOfPages = (value: number) => {
    setNumberOfPages(value)
  }

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
        <div className='absolute inset-0 bg-gray-900 opacity-50'></div>
        <div className='z-50 w-[740px] flex flex-col md:!h-[575px] laptop:!h-[575px] laptopMd:!h-[575px] lg:!h-[575px] xl:!h-[575px] hd:!h-[704px] 2xl:!h-[704px] 3xl:!h-[704px] bg-darkSmoke'>
          <div className='flex justify-end pt-[15px] px-[15px] pb-[5px]'>
            <span
              onClick={() => {
                setFileModal(false)
                setPDFUrl('')
                setIsFileRecord({ FileName: '', PageCount: '', BillNumber: '' })
              }}
            >
              <Close />
            </span>
          </div>
          <div className='flex-1 mx-5 mb-5 overflow-auto bg-pureWhite'>
            <PDFViewer
              billNumber={isFileRecord?.BillNumber}
              fileName={isFileRecord?.FileName}
              getNumberOfPages={onSetNumberOfPages}
              pdfFile={PDFUrl}
              heightClass='h-full'
              onOpen={() => setIsOpenDrawer(true)}
              isSplitVisible={false}
              fileBlob={fileBlob}
              isPdfLoading={isPdfLoading}
              openInNewWindow={openInNewWindow}
              isFileNameVisible={isFileNameVisible}
            />
            <SplitDrawer
              numberOfPages={numberOfPages}
              pdfFile={PDFUrl}
              onOpen={isOpenDrawer}
              onClose={() => setIsOpenDrawer(false)}
              fileName={isFileRecord?.FileName}
              fileBlob={fileBlob}
            />
          </div>
        </div>
      </div>
    </>
  )
}
