'use client'

import { Select } from '@/app/vendors/__components/Selectdropdown/Select'
import { todayDate } from '@/data/billPosting'
import { isDateInFormat } from '@/utils'
import { getPDFUrl } from '@/utils/billposting'
import { format, parse, parseISO } from 'date-fns'
import { CheckBox, Datepicker, Radio, Text, Typography, Uploader } from 'pq-ap-lib'
import React, { useState } from 'react'

const BillsControlFields = ({ formFields }: billsFormFieldsProps) => {
  const [PDFUrlModal, setPDFModalUrl] = useState<any>('')

  const [isNewWindowUpdate, setIsNewWindowUpdate] = useState(false)
  const [currentWindow, setCurrentWindow] = useState<any>(null)

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')

    setTimeout(() => {
      if (newWindow && newWindow.document) {
        newWindow.document.title = fileName
      }
    }, 1000)

    setCurrentWindow(newWindow)

    const intervalId = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(intervalId)
        setCurrentWindow(null)
      }
    }, 500)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    if (currentWindow && !currentWindow.closed) {
      currentWindow.location.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      setTimeout(function () {
        currentWindow.document.title = fileName
      }, 1000)
    } else {
      openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
    }
  }

  return (
    <>
      {formFields &&
        formFields.map((item: BillsFormField, index: number) => {
          return (
            <React.Fragment key={`${item.id}-${index}`}>
              {(() => {
                switch (item.FieldType) {
                  case 'text':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Text
                          label={item.Label}
                          placeholder={item.placeholder}
                          validate={item?.isValidate}
                          noText={item.isText}
                          noNumeric={item.isNumeric}
                          noSpecialChar={item.isSpecialChar}
                          readOnly={item.readOnly}
                          value={item.Value}
                          getValue={(value) => item.getValue(item?.Name, value)}
                          getError={(err) => item.getError(item?.Name, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                          minChar={item.min}
                          maxChar={item.max}
                          maxLength={item.maxLength}
                          disabled={item.isDisabled}
                        />
                      </div>
                    )
                  case 'dropdown':
                    const isPayOrReturn =
                      item.MappedWith === 2 || item.MappedWith === 3 || item.MappedWith === 14 || item.MappedWith === 15
                    const selectedOptions = isPayOrReturn
                      ? item.Options?.map((option) => {
                        return {
                          ...option,
                          value: Number(option.value),
                        }
                      })
                      : item.Options
                    return (
                      <div className={item.classNames ?? ''}>
                        <Select
                          id={item?.id ?? ''}
                          search
                          label={item.Label}
                          options={selectedOptions ?? []}
                          errorClass='!-mt-7'
                          validate={item.isValidate}
                          defaultValue={isPayOrReturn ? Number(item?.Value) : item?.Value ?? 0}
                          getValue={(value: any) => item.getValue(item?.Name, value)}
                          getError={(err: any) => item.getError(item?.Name, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                          disabled={isPayOrReturn ? true : item.isDisabled}
                        />
                      </div>
                    )
                  case 'date':
                    const formatedValue =
                      item?.Value && item?.Value.includes("'")
                        ? format(parseISO(item?.Value.replaceAll("'", '')), 'MM/dd/yyyy')
                        : item?.Value
                    const billDate = formFields.find((item: BillsFormField) => item.Name === 'date')?.Value

                    return (
                      <div className={`${item.hasError ? 'pt-2' : 'pt-[3px]'} ${item.classNames ?? ''}`}>
                        <Datepicker
                          startYear={1900}
                          endYear={2099}
                          isMaxMinRequired={item.Name === 'duedate'}
                          minDate={item.Name === 'duedate' && !!billDate ? new Date(billDate) : undefined}
                          id={item?.id ?? ''}
                          label={item?.Label}
                          validate={item?.isValidate}
                          value={formatedValue}
                          format='MM/DD/YYYY'
                          getValue={(value: any) => {
                            if (value) {
                              const formatedDate =
                                value && isDateInFormat(value, 'MM/dd/yyyy')
                                  ? (item.MappedWith === 4 || item.MappedWith === 16)
                                    ? format(parse(value, 'MM/dd/yyyy', new Date()), "yyyy-MM-dd")
                                    : format(parse(value, 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss")
                                  : todayDate
                              item.getValue(item?.Name, item.Name.includes('Custom') ? `'${formatedDate}'` : value)
                            } else {
                              return
                            }
                          }}
                          getError={(err) => item.getError(item?.Name, err)}
                          hasError={item.hasError}
                          disabled={item.isDisabled}
                        />
                      </div>
                    )
                  case 'checkbox':
                    return (
                      <div className={item.classNames ?? ''}>
                        <CheckBox
                          id={item.Name}
                          onChange={(e) => {
                            item.getValue(item?.Name, e.target.checked)
                          }}
                          getError={(err) => {
                            item.getError(item?.Name, err)
                          }}
                          label={item.Label}
                          className='text-darkCharcoal text-sm font-proxima tracking-[0.02em]'
                          variant='small'
                          required={item.IsRequired}
                          checked={item.IsChecked}
                          disabled={item.isDisabled}
                          hasError={item.hasError}
                        />
                      </div>
                    )
                  case 'radio':
                    return (
                      <div className={item.classNames ?? ''}>
                        <div className='mb-2'>
                          <Typography className='!text-slatyGrey'>{item.Label}</Typography>
                          {item.IsRequired && <span className='text-[16px] text-red-500'> *</span>}
                        </div>
                        <div className='grid w-80'>
                          {item.Options &&
                            item.Options.map((option) => {
                              return (
                                <div key={option.value}>
                                  <Radio
                                    key={option?.label}
                                    id={`${option.value}`}
                                    name={option.value}
                                    className='text-[14px] [&>*]:ml-0'
                                    label={option.label}
                                    value={option.value}
                                    checked={option.value === item.Value}
                                    onChange={(e: any) => item.getValue(item?.Name, e.target.value)}
                                  />
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )
                  case 'file':
                    const isValid =
                      item?.Value &&
                      Array.isArray(item.Value) &&
                      item.Value.length > 0 &&
                      item.Value[0] !== undefined &&
                      'FileName' in item.Value[0]
                    return (
                      <div className={item.classNames ?? ''}>
                        {isValid && (
                          <>
                            <div className='pb-2'>
                              <Typography>Attachments:</Typography>
                            </div>
                            <div className='flex flex-row flex-wrap overflow-x-auto'>
                              {Array.isArray(item?.Value) &&
                                item.Value.length > 0 &&
                                item.Value?.map((file: FileObj) => {
                                  const fileExtension = file.FilePath?.split('.').pop()?.toLowerCase()
                                  return (
                                    <div
                                      key={file.Id}
                                      className={`${!['jpeg', 'png', 'jpg'].includes(fileExtension) && 'hover:cursor-pointer'} mb-2 mr-2 flex items-center gap-2 rounded-[2px] bg-whiteSmoke px-[12px] py-[2.5px] text-[14px] text-darkCharcoal`}
                                      onClick={async () => {
                                        await getPDFUrl(
                                          file.FilePath,
                                          file.FileName,
                                          setPDFModalUrl,
                                          null,
                                          (fileBlob: Blob) => {
                                            openInNewWindow(fileBlob, file.FilePath);
                                          },
                                          () => { },
                                          isNewWindowUpdate,
                                          currentWindow,
                                          openInNewWindow,
                                          setIsNewWindowUpdate
                                        );
                                      }}
                                    >
                                      {file.FileName}
                                    </div>
                                  )
                                })}
                            </div>
                          </>
                        )}
                        <Uploader
                          multiSelect
                          variant='small'
                          type='image'
                          getValue={(value: any) => item.getValue(item?.Name, value)}
                        />
                      </div>
                    )

                  default:
                    return null
                }
              })()}
            </React.Fragment>
          )
        })}
    </>
  )
}

export default BillsControlFields