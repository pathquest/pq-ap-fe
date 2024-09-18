'use client'

import agent from '@/api/axios'
import CustomCheckBox from '@/app/bills/__components/CustomCheckboxField'
import CustomDatePicker from '@/app/bills/__components/CustomDatePickerField'
import CustomSelectField from '@/app/bills/__components/CustomSelectField'
import CustomTextField from '@/app/bills/__components/CustomTextField'
import PDFViewer from '@/app/bills/__components/PDFViewer'
import SplitDrawer from '@/app/bills/__components/SplitDrawer'
import ImageIcon from '@/assets/Icons/ImageIcon'
import AddIcon from '@/assets/Icons/billposting/accountpayable/AddIcon'
import RemoveIcon from '@/assets/Icons/billposting/accountpayable/RemoveIcon'
import EditBillForm from '@/components/Forms/EditBillForm'
import { EditBillPostingDataProps } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { documentDetailById, setIsFormDocuments } from '@/store/features/bills/billSlice'
import { convertStringsDateToUTC } from '@/utils'
import {
  billStatusEditable,
  convertFractionToRoundValue,
  getPDFUrl,
  getRoundValue,
  getUpdatedDataFromDetailsResponse,
  lineItemRemoveArr,
  returnKeyValueObjForFormFields,
  taxTotalAmountCalculate,
  totalAmountCalculate,
  validate,
  verifyAllFieldsValues
} from '@/utils/billposting'
import { format } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { DataTable, Toast, Tooltip } from 'pq-ap-lib'
import { Resizable } from 're-resizable'
import { RefObject, useEffect, useRef, useState } from 'react'
import EditBillsToPayWrapper from './EditBillsToPayWrapper'
import { useSession } from 'next-auth/react'
import { fetchAPIsData } from '@/api/server/common'

const EditBillsToPay = () => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const AccountingTool = session?.user?.AccountingTool
  const { selectedProcessTypeInList, filterFormFields } = useAppSelector((state) => state.bill)
  const processtype = selectedProcessTypeInList

  const [vendorOptions, setVendorOptions] = useState<any>([])
  const [termOptions, setTermOptions] = useState<any>([])
  const [defaultTermOptions, setDefaultTermOptions] = useState<any>([])
  const [accountOptions, setAccountOptions] = useState<any>([])
  const [generateFormFields, setGenerateFormFields] = useState<any>([])
  const [generateFormFieldsErrorObj, setGenerateFormFieldsErrorObj] = useState<any>([])
  const [generateLinetItemFieldsErrorObj, setGenerateLinetItemFieldsErrorObj] = useState<any>([])
  const [lineItemFieldColumns, setLineItemFieldColumns] = useState<any>([])
  const [lineItemsFieldsDataObj, setLineItemsFieldsDataObj] = useState<any>([])

  const [mainFieldListOptions, setMainFieldListOptions] = useState<any>([])
  const [lineItemFieldListOptions, setLineItemFieldListOptions] = useState<any>([])

  const [documentDetailByIdData, setDocumentDetailByIdData] = useState<any>({})

  const [hoveredRow, setHoveredRow] = useState<any>({})

  const [pdfUrl, setPDFUrl] = useState<string>('')
  const [imgUrl, setImgUrl] = useState<string>('')

  const [billLists, setBillLists] = useState<any>([])

  const billStatus = documentDetailByIdData?.Status

  const [formFields, setFormFields] = useState<{ [x: string]: string | number | null }>(generateFormFields)
  const [hasFormFieldErrors, setHasFormFieldErrors] = useState<{ [x: string]: boolean }>(generateFormFieldsErrorObj)
  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<{ [x: string]: boolean }>(generateFormFieldsErrorObj)

  const [lineItemsFieldsData, setLineItemsFieldsData] = useState<EditBillPostingDataProps[] | any>([])
  const [hasLineItemFieldLibraryErrors, setHasLineItemFieldLibraryErrors] = useState<Array<{ [x: string]: boolean }>>([
    generateLinetItemFieldsErrorObj,
  ])
  const [hasLineItemFieldErrors, setHasLineItemFieldErrors] = useState<Array<{ [x: string]: boolean }>>([
    generateLinetItemFieldsErrorObj,
  ])

  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [processSelection, setProcessSelection] = useState<string>('1')
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false)

  const [isSubmitClick, setIsSubmitClick] = useState<boolean>(false)
  const [numberOfPages, setNumberOfPages] = useState<number | null>(null)

  const lineItemDisableFields = ['amount']

  const inputRef: RefObject<HTMLInputElement> = useRef(null)

  const dispatch = useAppDispatch()

  const { id } = useParams()
  const rightBoxRef = useRef<any>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [processCheck, setProcessCheck] = useState<boolean>(false)

  const [fileBlob, setFileBlob] = useState<any>('')

  const [activeBill, setActiveBill] = useState(id)
  const [isNewWindowUpdate, setIsNewWindowUpdate] = useState(false)
  const [boxWidth, setBoxWidth] = useState(0)
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false)

  const [isEndReached, setIsEndReached] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(1)

  const [apiDataCount, setApiDataCount] = useState(0)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [shouldLoadMore, setShouldLoadMore] = useState(true)

  const [isApplyFilter, setIsApplyFilter] = useState<boolean>(false)
  const [isRefreshList, setIsRefreshList] = useState<boolean>(false)

  const [currentWindow, setCurrentWindow] = useState<any>(null)
  const [isHandleResize, setIsHandleResize] = useState<boolean>(false)

  const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)

  const router = useRouter()
  const userId = localStorage.getItem('UserId')

  const lazyRows = 10

  if (lineItemsFieldsData.length === 0 || lineItemsFieldsData === null) {
    setLineItemsFieldsData([
      {
        ...lineItemsFieldsDataObj,
        Index: 1,
      },
    ])
  }

  const getCurrentBillDetails = async (keyValueMainFieldObj: any, keyValueLineItemFieldObj: any) => {
    try {
      const response = await agent.APIs.getDocumentDetails({
        Id: Number(activeBill as string),
        UserId: Number(userId as string),
        ApprovalType: 0,
      })
      // const response: any = await dispatch(
      //   documentDetailById({
      //     Id: Number(activeBill),
      //     ApprovalType: 0,
      //     UserId: Number(userId),
      //   })
      // )
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

        await getPDFUrl(
          responseData?.FilePath,
          responseData?.FileName,
          setPDFUrl,
          setImgUrl,
          setFileBlob,
          setIsPdfLoading,
          isNewWindowUpdate,
          currentWindow,
          openInNewWindow,
          setIsNewWindowUpdate
        )
      }
    } catch (error) {
      Toast.error('Something Went Wrong!')
    }
  }

  useEffect(() => {
    if (activeBill) {
      const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
        mainFieldListOptions,
        lineItemFieldListOptions
      )
      getCurrentBillDetails(keyValueMainFieldObj, keyValueLineItemFieldObj)
    }
  }, [activeBill])

  useEffect(() => {
    const fetchFieldMappingData = async () => {
      setIsLoading(true)
      const {
        vendorOptions,
        termOptions,
        defaultTermOptions,
        accountOptions,
        fieldMappingConfigurations,
        generateFormFields,
        generateFormFieldsErrorObj,
        generateLinetItemFieldsErrorObj,
        lineItemFieldColumns,
        lineItemsFieldsDataObj,
      } = await fetchAPIsData(processtype, AccountingTool as number, 'edit', CompanyId as number)

      setVendorOptions(vendorOptions)
      setTermOptions(termOptions)
      setDefaultTermOptions(defaultTermOptions)
      setAccountOptions(accountOptions)
      setGenerateFormFields(generateFormFields)
      setGenerateFormFieldsErrorObj(generateFormFieldsErrorObj)
      setGenerateLinetItemFieldsErrorObj(generateLinetItemFieldsErrorObj)
      setLineItemFieldColumns(lineItemFieldColumns)
      setLineItemsFieldsDataObj(lineItemsFieldsDataObj)

      const mainFieldConfiguration = [
        ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration?.DefaultList,
        ...fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration?.CustomList,
      ]
      const lineItemConfiguration = [
        ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration?.DefaultList,
        ...fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration?.CustomList,
      ]

      const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
        mainFieldConfiguration,
        lineItemConfiguration
      )

      setMainFieldListOptions(mainFieldConfiguration)
      setLineItemFieldListOptions(lineItemConfiguration)

      if (activeBill) {
        getCurrentBillDetails(keyValueMainFieldObj, keyValueLineItemFieldObj)
      }

      setIsLoading(false)
    }
    if (CompanyId) {
      fetchFieldMappingData()
    }
  }, [CompanyId])

  useEffect(() => {
    if (activeBill) {
      const { keyValueMainFieldObj, keyValueLineItemFieldObj } = returnKeyValueObjForFormFields(
        mainFieldListOptions,
        lineItemFieldListOptions
      )
      getCurrentBillDetails(keyValueMainFieldObj, keyValueLineItemFieldObj)
    }
  }, [activeBill])

  let totalAmount = totalAmountCalculate(lineItemsFieldsData)
  let taxTotalAmount = taxTotalAmountCalculate(lineItemsFieldsData)

  const formattedTotalAmountValue = String(getRoundValue(totalAmount)).slice(0, 13)
  const formattedTotalTaxAmountValue = String(getRoundValue(taxTotalAmount)).slice(0, 13)

  useEffect(() => {
    const updateBoxWidth = () => {
      if (rightBoxRef.current) {
        setBoxWidth(rightBoxRef.current.offsetWidth)
      }
    }

    setTimeout(() => {
      updateBoxWidth()
      window.addEventListener('resize', updateBoxWidth)

      return () => {
        window.removeEventListener('resize', updateBoxWidth)
      }
    }, 2000)
  }, [rightBoxRef, isLeftSidebarCollapsed, isHandleResize])

  useEffect(() => {
    selectedProcessTypeInList && setProcessSelection(selectedProcessTypeInList.toString())
  }, [selectedProcessTypeInList])

  const fetchBillsData = async (pageIndex?: number) => {
    const dateRangeVal = filterFormFields.ft_datepicker.split('to')
    let UserId
    switch (filterFormFields.ft_assignee) {
      case '1':
        UserId = userId
        break
      case '3':
        UserId = '0'
        break
      case '2':
        UserId = filterFormFields.ft_select_users.join(',')
        break
      default:
        UserId = null
        break
    }
    const params = {
      UserId: UserId,
      Status: filterFormFields.ft_status.join(',') ?? null,
      LocationIds:
        filterFormFields.ft_location && filterFormFields.ft_location.length > 0 ? filterFormFields.ft_location.join(',') : null,
      ProcessType: parseInt(selectedProcessTypeInList as string),
      VendorIds:
        filterFormFields.ft_vendor && filterFormFields.ft_vendor.length > 0 ? filterFormFields.ft_vendor.join(',') : null,
      StartDate: convertStringsDateToUTC(dateRangeVal[0].trim()) ?? null,
      EndDate: convertStringsDateToUTC(dateRangeVal[1].trim()) ?? null,
      PageNumber: pageIndex,
      PageSize: lazyRows,
      SortColumn: 'CreatedOn',
      SortOrder: 1,
    }

    try {
      const response = await agent.APIs.documentGetList(params)
      if (response?.ResponseStatus === 'Success') {
        if (processCheck && response?.ResponseData?.List.length !== 0) {
          setProcessCheck(false)

          setCurrentPageIndex(pageIndex ?? 1)

          const responseData = response?.ResponseData
          const newList = responseData?.List || []
          const newTotalCount = responseData?.ListCount || 0

          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLoading(false)
            setShouldLoadMore(true)
          } else {
            updatedData = [...billLists, ...newList]
          }
          setBillLists(updatedData)
          setItemsLoaded(updatedData.length)

          setIsApplyFilter(false)

          setIsRefreshList(false)

          dispatch(setIsFormDocuments(response?.ResponseData?.List[0].IsFromDocuments))

          setActiveBill(response?.ResponseData?.List[0].Id)
          setIsNewWindowUpdate(true)
          return
        }
        if (processCheck && response?.ResponseData?.List.length === 0) {
          setProcessCheck(false)
          let selectedProcess
          switch (parseInt(processSelection)) {
            case 1:
              selectedProcess = 'Accounts Payable'
              break
            case 2:
              selectedProcess = 'Accounts Adjustment'
              break
            case 3:
              selectedProcess = 'Other'
              break
            default:
              break
          }
          Toast.error(`No Record Found in process ${selectedProcess}`)
          router.push(`/payments/billtopay`)
          return
        }

        setCurrentPageIndex(pageIndex ?? 1)

        const responseData = response?.ResponseData
        const newList = responseData?.List || []
        const newTotalCount = responseData?.ListCount || 0

        setApiDataCount(newTotalCount)

        let updatedData = []
        if (pageIndex === 1) {
          updatedData = [...newList]
          setIsLoading(false)
          setShouldLoadMore(true)
        } else {
          updatedData = [...billLists, ...newList]
        }
        setBillLists(updatedData)
        setItemsLoaded(updatedData.length)
        setIsEndReached(false)

        setIsApplyFilter(false)

        setIsRefreshList(false)
      }
    } catch (error) {
      Toast.error('Something Went Wrong!')
    }
  }

  useEffect(() => {
    if (isApplyFilter) {
      fetchBillsData(1)
    }
  }, [isApplyFilter])

  useEffect(() => {
    if (isEndReached && !isLoading && shouldLoadMore && itemsLoaded % lazyRows === 0 && apiDataCount > 0) {
      fetchBillsData(currentPageIndex + 1)
    }
  }, [isEndReached])

  useEffect(() => {
    fetchBillsData(1)
  }, [processSelection, isRefreshList])

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

  let renderedFields: any = {}

  const table_data =
    lineItemsFieldsData &&
    lineItemsFieldsData.map((d: any, index: number) => {
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
                  <div
                    onClick={onLineItemAdd}
                    className={`mr-[8px] ${!billStatusEditable.includes(billStatus) ? 'pointer-events-none' : ''}`}
                    tabIndex={0}
                  >
                    <Tooltip position='left' content='Add' className='z-[4] !p-0 !text-[12px]'>
                      <AddIcon />
                    </Tooltip>
                  </div>
                ) : (
                  <>
                    <span
                      className={`border-r border-gray-500 pr-[26px] ${!billStatusEditable.includes(billStatus) ? 'pointer-events-none' : ''
                        }`}
                    >
                      <div onClick={onLineItemAdd} tabIndex={0}>
                        <Tooltip position='left' content='Add' className='z-[4] !p-0 !text-[12px]'>
                          <AddIcon />
                        </Tooltip>
                      </div>
                    </span>
                    <span
                      className={`pl-[26px] pr-[12px] ${!billStatusEditable.includes(billStatus) ? 'pointer-events-none' : ''}`}
                    >
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

  const onOpenClick = () => {
    setIsOpenDrawer(true)
  }

  const addDays = (date: any, days: any) => {
    if (isNaN(parseInt(days))) {
      date.setDate(date.getDate())
    } else {
      date.setDate(date.getDate() + parseInt(days))
    }
    if (date instanceof Date) {
      return date
    } else {
      return new Date()
    }
  }

  const setFormValues = (key: string, value: string | number) => {
    if (key === 'date') {
      if (formFields.hasOwnProperty('term') && formFields.term) {
        const filterTerm = defaultTermOptions?.find((t: any) => t.RecordNo === formFields.term)
        let formattedDueDateCalculated = ''

        if (value) {
          const dueDateCalculatedValue = addDays(new Date(value), parseInt(filterTerm?.DueDate))
          formattedDueDateCalculated =
            dueDateCalculatedValue && dueDateCalculatedValue instanceof Date ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
        } else {
          const dueDateCalculatedValue = addDays(new Date(), parseInt(filterTerm?.DueDate))
          formattedDueDateCalculated =
            dueDateCalculatedValue && dueDateCalculatedValue instanceof Date ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
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
      const filterTerm = defaultTermOptions && defaultTermOptions?.find((t: any) => t.RecordNo === value)
      let formattedDueDateCalculated = ''

      if (formFields.date) {
        const dueDateCalculatedValue = addDays(new Date(formFields.date), parseInt(filterTerm?.DueDate))
        formattedDueDateCalculated =
          dueDateCalculatedValue && dueDateCalculatedValue instanceof Date ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
      } else {
        const dueDateCalculatedValue = addDays(new Date(), parseInt(filterTerm?.DueDate))
        formattedDueDateCalculated =
          dueDateCalculatedValue && dueDateCalculatedValue instanceof Date ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
      }

      setFormFields({
        ...formFields,
        [key]: value,
        duedate: formattedDueDateCalculated,
      })
      return
    }

    setFormFields({
      ...formFields,
      [key]: value,
    })
  }

  const onSetNumberOfPages = (value: number) => {
    setNumberOfPages(value)
  }

  const handleResize = () => {
    setIsHandleResize((prev) => !prev)
  }

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
    setCurrentWindow(newWindow)
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
    <EditBillsToPayWrapper
      billLists={billLists}
      processSelection={processSelection}
      isOpenFilter={isOpenFilter}
      setIsOpenFilter={setIsOpenFilter}
      formFields={formFields}
      lineItemsFieldsData={lineItemsFieldsData}
      setHasFormFieldErrors={setHasFormFieldErrors}
      hasFormFieldLibraryErrors={hasFormFieldLibraryErrors}
      documentDetailByIdData={documentDetailByIdData}
      activeBill={activeBill}
      rightBoxRef={rightBoxRef}
      setIsSubmitClick={setIsSubmitClick}
      hasLineItemFieldLibraryErrors={hasLineItemFieldLibraryErrors}
      setHasLineItemFieldErrors={setHasLineItemFieldErrors}
      generateLinetItemFieldsErrorObj={generateLinetItemFieldsErrorObj}
      formattedTotalAmountValue={formattedTotalAmountValue}
      formattedTotalTaxAmountValue={formattedTotalTaxAmountValue}
      generateFormFieldsErrorObj={generateFormFieldsErrorObj}
      lineItemDisableFields={lineItemDisableFields}
      setActiveBill={setActiveBill}
      setIsNewWindowUpdate={setIsNewWindowUpdate}
      setIsRefreshList={setIsRefreshList}
      setLineItemsFieldsData={setLineItemsFieldsData}
    >
      <div className='mb-5 border-b border-solid border-[#D8D8D8] md:flex'>
        <Resizable
          className='border-r-2 border-[#888] pr-2'
          minWidth={'20%'}
          maxWidth={'70%'}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResize={handleResize}
          defaultSize={{
            width: '50%',
            height: '100%',
          }}
        >
          <div className='group relative'>
            {!documentDetailByIdData?.FilePath ? (
              <div className='flex h-[100vh] w-full items-center justify-center border-r border-lightSilver'>
                <ImageIcon />
              </div>
            ) : (
              <>
                {imgUrl !== '' ? (
                  <img src={`${imgUrl}`} alt='abc' className='h-[100vh]' />
                ) : (
                  <PDFViewer
                    pdfFile={pdfUrl}
                    onOpen={onOpenClick}
                    heightClass='h-[100vh]'
                    documentDetailByIdData={documentDetailByIdData}
                    billNumber={
                      Array.isArray(activeBill)
                        ? activeBill
                          .map((value) => billLists.find((item: any) => item.Id === parseInt(value))?.BillNumber || '')
                          .join(', ')
                        : billLists.find((value: any) => value.Id === parseInt(activeBill))?.BillNumber || ''
                    }
                    fileName={documentDetailByIdData?.FileName}
                    getNumberOfPages={onSetNumberOfPages}
                    fileBlob={fileBlob}
                    isPdfLoading={isPdfLoading}
                    openInNewWindow={openInNewWindow}
                  />
                )}
              </>
            )}
            <SplitDrawer
              billNumber={documentDetailByIdData?.BillNumber}
              numberOfPages={numberOfPages}
              fileName={documentDetailByIdData?.FileName}
              id={activeBill}
              pdfFile={pdfUrl}
              onOpen={isOpenDrawer}
              onClose={() => setIsOpenDrawer(false)}
              fileBlob={fileBlob}
            />
          </div>
        </Resizable>
        <div className='custom-scroll !z-0 h-[100vh] w-full overflow-auto border-l border-solid border-[#D8D8D8]'>
          <EditBillForm
            selectedProcessTypeInList={selectedProcessTypeInList}
            mainFieldListOptions={mainFieldListOptions}
            formFields={formFields}
            setFormValues={setFormValues}
            hasFormFieldErrors={hasFormFieldErrors}
            setHasFormFieldErrors={setHasFormFieldErrors}
            hasFormFieldLibraryErrors={hasFormFieldLibraryErrors}
            setHasFormFieldLibraryErrors={setHasFormFieldLibraryErrors}
            documentDetailByIdData={documentDetailByIdData}
            vendorOptions={vendorOptions}
            termOptions={termOptions}
            defaultFormFieldErrorObj={generateFormFieldsErrorObj}
          />
        </div>
      </div>

      <div className='custom-scroll !min-h-[253px] overflow-auto' style={{ width: boxWidth }}>
        {table_data && (
          <DataTable
            data={table_data ?? []}
            getExpandableData={() => { }}
            columns={lineItemFieldColumns}
            sticky
            hoverEffect
            userClass='!z-[1] !top-[56px] unset'
            getRowId={(value: any) => {
              setHoveredRow(value)
            }}
            isTableLayoutFixed={true}
            isHeaderTextBreak={true}
          />
        )}
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
    </EditBillsToPayWrapper>
  )
}

export default EditBillsToPay
