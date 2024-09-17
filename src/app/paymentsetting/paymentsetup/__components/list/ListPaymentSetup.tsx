'use client'
import ChevronDownIcon from '@/assets/Icons/ChevronDownIcon'
import InfoIcon from '@/assets/Icons/infoIcon'
import KYCIcon from '@/assets/Icons/KYCIcon'
import PlusSetupIcon from '@/assets/Icons/PlusSetupIcon'
import SuccessIcon from '@/assets/Icons/SuccessIcon'
import SyncIcon from '@/assets/Icons/SyncIcon'
import WarningIcon from '@/assets/Icons/WarningIcon'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import { BankAccountListOption, PaymentMethodOption, PaymentSetupListOptions } from '@/models/paymentSetup'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { activateBankAccount, buyerBankList, companyKYC, deactivateBankAccount, getKYCStatus, paymentMethodList, savePaymentMethod, setCustomerKycStatus } from '@/store/features/paymentsetting/paymentSetupSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge, Button, Close, Loader, Modal, ModalAction, ModalContent, ModalTitle, NavigationBar, Toast, Tooltip } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import AccountDrawer from '../AccountDrawer'
import Card from '../Card'
import CheckApprove from '../CheckApprove'
import CheckDrawer from '../CheckDrawer'
import PaymentSetupDrawer from '../PaymentSetupDrawer'
import PlusIcon from '@/assets/Icons/PlusIcon'

const ListPaymentSetup: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId) ?? 0
  const accountingTool = Number(session?.user?.AccountingTool)

  const dispatch = useAppDispatch()
  const { customerKycStatus } = useAppSelector((state) => state.paymentSetupSlice)
  const router = useRouter()

  const tabs = [
    { id: 'bank', label: 'BANK ACCOUNT SETUP' },
    { id: 'payment', label: 'PAYMENT METHOD SETUP' }
  ]

  const methodSetupOptions = [
    { label: 'Virtual Card', value: 'Virtual Card' },
    { label: 'ACH', value: 'ACH' },
    { label: 'Check', value: 'Check' }
  ]

  const divRef = useRef<HTMLDivElement>(null);

  const [selectedTab, setSelectedTab] = useState<string>('bank')

  const [isOpenAccountDrawer, setIsOpenAccountDrawer] = useState<boolean>(false)
  const [isOpenCheckDrawer, setIsOpenCheckDrawer] = useState<boolean>(false)
  const [isOpenVirtualCardDrawer, setIsOpenVirtualCardDrawer] = useState<boolean>(false)
  const [isULOptionOpen, setIsULOptionOpen] = useState<boolean>(false)
  const [isSpin, setIsSpin] = useState<boolean>(false)
  const [paymentMethodName, setPaymentMethodName] = useState<string>('')
  const [kycMessage, setKycMessage] = useState<string>('')
  const [modeId, setModeId] = useState<number>(0)
  const [mode, setMode] = useState<string>('')
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false)
  const [activateId, setAactivateId] = useState<number>(0)
  const [bankAccountList, setBankAccountList] = useState<BankAccountListOption[]>([])
  const [buyerPaymentMethodList, setBuyerPaymentMethodList] = useState<PaymentSetupListOptions[]>([])
  const [refreshTable, setRefreshTable] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false)
  const [isKYCModalOpen, setIsKYCModalOpen] = useState<boolean>(false)
  const isTablet = useMediaQuery({ query: '(max-width: 1023px)' })
  const [visibleTab, setVisibleTab] = useState<number>(2)
  const [paymentMethodSetupId, setPaymentMethodSetupId] = useState<number>(0)
  const [isPendingKYCTooltipShow, setIsPendingKYCTooltipShow] = useState<boolean>(true)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false)
  const [disableActionName, setDisableActionName] = useState<string>('')

  const [currentCheckStep, setCurrentCheckStep] = useState<number>(0)

  const [isCheckApproveScreenOpen, setIsCheckApproveScreenOpen] = useState<boolean>(false)
  const [accountId, setAccountId] = useState<string>('')
  const [hideAlert, setHideAlert] = useState(true);

  useEffect(() => {
    if (isTablet) {
      setVisibleTab(1)
    }
    else {
      setVisibleTab(2)
    }
  }, [isTablet])

  const handleToggleChange = () => {
    if (customerKycStatus == "Approved") {
      setIsOpenAccountDrawer(true)
      setMode("Add")
    } else {
      setHideAlert(true)
      setIsPendingKYCTooltipShow(true)
    }
  }

  const handlePaymentMethodSetupChange = (option: string) => {
    setMode("Add")
    switch (option) {
      case 'Virtual Card':
        setIsOpenVirtualCardDrawer(true);
        setPaymentMethodName("Virtual Card");
        break
      case 'ACH':
        setIsOpenVirtualCardDrawer(true);
        setPaymentMethodName("ACH");
        break
      case 'Check':
        setIsOpenCheckDrawer(true)
        setPaymentMethodName("Check");
        break
      default:
        break
    }
  }

  const handleMenuChange = (actionName: string, id: number, title: string, paymentMethodSetupId: number, accountId: string) => {
    switch (actionName) {
      case 'View Details':
        setModeId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        setMode("View")
        if (title == "Check") {
          setIsOpenCheckDrawer(true);
          setPaymentMethodName("Check");
        } else if (title == "ACH") {
          setIsOpenVirtualCardDrawer(true);
          setPaymentMethodName("ACH");
        } else if (title == "Virtual Card") {
          setIsOpenVirtualCardDrawer(true);
          setPaymentMethodName("Virtual Card");
        }
        else {
          setIsOpenAccountDrawer(true);
        }
        break
      case 'Edit Details':
        setModeId(id)
        setMode("Edit")
        setPaymentMethodSetupId(paymentMethodSetupId)
        if (title == "Check") {
          setIsOpenCheckDrawer(true);
          setPaymentMethodName("Check");
        } else if (title == "ACH") {
          setIsOpenVirtualCardDrawer(true);
          setPaymentMethodName("ACH");
        } else if (title == "Virtual Card") {
          setIsOpenVirtualCardDrawer(true);
          setPaymentMethodName("Virtual Card");
        }
        else {
          setIsOpenAccountDrawer(true);
        }
        break
      case 'Deactivate Bank Account':
        setAactivateId(id)
        setIsActivateModalOpen(true);
        break
      case 'Activate Bank Account':
        activateCurrentBankAccount(id)
        break
      case 'Disable Virtual Card':
        setDisableActionName('Disable Virtual Card')
        setIsDeactivateModalOpen(true)
        setAactivateId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        break
      case 'Enable Virtual Card':
        handlePaymentMethodStatus(id, paymentMethodSetupId, false, true, false);
        break
      case 'Disable ACH':
        setDisableActionName('Disable ACH')
        setIsDeactivateModalOpen(true)
        setAactivateId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        break
      case 'Enable ACH':
        handlePaymentMethodStatus(id, paymentMethodSetupId, true, false, false);
        break
      case 'Disable Check':
        setDisableActionName('Disable Check')
        setIsDeactivateModalOpen(true)
        setAactivateId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        break
      case 'Enable Check':
        handlePaymentMethodStatus(id, paymentMethodSetupId, false, false, true);
        break
      case "Microdeposit Verification":
        setModeId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        setMode("Add")
        setCurrentCheckStep(1)
        setIsOpenCheckDrawer(true);
        break
      case "Approve Check Layout":
        setAccountId(accountId)
        setPaymentMethodSetupId(paymentMethodSetupId)
        setMode("Approve")
        setIsCheckApproveScreenOpen(true)
        break
      case "View Check Layout":
        setMode("View")
        setIsCheckApproveScreenOpen(true)
        setModeId(id)
        break
      default:
        break
    }
  }

  const handleDisableSubmit = () => {
    if (disableActionName) {
      handlePaymentMethodStatus(activateId, paymentMethodSetupId, false, false, false);
    }
  }

  // Clicked outside the UL
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setIsULOptionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCompanyKYC = async () => {
    setIsLoading(true)
    performApiAction(dispatch, companyKYC, null, (responseData: any) => {
    })
  }

  const getCurrentKYCStatus = async () => {
    setIsLoading(true)
    performApiAction(dispatch, getKYCStatus, null, (responseData: any) => {
      const { Status, Message } = responseData
      setIsLoading(false)
      setKycMessage(Message)
      dispatch(setCustomerKycStatus(Status))
    }, () => {
      setKycMessage('')
      setIsLoading(false)
      dispatch(setCustomerKycStatus("Pending"))
    })
  }

  const handleDrawerClose = (type: string) => {
    setIsOpenVirtualCardDrawer(false)
    setIsOpenCheckDrawer(false)
    setIsOpenAccountDrawer(false)
    setMode("")
    setModeId(0)
    setPaymentMethodSetupId(0)
    setCurrentCheckStep(0)
    setAccountId('')

    if (type === "Save") {
      setRefreshTable(!refreshTable)
    }
  }

  const modalClose = () => {
    setIsActivateModalOpen(false)
    setAactivateId(0)
    setIsKYCModalOpen(false)
    setIsDeactivateModalOpen(false)
    setDisableActionName('')
    setPaymentMethodSetupId(0)
  }

  const handleSubmit = () => {
    setIsActivateModalOpen(false)
    deactivateCurrentBankAccount()
  }

  const getBuyerBankList = async () => {
    setIsStatusLoading(true)
    performApiAction(dispatch, buyerBankList, null, (responseData: any) => {
      setIsStatusLoading(false)
      setBankAccountList(responseData)
    }, () => {
      setIsStatusLoading(false)
      setBankAccountList([])
    })
  }

  const getPaymentMethodList = async () => {
    performApiAction(dispatch, paymentMethodList, null, (responseData: any) => {
      setIsStatusLoading(false)
      setBuyerPaymentMethodList(responseData)
    }, () => {
      setBuyerPaymentMethodList([])
    })
  }

  const deactivateCurrentBankAccount = async () => {
    setIsStatusLoading(true)
    const params = {
      PaymentSetupId: activateId,
    }
    performApiAction(dispatch, deactivateBankAccount, params, () => {
      Toast.success('Bank account deactivated successfully.')
      setRefreshTable(!refreshTable)
      setAactivateId(0)
    }, () => {
      setIsStatusLoading(false)
    })
  }

  const activateCurrentBankAccount = async (id: number) => {
    setIsStatusLoading(true)
    const params = {
      PaymentSetupId: id,
    }
    performApiAction(dispatch, activateBankAccount, params, () => {
      Toast.success('Bank account activated successfully.')
      setRefreshTable(!refreshTable)
    }, () => {
      setIsStatusLoading(false)
    })
  }

  useEffect(() => {
    if (CompanyId || isKYCModalOpen) {
      getCurrentKYCStatus()
    }
  }, [CompanyId, isKYCModalOpen])

  useEffect(() => {
    if (customerKycStatus == "Approved") {
      getBuyerBankList()
      getPaymentMethodList()
    }
  }, [refreshTable, CompanyId, customerKycStatus])

  const handleModalClose = (type: string) => {
    setIsCheckApproveScreenOpen(false)
    setModeId(0)
    setAccountId('')
    setPaymentMethodSetupId(0)
    if (type === "Save") {
      setRefreshTable(!refreshTable)
    }
    setSelectedTab("payment")
  }

  const handleKYCFormSubmit = () => {
    customerKycStatus === "Pending" && getCompanyKYC()

    window.open(`${process.env.KYC_FORM_URL}`, '_blank', 'noopener,noreferrer');
    setIsKYCModalOpen(false)
    // router.push('https://kyc.pathquest.com/')
    // router.push('/paymentsetting/paymentsetup/KYCForm')
  }

  const handleKYCForm = () => {
    if (customerKycStatus === "Pending") {
      setIsKYCModalOpen(true)
    } else {
      handleKYCFormSubmit()
    }
  }

  const handlePaymentMethodStatus = async (paymentSetupId: number, paymentMethodSetupId: number, isAch: boolean, isVcn: boolean, isCheck: boolean) => {
    setIsStatusLoading(true)
    const params = {
      PaymentSetupId: paymentSetupId,
      PaymentSetupMethodId: paymentMethodSetupId,
      isAch: isAch,
      isVcn: isVcn,
      isCheck: isCheck,
    }
    modalClose()

    performApiAction(dispatch, savePaymentMethod, params, () => {
      setRefreshTable(!refreshTable)
      Toast.success(`Payment method status updated successfully.`)
    }, () => {
      setIsStatusLoading(false)
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setHideAlert(false);
      setIsPendingKYCTooltipShow(false)
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPendingKYCTooltipShow]);

  const handleTabClick = (tabId: string) => {
    if (selectedTab == "bank") {
      if (bankAccountList.length === 0) {
        setSelectedTab("bank");
        Toast.error('Add Bank Account First', 'You need to add bank account first before creating payment method setup')
      }
      else {
        setSelectedTab("payment");
      }
    } else {
      setSelectedTab(tabId);
    }
  };

  return (
    <Wrapper masterSettings={true}>

      {/* Navbar */}
      {isCheckApproveScreenOpen
        ? <CheckApprove onClose={(value: string) => handleModalClose(value)} Mode={mode} accountId={accountId} paymentMethodSetupId={paymentMethodSetupId} />
        : <div className='w-full h-full'>
          {/* Navbar */}
          <div key={CompanyId} className='sticky top-0 z-[6] flex h-[66px] w-full items-center justify-between bg-whiteSmoke'>
            <div className='flex items-center justify-center ml-2.5'>
              {tabs.map((tab, index) => (
                <label
                  key={tab.id}
                  className={`tracking-[0.02em] whitespace-nowrap font-proxima px-5 ${tab.id == selectedTab ? 'pointer-events-none cursor-default text-primary text-base font-semibold' : 'text-slatyGrey text-sm cursor-pointer'} ${index !== tabs.length - 1 ? 'border-r border-lightSilver' : ''}`}
                  onClick={() => handleTabClick(tab.id)}>
                  {tab.label}
                </label>
              ))}
            </div>

            {/* <NavigationBar key={CompanyId} tabs={tabs} visibleTab={visibleTab} getValue={(value) => setSelectedTab(value)} /> */}

            <div className='flex items-center gap-5 px-5'>
              {selectedTab == "bank" && <>
                <span className={`${isLoading ? "!hidden" : "!block"}`}>
                  <Badge variant="pill" badgetype={`${customerKycStatus === "Approved" ? "success" : customerKycStatus === "Received" ? "warning" : "error"}`} text={customerKycStatus} effect />
                </span>
                <div className={`flex items-center ${customerKycStatus !== "Approved" ? "cursor-pointer" : " pointer-events-none cursor-default"}`} onClick={handleKYCForm}>
                  <Tooltip content={`Company KYC`} position='bottom' className='!mx-0 !px-0'>
                    <KYCIcon />
                  </Tooltip>
                </div></>}
              <div className={`${isSpin && 'animate-spin'} ${accountingTool == 4 ? "hidden" : "block"}`} >
                <SyncIcon />
              </div>

              {selectedTab == "bank"
                ? <Button className={`${accountingTool === 1 ? "hidden" : "block"} ${customerKycStatus == "Approved" ? "cursor-pointer" : ""} rounded-full !h-9 laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]`} variant={customerKycStatus == "Approved" ? "btn-primary" : 'btn'} onClick={handleToggleChange}>
                  <div className='flex justify-center items-center font-bold'>
                    <span className='mr-[8px]'>
                      <PlusIcon color={customerKycStatus == "Approved" ? "#FFF" : "#6E6D7A"} />
                    </span>
                    <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em] pr-1'>ADD BANK ACCOUNT</label>
                  </div>
                </Button>
                : <div ref={divRef} className={`relative`}>
                  <Button className={`relative rounded-full !h-9 ${customerKycStatus == "Approved" && bankAccountList.length !== 0 ? "cursor-pointer" : "pointer-events-none"}`} variant={customerKycStatus == "Approved" && bankAccountList.length !== 0 ? "btn-primary" : 'btn'} onClick={() => setIsULOptionOpen(!isULOptionOpen)}>
                    <div className='flex h-full'>
                      <span className='pr-2 flex items-center '> <PlusSetupIcon /></span>
                      <label className='flex pr-3 border-r font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>ADD PAYMENT METHOD</label>
                      <span className={`w-[35px] flex justify-center items-center transition-transform ${isULOptionOpen ? "rotate-180 duration-400" : "duration-200"}`}>
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </Button>
                  <ul className={`absolute overflow-y-auto transition-transform end-0 border border-lightSilver top-10 z-[10] mt-[1px] w-[212px] rounded-md bg-white shadow-lg
                  ${isULOptionOpen ? 'max-h-[500px] translate-y-0 opacity-100 transition-opacity duration-300' : 'max-h-0 translate-y-10 opacity-0 transition-opacity duration-300'} ease-out`}>
                    {methodSetupOptions.map((option: PaymentMethodOption, index: number) => (
                      <li onClick={() => handlePaymentMethodSetupChange(option.value)} key={option.value} className={`py-[11px] px-5 hover:bg-whiteSmoke cursor-pointer rounded-md`}>
                        <label className='font-proxima text-sm tracking-[0.02em] cursor-pointer'>{option.label}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              }
            </div>
          </div>
          {(!isLoading && selectedTab == "bank") &&
            customerKycStatus === "Received"
            ? <div className='h-[54px] w-full bg-warningColor flex items-center px-5'>
              <WarningIcon /> <label className='ml-2 text-[#664D03] font-bold font-proxima text-base tracking-wide'>{kycMessage}</label>
            </div>
            : customerKycStatus === "Pending" && !isLoading && isPendingKYCTooltipShow ?
              <div className={`${hideAlert ? "" : "hidden"} h-[54px] w-full bg-warningColor flex items-center px-5`}>
                <WarningIcon /> <label className='ml-2 text-[#664D03] font-bold font-proxima text-base tracking-wide'> Complete KYC before adding Bank & Payment Setup.</label>
              </div>
              : (customerKycStatus === "Canceled" || customerKycStatus === "Declined" || customerKycStatus === "Suspended") ?
                <div className='h-[54px] w-full bg-[#F8D7DA] flex items-center px-5'>
                  <InfoIcon bgColor="#DC3545" /><label className='ml-2 text-[#DC3545] font-bold font-proxima text-base tracking-wide'>{kycMessage}</label>
                </div>
                : ""
          }

          {/* Cards */}
          {customerKycStatus === "Approved" ?
            isStatusLoading ? <div className='flex h-full w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div> :
              bankAccountList.length === 0 && !isLoading && selectedTab == "bank"
                ? <div className='h-[54px] w-full bg-primary flex items-center px-5'>
                  <SuccessIcon /> <label className='ml-2 text-white font-bold font-proxima text-base tracking-wide'>{kycMessage}</label>
                </div>
                : <div className='grid max-[1024px]:grid-cols-2 grid-cols-3 gap-5 px-3 py-5 h-[calc(100vh-135px)] overflow-auto custom-scroll'>
                  {selectedTab == "bank"
                    ? bankAccountList && bankAccountList.map((option, index) => (
                      <Card key={index + Math.random()} selectedTab="bank" accountingTool={accountingTool} isActivate={option.IsActive} id={option.PaymentSetupId} title={option.BankName} bankName={option.BankName} paymentMethodSetupId={option.PaymentSetupMethodId} notes={option.Notes} routingNumber={option.RoutingNumber} accountNumber={option.AccountNumber} accountId={option.AccountId} handleMenuOption={handleMenuChange} />
                    ))
                    : buyerPaymentMethodList && buyerPaymentMethodList.map((option, index) => (
                      <Card key={index + Math.random()} selectedTab="payment" accountingTool={accountingTool} isVerified={option.IsVerified} isApproved={option.isApproved} isActivate={option.IsActive} id={option.PaymentSetupId} title={option.isCheck ? "Check" : option.isAch ? "ACH" : "Virtual Card"} bankName={option.BankName} paymentMethodSetupId={option.PaymentSetupMethodId} routingNumber={option.RoutingNumber} accountNumber={option.AccountNumber} accountId={String(option.AccountId)} handleMenuOption={handleMenuChange} />
                    ))
                  }
                </div>
            : isLoading ? (
              <div className='flex  h-[calc(100vh-150px)] w-full items-center justify-center'>
                <Loader size='md' helperText />
              </div>
            ) : (
              ""
            )
          }
        </div>}

      <AccountDrawer Mode={mode} ModeId={modeId} isOpen={isOpenAccountDrawer} onClose={(value: string) => handleDrawerClose(value)} />
      <PaymentSetupDrawer Mode={mode} ModeId={modeId} paymentMethodName={paymentMethodName} paymentMethodSetupId={paymentMethodSetupId} isOpen={isOpenVirtualCardDrawer} onClose={(value: string) => handleDrawerClose(value)} />
      <CheckDrawer currentStep={currentCheckStep} Mode={mode} ModeId={modeId} isOpen={isOpenCheckDrawer} paymentMethodSetupId={paymentMethodSetupId} onClose={(value: string) => handleDrawerClose(value)} />

      <DrawerOverlay isOpen={isOpenAccountDrawer || isOpenVirtualCardDrawer || isOpenCheckDrawer} onClose={undefined} />

      {/* KYC Modal */}
      <ConfirmationModal
        title='Company KYC Form'
        content='Click on yes to redirect on KYC form filling page.'
        isModalOpen={isKYCModalOpen}
        modalClose={modalClose}
        handleSubmit={handleKYCFormSubmit}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {/* Disable Payment Method Modal */}
      <ConfirmationModal
        title={`${disableActionName}`}
        content={`Are you sure, you want to ${disableActionName}`}
        isModalOpen={isDeactivateModalOpen}
        modalClose={modalClose}
        handleSubmit={handleDisableSubmit}
        colorVariantNo='btn-outline-error'
        colorVariantYes='btn-error'
      />

      {/* Deactivate Modal */}
      <Modal isOpen={isActivateModalOpen} onClose={modalClose} width={'500px'}>
        <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
          <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-medium tracking-[0.02em] text-darkCharcoal'>Deactivate Bank Account</div>
          <div className='pt-2.5' onClick={modalClose}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <ModalContent className='my-5 px-5'>
          <div className='text-base font-proxima text-darkCharcoal tracking-[0.02em]'>By de-activating this bank account, will result in deleting linked payment methods of this account.</div>
          <div className='my-5 text-base font-proxima text-darkCharcoal tracking-[0.02em]'>Are you sure, you want to delete the bank account?</div>
        </ModalContent>

        <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button
            className='btn-sm !h-9 rounded-full !w-[73px]'
            variant='btn-outline-error'
            onClick={modalClose}>
            <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">NO</label>
          </Button>
          <Button
            className='btn-sm !h-9 rounded-full !w-[78px]'
            variant='btn-error'
            onClick={handleSubmit}                >
            <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">YES</label>
          </Button>
        </ModalAction>
      </Modal>
    </Wrapper>
  )
}

export default ListPaymentSetup