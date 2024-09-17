import { format, parse } from "date-fns"

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()

  return `${month}/${day}/${year}`
}

export const utcFormatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return null;

  const parsedDate = parse(dateString.trim(), 'MM/dd/yyyy', new Date());
  return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss");
}

export const formatPeriodDate = (date: any) => {
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

export const getCurrentYear = () => {
  return new Date().getFullYear()
}

export const getPastYear = () => {
  return getCurrentYear() - 1
}

export const getNextYear = () => {
  return getCurrentYear() + 1
}
