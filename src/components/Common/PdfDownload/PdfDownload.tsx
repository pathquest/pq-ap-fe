// fileDownloadService.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

interface DownloadFileParams {
  url: string
  params: any
  headers?: Record<string, string>
  fileType: string
  fileName: string
}

export const DownloadFile = async ({ url, params, headers, fileType,fileName }: DownloadFileParams): Promise<void> => {
  try {
    const config: AxiosRequestConfig = {
      headers: headers || {},
      responseType: 'arraybuffer',
    }

    const response: AxiosResponse = await axios.post(url, params, config)

    if (response.status === 200) {
      if (response.data.ResponseStatus === 'Failure') {
        // Handle failure case
        console.error('Error:', response.data.Message)
      } else {
        const blob = new Blob([response.data], {
          type: response.headers['content-type'],
        })
        const fileUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = `${fileName}.${fileType}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(fileUrl)
      }
    } else {
      // Handle error case
      console.error('Error:', response.statusText)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
