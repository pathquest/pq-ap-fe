import CopyIcon from '@/assets/Icons/billposting/CopyIcon'
import ViewModeIcon from '@/assets/Icons/billposting/ViewModeIcon'
import GlobalSearch from '@/components/Common/GlobalSearch/Icons/GlobalSearch'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import { useAppDispatch } from '@/store/configureStore'
import { setIsVisibleSidebar } from '@/store/features/bills/billSlice'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const VendorBillsHistory: React.FC<any> = ({
  billsData,
  isBillHistoryOpen,
  onClose,
  onSubmit,
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const listRef = useRef<any>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isCopyBillModalOpen, setIsCopyBillModalOpen] = useState<boolean>(false)
  const [copyBillId, setCopyBillId] = useState<number>(0)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (listRef.current && !listRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isBillHistoryOpen])

  const onChangeSearchField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      if (searchValue && searchValue.trim() !== "") {
        onSubmit()
      }
    }
  }

  const modalClose = () => {
    setIsCopyBillModalOpen(false)
    setCopyBillId(0)
  }

  const handleCopyBillDetails = (id: any) => {
  }

  return (<>
    <div ref={listRef} className={`${isBillHistoryOpen ? "block" : "hidden"} w-[535px] h-[296px] border border-lightSilver rounded absolute top-12 right-0 z-[7] bg-pureWhite`}>
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
              className='searchPlaceholder bg-transparent rounded-e-full w-full font-proxima text-sm text-darkCharcoal placeholder:text-slatyGrey focus:outline-none'
              placeholder='Search'
              onChange={onChangeSearchField}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
        </div>
      </div>
      <div className='w-full h-[calc(296px-57px)] overflow-y-auto custom-scroll'>
        <table className="w-full">
          <tbody>
            {billsData.map((data: any, index: number) => (
              <tr key={data.BillNumber + index} className={`h-[40px] border-b border-lightSilver relative`}>
                <td className="px-5 text-sm font-proxima text-start">{data.BillNumber}</td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                <td className="px-5 text-sm text-darkCharcoal font-proxima">{data.date}</td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                <td className="px-5 text-sm font-bold font-proxima text-end">${data.amount.toFixed(2)}</td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                <td className="px-5 text-sm text-center pt-2">
                  <button
                    onClick={() => {
                      dispatch(setIsVisibleSidebar(false))
                      router.push(`/bills/view/${data.Id}`)
                    }}
                  >
                    <ViewModeIcon height={'19'} width={'19'} />
                  </button>
                </td><td className='absolute top-2 text-lightSilver h-5'>|</td>
                <td className="px-5 text-sm pt-2 text-center">
                  <button onClick={() => {
                    setCopyBillId(data.Id)
                    setIsCopyBillModalOpen(true)
                    onClose()
                  }}>
                    <CopyIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

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
  </>)
}

export default VendorBillsHistory