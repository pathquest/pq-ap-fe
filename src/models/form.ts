interface FormField {
  type: string
  key: string
  label: string
  name?: string
  placeholder?: string
  isValidate?: boolean
  noValidate?: boolean
  direction?: 'bottom' | 'top' | 'left' | 'right'
  isNumeric?: boolean
  isText?: boolean
  readOnly?: boolean
  isSpecialChar?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelect?: (key: string, values: string[]) => void
  getValue: (key: string, value: string) => void
  getError: (key: string, err: boolean) => void
  hasError?: boolean
  autoComplete?: boolean
  min?: number
  max?: number
  id?: string
  options?: OptionType[]
  errorClass?: string
  defaultValue?: any
  classNames?: string
  disable?: boolean
  startYear?: number
  endYear?: number
  listType?: string
}

type formFieldsProps = {
  isGrid?:boolean
  formFields: FormField[]
}
