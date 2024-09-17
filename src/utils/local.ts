const emailActivation = {
  title: 'Activate your PathQuest Account',
  subTitle: 'We have sent a confirmation email to',
  backButton: 'Back to Login',
}

const forgotConfirm = {
  title: 'Check Your Email',
  message: 'A password reset email has been sent to',
  description:
    'If you do not receive the email in a timely manner, please try again and make sure that you provide the correct email address.',
  backButton: 'Back to Login',
}

const forgotPasswordContent = {
  title: 'Forgot Password',
  sendEmailButton: 'SEND EMAIL',
  backButton: 'Back to Login',
}

const signInContent = {
  title: 'Sign In',
  forgotPassword: 'Forgot Password?',
  signInBtn: 'SIGN IN',
  continueWith: 'or Continue with',
  signUpBtn: 'Sign Up',
  notHaveAccount: "Don't have an account?",
}

const signUpContent = {
  title: "Let's Get Started!",
  subTitle: 'It will take just a few minutes.',
  signUpBtn: 'SIGN UP',
  termAndConditions: 'Terms & Conditions',
  continueWith: 'or Continue with',
  alreadyHaveAccount: 'Already have an account?',
  signInBtn: 'Sign In',
}

const verificationContent = {
  description: 'Please enter the One Time Password to verify your account',
  sendInfo: 'A One Time Password has been sent to',
  verifyBtn: 'VERIFY',
  linkText: 'If code not received, click on',
  resendBtn: 'Resend OTP',
  resendOtpMessage: 'We have resend the OTP to your registered email address',
}

const setPasswordContent = {
  description: 'Please set a new password for your account.',
  errorMessage: 'Password does not match!',
  continueBtn: 'CONTINUE',
}

const ConfirmationModalContent = {
  title: (value: string) => value,
  content: (value: string) => `Are you sure you want to remove this ${value} ?`,
}

export {
  emailActivation,
  forgotConfirm,
  forgotPasswordContent,
  signInContent,
  signUpContent,
  verificationContent,
  setPasswordContent,
  ConfirmationModalContent,
}
