import { Toast } from 'pq-ap-lib'

export const performApiAction = async (
  dispatch: any,
  dispatchFunction: any,
  params: any,
  onSuccess: any,
  onFailure?: any,
  onWarning?: any,
  doNotShowToast?: boolean
) => {
  try {
    const { payload, meta } = await dispatch(dispatchFunction(params))
    const dataMessage = payload?.Message

    if (meta?.requestStatus === 'fulfilled') {
      if (payload?.ResponseStatus === 'Success') {
        onSuccess(payload?.ResponseData)
      } else if (payload?.ResponseStatus === 'Warning') {
        onWarning(payload?.ResponseData)
      } else {
        const errorMessage = dataMessage ?? 'Something went wrong!'
        doNotShowToast ? undefined : Toast.error('Error', `${errorMessage}`)
        onFailure(errorMessage, payload)
      }
    } else {
      doNotShowToast ? undefined : Toast.error(`${payload?.status} : ${payload?.statusText}`)
      onFailure(`${payload?.status} : ${payload?.statusText}`)
    }
  } catch (error) {
    console.error(error)
  }
}
