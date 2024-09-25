import EditIcon from '@/assets/Icons/EditIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { companyListDropdown } from '@/store/features/company/companySlice'
import { roleListDropdown } from '@/store/features/role/roleSlice'
import { cityListDropdown, countryListDropdown, getUserImage, stateListDropdown, timezoneListDropdown, uploadUserImage, userGetDataById, userSaveData } from '@/store/features/user/userSlice'
import { convertStringsToIntegers } from '@/utils'
import { useSession } from 'next-auth/react'
import { Avatar, Button, Close, CompanyList, CountrySelect, Email, Select, Text, Toast } from 'pq-ap-lib'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditId?: number | null
}
type SetterFunction = (value: boolean) => void

const UserDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [imageGuId, setImageGuId] = useState<string>('')
  const [prevGuId, setPrevGuId] = useState<string>('')
  const [imageName, setImageName] = useState<string>('')

  const [firstName, setFirstName] = useState<string>('')
  const [firstNameError, setFirstNameError] = useState<boolean>(false)

  const [lastName, setLastName] = useState<string>('')
  const [lastNameError, setLastNameError] = useState<boolean>(false)

  const [email, setEmail] = useState<string>('')
  const [emailError, setEmailError] = useState<boolean>(false)

  const [phone, setPhone] = useState<string>('')
  const [phoneError, setPhoneError] = useState<boolean>(false)

  const [city, setCity] = useState([])
  const [cityId, setCityId] = useState<number>(0)
  const [cityError, setCityError] = useState<boolean>(false)

  const [state, setState] = useState([])
  const [stateId, setStateId] = useState<number>(0)
  const [stateError, setStateError] = useState<boolean>(false)

  const [country, setCountry] = useState([])
  const [countryId, setCountryId] = useState<number>(0)
  const [countryError, setCountryError] = useState<boolean>(false)

  const [timezone, setTimezone] = useState([])
  const [timezoneId, setTimezoneId] = useState<number>(0)
  const [timezoneError, setTimezoneError] = useState<boolean>(false)

  const [company, setCompany] = useState([])
  const [companyList, setCompanyList] = useState([])
  const [companyError, setCompanyError] = useState<boolean>(false)

  const [role, setRole] = useState([])
  const [newRoleId, setNewRoleId] = useState<number>(0)
  const [roleError, setRoleError] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<any>()
  const [isEditStatus, setIsEditStatus] = useState<boolean>(false)

  const setErrorTrue = () => {
    setFirstNameError(true)
    setLastNameError(true)
    setEmailError(true)
    setPhoneError(true)
    setCountryError(true)
    setStateError(true)
    setCityError(true)
    setTimezoneError(true)
    setCompanyError(true)
    setRoleError(true)
  }

  const initialData = () => {
    setFirstName('')
    setFirstNameError(false)

    setLastName('')
    setLastNameError(false)

    setEmail('')
    setEmailError(false)

    setPhone('')
    setPhoneError(false)

    setCountry([])
    setCountryId(0)
    setCountryError(false)

    setState([])
    setStateId(0)
    setStateError(false)

    setCity([])
    setCityId(0)
    setCityError(false)

    setTimezone([])
    setTimezoneId(0)
    setTimezoneError(false)

    setCompanyList([])
    setCompanyError(false)

    setRole([])
    setNewRoleId(0)
    setRoleError(false)

    setIsLoading(false)
    setImagePreview('')
    setImageGuId('')
    setImageName('')
    setIsEditStatus(false)
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  function getResponseData(payload: any): any {
    return payload?.ResponseData || {}
  }

  //User Get Data API
  const getUserDataById = async () => {
    const params = {
      UserId: EditId,
    }
    try {
      const { payload, meta } = await dispatch(userGetDataById(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = getResponseData(payload)
          const {
            first_name,
            last_name,
            email,
            phone,
            country_id,
            state_id,
            city_id,
            time_zone,
            companyIds,
            roleId,
            guid,
            is_Active,
            user_image,
          } = responseData
          setFirstName(first_name || '')
          setLastName(last_name || '')
          setEmail(email || '')
          setPhone(phone || '')
          setCountryId(country_id)
          setStateId(state_id)
          setCityId(city_id)
          setTimezoneId(time_zone)
          setNewRoleId(roleId)
          setCompanyList(companyIds.map(String))
          setPrevGuId(guid)
          setImageName(user_image || '')
          setIsEditStatus(is_Active)

          if (user_image) {
            onGetUserImage(user_image)
          }
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
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

  //Timezone List API
  const getTimezoneList = () => {
    const params = {
      CountryId: countryId,
    }
    performApiAction(dispatch, timezoneListDropdown, params, (responseData: any) => {
      setTimezone(responseData)
    })
  }

  //Company List Dropdown API
  const getCompanyList = () => {
    performApiAction(dispatch, companyListDropdown, null, (responseData: any) => {
      setCompany(responseData)
    })
  }

  //Assign Role Dropdown API
  const getRoleList = () => {
    const params = {
      CompanyId: CompanyId ? CompanyId : 0,
    }
    performApiAction(dispatch, roleListDropdown, params, (responseData: any) => {
      setRole(responseData)
    })
  }

  const validateAndSetError = (value: string | null | undefined, setter: SetterFunction): void => {
    if (value === null || value === undefined || value.trim().length <= 0) {
      setter(true)
    }
  }

  const validateAndSetNumericError = (value: number | undefined, setter: SetterFunction): void => {
    if (value !== undefined && (value <= 0 || value === 0)) {
      setter(true)
    }
  }

  //Save Data API
  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (selectedFile !== null) {
      uploadImage()
    }
    validateAndSetError(firstName, setFirstNameError)
    validateAndSetError(lastName, setLastNameError)
    validateAndSetError(email, setEmailError)
    validateAndSetError(phone, setPhoneError)
    validateAndSetNumericError(countryId, setCountryError)
    validateAndSetNumericError(stateId, setStateError)
    validateAndSetNumericError(cityId, setCityError)
    validateAndSetNumericError(timezoneId, setTimezoneError)
    validateAndSetNumericError(newRoleId, setRoleError)
    if (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      email.trim().length > 0 &&
      phone.trim().length > 0 &&
      countryId > 0 &&
      stateId > 0 &&
      cityId > 0 &&
      timezoneId > 0 &&
      newRoleId > 0
    ) {
      setIsLoading(true)
      const params = {
        id: EditId || 0,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        guid: EditId !== undefined ? prevGuId : imageGuId,
        user_image: imageName,
        country_id: countryId,
        state_id: stateId,
        city_id: cityId,
        postal_code: '',
        time_zone: timezoneId,
        companyIds: convertStringsToIntegers(companyList),
        OrgId: session?.user?.org_id,
        roleid: newRoleId,
        is_Active: isEditStatus,
      }
      performApiAction(dispatch, userSaveData, params, () => {
        Toast.success(`${EditId ? 'Details Updated!' : 'User Added!'}`)
        clearAllData('Save')
      })
    }
  }

  const handleInputChange = (value: any, name: string) => {
    const pattern = /^[a-zA-Z0-9 ]*$/
    if (pattern.test(value)) {
      name === 'firstName' && setFirstName(value)
      name === 'lastName' && setLastName(value)
    }
  }

  const handleCompanySelect = (value: any) => {
    setCompanyList(value)
  }

  useEffect(() => {
    if (onOpen && EditId === undefined) {
      const guId = `${uuidv4()}`
      setImageGuId(guId)
    }
    if (onOpen) {
      getCountryList()
    }
  }, [onOpen])

  useEffect(() => {
    if (countryId > 0) {
      getStateList()
      getTimezoneList()
    }
  }, [countryId])

  useEffect(() => {
    if (stateId > 0) {
      getCityList()
    }
  }, [stateId])

  const onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const userImageName = `${EditId !== undefined ? `${prevGuId}.${file.name.split('.').pop()}` : `${imageGuId}.${file.name.split('.').pop()}`
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

  //Upload User Image Api
  // const uploadImage = async () => {
  //   const formData = new FormData()

  //   formData.append('file', selectedFile)
  //   formData.append('fileName', imageName)

  //   try {
  //     const { payload, meta } = await dispatch(uploadUserImage(formData))
  //     const dataMessage = payload?.Message

  //     if (meta?.requestStatus === 'fulfilled') {
  //       if (payload?.ResponseStatus === 'Success') {
  //       } else {
  //         Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
  //       }
  //     } else {
  //       Toast.error(`${payload?.status} : ${payload?.statusText}`)
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  const uploadImage = () => {
    const formData = new FormData()

    formData.append('file', selectedFile)
    formData.append('fileName', imageName)
    performApiAction(dispatch, uploadUserImage, formData, () => { })
  }

  //Get UserImage API
  const onGetUserImage = (imageNames: any) => {
    const params = {
      fileName: imageNames,
    }
    performApiAction(dispatch, getUserImage, params, (responseData: any) => {
      setImagePreview(responseData)
    })
  }

  const handleEditIconClick = (e: any) => {
    const fileInput = document.getElementById('imageUpload')
    fileInput && fileInput.click()
  }

  useEffect(() => {
    if (onOpen) {
      getCompanyList()
      getRoleList()
    }
    if (EditId) {
      getUserDataById()
    }
  }, [onOpen, EditId])

  return (
    <div
      className={`fixed right-0 top-0 z-20 flex h-full  w-3/4 flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 sm:w-2/4 lg:w-2/6 xl:w-2/6 hd:w-[425px] 2xl:w-[425px] 3xl:w-[425px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}>
      <div className='!h-[60px] sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='py-[15px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          {EditId ? 'Edit' : 'Add'} User
        </label>
        <div className='pt-2.5' onClick={() => clearAllData('Cancel')}>
          <Close variant='medium' />
        </div>
      </div>
      <div className='custom-scroll flex-1 overflow-y-auto p-5'>
        <div className='flex'>
          <div className='relative flex'>
            <Avatar variant='large' imageUrl={imagePreview} />
            <div className='absolute bottom-0 left-11 cursor-pointer rounded-sm bg-white p-[1px]' onClick={handleEditIconClick}>
              <EditIcon />
            </div>
            <input type='file' id='imageUpload' accept='.png, .jpg, .jpeg' className='hidden' onChange={onUploadImage} />
          </div>
        </div>
        <div className='my-5 flex flex-row gap-5'>
          <Text
            label='First Name'
            id='firstName'
            name='firstName'
            placeholder='Please enter first name'
            validate
            maxLength={50}
            hasError={firstNameError}
            value={firstName}
            getValue={(value: any) => handleInputChange(value, 'firstName')}
            getError={() => { }}
          />
          <Text
            label='Last Name'
            id='lastName'
            name='lastName'
            placeholder='Please enter last name'
            validate
            maxLength={50}
            hasError={lastNameError}
            value={lastName}
            getValue={(value: any) => handleInputChange(value, 'lastName')}
            getError={() => { }}
          />
        </div>
        <div className='flex-1'>
          <Email
            label='Email'
            id='email'
            name='email'
            type='email'
            placeholder='Please enter email'
            disabled={EditId == null ? false : true}
            value={email}
            validate
            getValue={(value: any) => {
              setEmail(value)
              setEmailError(false)
            }}
            getError={() => { }}
            hasError={emailError}
            minLength={10}
            maxLength={100}
          />
        </div>
        <div className='my-5 flex'>
          <CountrySelect
            key={onOpen + ""}
            id='phone'
            name='phone'
            label='Phone Number'
            value={phone}
            countryCode='1'
            validate
            required
            getValue={(value: any) => {
              setPhone(value)
              setPhoneError(false)
            }}
            getError={() => { }}
            hasError={phoneError}
          />
        </div>
        <div className='flex-1'>
          <Select
            id='country'
            label='Country'
            options={country}
            validate
            defaultValue={countryId}
            getValue={(value: any) => {
              setCountryId(value)
              setCountryError(false)
            }}
            getError={() => { }}
            hasError={countryError}
          />
        </div>
        <div className='my-5 flex-1'>
          <Select
            id='state'
            label='State'
            options={state}
            validate
            defaultValue={stateId}
            getValue={(value: any) => {
              setStateId(value)
              setStateError(false)
            }}
            getError={() => { }}
            hasError={stateError}
          />
        </div>
        <div className='flex-1'>
          <Select
            id='city'
            name='city'
            label='City'
            options={city}
            validate
            defaultValue={cityId}
            getValue={(value: any) => {
              setCityId(value)
              setCityError(false)
            }}
            getError={() => { }}
            hasError={cityError}
          />
        </div>
        <div className='my-5 flex-1'>
          <Select
            id='timezone'
            name='timezone'
            label='Timezone'
            options={timezone}
            validate
            defaultValue={timezoneId}
            getValue={(value: any) => {
              setTimezoneId(value)
              setTimezoneError(false)
            }}
            getError={() => { }}
            hasError={timezoneError}
          />
        </div>
        <div className='flex-1'>
          <CompanyList
            id='company'
            showAvatar={5}
            label='Company'
            placeholder='Please select'
            avatarSize='x-small'
            options={company}
            values={companyList}
            getValue={(value: any) => {
              handleCompanySelect(value)
            }}
            getError={() => { }}
            hasError={companyError}
          />
        </div>
        <div className='my-5 flex-1'>
          <Select
            id='role'
            name='role'
            label='Assign Role'
            options={role}
            validate
            defaultValue={newRoleId}
            getValue={(value: any) => {
              setNewRoleId(value)
              setRoleError(false)
            }}
            getError={() => { }}
            hasError={roleError}
          />
        </div>
      </div>

      <div className='!h-[66px] sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
        <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
          <Button onClick={() => clearAllData('Cancel')} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
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

export default UserDrawer
