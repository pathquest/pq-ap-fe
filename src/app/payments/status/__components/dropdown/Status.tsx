import Search from '@/assets/Icons/payments/SearchIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { StatusType } from '@/models/paymentStatus'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setStatusIdList } from '@/store/features/paymentstatus/paymentStatusSlice'
import { Button, CheckBox } from 'pq-ap-lib'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const Status: React.FC<StatusType> = ({ statusList }) => {
    // For Dynamic Company Id & AccountingTool
    const { selectedCompany } = useAppSelector((state) => state.user)
    const { statusIdList } = useAppSelector((state) => state.paymentStatus)
    const CompanyId = selectedCompany?.value
    const dispatch = useAppDispatch()

    const dropDownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('')
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [selectedLabel, setSelectedLabel] = useState<string>('')
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    useEffect(() => {
        if (statusList.length > 0 && statusIdList) {
            setSelectedValues(statusIdList);
        }
    }, [statusIdList, statusList])

    useEffect(() => {
        if (statusList.length > 0) {
            const allValues = statusList.map(option => option.value);
            setSelectedValues(allValues);
            dispatch(setStatusIdList(allValues))
        }
    }, [CompanyId])

    useEffect(() => {
        if (selectedValues.length > 0) {
            const selectedOption = statusList.find(option => option.value == selectedValues[0])
            if (selectedOption) {
                setSelectedLabel(selectedOption.label)
            }
        } else {
            setSelectedLabel('')
        }
    }, [selectedValues])

    const handleInput = () => {
        setSearchValue('')
        setIsOpen(!isOpen)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.toLowerCase()
        setSearchValue(inputValue)
    }

    const handleSelect = (value: string) => {
        const index = selectedValues.indexOf(value);
        if (index !== -1) {
            setSelectedValues(prevSelectedValues => {
                const updatedValues = [...prevSelectedValues];
                updatedValues.splice(index, 1);
                setSelectedValues(updatedValues);
                // dispatch(setStatusIdList(updatedValues));
                return updatedValues;
            });
        } else {
            setSelectedValues(prevSelectedValues => {
                const updatedValues = [...prevSelectedValues, value];
                // dispatch(setStatusIdList(updatedValues));
                setSelectedValues(updatedValues);
                return updatedValues;
            });
        }
    }

    const handleOutsideClick = useCallback(
        (event: MouseEvent) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        },
        [dropDownRef]
    )

    useEffect(() => {
        window.addEventListener('click', handleOutsideClick)
        return () => {
            window.removeEventListener('click', handleOutsideClick)
        }
    }, [handleOutsideClick])

    const handleClearAll = () => {
        setSelectedValues([]);
        dispatch(setStatusIdList([]))
    };

    const handleSelectAllCheckbox = () => {
        if (selectedValues.length == statusList.length) {
            setSelectedValues([]);
            // dispatch(setStatusIdList([]))
        } else {
            const allValues = statusList.map(option => option.value);
            setSelectedValues(allValues);
            // dispatch(setStatusIdList(allValues))
        }
    };

    const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, option: any, index: number) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement && e.target.tagName == "LI") {
            setFocusedIndex(-1);
            handleSelect(option.value)
        } else if (e.key === "ArrowUp" && index > 0 && isOpen) {
            e.preventDefault();
            setFocusedIndex(index - 1);
        } else if (e.key === "ArrowDown" && index < statusList.length - 1 && isOpen) {
            e.preventDefault();
            setFocusedIndex(index + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSelectAllCheckbox()
        }
    }

    const handleApply = () => {
        setIsOpen(false)
        dispatch(setStatusIdList(selectedValues))
    };

    return (
        <div className='relative'
            ref={dropDownRef}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => (e.key === 'Enter') && setIsOpen(!isOpen)}>
            <div className='flex h-10 items-center px-1' tabIndex={-1}>
                <label
                    className={`flex cursor-pointer select-none items-start bg-transparent outline-none ${isOpen ? "text-primary placeholder:text-primary" : "text-black placeholder:text-black"} text-sm placeholder:text-sm placeholder:font-bold font-bold cursor-pointer`}
                    onClick={handleInput}>
                    {selectedValues.length == 0 ? "Select Status" : selectedValues.length == statusList.length ? "All Status" : selectedValues.length > 1 ? selectedLabel + " +" + (selectedValues.length - 1) : selectedLabel}</label>
                <div
                    className={`ml-2 flex cursor-pointer items-center justify-center text-[1.4rem] transition-transform ${isOpen ? 'duration-400 rotate-180 text-primary' : 'text-slatyGrey duration-200'}`}
                    onClick={handleInput}>
                    <ChevronDown />
                </div>
            </div>

            <ul
                className={`absolute top-[42px] z-20 flex w-[250px] flex-col gap-1 rounded-md border border-lightSilver bg-white drop-shadow-xl transition-transform overflow-y-auto ease-out ${isOpen
                    ? 'max-h-[430px] laptop:max-h-[430px] laptopMd:max-h-[430px] lg:max-h-[430px] xl:max-h-[430px] hd:max-h-[500px] 2xl:max-h-[598px] 3xl:max-h-[598px] translate-y-0 opacity-100 transition-opacity duration-300'
                    : 'max-h-0 translate-y-20 opacity-0 transition-opacity duration-300'
                    }`}>
                <li className={`sticky top-0 z-[5] flex cursor-pointer items-center bg-white px-[15px] py-[10px] text-sm font-normal outline-none focus:bg-whiteSmoke`}>
                    <div className={`absolute flex px-3 py-[10px]`}>
                        <Search />
                    </div>
                    <input
                        tabIndex={isOpen ? 0 : -1}
                        placeholder='Search'
                        onChange={handleInputChange}
                        className={`w-full flex-grow  cursor-pointer h-9 rounded placeholder-slatyGrey border  hover:border-primary border-lightSilver bg-transparent  pl-[35px] text-sm font-normal text-darkCharcoal
                            outline-none placeholder:text-sm tracking-wide`}
                    />
                </li>
                <li tabIndex={isOpen ? 0 : -1} onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => handleKeyDown(event)} className={`${searchValue || statusList.length == 0 ? "hidden" : ""} mx-2 flex pl-3 py-1.5`}>
                    <CheckBox
                        tabIndex={-1}
                        id='select-all-status'
                        checked={statusList?.length > 0 && selectedValues.length == statusList.length}
                        intermediate={selectedValues.length < statusList.length}
                        onChange={handleSelectAllCheckbox}
                    />
                    <label htmlFor='select-all-status' className='cursor-pointer text-sm font-proxima'>
                        Select All
                    </label>
                </li>
                {statusList?.length > 0 && statusList?.some((option) => option.label.toLowerCase().startsWith(searchValue)) ? (
                    statusList?.map((option, index) => (
                        <li
                            key={option.label}
                            className={`flex cursor-pointer items-center justify-between py-2 text-sm font-normal outline-none hover:bg-whiteSmoke focus:bg-whiteSmoke ${!option.label.toLowerCase().startsWith(searchValue) ? 'hidden' : ''}`}
                            onKeyDown={(e) => handleListItemKeyDown(e, option, index)}
                            tabIndex={isOpen ? 0 : -1}
                            ref={(el) => {
                                if (index === focusedIndex) {
                                    el?.focus();
                                }
                            }}>
                            <div className='ml-2 pl-3'>
                                <CheckBox
                                    tabIndex={-1}
                                    key={option.label}
                                    id={option.value}
                                    value={option.value}
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => handleSelect(option.value)}
                                />
                            </div>
                            <div
                                className='flex flex-grow'
                                onClick={() => {
                                    if (option.label !== searchValue) {
                                        handleSelect(option.value)
                                    }
                                }}>
                                <label className='text-sm font-proxima cursor-pointer'>{option.label}</label>
                            </div>
                        </li>
                    ))
                ) : (
                    <span className='flex cursor-pointer items-center pl-3 py-2 mx-[4px] text-sm font-medium hover:bg-whiteSmoke focus:bg-whiteSmoke'>
                        No matching data found.
                    </span>
                )}
                <li className='sticky bottom-0 bg-pureWhite w-full border-t border-lightSilver py-2.5 text-center'>
                    <Button
                        type='submit'
                        onClick={() => handleApply()}
                        className={`btn-sm !h-7 rounded-full !w-[88px]`}
                        variant='btn-primary'>
                        <label className={`h-[17px] flex items-center justify-center laptop:px-[20px] laptopMd:px-[20px] lg:px-[20px] xl:px-[20px] hd:px-[25px] 2xl:px-[25px] 3xl:px-[25px] !py-1.5 cursor-pointer font-proxima font-semibold laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                            APPLY
                        </label>
                    </Button>
                </li>
            </ul>
        </div>
    )
}

export default Status