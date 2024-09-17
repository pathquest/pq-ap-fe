import { useAppDispatch } from '@/store/configureStore'
import { setIsFormDocuments } from '@/store/features/bills/billSlice'
import moment from 'moment'
import { CheckBox, BasicTooltip } from 'pq-ap-lib'

interface BillListingProps {
  billLists: any
  Id: number
  BillNumber: any
  VendorName: string
  CreatedOn: string
  StatusName: string
  Status: number
  isActive: boolean
  processType: any
  selectedBillItems: Array<string>
  setSelectedBillItems: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void
  setSelectedBillItem: (value: string) => void
  setBillActive: (key: string, value: boolean) => void
}

const BillPostingEditListComponent = ({
  Id,
  billLists,
  BillNumber,
  VendorName,
  CreatedOn,
  StatusName,
  Status,
  isActive,
  processType,
  selectedBillItems,
  setSelectedBillItems,
  setSelectedBillItem,
}: BillListingProps) => {
  const dispatch = useAppDispatch()

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setSelectedBillItems(e, Id.toString())
  }

  return (
    <div
      className={`flex items-center justify-between border-b border-solid border-darkSmoke px-2.5 py-5 hover:cursor-pointer hover:bg-[#EEF4F8]
    ${isActive ? 'bg-[#EEF4F8]' : ''}
    `}
      onClick={() => {
        const IsFromDocumentsValue = billLists.filter((value: any) => value.Id === Id)
        dispatch(setIsFormDocuments(IsFromDocumentsValue[0].IsFromDocuments))
        setSelectedBillItem(Id.toString())
      }}
    >
      {Status !== 3 && Status !== 9 && processType !== '3' ? (
        <div onClick={(e) => e.stopPropagation()}>
          <CheckBox
            className='checkbox'
            id={`${Id}`}
            checked={Status !== 3 && Status !== 9 ? selectedBillItems.includes(Id.toString()) : false}
            onChange={handleCheckboxChange}
            disabled={Status === 3 || Status === 4 || Status === 7 || Status === 9 ? true : false}
          />
        </div>
      ) : (
        <div className='w-[17.99px]'></div>
      )}
      <div className={`grid w-[95%] grid-cols-2 pl-3.5`}>
        <div className='grid place-items-start'>
          <label className='mb-1 break-all !text-sm text-darkCharcoal tracking-[0.02em] font-proxima'>
            <BasicTooltip position='right' content='Bill Number' className='!pl-0 !py-0 !pr-1 !font-proxima !text-sm'>
              {BillNumber ? BillNumber : 'Not Available'}
            </BasicTooltip>
          </label>
          <label className='!text-sm text-darkCharcoal font-proxima tracking-[0.02em]'>
            {VendorName ? VendorName : 'Not Available'}
          </label>
        </div>
        <div className='grid'>
          <label className='w-full mb-1 !text-sm font-proxima tracking-[0.02em] text-end'>
            {moment(CreatedOn).format('L')}
          </label>
          <div className='flex !w-full items-start justify-end !text-sm font-proxima font-bold tracking-[0.02em] text-darkCharcoal gap-2'>
            <span>Status:</span>
            <span>{StatusName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillPostingEditListComponent
