import { EyeClose, EyeOpen } from '@/assets/Icons/EyeIcon'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import { useAppSelector } from '@/store/configureStore'
import { MenuIcon, Textarea, Tooltip } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'

interface CardProps {
    accountingTool: number
    selectedTab: string
    id: number
    paymentMethodSetupId: number
    bankName: string
    title: string
    routingNumber: string
    notes?: string
    isApproved?: boolean
    isActivate?: boolean
    accountNumber: string
    accountId: string
    isVerified?: boolean
    handleMenuOption: (arg1: string, arg2: number, arg3: string, arg4: number, arg5: string) => void
}

const Card: React.FC<CardProps> = ({ selectedTab, title, id, bankName, routingNumber, isActivate, isVerified, isApproved, notes, accountNumber, paymentMethodSetupId, accountId, accountingTool, handleMenuOption }) => {
    const divRef = useRef<HTMLDivElement>(null)
    const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
    const isPaymentSetupEdit = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Payment Setup", "Edit");

    const [isMenuClicked, setIsMenuClicked] = useState<boolean>(false)
    const [maskedAccountNumber, setMaskedAccountNumber] = useState<string>(accountNumber.length >= 4 ? 'X'.repeat((accountNumber.length) - 4) + accountNumber.slice((accountNumber.length) - 4) : accountNumber);
    const [isAccountNumberShow, setIsAccountNumberShow] = useState<boolean>(false)

    // Handel Outside Click
    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (divRef.current && !divRef.current.contains(event.target as Node)) {
                setIsMenuClicked(false)
            }
        }

        if (isMenuClicked) {
            document.addEventListener('mousedown', handleOutsideClick)
        } else {
            document.removeEventListener('mousedown', handleOutsideClick)
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [isMenuClicked])

    const CheckItems = [!isVerified && !isApproved && title === "Check" ? "Microdeposit Verification" : isVerified && !isApproved ? "Approve Check Layout" : "View Check Layout"]
    const menuItems = [
        "View Details",
        ((selectedTab === "bank" && accountingTool !== 1) || title === "Check") && (isActivate && isPaymentSetupEdit) ? "Edit Details" : "",
        selectedTab === "bank"
            ? (isActivate ? "Deactivate Bank Account" : "Activate Bank Account")
            : (isApproved ? `${isActivate ? "Disable" : "Enable"} Check` : title === "Check" ? "" : `${isActivate ? "Disable" : "Enable"} ${title}`),
        ...(title === "Check" ? CheckItems : [])
    ].filter(item => item !== "");

    const handelAccountNumber = (isShow: boolean) => {
        setIsAccountNumberShow(isShow)
        if (!isShow) {
            setMaskedAccountNumber('X'.repeat((accountNumber.length) - 4) + accountNumber.slice((accountNumber.length) - 4));
        } else {
            setMaskedAccountNumber(accountNumber);
        }
    }

    return (
        <div className={`w-[341px] shadow-lg rounded-md h-fit`}>
            <div className='flex px-5 bg-whiteSmoke justify-between rounded-t h-[58px]'>
                <div className={`h-full flex items-center w-full text-base font-proxima font-bold tracking-[0.02em] ${!isActivate ? "bg-whiteSmoke  opacity-50" : ""}`}>
                    {/* {tab == "bank" && <div className='rounded w-2 h-2 bg-green-500 mr-1'></div>} */}
                    {title}
                </div>
                <div ref={divRef} className='h-full relative flex items-center' onClick={() => setIsMenuClicked(!isMenuClicked)}>
                    <MenuIcon size='small' direction='kebab' classname='!h-full' />
                    {isMenuClicked && <div className='bg-white z-[1] flex flex-col rounded absolute top-12 right-1.5 w-[202px] '
                        style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                        {menuItems.map((option, index) => (
                            <label key={index + option} className='h-[44px] w-full px-2.5 py-[15px] font-proxima text-sm flex items-center cursor-pointer' onClick={() => handleMenuOption(option, id, title, paymentMethodSetupId, accountId)} >{option}</label>
                        ))}
                    </div>}
                </div>
            </div>
            {selectedTab == "payment" &&
                <div className={`px-5 pt-[27px] ${!isActivate ? "bg-whiteSmoke  opacity-50" : ""}`}>
                    <label className='text-xs text-slatyGrey font-proxima'>Bank Name </label><br />
                    <label className='pt-2.5 text-sm text-[#333333] font-proxima'>{bankName}</label>
                </div>}
            <div className={`h-[102px] px-5 py-[27px]  ${!isActivate ? "bg-whiteSmoke  opacity-50 pointer-events-none" : ""}`}>
                <label className='text-xs text-slatyGrey font-proxima'>Account Number:</label><br />
                <span className='flex h-6 pt-0.5 justify-between items-center'>
                    <label className='text-sm text-[#333333] font-proxima'>{maskedAccountNumber}</label>
                    <div className='h-full w-6 flex justify-center cursor-pointer' onClick={() => handelAccountNumber(!isAccountNumberShow)}>
                        {isAccountNumberShow
                            ? <EyeOpen />
                            : <Tooltip content={`Show Account Number`} position='left' className='!py-0 !px-2'>
                                <EyeClose />
                            </Tooltip>}
                    </div>
                </span>
            </div>
            <div className={`h-[68px] px-5 pb-[20px] break-words ${!isActivate ? "bg-whiteSmoke  opacity-50" : ""}`}>
                <label className='text-xs text-slatyGrey font-proxima'>Routing Number :</label><br />
                <label className='pt-2.5 text-sm text-[#333333] font-proxima'>{routingNumber}</label>
            </div>
            {selectedTab == "bank" &&
                <div className={`p-5 border-t-[1px] border-lightSilver ${!isActivate ? "bg-whiteSmoke  opacity-50" : ""}`}>
                    <Textarea
                        className='resize-none !bg-transparent text-[14px]'
                        label='Notes'
                        id='notes'
                        name='notes'
                        disabled
                        value={notes}
                        readOnly
                        placeholder='Notes'
                        rows={3}
                        getValue={() => { }}
                        getError={() => { }}
                    />
                </div>
            }
        </div>
    )
}

export default Card