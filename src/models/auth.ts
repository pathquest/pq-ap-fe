export interface SignInOptions {
  username: string
  password: string
}

export interface SignUpOptions {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export interface DefaultProductOptions {
  UserId: string | undefined
  productId: number
}

export interface SocialSignInOptions {
  SocialLoginType: number
  AccessToken: string
  Token: string
}

export interface ForgotPasswordOptions {
  email: string
}

export interface GenerateOtpOptions {
  email: string
}

export interface ValidateOtpOptions {
  otp: string
  email: string
}

export interface SetPasswordOptions {
  token: string
  password: string
}

export interface ReauthenticationProps {
  Password: string
}
