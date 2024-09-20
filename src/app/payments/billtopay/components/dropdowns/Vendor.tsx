import Search from '@/assets/Icons/payments/SearchIcon'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { setVendorIdList } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'
import { CheckBox } from 'pq-ap-lib'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface Option {
    label: string
    value: string
    isEnable?: boolean
    IsUsed?: boolean
}

interface VendorType {
    vendorOption: Option[];
}

const Vendor: React.FC<VendorType> = ({ vendorOption }) => {
    // For Dynamic Company Id & AccountingTool
    const { data: session } = useSession()
    const CompanyId = Number(session?.user?.CompanyId)
    const { vendorIdList } = useAppSelector((state) => state.billsToPayReducer)

    const dispatch = useAppDispatch()

    const dropDownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('')
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    useEffect(() => {
        if (vendorOption.length > 0) {
            const allValues = vendorOption.map(option => option.value);
            setSelectedValues(allValues);
            dispatch(setVendorIdList(allValues))
        }
    }, [CompanyId])

    useEffect(() => {
        if (vendorOption.length > 0 && vendorIdList) {
            setSelectedValues(vendorIdList);
        }
    }, [vendorIdList, vendorOption])

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
                dispatch(setVendorIdList(updatedValues));
                return updatedValues;
            });
        } else {
            setSelectedValues(prevSelectedValues => {
                const updatedValues = [...prevSelectedValues, value];
                dispatch(setVendorIdList(updatedValues));
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
        dispatch(setVendorIdList([]))
    };

    const handleSelectAllCheckbox = () => {
        if (vendorOption.length === 0) {
            setSelectedValues([]);
            dispatch(setVendorIdList([]));
        } else if (selectedValues.length === vendorOption.length) {
            setSelectedValues([]);
            dispatch(setVendorIdList([]));
        } else {
            const allValues = vendorOption.map(option => option.value);
            setSelectedValues(allValues);
            dispatch(setVendorIdList(allValues));
        }
    };

    const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, option: any, index: number) => {
        if ((e.key === 'Enter') && e.target instanceof HTMLElement && e.target.tagName == "LI") {
            setFocusedIndex(-1);
            handleSelect(option.value)
        } else if (e.key === "ArrowUp" && index > 0 && isOpen) {
            e.preventDefault();
            setFocusedIndex(index - 1);
        } else if (e.key === "ArrowDown" && index < vendorOption.length - 1 && isOpen) {
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

    const handleClearAllKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleClearAll()
        }
    }

    const truncateLabel = (label: string | undefined, maxLength: number): string => {
        if (label && label.length > maxLength) {
            return label.substring(0, maxLength) + '...'
        }
        return label || ''
    }

    return (
        <div className='relative w-full'
            ref={dropDownRef}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => (e.key === 'Enter') && setIsOpen(!isOpen)}>
            <div className='flex h-10 w-full' tabIndex={-1}>
                <div className='flex h-full w-full items-center  justify-center px-1' tabIndex={-1}>
                    <input
                        tabIndex={-1}
                        className={`flex h-full max-w-full cursor-pointer select-none items-start bg-transparent outline-none ${isOpen ? "text-primary placeholder:text-primary" : "text-black placeholder:text-black"} text-sm placeholder:text-sm placeholder:font-semibold font-semibold`}
                        type='text'
                        placeholder='Select Vendor'
                        value={
                            vendorOption.length === 0
                                ? "Select Vendor"
                                : selectedValues.length === vendorOption.length
                                    ? "All Vendor"
                                    : selectedValues.length > 1
                                        ? truncateLabel(vendorOption.find(v => v.value === selectedValues[0])?.label, 11) + " +" + (selectedValues.length - 1)
                                        : selectedValues.length === 1
                                            ? truncateLabel(vendorOption.find(v => v.value === selectedValues[0])?.label, 15)
                                            : "Select Vendor"
                        }
                        onClick={handleInput}
                        readOnly
                    />
                </div>
                <div
                    className={`ml-2 flex cursor-pointer items-center justify-center text-[1.4rem] transition-transform ${isOpen ? 'duration-400 rotate-180 text-primary' : 'text-slatyGrey duration-200'}`}
                    onClick={handleInput}>
                    <ChevronDown />
                </div>
            </div>

            <ul
                className={`absolute top-[42px] z-20 flex w-[250px] flex-col gap-1 rounded border border-lightSilver bg-white drop-shadow-xl transition-transform overflow-y-auto ease-out ${isOpen
                    ? 'max-h-[430px] translate-y-0 opacity-100 transition-opacity duration-300'
                    : 'max-h-0 translate-y-20 opacity-0 transition-opacity duration-300'
                    }`}>
                <li className={`sticky top-0 z-[5] flex cursor-pointer items-center bg-white px-[15px] py-[11px] text-sm font-normal outline-none focus:bg-whiteSmoke`}>
                    <div className={`absolute flex p-[11px]`}>
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
                <li tabIndex={isOpen ? 0 : -1} onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => handleKeyDown(event)} className={`${searchValue || vendorOption.length == 0 ? "hidden" : ""} mx-2 flex pl-3 py-1.5`}>
                    <CheckBox
                        tabIndex={-1}
                        id='select-all-vendor'
                        checked={selectedValues.length == vendorOption.length}
                        intermediate={selectedValues.length < vendorOption.length}
                        onChange={handleSelectAllCheckbox}
                    />
                    <label htmlFor='select-all-vendor' className='cursor-pointer text-sm font-proxima'>
                        Select All
                    </label>
                </li>
                {vendorOption?.length > 0 && vendorOption?.some((option) => option.label.toLowerCase().startsWith(searchValue)) ? (
                    vendorOption?.map((option, index) => (
                        <li
                            key={option.label + index}
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
                    <span className='flex cursor-pointer items-center pl-3 py-[8px] mx-[4px] text-sm font-medium hover:bg-whiteSmoke focus:bg-whiteSmoke'>
                        {vendorOption.length === 0 ? "No data available." : "No matching data found."}
                    </span>
                )}
                <li className='sticky bottom-0 bg-pureWhite w-full border-t border-lightSilver py-[11px] text-center'>
                    <div tabIndex={isOpen ? 0 : -1} onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => handleClearAllKeyDown(event)} className={`tracking-[0.02em] font-proxima cursor-pointer text-base font-semibold text-primary  ${selectedValues.length === 0 ? 'pointer-events-none opacity-70' : ""}`} onClick={handleClearAll}>
                        Clear All
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Vendor