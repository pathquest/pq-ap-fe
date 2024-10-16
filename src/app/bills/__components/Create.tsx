import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission';
import { useAppSelector } from '@/store/configureStore';
import { useRouter } from 'next/navigation'

function Create() {
  const router = useRouter()
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isBillsView = getModulePermissions(processPermissionsMatrix, "Bills") ?? {}

  // Account Payable
  const isAccountPayableCreate = isBillsView["Accounts Payable"]?.Create ?? false;

  // Account Adjustment
  const isAccountAdjustmentCreate = isBillsView["Accounts Adjustment"]?.Create ?? false;

  const handleAccountpayable = () => {
    router.push('/bills/create/1')
  }

  const handleAccountadjustment = () => {
    router.push('/bills/create/2')
  }
  return (
    <div className='flex flex-col items-start justify-start border-b border-[#cccccc]'>
      <span
        className={`${isAccountPayableCreate ? "flex" : "hidden"} w-full cursor-pointer px-5 py-3 !text-[14px] hover:bg-blue-50`}
        onClick={handleAccountpayable}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAccountpayable()}
      >
        Accounts Payable
      </span>
      <span
        className={`${isAccountAdjustmentCreate ? "flex" : "hidden"} w-full cursor-pointer px-5 py-3 !text-[14px] hover:bg-blue-50`}
        onClick={handleAccountadjustment}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAccountadjustment()}
      >
        Accounts Adjustment
      </span>
    </div>
  )
}

export default Create
