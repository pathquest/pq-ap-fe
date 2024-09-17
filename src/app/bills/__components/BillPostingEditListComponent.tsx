import { useAppDispatch } from '@/store/configureStore'
import { setIsFormDocuments } from '@/store/features/bills/billSlice'
import moment from 'moment'
import { CheckBox, Tooltip } from 'pq-ap-lib'

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
      className={`flex items-center justify-between border-b border-solid border-[#E6E6E6] px-2.5 py-5 hover:cursor-pointer hover:bg-[#EEF4F8] 
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
          <label className='mb-1 break-all !text-[14px] font-proxima'>
            <Tooltip position='right' content='Bill Number' className='!p-0 !font-proxima !text-[14px]'>
              {BillNumber ? BillNumber : 'Not Available'}
            </Tooltip>
          </label>
          <label className='!text-[14px] font-proxima'>
            {VendorName ? VendorName : 'Not Available'}
          </label>
        </div>
        <div className='grid place-items-end'>
          <label className='mb-1 !text-[14px] font-proxima'>
            {moment(CreatedOn).format('L')}
          </label>
          <label className='flex !w-24 flex-wrap items-end justify-end !text-[14px] font-proxima'>
            <span className='!font-bold'>Status: &nbsp;</span>
            <span>{StatusName}</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default BillPostingEditListComponent
