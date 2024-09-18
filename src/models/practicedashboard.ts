export interface FilterPractDashboardPopoverProps {
  onClose: (val: boolean) => void
  onCancel?: () => void
  onApply?: () => void
  onReset?: () => void
  onResetFilter: (value: boolean) => void
  billList?: any
  processSelection?: string
  statusOptions?: any
  locationOptions?: any
  userOptions?: any
  vendorOptions?: any
  localFilterFormFields?: any
  setLocalFilterFormFields?: any
  isOpenFilter?: boolean
  activeBill?: any
  filterApplyChange?: any
}
