import { useRouter } from 'next/navigation'

function Create() {
  const router = useRouter()

  const handleAccountpayable = () => {
    router.push('/bills/create/1')
  }

  const handleAccountadjustment = () => {
    router.push('/bills/create/2')
  }
  return (
    <>
      <div className='flex flex-col items-start justify-start border-b border-[#cccccc]'>
        <span
          className='w-full cursor-pointer px-5 py-3 !text-[14px] hover:bg-blue-50'
          onClick={handleAccountpayable}
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAccountpayable()}
        >
          Accounts Payable
        </span>
        <span
          className='w-full cursor-pointer px-5 py-3 !text-[14px] hover:bg-blue-50'
          onClick={handleAccountadjustment}
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAccountadjustment()}
        >
          Accounts Adjustment
        </span>
      </div>
    </>
  )
}

export default Create
