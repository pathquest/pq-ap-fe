/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React from 'react'
import { BasicTooltip, Typography } from 'pq-ap-lib'
import BillsControlFields from '../Common/BillsControls/page'
import { billStatusEditable } from '@/utils/billposting'
interface EditBillFillProps {
  mainFieldListOptions: BillsFormField[]
  formFields: any
  setFormValues: any
  hasFormFieldLibraryErrors: any
  setHasFormFieldLibraryErrors: any
  hasFormFieldErrors: any
  setHasFormFieldErrors: any
  documentDetailByIdData: any
  vendorOptions: any
  termOptions?: any
  selectedProcessTypeInList: any
  defaultFormFieldErrorObj?: any
}

const EditBillForm = ({
  mainFieldListOptions,
  selectedProcessTypeInList,
  formFields,
  setFormValues,
  hasFormFieldLibraryErrors,
  setHasFormFieldLibraryErrors,
  hasFormFieldErrors,
  setHasFormFieldErrors,
  documentDetailByIdData,
  vendorOptions,
  termOptions,
  defaultFormFieldErrorObj,
}: EditBillFillProps) => {
  const billStatus = documentDetailByIdData?.Status

  const newMainFieldListOptions =
    mainFieldListOptions &&
    mainFieldListOptions?.map((item: any) => {
      let maxLength

      if (item.Name === 'billnumber' && item.FieldType === 'text') {
        maxLength = 20
      } else {
        maxLength = undefined
      }

      const hasError = hasFormFieldErrors[item.Name] && !formFields[item.Name]

      let optionsObj: any = []
      switch (item?.Name) {
        case 'vendor':
          optionsObj = vendorOptions
          break
        case 'term':
          optionsObj = termOptions
          break
        case 'pono':
          optionsObj = []
          break
      }

      if (item?.Value) {
        optionsObj = JSON.parse(item?.Value)
      }

      return {
        ...item,
        Label: selectedProcessTypeInList === '2' && item.Name === 'billnumber' ? 'Adjustment Number' : item.Label,
        isValidate: item?.IsRequired,
        Value: formFields[item?.Name],
        IsChecked: formFields[item?.Name],
        Options: optionsObj ? optionsObj : [],
        getValue: (key: string, value: string) => {
          const fieldMappingFieldType: any = mainFieldListOptions.find((option) => option.Name === key)?.FieldType
          if (!value && (fieldMappingFieldType === 'date')) {
            return
          } else {
            setFormValues(key, value)

            if (key === 'date') {
              if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
                setHasFormFieldErrors({
                  ...hasFormFieldErrors,
                  [key]: false,
                  glpostingdate: false,
                })
              }
              return
            }
            if (key === 'term') {
              if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
                setHasFormFieldErrors({
                  ...hasFormFieldErrors,
                  [key]: false,
                  duedate: false,
                })
              }
              return
            }
            if (key === 'vendor') {
              const payToName: any = mainFieldListOptions.find((option) => option.MappedWith === 2 || option.MappedWith === 14)
                ?.Name
              const returnToName: any = mainFieldListOptions.find((option) => option.MappedWith === 3 || option.MappedWith === 15)
                ?.Name

              if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
                setHasFormFieldErrors({
                  ...hasFormFieldErrors,
                  [key]: false,
                  [payToName]: false,
                  [returnToName]: false,
                })
              }
              return
            }

            if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
              setHasFormFieldErrors({
                ...hasFormFieldErrors,
                [key]: false,
              })
            }
          }
        },
        getError: (key: string, err: boolean) => {
          const fieldMappingFieldType: any = mainFieldListOptions.find((option) => option.Name === key)?.FieldType
          if (!err && (fieldMappingFieldType === 'date')) {
            return
          } else {
            if (key === 'date') {
              if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
                setHasFormFieldLibraryErrors({
                  ...hasFormFieldLibraryErrors,
                  [key]: err,
                  glpostingdate: true,
                })
              }
              return
            }

            if (key === 'term') {
              if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
                setHasFormFieldLibraryErrors({
                  ...hasFormFieldLibraryErrors,
                  [key]: err,
                  duedate: true,
                })
              }
              return
            }

            if (key === 'vendor') {
              const payToName: any = mainFieldListOptions.find((option) => option.MappedWith === 2 || option.MappedWith === 14)
                ?.Name
              const returnToName: any = mainFieldListOptions.find((option) => option.MappedWith === 3 || option.MappedWith === 15)
                ?.Name

              if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
                setHasFormFieldLibraryErrors({
                  ...hasFormFieldLibraryErrors,
                  [key]: err,
                  [payToName]: true,
                  [returnToName]: true,
                })
              }
              return
            }

            if (defaultFormFieldErrorObj.hasOwnProperty(key)) {
              setHasFormFieldLibraryErrors({
                ...hasFormFieldLibraryErrors,
                [key]: err,
              })
            }
          }
        },
        hasError: hasError,
        classNames: `mb-4 laptop:ml-5 fieldWrapper ${(item?.Name === 'date' || item?.Name === 'glpostingdate' || item?.Name === 'duedate' || item?.Name === 'attachment') &&
          !billStatusEditable.includes(billStatus)
          ? 'pointer-events-none'
          : ''
          } ${item?.Name === 'attachment' ? 'col-span-2' : ''}`,
        maxLength: maxLength,
        isDisabled: !billStatusEditable.includes(billStatus) ? true : false,
      }
    })

  if (documentDetailByIdData && Object.keys(documentDetailByIdData).length === 0) {
    return null
  }

  return (
    <div className='py-5 pr-5'>
      <div className='flex pb-7 pl-5 pt-2.5'>
        <BasicTooltip position='right' content='Bill Number' className='!py-0 !pl-0 !pr-1 !font-proxima !text-[14px]'>
          <span className='text-[16px] font-proxima tracking-[0.02em]'>BILL INFO : </span>
          <span className='break-all pl-[18px] text-[16px] font-bold font-proxima tracking-[0.02em]'>{documentDetailByIdData?.BillNumber}</span>
        </BasicTooltip>
      </div>

      <div className='grid laptop:grid-cols-2'>
        <BillsControlFields formFields={newMainFieldListOptions} />
      </div>
    </div>
  )
}

export default EditBillForm
