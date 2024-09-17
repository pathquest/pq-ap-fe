import { BlobServiceClient } from '@azure/storage-blob'
import { useState } from 'react'
import { storageConfig } from './config'

const usePdfViewer = () => {
  const [PDFUrl, setPDFUrl] = useState('')
  const [fileBlob, setFileBlob] = useState<Blob | null>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const showPDFViewerModal = async (filePath: string, fileName: string) => {
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

        if (!['pdf'].includes(fileName.split('.')?.pop()?.toLowerCase() ?? '')) {
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

  return {
    showPDFViewerModal,
    PDFUrl,
    setPDFUrl,
    fileBlob,
    isPdfLoading,
  }
}

export default usePdfViewer
