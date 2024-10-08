import agent from '@/api/axios'
import * as TypeOfField from '@/data/fieldMapping'
import ChipInput from 'material-ui-chip-input'
import { Button, Close, Select, Text, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface DrawerProps {
  onOpen: boolean
  onClose: () => void
  field: any
  type: boolean
  process: string
  onSave: (updatedDisplayName: string) => void
  MainFields: any[]
  LineFields: any[]
}

const { fieldTypeOptions, filteredFieldTypeOptions } = TypeOfField
//const
const NONE = 1

const FieldDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, type, field, process, onSave, MainFields, LineFields }) => {
  const [displayNameError, setDisplayNameError] = useState<boolean>(false)
  const [displayNameHasError, setDisplayNameHasError] = useState<boolean>(false)
  const [mappedWith, setMappedWith] = useState<any>([])
  const [mappedWithHasError, setMappedWithHasError] = useState<boolean>(false)
  const [optionsError, setOptionsError] = useState<{ hasErr: boolean; errText: string }>({ hasErr: false, errText: '' })
  const [newField, setNewField] = useState<any>(null)
  const [showOption, setShowOption] = useState<any>([])
  const displayNameRef = useRef<HTMLInputElement>(null)

  const setErrorTrue = () => {
    setDisplayNameError(true)
    setDisplayNameHasError(true)
  }

  const initialData = () => {
    setNewField(null)
    setDisplayNameError(false)
    setDisplayNameHasError(false)
    setMappedWithHasError(false)
  }

  const clearAllData = async () => {
    await setErrorTrue()
    await initialData()
    setOptionsError({ hasErr: false, errText: '' })
    onClose()
  }

  useEffect(() => {
    setNewField(field)
    setShowOption((!!field && !!field.Value ? JSON.parse(field.Value) : []).map((option: any) => option.label))
    if (onOpen && displayNameRef.current) {
      displayNameRef.current.focus()
    }
  }, [onOpen])

  useEffect(() => {
    setNewField(field)
  }, [field])

  //Save Data API
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (optionsError.hasErr && newField?.FieldType === 'radio') {
      setOptionsError({ hasErr: true, errText: 'Options are not valid' })
      return
    }
    if (showOption.length < 2 && newField?.FieldType === 'radio') {
      setOptionsError({ hasErr: true, errText: 'Please add at least two options' })
      return
    }

    const isDuplicateField =
      MainFields.some((field) => field.Label.trim() === newField?.Label.trim() && field.Id !== newField?.Id) ||
      LineFields.some((field) => field.Label.trim() === newField?.Label.trim() && field.Id !== newField?.Id)

    if (isDuplicateField) {
      Toast.error('Field name already exist!')
      return
    }

    if (newField.IsCustom) {
      if (newField.MappedWith === null) {
        setMappedWithHasError(true)
        return
      }
    }

    const areOptionsValid =
      (newField?.FieldType === 'dropdown' || newField?.FieldType === 'radio') && !newField.IsSystemDefined && newField.MappedWith === 1
        ? newField.Value !== null
          ? (!!newField.Value ? JSON.parse(newField.Value) : []).length > 0 &&
          ((newField?.FieldType === 'dropdown' && newField.MappedWith === 1 && (!!newField.Value ? JSON.parse(newField.Value) : []).length <= 50) ||
            (newField?.FieldType === 'radio' &&
              (!!newField.Value ? JSON.parse(newField.Value) : []).length > 2 &&
              (!!newField.Value ? JSON.parse(newField.Value) : []).length < 2))
          : false
        : true

    setOptionsError({ hasErr: !areOptionsValid, errText: '' })

    if (newField?.Label.trim().length > 0 && displayNameHasError && areOptionsValid && !isDuplicateField) {
      const updatedField =
        newField.IsRequiredForAccountPayable && newField.IsRequiredForAccountAdjustment
          ? newField
          : {
            ...newField,
            IsRequiredForAccountPayable: process === '1',
            IsRequiredForAccountAdjustment: process === '2',
          }

      setNewField(updatedField)

      onSave(updatedField)
      clearAllData()
    }
  }

  const getMappedWithOptionsFromAPI = async () => {
    const response = await agent.FieldMapping.getMappedWithOptions({ ProcessType: parseInt(process) })

    try {
      if (response.ResponseStatus === 'Success') {
        setMappedWith(response.ResponseData)
      } else Toast.error('Error', response.Message)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getMappedWithOptionsFromAPI()
    setOptionsError({ hasErr: false, errText: '' })
  }, [])

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 sm:w-2/4 lg:w-2/6 xl:w-2/6 hd:w-[418px] 2xl:w-[418px] 3xl:w-[418px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out`}>
        <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
          <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
            {type ? 'Edit Fields' : 'Add Field'}
          </label>
          <div className='pt-2.5' onClick={clearAllData}>
            <Close variant='medium' />
          </div>
        </div>
        <div className='all-fieds h-full p-5'>
          <div className='mb-5'>
            <Text
              inputRef={displayNameRef}
              id='displayName'
              name='displayName'
              label='Display Name'
              placeholder='Please Enter Display Name'
              hasError={displayNameError}
              value={newField?.Label}
              validate
              getValue={(value: any) => setNewField({ ...newField, Label: value })}
              getError={(e: any) => setDisplayNameHasError(e)}
              maxLength={100}
            />
          </div>

          {!type && (
            <>
              <div className='mb-5'>
                <Select
                  id='mappedWith'
                  label='Mapped With'
                  name='mappedWith'
                  options={
                    !!newField
                      ? newField.Type === 1
                        ? mappedWith
                          .filter((item: any) => item.Type === 1 || item.Type === 0)
                          .map((item: any) => ({ value: item.Id, label: item.Label }))
                        : mappedWith
                          .filter((item: any) => item.Type === 2 || item.Type === 0)
                          .map((item: any) => ({ value: item.Id, label: item.Label }))
                      : []
                  }
                  defaultValue={newField && (!!newField.MappedWith ? newField.MappedWith : '')}
                  validate
                  getValue={(value: any) => {
                    setNewField({
                      ...newField,
                      MappedWith: value,
                      Value: null,
                      FieldType:
                        value === 1
                          ? 'text'
                          : !!mappedWith.filter((item: any) => item.Id === value)[0].FieldType
                            ? mappedWith
                              .filter((item: any) => item.Id === value)[0]
                              .FieldType.split(' ')[0]
                              .toLowerCase()
                            : null,
                    })
                  }}
                  getError={() => { }}
                  hasError={mappedWithHasError}
                />
              </div>
              <div className='mb-5'>
                <Select
                  id='fieldType'
                  label='Field Type'
                  name='fieldType'
                  options={newField?.Type === 2 ? filteredFieldTypeOptions : fieldTypeOptions}
                  defaultValue={newField && newField.FieldType}
                  validate
                  getValue={(value: any) => {
                    setNewField({ ...newField, FieldType: value, Value: null })
                    setShowOption([])
                    setOptionsError({ hasErr: false, errText: '' })
                  }}
                  getError={() => { }}
                  hasError={undefined}
                  disabled={newField && ((newField.MappedWith !== null && newField.MappedWith !== 1) || !newField.MappedWith)}
                />
              </div>
              {(newField?.FieldType === 'dropdown' || newField?.FieldType === 'radio') &&
                (newField.MappedWith === null || newField.MappedWith === 1) && (
                  <div className='mb-5'>
                    <Typography className='w-full text-[14px] text-[#6D6E7A]'>Options</Typography>
                    <span className='text-[16px] text-red-500'> *</span>
                    <ChipInput
                      disabled={newField && ((newField.MappedWith !== null && newField.MappedWith !== 1) || !newField.MappedWith)}
                      onChange={(chips: any) => {
                        const newOptions = chips.map((chip: string, index: number) => ({
                          value: index + 1 + '',
                          label: chip,
                        }))
                        setShowOption(newOptions.map((option: any) => option.label))
                        setNewField({ ...newField, Value: JSON.stringify(newOptions) })
                        setOptionsError({
                          hasErr:
                            chips.length === 0 ||
                            (newField?.FieldType === 'dropdown' && chips.length > 50) ||
                            (newField?.FieldType === 'radio' && chips.length > 2),
                          errText: '',
                        })
                      }}
                      onBeforeAdd={(chip) => {
                        if (!(newField?.FieldType === 'radio' && chip.length <= 20)) {
                          setOptionsError({ hasErr: true, errText: 'Max limit 20 characters' })
                        }
                        if (showOption.length >= 2) {
                          setOptionsError({ hasErr: true, errText: 'Only two options are allowed' })
                        }
                        if (showOption.includes(chip)) {
                          setOptionsError({ hasErr: true, errText: 'Duplicate options are not allowed' })
                        }
                        return (
                          (newField?.FieldType === 'radio' && chip.length <= 20 && showOption.length < 2) ||
                          newField?.FieldType === 'dropdown'
                        )
                      }}
                      className={`fieldMappingOptionDropdown w-full`}
                      error={optionsError.hasErr}
                      helperText={optionsError.hasErr ? optionsError.errText : ''}
                      defaultValue={showOption.length === 0 ? [] : showOption}
                      placeholder={`${showOption.length === 0 ? 'Please enter options' : ''}`}
                    />
                  </div>
                )}
              <div className='mb-5'>
                <Typography className='!text-[14px] !font-semibold tracking-[0.02em] text-darkCharcoal'>Mandatory</Typography>
                <span className='text-[16px] text-red-500'> *</span>
                <span className='ml-1 mt-[10px] flex items-center'>
                  <div className='checkboxRadio mr-[80px]' tabIndex={0}>
                    <input
                      type='checkbox'
                      id='yes'
                      name='mandatory'
                      onChange={() => {
                        setNewField({ ...newField, IsRequired: true })
                      }}
                      checked={newField?.IsRequired}
                      className='cursor-pointer'
                    />
                    <Typography>Yes</Typography>
                  </div>
                  <div className='checkboxRadio' tabIndex={0}>
                    <input
                      type='checkbox'
                      id='no'
                      name='mandatory'
                      onChange={() => {
                        setNewField({ ...newField, IsRequired: false })
                      }}
                      checked={!newField?.IsRequired && true}
                      className='cursor-pointer'
                    />
                    <Typography>No</Typography>
                  </div>
                </span>
              </div>
              <div className='mb-5'>
                <Typography className='!text-[14px] !font-semibold text-darkCharcoal tracking-[0.02em]'>
                  {`Required for ${process === '1' ? 'Account Adjustment ' : 'Account Payable '}`}
                </Typography>
                <span className='text-[16px] text-red-500'> *</span>
                <span className='ml-1 mt-[10px] flex items-center'>
                  <div className='checkboxRadio mr-[80px]'>
                    <input
                      type='checkbox'
                      id='rqdforprocessyes'
                      name='forRequired'
                      onChange={() => {
                        setNewField({ ...newField, IsRequiredForAccountPayable: true, IsRequiredForAccountAdjustment: true })
                      }}
                      checked={
                        (process === '1' && newField?.IsRequiredForAccountAdjustment) ||
                        (process === '2' && newField?.IsRequiredForAccountPayable) ||
                        false
                      }
                      className='cursor-pointer'
                      tabIndex={0}
                    />
                    <Typography>Yes</Typography>
                  </div>
                  <div className='checkboxRadio' tabIndex={0}>
                    <input
                      type='checkbox'
                      id='rqdforprocessyes'
                      name='forRequired'
                      onChange={(e) => {
                        setNewField({
                          ...newField,
                          IsRequiredForAccountPayable: process === '1' && false,
                          IsRequiredForAccountAdjustment: process === '2' && false,
                        })
                      }}
                      checked={
                        process === '1'
                          ? !newField?.IsRequiredForAccountAdjustment && true
                          : process === '2'
                            ? !newField?.IsRequiredForAccountPayable && true
                            : false
                      }
                      className='cursor-pointer'
                    />
                    <Typography>No</Typography>
                  </div>
                </span>
              </div>
            </>
          )}
        </div>

        <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
          <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
            <Button onClick={clearAllData} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
              <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
            </Button>
            <Button
              disabled={optionsError.hasErr}
              type='submit'
              onClick={handleSubmit}
              className={`btn-sm !h-9 rounded-full`}
              variant='btn-primary'>
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                SAVE
              </label>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FieldDrawer
