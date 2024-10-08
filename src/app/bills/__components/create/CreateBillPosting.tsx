'use client'

import { useRouter } from 'next/navigation'
import { RefObject, useEffect, useRef, useState } from 'react'

import { Button, DataTable, Loader, Toast, Tooltip, Typography } from 'pq-ap-lib'

import AddIcon from '@/assets/Icons/billposting/accountpayable/AddIcon'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import RemoveIcon from '@/assets/Icons/billposting/accountpayable/RemoveIcon'

import Wrapper from '@/components/Common/Wrapper'

import agent from '@/api/axios'
import CustomCheckBox from '@/app/bills/__components/CustomCheckboxField'
import CustomDatePicker from '@/app/bills/__components/CustomDatePickerField'
import CustomSelectField from '@/app/bills/__components/CustomSelectField'
import CustomTextField from '@/app/bills/__components/CustomTextField'
import PostaspaidModal from '@/app/bills/__components/PostaspaidModal'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import BillsControlFields from '@/components/Common/BillsControls/page'
import { accountPayableLineItemsObj, accountPayableObj } from '@/data/billPosting'
import { EditBillPostingDataProps } from '@/models/billPosting'
import { useAppSelector } from '@/store/configureStore'
import {
  convertFractionToRoundValue,
  getRoundValue,
  getUpdatedDataFromDetailsResponse,
  handleFormFieldErrors,
  lineItemRemoveArr,
  prepareAccountPayableParams,
  returnKeyValueObjForFormFields,
  setLoaderState,
  taxTotalAmountCalculate,
  totalAmountCalculate,
  validate,
  validateAttachments,
  validateTotals,
  verifyAllFieldsValues,
} from '@/utils/billposting'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { fetchAPIsData } from '@/api/server/common'

const CreateBillPosting = ({
  processtype,
  documentId,
}: any) => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const AccountingTool = session?.user?.AccountingTool

  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [termOptions, setTermOptions] = useState<any>([])
  const [defaultTermOptions, setDefaultTermOptions] = useState<any>([])
  const [accountOptions, setAccountOptions] = useState<any>([])

  const [lineItemFieldColumns, setLineItemFieldColumns] = useState<any>([])
  const [lineItemsFieldsDataObj, setLineItemsFieldsDataObj] = useState<any>([])

  const [mainFieldListOptions, setMainFieldListOptions] = useState<any>([])
  const [lineItemFieldListOptions, setLineItemFieldListOptions] = useState<any>([])

  const [postaspaidModal, setPostaspaidModal] = useState<boolean>(false)

  const [formFields, setFormFields] = useState<{ [x: string]: string | number | null | any }>({})
  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<{ [x: string]: boolean }>({})
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<{ [x: string]: boolean }>({})

  const [lineItemsFieldsData, setLineItemsFieldsData] = useState<EditBillPostingDataProps[] | any>([])

  const [generateLinetItemFieldsErrorObj, setGenerateLinetItemFieldsErrorObj] = useState<any>([])
  const [hasLineItemFieldLibraryErrors, setHasLineItemFieldLibraryErrors] = useState<Array<{ [x: string]: boolean }>>([])
  const [hasLineItemFieldErrors, setHasLineItemFieldErrors] = useState<Array<{ [x: string]: boolean }>>([])

  const lineItemDisableFields = ['amount']

  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [tableDynamicWidth, setTableDynamicWidth] = useState('laptop:w-[calc(100vw-200px)]')

  const [isSubmitClick, setIsSubmitClick] = useState<boolean>(false)
  const [documentDetailByIdData, setDocumentDetailByIdData] = useState<any>({})

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [loader, setLoader] = useState<any>({
    postAsPaid: false,
    saveAsDraft: false,
    post: false,
  })

  const router = useRouter()

  const inputRef: RefObject<HTMLInputElement> = useRef(null)

  const userId = localStorage.getItem('UserId')
  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  let totalAmount = totalAmountCalculate(lineItemsFieldsData)
  let taxTotalAmount = taxTotalAmountCalculate(lineItemsFieldsData)

  const formattedTotalAmountValue = String(getRoundValue(totalAmount)).slice(0, 13)
  const formattedTotalTaxAmountValue = String(getRoundValue(taxTotalAmount)).slice(0, 13)

  useEffect(() => {
    const fetchFieldMappingData = async () => {
      setIsLoading(true)
      const {
        vendorOptions,
        termOptions,
        defaultTermOptions,
        accountOptions,
        processOptions,
        statusOptions,
        userOptions,
        fieldMappingConfigurations,
        generateFormFields,
        generateFormFieldsErrorObj,
        generateLinetItemFieldsErrorObj,
        lineItemFieldColumns,
        lineItemsFieldsDataObj,
      } = await fetchAPIsData(processtype, AccountingTool as number, 'create', CompanyId as number)

      setVendorOptions(
        vendorOptions.map((value: any) => ({
          value: value.value,
          label: `${value.value} - ${value.label}`,
        }))
      );
      setTermOptions(termOptions)
      setDefaultTermOptions(defaultTermOptions)
      setAccountOptions(accountOptions.map((value: any) => ({
        value: value.value,
        label: `${value.value} - ${value.label}`,
      })))

      setFormFields(generateFormFields)
      setHasFormFieldErrors(generateFormFieldsErrorObj)
      setHasFormFieldLibraryErrors(generateFormFieldsErrorObj)

      setGenerateLinetItemFieldsErrorObj(generateLinetItemFieldsErrorObj)
      setHasLineItemFieldErrors([generateLinetItemFieldsErrorObj])
      setHasLineItemFieldLibraryErrors([generateLinetItemFieldsErrorObj])

      setLineItemFieldColumns(lineItemFieldColumns)
      setLineItemsFieldsDataObj(lineItemsFieldsDataObj)

      if (lineItemsFieldsData.length === 0 || lineItemsFieldsData === null) {
        setLineItemsFieldsData([
          {
            ...lineItemsFieldsDataObj,
            Index: 1,
          },
        ])
      }

      const mainFieldConfiguration = [
        ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration?.DefaultList,
        ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration?.CustomList,
      ]
      const lineItemConfiguration = [
        ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration?.DefaultList,
        ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration?.CustomList,
      ]

      setMainFieldListOptions(mainFieldConfiguration)
      setLineItemFieldListOptions(lineItemConfiguration)

      setIsLoading(false)
    }
    if (CompanyId) {
      fetchFieldMappingData()
    }
  }, [CompanyId])

  const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
    mainFieldListOptions,
    lineItemFieldListOptions
  )

  useEffect(() => {
    if (isLeftSidebarCollapsed) {
      setTableDynamicWidth('laptop:w-[calc(100vw-90px)]')
    } else {
      setTableDynamicWidth('laptop:w-[calc(100vw-200px)]')
    }
  }, [isLeftSidebarCollapsed])

  useEffect(() => {
    const getCurrentBillDetails = async () => {
      try {
        const response = await agent.APIs.getDocumentHistoryDetails({
          Id: Number(documentId as string),
        })
        if (response?.ResponseStatus === 'Success') {
          const responseData = response?.ResponseData
          setDocumentDetailByIdData(responseData)

          const { newLineItems, newLineItemsErrorObj, updatedDataObj, updatedDataErrorObj } = getUpdatedDataFromDetailsResponse(
            responseData,
            keyValueMainFieldObj,
            keyValueLineItemFieldObj,
            mainFieldListOptions,
            generateLinetItemFieldsErrorObj
          )

          if (newLineItems.length === 0) {
            setLineItemsFieldsData([
              {
                ...lineItemsFieldsDataObj,
                Index: 1,
              },
            ])
          } else {
            setLineItemsFieldsData(newLineItems)
            setHasLineItemFieldLibraryErrors(newLineItemsErrorObj)
          }
          
          setFormFields(updatedDataObj)
          setHasFormFieldLibraryErrors(updatedDataErrorObj)
        }
      } catch (error) {
        Toast.error('Something Went Wrong!')
      }
    }
    if (documentId) {
      getCurrentBillDetails()
    }
  }, [documentId])

  const onLineItemAdd = () => {
    setIsSubmitClick(true)

    let newLineItemErrorValues: any = []

    lineItemsFieldsData.map((item: any) => {
      const errorsLinetItemValues = verifyAllFieldsValues(item)
      let newLineItemErrorValuesObj: any = {}
      for (const [key, value] of Object.entries(errorsLinetItemValues)) {
        if (generateLinetItemFieldsErrorObj.hasOwnProperty(key)) {
          newLineItemErrorValuesObj = {
            ...newLineItemErrorValuesObj,
            [key]: key === 'Index' ? item.Index : value,
          }
        }
      }
      newLineItemErrorValues.push(newLineItemErrorValuesObj)
    })

    let errorInItems = 0
    hasLineItemFieldLibraryErrors.map((fieldLibraryErrors) => {
      if (!validate(fieldLibraryErrors)) {
        errorInItems++
      } else {
        errorInItems = 0
      }
    })

    setHasLineItemFieldErrors(newLineItemErrorValues)
    if (errorInItems > 0) {
      Toast.error('Please enter required field.')
      return
    } else {
      setIsSubmitClick(false)
      setLineItemsFieldsData([
        ...lineItemsFieldsData,
        {
          Index: lineItemsFieldsData && lineItemsFieldsData[lineItemsFieldsData.length - 1].Index + 1,
          ...lineItemsFieldsDataObj,
        },
      ])
      setHasLineItemFieldErrors([
        ...hasLineItemFieldErrors,
        {
          ...generateLinetItemFieldsErrorObj,
          Index: lineItemsFieldsData && lineItemsFieldsData[lineItemsFieldsData.length - 1].Index + 1,
        },
      ])
      setHasLineItemFieldLibraryErrors([
        ...hasLineItemFieldLibraryErrors,
        {
          ...generateLinetItemFieldsErrorObj,
          Index: lineItemsFieldsData && lineItemsFieldsData[lineItemsFieldsData.length - 1].Index + 1,
        },
      ])
    }
  }

  const onLineItemRemove = async (currentIndex: number, itemId: number) => {
    const dataAfterRemoveItem = lineItemRemoveArr(lineItemsFieldsData, currentIndex)
    const dataAfterRemoveFormFieldErrors = lineItemRemoveArr(hasLineItemFieldErrors, currentIndex)
    const dataAfterRemoveFormFieldLibraryErrors = lineItemRemoveArr(hasLineItemFieldLibraryErrors, currentIndex)

    setLineItemsFieldsData(dataAfterRemoveItem)
    setHasLineItemFieldErrors(dataAfterRemoveFormFieldErrors)
    setHasLineItemFieldLibraryErrors(dataAfterRemoveFormFieldLibraryErrors)

    if (documentId) {
      const params = {
        Id: itemId,
      }

      try {
        const response = await agent.APIs.deleteLineItem(params)
        if (response?.ResponseStatus === 'Success') {
          setLineItemsFieldsData(dataAfterRemoveItem)
          setHasLineItemFieldErrors(dataAfterRemoveFormFieldErrors)
          setHasLineItemFieldLibraryErrors(dataAfterRemoveFormFieldLibraryErrors)
          Toast.success(`Line Item Deleted!`)
        }
      } catch (error) {
        Toast.error(`Something Went Wrong!`)
      }
    }
  }

  const onChangeTableFieldValue = (currentIndex: any, value: any, key: string) => {
    if (key === 'quantity') {
      if (value.includes('.') || value.toString().length > 3 || value < 0 || value > 500 || value === '000' || value === '00') {
        return
      }
    }

    if (key === 'rate') {
      const valueWithoutDecimal = value.toString()
      if (valueWithoutDecimal.length > 10 || value < 0) {
        return
      }
    }

    if (key === 'amount' && value < 0) {
      return
    }

    const fractionColumn = ['rate', 'amount']

    const newArr: EditBillPostingDataProps[] =
      lineItemsFieldsData &&
      lineItemsFieldsData.map((i: any) => {
        if (i.Index === currentIndex) {
          if (i.rate && i.quantity) {
            const calculatedAmount =
              key === 'rate'
                ? parseFloat(value) * parseFloat(i.quantity)
                : key === 'quantity'
                  ? parseFloat(i.rate) * parseFloat(value)
                  : parseFloat(i.amount)
            return {
              ...i,
              [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
              amount: isNaN(parseFloat(`${calculatedAmount}`))
                ? '0'
                : convertFractionToRoundValue(parseFloat(`${calculatedAmount}`)),
            }
          } else {
            const calculatedAmount =
              key === 'rate' && i.quantity
                ? parseFloat(value) * parseFloat(i.quantity)
                : key === 'quantity' && i.rate
                  ? parseFloat(i.rate) * parseFloat(value)
                  : i.rate && i.quantity
                    ? parseFloat(i.rate) * parseFloat(i.quantity)
                    : key === 'amount'
                      ? parseFloat(value)
                      : parseFloat(i.amount)
            return {
              ...i,
              [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
              amount: isNaN(parseFloat(`${calculatedAmount}`)) ? '0' : convertFractionToRoundValue(`${calculatedAmount}`),
            }
          }
        }
        return i
      })

    setLineItemsFieldsData(newArr)
  }

  const renderField = (fieldName: any, d: any, field: any) => {
    const currentRowHasLineItemFieldErrorsObj: any = hasLineItemFieldErrors.find((item) => item.Index === d.Index)

    switch (field.FieldType) {
      case 'text':
        let isDisabled =
          (fieldName === 'amount' &&
            lineItemsFieldsDataObj.hasOwnProperty('rate') &&
            lineItemsFieldsDataObj.hasOwnProperty('quantity') &&
            lineItemDisableFields.includes('amount')) ||
            (fieldName === 'rate' && lineItemDisableFields.includes('rate')) ||
            (fieldName === 'quantity' && lineItemDisableFields.includes('quantity'))
            ? true
            : false

        return (
          <CustomTextField
            key={field?.id ?? ''}
            fieldName={fieldName}
            d={d}
            field={field}
            currentRowHasLineItemFieldErrorsObj={currentRowHasLineItemFieldErrorsObj}
            isDisabled={isDisabled}
            hoveredRow={hoveredRow}
            inputRef={inputRef}
            onChangeTableFieldValue={onChangeTableFieldValue}
            hasLineItemFieldErrors={hasLineItemFieldErrors}
            setHasLineItemFieldErrors={setHasLineItemFieldErrors}
            hasLineItemFieldLibraryErrors={hasLineItemFieldLibraryErrors}
            setHasLineItemFieldLibraryErrors={setHasLineItemFieldLibraryErrors}
            generateLinetItemFieldsErrorObj={generateLinetItemFieldsErrorObj}
          />
        )
      case 'dropdown':
        let optionsObj = []

        const fieldOptionsMap: any = {
          account: accountOptions,
        }

        optionsObj = fieldOptionsMap[field?.Name] || []

        return (
          <CustomSelectField
            key={field?.id ?? ''}
            fieldName={fieldName}
            d={d}
            field={field}
            optionsObj={optionsObj}
            currentRowHasLineItemFieldErrorsObj={currentRowHasLineItemFieldErrorsObj}
            onChangeTableFieldValue={onChangeTableFieldValue}
            hasLineItemFieldErrors={hasLineItemFieldErrors}
            setHasLineItemFieldErrors={setHasLineItemFieldErrors}
            hasLineItemFieldLibraryErrors={hasLineItemFieldLibraryErrors}
            setHasLineItemFieldLibraryErrors={setHasLineItemFieldLibraryErrors}
            generateLinetItemFieldsErrorObj={generateLinetItemFieldsErrorObj}
          />
        )
      case 'checkbox':
        return (
          <CustomCheckBox
            fieldName={fieldName}
            d={d}
            field={field}
            isSubmitClick={isSubmitClick}
            onChangeTableFieldValue={onChangeTableFieldValue}
            hasLineItemFieldLibraryErrors={hasLineItemFieldLibraryErrors}
            generateLinetItemFieldsErrorObj={generateLinetItemFieldsErrorObj}
            setHasLineItemFieldLibraryErrors={setHasLineItemFieldLibraryErrors}
          />
        )
      case 'date':
        return (
          <CustomDatePicker
            fieldName={fieldName}
            d={d}
            field={field}
            onChangeTableFieldValue={onChangeTableFieldValue}
            hasLineItemFieldLibraryErrors={hasLineItemFieldLibraryErrors}
            generateLinetItemFieldsErrorObj={generateLinetItemFieldsErrorObj}
            setHasLineItemFieldLibraryErrors={setHasLineItemFieldLibraryErrors}
            currentRowHasLineItemFieldErrorsObj={currentRowHasLineItemFieldErrorsObj}
          />
        )
      default:
        return null
    }
  }

  const table_data =
    lineItemsFieldsData &&
    lineItemsFieldsData.map((d: any, index: number) => {
      const renderedFields: any = {}
      lineItemFieldListOptions.forEach((field: any) => {
        renderedFields[field.Label] = renderField(field.Name, d, field)
      })
     
      return new Object({
        ...d,
        ...renderedFields,
        actions: (
          <>
            {hoveredRow?.Index === d.Index && (
              <div className={`flex w-full justify-end`}>
                {index === 0 ? (
                  <div onClick={onLineItemAdd} className={`mr-[8px]`} tabIndex={0}>
                    <Tooltip position='left' content='Add' className='z-[4] !p-0 !text-[12px]'>
                      <AddIcon />
                    </Tooltip>
                  </div>
                ) : (
                  <>
                    <span className={`border-r border-gray-500 pr-[26px]`}>
                      <div onClick={onLineItemAdd} tabIndex={0}>
                        <Tooltip position='left' content='Add' className='z-[4] !p-0 !text-[12px]'>
                          <AddIcon />
                        </Tooltip>
                      </div>
                    </span>
                    <span className={`pl-[26px] pr-[12px]`}>
                      <div onClick={() => onLineItemRemove(d.Index, d.Id)} tabIndex={0}>
                        <Tooltip position='left' content='Remove' className='z-[4] !p-0 !text-[12px]'>
                          <RemoveIcon />
                        </Tooltip>
                      </div>
                    </span>
                  </>
                )}
              </div>
            )}
          </>
        ),
      })
    })

  const handleBackPage = () => {
    router.push('/bills')
  }

  const addDays = (date: any, days: any) => {
    date.setDate(date.getDate() + parseInt(days))
    return date ?? ''
  }

  const setFormValues = (key: string, value: any) => {
    if (key === 'date') {
      if (formFields.hasOwnProperty('term') && formFields.term) {
        const filterTerm = defaultTermOptions && defaultTermOptions?.find((t: any) => t.Id === formFields.term)
        let formattedDueDateCalculated = ''

        if (value) {
          const dueDateCalculatedValue = addDays(new Date(value), parseInt(filterTerm?.DueDate))
          formattedDueDateCalculated = dueDateCalculatedValue ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
        } else {
          const dueDateCalculatedValue = addDays(new Date(), parseInt(filterTerm?.DueDate))
          formattedDueDateCalculated = dueDateCalculatedValue ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
        }

        setFormFields({
          ...formFields,
          [key]: value,
          ...(lineItemsFieldsDataObj.hasOwnProperty('glpostingdate') ? { glpostingdate: value } : {}),
          duedate: formattedDueDateCalculated,
        })
      } else {
        setFormFields({
          ...formFields,
          [key]: value,
          ...(lineItemsFieldsDataObj.hasOwnProperty('glpostingdate') ? { glpostingdate: value } : {}),
        })
      }
      return
    }

    if (key === 'term') {
      const filterTerm = defaultTermOptions && defaultTermOptions?.find((t: any) => t.Id === value)
      let dueDateCalculated = ''

      if (formFields.date) {
        dueDateCalculated = addDays(new Date(formFields.date), parseInt(filterTerm.DueDate))
      } else {
        dueDateCalculated = addDays(new Date(), parseInt(filterTerm.DueDate))
      }
      const formattedDueDateCalculated = format(dueDateCalculated, 'MM/dd/yyyy')

      setFormFields({
        ...formFields,
        [key]: value,
        duedate: formattedDueDateCalculated,
      })
      setHasFormFieldLibraryErrors({
        ...hasFormFieldLibraryErrors,
        duedate: true,
      })
      return
    }

    if (key === 'vendor') {
      const payToName = mainFieldListOptions.find((option: any) => option.MappedWith === 2 || option.MappedWith === 14)?.Name
      const returnToName = mainFieldListOptions.find((option: any) => option.MappedWith === 3 || option.MappedWith === 15)?.Name

      setFormFields({
        ...formFields,
        [key]: value,
        [payToName]: value,
        [returnToName]: value,
      })
      setHasFormFieldLibraryErrors({
        ...hasFormFieldLibraryErrors,
        [payToName]: true,
        [returnToName]: true,
      })
      return
    }

    setFormFields({
      ...formFields,
      [key]: value,
    })
  }

  const onErrorLoader = (postSaveAs: number) => {
    let newLoaderError
    switch (postSaveAs) {
      case 12:
        newLoaderError = {
          ...loader,
          postAsPaid: false,
        }
        setLoader(newLoaderError)
        break
      case 2:
        newLoaderError = {
          ...loader,
          saveAsDraft: false,
        }
        setLoader(newLoaderError)
        break
      case 3:
        newLoaderError = {
          ...loader,
          post: false,
        }
        setLoader(newLoaderError)
        break
      default:
        break
    }
  }

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
        Label: processtype === '2' && item.Name === 'billnumber' ? 'Adjustment Number' : item.Label,
        isValidate: item?.IsRequired,
        Value: formFields[item.Name],
        IsChecked: formFields[item.Name],
        Options: optionsObj ? optionsObj : [],
        getValue: (key: string, value: string) => {
          const fieldMappingFieldType: any = mainFieldListOptions.find((option: any) => option.Name === key)?.FieldType
          if (!value && (fieldMappingFieldType === 'date')) {
            return
          } else {
            setFormValues(key, value)

            if (key === 'date') {
              if (hasFormFieldErrors.hasOwnProperty(key)) {
                setHasFormFieldErrors({
                  ...hasFormFieldErrors,
                  [key]: false,
                  glpostingdate: false,
                })
              }
              return
            }
            if (key === 'term') {
              if (hasFormFieldErrors.hasOwnProperty(key)) {
                setHasFormFieldErrors({
                  ...hasFormFieldErrors,
                  [key]: false,
                  duedate: false,
                })
              }
              return
            }
            if (key === 'vendor') {
              const payToName = mainFieldListOptions.find((option: any) => option.MappedWith === 2 || option.MappedWith === 14)?.Name
              const returnToName = mainFieldListOptions.find((option: any) => option.MappedWith === 3 || option.MappedWith === 15)
                ?.Name

              if (hasFormFieldErrors.hasOwnProperty(key)) {
                setHasFormFieldErrors({
                  ...hasFormFieldErrors,
                  [key]: false,
                  [payToName]: false,
                  [returnToName]: false,
                })
              }
              return
            }

            if (hasFormFieldErrors.hasOwnProperty(key)) {
              setHasFormFieldErrors({
                ...hasFormFieldErrors,
                [key]: false,
              })
            }
          }
        },
        getError: (key: string, err: boolean) => {
          const fieldMappingFieldType: any = mainFieldListOptions.find((option: any) => option.Name === key)?.FieldType
          if (!err && (fieldMappingFieldType === 'date')) {
            return
          } else {
            if (key === 'date') {
              if (hasFormFieldErrors.hasOwnProperty(key)) {
                setHasFormFieldLibraryErrors({
                  ...hasFormFieldLibraryErrors,
                  [key]: err,
                  glpostingdate: true,
                })
              }
              return
            }

            if (key === 'term') {
              if (hasFormFieldErrors.hasOwnProperty(key)) {
                setHasFormFieldLibraryErrors({
                  ...hasFormFieldLibraryErrors,
                  [key]: err,
                  duedate: true,
                })
              }
              return
            }

            if (key === 'vendor') {
              const payToName = mainFieldListOptions.find((option: any) => option.MappedWith === 2 || option.MappedWith === 14)?.Name
              const returnToName = mainFieldListOptions.find((option: any) => option.MappedWith === 3 || option.MappedWith === 15)
                ?.Name

              if (hasFormFieldErrors.hasOwnProperty(key)) {
                setHasFormFieldLibraryErrors({
                  ...hasFormFieldLibraryErrors,
                  [key]: err,
                  [payToName]: true,
                  [returnToName]: true,
                })
              }
              return
            }

            if (hasFormFieldErrors.hasOwnProperty(key)) {
              setHasFormFieldLibraryErrors({
                ...hasFormFieldLibraryErrors,
                [key]: err,
              })
            }
          }
        },
        hasError: hasError,
        classNames: `${hasError ? 'mb-3' : 'mb-6'} laptop:mr-5`,
        maxLength: maxLength,
      }
    })

  const saveAccountPayable = async (params: any, postSaveAs: any) => {
    try {
      const response = await agent.APIs.accountPayableSave(params)

      if (response?.ResponseStatus === 'Success') {
        if (!formFields?.attachment) {
          setLoaderState(postSaveAs, loader, setLoader)
          if (postSaveAs === 2) {
            Toast.success('Successfully bill drafted!!')
          } else if (postSaveAs === 12) {
            setPostaspaidModal(false)
            Toast.success('Successfully bill posted!!')
          } else {
            Toast.success('Successfully bill posted!!')
          }
          router.push('/bills')
          return
        }

        let formData: any = new FormData()
        const attachmentFiles = formFields?.attachment || []

        Array.from(attachmentFiles).forEach((file, index) => {
          formData.append(`Files[${index}]`, file)
        })

        formData.append('DocumentId', response?.ResponseData)

        const attachmentResponse = await agent.APIs.uploadAttachment(formData)

        if (attachmentResponse?.ResponseStatus === 'Success') {
          if (attachmentFiles) {
            setLoaderState(postSaveAs, loader, setLoader)
          }
          router.push('/bills')
          return
        }

        setLoaderState(postSaveAs, loader, setLoader)
        return
      } else {
        Toast.error('Error', response?.Message)
        setLoader({
          postAsPaid: false,
          saveAsDraft: false,
          post: false,
        })
      }
    } catch (error) {
      setLoaderState(postSaveAs, loader, setLoader)
    }
  }

  const onCreateBill = async (postSaveAs: number) => {
    setIsSubmitClick(true)
    setLoaderState(postSaveAs, loader, setLoader)

    const accountPayableParams = prepareAccountPayableParams(
      formFields,
      formattedTotalAmountValue,
      formattedTotalTaxAmountValue,
      CompanyId,
      userId,
      processtype,
      accountPayableObj,
      accountPayableLineItemsObj,
      lineItemsFieldsData,
      postSaveAs,
      documentDetailByIdData,
      documentId
    )

    const isValidAttachments = validateAttachments(formFields, onErrorLoader, postSaveAs)

    if (!isValidAttachments) return false

    if (postSaveAs !== 2) {
      const isValidFormFieldErrors = handleFormFieldErrors(
        formFields,
        lineItemsFieldsData,
        lineItemDisableFields,
        hasFormFieldLibraryErrors,
        hasLineItemFieldLibraryErrors,
        generateLinetItemFieldsErrorObj,
        setHasLineItemFieldErrors,
        setHasFormFieldErrors,
        verifyAllFieldsValues,
        validate,
        onErrorLoader,
        postSaveAs
      )

      if (!isValidFormFieldErrors) return false

      if (hasFormFieldErrors.hasOwnProperty('total')) {
        const isValidTotals = validateTotals(
          formFields,
          formattedTotalAmountValue,
          formattedTotalTaxAmountValue,
          onErrorLoader,
          postSaveAs
        )

        if (!isValidTotals) return false
      }

      try {
        const response = await saveAccountPayable(accountPayableParams, postSaveAs)
        return response
      } catch (error) {
        onErrorLoader(postSaveAs)
        Toast.error('Error while creating the bill.')
        return false
      }
    } else {
      try {
        const response = await saveAccountPayable(accountPayableParams, postSaveAs)
        return response
      } catch (error) {
        onErrorLoader(postSaveAs)
        Toast.error('Error while creating the bill.')
        return false
      }
    }
  }

  const PostasPiad = (postaspaid: number) => {
    setIsSubmitClick(true)
    const errorsValues = verifyAllFieldsValues(formFields)

    let newErrorValues: any = {}
    for (const [key, value] of Object.entries(errorsValues)) {
      if (hasFormFieldLibraryErrors.hasOwnProperty(key)) {
        newErrorValues = {
          ...newErrorValues,
          [key]: value,
        }
      }
    }

    let newLineItemErrorValues: any = []

    lineItemsFieldsData.map((item: any) => {
      const errorsLinetItemValues = verifyAllFieldsValues(item)
      let newLineItemErrorValuesObj: any = {}
      for (const [key, value] of Object.entries(errorsLinetItemValues)) {
        if (generateLinetItemFieldsErrorObj.hasOwnProperty(key)) {
          newLineItemErrorValuesObj = {
            ...newLineItemErrorValuesObj,
            [key]: key === 'Index' ? item.Index : value,
          }
        }
      }
      newLineItemErrorValues.push(newLineItemErrorValuesObj)
    })

    let errorInItems = 0
    hasLineItemFieldLibraryErrors.map((fieldLibraryErrors) => {
      if (!validate(fieldLibraryErrors)) {
        errorInItems++
      } else {
        errorInItems = 0
      }
    })

    setHasLineItemFieldErrors(newLineItemErrorValues)
    setHasFormFieldErrors(newErrorValues)

    if (validate(hasFormFieldLibraryErrors)) {
      if (errorInItems > 0) {
        let newLoaderSuccess
        if (postaspaid === 12) {
          newLoaderSuccess = {
            ...loader,
            postAsPaid: false,
          }
        }
        setLoader(newLoaderSuccess)
        Toast.error('Please enter required field.')
        return
      } else {
        setPostaspaidModal(true)
      }
    } else {
      setPostaspaidModal(false)
      Toast.error('Please add required fields.')
      return
    }
  }

  const isDisablePaidButton = loader.saveAsDraft || loader.post
  const isDisableDraftButton =
    Object.values(formFields).every((field) => field === null || field === '') || loader.postAsPaid || loader.post
  const isDisablePostButton = loader.postAsPaid || loader.saveAsDraft

  return (
    <Wrapper masterSettings={false}>
      <div className='sticky top-0 !z-[3] !h-[66px] flex w-full flex-row justify-between bg-lightGray p-5'>
        <div className='flex items-center justify-center'>
          <span
            className='cursor-pointer rounded-full bg-white p-1.5'
            onClick={handleBackPage}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBackPage()}
          >
            <BackIcon />
          </span>
          <span className='pl-5 !text-[14px] font-bold font-proxima tracking-[0.02em] text-darkCharcoal'>
            {processtype === '1' ? 'Account Payable' : 'Account Adjustment'}
          </span>
        </div>
      </div>

      {
        isLoading ? (
          <div className='flex h-[80vh] w-full items-center justify-center'>
            <Loader size='md' helperText />
          </div>
        ) : (
          <>
            <div className='flex flex-col pt-5'>
              <div className='grid grid-cols-4 items-center px-5'>
                <BillsControlFields formFields={newMainFieldListOptions} />
              </div>

              <div className='py-5'>
                <div className={` custom-scroll !min-h-[253px] approvalMain overflow-auto ${tableDynamicWidth}`}>
                  <DataTable
                    getExpandableData={() => { }}
                    columns={lineItemFieldColumns}
                    data={table_data}
                    sticky
                    hoverEffect
                    getRowId={(value: any) => {
                      setHoveredRow(value)
                    }}
                    isTableLayoutFixed={true}
                    userClass='lineItemtable'
                    isHeaderTextBreak={true}
                  />
                </div>

                <div className='justify-end px-5 pb-[77px] pt-[34px]'>
                  <div className='mb-2 flex flex-row justify-end'>
                    <span className='w-[10%] text-sm font-proxima tracking-[0.02em]'>Sub Total</span>
                    <span className='w-[15%] text-end text-sm font-bold font-proxima tracking-[0.02em]'>${Number(formattedTotalAmountValue).toFixed(2)}</span>
                  </div>
                  {AccountingTool === 3 && (
                    <div className='mb-2 flex flex-row justify-end'>
                      <span className='w-[10%] text-sm font-proxima tracking-[0.02em]'>Tax Total</span>
                      <span className='w-[15%] text-end text-sm font-bold font-proxima tracking-[0.02em]'>${Number(formattedTotalTaxAmountValue).toFixed(2)}</span>
                    </div>
                  )}
                  <div className='flex flex-row justify-end'>
                    <span className='w-[10%] text-sm font-proxima tracking-[0.02em]'>Total Amount</span>
                    <span className='w-[15%] text-end text-sm font-bold font-proxima tracking-[0.02em]'>
                      $
                      {formFields?.amountsare === '1'
                        ? Number(convertFractionToRoundValue(parseFloat(formattedTotalAmountValue) + parseFloat(formattedTotalTaxAmountValue))).toFixed(2)
                        : Number(convertFractionToRoundValue(parseFloat(formattedTotalAmountValue))).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='sticky bottom-0 !z-[6] bg-white flex items-center justify-end !border-t border-lightSilver px-5 py-[15px] !h-[66px] gap-5'>
              {processtype !== '2' && (<>
                <Button
                  variant={isDisablePaidButton ? 'btn' : 'btn-outline-primary'}
                  className={`disabled:opacity-50 btn-sm !h-9 rounded-full ${isDisablePaidButton ? "!pointer-events-none !cursor-default" : ""}`}
                  disabled={isDisablePaidButton ? true : false}
                  onClick={() => PostasPiad(12)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && PostasPiad(12)}
                >
                  <label className="font-proxima font-semibold uppercase h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] py-1.5 px-[15px]">Post as paid</label>
                </Button>
              </>)}

              <Button
                className={`btn-sm !h-9 rounded-full ${isDisableDraftButton ? "!pointer-events-none !cursor-default" : ""}`}
                variant={`${isDisableDraftButton ? "btn" : 'btn-outline-primary'}`}
                disabled={isDisableDraftButton}
                onClick={() => onCreateBill(2)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCreateBill(2)}
              >
                {loader.saveAsDraft ? (
                  <div className={`flex w-full items-center justify-center`}>
                    <div className='animate-spin laptop:mx-[60px] laptopMd:mx-[60px] lg:mx-[60px] xl:mx-[60px] hd:mx-[67px] 2xl:mx-[67px] 3xl:mx-[67px]'>
                      <SpinnerIcon bgColor='#02B89D' />
                    </div>
                  </div>
                ) : (
                  <label className="font-proxima font-semibold uppercase h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] py-1.5 px-[15px]">Save as draft</label>)}
              </Button>

              <Button
                variant={isDisablePostButton ? 'btn' : 'btn-primary'}
                className={`disabled:opacity-50 btn-sm !h-9 rounded-full ${isDisablePostButton ? "!pointer-events-none !cursor-default" : "cursor-pointer"}`}
                onClick={() => onCreateBill(3)}
                disabled={isDisablePostButton ? true : false}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCreateBill(3)}
              >
                {loader.post ? (
                  <div className={`flex w-full items-center justify-center`}>
                    <div className='animate-spin laptop:mx-[23px] laptopMd:mx-[23px] lg:mx-[23px] xl:mx-[23px] hd:mx-[26px] 2xl:mx-[26px] 3xl:mx-[26px]'>
                      <SpinnerIcon bgColor='#FFF' />
                    </div>
                  </div>
                ) : (
                  <label className="font-proxima font-semibold uppercase h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] py-1.5 px-[15px]">Post</label>)}
              </Button>
            </div>
          </>
        )
      }

      <PostaspaidModal
        loader={loader.postAsPaid}
        onOpen={postaspaidModal}
        onClose={() => setPostaspaidModal(false)}
        handleSubmit={() => onCreateBill(12)}
      />
    </Wrapper>
  )
}

export default CreateBillPosting
