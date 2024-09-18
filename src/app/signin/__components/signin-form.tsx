'use client'

import Image from 'next/image'
import Link from 'next/link'

import agent from '@/api/axios'
import Google from '@/assets/Icons/Google'
import Qb from '@/assets/Icons/Qb'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Footer from '@/components/Footer'
import ControlFields from '@/components/controls'
import { validate, verifyAllFieldsValues } from '@/utils/billposting'
import { signInContent } from '@/utils/local'
import { useRouter } from 'next/navigation'
import { Button, CheckBox, Toast, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

export default function SignInForm() {
  const [checked, setChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formFields, setFormFields] = useState<SignInFormFieldsProps>({
    username: '',
    password: '',
  })

  const fieldsErrorObj = {
    username: false,
    password: false,
  }

  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<SignInFormFieldErrorsProps>(fieldsErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<SignInFormFieldErrorsProps>(fieldsErrorObj)

  useEffect(() => {
    formFields.username.trim().length > 0 &&
      setHasFormFieldLibraryErrors((prevState) => ({
        ...prevState,
        username: true,
      }))

    formFields.password.trim().length > 0 &&
      setHasFormFieldLibraryErrors((prevState) => ({
        ...prevState,
        password: true,
      }))
  }, [formFields?.username, formFields?.password])

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
          Toast.error('Error', 'Login failed. Please try again.')
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
    if (validate(hasFormFieldLibraryErrors)) {
      setIsLoading(true)

      try {
        const response = await agent.APIs.login(formFields)
        const dataMessage = response?.Message

        if (response?.ResponseStatus === 'Success') {
          router.push(`/verification?email=${encodeURIComponent(formFields?.username)}`)
          Toast.success('OTP sent successfully.', 'Please check your email id for OTP.')
        } else {
          if (!dataMessage) {
            Toast.error('Error', 'Login failed. Please try again.')
          } else {
            Toast.error('Error', dataMessage)
          }
        }
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }

  const setFormValues = (key: string, value: string | number) => {
    setFormFields({
      ...formFields,
      [key]: value,
    })
  }

  const signInFormFields = [
    {
      type: 'email',
      key: 'username',
      label: 'Email',
      name: 'username',
      isValidate: true,
      value: formFields?.username,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.username,
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
    {
      type: 'password',
      key: 'password',
      label: 'Password',
      name: 'password',
      noValidate: true,
      isValidate: true,
      value: formFields?.password,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.password,
      autoComplete: false,
      min: 12,
      max: 28,
      classNames: 'w-[300px] h-[52px] mb-[18px] lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
  ]

  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <div className='loginWrapper flex flex-col items-center pt-5 hd:pt-[30px] 2xl:pt-[30px]'>
        <Image src='/logo.png' alt='Logo' className='w-[194px] hd:w-[200px] 2xl:w-[200px]' width={200} height={50} priority />

        <Typography type='h3' className='mt-4 h-[29px] hd:mt-5 2xl:mt-5 font-bold text-primary'>
          {signInContent?.title}
        </Typography>

        <form
          autoComplete='off'
          onSubmit={handleSubmit}
          className='flex w-full max-w-3xl flex-col items-center justify-center py-5 hd:pt-[25px] 2xl:pt-[25px] text-start'
        >
          <ControlFields formFields={signInFormFields} />

          <div className='flex w-[300px] items-center justify-between py-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]'>
            <div className='flex items-center justify-center'>
              <CheckBox
                id='agree'
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                label='Keep me logged in'
                className='text-darkCharcoal'
                variant='small'
              />
            </div>
            <Link href='/forgot-password' className='text-sm hd:text-base font-semibold text-primary underline lg:text-base'>
              {signInContent?.forgotPassword}
            </Link>
          </div>
          <Button
            type='submit'
            onClick={handleSubmit}
            className={`mb-5 !h-[36px] !w-[300px] lg:!w-[356px] xl:!w-[356px] hd:!w-[356px] rounded-full !font-semibold disabled:opacity-50 ${isLoading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex h-full items-center justify-center ${isLoading ? "animate-spin mx-[26px]" : "text-sm hd:text-base font-proxima font-semibold tracking-[0.02em] cursor-pointer"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : signInContent?.signInBtn}
            </label>
          </Button>
        </form>
        <div className='socialMediaBox relative flex w-[300px] max-w-md flex-col border-t border-lightSilver p-3 lg:w-[356px] xl:w-[356px] hd:w-[356px]'>
          <Typography
            type='p'
            className='max-w-content relative top-[-25px] m-auto bg-white px-5 text-sm text-darkCharcoal lg:text-base'
          >
            {signInContent?.continueWith}
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
        <div className='mt-5 flex items-center justify-between pb-4 hd:pb-0 2xl:pb-0 text-sm text-darkCharcoal'>
          {signInContent?.notHaveAccount}
          <Link href={'/signup'} className='ml-1 font-semibold font-proxima text-primary underline'>
            {signInContent?.signUpBtn}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
