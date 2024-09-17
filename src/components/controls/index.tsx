'use client'

import React from 'react'
import { CountrySelect, Datepicker, Email, MultiSelect, MultiSelectChip, Password, Select, Text, Textarea } from 'pq-ap-lib'

const ControlFields = ({ formFields, isGrid }: formFieldsProps) => {
  return (
    <div className={isGrid ? 'grid grid-cols-2 gap-x-5 gap-y-2' : ''}>
      {formFields &&
        formFields.map((item: FormField) => {
          return (
            <React.Fragment key={item.id}>
              {(() => {
                switch (item.type) {
                  case 'text':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Text
                          label={item.label}
                          placeholder={item.placeholder}
                          validate={item.isValidate}
                          noText={item.isText}
                          noNumeric={item.isNumeric}
                          noSpecialChar={item.isSpecialChar}
                          readOnly={item.readOnly}
                          value={item.value}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                          minChar={item.min}
                          maxChar={item.max}
                          maxLength={item.max}
                          minLength={item.min}
                        />
                      </div>
                    )
                  case 'tel':
                    return (
                      <div className={item.classNames ?? ''}>
                        <CountrySelect
                          countryCode='1'
                          label={item.label}
                          validate={item.isValidate}
                          value={item.value}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                        />
                      </div>
                    )
                  case 'email':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Email
                          label={item.label}
                          name={item.name}
                          id={item?.id}
                          placeholder={item.placeholder}
                          validate={item.isValidate}
                          value={item.value}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                          minChar={item.min}
                          maxChar={item.max}
                          disabled={item.disable}
                        // autoFocus={true}
                        />
                      </div>
                    )
                  case 'password':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Password
                          label={item.label}
                          name={item.name}
                          novalidate={item.noValidate}
                          direction={item.direction ?? 'top'}
                          validate={item.isValidate}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                          minChar={item.min}
                          maxChar={item.max}
                        // autoFocus={true}
                        />
                      </div>
                    )
                  case 'textarea':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Textarea
                          label={item.label}
                          validate={item.isValidate}
                          value={item.value}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                          maxChar={item.max}
                        />
                      </div>
                    )
                  case 'select':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Select
                          id={item?.id ?? ''}
                          label={item.label}
                          options={item.options ?? []}
                          errorClass='!-mt-4'
                          validate={item.isValidate}
                          defaultValue={item?.defaultValue}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
                          autoComplete={item.autoComplete ? 'on' : 'off'}
                        />
                      </div>
                    )
                  case 'multiselect':
                    return (
                      <div className={item.classNames ?? ''}>
                        <MultiSelect
                          id={item?.id ?? ''}
                          label={item.label}
                          options={item.options ?? []}
                          errorClass='!-mt-4'
                          validate={item.isValidate}
                          defaultValue={item?.defaultValue}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          onSelect={(values) => item?.onSelect && item?.key && item?.onSelect(item?.key, values)}
                          hasError={item.hasError}
                        />
                      </div>
                    )
                  case 'multiselectchip':
                    return (
                      <div className={item.classNames ?? ''}>
                        <MultiSelectChip
                          type={item?.listType}
                          id={item?.id ?? ''}
                          label={item.label}
                          options={item.options ?? []}
                          errorClass='!-mt-4'
                          validate={item.isValidate}
                          defaultValue={item?.defaultValue}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          onSelect={(values) => item?.onSelect && item?.key && item?.onSelect(item?.key, values)}
                          hasError={item.hasError}
                        />
                      </div>
                    )
                  case 'datepicker':
                    return (
                      <div className={item.classNames ?? ''}>
                        <Datepicker
                          startYear={1995}
                          endYear={2050}
                          id={item?.id ?? ''}
                          label={item?.label}
                          validate={item?.isValidate}
                          value={item?.value}
                          getValue={(value) => item.getValue(item?.key, value)}
                          getError={(err) => item.getError(item?.key, err)}
                          hasError={item.hasError}
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
    </div>
  )
}

export default ControlFields
