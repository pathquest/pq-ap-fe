import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { GLAccountOption } from '@/models/paymentSetup'
import { Option } from '@/models/paymentStatus'
import { useAppDispatch } from '@/store/configureStore'
import { getDepartmentDropdown } from '@/store/features/bills/billSlice'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { GLAccountDropdown, GLAccountDropdownWithType } from '@/store/features/master/glAccountSlice'
import { getBuyerBankById, saveBuyerBank } from '@/store/features/paymentsetting/paymentSetupSlice'
import { cityListDropdown, countryListDropdown, stateListDropdown } from '@/store/features/user/userSlice'
import { useSession } from 'next-auth/react'
import { Button, Close, CountrySelect, Email, MultiSelectChip, ProgressStepper, Select, Text, Textarea, Toast, Typography } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'

import { useEffect, useRef, useState } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: (value: string) => void
  ModeId: number
  Mode: string
}

const AccountDrawer: React.FC<DrawerProps> = ({ isOpen, onClose, ModeId, Mode }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId) ?? 0
  const accountingTool = session?.user?.AccountingTool

  const dispatch = useAppDispatch()

  const steps = ['Financial Details', 'Contact Details', 'Accounting Details'];

  const accountingTypeOptions = [
    { label: 'Savings', value: 'savings' },
    { label: 'Checking', value: 'checking' }
  ]

  const glAccountTypeOptions = [
    { label: 'Bank', value: 'Bank' }
  ]

  const paymentMethodOptions = [
    { label: 'Virtual Card', value: '5' },
    { label: 'ACH', value: '4' }
  ]

  const contentRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modeClass, setModeClass] = useState<string>('')
  const [isModeDisable, setIsModeDisable] = useState<boolean>(false)

  // Financial Details
  const [accountId, setAccountId] = useState<string>('')

  const [accountingType, setAccountingType] = useState<string>('')
  const [accountingTypeError, setAccountingTypeError] = useState<boolean>(false)

  const [routingNumber, setRoutingNumber] = useState<string>('')
  const [routingNumberError, setRoutingNumberError] = useState<boolean>(false)

  const [accountNumber, setAccountNumber] = useState<string>('')
  const [accountNumberError, setAccountNumberError] = useState<boolean>(false)

  const [bankName, setBankName] = useState<string>('')
  const [bankNameError, setBankNameError] = useState<boolean>(false)

  const [branchId, setBranchId] = useState<string>('')
  const [branchIdError, setBranchIdError] = useState<boolean>(false)
  const [branchIdHasError, setBranchIdHasError] = useState<boolean>(false)

  const [accountHolderName, setAccountHolderName] = useState<string>('')
  const [accountHolderNameError, setAccountHolderNameError] = useState<boolean>(false)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([])
  const [notes, setNotes] = useState<string>('')

  // Contact Details
  const [address, setAddress] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [city, setCity] = useState([])
  const [cityId, setCityId] = useState<number>(0)
  const [state, setState] = useState([])
  const [stateId, setStateId] = useState<number>(0)
  const [country, setCountry] = useState([])
  const [countryId, setCountryId] = useState<number>(0)
  const [postalCode, setPostalCode] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [primaryContact, setPrimaryContact] = useState<string>('Same as above')
  const [payToContact, setPayToContact] = useState<string>('Same as above')
  const [returnToContact, setReturnToContact] = useState<string>('Same as above')

  // Accounting Details
  const [glAccountType, setGLAccountType] = useState<string>('')
  const [glAccountTypeError, setGLAccountTypeError] = useState<boolean>(false)

  const [glAccountOptionWithType, setGlAccountOptionWithType] = useState<Option[]>([])
  const [glAccountName, setGlAccountName] = useState<string>('')
  const [glAccountNameError, setGlAccountNameError] = useState<boolean>(false)

  const [glAccountOption, setGlAccountOption] = useState<Option[]>([])
  const [serviceChargeGL, setServiceChargeGL] = useState<string>('')
  const [interestEarnedGL, setInterestEarnedGL] = useState<string>('')

  const [departmentOption, setDepartmentOption] = useState<Option[]>([])
  const [departmentId, setDepartmentId] = useState<string>('')

  const [locationOption, setLocationOption] = useState<Option[]>([])
  const [locationId, setLocationId] = useState<string>('')

  const [defaultPayableGlJournal, setDefaultPayableGlJournal] = useState<string>('')
  const [defaultReceivableGlJournal, setDefaultReceivableGlJournal] = useState<string>('')
  const [lastReconciledBalance, setLastReconciledBalance] = useState<string>('')
  const [lastReconciledDate, setLastReconciledDate] = useState<string>('')
  const [cutOffDate, setCutOffDate] = useState<string>('')

  useEffect(() => {
    if (Mode === "Edit" || Mode === "View") {
      setModeClass('pointer-events-none')
      setIsModeDisable(true)
    }
    else {
      setModeClass('')
      setIsModeDisable(false)
    }
  }, [Mode])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [activeStep]);

  const setErrorTrue = () => {
    // Financial Details
    setAccountingTypeError(true)
    setRoutingNumberError(true)
    setAccountNumberError(true)
    setBankNameError(true)
    setBranchIdError(true)
    setBranchIdHasError(true)
    setAccountHolderNameError(true)

    // Accounting Details
    setGLAccountTypeError(true)
    setGlAccountNameError(true)
  }

  const initialData = () => {
    // Financial Details
    setAccountId('')

    setAccountingType('')
    setAccountingTypeError(false)

    setRoutingNumber('')
    setRoutingNumberError(false)

    setAccountNumber('')
    setAccountNumberError(false)

    setBankName('')
    setBankNameError(false)

    setBranchId('')
    setBranchIdError(false)
    setBranchIdHasError(false)

    setAccountHolderName('')
    setAccountHolderNameError(false)

    setSelectedPaymentMethod([])
    setNotes('')

    // Contact Details
    setAddress('')
    setPhone('')

    setCountry([])
    setCountryId(0)

    setState([])
    setStateId(0)

    setCity([])
    setCityId(0)

    setPostalCode('')
    setEmail('')
    setPrimaryContact('')
    setPayToContact('')
    setReturnToContact('')

    // Accounting Details
    setGLAccountType('')
    setGLAccountTypeError(false)

    setGlAccountName('')
    setGlAccountNameError(false)

    setServiceChargeGL('')
    setInterestEarnedGL('')
    setDepartmentId('')
    setLocationId('')

    setActiveStep(0)
    setIsLoading(false)

    setModeClass('')
    setGlAccountOptionWithType([])
    setGlAccountOption([])

    setDefaultPayableGlJournal('')
    setDefaultReceivableGlJournal('')
    setLastReconciledBalance('')
    setLastReconciledDate('')
    setCutOffDate('')
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  //Country List API
  const getCountryList = () => {
    performApiAction(dispatch, countryListDropdown, null, (responseData: any) => {
      setCountry(responseData)
    })
  }

  //State List API
  const getStateList = () => {
    const params = {
      CountryId: countryId,
    }
    performApiAction(dispatch, stateListDropdown, params, (responseData: any) => {
      setState(responseData)
    })
  }

  //City List API
  const getCityList = () => {
    const params = {
      StateId: stateId,
    }
    performApiAction(dispatch, cityListDropdown, params, (responseData: any) => {
      setCity(responseData)
    })
  }

  //GL Account Dropdown List API
  const getGLAccountDropdown = () => {
    const params = {
      CompanyId: CompanyId
    }
    performApiAction(dispatch, GLAccountDropdown, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
      setGlAccountOption(mappedList)
    })
  }

  //GL Account Dropdown With Type List API
  const getGLAccountDropdownWithType = () => {
    const params = {
      CompanyId: CompanyId
    }
    performApiAction(dispatch, GLAccountDropdownWithType, params, (responseData: any) => {
      const filteredAccountData = responseData.filter((item: GLAccountOption) => item.type == 'Bank' || item.type == 'Banks');
      setGlAccountOptionWithType(filteredAccountData)
    })
  }

  //Buyer Bank Account Get Data API
  const getbuyerBankAccountById = () => {
    const params = {
      PaymentSetupId: ModeId
    }

    performApiAction(dispatch, getBuyerBankById, params, (responseData: any) => {
      const { AccountId, AccountingType, DefaultPaymentMethod, RoutingNumber, AccountNumber, BankName, BranchId, AccountHolderName, Notes, Address, PhoneNumber, Email, PrimaryContact, PayToContact, ReturnToContact, GlAccountType, GlAccountId, ServiceChargeGlId, IntEarnedGlId, DeptartmentId, LocationId, DefaultPayableGl, DefaultReceivableGl, LastReconciledValue, LastReconciledDate, CutOffDate } = responseData
      setAccountId(AccountId || "")
      setAccountingType(AccountingType || 0)
      setRoutingNumber(RoutingNumber || "")
      setAccountNumber(AccountNumber || "")
      setBankName(BankName || '')
      setBranchId(BranchId || '')
      setAccountHolderName(AccountHolderName || '')
      setSelectedPaymentMethod(DefaultPaymentMethod.map((item: number) => String(item)) || [])
      setNotes(Notes || '')

      // Contact Details
      setPhone(PhoneNumber || '')
      const { street1, city, state, country, postalCode } = Address
      setAddress(street1 || '')
      setCountryId(Number(country) || 0)
      setStateId(Number(state) || 0)
      setCityId(Number(city) || 0)
      setPostalCode(postalCode || '')
      setEmail(Email || '')
      setPrimaryContact(PrimaryContact || '')
      setPayToContact(PayToContact || '')
      setReturnToContact(ReturnToContact || '')

      // Accounting Details
      setGLAccountType(GlAccountType + "" || '')
      setGlAccountName(GlAccountId + "" || '')
      setServiceChargeGL(ServiceChargeGlId + "" || '')
      setInterestEarnedGL(IntEarnedGlId + "" || '')
      setDepartmentId(DeptartmentId + "" || '')
      setLocationId(LocationId + "" || '')

      //Intacct Accounting tool company buyer data
      setDefaultPayableGlJournal(DefaultPayableGl || '')
      setDefaultReceivableGlJournal(DefaultReceivableGl || '')
      setLastReconciledBalance(LastReconciledValue || '0.00')
      setLastReconciledDate(LastReconciledDate || '')
      setCutOffDate(CutOffDate || '')
    })
  }

  //Location Dropdown List API
  const getLocationDropdown = () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
      setLocationOption(mappedList)
    })
  }

  //Department Dropdown List API
  const getDepartmentListDropdown = () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, getDepartmentDropdown, params, (responseData: any) => {
      const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
      setDepartmentOption(mappedList)
    })
  }

  //Save Data API
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (Mode === "View") {
      clearAllData("")
    }
    else {
      setIsLoading(true)
      e.preventDefault()
      glAccountType.trim().length <= 0 && setGLAccountTypeError(true)
      glAccountName.trim().length <= 0 && setGlAccountNameError(true)

      if (glAccountType.trim().length > 0 && glAccountName.trim().length > 0) {
        try {
          const params = {
            PaymentSetupMethodId: 0,
            PaymentSetupId: ModeId || 0,
            AccountNumber: accountNumber || "",
            AccountingType: accountingType || "",
            RoutingNumber: routingNumber || "",
            BankName: bankName || "",
            BranchId: branchId || "",
            AccountHolderName: accountHolderName || "",
            Notes: notes || "",
            PhoneNumber: phone || "",
            Email: email || "",
            PrimaryContact: primaryContact || "",
            PayToContact: payToContact || "",
            ReturnToContact: returnToContact || "",
            GlAccountType: glAccountType || "",
            GlAccountId: Number(glAccountName) || 0,
            ServiceChargeGlId: Number(serviceChargeGL) || 0,
            IntEarnedGlId: Number(interestEarnedGL) || 0,
            DeptartmentId: departmentId || "",
            LocationId: locationId || "",
            DefaultPaymentMethod: selectedPaymentMethod.map(item => parseInt(item)) || [],
            Address: {
              street1: address || "",
              city: cityId || 0,
              state: stateId || 0,
              country: countryId || 0,
              postalCode: postalCode || ""
            } || {}
          }

          const { payload, meta } = await dispatch(saveBuyerBank(params))
          if (meta?.requestStatus === 'fulfilled') {
            if (payload?.ResponseStatus === 'Success') {
              Toast.success(`${ModeId ? 'Details Updated!' : 'Account Added!'}`)
              clearAllData("Save")
              setIsLoading(false)
            } else {
              Toast.error('Error', `${payload?.ErrorData.Error}`)
              setIsLoading(false)
            }
          } else {
            Toast.error(`${payload?.status} : ${payload?.statusText}`)
            setIsLoading(false)
          }
        } catch (error) {
          console.error(error)
        }
      }
      else {
        setIsLoading(false)
      }
    }
  }

  const handelNext = () => {
    if (Mode === "Add" || Mode === "Edit") {
      if (activeStep == 0) {
        accountingType.trim().length <= 0 && setAccountingTypeError(true)
        routingNumber.trim().length <= 0 && setRoutingNumberError(true)
        accountNumber.trim().length <= 3 && setAccountNumberError(true)
        bankName.trim().length <= 3 && setBankNameError(true)
        accountHolderName.trim().length <= 3 && setAccountHolderNameError(true)

        if (
          (accountingType.trim().length > 0) &&
          (routingNumber.trim().length > 0) &&
          (accountNumber.trim().length > 3) &&
          (bankName.trim().length > 3) &&
          (accountHolderName.trim().length > 3) &&
          (!branchIdHasError)
        ) {
          setActiveStep(activeStep + 1)
        }
      }
      else {
        setActiveStep(activeStep + 1)
      }
    } else {
      setActiveStep(activeStep + 1)
    }

  }

  useEffect(() => {
    if (isOpen) {
      getCountryList()
      getGLAccountDropdown()
      getGLAccountDropdownWithType()
      getLocationDropdown()
      getDepartmentListDropdown()
      if (ModeId > 0) {
        getbuyerBankAccountById()
      }
    }
  }, [isOpen, ModeId])

  useEffect(() => {
    if (countryId > 0) {
      getStateList()
    }
  }, [countryId])

  useEffect(() => {
    if (stateId > 0) {
      getCityList()
    }
  }, [stateId])

  const formatPaymentDate = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const year = date.getFullYear()

      return `${month}/${day}/${year}`
    }
  }

  return (
    <div
      className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow w-[500px] max-[440px]:w-11/12 sm:w-2/4 lg:w-[500px] xl:w-[500px] hd:w-[500px] 2xl:w-[500px] 3xl:w-[500px] ${isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}>
      <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {Mode} Bank Account {Mode === "Edit" || Mode === "View" ? "Details" : ""}
        </label>
        <div className='pt-2.5' onClick={() => clearAllData("")}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='p-5 flex sticky z-[1] bg-white top-[69px] justify-center  items-center'>
        <div className='w-full'>
          <ProgressStepper steps={steps} activeStep={activeStep} isClickEnable={Mode !== "Add" || activeStep > 0 ? true : false} getCurrentStep={(value: number) => setActiveStep(value)} />
        </div>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {//activeStep === 1 Finacial Details
          activeStep === 0
            ? <div className='mx-5 mb-12 flex-1'>
              <div className={`${modeClass} `}>
                <Text
                  label='Account ID'
                  id='accountId'
                  name='accountId'
                  placeholder='Please Enter Account ID Number'
                  disabled
                  validate
                  value={accountId}
                  getValue={(value) => setAccountId(value)}
                  getError={() => { }}
                />
              </div>
              <div className={`mt-5 ${modeClass} `}>
                <Select
                  label='Accounting Type'
                  id='accountingType'
                  name='accountingType'
                  options={accountingTypeOptions}
                  disabled={isModeDisable}
                  validate
                  defaultValue={accountingType}
                  hasError={accountingTypeError}
                  getValue={(value) => {
                    setAccountingType(value)
                    setAccountingTypeError(false)
                  }}
                  getError={() => { }}
                />
              </div>
              <div className={`mt-5 ${modeClass} `}>
                <Text
                  label='Routing Number'
                  id='routingNumber'
                  name='routingNumber'
                  placeholder='Please Enter Routing Number'
                  disabled={isModeDisable}
                  validate
                  maxLength={9}
                  hasError={routingNumberError}
                  value={routingNumber}
                  getValue={(value) => {
                    /^\d*$/.test(value) && setRoutingNumber(value)
                    setRoutingNumberError(false)
                  }}
                  getError={() => { }}
                />
              </div>
              <div className={`mt-5 ${modeClass} `}>
                <Text
                  label='Account Number'
                  id='accountNumber'
                  name='accountNumber'
                  placeholder='Please Enter Account Number'
                  disabled={isModeDisable}
                  validate
                  minChar={4}
                  maxChar={17}
                  maxLength={17}
                  hasError={accountNumberError}
                  value={accountNumber}
                  getValue={(value) => {
                    /^\d*$/.test(value) && setAccountNumber(value)
                    setAccountNumberError(false)
                  }}
                  getError={() => { }}
                  errorMessage={"Please enter minimum 4 digits account number"}
                />
              </div>
              <div className={`mt-5 ${modeClass} `}>
                <Text
                  label='Bank Name'
                  id='bankName'
                  name='bankName'
                  placeholder='Please Enter Bank Name'
                  disabled={isModeDisable}
                  validate
                  minChar={4}
                  maxChar={50}
                  maxLength={50}
                  hasError={bankNameError}
                  errorMessage={"Please enter minimum 4 characters bank name"}
                  value={bankName}
                  getValue={(value) => {
                    /^[a-zA-Z ]*$/.test(value) && setBankName(value)
                    setBankNameError(false)
                  }}
                  getError={() => { }}
                />
              </div>
              <div className={`mt-5 ${modeClass} `}>
                <Text
                  label='Branch ID'
                  id='branchId'
                  name='branchId'
                  placeholder='Please Enter Branch ID Number'
                  disabled={isModeDisable}
                  validate
                  minChar={2}
                  maxChar={16}
                  maxLength={16}
                  errorMessage={"Please enter minimum 2 digits Branch ID"}
                  hasError={branchIdError}
                  value={branchId}
                  getValue={(value) => {
                    /^[0-9 ]*$/.test(value) && setBranchId(value)
                    setBranchIdError(false)
                  }}
                  getError={(e) => { setBranchIdHasError(!e) }}
                />
              </div>
              <div className={`mt-5 ${modeClass} `}>
                <Text
                  label={`Account Holder's Name`}
                  id='accountHolderName'
                  name='accountHolderName'
                  placeholder={`Please Enter Account Holder's Name`}
                  disabled={isModeDisable}
                  validate
                  minChar={4}
                  maxChar={50}
                  maxLength={50}
                  errorMessage={"Please enter minimum 4 characters account holder's name"}
                  hasError={accountHolderNameError}
                  value={accountHolderName}
                  getValue={(value) => {
                    /^[a-zA-Z ]*$/.test(value) && setAccountHolderName(value)
                    setAccountHolderNameError(false)
                  }}
                  getError={() => { }}
                />
              </div>
              <div className={`mt-5 ${modeClass} ${isModeDisable ? "opacity-70" : ""}`}>
                <MultiSelectChip
                  id='paymentMethod'
                  label='Default Payment Method'
                  options={paymentMethodOptions}
                  type='checkbox'
                  defaultValue={selectedPaymentMethod}
                  getValue={(value) => {
                    setSelectedPaymentMethod(value)
                  }}
                  getError={() => { }}
                  onSelect={() => { }}
                />
              </div>
              <div className={`mt-5 ${(Mode === "View") ? "pointer-events-none opacity-70" : ""} `}>
                <Textarea
                  className='resize-y'
                  label='Notes'
                  id='notes'
                  name='notes'
                  placeholder='Notes'
                  disabled={Mode === "View" ? true : false}
                  maxLength={50}
                  rows={3}
                  value={notes}
                  getValue={(value) => setNotes(value)}
                  getError={() => { }}
                />
              </div>
            </div>
            :   // activeStep === 2 Contact Details
            activeStep === 1
              ? <div className='mx-5 mb-12 flex-1'>
                <div className={`${modeClass} `}>
                  <Text
                    label='Address'
                    id='address'
                    name='address'
                    placeholder='Please Enter Address'
                    maxLength={100}
                    disabled={isModeDisable}
                    value={address}
                    getValue={(value) => { /^[a-zA-Z0-9.,\- ]*$/.test(value) && setAddress(value) }}
                    getError={() => { }}
                  />
                </div>
                <div className='mt-5 flex gap-5'>
                  <div className={`flex-1 ${modeClass} `}>
                    <Select
                      id='country'
                      label='Country'
                      disabled={isModeDisable}
                      options={country}
                      defaultValue={countryId}
                      getValue={(value) => {
                        setCountryId(value)
                      }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`flex-1 ${modeClass} `}>
                    <Select
                      id='state'
                      label='State'
                      disabled={isModeDisable}
                      options={state}
                      defaultValue={stateId}
                      getValue={(value) => {
                        setStateId(value)
                      }}
                      getError={() => { }}
                    />
                  </div>
                </div>
                <div className='mt-5 flex gap-5'>
                  <div className={`flex-1 ${modeClass} `}>
                    <Select
                      id='city'
                      name='city'
                      label='City'
                      disabled={isModeDisable}
                      options={city}
                      defaultValue={cityId}
                      getValue={(value) => {
                        setCityId(value)
                      }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`flex-1 ${modeClass} `}>
                    <Text
                      label='Zip/Postal Code'
                      id='postalCode'
                      name='postalCode'
                      placeholder='Enter Zip/Postal Code'
                      disabled={isModeDisable}
                      minChar={5}
                      maxLength={10}
                      value={postalCode}
                      getValue={(value) => {
                        /^[0-9 ]*$/.test(value) && setPostalCode(value)
                      }}
                      getError={() => { }}
                      className='!pt-[7px] [appearance:number] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                    />
                  </div>
                </div>
                <div className={`mt-5 ${(Mode === "View") ? "pointer-events-none" : ""} `}>
                  <CountrySelect
                    id='phone'
                    name='phone'
                    label='Phone Number'
                    value={phone}
                        countryCode='1'
                    validate
                    disabled={Mode === "View" ? true : false}
                    getValue={(value) => {
                      setPhone(value)
                    }}
                    getError={() => { }}
                  />
                </div>
                <div className={`mt-5 ${(Mode === "View") ? "pointer-events-none" : ""} `}>
                  <Email
                    label='Email Address'
                    id='email'
                    name='email'
                    type='email'
                    placeholder="Please Enter Email Address"
                    value={email}
                    disabled={Mode === "View" ? true : false}
                    validate
                    getValue={(value) => {
                      setEmail(value)
                    }}
                    getError={() => { }}
                    minLength={10}
                    maxLength={100}
                  />
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <Text
                    label='Primary Contact'
                    id='primaryContact'
                    name='primaryContact'
                    placeholder="Same as above"
                    disabled={isModeDisable}
                    readOnly
                    value={primaryContact}
                    getValue={(value) => { setPrimaryContact(value) }}
                    getError={() => { }}
                  />
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <Text
                    label='Pay to Contact'
                    id='payToContact'
                    name='payToContact'
                    placeholder="Same as above"
                    disabled={isModeDisable}
                    readOnly
                    value={payToContact}
                    getValue={(value) => { setPayToContact(value) }}
                    getError={() => { }}
                  />
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <Text
                    label='Return to Contact'
                    id='returnToContact'
                    name='returnToContact'
                    placeholder="Same as above"
                    disabled={isModeDisable}
                    readOnly
                    value={returnToContact}
                    getValue={(value) => { setReturnToContact(value) }}
                    getError={() => { }}
                  />
                </div>
              </div>
              :
              // activeStep == 3 Accounting Details
              <div className={`mx-5 mb-12 grid ${Mode == "View" && accountingTool === 1 ? "grid-cols-2 gap-x-5" : "grid-cols-1"}`}>
                <div className={`${modeClass} `}>
                  <Select
                    label='GL Account Type'
                    id='glaccounttype'
                    name='glaccounttype'
                    options={glAccountTypeOptions}
                    disabled={isModeDisable}
                    validate
                    defaultValue={glAccountType}
                    hasError={glAccountTypeError}
                    getValue={(value) => {
                      setGLAccountType(value)
                      setGLAccountTypeError(false)
                    }}
                    getError={() => { }}
                  />
                </div>
                {Mode == "View" && accountingTool === 1 && <div className={`${modeClass} `}>
                  <Text
                    className='!pt-[9px]'
                    label='Default Payable GL Journal'
                    id='defaultPayableGlJournal'
                    name='defaultPayableGlJournal'
                    disabled={isModeDisable}
                    value={defaultPayableGlJournal}
                    getValue={() => { }}
                    getError={() => { }}
                  />
                </div>}
                <div className={`mt-5 ${(Mode === "View") ? "pointer-events-none" : ""} `}>
                  <Select
                    label='GL Account Name'
                    id='glAccount'
                    name='glAccount'
                    options={glAccountOptionWithType}
                    disabled={Mode === "View" ? true : false}
                    validate
                    defaultValue={glAccountName}
                    hasError={glAccountNameError}
                    getValue={(value) => {
                      setGlAccountName(value)
                      setGlAccountNameError(false)
                    }}
                    getError={() => { }}
                  />
                </div>
                {Mode == "View" && accountingTool === 1 && <div className={`mt-5 ${modeClass} `}>
                  <Text
                    className='!pt-[9px]'
                    label='Default Receivables GL Journal'
                    id='defaultReceivableGlJournal'
                    disabled={isModeDisable}
                    name='defaultReceivableGlJournal'
                    value={defaultReceivableGlJournal}
                    getValue={() => { }}
                    getError={() => { }}
                  />
                </div>}
                <div className={`mt-5 ${(Mode === "View") ? "pointer-events-none" : ""} `}>
                  <Select
                    label='Service Charge GL A/C'
                    disabled={Mode === "View" ? true : false}
                    id='serviceCharge'
                    name='serviceCharge'
                    options={glAccountOption}
                    defaultValue={serviceChargeGL + ""}
                    getValue={(value) => setServiceChargeGL(value)}
                    getError={() => { }}
                  />
                </div>
                <div className={`mt-5 ${(Mode === "View") ? "pointer-events-none" : ""} `}>
                  <Select
                    label='Interest Earned GL A/C'
                    disabled={Mode === "View" ? true : false}
                    id='interestEarned'
                    name='interestEarned'
                    options={glAccountOption}
                    defaultValue={interestEarnedGL + ""}
                    getValue={(value) => setInterestEarnedGL(value)}
                    getError={() => { }}
                  />
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <Select
                    label='Department ID'
                    disabled={isModeDisable}
                    id='departmentId'
                    name='departmentId'
                    options={departmentOption}
                    defaultValue={departmentId + ""}
                    getValue={(value) => setDepartmentId(value)}
                    getError={() => { }}
                  />
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <Select
                    label='Location ID'
                    disabled={isModeDisable}
                    id='locationId'
                    name='locationId'
                    options={locationOption}
                    defaultValue={locationId + ""}
                    getValue={(value) => setLocationId(value)}
                    getError={() => { }}
                  />
                </div>
                {Mode == "View" && accountingTool === 1 && <>
                  <div className={`mt-5 ${modeClass} relative col-span-2`}>
                    <span className={`absolute z-[5] text-sm bottom-[3px] text-black ${isModeDisable ? "opacity-50" : "opacity-80"}`}>$</span>
                    <Text
                      className='!pt-[9px] !pl-2.5'
                      label='Last Reconciled Balance'
                      disabled={isModeDisable}
                      id='lastReconciledBalance'
                      name='lastReconciledBalance'
                      value={lastReconciledBalance}
                      getValue={() => { }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`mt-5 ${modeClass} `}>
                    <Text
                      className='!pt-[9px]'
                      label='Last Reconciled Date'
                      disabled={isModeDisable}
                      id='lastReconciledDate'
                      name='lastReconciledDate'
                      value={formatPaymentDate(lastReconciledDate)}
                      getValue={() => { }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`mt-5 ${modeClass} `}>
                    <Text
                      className='!pt-[9px]'
                      label='Cut Off Date'
                      id='cutOffDate'
                      disabled={isModeDisable}
                      name='cutOffDate'
                      value={formatPaymentDate(cutOffDate)}
                      getValue={() => { }}
                      getError={() => { }}
                    />
                  </div>
                </>
                }
              </div>}
      </div>

      <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
        <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={() => clearAllData("")} className='btn-sm !h-9 !w-[112px] rounded-full' variant='btn-outline-primary'>
            <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
          </Button>
          {activeStep == 2
            ? <Button
              type='submit'
              onClick={handleSubmit}
              className={`btn-sm !h-9 !w-[90px] rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
              variant='btn-primary'>
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                {isLoading ? <SpinnerIcon bgColor='#FFF' /> : Mode === "View" ? "CLOSE" : "SAVE"}
              </label>
            </Button>
            : <Button
              type='submit'
              onClick={() => handelNext()}
              className={`btn-sm !h-9 !w-[90px] rounded-full`}
              variant='btn-primary'>
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                NEXT
              </label>
            </Button>}
        </div>
      </div>
    </div>
  )
}

export default AccountDrawer