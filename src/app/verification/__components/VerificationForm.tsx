'use client'
import { handleSignInSubmit } from '@/actions/server/auth'
import agent from '@/api/axios'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import Footer from '@/components/Footer'
import { verificationContent } from '@/utils/local'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, Button, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

const TIMER_DURATION = 120

export default function VerificationForm() {
  const router = useRouter()
  const Email = useSearchParams()
  const email = Email.get('email')
  const [otp, setOtp] = useState<string[]>(Array.from({ length: 6 }, () => ''))
  const [alertVisible, setAlertVisible] = useState(false)
  const [showEmailInfo, setShowEmailInfo] = useState(true)
  const [isValidationError, setIsValidationError] = useState(false)
  const [remainingTime, setRemainingTime] = useState<number>(TIMER_DURATION)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [loading, setIsLoading] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const { value } = event.target
    setIsValidationError(false)

    if (value.length === 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (value !== '' && index < 5) {
        const nextInput = document.querySelector<HTMLInputElement>(`.otp__field__${index + 2}`)
        if (nextInput) {
          nextInput.focus()
        }
      } else if (value === '' && index > 0) {
        const previousInput = document.querySelector<HTMLInputElement>(`.otp__field__${index}`)
        if (previousInput) {
          previousInput.focus()
        }
      }
    } else if (value.length === 6) {
      const newOtp = value.split('')
      setOtp(newOtp)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (event.key === 'Backspace') {
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
      if (index > 0) {
        const previousInput = document.querySelector<HTMLInputElement>(`.otp__field__${index}`)
        if (previousInput) {
          previousInput.value = ''
          previousInput.focus()
        }
      }
    } else {
      const { value } = event.target as HTMLInputElement
      if (value.length === 1) {
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value !== '' && index < 3) {
          const nextInput = document.querySelector<HTMLInputElement>(`.otp__field__${index + 2}`)
          if (nextInput) {
            nextInput.focus()
          }
        }
      }
    }
  }

  const handleResendOTP = async () => {
    if (!isTimerActive) {
      setShowEmailInfo(false)
      setShowEmailInfo(true)
      setAlertVisible(true)
      setOtp(Array.from({ length: 6 }, () => ''))
      setTimeout(() => {
        setAlertVisible(false)
      }, 3000)

      try {
        const response = await agent.APIs.generateOtp({
          email: email ?? '',
        })

        if (response.ResponseStatus === 'Success') {
          router.push('/verification')
          setRemainingTime(120)
          setIsTimerActive(true)
        } else {
          const dataMessage = response.Message
          if (!dataMessage) {
            Toast.error('Data does not match.')
          } else {
            Toast.error(dataMessage)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (otp.includes('')) {
      setIsValidationError(true)
    } else {
      setIsLoading(true)
      await handleSignInSubmit({
        otp: otp.join(''),
        email: email ?? '',
      })
        .then((res) => {
          setIsLoading(false)

          if (res?.error) {
            Toast.error('Error', res.error)
          } else {
            Toast.success('Success', 'Logged in successfully.')
          }
        })
        .catch(() => Toast.error('Something went wrong!'))
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const { key } = event
    if (key === 'e' || key === '-' || key === '+') {
      event.preventDefault()
    }
    if (!/^\d$/.test(key)) {
      event.preventDefault()
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (remainingTime > 0) {
        setRemainingTime((prevTime) => prevTime - 1)
      } else {
        setIsTimerActive(false)
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [remainingTime])

  useEffect(() => {
    const firstInput = document.querySelector<HTMLInputElement>('.otp__field__1')
    if (firstInput) {
      firstInput.focus()
    }
  }, [])

  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime % 60

  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <div className='loginWrapper flex flex-col items-center pt-5 hd:pt-[30px] 2xl:pt-[30px]'>
        <Image src='/logo.png' alt='Logo' className='w-[194px] hd:w-[200px] 2xl:w-[200px]' width={200} height={50} priority />
        <Toast position='top_right' />

        <Typography type='h4' className='h-[29px] mt-[51px] hd:mt-[51px] 2xl:mt-[51px] font-bold text-center'>
          {verificationContent?.description}
        </Typography>

        {showEmailInfo && (
          <>
            <Typography type='h5' className='pt-5 text-center !font-light'>
              {verificationContent?.sendInfo}
            </Typography>
            <span className='text-sm font-bold'>{email}</span>
          </>
        )}

        <form className='flex w-full max-w-md flex-col items-center justify-center py-5 hd:pt-[25px] 2xl:pt-[25px] text-start' onSubmit={handleVerify}>
          <div className='pb-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='otp-input-fields'>
                {otp.map((value, index) => (
                  <input
                    key={index}
                    type='number'
                    className={`otp__field__${index + 1} ${value ? 'filled' : ''} ${isValidationError && (value || !value) ? 'error' : ''
                      }`}
                    value={value}
                    onChange={(event) => handleChange(event, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onKeyPress={handleKeyPress}
                  />
                ))}
              </div>

              <div className='-mr-9 flex w-80 justify-end sm:mt-0 hd:pt-[10px] 2xl:pt-[10px]'>
                <p className='text-slatyGrey'>
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
          <Button
            type='submit'
            className={`!h-[36px] !w-[356px] lg:!w-[356px] xl:!w-[356px] hd:!w-[356px] rounded-full !font-semibold disabled:opacity-50 ${loading && 'pointer-events-none opacity-80'}`}
            variant='btn-primary'>
            <label className={`flex h-full items-center justify-center ${loading ? "animate-spin mx-[26px]" : "text-sm hd:text-base font-proxima font-semibold tracking-[0.02em] cursor-pointer"}`}>
              {loading ? <SpinnerIcon bgColor='#FFF' /> : verificationContent?.verifyBtn}
            </label>
          </Button>
        </form>

        <div className='flex py-2'>
          <Typography type='h6' className='text-sm text-slatyGrey'>
            {verificationContent?.linkText}
          </Typography>

          <div className='flex'>
            <span
              className={`ml-2 text-sm font-semibold underline ${remainingTime > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer text-primary'
                }`}
              onClick={handleResendOTP}
            >
              {verificationContent?.resendBtn}
            </span>
          </div>
        </div>
        <span className='w-50 flex flex-col justify-items-center'>
          {alertVisible && <Alert variant='info' message={verificationContent?.resendOtpMessage} />}
        </span>
      </div>
      <Footer />
    </div>
  )
}
