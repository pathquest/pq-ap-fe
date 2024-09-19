import { validate, verifyAllFieldsValues } from '@/utils/billposting'
import { Avatar, Button, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import ControlFields from '../controls'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { useAppDispatch } from '@/store/configureStore'
import {
  getCities,
  getCountries,
  getStates,
  saveUserProfile,
  getTimeZone,
  uploadUserImage,
  getUserImage,
} from '@/store/features/profile/profileSlice'
import EditIcon from '@/assets/Icons/EditIcon'
import { performApiAction } from '../Common/Functions/PerformApiAction'
import { v4 as uuidv4 } from 'uuid'

const ProfileForm = ({ profileData, handleEdit }: any) => {
  const [countryDropdown, setCountryDropdown] = useState<OptionType[]>([])
  const [stateDropdown, setStateDropdown] = useState<OptionType[]>([])
  const [cityDropdown, setCityDropdown] = useState<OptionType[]>([])
  const [timeZoneDropdown, setTimeZoneDropdown] = useState<OptionType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageName, setImageName] = useState<string>('')
  const [imageGuId, setImageGuId] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string>('')

  const dispatch = useAppDispatch()

  const [formFields, setFormFields] = useState<ProfileFormFieldsProps>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    country_id: 0,
    state_id: 0,
    city_id: 0,
    postal_code: '',
    time_zone: 0,
    user_image: '',
  })

  const fieldsErrorObj = {
    first_name: false,
    last_name: false,
    email: false,
    phone: false,
    address: false,
    country_id: false,
    state_id: false,
    city_id: false,
    postal_code: false,
    time_zone: false,
  }

  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<ProfileFormFieldErrorsProps>(fieldsErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<ProfileFormFieldErrorsProps>(fieldsErrorObj)

  useEffect(() => {
    setFormFields({
      first_name: profileData?.first_name ?? '',
      last_name: profileData?.last_name ?? '',
      email: profileData?.email ?? '',
      phone: profileData?.phone ? profileData?.phone : '',
      address: profileData?.address ?? '',
      country_id: profileData?.country_id ?? 0,
      state_id: profileData?.state_id ?? 0,
      city_id: profileData?.city_id ?? 0,
      postal_code: profileData?.postal_code ?? '',
      time_zone: profileData?.time_zone ?? 0,
      user_image: profileData?.user_image && onGetUserImage(profileData?.user_image),
    })

    setHasFormFieldLibraryErrors({
      first_name: profileData?.first_name ? true : false,
      last_name: profileData?.last_name ? true : false,
      email: profileData?.email ? true : false,
      phone: profileData?.phone ? true : false,
      address: profileData?.address ? true : false,
      country_id: profileData?.country_id ? true : false,
      state_id: profileData?.state_id ? true : false,
      city_id: profileData?.city_id ? true : false,
      postal_code: profileData?.postal_code ? true : false,
      time_zone: profileData?.time_zone ? true : false,
    })
  }, [profileData])

  const getCountryData = async () => {
    const response = await dispatch(getCountries())
    try {
      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response.payload.ResponseStatus === 'Success') {
          setCountryDropdown(response.payload.ResponseData)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getStateData = async (id: number) => {
    const response = await dispatch(getStates({ id }))
    try {
      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response.payload.ResponseStatus === 'Success') {
          setStateDropdown(response.payload.ResponseData)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getCityData = async (id: number) => {
    const response = await dispatch(getCities({ id }))
    try {
      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response.payload.ResponseStatus === 'Success') {
          setCityDropdown(response.payload.ResponseData)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getTimeZoneData = async (id: number) => {
    const response = await dispatch(getTimeZone({ id }))
    try {
      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response.payload.ResponseStatus === 'Success') {
          setTimeZoneDropdown(response.payload.ResponseData)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateProfile = async () => {
    setIsLoading(true)
    const response = await dispatch(
      saveUserProfile({
        ...formFields,
        id: String(profileData.id),
        user_image: imageName,
        is_active: true,
        is_verified: true,
      })
    )

    const dataMessage = response.payload.Message

    try {
      if (response?.meta?.requestStatus === 'fulfilled') {
        if (response.payload.ResponseStatus === 'Success') {
          Toast.success('Profile updated successfully!')
          handleEdit(false, '')
          setIsLoading(false)
        }
        if (response.payload.ResponseStatus === 'Failure') {
          Toast.error(!dataMessage ? 'Something went wrong!' : dataMessage)
          handleEdit(false, '')
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error(error)
      handleEdit(false, '')
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    if (selectedFile !== null) {
      uploadImage()
    }

    const errorsValues = verifyAllFieldsValues(formFields)
    setHasFormFieldErrors(errorsValues)

    if (validate(hasFormFieldLibraryErrors)) {
      updateProfile()
    }
  }

  useEffect(() => {
    getCountryData()
    formFields?.country_id === 0 ? getStateData(1) : getStateData(formFields?.country_id ?? 0)
    formFields?.state_id === 0 ? getCityData(1) : getCityData(formFields?.state_id ?? 0)

    formFields?.country_id === 0 ? getTimeZoneData(1) : getTimeZoneData(formFields?.country_id ?? 0)
  }, [formFields?.country_id, formFields?.state_id])

  const setFormValues = (key: string, value: string | number) => {
    setFormFields({
      ...formFields,
      [key]: value,
    })
  }

  const handleEditIconClick = () => {
    const fileInput = document.getElementById('imageUpload')
    fileInput && fileInput.click()
  }

  useEffect(() => {
    if (!handleEdit) {
      const guId = uuidv4()
      setImageGuId(guId)
    }
  }, [handleEdit])

  const onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const userImageName = `${handleEdit !== undefined
          ? `${file.name.split('.').pop()}`
          : `${imageGuId}.${file.name.split('.').pop()}`
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
  const uploadImage = () => {
    const formData = new FormData()

    if (selectedFile) {
      formData.append('file', selectedFile)
    }
    formData.append('fileName', imageName)
    performApiAction(dispatch, uploadUserImage, formData, () => { })
  }

  //Get User Image API
  const onGetUserImage = (imageNames: string) => {
    const params = {
      fileName: imageNames,
    }
    performApiAction(dispatch, getUserImage, params, (responseData: any) => {
      setImagePreview(responseData)
    })
  }

  const generalDetailsFormFields = [
    {
      type: 'text',
      key: 'first_name',
      label: 'First Name',
      placeholder: 'Please enter first name',
      isValidate: true,
      isNumeric: true,
      value: formFields?.first_name,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.first_name,
      autoComplete: false,
      min: 3,
      max: 50,
    },
    {
      type: 'text',
      key: 'last_name',
      label: 'Last Name',
      placeholder: 'Please enter last name',
      isNumeric: true,
      isValidate: true,
      value: formFields?.last_name,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.last_name,
      autoComplete: false,
      min: 3,
      max: 50,
    },
    {
      type: 'tel',
      key: 'phone',
      label: 'Phone No.',
      isValidate: true,
      value: formFields?.phone,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.phone,
      autoComplete: false,
    },
    {
      type: 'email',
      key: 'email',
      label: 'Email',
      placeholder: 'Please enter email',
      isValidate: true,
      disable: true,
      value: formFields?.email,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.email,
      autoComplete: false,
      min: 10,
      max: 100,
    },
  ]

  const locationDetailsFormFields = [
    {
      type: 'text',
      key: 'address',
      label: 'Address',
      placeholder: 'Please enter address',
      isValidate: true,
      value: formFields?.address,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.address,
      autoComplete: false,
      max: 100,
    },
    {
      type: 'select',
      key: 'country_id',
      id: 'country',
      label: 'Country',
      options: countryDropdown,
      errorClass: '!-mt-4',
      isValidate: true,
      defaultValue: formFields?.country_id,
      getValue: (key: string, value: any) => {
        setFormValues(key, value)
        getStateData(value)
        getTimeZoneData(value)
        setHasFormFieldErrors({
          ...hasFormFieldErrors,
          [key]: false,
        })
      },
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.country_id,
      autoComplete: false,
    },
    {
      type: 'select',
      key: 'state_id',
      id: 'state',
      label: 'State',
      options: stateDropdown,
      errorClass: '!-mt-4',
      isValidate: true,
      defaultValue: formFields?.state_id,
      getValue: (key: string, value: any) => {
        setFormValues(key, value)
        getCityData(value)
        setHasFormFieldErrors({
          ...hasFormFieldErrors,
          [key]: false,
        })
      },
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.state_id,
      autoComplete: false,
    },
    {
      type: 'select',
      key: 'city_id',
      id: 'city',
      label: 'City',
      options: cityDropdown,
      errorClass: '!-mt-4',
      isValidate: true,
      defaultValue: formFields?.city_id,
      getValue: (key: string, value: any) => {
        setFormValues(key, value)
        setHasFormFieldErrors({
          ...hasFormFieldErrors,
          [key]: false,
        })
      },
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.city_id,
      autoComplete: false,
    },
    {
      type: 'text',
      key: 'postal_code',
      label: 'Zip Code',
      placeholder: 'Enter Zip Code',
      isValidate: true,
      isSpecialChar: true,
      isText: false,
      value: formFields?.postal_code,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.postal_code,
      autoComplete: false,
      min: 6,
      max: 8,
    },
    {
      type: 'select',
      key: 'time_zone',
      id: 'time_zone',
      label: 'Timezone',
      placeholder: 'Enter Timezone',
      options: timeZoneDropdown,
      errorClass: '!-mt-4',
      isValidate: true,
      defaultValue: formFields?.time_zone,
      getValue: (key: string, value: any) => {
        setFormValues(key, value)
        setHasFormFieldErrors({
          ...hasFormFieldErrors,
          [key]: false,
        })
      },
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.time_zone,
      autoComplete: false,
    },
  ]

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className='flex max-h-[72vh] gap-[20px] overflow-y-auto p-[20px]'>
          <div className='relative mt-2 flex h-16'>
            {imagePreview !== '' ? (
              <Avatar imageUrl={imagePreview} variant='large' className='!h-[150px] !w-[180px]' />
            ) : (
              <Avatar
                imageUrl={''}
                name={`${formFields?.first_name} ${formFields?.last_name}`}
                variant='large'
                className='!h-[150px] !w-[150px]'
              />
            )}
            <div className='absolute right-3 top-28 cursor-pointer rounded bg-[#EEF4F8] p-0.5' onClick={handleEditIconClick}>
              <EditIcon />
            </div>
            <input type='file' id='imageUpload' accept='.png, .jpg, .jpeg' className='hidden' onChange={onUploadImage} />
          </div>
          <div className='flex w-full flex-col'>
            <div className='flex flex-col'>
              <span className='pb-4 text-[18px] font-semibold !uppercase'>General Details</span>
              <ControlFields formFields={generalDetailsFormFields} isGrid />
            </div>
            <div className='flex flex-col pt-5'>
              <span className='py-4 text-[18px] font-semibold !uppercase'>Location Details</span>
              <ControlFields formFields={locationDetailsFormFields} isGrid />
            </div>
          </div>
        </div>
        <div className='sticky bottom-0 flex  w-full items-center justify-end border-t border-lightSilver bg-white'>
          <div className='flex gap-5 m-5'>
            <Button onClick={() => handleEdit(false, '')} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
              <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
            </Button>
            <Button
              type='submit'
              className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
              variant='btn-primary'
            >
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
              </label>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
