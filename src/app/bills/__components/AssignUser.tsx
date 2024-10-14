'use client'
import { AssignUserProps } from '@/models/billPosting'
import { Avatar, CheckBox } from 'pq-ap-lib'
import { ChangeEvent, useState } from 'react'

export default function AssignUser({
  enableCheckboxes = false,
  userData,
  selectedStates,
  labelRequired,
  setSelectedStates,
  getData,
  setValue,
  dropdownWidth,
  top,
  bottom,
  left,
  right,
  width,
  dropdownAssignUserRef,
  isOpenAssignUserDropDown,
  setIsOpenAssignUserDropDown,
}: AssignUserProps): JSX.Element {
  const [searchText, setSearchText] = useState<string>('')

  const filteredStates = userData?.filter((data: any) => data.name.toLowerCase().includes(searchText))

  const toggleDropdown = () => {
    setIsOpenAssignUserDropDown((prevState: boolean) => !prevState)
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase())
  }

  const handleStateSelection = (event: any, data: any) => {
    if (enableCheckboxes === false) {
      setSelectedStates([data])
      setIsOpenAssignUserDropDown(false)
    } else {
      if (event.target.checked) {
        setSelectedStates([...selectedStates, data])
      } else {
        setSelectedStates(selectedStates.filter((state: any) => state !== data))
      }
    }
  }

  const widthClass = dropdownWidth ? `w-[${dropdownWidth}]` : '';

  let positionClass = '';

  if (isOpenAssignUserDropDown) {
    let topClass = top !== null ? `top-${top}` : '';
    let leftClass = left !== null ? `left-${left}` : '';
    let rightClass = right !== null ? `right-${right}` : '';
    let bottomClass = bottom !== null ? `bottom-${bottom}` : '';

    positionClass = `absolute z-[10] block !pt-2 ${topClass} ${leftClass} ${rightClass} ${bottomClass}`;
  } else {
    positionClass = 'hidden';
  }

  return (
    <div className='relative'>
      <div className='flex cursor-pointer select-none items-center justify-between' onClick={toggleDropdown}>
        <div className={`flex ${widthClass}`}>
          <div className='flex items-center justify-center'>
            {selectedStates && selectedStates?.length === 0 && <img src='/avatar.png' alt='avatar' />}
            {selectedStates &&
              selectedStates.map((name: any, index: any) => {
                if (index < 3) {
                  return <Avatar key={index} variant='x-small' className='ml-[-15px]' name={name.name} />
                } else if (index === 3) {
                  return (
                    <Avatar
                      key={index}
                      variant='x-small'
                      className='ml-[-15px] !opacity-100'
                      name={`+${selectedStates.length.toString()}`}
                    />
                  )
                }
                return null
              })}
          </div>
          {!enableCheckboxes && labelRequired && (
            <span
              className='ml-2 flex items-center justify-center truncate overflow-ellipsis pr-1'
              title={`${selectedStates && selectedStates.length > 0 && selectedStates[0].name}`}
            >
              {' '}
              {selectedStates && selectedStates.length > 0 && selectedStates[0].name}
            </span>
          )}
        </div>

        <span>
          <svg
            className={`ml-1 h-3 w-3 text-[#6E6D7A] ${isOpenAssignUserDropDown ? 'rotate-180 transform' : ''}`}
            width='12'
            height='8'
            viewBox='0 0 12 8'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M6.40078 7.5L0.800781 1.69149L1.9495 0.5L6.40078 5.11702L10.8521 0.5L12.0008 1.69149L6.40078 7.5Z'
              fill='#6E6D7A'
            />
          </svg>
        </span>
      </div>

      <div
        ref={dropdownAssignUserRef}
        className={positionClass}
      >
        <div className={`w-${width} rounded-lg bg-white shadow-2xl`}>
          <div className='sticky top-0 px-[15px] pt-[15px]'>
            <div className='pointer-events-none absolute top-[25px] flex items-center pl-3'>
              <svg
                className='h-3 w-3 text-gray-500'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 20 20'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                />
              </svg>
            </div>
            <input
              type='search'
              id='default-search'
              className='block h-8 w-full rounded border border-lightSilver pl-8 text-sm outline-none focus:border-[#02b89d]'
              placeholder='Search'
              onChange={handleSearch}
              value={searchText}
            />
          </div>
          <div className={`custom-scroll-PDF z-10 overflow-auto max-h-[300px]`}>
            <ul className={`${filteredStates?.length === 0 ? 'pt-[15px]' : ''} mt-3 h-auto cursor-pointer overflow-y-auto`}>
              {filteredStates?.map((data: any, key: any) => (
                <li
                  key={data.id}
                  className={`flex items-center px-[15px] py-1 hover:bg-[#EEF4F8] ${selectedStates && selectedStates.some((option: any) => option.id === data.id)
                      ? 'cursor-not-allowed bg-[#EEF4F8]'
                      : ''
                    }`}
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
                      className={`${enableCheckboxes ? 'pl-[11px]' : ''} flex ${selectedStates.some((option: any) => option.id === data.id) ? 'cursor-not-allowed' : 'cursor-pointer'
                        } items-center p-1 text-sm`}
                    >
                      <Avatar key={data.id} variant='x-small' className='mr-[10px] !opacity-100' name={data.name} />
                      {data.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
