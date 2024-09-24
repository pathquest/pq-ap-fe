'use client'
import ChevronDownIcon from '@/assets/Icons/ChevronDownIcon'
import InfoIcon from '@/assets/Icons/infoIcon'
import KYCIcon from '@/assets/Icons/KYCIcon'
import PlusIcon from '@/assets/Icons/PlusIcon'
import PlusSetupIcon from '@/assets/Icons/PlusSetupIcon'
import SuccessIcon from '@/assets/Icons/SuccessIcon'
import SyncIcon from '@/assets/Icons/SyncIcon'
import WarningIcon from '@/assets/Icons/WarningIcon'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import { BankAccountListOption, PaymentMethodOption, PaymentSetupListOptions } from '@/models/paymentSetup'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { activateBankAccount, buyerBankList, companyKYC, deactivateBankAccount, getKYCStatus, paymentMethodList, savePaymentMethod, setCustomerKycStatus, syncBankAccount } from '@/store/features/paymentsetting/paymentSetupSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge, Button, Close, Loader, Modal, ModalAction, ModalContent, ModalTitle, Toast, Tooltip } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import React, { useEffect, useRef, useState } from 'react'
import AccountDrawer from '../AccountDrawer'
import Card from '../Card'
import CheckApprove from '../CheckApprove'
import CheckDrawer from '../CheckDrawer'
import PaymentSetupDrawer from '../PaymentSetupDrawer'

const ListPaymentSetup: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId) ?? 0
  const accountingTool = Number(session?.user?.AccountingTool)
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isPaymentSetupCreate = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Payment Setup", "Create");
  const isPaymentSetupSync = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Payment Setup", "Sync");
  const isPaymentSetupView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Payment Setup", "View");

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
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [paymentMethodName, setPaymentMethodName] = useState<string>('')
  const [kycMessage, setKycMessage] = useState<string>('')
  const [modeId, setModeId] = useState<number>(0)
  const [mode, setMode] = useState<string>('')
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [activateId, setAactivateId] = useState<number>(0)
  const [bankAccountList, setBankAccountList] = useState<BankAccountListOption[]>([])
  const [buyerPaymentMethodList, setBuyerPaymentMethodList] = useState<PaymentSetupListOptions[]>([])
  const [refreshTable, setRefreshTable] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false)
  const [isKYCModalOpen, setIsKYCModalOpen] = useState<boolean>(false)
  const [paymentMethodSetupId, setPaymentMethodSetupId] = useState<number>(0)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false)
  const [disableActionName, setDisableActionName] = useState<string>('')

  const [currentCheckStep, setCurrentCheckStep] = useState<number>(0)

  const [isCheckApproveScreenOpen, setIsCheckApproveScreenOpen] = useState<boolean>(false)
  const [accountId, setAccountId] = useState<string>('')
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!isPaymentSetupView) {
      router.push('/manage/companies');
    }
  }, [isPaymentSetupView]);

  const handleToggleChange = () => {
    if (customerKycStatus) {
      setIsOpenAccountDrawer(true)
      setMode("Add")
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
        handlePaymentMethodStatus(id, paymentMethodSetupId, null, true, null);
        break
      case 'Disable ACH':
        setDisableActionName('Disable ACH')
        setIsDeactivateModalOpen(true)
        setAactivateId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        break
      case 'Enable ACH':
        handlePaymentMethodStatus(id, paymentMethodSetupId, true, null, null);
        break
      case 'Disable Check':
        setDisableActionName('Disable Check')
        setIsDeactivateModalOpen(true)
        setAactivateId(id)
        setPaymentMethodSetupId(paymentMethodSetupId)
        break
      case 'Enable Check':
        handlePaymentMethodStatus(id, paymentMethodSetupId, null, null, true);
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
      switch (disableActionName) {
        case "Disable ACH":
          handlePaymentMethodStatus(activateId, paymentMethodSetupId, false, null, null);
          break;
        case "Disable Virtual Card":
          handlePaymentMethodStatus(activateId, paymentMethodSetupId, null, false, null);
          break;
        case "Disable Check":
          handlePaymentMethodStatus(activateId, paymentMethodSetupId, null, null, false);
          break;
        default:
          break
      }
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
    setIsSyncModalOpen(false)
    setIsAlertModalOpen(false)
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
    getBuyerBankList()
    if (customerKycStatus == "Approved") {
      getPaymentMethodList()
    }
  }, [refreshTable, CompanyId, customerKycStatus])

  useEffect(() => {
    if (CompanyId) {
      getCurrentKYCStatus()
    }
  }, [CompanyId])

  useEffect(() => {
    if (customerKycStatus == "Pending" && bankAccountList.length == 0 && !isLoading) {
      setIsAlertModalOpen(true)
    } else {
      setIsAlertModalOpen(false)
    }
  }, [customerKycStatus, bankAccountList])

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

    // window.open(`${process.env.KYC_FORM_URL}`, '_blank', 'noopener,noreferrer');
    // router.push('https://kyc.pathquest.com/')
    router.push('/paymentsetting/paymentsetup/KYCForm')
    setIsKYCModalOpen(false)
  }

  const handleKYCForm = () => {
    if (customerKycStatus === "Pending") {
      setIsKYCModalOpen(true)
    } else {
      handleKYCFormSubmit()
    }
  }

  const handlePaymentMethodStatus = async (paymentSetupId: number, paymentMethodSetupId: number, isAch: boolean | null, isVcn: boolean | null, isCheck: boolean | null) => {
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

  const handleTabClick = (tabId: string) => {
    if (selectedTab == "bank") {
      if (bankAccountList.length === 0 && customerKycStatus === "Approved") {
        setSelectedTab("bank");
        Toast.error('Add Bank Account First', 'You need to add bank account first before creating payment method setup')
      } if (bankAccountList.length > 0 && customerKycStatus === "Approved") {
        setSelectedTab('payment');
      }
      else {
        setSelectedTab("bank");
        Toast.error('Complete KYC Process First', 'You need to complete KYC process and add at least one bank account before payment method setup')
      }
    } else {
      setSelectedTab(tabId);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true)
    modalClose()
    performApiAction(dispatch, syncBankAccount, null, (responseData: any) => {
      if (responseData == true) {
        setIsSyncing(false)
        setRefreshTable(!refreshTable)
        Toast.success('Bank Account sync successfully')
      }
    }, () => {
      // ErrorData
      setIsSyncing(false)
    })
  }


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
                <div className={`!-mr-2 flex items-center ${customerKycStatus !== "Approved" ? "cursor-pointer" : " pointer-events-none cursor-default"}`} onClick={handleKYCForm}>
                  <Tooltip content={`Company KYC`} position='bottom' className='!mx-0 !px-0'>
                    <KYCIcon />
                  </Tooltip>
                </div></>}
              <div className={`cursor-pointer ${isSyncing && 'animate-spin'} ${accountingTool == 4 ? "hidden" : "flex justify-center items-center"}`} onClick={() => setIsSyncModalOpen(true)}>
                <Tooltip content={`Sync Bank Account`} position='left' className='!z-[6] !p-0 h-8 w-8 flex justify-center items-center'>
                  <SyncIcon />
                </Tooltip>
              </div>

              {selectedTab == "bank"
                ? <Button className={`${isPaymentSetupCreate ? "block" : "hidden"} ${(accountingTool === 1) ? "hidden" : "block"} cursor-pointer rounded-full !h-9 laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]`} variant="btn-primary" onClick={handleToggleChange}>
                  <div className='flex justify-center items-center font-bold'>
                    <span className='mr-[8px]'>
                      <PlusIcon color="#FFF" />
                    </span>
                    <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em] pr-1'>ADD BANK ACCOUNT</label>
                  </div>
                </Button>
                : <div ref={divRef} className={`relative ${isPaymentSetupCreate ? "block" : "hidden"}`}>
                  <Button className={`relative rounded-full !h-9 cursor-pointer`} variant="btn-primary" onClick={() => setIsULOptionOpen(!isULOptionOpen)}>
                    <div className='flex h-full'>
                      <span className='pr-2 flex items-center'> <PlusSetupIcon /></span>
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
            customerKycStatus === "Received" && bankAccountList.length === 0
            ? <div className='h-[54px] w-full bg-warningColor flex items-center px-5'>
              <WarningIcon /> <label className='ml-2 text-[#664D03] font-bold font-proxima text-base tracking-wide'>{kycMessage}</label>
            </div>
            : (customerKycStatus === "Canceled" || customerKycStatus === "Declined" || customerKycStatus === "Suspended") ?
              <div className='h-[54px] w-full bg-[#F8D7DA] flex items-center px-5'>
                <InfoIcon bgColor="#DC3545" /><label className='ml-2 text-[#DC3545] font-bold font-proxima text-base tracking-wide'>{kycMessage}</label>
              </div>
              : ""
          }

          {/* Cards */}
          {isStatusLoading || isLoading
            ? <div className='flex h-full w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div>
            : bankAccountList.length === 0 && !isLoading && selectedTab == "bank"
              ? customerKycStatus === "Approved" && <div className='h-[54px] w-full bg-primary flex items-center px-5'>
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

      {/* Sync Modal */}
      <ConfirmationModal
        title='Sync'
        content={`Are you sure you want to sync Bank Account ?`}
        isModalOpen={isSyncModalOpen}
        modalClose={modalClose}
        handleSubmit={handleSync}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {/* Deactivate Modal */}
      <Modal isOpen={isActivateModalOpen} onClose={modalClose} width={'500px'}>
        <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
          <div className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-medium tracking-[0.02em] text-darkCharcoal'>Deactivate Bank Account</div>
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

      {/* Alert Modal */}
      <Modal isOpen={isAlertModalOpen} onClose={modalClose} width={'800px'}>
        <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
          <div className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg font-medium tracking-[0.02em] text-darkCharcoal'>Alert</div>
          <div className='pt-2.5' onClick={modalClose}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <ModalContent className='mb-5 mt-2.5 px-5'>
          <div className='text-sm font-proxima text-darkCharcoal tracking-[0.02em]'>To proceed with payments via ACH, virtual card, or check, you must complete the KYC (Know Your Customer) process. Without this verification, these payment methods will be unavailable. However, you can still make payments using Cash or Record transfer if bank details are captured.</div>
          <div className='mt-4 text-sm font-proxima text-darkCharcoal tracking-[0.02em]'>Please ensure to complete the KYC process to avoid any disruptions in your payment options. KYC process may take up to two weeks time.</div>
        </ModalContent>

        <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button
            className='btn-sm !h-9 rounded-full !w-[53px]'
            variant='btn-primary'
            onClick={modalClose}>
            <label className="cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">OK</label>
          </Button>
        </ModalAction>
      </Modal>
    </Wrapper>
  )
}

export default ListPaymentSetup