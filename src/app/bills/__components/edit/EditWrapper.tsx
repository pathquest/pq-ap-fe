import agent from '@/api/axios'
import AssignUser from '@/app/bills/__components/AssignUser'
import BillPostingEditListComponent from '@/app/bills/__components/BillPostingEditListComponent'
import FilterPopover from '@/app/bills/__components/FilterPopover'
import MergeDocDrawer from '@/app/bills/__components/MergeDocDrawer'
import PostaspaidModal from '@/app/bills/__components/PostaspaidModal'
import DeleteIcon from '@/assets/Icons/DeleteIcon'
import ActivityIcon from '@/assets/Icons/billposting/ActivityIcon'
import DownArrowIcon from '@/assets/Icons/billposting/DownArrowIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import MergeIcon from '@/assets/Icons/billposting/MergeIcon'
import TabMoveIcon from '@/assets/Icons/billposting/TabMoveIcon'
import ViewIcon from '@/assets/Icons/billposting/ViewIcon'
import ViewModeIcon from '@/assets/Icons/billposting/ViewModeIcon'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import LeftArrowIcon from '@/assets/Icons/billposting/accountpayable/LeftArrowIcon'
import RightArrowIcon from '@/assets/Icons/billposting/accountpayable/RightArrowIcon'
import ListIcon from '@/assets/Icons/billposting/mode/ListIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import DeleteWithReason from '@/components/Modals/DeleteWithReason'
import { accountPayableLineItemsObj, accountPayableObj, moveToOptions } from '@/data/billPosting'
import { AssignUserOption } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import {
  assignDocumentsToUser,
  deleteDocument,
  getAssigneeList,
  processTypeChangeByDocumentId,
  setFilterFormFields,
  setIsFormDocuments,
  setIsVisibleSidebar,
  setSelectedProcessTypeFromList,
} from '@/store/features/bills/billSlice'
import {
  billStatusEditable,
  getTimeDifference,
  handleFormFieldErrors,
  initialBillPostingFilterFormFields,
  prepareAccountPayableParams,
  setLoaderState,
  validate,
  validateAttachments,
  validateTotals,
  verifyAllFieldsValues,
} from '@/utils/billposting'
import { parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, Loader, Select, Toast, BasicTooltip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface EditWrapperProps {
  module: string | null,
  children?: React.ReactNode
  billLists?: any
  processSelectionOptions?: any
  processSelection?: any
  setProcessSelection?: any
  filterFormFields?: any
  handleApplyFilter?: any
  isOpenFilter?: any
  setIsOpenFilter?: any
  formFields?: any
  lineItemsFieldsData?: any
  setHasFormFieldErrors?: any
  hasFormFieldLibraryErrors?: any
  setHasLineItemFieldErrors?: any
  hasLineItemFieldLibraryErrors?: any
  pdfUrl?: string
  isVisibleLeftSidebar?: any
  documentDetailByIdData?: any
  handleForward?: any
  handleBackword?: any
  selectedBillItems?: any
  setSelectedBillItems?: any
  activeBill?: any
  onChangeSelectedBillItem?: any
  statusOptions?: any
  locationOptions?: any
  userOptions?: any
  vendorOptions?: any
  handleProcessCheck?: any
  rightBoxRef?: any
  setIsSubmitClick?: any
  generateLinetItemFieldsErrorObj?: any
  formattedTotalAmountValue?: any
  formattedTotalTaxAmountValue?: any
  generateFormFieldsErrorObj?: any
  setIsResetFilter?: any
  localFilterFormFields?: any
  setLocalFilterFormFields?: any
  lineItemDisableFields?: any
  billListsRef: any
  handleScroll: any
  isLoading: any
  setActiveBill: any
  setIsNewWindowUpdate: any
  setIsRefreshList: any
  setLineItemsFieldsData: any
}

const EditWrapper = ({
  children,
  module,
  billLists,
  processSelectionOptions,
  processSelection,
  setProcessSelection,
  filterFormFields,
  handleApplyFilter,
  isOpenFilter,
  setIsOpenFilter,
  formFields,
  lineItemsFieldsData,
  setHasFormFieldErrors,
  hasFormFieldLibraryErrors,
  pdfUrl,
  isVisibleLeftSidebar,
  documentDetailByIdData,
  handleProcessCheck,
  handleForward,
  handleBackword,
  selectedBillItems,
  setSelectedBillItems,
  activeBill,
  onChangeSelectedBillItem,
  statusOptions,
  locationOptions,
  userOptions,
  vendorOptions,
  rightBoxRef,
  setIsSubmitClick,
  hasLineItemFieldLibraryErrors,
  setHasLineItemFieldErrors,
  generateLinetItemFieldsErrorObj,
  formattedTotalAmountValue,
  formattedTotalTaxAmountValue,
  generateFormFieldsErrorObj,
  setIsResetFilter,
  localFilterFormFields,
  setLocalFilterFormFields,
  lineItemDisableFields,
  billListsRef,
  handleScroll,
  isLoading,
  setActiveBill,
  setIsNewWindowUpdate,
  setIsRefreshList,
  setLineItemsFieldsData,
}: EditWrapperProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isVisibleMergeDoc, setIsVisibleMergeDoc] = useState<boolean>(false)
  const [isHandleErrorValue, setHandleErrorValue] = useState<boolean>(false)
  const [isOpenViewMode, setIsOpenViewMode] = useState<boolean>(false)
  const [postaspaidModal, setPostaspaidModal] = useState<boolean>(false)
  const [isVisibleTextValue, setVisibleTextValue] = useState<boolean>(false)
  const dropdownFilterRef = useRef<HTMLDivElement>(null)
  const dropdownViewModeRef = useRef<HTMLDivElement>(null)
  const dropdownMoveToRef = useRef<HTMLDivElement>(null)
  const dropdownAssignUserRef = useRef<HTMLDivElement>(null)
  const [isVisibleActivities, setIsVisibleActivities] = useState<boolean>(false)
  const [isVisibleRemoveConfirm, setIsVisibleRemoveConfirm] = useState<boolean>(false)
  const [isOpenMoveToDropDown, setIsOpenMoveToDropDown] = useState<boolean>(false)
  const [isOpenAssignUserDropDown, setIsOpenAssignUserDropDown] = useState<boolean>(false)
  const [isAssigneeModal, setIsAssigneeModal] = useState<boolean>(false)
  const [tempAssignee, setTempAssignee] = useState<any>({})
  const [assignList, setAssigneList] = useState([])
  const [selectedStates, setSelectedStates] = useState<AssignUserOption[]>([])
  const [loader, setLoader] = useState<any>({
    postAsPaid: false,
    saveAsDraft: false,
    post: false,
  })
  const [editedValues, setEditedValues] = useState({
    reason: '',
  })
  const { selectedCompany } = useAppSelector((state) => state.user)
  const CompanyId = Number(selectedCompany?.value)
  const { selectedProcessTypeInList } = useAppSelector((state) => state.bill)
  const userId = localStorage.getItem('UserId')
  const billStatus = documentDetailByIdData?.Status

  const fetchAssigneData = async () => {
    const params = {
      CompanyId: CompanyId,
    }

    try {
      const { payload, meta } = await dispatch(getAssigneeList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const assigneeList = payload?.ResponseData.map((e: any) => {
            return { name: e.label, id: e.value }
          })

          const selectAssignee = payload?.ResponseData.map((data: any) => {
            if (parseInt(data.value) === documentDetailByIdData.UserId) {
              return { name: data.label, id: data.value }
            }
          }).filter((value: any) => value !== undefined)

          setSelectedStates(selectAssignee)

          setAssigneList(assigneeList)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (Object.keys(documentDetailByIdData).length !== 0) {
      fetchAssigneData()
    }
  }, [documentDetailByIdData])

  const onChangeSelectedBillItems = (e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (e.target.checked) {
      setSelectedBillItems([...selectedBillItems, value])
    } else {
      const selectedItemsAfterRemove = selectedBillItems.filter((v: string) => v !== value)
      setSelectedBillItems(selectedItemsAfterRemove)
    }
  }

  const handleFilterIconOpen = () => {
    setIsOpenViewMode(false)

    setLocalFilterFormFields({ ...filterFormFields })

    setIsOpenMoveToDropDown(false)
    setIsOpenFilter(!isOpenFilter)
  }

  const handleMergeIconOpen = (isOpen: boolean) => {
    if (selectedBillItems.length > 1) {
      setIsVisibleMergeDoc(isOpen)
    }
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownFilterRef.current && !dropdownFilterRef.current.contains(event.target as Node)) {
      setIsOpenFilter(false)
    }
    if (dropdownViewModeRef.current && !dropdownViewModeRef.current.contains(event.target as Node)) {
      setIsOpenViewMode(false)
    }
    if (dropdownMoveToRef.current && !dropdownMoveToRef.current.contains(event.target as Node)) {
      setIsOpenMoveToDropDown(false)
    }
    if (dropdownAssignUserRef.current && !dropdownAssignUserRef.current.contains(event.target as Node)) {
      setIsOpenAssignUserDropDown(false)
    }
  }

  useEffect(() => {
    if (isOpenFilter || isOpenViewMode || isOpenMoveToDropDown || isOpenAssignUserDropDown) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenFilter, isOpenViewMode, isOpenMoveToDropDown, isOpenAssignUserDropDown])

  const handleViewMode = () => {
    setIsOpenFilter(false)
    setIsOpenMoveToDropDown(false)
    setIsOpenViewMode(!isOpenViewMode)
    setIsOpenAssignUserDropDown(false)
  }

  const handleSetValue = async (value: AssignUserOption[]) => {
    setTempAssignee(value)
    setIsAssigneeModal(true)
  }

  const handleAssigneeModal = async (value: any) => {
    setSelectedStates(value)

    const params = {
      IdsDataList: [documentDetailByIdData.Id],
      UserId: parseInt(value[0].id as string) as number,
      ProcessType: parseInt(selectedProcessTypeInList as string),
    }

    const index = billLists.findIndex((object: any) => {
      return object.Id == activeBill
    })

    let nextBillId: any

    if (billLists.length === 1) {
      nextBillId = null
    } else if (billLists.length === index + 1) {
      nextBillId = billLists[0].Id
    } else {
      nextBillId = billLists[index + 1].Id
    }
    try {
      const { payload, meta } = await dispatch(assignDocumentsToUser(params))
      const dataMessage = payload?.Message
      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          if (nextBillId !== null) {
            setTempAssignee({})
            setIsAssigneeModal(false)
            const isFormDocument = billLists.filter((value: any) => (value.Id === nextBillId ? value : null))
            dispatch(setIsFormDocuments(isFormDocument[0].IsFromDocuments))
            Toast.success(`Assignee Changed!`)

            setActiveBill(nextBillId)
            setIsNewWindowUpdate(true)

            setIsRefreshList(true)

            window.history.replaceState(null, '', `/bills/edit/${nextBillId}?module=bills`)
            // router.push(`/bills/edit/${nextBillId}`)
          } else {
            Toast.success(`Assignee Changed!`)
            router.push(`/bills`)
            setIsAssigneeModal(false)
          }
        } else {
          setIsAssigneeModal(false)
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        setIsAssigneeModal(false)
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveItem = (value: any) => {
    const selectedItemsAfterRemove = selectedBillItems.filter((v: string) => v !== value.toString())
    setSelectedBillItems(selectedItemsAfterRemove)
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
    hasLineItemFieldLibraryErrors.map((fieldLibraryErrors: any) => {
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
    }
  }

  const showSuccessMessage = (postSaveAs: number) => {
    if (postSaveAs === 2) {
      Toast.success('Bill Drafted!')
    } else if (postSaveAs === 12) {
      setPostaspaidModal(false)
      Toast.success('Bill Posted!')
    } else {
      Toast.success('Bill Posted!')
    }
  }

  const saveAccountPayable = async (params: any, postSaveAs: any) => {
    try {
      let formData: any = new FormData()
      const attachmentFiles = formFields?.attachment || []

      Array.from(attachmentFiles).forEach((file, index) => {
        formData.append(`Files[${index}]`, file)
      })

      formData.append('AccountPayableDetails', JSON.stringify(params));
      const response = await agent.APIs.accountPayableSave(formData)

      if (response?.ResponseStatus === 'Success') {
        // if (!formFields?.attachment) {
        //   setLoaderState(postSaveAs, loader, setLoader)


        //   setIsNewWindowUpdate(true)
        //   setIsRefreshList(true)
        //   setLineItemsFieldsData([])
        //   showSuccessMessage(postSaveAs)

        //   if (billStatus !== 10) {
        //     const index = billLists.length > 0 && billLists.findIndex((object: any) => {
        //       return object.Id == activeBill
        //     })

        //     let nextBillId: any

        //     if (billLists.length === 1) {
        //       router.push(`/bills`)
        //     } else if (billLists.length === index + 1) {
        //       nextBillId = billLists[0].Id
        //     } else {
        //       nextBillId = billLists[index + 1].Id
        //     }

        //     const findNextBill = billLists.length > 0 && nextBillId && billLists.find((value: any) => (value.Id === nextBillId ? value : null))

        //     dispatch(setIsFormDocuments(findNextBill.IsFromDocuments))
        //     setActiveBill(nextBillId)
        //     window.history.replaceState(null, '', `/bills/edit/${nextBillId}?module=bills`)
        //   }
        //   if (billStatus === 10) {
        //     router.push('/bills')
        //   }

        //   setLoader({
        //     postAsPaid: false,
        //     saveAsDraft: false,
        //     post: false,
        //   })
        //   return
        // }

        // let formData: any = new FormData()
        // const attachmentFiles = formFields?.attachment || []

        // Array.from(attachmentFiles).forEach((file, index) => {
        //   formData.append(`Files[${index}]`, file)
        // })

        // formData.append('DocumentId', response?.ResponseData)

        // const attachmentResponse = await agent.APIs.uploadAttachment(formData)

        // if (attachmentResponse?.ResponseStatus === 'Success') {
        //   if (attachmentFiles) {
        //     setLoaderState(postSaveAs, loader, setLoader)

        if (postSaveAs === 12) {
          setPostaspaidModal(false)
        }

        setIsNewWindowUpdate(true)
        setIsRefreshList(true)
        setLineItemsFieldsData([])
        showSuccessMessage(postSaveAs)

        if (billStatus !== 10) {
          const index = billLists.length > 0 && billLists.findIndex((object: any) => {
            return object.Id == activeBill
          })

          let nextBillId: any

          if (billLists.length === 1) {
            router.push(`/bills`)
          } else if (billLists.length === index + 1) {
            nextBillId = billLists[0].Id
          } else {
            nextBillId = billLists[index + 1].Id
          }

          const findNextBill = billLists.length > 0 && nextBillId && billLists.find((value: any) => (value.Id === nextBillId ? value : null))

          dispatch(setIsFormDocuments(findNextBill.IsFromDocuments))
          setActiveBill(nextBillId)
          window.history.replaceState(null, '', `/bills/edit/${nextBillId}?module=bills`)
        }
        if (billStatus === 10) {
          router.push('/bills')
        }

        setLoader({
          postAsPaid: false,
          saveAsDraft: false,
          post: false,
        })
        // }
        // return
        // }

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

  const onSubmitBill = async (postSaveAs: number) => {
    setIsSubmitClick(true)
    setLoaderState(postSaveAs, loader, setLoader)

    const accountPayableParams = prepareAccountPayableParams(
      formFields,
      formattedTotalAmountValue,
      formattedTotalTaxAmountValue,
      CompanyId,
      parseInt(selectedStates[0]?.id),
      processSelection,
      accountPayableObj,
      accountPayableLineItemsObj,
      lineItemsFieldsData,
      postSaveAs,
      documentDetailByIdData,
      documentDetailByIdData?.Id
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

      if (generateFormFieldsErrorObj.hasOwnProperty('total')) {
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
        module == "billsToPay" ? router.push('/payments/billtopay') : "";
        return response
      } catch (error) {
        onErrorLoader(postSaveAs)
        Toast.error('Error while editing the bill.')
        return false
      }
    } else {
      try {
        const response = await saveAccountPayable(accountPayableParams, postSaveAs)
        module == "billsToPay" ? router.push('/payments/billtopay') : "";
        return response
      } catch (error) {
        onErrorLoader(postSaveAs)
        Toast.error('Error while editing the bill.')
        return false
      }
    }
  }

  const onSelectCategory = async (value: number) => {
    setIsOpenMoveToDropDown(false)
    setIsOpenViewMode(false)

    const categoryUpdatePramas = {
      IdsDataList: [documentDetailByIdData.Id],
      CurrentProcessType: parseInt(selectedProcessTypeInList.toString()),
      ProcessType: value,
    }

    try {
      const { payload, meta } = await dispatch(processTypeChangeByDocumentId(categoryUpdatePramas))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          Toast.success('Bill(s) Moved!')
          router.push(`/bills`)
        } else {
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onDeleteDocuments = async () => {
    if (isVisibleTextValue) {
      if (isHandleErrorValue) {
        const params = {
          IdsDataList: [documentDetailByIdData.Id],
          StatusId: 9,
          ActionReason: editedValues?.reason,
        }
        try {
          const { payload, meta } = await dispatch(deleteDocument(params))
          const dataMessage = payload?.Message

          if (meta?.requestStatus === 'fulfilled') {
            if (payload?.ResponseStatus === 'Success') {
              Toast.success('Bill(s) Deleted!')
              router.push('/bills')
            } else {
              Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
            }
          } else {
            Toast.error(`${payload?.status} : ${payload?.statusText}`)
          }
        } catch (error) {
          console.error(error)
        }
      } else {
        setEditedValues({
          reason: editedValues.reason,
        })
      }
    }
  }

  useEffect(() => {
    if (isOpenAssignUserDropDown) {
      setIsOpenMoveToDropDown(false)
      setIsOpenViewMode(false)
    }
  }, [isOpenAssignUserDropDown])

  const modalClose = () => {
    setSelectedStates([])
    setIsAssigneeModal(false)
  }

  const handleCancel = () => {
    setIsOpenFilter(false)
  }

  function haveMultipleStatuses(arrayOfObjects: any) {
    const uniqueStatuses = new Set(
      arrayOfObjects.filter((item: any) => selectedBillItems.includes(String(item.Id))).map((obj: any) => obj.StatusName)
    )
    const hasFile = arrayOfObjects
      .filter((item: any) => selectedBillItems.includes(String(item.Id)))
      .every((item: any) => item.DocumentType === '.pdf')

    return uniqueStatuses.size === 1 && hasFile
  }

  const isEnableMerge = haveMultipleStatuses(billLists)

  const CreatedOn = documentDetailByIdData?.CreatedOn ? parseISO(documentDetailByIdData?.CreatedOn) : null
  const timeDifference = getTimeDifference(CreatedOn)

  const isDisablePaidButton =
    !billStatusEditable.includes(billStatus) || loader.saveAsDraft || loader.post || selectedStates[0]?.id !== userId

  const isDisableDraftButton =
    Object.values(formFields).every((field) => field === null || field === '') ||
    !billStatusEditable.includes(billStatus) ||
    loader.postAsPaid ||
    loader.post ||
    selectedStates[0]?.id !== userId

  const isDisablePostButton =
    !billStatusEditable.includes(billStatus) || loader.postAsPaid || loader.saveAsDraft || selectedStates[0]?.id !== userId

  const onClickMoveToDropdown = () => {
    setIsOpenMoveToDropDown(true)
    setIsOpenFilter(false)
    setIsOpenViewMode(false)
    setIsOpenAssignUserDropDown(false)
  }

  return (
    <Wrapper>
      <div className='relative mx-auto grid-cols-12 md:grid'>
        {isVisibleLeftSidebar && (
          <div
            onScroll={handleScroll}
            className={`relative ${isVisibleLeftSidebar ? 'visible w-full' : 'hidden w-0'
              } tansform relative col-span-3 h-[calc(100vh-130px)] overflow-y-auto border-b border-r border-lightSilver transition-[left] duration-[0.5s] ease-in-out`}
          >
            <div className={`sticky top-0 z-[4] flex items-center border-b border-lightSilver bg-white p-[13px]`}>
              <div className='selectMain w-4/5'>
                <Select
                  id={'process_selection'}
                  options={processSelectionOptions}
                  defaultValue={processSelection}
                  value={processSelection}
                  getValue={(value) => {
                    if (value === '3') {
                      dispatch(
                        setFilterFormFields({
                          ...filterFormFields,
                          ft_assignee: '1',
                        })
                      )
                    }
                    setSelectedBillItems([])
                    dispatch(setSelectedProcessTypeFromList(value))
                    setProcessSelection(value)
                    handleProcessCheck(true)
                  }}
                  getError={() => ''}
                  noborder
                  className='!w-4/5'
                />
              </div>
              <div className='flex w-1/5 justify-end gap-1 pr-1'>
                <div onClick={handleFilterIconOpen}>
                  <BasicTooltip position='bottom' content='Filter' className='!px-0 !pt-1 !pb-1 !font-proxima !text-[14px]'>
                    <FilterIcon />
                  </BasicTooltip>
                </div>
                <div
                  onClick={() => handleMergeIconOpen(true)}
                  className={`${selectedBillItems && selectedBillItems.length > 1 && isEnableMerge && selectedStates[0]?.id === userId
                    ? 'cursor-pointer'
                    : 'pointer-events-none opacity-50'
                    }`}
                >
                  <BasicTooltip position='bottom' content='Merge' className=' !pl-2 !pr-0 !pt-2 !pb-1 !font-proxima !text-[14px]'>
                    <MergeIcon color='#6E6D7A' />
                  </BasicTooltip>
                </div>
              </div>
            </div>

            <div ref={billListsRef}>
              {billLists && billLists.length > 0 ? (
                billLists.map((item: any) => {
                  return (
                    <BillPostingEditListComponent
                      key={`${item.Id}`}
                      {...item}
                      billLists={billLists}
                      isActive={item.Id.toString() == activeBill}
                      selectedBillItems={selectedBillItems}
                      setSelectedBillItems={onChangeSelectedBillItems}
                      setSelectedBillItem={onChangeSelectedBillItem}
                    />
                  )
                })
              ) : (
                <div className='mt-8 flex justify-center font-proxima text-[14px]'>No data found!</div>
              )}
            </div>
            {isLoading && <Loader size='sm' helperText />}
          </div>
        )}

        <div
          ref={rightBoxRef}
          className={`${isVisibleLeftSidebar ? 'col-span-9' : 'col-span-12'} h-[calc(100vh_-_65px)] overflow-y-auto`}
        >
          <div className={`!h-[66px] sticky top-0 z-[5] flex w-full flex-row justify-between bg-lightGray px-5`}>
            <div className='flex items-center justify-center '>
              {!isVisibleLeftSidebar && (
                <span className='cursor-pointer rounded-full bg-white p-1.5' onClick={() => {
                  window.history.back()
                }}>
                  <BackIcon />
                </span>
              )}
              {billStatusEditable.includes(billStatus) && (
                <>
                  {
                    billStatus !== 10 && (
                      <>
                        <span className='pl-[13px] !text-[14px] font-semibold'>TAT :</span>
                        <span className='pl-2 !text-[16px] font-semibold text-[#FB2424]'>{timeDifference.value}</span>
                      </>
                    )
                  }
                </>
              )}
            </div>

            {/* {processSelection !== '4' && ( */}
            <ul className='flex items-center justify-center gap-5'>
              {billStatusEditable.includes(billStatus) && processSelection !== '4' && (
                <li className='h-full flex items-center'>
                  <BasicTooltip position='bottom' content='Assignee' className='!font-proxima !text-[14px] !px-0'>
                    <AssignUser
                      width={52}
                      selectedStates={selectedStates}
                      setSelectedStates={handleSetValue}
                      userData={assignList}
                      dropdownAssignUserRef={dropdownAssignUserRef}
                      isOpenAssignUserDropDown={isOpenAssignUserDropDown}
                      setIsOpenAssignUserDropDown={setIsOpenAssignUserDropDown}
                      right={0}
                    />
                  </BasicTooltip>
                </li>
              )}
              <li className='h-full flex items-center'
                onClick={() => setIsVisibleActivities(true)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && setIsVisibleActivities(true)}
              >
                <BasicTooltip position='bottom' content='Activities' className='!font-proxima !px-0 !text-[14px]'>
                  <ActivityIcon />
                </BasicTooltip>
              </li>
              {billStatusEditable.includes(billStatus) && selectedStates[0]?.id === userId && processSelection !== '4' && (
                <li
                  className='h-full flex items-center'
                  onClick={onClickMoveToDropdown}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter') && onClickMoveToDropdown()}
                >
                  <BasicTooltip position='bottom' content='Move' className='!font-proxima !text-[14px] !px-0'>
                    <div className='flex items-center gap-2'>
                      <TabMoveIcon />
                      <div className={`transition-transform ${isOpenMoveToDropDown ? "duration-400 rotate-180" : "duration-200"}`}>
                        <DownArrowIcon />
                      </div>
                    </div>
                  </BasicTooltip>
                </li>
              )}
              {billStatusEditable.includes(billStatus) && selectedStates[0]?.id === userId && processSelection !== '4' && (
                <li
                  className='h-full flex items-center'
                  onClick={() => setIsVisibleRemoveConfirm(true)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter') && setIsVisibleRemoveConfirm(true)}
                >
                  <BasicTooltip position='bottom' content='Delete' className='!font-proxima !text-[14px] !px-0'>
                    <DeleteIcon />
                  </BasicTooltip>
                </li>
              )}

              {processSelection !== '4' && <li className={`h-full ${module == "billsToPay" ? "hidden" : "flex items-center"}`}
                onClick={handleViewMode}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && handleViewMode()}
              >
                <BasicTooltip position='bottom' content='View' className='!font-proxima !px-0 !text-[14px]'>
                  <ViewIcon />
                </BasicTooltip>
              </li>}
            </ul>
            {/* )} */}

            {isOpenMoveToDropDown && (
              <div
                ref={dropdownMoveToRef}
                className='absolute right-28 top-12 !z-10 flex h-auto flex-col rounded-md bg-white py-2 shadow-lg'
              >
                <div className='flex flex-col items-start justify-start'>
                  {moveToOptions &&
                    moveToOptions
                      .filter((m) => {
                        if (parseInt(processSelection) === 1) {
                          return m.value !== 1
                        } else if (parseInt(processSelection) === 2) {
                          return m.value !== 2
                        } else if (parseInt(processSelection) === 3) {
                          return m.value !== 3
                        } else {
                          return true
                        }
                      })
                      .map((item) => {
                        return (
                          <span
                            className='flex w-full cursor-pointer items-center justify-start px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
                            onClick={() => {
                              onSelectCategory(item.value)
                            }}
                            key={`${item.value}`}
                          >
                            <Typography>{item?.label}</Typography>
                          </span>
                        )
                      })}
                </div>
              </div>
            )}

            {isOpenViewMode && (
              <div
                ref={dropdownViewModeRef}
                className='absolute right-6 top-12 !z-10 flex h-auto flex-col rounded-md bg-white py-2 shadow-lg'
              >
                <div className='flex flex-col items-start justify-start'>
                  <span
                    className='flex w-full cursor-pointer items-center justify-center px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
                    onClick={() => {
                      dispatch(setIsVisibleSidebar(false))
                      router.push(`/bills/view/${activeBill}`)
                    }}
                  >
                    <span className='pr-[10px]'>
                      <ViewModeIcon height={'14'} width={'15'} />
                    </span>
                    <Typography>View Mode</Typography>
                  </span>

                  <span
                    className='flex w-full cursor-pointer items-center justify-center px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
                    onClick={() => router.push(`/bills`)}
                  >
                    <span className='pr-[10px]'>
                      <ListIcon />
                    </span>
                    <Typography>List Mode</Typography>
                  </span>
                </div>
              </div>
            )}
          </div>

          <FilterPopover
            onResetFilter={(value: boolean) => setIsResetFilter(value)}
            activeBill={activeBill}
            isOpenFilter={isOpenFilter}
            onClose={() => setIsOpenFilter(false)}
            filterFormFields={filterFormFields}
            onCancel={handleCancel}
            onApply={handleApplyFilter}
            onReset={() => {
              setIsResetFilter(true)
              // dispatch(setVendorFilterSelected([]))
              // dispatch(setFilterFormFields(initialFilterFormFields))
              setLocalFilterFormFields(initialBillPostingFilterFormFields)
            }}
            processSelection={processSelection}
            statusOptions={statusOptions}
            locationOptions={locationOptions}
            userOptions={userOptions}
            vendorOptions={vendorOptions}
            localFilterFormFields={localFilterFormFields}
            setLocalFilterFormFields={setLocalFilterFormFields}
          />

          {children}

          <div className='custom-bottom-sticky bottom-0 grid place-content-center place-items-center gap-5 !border-t border-lightSilver !h-[66px] px-5 py-[15px] sm:!flex sm:!items-center sm:!justify-end'>
            <span
              className={`${module == "billsToPay" || billStatus === 10 ? "hidden" : "block"} flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-whiteSmoke`}
              onClick={() => handleBackword(activeBill)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBackword(activeBill)}
            >
              <LeftArrowIcon />
            </span>

            {selectedProcessTypeInList !== '2' && module !== "billsToPay" && billStatus !== 10 && (
              <Button
                variant={isDisablePaidButton ? module == "billsToPay" || billStatus === 10 ? 'btn-outline-primary' : 'btn' : 'btn-outline-primary'}
                className={`disabled:opacity-50 btn-sm !h-9 rounded-full`}
                disabled={isDisablePaidButton ? module == "billsToPay" || billStatus === 10 ? false : true : false}
                onClick={() => PostasPiad(12)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && PostasPiad(12)}
              >
                <label className="cursor-pointer font-proxima font-semibold uppercase h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] py-1.5 px-[15px]">Post as paid</label>
              </Button>
            )}

            {(module !== "billsToPay" && billStatus !== 10) && <Button
              variant={`${isDisableDraftButton ? module == "billsToPay" || billStatus === 10 ? 'btn-outline-primary' : 'btn' : 'btn-outline-primary'}`}
              className={`btn-sm !h-9 rounded-full`}
              onClick={() => onSubmitBill(2)}
              disabled={isDisableDraftButton ? module == "billsToPay" || billStatus === 10 ? false : true : false}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSubmitBill(2)}
            >
              <>
                {loader.saveAsDraft ? (
                  <div className={`flex w-full items-center justify-center`}>
                    <div className='animate-spin laptop:mx-[60px] laptopMd:mx-[60px] lg:mx-[60px] xl:mx-[60px] hd:mx-[67px] 2xl:mx-[67px] 3xl:mx-[67px]'>
                      <SpinnerIcon bgColor='#02B89D' />
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer font-proxima font-semibold uppercase h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] py-1.5 px-[15px]">Save as draft</label>
                )}
              </>
            </Button>}

            <Button
              variant={isDisablePostButton ? module == "billsToPay" || billStatus === 10 ? 'btn-primary' : 'btn' : 'btn-primary'}
              className={`disabled:opacity-50 btn-sm !h-9 rounded-full`}
              onClick={() => onSubmitBill(3)}
              disabled={isDisablePostButton ? module == "billsToPay" || billStatus === 10 ? false : true : false}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSubmitBill(3)}
            >
              <>
                {loader.post ? (
                  <div className={`flex w-full items-center justify-center`}>
                    <div className='animate-spin laptop:mx-[23px] laptopMd:mx-[23px] lg:mx-[23px] xl:mx-[23px] hd:mx-[26px] 2xl:mx-[26px] 3xl:mx-[26px]'>
                      <SpinnerIcon bgColor='#FFF' />
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer font-proxima font-semibold uppercase h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] py-1.5 px-[15px]">Post</label>
                )}
              </>
            </Button>

            <span
              className={`${module == "billsToPay" || billStatus === 10 ? "hidden" : "block"} flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-whiteSmoke`}
              onClick={() => handleForward(activeBill)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleForward(activeBill)}
            >
              <RightArrowIcon />
            </span>
          </div>
        </div>

        <ActivityDrawer
          noCommentBox={false}
          isOpen={isVisibleActivities}
          onClose={() => setIsVisibleActivities(false)}
          GUID={documentDetailByIdData?.GUID}
          selectedPayableId={activeBill}
        />
        <DrawerOverlay isOpen={isVisibleActivities} />

        <MergeDocDrawer
          isOpen={isVisibleMergeDoc}
          onClose={handleMergeIconOpen}
          selectedBillItems={selectedBillItems}
          removeItem={(value: any) => handleRemoveItem(value)}
          billLists={billLists}
          pdfUrl={pdfUrl}
        />

        <PostaspaidModal
          loader={loader.postAsPaid}
          onOpen={postaspaidModal}
          onClose={() => setPostaspaidModal(false)}
          handleSubmit={() => onSubmitBill(12)}
        />

        <ConfirmationModal
          title='Assignee'
          content={`Are you sure you want to re-assign this bill to ${tempAssignee[0]?.name} ?`}
          isModalOpen={isAssigneeModal}
          modalClose={modalClose}
          handleSubmit={() => handleAssigneeModal(tempAssignee)}
          colorVariantNo='btn-outline-primary'
          colorVariantYes='btn-primary'
        />

        <DeleteWithReason
          setHandleErrorMsg={(value: any) => setHandleErrorValue(value)}
          isTextVisible={isVisibleTextValue}
          setVisibleTextValue={(value: boolean) => setVisibleTextValue(value)}
          onOpen={isVisibleRemoveConfirm}
          onClose={() => setIsVisibleRemoveConfirm(false)}
          handleSubmit={() => onDeleteDocuments()}
          editedValues={editedValues}
          setEditedValues={setEditedValues}
        />
      </div>

      <DrawerOverlay isOpen={isVisibleMergeDoc} onClose={() => setIsVisibleMergeDoc(false)} />
      <DrawerOverlay isOpen={isVisibleActivities} onClose={() => setIsVisibleActivities(false)} />
    </Wrapper>
  )
}

export default EditWrapper