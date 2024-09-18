import EditModeIcon from '@/assets/Icons/billposting/EditModeIcon'
import ViewModeIcon from '@/assets/Icons/billposting/ViewModeIcon'
import { Icons } from '@/models/billPosting'
import { useAppDispatch } from '@/store/configureStore'
import { setIsFormDocuments, setIsVisibleSidebar } from '@/store/features/bills/billSlice'
import { useRouter } from 'next/navigation'
import { Typography } from 'pq-ap-lib'

function View({ Id, onClose, Status, selectedRow, billListsData, UserId, IsFromDocuments }: Icons) {
  const localStorageUserId = localStorage.getItem('UserId')
  const router = useRouter()
  const dispatch = useAppDispatch()

  onClose()

  const statusRow = billListsData?.filter((value: any) => parseInt(selectedRow[0]) === value.Id)
  const selectedStatus = statusRow.length > 0 ? statusRow[0].Status : Status
  const UserIdRowData = billListsData?.filter((value: any) => parseInt(selectedRow[0]) === value.Id)

  const onClickViewMode = () => {
    dispatch(setIsVisibleSidebar(false))

    if (UserIdRowData.length !== 0) {
      dispatch(setIsFormDocuments(UserIdRowData[0]?.IsFromDocuments))
    } else {
      dispatch(setIsFormDocuments(IsFromDocuments))
    }
    Id && router.push(`/bills/view/${selectedRow.length !== 0 ? parseInt(selectedRow[0]) : Id}`)
  }

  const onClickEditMode = () => {
    dispatch(setIsVisibleSidebar(false))

    if (UserIdRowData.length !== 0) {
      dispatch(setIsFormDocuments(UserIdRowData[0]?.IsFromDocuments))
    } else {
      dispatch(setIsFormDocuments(IsFromDocuments))
    }
    Id && router.push(`/bills/edit/${selectedRow.length !== 0 ? parseInt(selectedRow[0]) : Id}`)
  }

  return (
    <>
      <div className='flex flex-col items-start justify-start'>
        <span
          className='flex w-full cursor-pointer items-center justify-center px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
          onClick={onClickViewMode}
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClickViewMode()}
        >
          <span className='pr-[10px]'>
            <ViewModeIcon height={'14'} width={'15'} />
          </span>
          <Typography>View Mode</Typography>
        </span>
        {selectedStatus !== 9 && selectedStatus !== 3 && selectedStatus !== 4 && selectedStatus !== 7 && localStorageUserId === UserId?.toString() && (UserIdRowData[0]?.UserId !== 0 && UserId !== 0) && (
          <span
            className='flex w-full cursor-pointer items-center justify-center px-[15px] py-[11px] !text-[14px] hover:bg-blue-50'
            onClick={onClickEditMode}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClickEditMode()}
          >
            <span className='pr-[10px]'>
              <EditModeIcon />
            </span>
            <Typography>Edit Mode</Typography>
          </span>
        )}
      </div>
    </>
  )
}

export default View
