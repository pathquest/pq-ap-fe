'use client'

import agent from '@/api/axios'
import BackArrow from '@/assets/Icons/BackArrow'
import Footer from '@/components/Footer'
import ControlFields from '@/components/controls'
import { validate, verifyAllFieldsValues } from '@/utils/billposting'
import { forgotPasswordContent } from '@/utils/local'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Loader, Toast, Typography } from 'pq-ap-lib'
import React, { useState } from 'react'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formFields, setFormFields] = useState<ForgotPasswordFormFieldsProps>({
    email: '',
  })

  const fieldsErrorObj = {
    email: false,
  }

  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<ForgotPasswordFormFieldErrorsProps>(fieldsErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<ForgotPasswordFormFieldErrorsProps>(fieldsErrorObj)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errorsValues = verifyAllFieldsValues(formFields)
    setHasFormFieldErrors(errorsValues)

    if (validate(hasFormFieldLibraryErrors)) {
      setIsLoading(true)
      try {
        const response = await agent.APIs.forgotPassword(formFields)
        let dataMessage = response?.Message

        if (response?.ResponseStatus === 'Success') {
          if (!dataMessage) {
            Toast.success('Success', 'Password reset link sent successfully.')
          } else {
            Toast.success('Success', dataMessage)
          }
          router.push(`/forgot-confirm/?email=${formFields?.email}`)
        } else {
          if (!dataMessage) {
            Toast.error('Error', 'Please try again.')
          } else {
            Toast.error('Error', dataMessage)
          }
        }
        setIsLoading(false)
        
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

  const forgotPasswordFormFields = [
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
      classNames: 'w-[300px] pb-2 lg:w-[356px]',
    },
  ]

  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <div className='forgetWrapper flex flex-col items-center pt-5'>
        <Image src='/logo.png' alt='Logo' width={194} height={100} priority />

        <Typography type='h3' className='pb-2 pt-14 font-bold'>
          {forgotPasswordContent?.title}
        </Typography>
        <form className='flex w-full max-w-md flex-col items-center justify-center px-3 py-5 text-start' onSubmit={handleSubmit}>
          <ControlFields formFields={forgotPasswordFormFields} />

          {isLoading ? (
            <Loader size='sm' />
          ) : (
            <Button type='submit' variant='btn-primary' className='mt-[20px] !w-[300px] rounded-full !font-semibold'>
              {forgotPasswordContent?.sendEmailButton}
            </Button>
          )}

          <div className='backLoignWrapper flex justify-center pt-5'>
            <Link href='signin'>
              <div className='backArrow flex items-center justify-center'>
                <BackArrow />
                <div className='ml-2.5'>
                  <Typography type='text' className='!text-[14px] !font-normal text-primary'>
                    {forgotPasswordContent?.backButton}
                  </Typography>
                </div>
              </div>
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
