// FieldTypes
export const dropdown = 'dropdown'
export const date = 'date'
export const text = 'text'
export const file = 'file'
export const checkbox = 'checkbox'
export const radio = 'radio'

export const initialObject = {
  Id: -1,
  Name: '',
  FieldType: '',
  Label: '',
  Value: '',
  IsRequired: true,
  IsActive: true,
  Options: null,
  Type: -1,
  IsSystemDefined: true,
  IsRequiredForAccountPayable: false,
  IsRequiredForAccountAdjustment: false,
  DisplayForAccountPayable: false,
  DisplayForAccountAdjustment: false,
}

export const fieldTypeOptions = [
  { value: 'text', label: 'Text Box' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'date', label: 'Date' },
]

export const filteredFieldTypeOptions = [
  { value: 'text', label: 'Text Box' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];