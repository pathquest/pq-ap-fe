type ProfileFormFieldsProps = {
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
  user_image?: any
  is_active?: boolean
  is_verified?: boolean
  guid:string
}

type ProfileFormFieldErrorsProps = {
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

type SignInFormFieldsProps = {
  username: string
  password: string
}

type SignInFormFieldErrorsProps = {
  username: boolean
  password: boolean
}

type SignUpFormFieldsProps = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

type SignUpFormFieldErrorsProps = {
  first_name: boolean
  last_name: boolean
  email: boolean
  phone: boolean
}

type SetPasswordFormFieldsProps = {
  password: string
  cPassword: string
}

type SetPasswordFormFieldErrorsProps = {
  password: boolean
  cPassword: boolean
}

type ForgotPasswordFormFieldsProps = {
  email: string
}

type ForgotPasswordFormFieldErrorsProps = {
  email: boolean
}

type OptionType = {
  label: string
  value: string
  code?: string
}

type TimeZoneData = {
  CountryId: number | null
}
