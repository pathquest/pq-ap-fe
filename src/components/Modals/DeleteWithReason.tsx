import { Button, Close, Modal, ModalAction, ModalContent, ModalTitle, Textarea, Typography } from 'pq-ap-lib'

const DeleteWithReason = ({
  onOpen,
  onClose,
  handleSubmit,
  isTextVisible,
  setVisibleTextValue,
  editedValues,
  setEditedValues,
  setHandleErrorMsg,
}: any) => {
  const handleInputChange = (field: any, newValue: any) => {
    setEditedValues((prevState: any) => ({
      ...prevState,
      [field]: newValue,
    }))
  }

  const isNotEmptyString = (str: string) => {
    return str.trim() !== ''
  }

  return (
    <>
      <div>
        <Modal isOpen={onOpen} onClose={onClose} width='30%'>
          <ModalTitle>
            <div className='flex flex-col px-4 py-3'>
              <Typography type='h5' className='!font-bold'>
                Confirm
              </Typography>
            </div>

            <div
              className='p-3'
              onClick={() => {
                setEditedValues({ reason: '' })
                onClose()
              }}
            >
              <Close variant='medium' />
            </div>
          </ModalTitle>

          <ModalContent>
            <div className='p-4'>
              <div className='mb-3'>Are you sure you want to delete the bill?</div>
              {isTextVisible && (
                <div>
                  <Textarea
                    label='Reason'
                    validate
                    value={editedValues?.reason}
                    getValue={(value) => {
                      handleInputChange('reason', value)
                    }}
                    rows={3}
                    getError={(err: any) => setHandleErrorMsg(err)}
                    minChar={3}
                    maxChar={200}
                  />
                </div>
              )}
            </div>
          </ModalContent>

          <ModalAction className='px-1'>
            <Button
              className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold'
              variant={`btn-outline-primary`}
              onClick={() => {
                setEditedValues({ reason: '' })
                onClose()
              }}
            >
              NO
            </Button>
            {isTextVisible ? (
              <Button
                className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold disabled:opacity-50'
                variant={`btn-primary`}
                disabled={isNotEmptyString(editedValues.reason) ? false : true}
                onClick={() => {
                  setEditedValues({ reason: '' })
                  handleSubmit()
                }}
              >
                YES
              </Button>
            ) : (
              <Button
                className='btn-sm mx-2 my-3 !h-[36px] !w-16 rounded-full font-semibold'
                variant={`btn-primary`}
                onClick={() => {
                  setVisibleTextValue(true)
                  setEditedValues({ reason: '' })
                  handleSubmit()
                }}
              >
                YES
              </Button>
            )}
          </ModalAction>
        </Modal>
      </div>
    </>
  )
}

export default DeleteWithReason
