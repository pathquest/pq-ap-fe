export type ProfileFormFieldsProps = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  country_id: number | null
  state_id: number | null
  city_id: number | null
  postal_code: string
  time_zone: number | null
  id?: string
  user_image?: string
  is_active?: boolean
  is_verified?: boolean
  guid:string
}

export type ProfileFormFieldErrorsProps = {
  first_name: boolean
  last_name: boolean
  email: boolean
  phone: boolean
  address: boolean
  country_id: boolean
  state_id: boolean
  city_id: boolean
  postal_code: boolean
  time_zone: boolean
}

export type SignInFormFieldsProps = {
  username: string
  password: string
}

export type SignInFormFieldErrorsProps = {
  username: boolean
  password: boolean
}

export type SignUpFormFieldsProps = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export type SignUpFormFieldErrorsProps = {
  first_name: boolean
  last_name: boolean
  email: boolean
  phone: boolean
}

export type SetPasswordFormFieldsProps = {
  password: string
  cPassword: string
}

export type SetPasswordFormFieldErrorsProps = {
  password: boolean
  cPassword: boolean
}

export type ForgotPasswordFormFieldsProps = {
  email: string
}

export type ForgotPasswordFormFieldErrorsProps = {
  email: boolean
}

export type BillEditFormFieldsProps = {
  bill_number: string
  vendor: number
  invoice_date: string
  gi_posting_date: string
  ap_term: number
  due_date: string
}

export type BillEditFormFieldErrorsProps = {
  bill_number: boolean
  vendor: boolean
  invoice_date: boolean
  gi_posting_date: boolean
  ap_term: boolean
  due_date: boolean
}

export type ClassDrawerFormFieldsProps = {
  class_code?: string
  name: string
}

export type ClassDrawerFormFieldErrorsProps = {
  class_code?: boolean
  name: boolean
}

export type DepartmentDrawerFormFieldsProps = {
  departmentCode: string
  title: string
}

export type DepartmentDrawerFormFieldErrorsProps = {
  departmentCode: boolean
  title: boolean
}

export type LocationDrawerFormFieldsProps = {
  locationCode?: string
  name: string
}

export type LocationDrawerFormFieldErrorsProps = {
  locationCode?: boolean
  name: boolean
}

export type ProjectDrawerFormFieldsProps = {
  projectCode: string
  name: string
}

export type ProjectDrawerFormFieldErrorsProps = {
  projectCode: boolean
  name: boolean
}

export type APFieldDrawerFormFieldProps = {
  displayName: string
  fieldType: string
}

export type APFieldDrawerFormFieldErrorsProps = {
  displayName: boolean
  fieldType: boolean
}

export type fieldmappingProps = {
  vendor: string
  billNumber: string
  date: string
  dueDate: number
  glPostingData?: number
  apTerm?: string
  referenceNumber?: string
  poNumber?: string
  billDate?: string
}

export type fieldmappingErrorsProps = {
  vendor: boolean
  billNumber: boolean
  date: boolean
  dueDate: boolean
  glPostingData?: boolean
  apTerm?: boolean
  referenceNumber?: boolean
  poNumber?: boolean
  billDate?: boolean
}
