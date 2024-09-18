'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import Google from '@/assets/Icons/Google'
import Qb from '@/assets/Icons/Qb'
import Footer from '@/components/Footer'
import { Button, CheckBox, Toast, Tooltip, Typography } from 'pq-ap-lib'

import agent from '@/api/axios'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import ControlFields from '@/components/controls'
import { validate, verifyAllFieldsValues } from '@/utils/billposting'
import { signUpContent } from '@/utils/local'

const initialFormFields = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
}

const fieldsErrorObj = {
  first_name: false,
  last_name: false,
  email: false,
  phone: false,
}

export default function SignUpForm() {
  const router = useRouter()

  const [checked, setChecked] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [formFields, setFormFields] = useState<SignUpFormFieldsProps>(initialFormFields)

  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<SignUpFormFieldErrorsProps>(fieldsErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<SignUpFormFieldErrorsProps>(fieldsErrorObj)

  const handleLoginGoogle = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI
    const responseType = 'id_token token'
    const scope = 'email profile'

    const url = `${process.env.GOOGLE_ACCOUNT_OAUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`
    window.location.href = url
  }

  const handleLoginQuickBooks = async () => {
    try {
      const response = await agent.APIs.getQboConnectUrl()
      const dataMessage = response.Message

      if (response.ResponseStatus === 'Success') {
        window.location.href = response.ResponseData
      } else {
        if (!dataMessage) {
          Toast.error('Error', 'Registration failed. Please try again.')
        } else {
          Toast.error('Error', dataMessage)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const errorsValues = verifyAllFieldsValues(formFields)
    setHasFormFieldErrors(errorsValues)
    checked === false && setIsInvalid(true)
    if (validate(hasFormFieldLibraryErrors) && checked) {
      setIsLoading(true)
      register()
    } else {
      setIsLoading(false)
    }
  }

  const handleChecked = (e: any) => {
    if (e.target.checked) {
      setChecked(true)
      setIsInvalid(false)
    } else {
      setChecked(false)
    }
  }

  const register = async () => {
    try {
      const response = await agent.APIs.register(formFields)
      const dataMessage = response.Message

      if (response?.ResponseStatus === 'Success') {
        setFormFields(initialFormFields)
        Toast.success('A confirmation mail has been sent to your Email Address.')
        router.push(`/email-activation?email=${encodeURIComponent(formFields?.email)}`)
      } else {
        if (!dataMessage) {
          Toast.error('Registrarion failed. Please try again.')
        } else {
          Toast.error(dataMessage)
        }
      }
      setIsLoading(false)

    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  const setFormValues = (key: string, value: string | number) => {
    setFormFields({
      ...formFields,
      [key]: value,
    })
  }

  const signUpFormFields = [
    {
      type: 'text',
      key: 'first_name',
      label: 'First Name',
      name: 'first_name',
      id: 'first_name',
      isValidate: true,
      isNumeric: true,
      value: formFields?.first_name,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^a-zA-Z ]/g, '') // Remove non-alphabetic characters
        setFormFields({
          ...formFields,
          first_name: inputValue,
        })
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          first_name: inputValue.length >= 3 && inputValue.length <= 50 && /^[a-zA-Z ]+$/.test(inputValue),
        })
      },
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
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
    {
      type: 'text',
      key: 'last_name',
      label: 'Last Name',
      name: 'last_name',
      id: 'last_name',
      isValidate: true,
      isNumeric: true,
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
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
    {
      type: 'email',
      key: 'email',
      label: 'Email',
      name: 'email',
      id: 'email',
      isValidate: true,
      value: formFields?.email,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.email,
      autoComplete: false,
      max: 100,
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
    {
      type: 'tel',
      key: 'phone',
      label: 'Phone',
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
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
  ]

  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <div className='loginWrapper flex flex-col items-center pt-5 hd:pt-[30px] 2xl:pt-[30px]'>
        <Image src='/logo.png' alt='Logo' className='w-[194px] hd:w-[200px] 2xl:w-[200px]' width={200} height={50} priority />

        <Typography type='h3' className='mt-4 h-[29px] hd:mt-5 2xl:mt-5 hd:text-2xl font-bold text-primary tracking-[0.02em]'>
          {signUpContent?.title}
        </Typography>
        <span className='text-sm font-proxima font-normal text-[#1C1C1C] sm:text-base mt-2.5'>{signUpContent?.subTitle}</span>

        <form className='flex w-full max-w-3xl flex-col items-center justify-center py-5 hd:pt-[25px] 2xl:pt-[25px] text-start' onSubmit={handleSubmit}>
          <ControlFields formFields={signUpFormFields} />

          <div className='flex items-center justify-center mb-5 text-sm lg:text-base w-[300px] lg:w-[356px] xl:w-[356px] hd:w-[356px]'>
            <CheckBox
              id='agree'
              label='Agree to all'
              onChange={handleChecked}
              invalid={isInvalid}
              variant='small'
              className='text-darkCharcoal'
            />
            &nbsp;
            <Link href='#' className='text-sm font-semibold font-proxima text-primary underline'>
              {signUpContent?.termAndConditions}
            </Link>
            <span className='text-defaultRed'>*</span>
          </div>

          <Button
            type='submit'
            onClick={handleSubmit}
            className={`mb-5 !h-[36px] !w-[300px] lg:!w-[356px] xl:!w-[356px] hd:!w-[356px] rounded-full !font-semibold disabled:opacity-50 ${isLoading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex h-full items-center justify-center ${isLoading ? "animate-spin mx-[26px]" : "text-sm hd:text-base font-proxima font-semibold tracking-[0.02em] cursor-pointer"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : signUpContent?.signUpBtn}
            </label>
          </Button>
        </form>
        <div className='socialMediaBox relative flex w-[300px] max-w-md flex-col border-t border-lightSilver p-3 lg:w-[356px] xl:w-[356px] hd:w-[356px]'>
          <Typography
            type='p'
            className='tracking-[0.02em] max-w-content relative top-[-25px] m-auto bg-white px-5 text-sm text-darkCharcoal lg:text-base'>
            {signUpContent?.continueWith}
          </Typography>
          <div className='socialMedia flex justify-around'>
            <ul className='flex w-[100px] items-center justify-center'>
              <li className='mr-[40px]'>
                <Link href='#' onClick={handleLoginGoogle}>
                  <Tooltip content='Google' position='top'>
                    <Google />
                  </Tooltip>
                </Link>
              </li>
              <li>
                <Link href='#' onClick={handleLoginQuickBooks}>
                  <Tooltip content='Quick Books' position='top'>
                    <Qb />
                  </Tooltip>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mb-10 text-sm text-darkCharcoal lg:text-base'>
          {signUpContent?.alreadyHaveAccount}
          <Link href='/signin' className='ml-1 font-semibold font-proxima text-primary underline tracking-wide'>
            {signUpContent?.signInBtn}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
