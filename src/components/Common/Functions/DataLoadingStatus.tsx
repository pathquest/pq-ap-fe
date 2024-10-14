import React from 'react'
import { Loader } from 'pq-ap-lib'

interface DataLoadingStatusProps {
  isLoading: boolean
  data: any[]
  loadingText?: boolean
  noDataText?: string
}

const DataLoadingStatus: React.FC<DataLoadingStatusProps> = ({
  isLoading,
  data,
  loadingText = true,
  noDataText = 'There is no data available at the moment.',
}) => {
  if (data.length === 0) {
    return isLoading ? (
      <div className='flex h-[calc(100vh-195px)] w-full items-center justify-center'>
        <Loader size='md' helperText={loadingText} />
      </div>
    ) : (
      <div className='flex h-[44px] w-auto items-center justify-center border-b font-proxima border-b-[#ccc]'>{noDataText}</div>
    )
  }

  return null
}

export default DataLoadingStatus
