import { todayDate } from '@/data/billPosting'
import { isDateInFormat } from '@/utils'
import { format, parse, parseISO } from 'date-fns'
import { Datepicker } from 'pq-ap-lib'

const CustomDatePicker = ({
  d,
  field,
  fieldName,
  onChangeTableFieldValue,
  hasLineItemFieldLibraryErrors,
  generateLinetItemFieldsErrorObj,
  setHasLineItemFieldLibraryErrors,
  currentRowHasLineItemFieldErrorsObj,
}: any) => {
  const formatedValue =
    d[fieldName] && d[fieldName].includes("'") ? format(parseISO(d[fieldName].replaceAll("'", '')), 'MM/dd/yyyy') : d[fieldName]
  return (
    <div className='lineItemDatepicker w-full'>
      <Datepicker
        startYear={1900}
        endYear={2099}
        id={`${d?.Index}-${field.Name}` ?? ''}
        validate={field.IsRequired}
        value={formatedValue}
        format='MM/DD/YYYY'
        getValue={(value) => {
          if (value) {
            const formatedDate =
              value && isDateInFormat(value, 'MM/dd/yyyy')
                ? format(parse(value, 'MM/dd/yyyy', new Date()), "yyyy-MM-dd'T'HH:mm:ss")
                : todayDate
            onChangeTableFieldValue(d.Index, field.Name.includes('Custom') ? `'${formatedDate}'` : value, fieldName)
          }
        }}
        getError={(err: boolean) => {
          const currentRowObj: any =
            hasLineItemFieldLibraryErrors && hasLineItemFieldLibraryErrors.find((item: any) => item.Index === d.Index)

          if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
            const updatedArray: any =
              hasLineItemFieldLibraryErrors &&
              hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                  return {
                    ...currentRowObj,
                    [fieldName]: err,
                  }
                }
                return itemErrors
              })
            setHasLineItemFieldLibraryErrors(updatedArray)
          }
        }}
        hasError={currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
        disabled={field.isDisabled}
      />
    </div>
  )
}

export default CustomDatePicker
