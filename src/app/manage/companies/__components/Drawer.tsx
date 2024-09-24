import EditIcon from '@/assets/Icons/EditIcon'
import InfoIcon from '@/assets/Icons/infoIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { companyGetById, getCompanyImage, saveCompany, uploadCompanyImage } from '@/store/features/company/companySlice'
import { cityListDropdown, countryListDropdown, setIsRefresh, stateListDropdown } from '@/store/features/user/userSlice'
import { useSession } from 'next-auth/react'
import { Avatar, Button, Close, CountrySelect, Email, Select, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

type NullableNumber = number | null | undefined
type CloseHandler = () => void
type CompanyData = string[] | null
interface DrawerProps {
  onOpen: boolean
  onClose: CloseHandler
  hasEditId: NullableNumber
  CompanyData?: CompanyData
  accountingTool: NullableNumber
  getCompanyList: () => Promise<void>
  IntacctUserId: string | null
  IntacctAccountinToolId: string | null
  IntacctPassword: string | null
  IntacctCompanyId: string | null
  IntacctLocationId: string | null
  clearID: CloseHandler
  orgId: NullableNumber
  recordNo: string
  setShowCancelModal: (value: boolean) => void
  isConfirmCancel: boolean
}

const EntityTypeList = [
  { label: 'Profit Organization', value: 1 },
  { label: 'Non-profit Organization', value: 2 },
]

const Drawer: React.FC<DrawerProps> = ({
  onOpen,
  onClose,
  hasEditId,
  CompanyData,
  accountingTool,
  IntacctUserId,
  IntacctPassword,
  IntacctAccountinToolId,
  IntacctCompanyId,
  IntacctLocationId,
  clearID,
  recordNo,
  setShowCancelModal,
  isConfirmCancel,
  getCompanyList
}: any) => {
  const { data: session } = useSession()
  const dispatch = useAppDispatch()
  const [Id, setId] = useState(0)
  const [companyName, setCompanyName] = useState('')
  const [companyNameError, setCompanyNameError] = useState(false)
  const [companyNameHasError, setCompanyNameHasError] = useState(false)
  const [entityType, setEntityType] = useState(0)
  const [entityTypeError, setEntityTypeError] = useState(false)
  const [entityTypeHasError, setEntityTypeHasError] = useState(false)
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState(false)
  const [addressHasError, setAddressHasError] = useState(false)
  const [country, setCountry] = useState(0)
  const [countryError, setCountryError] = useState(false)
  const [countryHasError, setCountryHasError] = useState(false)
  const [state, setState] = useState(0)
  const [stateError, setStateError] = useState(false)
  const [stateHasError, setStateHasError] = useState(false)
  const [city, setCity] = useState(0)
  const [cityError, setCityError] = useState(false)
  const [cityHasError, setCityHasError] = useState(false)
  const [zipCode, setZipCode] = useState<string>('')
  const [zipCodeError, setZipCodeError] = useState(false)
  const [zipCodeHasError, setZipCodeHasError] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const [phoneHasError, setPhoneHasError] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [emailHasError, setEmailHasError] = useState(false)
  const [deletedFile, setDeletedFile] = useState<string>('30')
  const [deletedFileError, setDeletedFileError] = useState(false)
  const [accountToolCompanyId, setAccountToolCompanyId] = useState('')
  const [countryDropDownData, setCountryDropDownData] = useState([])
  const [stateDropDownData, setStateDropDownData] = useState([])
  const [cityDropDownData, setCityDropDownData] = useState([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageGuId, setImageGuId] = useState<string>('')
  const [imageName, setImageName] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [zipErrorMessage, setZipErrorMessage] = useState<string>('')
  const [addressErrorMessage, setAddressErrorMessage] = useState<string>('')
  const [deletedFileErrorMessage, setDeletedFileErrorMessage] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [prevGuId, setPrevGuId] = useState<string>('')

  useEffect(() => {
    if (CompanyData) {
      setCompanyName(CompanyData.Name)
      CompanyData.Name !== undefined && CompanyData.Name !== null && CompanyData.Name.length > 0 && setCompanyNameHasError(true)
      setAccountToolCompanyId(CompanyData.AccToolCompanyId)
      setEntityType(CompanyData.EntityType)
      setAddress(CompanyData.Address)
      CompanyData.Address !== undefined &&
        CompanyData.Address !== null &&
        CompanyData.Address.length > 0 &&
        setAddressHasError(true)
      setCountry(CompanyData.CountryId)
      CompanyData.CountryId > 0 && setCompanyNameHasError(true)
      setState(CompanyData.StateId)

      setCity(CompanyData.CityId)

      setZipCode(CompanyData.ZipCode)
      CompanyData.ZipCode !== undefined &&
        CompanyData.ZipCode !== null &&
        CompanyData.ZipCode.length > 0 &&
        setZipCodeHasError(true)
      setPhone(CompanyData.Phone)
      setEmail(CompanyData.Email)
      CompanyData.Email !== undefined && CompanyData.Email !== null && CompanyData.Email.length > 0 && setEmailHasError(true)
      CompanyData.DeletedFile !== undefined &&
        CompanyData.DeletedFile !== null &&
        CompanyData.DeletedFile.length > 0 &&
        setDeletedFile(CompanyData.DeletedFile)
    }
  }, [CompanyData])

  //Company get by id api
  const getCompanyListById = useCallback(() => {
    const params = {
      Id: hasEditId,
    }
    performApiAction(dispatch, companyGetById, params, (responseData: any) => {
      const {
        Id,
        Name,
        AccToolCompanyId,
        EntityType,
        Address,
        CountryId,
        StateId,
        CityId,
        ZipCode,
        GUID,
        Phone,
        Email,
        DeleteFilesInDays,
        CompanyImage,
      } = responseData
      setId(Id)
      setCompanyName(Name)
      Name.length > 0 && setCompanyNameHasError(true)
      setAccountToolCompanyId(AccToolCompanyId)
      setEntityType(EntityType)
      EntityType > 0 && setEntityTypeHasError(true)
      setAddress(Address)
      Address.length > 0 && setAddressHasError(true)
      setCountry(CountryId)
      CountryId > 0 && setCountryHasError(true)
      setState(StateId)
      StateId > 0 && setStateHasError(true)
      setCity(CityId)
      CityId > 0 && setCityHasError(true)
      setZipCode(ZipCode)
      ZipCode.length > 0 && setZipCodeHasError(true)
      setPhone(Phone)
      Phone.length > 0 && setPhoneHasError(true)
      setEmail(Email)
      Email.length > 0 && setEmailHasError(true)
      setDeletedFile(DeleteFilesInDays)
      setImageName(CompanyImage || '')
      getCountryList()
      getStateList(CountryId)
      getCityList(StateId)

      setPrevGuId(GUID)
      CompanyImage !== '' && onGetCompanyImage(CompanyImage)
    })
  }, [dispatch, hasEditId])

  useEffect(() => {
    hasEditId && getCompanyListById()
  }, [getCompanyListById, hasEditId])

  useEffect(() => {
    if (onOpen && !hasEditId) {
      const guId = uuidv4()
      setImageGuId(guId)
    }
  }, [onOpen, hasEditId])

  useEffect(() => {
    if (isConfirmCancel) {
      clearData()
    }
  }, [isConfirmCancel])

  //Country List API
  const getCountryList = useCallback(() => {
    performApiAction(dispatch, countryListDropdown, null, (responseData: any) => {
      setCountryDropDownData(responseData)
    })
  }, [dispatch])

  //State List API
  const getStateList = useCallback(
    (countryId: number) => {
      const params = {
        CountryId: countryId,
      }
      performApiAction(dispatch, stateListDropdown, params, (responseData: any) => {
        setStateDropDownData(responseData)
      })
    },
    [dispatch]
  )

  //City List API
  const getCityList = useCallback(
    (stateId: number) => {
      const params = {
        StateId: stateId,
      }
      performApiAction(dispatch, cityListDropdown, params, (responseData: any) => {
        setCityDropDownData(responseData)
      })
    },
    [dispatch]
  )

  // api call for country,state and city dropdown
  useEffect(() => {
    getCountryList()
    getStateList(1)
    getCityList(1)
  }, [getCountryList, getStateList, getCityList])

  // clear form after close the drawer or close button
  const clearData = () => {
    clearID()
    setDeletedFileErrorMessage('')
    setCompanyName('')
    setCompanyNameError(false)
    setCompanyNameHasError(false)
    setEntityType(0)
    setEntityTypeError(false)
    setEntityTypeHasError(false)
    setAddress('')
    setAddressError(false)
    setAddressHasError(false)
    setCountry(0)
    setCountryError(false)
    setCountryHasError(false)
    setState(0)
    setStateError(false)
    setStateHasError(false)
    setCity(0)
    setCityError(false)
    setCityHasError(false)
    setZipCode('')
    setZipCodeError(false)
    setZipCodeHasError(false)
    setPhone('')
    setPhoneError(false)
    setPhoneHasError(false)
    setEmail('')
    setEmailError(false)
    setEmailHasError(false)
    setId(0)
    setDeletedFile('30')
    setDeletedFileError(false)
    setIsLoading(false)
    onClose()
    setImageGuId('')
    setImagePreview('')
    setImageName('')
  }


  // save company for after edit and create new company
  const CompanySave = () => {
    setIsLoading(true)
    const params = {
      Id: Id > 0 ? Id : 0,
      Name: companyName,
      EntityType: entityType,
      Address: address,
      CountryId: country,
      StateId: state,
      CityId: city,
      ZipCode: zipCode,
      Phone: phone,
      OrgId: session?.user?.org_id,
      Email: email,
      AccountingTool: accountingTool,
      AccToolCompanyId: !accountToolCompanyId ? IntacctAccountinToolId : accountToolCompanyId,
      GUID: hasEditId !== undefined ? prevGuId : imageGuId,
      CompanyImage: imageName,
      IntacctUserId: IntacctUserId,
      IntacctPassword: IntacctPassword,
      IntacctCompanyId: IntacctCompanyId,
      IntacctLocationId: IntacctLocationId,
      DeleteFilesInDays: Number(deletedFile),
      IsActive: true,
      RecordNo: recordNo,
    }
    // setDeletedFile(0)
    performApiAction(
      dispatch,
      saveCompany,
      params,
      () => {
        if (Id) {
          Toast.success('Company updated successfully')
        } else if (accountingTool !== 4) {
          Toast.success(`Masters data has been synced for the ${companyName} is completed. Start by managing configurations and field mapping.`)
        }
        setAccountToolCompanyId('')
        clearData()
        getCompanyList()
        setIsLoading(false)
        dispatch(setIsRefresh((prev: boolean) => !prev))
      },
      () => {
        onClose()
        setIsLoading(false)
      }
    )
  }

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (selectedFile !== null) {
      uploadImage()
    }
    const validations = {
      companyNameError: companyName === null || companyName.trim().length <= 0 || companyName === undefined,
      entityTypeError: entityType <= 0 || entityType === undefined || entityType === 0,
      addressError: address === null || address === undefined || address.length <= 0,
      countryError: country <= 0 || country === undefined || country === 0,
      stateError: state <= 0 || state === undefined || state === 0,
      cityError: city <= 0 || city === undefined || city === 0,
      zipCodeError: zipCode === null || zipCode === undefined || zipCode.length <= 0,
      phoneError: phone === null || phone === undefined || phone.length <= 0,
      emailError: email === null || email.length <= 0 || email === undefined,
    };

    if (validations.companyNameError) setCompanyNameError(true);
    if (validations.entityTypeError) setEntityTypeError(true);
    if (validations.addressError) setAddressError(true);
    if (validations.countryError) setCountryError(true);
    if (validations.stateError) setStateError(true);
    if (validations.cityError) setCityError(true);
    if (validations.zipCodeError) {
      setZipCodeError(true);
      setZipErrorMessage('This is a required field!');
    }
    if (validations.phoneError) setPhoneError(true);
    if (validations.emailError) setEmailError(true);

    if (address.length < 4 || address.length > 40) {
      setAddressError(true);
      setAddressErrorMessage('Minimum 4 or maximum 40 characters allowed.');
      return;
    }

    if (zipCode.length > 5 && zipCode.length < 9) {
      setZipCodeError(true);
      setZipErrorMessage('Length of zip code must be of 5, 9, or 10');
      return;
    }

    if (
      companyNameHasError &&
      addressHasError &&
      zipCodeHasError &&
      emailHasError &&
      entityTypeHasError &&
      countryHasError &&
      stateHasError &&
      cityHasError &&
      phoneHasError &&
      !deletedFileError
    ) {
      CompanySave()
    }
  }

  const onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const userImageName = `${hasEditId !== undefined ? `${prevGuId}.${file.name.split('.').pop()}` : `${imageGuId}.${file.name.split('.').pop()}`
        }`

      setImageName(userImageName)
      const reader = new FileReader()

      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  //Upload Company Image Api
  const uploadImage = () => {
    const formData = new FormData()

    if (selectedFile) {
      formData.append('file', selectedFile)
    }
    formData.append('fileName', imageName)
    performApiAction(dispatch, uploadCompanyImage, formData, () => { })
  }

  //Get Company Image API
  const onGetCompanyImage = (imageNames: string) => {
    const params = {
      fileName: imageNames,
    }
    performApiAction(dispatch, getCompanyImage, params, (responseData: any) => {
      setImagePreview(responseData)
    })
  }

  const handleEditIconClick = () => {
    const fileInput = document.getElementById('imageUpload')
    fileInput && fileInput.click()
  }

  const onCancelBtnClick = () => {
    setShowCancelModal(true)
    onClose()
  }

  if (!onOpen) return null

  const handleDeleteFileChange = (value: string) => {
    // Regex pattern to accept values between 1 and 120
    const numValue = Number(value);
    if (value == '') {
      setDeletedFile('');
      setDeletedFileError(true);
      setDeletedFileErrorMessage('This field is required');
    } else {
      if (/^(0*(?:[1-9]|[1-9][0-9]|1[0-1][0-9]|120))?$/.test(value)) {
        setDeletedFile(value);
        setDeletedFileError(false);
      }
    }
    // if (value == '') {
    //   setDeletedFile('');
    //   setDeletedFileError(true);
    //   setDeletedFileErrorMessage('This field is required');
    // } else if (numValue >= 1 && numValue <= 120) {
    //   setDeletedFileError(false);
    //   setDeletedFileErrorMessage('');
    // } else {
    //   setDeletedFileError(true);
    //   setDeletedFileErrorMessage('Value must be between 1 and 120');
    // }
  };

  return (
    <div
      className={`fixed right-0 top-0 z-20 flex h-full  w-3/4 flex-col justify-between overflow-y-auto bg-white shadow max-[768px]:w-11/12 lg:!w-5/12 xl:w-2/6 hd:w-[556px] 2xl:w-[556px] 3xl:w-[556px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
    >
      <div className='!h-[64px] sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='py-[15px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {hasEditId ? 'Edit' : 'Add'} Company
        </label>
        <div className='pt-2.5' onClick={clearData}>
          <Close variant='medium' />
        </div>
      </div>
      {!hasEditId && (
        <div className='flex bg-[#FFF3CD] px-4 py-2'>
          <div className='mt-1.5 w-[5%]'>
            <InfoIcon />
          </div>
          <div className='w-[95%] font-proxima text-base text-[#664D03]'>
            {accountingTool !== 4
              ? 'You are connected with an accounting tool, kindly fill mandatory details and click on "SAVE" to complete connection.'
              : 'Kindly fill mandatory details and click on "SAVE" to complete creation.'}
          </div>
        </div>
      )}
      <div className='vertical-scroll custom-scroll-filter pb-5 pt-2 flex-1 overflow-y-auto px-5'>
        <div className='mt-3 flex'>
          <div className='relative flex'>
            <Avatar variant='large' imageUrl={imagePreview} />
            <div className='absolute bottom-0 left-11 cursor-pointer rounded-sm bg-white p-[1px]' onClick={handleEditIconClick}>
              <EditIcon />
            </div>
            <input type='file' id='imageUpload' accept='.png, .jpg, .jpeg' className='hidden' onChange={onUploadImage} />
          </div>
        </div>
        <div className='py-5 text-base font-proxima tracking-[0.02em] font-bold text-black'>Company Details</div>
        <div className='flex gap-5'>
          <div className='w-full'>
            <Text
              noNumeric
              noSpecialChar
              label='Company Name'
              placeholder='Please enter company name'
              maxLength={100}
              value={companyName}
              getValue={(e) => setCompanyName(e)}
              getError={(e) => setCompanyNameHasError(e)}
              hasError={companyNameError}
              validate
            />
          </div>
          <div className='w-full'>
            <Select
              id='entity_dropdown'
              defaultValue={entityType}
              options={EntityTypeList}
              label='Entity Type'
              getValue={(e) => {
                setEntityType(e)
                e > 0 && setEntityTypeError(false)
              }}
              getError={(err) => setEntityTypeHasError(err)}
              hasError={entityTypeError}
              validate
            />
          </div>
        </div>
        <div className='py-5 text-base font-proxima tracking-[0.02em] font-bold text-black'>Address Details</div>
        <div className='flex'>
          <Text
            label='Address'
            placeholder='Please enter address'
            maxChar={40}
            minChar={4}
            value={address}
            getValue={(e) => setAddress(e)}
            getError={(err) => setAddressHasError(err)}
            hasError={addressError}
            validate
            errorMessage={addressErrorMessage}
          />
        </div>
        <div className='mt-4 flex gap-5'>
          <div className='w-full'>
            <Select
              defaultValue={country}
              options={countryDropDownData}
              label='Country'
              search
              validate
              id='country_dropdown'
              getValue={(value) => {
                value > 0 && setCountryError(false)
                setCountry(value)
                getStateList(value)
                setState(0)
                setCity(0)
              }}
              getError={(err) => setCountryHasError(err)}
              hasError={countryError}
            />
          </div>
          <div className='w-full'>
            <Select
              className='md:mt-2 lg:mt-0'
              defaultValue={state}
              options={stateDropDownData}
              label='State'
              search
              id='state_dropdown'
              getValue={(value) => {
                value > 0 && setStateError(false)
                setState(value)
                getCityList(value)
                setCity(0)
              }}
              getError={(err) => setStateHasError(err)}
              hasError={stateError}
              validate
            />
          </div>
        </div>
        <div className='mt-4 flex gap-5'>
          <div className='w-full'>
            <Select
              defaultValue={city}
              options={cityDropDownData}
              label='City'
              id='city_dropdown'
              search
              getValue={(value) => {
                value > 0 && setCityError(false)
                setCity(value)
              }}
              getError={(err) => setCityHasError(err)}
              hasError={cityError}
              validate
            />
          </div>
          <div className='w-full'>
            <Text
              id='Zip/Postal_Code'
              label='Zip/Postal Code'
              placeholder='Please enter zipcode'
              value={zipCode}
              minChar={5}
              maxChar={10}
              getValue={(e) => {
                if (e.length > 5 && e.length < 9) {
                  setZipCodeError(true)
                  setZipCode(e)
                  setAddressHasError(false)
                  setZipErrorMessage('Length of zip code must be of 5, 9 or 10')
                } else {
                  setZipCode(e)
                  setAddressHasError(true)
                  setZipCodeError(false)
                  setZipErrorMessage('')
                }
              }}
              getError={(err) => setZipCodeHasError(err)}
              hasError={zipCodeError}
              validate
              errorMessage={zipErrorMessage}
              className='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            />
          </div>
        </div>
        <div className='mt-4 flex  gap-5'>
          <div className='w-full'>
            <CountrySelect
              className=''
              validate
              value={phone}
              label='Phone Number'
              countryCode='1'
              getValue={(e) => setPhone(e)}
              getError={(err) => setPhoneHasError(err)}
              hasError={phoneError}
            />
          </div>
          <div className='w-full'>
            <Email
              label='Email Address'
              placeholder='Please enter email'
              value={email}
              maxLength={100}
              getValue={(e) => setEmail(e)}
              getError={(err) => setEmailHasError(err)}
              hasError={emailError}
              validate
            />
          </div>
        </div>
        <div className='py-5 text-base font-proxima tracking-[0.02em] font-bold text-black'>Other Details</div>
        {/* <div className='flex w-1/2 '>
          <Text
            type='number'
            value={deletedFile}
            label='Delete File in Days'
            className='!mr-2 !pt-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            max={3}
            noText
            noSpecialChar
            id='delete'
            getValue={(e: string) => setDeletedFile(Number(e))}
            getError={() => { }}
            hasError={deletedFileError}
            validate
            errorMessage={errorMessage}
            rangeBetween={[1, 120]}
          />
        </div> */}
        <div className='flex w-1/2'>
          <Text
            label='Delete File in Days'
            id='deleteFilesInDays'
            name='deleteFilesInDays'
            placeholder='Please enter days between 1 to 120'
            validate
            maxLength={3}
            hasError={deletedFileError}
            value={deletedFile}
            errorMessage={deletedFileErrorMessage}
            getValue={(value: string) => handleDeleteFileChange(value)}
            getError={() => { }}
          />
        </div>
      </div>
      <div className='!h-[66px] sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
        <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={() => onCancelBtnClick()} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
            <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
          </Button>
          <Button
            type='submit'
            onClick={handleSubmit}
            className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Drawer