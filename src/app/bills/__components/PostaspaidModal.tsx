import { useState } from 'react'

import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { Button, Close, Datepicker, Modal, ModalAction, ModalContent, ModalTitle, Select, Typography } from 'pq-ap-lib'

const PostaspaidModal = ({ onOpen, onClose, handleSubmit, loader }: any) => {
  const [paymentMethodOptionId, setPaymentMethodOptionId] = useState<number>(0)
  const [datePickerValue, setDatePickerValue] = useState<string>('')
  const [paymentAccountOptionId, setPaymentAccountOptionId] = useState<number>(0)

  const [paymentMethodErr, setPaymentMethodErr] = useState(false)
  const [paymentAccountErr, setPaymentAccountErr] = useState(false)
  const [datePickerValueErr, setDatePickerValueErr] = useState(false)

  const paymentMethod = [
    { label: 'Credit card', value: 1 },
    { label: 'Debit card', value: 2 },
  ]

  const paymentAccount = [
    { label: 'ICICI Bank', value: 1 },
    { label: 'Axis Bank', value: 2 },
    { label: 'Bank of America', value: 3 },
    { label: 'Canara Rebeco', value: 4 },
  ]

  const handleSubmitBtn = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    paymentMethodOptionId <= 0 && setPaymentMethodErr(true)
    paymentAccountOptionId <= 0 && setPaymentAccountErr(true)
    datePickerValue.trim().length <= 0 && setDatePickerValueErr(true)

    if (datePickerValue.trim().length > 0 && paymentMethodOptionId > 0 && paymentAccountOptionId > 0) {
      handleSubmit()
    }
  }

  return (
    <>
      <div>
        <Modal isOpen={onOpen} onClose={onClose} width='30%'>
          <ModalTitle>
            <div className='flex flex-col px-4 py-3'>
              <Typography type='h5' className='!font-bold'>
                AP Payment Detail
              </Typography>
            </div>

            <div
              className='p-3'
              onClick={() => {
                setPaymentMethodErr(false)
                setPaymentAccountErr(false)
                setDatePickerValueErr(false)
                setPaymentMethodOptionId(0)
                setPaymentAccountOptionId(0)
                setDatePickerValue('')
                onClose()
              }}
            >
              <Close variant='medium' />
            </div>
          </ModalTitle>

          <ModalContent className='!z-10'>
            <div className='p-4'>
              <div className='pb-3'>
                <Datepicker
                  validate
                  id={'payment_date'}
                  label='Date'
                  value={datePickerValue}
                  startYear={1900}
                  endYear={2099}
                  hasError={datePickerValueErr}
                  getValue={(value: any) => {
                    setDatePickerValue(value)
                    setDatePickerValueErr(false)
                  }}
                  getError={(err: any) => { }}
                />
              </div>
              <div className='pb-3'>
                <Select
                  id={'payment_method'}
                  label='Payment Method'
                  placeholder={'PaymentMethod'}
                  options={paymentMethod}
                  validate
                  search
                  defaultValue={paymentMethodOptionId}
                  hasError={paymentMethodErr}
                  getValue={(value: any) => {
                    setPaymentMethodOptionId(value)
                    setPaymentMethodErr(false)
                  }}
                  getError={(err: any) => { }}
                />
              </div>
              <div className='pb-3'>
                <Select
                  id={'payment_account'}
                  label='Payment Account'
                  placeholder={'PaymentAccount'}
                  options={paymentAccount}
                  validate
                  search
                  defaultValue={paymentAccountOptionId}
                  hasError={paymentAccountErr}
                  getValue={(value: any) => {
                    setPaymentAccountOptionId(value)
                    setPaymentAccountErr(false)
                  }}
                  getError={(err: any) => { }}
                />
              </div>
            </div>
          </ModalContent>

          <ModalAction className='!z-0 px-1'>
            <Button
              className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold'
              variant={`btn-outline-primary`}
              onClick={() => {
                setPaymentMethodErr(false)
                setPaymentAccountErr(false)
                setDatePickerValueErr(false)
                setPaymentMethodOptionId(0)
                setPaymentAccountOptionId(0)
                setDatePickerValue('')
                onClose()
              }}
            >
              <Typography className='!text-[14px] font-semibold uppercase'>No</Typography>
            </Button>
            <Button
              className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold'
              variant={`btn-primary`}
              onClick={handleSubmitBtn}
            >
              {loader ? (
                <div className={`flex w-full items-center justify-center`}>
                  <div className='animate-spin '>
                    <SpinnerIcon bgColor='#FFF' />
                  </div>
                </div>
              ) : (
                <Typography className='!text-[14px] font-semibold uppercase'>Save</Typography>
              )}
            </Button>
          </ModalAction>
        </Modal>
      </div>
    </>
  )
}

export default PostaspaidModal
