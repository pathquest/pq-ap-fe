interface BillsFormField {
  FieldType: string
  Name: string
  isDisabled: boolean
  Label: string
  placeholder?: string
  isValidate?: boolean
  noValidate?: boolean
  direction?: 'bottom' | 'top' | 'left' | 'right'
  isNumeric?: boolean
  isText?: boolean
  readOnly?: boolean
  isSpecialChar?: boolean
  Value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelect?: (key: string, values: string[]) => void
  getValue: (key: string, value: string | boolean) => void
  getError: (key: string, err: boolean) => void
  hasError?: boolean
  autoComplete?: boolean
  min?: number
  max?: number
  maxLength?:number
  id?: string
  Options?: OptionType[]
  errorClass?: string
  defaultValue?: any
  classNames?: string
  disable?: boolean
  startYear?: number
  endYear?: number
  listType?: string
  IsRequired?: boolean
  IsChecked?: boolean
  MappedWith?: number
}

type FileObj = {
  FileName?: string
  FilePath?: string
  Id?: number
  Size?: number
}

type billsFormFieldsProps = {
  formFields: BillsFormField[]
}
