'use client'
import agent from '@/api/axios'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Footer from '@/components/Footer'
import ControlFields from '@/components/controls'
import { validate, verifyAllFieldsValues } from '@/utils/billposting'
import { setPasswordContent } from '@/utils/local'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Loader, Toast } from 'pq-ap-lib'
import { useState } from 'react'

const initialFormFields = {
  password: '',
  cPassword: '',
}

const fieldsErrorObj = {
  password: false,
  cPassword: false,
}

export default function SetNewPasswordForm() {
  const getToken = useSearchParams()
  const token = getToken.get('token')
  const router = useRouter()

  const [error, setError] = useState(false)

  const [formFields, setFormFields] = useState<SetPasswordFormFieldsProps>(initialFormFields)

  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<SetPasswordFormFieldErrorsProps>(fieldsErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<SetPasswordFormFieldErrorsProps>(fieldsErrorObj)

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const errorsValues = verifyAllFieldsValues(formFields)
    setHasFormFieldErrors(errorsValues)

    if (formFields?.password !== formFields?.cPassword) setError(true)
    else setError(false)

    if (validate(hasFormFieldLibraryErrors) && formFields?.password === formFields?.cPassword) {
      setIsLoading(true)
      try {
        const response = await agent.APIs.setPassword({
          token: token ?? '',
          password: formFields?.password,
        })
        const dataMessage = response?.Message

        if (response.ResponseStatus === 'Success') {
          setFormFields(initialFormFields)
          setHasFormFieldLibraryErrors(fieldsErrorObj)
          setIsLoading(false)

          if (!dataMessage) {
            Toast.success('Success', 'Password set successfully.')
          } else {
            Toast.success('Success', dataMessage)
          }
          router.push(`/signin`)
        } else {
          setIsLoading(false)

          if (!dataMessage) {
            Toast.error('Error', 'Please try again.')
          } else {
            router.push(`/signin`)
            Toast.error('Error', dataMessage)
          }
        }
      } catch (error) {
        setIsLoading(false)
        console.error(error)
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

  const setPasswordFormFields: FormField[] = [
    {
      type: 'password',
      key: 'password',
      label: 'Password',
      name: 'password',
      direction: 'top',
      isValidate: true,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.password,
      min: 8,
      max: 16,
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
    {
      type: 'password',
      key: 'cPassword',
      label: 'Confirm Password',
      name: 'cPassword',
      isValidate: true,
      getValue: (key: string, value: string) => setFormValues(key, value),
      getError: (key: string, err: boolean) =>
        setHasFormFieldLibraryErrors({
          ...hasFormFieldLibraryErrors,
          [key]: err,
        }),
      hasError: hasFormFieldErrors?.cPassword,
      min: 8,
      max: 16,
      classNames: 'w-[300px] h-[52px] mb-5 lg:w-[356px] xl:w-[356px] hd:w-[356px]',
    },
  ]

  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <div className='flex flex-col items-center pt-5'>
        <Image src='/logo.png' alt='Logo' className='w-[194px] hd:w-[200px] 2xl:w-[200px]' width={200} height={50} priority />

        <div className='flex h-[calc(100vh-128px)] flex-col items-center justify-center'>
          <span className='mx-5 pb-[25px] text-xl font-bold text-primary sm:mx-auto lg:text-2xl'>
            {setPasswordContent?.description}
          </span>

          <form
            className='flex w-full max-w-md flex-col items-center justify-center py-5 hd:pt-[25px] 2xl:pt-[25px] text-start'
            onSubmit={handleSubmit}
          >
            <ControlFields formFields={setPasswordFormFields} />

            {error && <span className='text-sm text-defaultRed lg:text-base'>{setPasswordContent?.errorMessage}</span>}
            <Button
              type='submit'
              onClick={handleSubmit}
              className={`mt-2 !h-[36px] !w-[300px] lg:!w-[356px] xl:!w-[356px] hd:!w-[356px] rounded-full !font-semibold disabled:opacity-50 ${isLoading && 'pointer-events-none opacity-80'}`}
              variant='btn-primary'>
              <label className={`flex h-full items-center justify-center ${isLoading ? "animate-spin mx-[26px]" : "text-sm hd:text-base font-proxima font-semibold tracking-[0.02em] cursor-pointer"}`}>
                {isLoading ? <SpinnerIcon bgColor='#FFF' /> : setPasswordContent?.continueBtn}
              </label>
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
