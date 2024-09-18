import { format, isValid, parse } from 'date-fns'
import { Toast } from 'pq-ap-lib'

export function handleLoginError(message: string) {
  const errorMessage = message || 'Failed please try again later.'
  Toast.error('Error', errorMessage)

  if (message === 'invalid request!') {
    Toast.error(errorMessage, 'please try after sometime.')
  }
}

export function convertStringsToIntegers(array: string[]) {
  return array.map((item) => parseInt(item, 10))
}

export function convertStringsDateToUTC(dateString: string): string {
  let parsedDate: Date = new Date()

  parsedDate = parse(dateString, 'MM/dd/yyyy', new Date())

  const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS")

  return formattedDate
}

export function booleanToString(bool: boolean) {
  if (typeof bool === "boolean") {
    return bool.toString().charAt(0).toUpperCase() + bool.toString().slice(1);
  }
  throw new Error("Input is not a boolean value");
}

export function isDateInFormat(dateString: string, dateFormat: string) {
  const parsedDate = parse(dateString, dateFormat, new Date());
  return isValid(parsedDate) && format(parsedDate, dateFormat) === dateString;
}

export function roundUp(value: number) {
  if (value > 0 && value < 1) {
    return 1;
  } else {
    return Math.ceil(value);
  }
}
