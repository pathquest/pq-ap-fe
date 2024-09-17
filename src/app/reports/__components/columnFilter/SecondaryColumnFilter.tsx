import ColFilterIcon from '@/assets/Icons/billposting/ColFilterIcon'
import { Button, CheckBox, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef } from 'react'

interface ColumnFilterDropdownProps {
  headers: any[]
  visibleHeaders: any[]
  isOpen?: boolean
  setOpen: (arg1: boolean) => void
}

const SecondaryColumnFilter: React.FC<ColumnFilterDropdownProps> = ({ headers, visibleHeaders, isOpen, setOpen }) => {
  const dropdownColumnRef = useRef<HTMLDivElement>(null)

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownColumnRef.current && !dropdownColumnRef.current.contains(event.target as Node)) {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <div className='absolute right-2 top-1.5 cursor-pointer'>
      <span
        onClick={() => {
          isOpen ? setOpen(false) : setOpen(true)
        }}
      >
        color={isOpen ? "#02B89D" : "#6E6D7A"}
      </span>

      {isOpen && (
        <div
          ref={dropdownColumnRef}
          className='column-vertical-scroll overflow-y-scroll h-[350px] custom-scroll-PDF absolute !top-11 right-1 !z-[999] flex flex-col rounded-md bg-white shadow-lg'
        >
          <div className='py-[15px]'>
            {headers.map((header) => (
              <span key={header} className='span flex cursor-pointer p-2 font-normal hover:bg-whiteSmoke'>
                <CheckBox
                  className='checkbox'
                  id={header}
                  label={header}
                  checked={visibleHeaders.includes(header)}
                  onChange={() => { }}
                />
              </span>
            ))}
          </div>
          <div className='flex justify-center border-t border-[#cccccc] p-[15px]'>
            <Button
              variant='btn-outline-primary'
              className='btn-md rounded-full'
              onClick={() => {
                setOpen(false)
              }}
            >
              <Typography className='px-6 py-3 !text-[14px] font-semibold'>CANCEL</Typography>
            </Button>

            <Button
              variant='btn-primary'
              className='btn-md ml-5 rounded-full'
              onClick={() => {
                setOpen(false)
              }}
            >
              <Typography className='px-6 py-3 !text-[14px] font-semibold'>APPLY</Typography>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecondaryColumnFilter
