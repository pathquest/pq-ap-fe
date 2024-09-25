import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import { storageConfig } from '@/components/Common/pdfviewer/config'
import { useAppDispatch } from '@/store/configureStore'
import { getBankAccountDropdown, getBuyerBankById, getPaymentMethodById, saveCheckMicroDeposit, saveCheckPaymentMethod } from '@/store/features/paymentsetting/paymentSetupSlice'
import { cityListDropdown, countryListDropdown, stateListDropdown } from '@/store/features/user/userSlice'
import { BlobServiceClient } from '@azure/storage-blob'
import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, ProgressStepper, Select, Text, Toast, Typography, Uploader } from 'pq-ap-lib'
import 'pq-ap-lib/dist/index.css'
import { useEffect, useRef, useState } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: (value: string) => void
  ModeId: number
  Mode: string
  currentStep: number
  paymentMethodSetupId: number
}

const AccountDrawer: React.FC<DrawerProps> = ({ isOpen, onClose, ModeId, Mode, currentStep, paymentMethodSetupId }) => {
  const dispatch = useAppDispatch()

  const steps = ['Bank Details', 'Micro Deposit Verification', 'Note'];
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modeClass, setModeClass] = useState<string>('')
  const [isModeDisable, setIsModeDisable] = useState<boolean>(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false)
  const [maskedAccountNumber, setMaskedAccountNumber] = useState<string>('');
  const [initialState, setInitialState] = useState({
    accountNumberValue: 0,
    checkStartNumber: '',
    address: '',
    countryId: 0,
    stateId: 0,
    cityId: 0,
    postalCode: '',
    imagePreview: '',
  });

  // Bank Details
  const [accountNumberOption, setAccountNumberOption] = useState([])
  const [accountNumberValue, setAccountNumberValue] = useState<number>(0)
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [accountNumberError, setAccountNumberError] = useState<boolean>(false)

  const [bankName, setBankName] = useState<string>('')
  const [accountId, setAccountId] = useState<string>('')
  const [accountType, setAccountType] = useState<string>('')
  const [routingNumber, setRoutingNumber] = useState<string>('')

  const [checkStartNumber, setCheckStartNumber] = useState<string>('')
  const [checkStartNumberError, setCheckStartNumberError] = useState<boolean>(false)

  const [address, setAddress] = useState<string>('')
  const [addressError, setAddressError] = useState<boolean>(false)

  const [country, setCountry] = useState([])
  const [countryId, setCountryId] = useState<number>(0)
  const [countryError, setCountryError] = useState<boolean>(false)

  const [state, setState] = useState([])
  const [stateId, setStateId] = useState<number>(0)
  const [stateError, setStateError] = useState<boolean>(false)

  const [city, setCity] = useState([])
  const [cityId, setCityId] = useState<number>(0)
  const [cityError, setCityError] = useState<boolean>(false)

  const [postalCode, setPostalCode] = useState<string>('')

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<any>('')
  const [imagePreviewError, setImagePreviewError] = useState<boolean>(false)

  // Micro Deposit Verification Details
  const [microDeposit1, setMicroDeposit1] = useState<string>('')
  const [microDeposit1Error, setMicroDeposit1Error] = useState<boolean>(false)

  const [microDeposit2, setMicroDeposit2] = useState<string>('')
  const [microDeposit2Error, setMicroDeposit2Error] = useState<boolean>(false)

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
    if (currentStep == 1) {
      setActiveStep(1)
    }
  }, [currentStep])

  const setErrorTrue = () => {
    // Bank Details
    setAccountNumberError(true)
    setCheckStartNumberError(true)
    setAddressError(true)
    setCountryError(true)
    setStateError(true)
    setCityError(true)
    setImagePreviewError(true)

    // Accounting Details
    setMicroDeposit1Error(true)
    setMicroDeposit2Error(true)
  }

  const initialData = () => {
    // Bank Details
    setAccountNumberOption([])
    setAccountNumberValue(0)
    setAccountNumberError(false)

    setAccountType('')
    setRoutingNumber('')
    setBankName('')

    setCheckStartNumber('')
    setCheckStartNumberError(false)

    setImagePreview('')
    setSelectedFile(null)
    setImagePreviewError(false)

    setAddress('')
    setAddressError(false)

    setCountry([])
    setCountryId(0)
    setCountryError(false)

    setState([])
    setStateId(0)
    setStateError(false)

    setCity([])
    setCityId(0)
    setCityError(false)

    setPostalCode('')

    // Micro Deposit Verification Details
    setMicroDeposit1('')
    setMicroDeposit1Error(false)

    setMicroDeposit2('')
    setMicroDeposit2Error(false)

    setActiveStep(0)
    setIsLoading(false)

    setModeClass('')
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  // Buyer Bank Account Dropdown API
  const getBuyerBankAccountDropdown = async () => {
    const params = {
      Type: "Check"
    }

    performApiAction(dispatch, getBankAccountDropdown, params, (responseData: any) => {
      setAccountNumberOption(responseData)
    })
  }

  //Country List API
  const getCountryList = () => {
    performApiAction(dispatch, countryListDropdown, null, (responseData: any) => {
      setCountry(responseData)
    })
  }

  //State List API
  const getStateList = async () => {
    const params = {
      CountryId: countryId,
    }
    performApiAction(dispatch, stateListDropdown, params, (responseData: any) => {
      setState(responseData)
    })
  }

  //City List API
  const getCityList = async () => {
    const params = {
      StateId: stateId,
    }
    performApiAction(dispatch, cityListDropdown, params, (responseData: any) => {
      setCity(responseData)
    })
  }

  const handleAccountNumberChange = (value: number) => {
    setAccountNumberError(false);
    setAccountNumber('')
    setAccountNumberValue(0)
    setBankName('')
    setRoutingNumber('')
    setAccountType('')
    setAddress('')
    setCountryId(0)
    setStateId(0)
    setCityId(0)
    setPostalCode('')

    const params = {
      PaymentSetupId: Number(value)
    }

    performApiAction(dispatch, getBuyerBankById, params, (responseData: any) => {
      const { AccountingType, RoutingNumber, AccountNumber, BankName, Address } = responseData
      setAccountNumber(AccountNumber)
      setMaskedAccountNumber('X'.repeat((AccountNumber.length) - 4) + AccountNumber.slice((AccountNumber.length) - 4));
      setAccountNumberValue(value)
      setBankName(BankName)
      setRoutingNumber(RoutingNumber)
      setAccountType(AccountingType)

      // Contact Details
      const { street1, city, state, country, postalCode } = Address
      setAddress(street1 || '')
      setCountryId(Number(country) || 0)
      setStateId(Number(state) || 0)
      setCityId(Number(city) || 0)
      setPostalCode(postalCode || '')
    })
  }

  const getAccountPaymentMethodById = async () => {
    const params = {
      PaymentSetupMethodId: paymentMethodSetupId
    }

    performApiAction(dispatch, getPaymentMethodById, params, (responseData: any) => {
      const { AccountNumber, AccountingType, RoutingNumber, BankName, PaymentSetupId, CheckStartNumber, Address, SignatureAttachmentPath } = responseData
      setAccountNumber(AccountNumber || "")
      setAccountNumberValue(PaymentSetupId || 0)
      setRoutingNumber(RoutingNumber + "" || "")
      setBankName(BankName + "" || "")
      setAccountType(AccountingType + "" || "")

      setCheckStartNumber(CheckStartNumber + "" || "")

      setSelectedFile(SignatureAttachmentPath)
      getSignatureImage(SignatureAttachmentPath)

      const { street1, city, state, country, postalCode } = Address
      setAddress(street1 + "" || '')
      setCountryId(Number(country) || 0)
      setStateId(Number(state) || 0)
      setCityId(Number(city) || 0)
      setPostalCode(postalCode || '')
    })
  }

  useEffect(() => {
    if (isOpen) {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      getCountryList()
      getBuyerBankAccountDropdown()
      if (ModeId > 0) {
        getAccountPaymentMethodById()
      }
      setInitialState({
        accountNumberValue,
        checkStartNumber,
        address,
        countryId,
        stateId,
        cityId,
        postalCode,
        imagePreview,
      });
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

  //Save Data API
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setIsLoading(true)

    if (activeStep == 0) {
      if (Mode === "Add" || Mode === "Edit") {
        accountNumberValue <= 0 && setAccountNumberError(true)
        address.trim().length <= 0 && setAddressError(true)
        checkStartNumber.length <= 0 && setCheckStartNumberError(true)
        countryId <= 0 && setCountryError(true)
        stateId <= 0 && setStateError(true)
        cityId <= 0 && setCityError(true)
        imagePreview.trim().length <= 0 && setImagePreviewError(true)

        if (accountNumberValue > 0 && address.trim().length > 0 && checkStartNumber.trim().length > 0 && countryId > 0 && stateId > 0 && cityId > 0 && imagePreview.trim().length > 0) {
          try {
            const params = {
              PaymentSetupId: accountNumberValue + "" || "",
              PaymentSetupMethodId: paymentMethodSetupId + "" || "0",
              AccountingType: accountType || "",
              AccountNumber: accountNumber || "",
              RoutingNumber: routingNumber || "",
              BankName: bankName || "",
              CheckStartNumber: checkStartNumber + "" || "",
              street1: address || "",
              city: cityId || 0,
              state: stateId || 0,
              country: countryId || 0,
              postalCode: postalCode || "",
              Signature: selectedFile,
              isCheck: "true"
            }
            const { payload, meta } = await dispatch(saveCheckPaymentMethod(params))
            const dataMessage = payload?.Message
            if (meta?.requestStatus === 'fulfilled') {
              if (payload?.ResponseStatus === 'Success') {
                Mode === "Add" && setIsConfirmationModalOpen(true)
                clearAllData("Save")
                setIsLoading(false)
                Toast.success(`Payment method setup added!`)
              } else {
                Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
                setIsLoading(false)
              }
            } else {
              Toast.error(`${payload?.status} : ${payload?.statusText}`)
              setIsLoading(false)
            }
          } catch (error) {
            setIsLoading(false)
            console.error(error)
          }
        }
        else {
          setIsLoading(false)
        }
      }
      else {
        setIsLoading(false)
        clearAllData("")
      }
    } else {
      // Handle Micro deposit
      const params = {
        PaymentSetupMethodId: paymentMethodSetupId,
        AccountId: accountId || "",
        deposit1: Number(microDeposit1),
        deposit2: Number(microDeposit2)
      }
      performApiAction(dispatch, saveCheckMicroDeposit, params, () => {
        // Save Data
        Toast.success(`Micro deposit added!`)
        clearAllData("Save")
        setIsLoading(false)
      }, () => {
        // Error Data
        setIsLoading(false)
      })
    }
  }

  const handelNext = () => {
    microDeposit1.trim().length <= 0 && setMicroDeposit1Error(true)
    microDeposit2.trim().length <= 0 && setMicroDeposit2Error(true)

    const params = {
      PaymentSetupId: Number(ModeId)
    }

    performApiAction(dispatch, getBuyerBankById, params, (responseData: any) => {
      const { AccountId } = responseData
      setAccountId(AccountId)
    })
    if (microDeposit1.trim().length > 0 && microDeposit2.trim().length > 0) {
      setActiveStep(activeStep + 1)
    }
  }

  const getSignatureImage = async (FilePath: any) => {
    if (FilePath) {
      const storageAccount = storageConfig.storageAccount
      const containerName: any = storageConfig.containerName
      const sasToken = storageConfig.sassToken

      const fileExtension = FilePath?.split('.').pop()?.toLowerCase()

      const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`)
      const containerClient = blobServiceClient.getContainerClient(containerName)
      const blockBlobClient = containerClient?.getBlockBlobClient(FilePath)

      if (fileExtension && ['jpeg', 'png', 'jpg'].includes(fileExtension)) {
        try {
          const downloadBlockBlobResponse = await blockBlobClient.download(0)

          if (downloadBlockBlobResponse.blobBody) {
            const blob = await downloadBlockBlobResponse.blobBody

            const contentType = downloadBlockBlobResponse.contentType
            const fileBlob = new Blob([blob], { type: contentType })
            const url = URL.createObjectURL(fileBlob)
            setImagePreview(url)
          } else {
            console.error('Blob body is undefined')
          }
        } catch (error) {
          console.error('Error downloading blob:', error)
        }
      }
    }
  }

  const hasFieldsChanged = () => {
    return (
      initialState.accountNumberValue !== accountNumberValue ||
      initialState.checkStartNumber !== checkStartNumber ||
      initialState.address !== address ||
      initialState.countryId !== countryId ||
      initialState.stateId !== stateId ||
      initialState.cityId !== cityId ||
      initialState.postalCode !== postalCode ||
      initialState.imagePreview !== imagePreview
    );
  };

  const modalClose = () => {
    setAccountNumber('')
    setMaskedAccountNumber('')

    if (Mode == "Add") {
      setIsRejectModalOpen(false)
    }
    else {
      clearAllData("")
      setIsConfirmationModalOpen(false)
    }
  }

  const handleDrawerClose = () => {
    if (Mode == "Add" && currentStep == 0) {
      if (hasFieldsChanged()) {
        setIsRejectModalOpen(true);
      } else {
        clearAllData("");
      }
    }
    else {
      clearAllData("")
    }
  }

  const handleCheckReject = () => {
    setSelectedFile(null)
    setIsRejectModalOpen(false)
    clearAllData("")
  }

  const onSignatureImgUpload = (value: any) => {
    setImagePreviewError(false)
    if (value) {
      const file = value;
      const fileType = file.type;
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
      const maxFileSize = 1.33 * 1024 * 1024;

      if (validTypes.includes(fileType) && file.size <= maxFileSize) {
        setSelectedFile(file);
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreviewError(true);
        setSelectedFile(null);
        setImagePreview('');

        if (!validTypes.includes(fileType)) {
          Toast.error('Invalid file type. Only PNG, JPG, JPEG, BMP formats are allowed.');
        } else if (file.size > maxFileSize) {
          Toast.error('File size exceeds the maximum limit of 1.33 MB.');
        }
      }
    } else {
      setSelectedFile(null)
      setImagePreview('')
    }
  }

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow w-[500px] max-[440px]:w-11/12 sm:w-2/4 lg:w-[500px] xl:w-[500px] hd:w-[500px] 2xl:w-[500px] 3xl:w-[500px] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out`}>
        <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
          <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
            {Mode} Check Payment Method
          </label>
          <div className='pt-2.5' onClick={() => clearAllData("")}>
            <Close variant='medium' />
          </div>
        </div>
        <div className='p-5 flex sticky z-[1] bg-white top-[62px] justify-center  items-center'>
          <div className='w-full'>
            <ProgressStepper steps={steps} activeStep={activeStep} isClickEnable={false} getCurrentStep={(value: number) => setActiveStep(value)} />
          </div>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {// Bank Details
            activeStep === 0
              ? <div className='mx-5 mb-12 flex-1 overflow-y-auto'>
                <div className={` ${modeClass} `}>
                  <Select
                    id='accountNumber'
                    label='Account Number'
                    options={accountNumberOption}
                    disabled={isModeDisable}
                    validate
                    defaultValue={accountNumberValue + ""}
                    getValue={(value) => {
                      handleAccountNumberChange(value)
                    }}
                    getError={() => { }}
                    hasError={accountNumberError}
                  />
                </div>
                <div className='mt-5 flex gap-5'>
                  <div className={`flex-1 ${modeClass} `}>
                    <Text
                      label='Bank Name'
                      id='bankName'
                      name='bankName'
                      placeholder='Please Enter Bank Name'
                      validate
                      disabled
                      value={bankName}
                      getValue={(value) => { setBankName(value) }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`flex-1 ${modeClass} `}>
                    <Text
                      label='Account Type'
                      id='accountType'
                      name='accountType'
                      placeholder='Enter Account Type'
                      validate
                      disabled
                      value={accountType}
                      getValue={(value) => { setAccountType(value) }}
                      getError={() => { }}
                    />
                  </div>
                </div>
                <div className='mt-5 flex gap-5'>
                  <div className={`flex-1 ${modeClass} `}>
                    <Text
                      label='Routing Number'
                      id='routingNumber'
                      name='routingNumber'
                      placeholder='Please Enter Routing Number'
                      validate
                      disabled
                      value={routingNumber}
                      getValue={(value) => { setRoutingNumber(value) }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`flex-1 ${(Mode === "View") ? "pointer-events-none" : ""} `}>
                    <Text
                      label='Check Number Starting From'
                      id='checkStart'
                      name='checkStart'
                      placeholder='Please Enter Check Starting Number '
                      disabled={Mode === "View" ? true : false}
                      validate
                      maxLength={9}
                      hasError={checkStartNumberError}
                      value={checkStartNumber}
                      getValue={(value) => {
                        /^(?!0)\d*$/.test(value) && setCheckStartNumber(value)
                        setCheckStartNumberError(false)
                      }}
                      getError={() => { }}
                    />
                  </div>
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <label className='text-base font-proxima tracking-[0.02em] font-bold'>
                    Upload Signature<label className='text-sm text-defaultRed'>*</label>
                  </label>
                  <div className={`mt-5 h-[60px] flex items-center rounded border ${isModeDisable ? "opacity-70" : ""} ${imagePreviewError ? "border-defaultRed" : "border-lightSilver"} py-[9px] pl-5 pr-3`}>
                    <img src={`${imagePreview}`} className={`h-[55px] ${imagePreviewError ? "text-defaultRed" : ""}`} />{imagePreview != "" ? "" : "Signature"}
                  </div>
                  <div className={`mt-5 ${isModeDisable ? "opacity-70" : ""}`}>
                    <Uploader variant="small" key={isOpen + ""} getValue={(value: string) => onSignatureImgUpload(value[0])} />
                  </div>
                </div>
                <div className={`mt-5 ${modeClass} `}>
                  <Text
                    label='Address'
                    id='address'
                    name='address'
                    validate
                    disabled={isModeDisable}
                    placeholder='Please Enter Address'
                    maxLength={100}
                    hasError={addressError}
                    value={address}
                    getValue={(value) => {
                      /^[a-zA-Z0-9.,\- ]*$/.test(value) && setAddress(value)
                      setAddressError(false)
                    }}
                    getError={() => { }}
                  />
                </div>
                <div className='mt-5 flex gap-5'>
                  <div className={`flex-1 ${modeClass} `}>
                    <Select
                      id='country'
                      label='Country'
                      options={country}
                      disabled={isModeDisable}
                      validate
                      defaultValue={countryId}
                      getValue={(value) => {
                        setCountryId(value)
                        setCountryError(false)
                      }}
                      getError={() => { }}
                      hasError={countryError}
                    />
                  </div>
                  <div className={`flex-1 ${modeClass} `}>
                    <Select
                      id='state'
                      label='State'
                      options={state}
                      disabled={isModeDisable}
                      validate
                      defaultValue={stateId}
                      getValue={(value) => {
                        setStateId(value)
                        setStateError(false)
                      }}
                      getError={() => { }}
                      hasError={stateError}
                    />
                  </div>
                </div>
                <div className='mt-5 flex gap-5'>
                  <div className={`flex-1 ${modeClass} `}>
                    <Select
                      id='city'
                      name='city'
                      label='City'
                      options={city}
                      disabled={isModeDisable}
                      validate
                      defaultValue={cityId}
                      getValue={(value) => {
                        setCityId(value)
                        setCityError(false)
                      }}
                      getError={() => { }}
                      hasError={cityError}
                    />
                  </div>
                  <div className={`flex-1 ${modeClass} `}>
                    <Text
                      label='Zip/Postal Code'
                      id='postalCode'
                      name='postalCode'
                      placeholder='Enter Zip/Postal Code'
                      minChar={5}
                      disabled={isModeDisable}
                      validate
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
              </div>
              :   // Micro Deposit Verification
              activeStep === 1
                ? <div className='mx-5 mb-12 flex-1'>
                  <div className={`${modeClass} `}>
                    <Text
                      label='Micro Deposit 1'
                      id='microDeposit1'
                      name='microDeposit1'
                      placeholder='Please Enter Micro Deposit 1'
                      value={microDeposit1}
                      validate
                      hasError={microDeposit1Error}
                      getValue={(value) => {
                        if (/^(0?(\.\d{0,2})?|1(\.0{1,2})?)$/.test(value)) {
                          if (value == ".") {
                            return
                          } else {
                            setMicroDeposit1(value)
                          }
                        }
                        setMicroDeposit1Error(false)
                      }}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`mt-5 ${modeClass} `}>
                    <Text
                      label='Micro Deposit 2'
                      id='microDeposit2'
                      name='microDeposit2'
                      placeholder='Please Enter Micro Deposit 2'
                      value={microDeposit2}
                      validate
                      hasError={microDeposit2Error}
                      getValue={(value) => {
                        if (/^(0?(\.\d{0,2})?|1(\.0{1,2})?)$/.test(value)) {
                          if (value == ".") {
                            return
                          } else {
                            setMicroDeposit2(value)
                          }
                        }
                        setMicroDeposit2Error(false)
                      }}
                      getError={() => { }}
                    />
                  </div>
                </div>
                :// activeStep==2 Verify
                <div className='mx-5 mb-12 flex-1'>
                  <div className={`${modeClass} `}>
                    <div>Note: Check preview will be available after some time.</div>
                    <div className='my-5'>Please go to approve Check layout to approve/reject the Check preview.</div>
                  </div>
                </div>}
        </div>

        <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
          <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
            <Button onClick={handleDrawerClose} className='btn-sm !h-9 !w-[112px] rounded-full' variant='btn-outline-primary'>
              <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
            </Button>
            {activeStep == 0 || activeStep == 2
              ? <Button
                type='submit'
                onClick={handleSubmit}
                className={`btn-sm !h-9 !w-[90px] rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
                variant='btn-primary'>
                <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                  {isLoading ? <SpinnerIcon bgColor='#FFF' /> : Mode === "View" && activeStep == 0 ? "CLOSE" : "SAVE"}
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

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmationModalOpen} onClose={modalClose} width={'500px'}>
        <ModalTitle className='py-3 pl-4 pr-1 font-bold'>
          <label>Confirmation</label>
          <div onClick={modalClose}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <ModalContent className='mt-4 mb-7 px-4'>
          <label className='text-[16px] font-proxima'>Please confirm microdeposit amount once received in bank account - {maskedAccountNumber}</label>
        </ModalContent>

        <ModalAction className='px-1'>
          <Button
            className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold'
            variant='btn-primary'
            onClick={modalClose}>
            OK
          </Button>
        </ModalAction>
      </Modal>

      {/* Reject Modal */}
      <ConfirmationModal
        title='Cancel Check Payment Method'
        content={'Details added will be removed. Are you sure you want to exit the page?'}
        isModalOpen={isRejectModalOpen}
        modalClose={modalClose}
        handleSubmit={handleCheckReject}
        colorVariantNo='btn-outline-error'
        colorVariantYes='btn-error'
      />
    </>
  )
}

export default AccountDrawer