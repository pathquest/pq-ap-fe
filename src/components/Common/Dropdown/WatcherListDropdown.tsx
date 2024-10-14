'use client'
import React, { useState, ChangeEvent } from 'react'
import { Avatar, Button, CheckBox, Typography } from 'pq-ap-lib'
import { WatcherOptions, WatchersProps } from '@/models/activity'
// icons
import SpinnerIcon from '@/assets/Icons/spinnerIcon'

export default function WatcherListDropdown({
  enableCheckboxes = false,
  userData,
  selectedStates,
  setSelectedStates,
  onApply,
  loaderStatus,
  dropdownAssignUserRef,
  isOpenAssignUserDropDown,
  setIsOpenAssignUserDropDown,
  disabled,
}: WatchersProps): JSX.Element {
  const [searchText, setSearchText] = useState<string>('')

  const filteredStates = userData?.filter((data: WatcherOptions) => data.name.toLowerCase().includes(searchText))

  const toggleDropdown = () => {
    setIsOpenAssignUserDropDown((prevState: boolean) => !prevState)
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase())
  }

  const handleStateSelection = (event: any, data: WatcherOptions) => {
    if (enableCheckboxes === false) {
      setSelectedStates([data])
      setIsOpenAssignUserDropDown(false)
    } else {
      if (event.target.checked) {
        setSelectedStates([...selectedStates, data])
      } else {
        setSelectedStates(selectedStates.filter((state: WatcherOptions) => state !== data))
      }
    }
  }

  return (
    <div className='relative'>
      <div
        className={`${disabled ? 'pointer-events-none' : ''} flex cursor-pointer select-none items-center justify-between`}
        onClick={toggleDropdown}
      >
        <div className={`ml-4 flex w-24`}>
          <div className='flex items-center justify-center'>
            {selectedStates && selectedStates?.length === 0 && (
              <span className='ml-[-15px]'>
                <img src='/avatar.png' alt='avatar' />
              </span>
            )}
            {selectedStates &&
              selectedStates.map((name: any, index: number) => {
                if (index < 3) {
                  return <Avatar key={name} variant='small' className='ml-[-15px]' name={name.name} />
                } else if (index === 3) {
                  return (
                    <Avatar
                      key={name}
                      variant='small'
                      className='ml-[-15px] !w-8 !bg-[#FECBA1] !text-[12px] !text-[#CA6510] !opacity-100'
                      name={`+${selectedStates.length.toString()}`}
                      isCountAvatar={true}
                    />
                  )
                }
                return null
              })}
          </div>
          {!enableCheckboxes && (
            <span
              className='ml-2 flex items-center justify-center truncate overflow-ellipsis pr-1'
              title={`${selectedStates && selectedStates.length > 0 && selectedStates[0].name}`}>
              {selectedStates && selectedStates.length > 0 && selectedStates[0].name}
            </span>
          )}
        </div>

        <span>
          {!disabled && (
            <svg
              className={`ml-1 mt-[2px] h-4 w-4 text-[#6E6D7A] ${isOpenAssignUserDropDown ? 'rotate-180 transform' : ''}`}
              width='15'
              height='8'
              viewBox='0 0 15 8'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M0.167836 0.167835C0.220903 0.114634 0.283945 0.0724241 0.35335 0.0436241C0.422755 0.0148241 0.497161 0 0.572304 0C0.647447 0 0.721853 0.0148241 0.791258 0.0436241C0.860663 0.0724241 0.923705 0.114634 0.976772 0.167835L7.4277 6.6199L13.8786 0.167835C13.9317 0.11472 13.9948 0.0725863 14.0642 0.0438404C14.1336 0.0150945 14.208 0.000299105 14.2831 0.000299105C14.3582 0.000299105 14.4326 0.0150945 14.502 0.0438404C14.5714 0.0725863 14.6344 0.11472 14.6876 0.167835C14.7407 0.220951 14.7828 0.284008 14.8116 0.353407C14.8403 0.422806 14.8551 0.497187 14.8551 0.572304C14.8551 0.64742 14.8403 0.721802 14.8116 0.791201C14.7828 0.860599 14.7407 0.923657 14.6876 0.976772L7.83216 7.83216C7.7791 7.88537 7.71606 7.92758 7.64665 7.95638C7.57724 7.98518 7.50284 8 7.4277 8C7.35255 8 7.27815 7.98518 7.20874 7.95638C7.13934 7.92758 7.0763 7.88537 7.02323 7.83216L0.167836 0.976772C0.114634 0.923705 0.0724247 0.860663 0.0436246 0.791258C0.0148246 0.721852 0 0.647447 0 0.572304C0 0.49716 0.0148246 0.422755 0.0436246 0.35335C0.0724247 0.283944 0.114634 0.220903 0.167836 0.167835Z'
                fill='#6E6D7A'
              />
            </svg>
          )}
        </span>
      </div>

      <div
        ref={dropdownAssignUserRef}
        className={`${isOpenAssignUserDropDown ? 'absolute bottom-10 z-[10] block !pt-2' : 'hidden'}`}>
        <div className={'max-h-[350px] w-[284px] rounded-lg bg-white shadow-2xl'}>
          <div className='sticky top-0'>
            <div className='pointer-events-none absolute top-[13px] flex items-center pl-3'>
              <svg
                className='h-4 w-4 text-gray-500'
                width='19'
                height='18'
                viewBox='0 0 19 18'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M16.4 17.3L10.8 11.7C10.3 12.1 9.725 12.4167 9.075 12.65C8.425 12.8833 7.73333 13 7 13C5.18333 13 3.64583 12.3708 2.3875 11.1125C1.12917 9.85417 0.5 8.31667 0.5 6.5C0.5 4.68333 1.12917 3.14583 2.3875 1.8875C3.64583 0.629167 5.18333 0 7 0C8.81667 0 10.3542 0.629167 11.6125 1.8875C12.8708 3.14583 13.5 4.68333 13.5 6.5C13.5 7.23333 13.3833 7.925 13.15 8.575C12.9167 9.225 12.6 9.8 12.2 10.3L17.825 15.925C18.0083 16.1083 18.1 16.3333 18.1 16.6C18.1 16.8667 18 17.1 17.8 17.3C17.6167 17.4833 17.3833 17.575 17.1 17.575C16.8167 17.575 16.5833 17.4833 16.4 17.3ZM7 11C8.25 11 9.3125 10.5625 10.1875 9.6875C11.0625 8.8125 11.5 7.75 11.5 6.5C11.5 5.25 11.0625 4.1875 10.1875 3.3125C9.3125 2.4375 8.25 2 7 2C5.75 2 4.6875 2.4375 3.8125 3.3125C2.9375 4.1875 2.5 5.25 2.5 6.5C2.5 7.75 2.9375 8.8125 3.8125 9.6875C4.6875 10.5625 5.75 11 7 11Z'
                  fill='#6C757D'
                />
              </svg>
            </div>
            <input
              type='search'
              id='default-search'
              className='block  h-[42px] w-full rounded-sm border-b border-lightSilver pl-9 text-sm outline-none focus:border-[#02b89d]'
              placeholder='Search'
              onChange={handleSearch}
              value={searchText}
            />
          </div>
          <div className={`custom-scroll-PDF max-h-[250px] flex-col overflow-auto`}>
            <ul className={`${filteredStates?.length === 0 ? 'pt-[15px]' : ''} mt-3 h-auto cursor-pointer overflow-y-auto`}>
              {filteredStates?.map((data: any, key: any) => (
                <li
                  key={data.id}
                  className={`flex items-center px-[15px] py-1 hover:bg-[#EEF4F8]`}
                  onClick={(event: any) => {
                    if (!enableCheckboxes && !selectedStates.some((option: any) => option.id === data.id)) {
                      handleStateSelection(event, data)
                    }
                  }}
                >
                  {enableCheckboxes && (
                    <CheckBox
                      id={data.id}
                      name={data.id}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => handleStateSelection(event, data)}
                      checked={selectedStates && selectedStates.some((option: any) => option.id === data.id)}
                    />
                  )}
                  <div>
                    <label
                      htmlFor={data.id}
                      className={`${enableCheckboxes ? 'pl-[11px]' : ''} flex cursor-pointer items-center p-1 text-sm`}
                    >
                      <Avatar key={data.id} variant='small' className='mr-[10px] !opacity-100' name={data.name} />
                      {data.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className=''>
            <Button
              variant='btn-primary'
              className='btn-md flex w-full items-center justify-center disabled:opacity-50'
              disabled={loaderStatus ? true : false}
              onClick={onApply}
            >
              {loaderStatus ? (
                <div className={`flex w-full items-center justify-center`}>
                  <div className='animate-spin '>
                    <SpinnerIcon bgColor='#FFF' />
                  </div>
                </div>
              ) : (
                <Typography className='px-6 py-3 !text-[14px] font-semibold'>SAVE</Typography>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
