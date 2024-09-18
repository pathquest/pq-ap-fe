import React from 'react'

function ExportPopup() {
  return (
    <div className='flex flex-col items-start justify-start border-b border-[#cccccc]'>
      <span
        className='w-full cursor-pointer px-5 py-3 !text-[14px] hover:bg-blue-50'
        onClick={() => {}}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ')}
      >
        PDF
      </span>
      <span
        className='w-full cursor-pointer px-5 py-3 !text-[14px] hover:bg-blue-50'
        onClick={() => {}}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ')}
      >
        Excel
      </span>
    </div>
  )
}

export default ExportPopup
