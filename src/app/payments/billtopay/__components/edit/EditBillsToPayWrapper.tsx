import agent from '@/api/axios'
import PostaspaidModal from '@/app/bills/__components/PostaspaidModal'
import DeleteIcon from '@/assets/Icons/DeleteIcon'
import ActivityIcon from '@/assets/Icons/billposting/ActivityIcon'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import Wrapper from '@/components/Common/Wrapper'
import DeleteWithReason from '@/components/Modals/DeleteWithReason'
import { accountPayableLineItemsObj, accountPayableObj } from '@/data/billPosting'
import { AssignUserOption } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { deleteDocument, getAssigneeList, setIsFormDocuments } from '@/store/features/bills/billSlice'
import {
  billStatusEditable,
  getTimeDifference,
  handleFormFieldErrors,
  prepareAccountPayableParams,
  setLoaderState,
  validate,
  validateAttachments,
  validateTotals,
  verifyAllFieldsValues,
} from '@/utils/billposting'
import { parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, Toast, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface EditBillsToPayWrapperProps {
  children?: React.ReactNode
  billLists?: any
  processSelection?: any
  isOpenFilter?: any
  setIsOpenFilter?: any
  formFields?: any
  lineItemsFieldsData?: any
  setHasFormFieldErrors?: any
  hasFormFieldLibraryErrors?: any
  documentDetailByIdData?: any
  activeBill?: any
  rightBoxRef?: any
  setIsSubmitClick?: any
  hasLineItemFieldLibraryErrors?: any
  setHasLineItemFieldErrors?: any
  generateLinetItemFieldsErrorObj?: any
  formattedTotalAmountValue?: any
  formattedTotalTaxAmountValue?: any
  generateFormFieldsErrorObj?: any
  lineItemDisableFields?: any
  setActiveBill: any
  setIsNewWindowUpdate: any
  setIsRefreshList: any
  setLineItemsFieldsData: any
}

const EditBillsToPayWrapper = ({
  children,
  billLists,
  processSelection,
  isOpenFilter,
  setIsOpenFilter,
  formFields,
  lineItemsFieldsData,
  setHasFormFieldErrors,
  hasFormFieldLibraryErrors,
  documentDetailByIdData,
  activeBill,
  rightBoxRef,
  setIsSubmitClick,
  hasLineItemFieldLibraryErrors,
  setHasLineItemFieldErrors,
  generateLinetItemFieldsErrorObj,
  formattedTotalAmountValue,
  formattedTotalTaxAmountValue,
  generateFormFieldsErrorObj,
  lineItemDisableFields,
  setActiveBill,
  setIsNewWindowUpdate,
  setIsRefreshList,
  setLineItemsFieldsData,
}: EditBillsToPayWrapperProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
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
  const billStatus = documentDetailByIdData?.Status

  useEffect(() => {
    const fetchAssigneData = async () => {
      const params = {
        CompanyId: CompanyId,
      }

      try {
        const { payload, meta } = await dispatch(getAssigneeList(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            const selectAssignee = payload?.ResponseData.map((data: any) => {
              if (parseInt(data.value) === documentDetailByIdData.UserId) {
                return { name: data.label, id: data.value }
              }
            }).filter((value: any) => value !== undefined)

            setSelectedStates(selectAssignee)
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

    if (documentDetailByIdData) {
      fetchAssigneData()
    }
  }, [documentDetailByIdData])

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
    const index = billLists.findIndex((object: any) => {
      return object.Id == activeBill
    })

    let nextBillId: any

    if (billLists.length === 1) {
      router.push(`/payments/billtopay`)
    } else if (billLists.length === index + 1) {
      nextBillId = billLists[0].Id
    } else {
      nextBillId = billLists[index + 1].Id
    }

    const findNextBill = billLists.find((value: any) => (value.Id === nextBillId ? value : null))

    try {
      const response = await agent.APIs.accountPayableSave(params)

      if (response?.ResponseStatus === 'Success') {
        if (!formFields?.attachment) {
          setLoaderState(postSaveAs, loader, setLoader)

          dispatch(setIsFormDocuments(findNextBill.IsFromDocuments))
          setActiveBill(nextBillId)
          setIsNewWindowUpdate(true)
          setIsRefreshList(true)
          setLineItemsFieldsData([])
          showSuccessMessage(postSaveAs)

          window.history.replaceState(null, '', `/payments/billtopay/edit/${nextBillId}`)

          router.push('/payments/billtopay')
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

            if (postSaveAs === 12) {
              setPostaspaidModal(false)
            }

            dispatch(setIsFormDocuments(findNextBill.IsFromDocuments))
            setActiveBill(nextBillId)
            setIsNewWindowUpdate(true)
            setIsRefreshList(true)
            setLineItemsFieldsData([])
            showSuccessMessage(postSaveAs)

            window.history.replaceState(null, '', `/payments/billtopay/edit/${nextBillId}`)
          }
          router.push('/payments/billtopay')
          return
        }

        setLoaderState(postSaveAs, loader, setLoader)
        return
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
        return response
      } catch (error) {
        onErrorLoader(postSaveAs)
        Toast.error('Error while editing the bill.')
        return false
      }
    } else {
      try {
        const response = await saveAccountPayable(accountPayableParams, postSaveAs)
        return response
      } catch (error) {
        onErrorLoader(postSaveAs)
        Toast.error('Error while editing the bill.')
        return false
      }
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
              router.push('/payments/billtopay')
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

  const CreatedOn = documentDetailByIdData?.CreatedOn ? parseISO(documentDetailByIdData?.CreatedOn) : null
  const timeDifference = getTimeDifference(CreatedOn)

  return (
    <Wrapper>
      <div className='relative mx-auto grid-cols-12 md:grid'>
        <div ref={rightBoxRef} className={`col-span-12 h-[calc(100vh_-_65px)] overflow-y-auto`}>
          <div className={`sticky top-0 z-[6] flex w-full flex-row justify-between bg-[#F4F4F4] p-2`}>
            <div className='flex items-center justify-center '>
              <span className='cursor-pointer rounded-full bg-white p-1.5' onClick={() => router.push('/payments/billtopay')}>
                <BackIcon />
              </span>
              {billStatusEditable.includes(billStatus) && (
                <>
                  <span className='pl-[13px] !text-[14px] font-semibold'>TAT :</span>
                  <span className='pl-2 !text-[16px] font-semibold text-[#FB2424]'>{timeDifference.value}</span>
                </>
              )}
            </div>

            <ul className='flex items-center justify-center pr-[20px]'>
              <li className='pl-4' onClick={() => setIsVisibleActivities(true)}>
                <Tooltip position='bottom' content='Activities' className='!font-proxima !text-[14px]'>
                  <ActivityIcon />
                </Tooltip>
              </li>
              {billStatusEditable.includes(billStatus) && (
                <li className='pl-4' onClick={() => setIsVisibleRemoveConfirm(true)}>
                  <Tooltip position='bottom' content='Delete' className='!font-proxima !text-[14px]'>
                    <DeleteIcon />
                  </Tooltip>
                </li>
              )}
            </ul>
          </div>

          {children}

          <div className='custom-bottom-sticky bottom-0 grid place-content-center place-items-center gap-2 !border-t border-[#D8D8D8] px-5 py-[12px] sm:!flex sm:!items-center sm:!justify-end'>
            {selectedProcessTypeInList !== '2' && (
              <Button
                variant={'btn-outline-primary'}
                className='btn-md w-[130px] rounded-full'
                onClick={() => PostasPiad(12)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && PostasPiad(12)}
              >
                <Typography className='!text-[14px] font-semibold uppercase'>Post as paid</Typography>
              </Button>
            )}

            <Button
              variant={'btn-outline-primary'}
              className='btn-md ml-[20px] w-[143px] rounded-full'
              onClick={() => onSubmitBill(2)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSubmitBill(2)}
            >
              <>
                {loader.saveAsDraft ? (
                  <div className={`flex w-full items-center justify-center`}>
                    <div className='animate-spin '>
                      <SpinnerIcon bgColor='#02B89D' />
                    </div>
                  </div>
                ) : (
                  <Typography className='!text-[14px] font-semibold uppercase'>Save as draft</Typography>
                )}
              </>
            </Button>

            <Button
              variant={'btn-primary'}
              className='btn-md ml-[20px] w-[90px] rounded-full'
              onClick={() => onSubmitBill(3)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSubmitBill(3)}
            >
              <>
                {loader.post ? (
                  <div className={`flex w-full items-center justify-center`}>
                    <div className='animate-spin '>
                      <SpinnerIcon bgColor='#FFF' />
                    </div>
                  </div>
                ) : (
                  <Typography className='!text-[14px] font-semibold uppercase'>Post</Typography>
                )}
              </>
            </Button>
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

        <PostaspaidModal
          loader={loader.postAsPaid}
          onOpen={postaspaidModal}
          onClose={() => setPostaspaidModal(false)}
          handleSubmit={() => onSubmitBill(12)}
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

      <DrawerOverlay isOpen={isVisibleActivities} onClose={() => setIsVisibleActivities(false)} />
    </Wrapper>
  )
}

export default EditBillsToPayWrapper
