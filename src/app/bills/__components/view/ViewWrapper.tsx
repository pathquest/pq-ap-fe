import AssignUser from '@/app/bills/__components/AssignUser'
import BillPostingEditListComponent from '@/app/bills/__components/BillPostingEditListComponent'
import FilterPopover from '@/app/bills/__components/FilterPopover'
import MergeDocDrawer from '@/app/bills/__components/MergeDocDrawer'
import PostaspaidModal from '@/app/bills/__components/PostaspaidModal'
import CrossIcon from '@/assets/Icons/CrossIcon'
import DeleteIcon from '@/assets/Icons/DeleteIcon'
import ActivityIcon from '@/assets/Icons/billposting/ActivityIcon'
import CopyIcon from '@/assets/Icons/billposting/CopyIcon'
import DownArrowIcon from '@/assets/Icons/billposting/DownArrowIcon'
import EditModeIcon from '@/assets/Icons/billposting/EditModeIcon'
import FilterIcon from '@/assets/Icons/billposting/FilterIcon'
import MergeIcon from '@/assets/Icons/billposting/MergeIcon'
import TabMoveIcon from '@/assets/Icons/billposting/TabMoveIcon'
import VendorBillHistoryIcon from '@/assets/Icons/billposting/VendorBillHistoryIcon'
import ViewIcon from '@/assets/Icons/billposting/ViewIcon'
import ViewModeIcon from '@/assets/Icons/billposting/ViewModeIcon'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import LeftArrowIcon from '@/assets/Icons/billposting/accountpayable/LeftArrowIcon'
import RightArrowIcon from '@/assets/Icons/billposting/accountpayable/RightArrowIcon'
import ListIcon from '@/assets/Icons/billposting/mode/ListIcon'
import EditIcon from '@/assets/Icons/notification/EditIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { formatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import GlobalSearch from '@/components/Common/GlobalSearch/Icons/GlobalSearch'
import ActivityDrawer from '@/components/Common/Modals/Activitydrawer'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import DeleteWithReason from '@/components/Modals/DeleteWithReason'
import { accountPayableLineItemsObj, accountPayableObj, moveToOptions } from '@/data/billPosting'
import { AssignUserOption } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { accountPayableSave, assignDocumentsToUser, deleteDocument, deleteOverviewDocument, getAssigneeList, getVendorHistoryList, processTypeChangeByDocumentId, setFilterFormFields, setIsFormDocuments, setIsVisibleSidebar, setSelectedProcessTypeFromList } from '@/store/features/bills/billSlice'
import { billStatusEditable, getTimeDifference, initialBillPostingFilterFormFields } from '@/utils/billposting'
import { parseISO } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { BasicTooltip, Button, Loader, Select, Toast, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'

interface ViewWrapperProps {
  children?: React.ReactNode
  billLists?: any
  processSelectionOptions?: any
  processSelection?: any
  setProcessSelection?: any
  filterFormFields?: any
  handleApplyFilter?: any
  isOpenFilter?: any
  setIsOpenFilter?: any
  lineItemsFieldsData?: any
  isVisibleLeftSidebar?: any
  documentDetailByIdData?: any
  handleForward?: any
  handleBackword?: any
  selectedBillItems?: any
  setSelectedBillItems?: any
  activeBill?: any
  onChangeSelectedBillItem?: any
  pdfUrl?: string
  statusSelectionOptions?: any
  locationOptions?: any
  userOptions?: any
  vendorOptions?: any
  handleProcessCheck?: any
  totalAmount?: any
  isMainFieldConfiguration?: any
  setIsResetFilter?: any
  localFilterFormFields?: any
  setLocalFilterFormFields?: any
  billListsRef: any
  handleScroll: any
  isLoading: any
  setIsVisibleLeftSidebar: any
}

const ViewWrapper = ({
  children,
  billLists,
  processSelectionOptions,
  processSelection,
  setProcessSelection,
  filterFormFields,
  isMainFieldConfiguration,
  totalAmount,
  handleApplyFilter,
  isOpenFilter,
  setIsOpenFilter,
  lineItemsFieldsData,
  isVisibleLeftSidebar,
  documentDetailByIdData,
  handleProcessCheck,
  handleForward,
  handleBackword,
  selectedBillItems,
  setSelectedBillItems,
  activeBill,
  onChangeSelectedBillItem,
  pdfUrl,
  statusSelectionOptions,
  locationOptions,
  userOptions,
  vendorOptions,
  setIsResetFilter,
  localFilterFormFields,
  setLocalFilterFormFields,
  billListsRef,
  handleScroll,
  isLoading,
  setIsVisibleLeftSidebar
}: ViewWrapperProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const checkActivityStatus = searchParams.get('activity') ?? false
  const { selectedCompany } = useAppSelector((state) => state.user)
  const CompanyId = selectedCompany?.value

  const [isVisibleMergeDoc, setIsVisibleMergeDoc] = useState<boolean>(false)
  const [isOpenViewMode, setIsOpenViewMode] = useState<boolean>(false)
  const [postaspaidModal, setPostaspaidModal] = useState<boolean>(false)
  const [isVisibleTextValue, setVisibleTextValue] = useState<boolean>(false)
  const [isHandleErrorValue, setHandleErrorValue] = useState<boolean>(false)

  const dropdownFilterRef = useRef<HTMLDivElement>(null)
  const dropdownViewModeRef = useRef<HTMLDivElement>(null)
  const dropdownMoveToRef = useRef<HTMLDivElement>(null)
  const dropdownAssignUserRef = useRef<HTMLDivElement>(null)

  const [selectedStates, setSelectedStates] = useState<AssignUserOption[]>([])
  const [assignList, setAssigneList] = useState([])
  const [isOpenAssignUserDropDown, setIsOpenAssignUserDropDown] = useState<boolean>(false)

  const [isVisibleActivities, setIsVisibleActivities] = useState<boolean>(false)
  const [isAssigneeModal, setIsAssigneeModal] = useState<boolean>(false)
  const [isVisibleRemoveConfirm, setIsVisibleRemoveConfirm] = useState<boolean>(false)
  const [isOpenMoveToDropDown, setIsOpenMoveToDropDown] = useState<boolean>(false)
  const [tempAssignee, setTempAssignee] = useState<any>({})

  const [editedValues, setEditedValues] = useState({
    reason: '',
  })

  const { selectedProcessTypeInList } = useAppSelector((state) => state.bill)
  const userId = localStorage.getItem('UserId')
  const billStatus = documentDetailByIdData?.Status
  const billStatusName = documentDetailByIdData?.StatusName
  const vendorId = documentDetailByIdData.VendorId ?? 0

  const [loader, setLoader] = useState<any>({
    postAsPaid: false,
    saveAsDraft: false,
    post: false,
  })

  const listRef = useRef<any>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isCopyBillModalOpen, setIsCopyBillModalOpen] = useState<boolean>(false)
  const [copyBillId, setCopyBillId] = useState<number>(0)
  const [processType, setProcessType] = useState<string>('')
  const [vendorHistoryList, setVendorHistoryList] = useState<any>([])
  const [isVendorHistoryLoading, setIsVendorHistoryLoading] = useState<boolean>(false)
  const [isVendorBillHistoryListOpen, setIsVendorBillHistoryListOpen] = useState<boolean>(false)

  const module = searchParams.get('module')

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  let nextPageIndex: number = 1
  const lazyRows: number = 10
  const listBottomRef = useRef<HTMLDivElement>(null)
  const [isLazyLoading, setIsLazyLoading] = useState<boolean>(false)

  const fetchAssigneData = async () => {
    const params = {
      CompanyId: parseInt(CompanyId),
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
  }

  useEffect(() => {
    if (isOpenFilter || isOpenViewMode || isOpenMoveToDropDown) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenFilter, isOpenViewMode, isOpenMoveToDropDown])

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

  const onSubmitBill = async (postSaveAs: number) => {
    let newLoader
    switch (postSaveAs) {
      case 12:
        newLoader = {
          ...loader,
          postAsPaid: true,
        }
        break
      case 2:
        newLoader = {
          ...loader,
          saveAsDraft: true,
        }
        break
      case 3:
        newLoader = {
          ...loader,
          post: true,
        }
        break
      default:
        break
    }

    setLoader(newLoader)

    const params = {
      accountPayable: {
        ...accountPayableObj,
        Id: documentDetailByIdData?.Id,
        CompanyId: parseInt(CompanyId) ?? null,
        ProcessType: documentDetailByIdData?.ProcessType ?? null,
        UserId: parseInt(selectedStates[0]?.id) ?? null,
        VendorId: documentDetailByIdData.VendorId ?? null,
        BillNumber: documentDetailByIdData.BillNumber ?? null,
        Description: documentDetailByIdData?.Description ?? null,
        DueDate: documentDetailByIdData?.DueDate ?? null,
        GlPostingDate: documentDetailByIdData?.GlPostingDate ?? null,
        OnHold: documentDetailByIdData?.OnHold ? 1 : 0,
        Amount: totalAmount ?? null,
        Status: postSaveAs ?? null,
        PaidAmount: null,
        DueAmount: totalAmount ?? null,
        LocationId: documentDetailByIdData?.LocationId ?? null,
        BillDate: documentDetailByIdData?.BillDate ?? null,
        TermId: documentDetailByIdData?.TermId ?? null,
        ActionReason: null,
        PONumber: documentDetailByIdData?.PoNumber ?? null,
        Custom1: documentDetailByIdData?.Custom1 ?? null,
        Custom2: documentDetailByIdData?.Custom2 ?? null,
        Custom3: documentDetailByIdData?.Custom3 ?? null,
        Custom4: documentDetailByIdData?.Custom4 ?? null,
        Custom5: documentDetailByIdData?.Custom5 ?? null,
        Custom6: documentDetailByIdData?.Custom6 ?? null,
        Custom7: documentDetailByIdData?.Custom7 ?? null,
        Custom8: documentDetailByIdData?.Custom8 ?? null,
        Custom9: documentDetailByIdData?.Custom9 ?? null,
        Custom10: documentDetailByIdData?.Custom10 ?? null,
        Custom11: documentDetailByIdData?.Custom11 ?? null,
        Custom12: documentDetailByIdData?.Custom12 ?? null,
        Custom13: documentDetailByIdData?.Custom13 ?? null,
        Custom14: documentDetailByIdData?.Custom14 ?? null,
        Custom15: documentDetailByIdData?.Custom15 ?? null,
      },
      accountPayableLineItems:
        lineItemsFieldsData &&
        lineItemsFieldsData.map((item: any) => {
          return {
            ...accountPayableLineItemsObj,
            Id: item.Id ?? 0,
            AccountPayableId: documentDetailByIdData?.Id,
            GLAccountId: item.account ?? null,
            Amount: parseInt(item.amount) ?? null,
            Memo: item.memo ?? null,
            Description: item.description ?? null,
            Item: item.item ?? null,
            ClassId: item.class ?? null,
            Rate: parseInt(item.rate) ?? null,
            Quantity: item.qty ?? null,
            RecordNo: null,
            Tax: item.tax ?? null,
            TaxAmount: parseFloat(item.taxamount) ?? null,
            TaxType: null,
            SalesAmount: item.salesamount ?? null,
            UnitAmount: null,
            DiscountRate: null,
            ProductServiceId: item.product ?? null,
            Custom1: item.Custom1 ?? null,
            Custom2: item.Custom2 ?? null,
            Custom3: item.Custom3 ?? null,
            Custom4: item.Custom4 ?? null,
            Custom5: item.Custom5 ?? null,
            Custom6: item.Custom6 ?? null,
            Custom7: item.Custom7 ?? null,
            Custom8: item.Custom8 ?? null,
            Custom9: item.Custom9 ?? null,
            Custom10: item.Custom10 ?? null,
            Custom11: item.Custom11 ?? null,
            Custom12: item.Custom12 ?? null,
            Custom13: item.Custom13 ?? null,
            Custom14: item.Custom14 ?? null,
            Custom15: item.Custom15 ?? null,
          }
        }),
    }

    const index = billLists.findIndex((object: any) => {
      return object.Id == activeBill
    })

    try {
      let formData: any = new FormData()
      formData.append(`Files[0]`, [])
      formData.append('AccountPayableDetails', JSON.stringify(params));
      const { payload, meta } = await dispatch(accountPayableSave(formData))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          let nextBillId: any

          if (billLists.length === 1) {
            router.push(`/bills`)
          } else if (billLists.length === index + 1) {
            nextBillId = billLists[0].Id
          } else {
            nextBillId = billLists[index + 1].Id
          }

          router.push(`/bills/view/${nextBillId}`)
          if (postSaveAs === 2) {
            Toast.success('Bill Drafted!')
          } else if (postSaveAs === 12) {
            setPostaspaidModal(false)
            Toast.success('Bill Posted!')
          } else {
            Toast.success('Bill Posted!')
          }
          let newLoaderSuccess
          switch (postSaveAs) {
            case 12:
              newLoaderSuccess = {
                ...loader,
                postAsPaid: false,
              }
              break
            case 2:
              newLoaderSuccess = {
                ...loader,
                saveAsDraft: false,
              }
              break
            case 3:
              newLoaderSuccess = {
                ...loader,
                post: false,
              }
              break
            default:
              break
          }

          setLoader(newLoaderSuccess)
        } else {
          setPostaspaidModal(false)
          onErrorLoader(postSaveAs)
          Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`)
        }
      } else {
        setPostaspaidModal(false)
        onErrorLoader(postSaveAs)
        Toast.error(`${payload?.status} : ${payload?.statusText}`)
      }
    } catch (error) {
      setPostaspaidModal(false)
      onErrorLoader(postSaveAs)
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

  const onDeleteOverviewDocuments = async () => {
    if (isVisibleTextValue) {
      if (isHandleErrorValue) {
        const params = {
          AccountPayableId: documentDetailByIdData.Id,
          ActionReason: editedValues?.reason,
        }
        try {
          const { payload, meta } = await dispatch(deleteOverviewDocument(params))
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

  useEffect(() => {
    if (isOpenAssignUserDropDown) {
      setIsOpenMoveToDropDown(false)
      setIsOpenViewMode(false)
    }
  }, [isOpenAssignUserDropDown])

  const handleAssigneeModal = async (value: any) => {
    setSelectedStates(value)

    const params = {
      IdsDataList: [documentDetailByIdData.Id],
      UserId: parseInt(value[0].id, 10),
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
            router.push(`/bills/view/${nextBillId}`)
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

  const modalClose = () => {
    setSelectedStates([])
    setIsAssigneeModal(false)
    setIsCopyBillModalOpen(false)
    setCopyBillId(0)
    setProcessType('')
    setIsVendorBillHistoryListOpen(true)
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

  const checkUserId = billLists.filter((value: any) => value.Id.toString() === activeBill)[0]?.UserId !== 0

  const CreatedOn = documentDetailByIdData?.CreatedOn ? parseISO(documentDetailByIdData?.CreatedOn) : null
  const timeDifference = getTimeDifference(CreatedOn)

  const validateDocumentDetail = (documentDetailByIdData: any) => {
    const fieldNameMap: { [key: string]: string } = {
      vendor: 'VendorName',
      billnumber: 'BillNumber',
      duedate: 'DueDate',
      date: 'BillDate',
    }
    const mandatoryFields = isMainFieldConfiguration
      .filter((field: any) => field.IsRequired)
      .map((field: any) => fieldNameMap[field.Name] || field.Name)

    const areMandatoryFieldsPresent = mandatoryFields.every(
      (field: any) => documentDetailByIdData[field] !== null && documentDetailByIdData[field] !== ''
    )

    // Check if line items are not blank
    if (billStatus !== 2) {
      const lineItemsFieldsData = documentDetailByIdData.lineItemsFieldsData || []
      const areLineItemsNotBlank = lineItemsFieldsData.length > 0

      return areMandatoryFieldsPresent && areLineItemsNotBlank
    } else {
      return areMandatoryFieldsPresent
    }
  }

  const onClickMoveToDropdown = () => {
    setIsOpenMoveToDropDown(true)
    setIsOpenFilter(false)
    setIsOpenViewMode(false)
    setIsOpenAssignUserDropDown(false)
  }

  const isDisablePaidButton =
    !billStatusEditable.includes(billStatus) ||
    loader.saveAsDraft ||
    loader.post ||
    documentDetailByIdData?.OnHold ||
    selectedStates[0]?.id !== userId ||
    !validateDocumentDetail(documentDetailByIdData)

  const isDisableDraftButton =
    billStatus === 2 ||
    !billStatusEditable.includes(billStatus) ||
    loader.postAsPaid ||
    loader.post ||
    selectedStates[0]?.id !== userId ||
    !validateDocumentDetail(documentDetailByIdData)

  const isDisablePostButton =
    !billStatusEditable.includes(billStatus) ||
    loader.postAsPaid ||
    loader.saveAsDraft ||
    selectedStates[0]?.id !== userId ||
    !validateDocumentDetail(documentDetailByIdData)


  useEffect(() => {
    if (checkActivityStatus) {
      setIsVisibleActivities(true)
      setIsVisibleLeftSidebar(false)
    }
  }, [checkActivityStatus])


  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (listRef.current && !listRef.current?.contains(event.target as Node)) {
        setIsVendorBillHistoryListOpen(false)
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isVendorBillHistoryListOpen])

  const onChangeSearchField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleCopyBillDetails = async (id: any) => {
    setIsCopyBillModalOpen(false)
    router.push(`/bills/edit/${activeBill}?module=bills`)
    localStorage.setItem('CopyBillViewId', id)
  }

  const handleCopyBillClick = (value: any) => {
    setCopyBillId(value)
    setIsCopyBillModalOpen(true)
  }

  const getVendorHistoryBillList = (searchValues: any) => {
    setIsVendorHistoryLoading(true)
    setVendorHistoryList([])
    const params = {
      VendorId: vendorId ?? 0,
      // VendorId: 14260,
      SearchKeyword: searchValues,
      ProcessType: 1,
      PageNumber: 1,
      PageSize: 100
    }
    performApiAction(dispatch, getVendorHistoryList, params, (responseData: any) => {
      setVendorHistoryList(responseData.List)
      setIsVendorHistoryLoading(false)
    }, () => {
      setIsVendorHistoryLoading(false)
    })
  }

  useEffect(() => {
    getVendorHistoryBillList(null)
  }, [documentDetailByIdData])

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      if (searchValue && searchValue.trim() !== "") {
        getVendorHistoryBillList(searchValue)
      }
    }
  }

  const handleRemoveClick = () => {
    setSearchValue('')
    searchValue != "" && getVendorHistoryBillList(null)
  }

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLazyLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getVendorHistoryBillList(null)
        }
      },
      { threshold: 0 }
    )

    if (listBottomRef.current) {
      observer.observe(listBottomRef.current)
      nextPageIndex = Math.ceil(itemsLoaded / lazyRows) + 1
    }

    return () => {
      observer.disconnect()
    }
  }, [shouldLoadMore, itemsLoaded, listBottomRef])

  return (
    <Wrapper>
      <div className='relative mx-auto grid-cols-12 md:grid'>
        {isVisibleLeftSidebar && (
          <div
            onScroll={handleScroll}
            className={`relative ${isVisibleLeftSidebar ? 'visible w-full' : 'hidden w-0'
              } relative col-span-4 h-[calc(100vh-130px)] overflow-y-auto border-b border-r border-lightSilver transition-[left] duration-[0.5s] ease-in-out laptop:col-span-3`}
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
                  className={`${selectedBillItems.length > 1 && isEnableMerge && selectedStates[0]?.id === userId
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
                billLists.map((item: any, index: number) => {
                  return (
                    <BillPostingEditListComponent
                      key={item.Id}
                      {...item}
                      billLists={billLists}
                      processType={processSelection}
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
          className={`${isVisibleLeftSidebar ? 'col-span-8 laptop:col-span-9' : 'col-span-12'
            } h-[calc(100vh_-_65px)] overflow-y-auto`}
        >
          <div className={`!h-[66px] sticky top-0 ${isVendorBillHistoryListOpen ? "z-[7]" : "z-[6]"} flex w-full flex-row justify-between bg-[#F4F4F4] px-5`}>
            <div className='flex items-center justify-center'>
              {!isVisibleLeftSidebar && (
                <span
                  className='cursor-pointer rounded-full bg-white p-1.5'
                  onClick={() => router.push('/bills')}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter') && router.push('/bills')}
                >
                  <BackIcon />
                </span>
              )}
              {processSelection !== '4' && (
                <>
                  {billStatus !== 3 && billStatus !== 9 && (
                    <>
                      <span className='pl-[13px] !text-[14px] font-semibold'>TAT :</span>
                      <span className='pl-2 !text-[16px] font-semibold text-[#FB2424]'>{timeDifference.value}</span>
                    </>
                  )}
                </>
              )}
            </div>
            {module == "copybill" ? <ul className='flex items-center justify-center gap-5'>
              <li className='h-full flex items-center'
                onClick={() => handleCopyBillClick(activeBill)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && setIsVisibleActivities(true)}
              >
                <BasicTooltip position='bottom' content='Copy Bill' className='!font-proxima !px-0 !text-[14px]'>
                  <CopyIcon />
                </BasicTooltip>
              </li>
              <li className='h-full flex items-center'
                onClick={() => setIsVisibleActivities(true)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && setIsVisibleActivities(true)}
              >
                <BasicTooltip position='bottom' content='Activities' className='!font-proxima !px-0 !text-[14px]'>
                  <ActivityIcon />
                </BasicTooltip>
              </li>
            </ul>
              : <ul className='flex items-center justify-center gap-5'>
                {processSelection !== '4' && (
                  <>
                    {billStatus !== 3 &&
                      billStatus !== 9 &&
                      billStatus !== 4 &&
                      billStatus !== 7 &&
                      selectedProcessTypeInList !== '3' && (
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
                  </>
                )}
                {processSelection === '4' && (
                  <>
                    <li className='h-full flex items-center'
                      onClick={() => router.push(`/bills/edit/${activeBill}?module=bills`)}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter')}
                    >
                      <BasicTooltip position='left' content='Edit bill' className='!z-10 !font-proxima !text-sm'>
                        <span className='cursor-pointer'>
                          <EditIcon />
                        </span>
                      </BasicTooltip>
                    </li>

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
                  </>
                )}

                <li className={`${(billStatusName == "New" || billStatusName == "Drafted" || billStatusName == "Failed") ? "block" : "hidden"} h-full flex items-center relative`}
                  onClick={() => setIsVendorBillHistoryListOpen(true)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter') && setIsVendorBillHistoryListOpen(true)}
                >
                  <BasicTooltip position='bottom' content='Vendor Bill History' className='!font-proxima !px-0 !text-[14px]'>
                    <VendorBillHistoryIcon />
                  </BasicTooltip>

                  <div ref={listRef} className={`${isVendorBillHistoryListOpen ? "block" : "hidden"} w-[535px] max-h-[296px] border border-lightSilver rounded absolute top-12 right-0 !z-[7] bg-pureWhite`}>
                    <div className='w-full h-[56px] p-2.5 border-b border-lightSilver'>
                      <div className='cursor-pointer w-full flex items-center h-9 rounded-full bg-whiteSmoke border border-lightSilver hover:border-primary'>
                        <div className='mx-[15px] cursor-pointer'>
                          <GlobalSearch />
                        </div>
                        <div className='cursor-pointer w-full'>
                          <input
                            tabIndex={0}
                            type='text'
                            value={searchValue}
                            className='searchPlaceholder bg-transparent w-full font-proxima text-sm text-darkCharcoal placeholder:text-slatyGrey focus:outline-none'
                            placeholder='Search'
                            onChange={onChangeSearchField}
                            onKeyDown={(e) => handleKeyDown(e)}
                          />
                        </div>
                        <div className='mx-[15px] cursor-pointer'
                          onClick={() => handleRemoveClick()}>
                          <CrossIcon />
                        </div>
                      </div>
                    </div>
                    <div className='w-full h-[calc(296px-57px)] overflow-y-auto custom-scroll'>
                      {vendorHistoryList.length == 0
                        ? isVendorHistoryLoading
                          ? <div className='flex h-full w-full items-center justify-center'>
                            <Loader size='sm' />
                          </div>
                          : <div className='flex h-[40px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b'>
                            No records available at the moment.
                          </div>
                        : <table className="w-full">
                          <tbody>
                            {vendorHistoryList.map((data: any, index: number) => (
                              <tr key={data.BillNumber + index} className={`h-[40px] border-b border-lightSilver relative`}>
                                <td className="px-5 text-sm text-darkCharcoal tracking-[0.02em] font-proxima text-start">{data.BillNumber}</td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                                <td className="px-5 text-sm text-darkCharcoal tracking-[0.02em] font-proxima text-center">{formatDate(data.BillDate)}</td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                                <td className="px-5 text-sm font-bold font-proxima text-end tracking-[0.02em]">${formatCurrency(data.BillAmount)}</td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                                <td className="px-5 text-sm text-center pt-2">
                                  <button
                                    onClick={() => {
                                      dispatch(setIsVisibleSidebar(false))
                                      router.push(`/bills/view/${data.Id}?module=copybill`)
                                    }}
                                  >
                                    <ViewModeIcon height={'19'} width={'19'} />
                                  </button>
                                </td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                                <td className="px-5 text-sm pt-2 text-center">
                                  <button onClick={() => handleCopyBillClick(data.Id)}>
                                    <CopyIcon />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>}
                      {isLazyLoading && !isLoading && (
                        <Loader size='sm' helperText />
                      )}
                      <div ref={listBottomRef} />
                    </div>
                  </div>
                </li>

                <li className='h-full flex items-center'
                  onClick={() => setIsVisibleActivities(true)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter') && setIsVisibleActivities(true)}
                >
                  <BasicTooltip position='bottom' content='Activities' className='!font-proxima !px-0 !text-[14px]'>
                    <ActivityIcon />
                  </BasicTooltip>
                </li>

                {processSelection !== '4' && (
                  <>
                    {billStatus !== 3 &&
                      billStatus !== 9 &&
                      billStatus !== 4 &&
                      billStatus !== 7 &&
                      selectedStates[0]?.id === userId && (
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
                                          key={item.value}
                                        >
                                          <Typography>{item?.label}</Typography>
                                        </span>
                                      )
                                    })}
                              </div>
                            </div>
                          )}
                        </li>
                      )}
                  </>
                )}
                {processSelection !== '4' && (
                  <>
                    {billStatus !== 3 &&
                      billStatus !== 9 &&
                      billStatus !== 4 &&
                      billStatus !== 7 &&
                      selectedStates[0]?.id === userId && (
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
                  </>
                )}


                {processSelection !== '4' && (
                  <li
                    className='h-full flex items-center'
                    onClick={handleViewMode}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter') && handleViewMode()}
                  >
                    <BasicTooltip position='bottom' content='View' className='!font-proxima !px-0 !text-[14px]'>
                      <ViewIcon />
                    </BasicTooltip>
                    {isOpenViewMode && (
                      <div
                        ref={dropdownViewModeRef}
                        className='absolute right-6 top-12 !z-10 flex h-auto flex-col rounded-md bg-white py-2 shadow-lg'
                      >
                        <div className='flex flex-col items-start justify-start'>
                          <span
                            className='flex w-full cursor-pointer items-center justify-center px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
                            onClick={() => router.push('/bills')}
                          >
                            <span className='pr-[10px]'>
                              <ListIcon />
                            </span>
                            <Typography>List Mode</Typography>
                          </span>

                          {billStatusEditable.includes(billStatus) &&
                            processSelection !== '3' &&
                            checkUserId &&
                            selectedStates[0]?.id === userId && (
                              <span
                                className='flex w-full cursor-pointer items-center justify-center px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
                                onClick={() => router.push(`/bills/edit/${activeBill}?module=bills`)}
                              >
                                <span className='pr-[10px]'>
                                  <EditModeIcon />
                                </span>
                                <Typography>Edit Mode</Typography>
                              </span>
                            )}
                        </div>
                      </div>
                    )}
                  </li>
                )}
              </ul>}

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
              setLocalFilterFormFields(initialBillPostingFilterFormFields)
            }}
            processSelection={processSelection}
            statusOptions={statusSelectionOptions}
            locationOptions={locationOptions}
            userOptions={userOptions}
            vendorOptions={vendorOptions}
            localFilterFormFields={localFilterFormFields}
            setLocalFilterFormFields={setLocalFilterFormFields}
          />

          {children}

          {processSelection !== '4' && (
            <div className='!h-[66px] custom-bottom-sticky bottom-0 grid place-content-center place-items-center gap-2 !border-t border-lightSilver px-5 py-[12px] sm:!flex sm:!items-center sm:!justify-end'>
              <span
                className='mr-[20px] flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-whiteSmoke'
                onClick={() => handleBackword(activeBill)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && handleBackword(activeBill)}
              >
                <LeftArrowIcon />
              </span>

              {selectedProcessTypeInList !== '2' && (
                <Button
                  variant={isDisablePaidButton ? 'btn' : 'btn-outline-primary'}
                  className='btn-md w-[130px] rounded-full'
                  onClick={() => setPostaspaidModal(true)}
                  disabled={isDisablePaidButton ? true : false}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter') && setPostaspaidModal(true)}
                >
                  <>
                    {loader.postAsPaid ? (
                      <div className={`flex w-full items-center justify-center`}>
                        <div className='animate-spin'>
                          <SpinnerIcon bgColor='#02B89D' />
                        </div>
                      </div>
                    ) : (
                      <Typography className='!text-[14px] font-semibold uppercase !tracking-[0.02em]'>Post as paid</Typography>
                    )}
                  </>
                </Button>
              )}
              <Button
                variant={`${isDisableDraftButton ? 'btn' : 'btn-outline-primary'}`}
                className='btn-md ml-[20px] w-[143px] rounded-full'
                onClick={() => onSubmitBill(2)}
                disabled={isDisableDraftButton ? true : false}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && onSubmitBill(2)}
              >
                <>
                  {loader.saveAsDraft ? (
                    <div className={`flex w-full items-center justify-center`}>
                      <div className='animate-spin '>
                        <SpinnerIcon bgColor='#02B89D' />
                      </div>
                    </div>
                  ) : (
                    <>
                      {billStatus === 2 ? (
                        <Typography className='!text-[14px] font-semibold uppercase !tracking-[0.02em]'>Drafted</Typography>
                      ) : (
                        <Typography className='!text-[14px] font-semibold uppercase !tracking-[0.02em]'>Save as draft</Typography>
                      )}
                    </>
                  )}
                </>
              </Button>

              <Button
                variant={isDisablePostButton ? 'btn' : 'btn-primary'}
                className='btn-md ml-[20px] w-[90px] rounded-full'
                onClick={() => onSubmitBill(3)}
                disabled={isDisablePostButton ? true : false}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && onSubmitBill(3)}
              >
                <>
                  {loader.post ? (
                    <div className={`flex w-full items-center justify-center`}>
                      <div className='animate-spin '>
                        <SpinnerIcon bgColor='#FFF' />
                      </div>
                    </div>
                  ) : (
                    <Typography className='!text-[14px] font-semibold uppercase !tracking-[0.02em]'>Post</Typography>
                  )}
                </>
              </Button>

              <span
                className='ml-[20px] flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-whiteSmoke'
                onClick={() => handleForward(activeBill)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter') && handleForward(activeBill)}
              >
                <RightArrowIcon />
              </span>
            </div>
          )}
        </div>

        <ActivityDrawer
          noCommentBox={false}
          isOpen={isVisibleActivities}
          onClose={() => {
            setIsVisibleActivities(false);
            if (selectedProcessTypeInList === '4') {
              setIsVisibleLeftSidebar(false)
            } else if (selectedProcessTypeInList !== '4' && !checkActivityStatus) {
              setIsVisibleLeftSidebar(true)
            }
          }}
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
          onOpen={postaspaidModal}
          onClose={() => setPostaspaidModal(false)}
          handleSubmit={() => onSubmitBill(12)}
        />

        <ConfirmationModal
          title='Assignee'
          content={`Are you sure you want to assign this bill to ${tempAssignee[0]?.name} ?`}
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
          handleSubmit={() => {
            if (selectedProcessTypeInList !== '4') {
              onDeleteDocuments()
            } else {
              onDeleteOverviewDocuments()
            }
          }}
          editedValues={editedValues}
          setEditedValues={setEditedValues}
        />
      </div>

      <DrawerOverlay isOpen={isVisibleMergeDoc} onClose={() => setIsVisibleMergeDoc(false)} />
      <DrawerOverlay isOpen={isVisibleActivities} onClose={() => setIsVisibleActivities(false)} />

      {/* Bill Copy Modal */}
      {isCopyBillModalOpen && <ConfirmationModal
        title='Bill Copy'
        content={`Are you sure you want to copy this bill?`}
        isModalOpen={isCopyBillModalOpen}
        modalClose={modalClose}
        handleSubmit={() => handleCopyBillDetails(copyBillId)}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />}
    </Wrapper>
  )
}

export default ViewWrapper
