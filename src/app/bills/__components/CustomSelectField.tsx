import { Select } from "@/app/vendors/__components/Selectdropdown/Select"
import CustomAutocomplete from "@/components/Common/MUI/CustomAutocomplete"

const CustomSelectField = ({
  fieldName,
  d,
  field,
  optionsObj,
  currentRowHasLineItemFieldErrorsObj,
  onChangeTableFieldValue,
  hasLineItemFieldErrors,
  setHasLineItemFieldErrors,
  hasLineItemFieldLibraryErrors,
  setHasLineItemFieldLibraryErrors,
  generateLinetItemFieldsErrorObj,
}: any) => {
  let options

  if (field?.Value) {
    options = JSON.parse(field?.Value)
  } else if (optionsObj) {
    options = optionsObj
  } else {
    options = []
  }

  return (
    <div className='w-[197px] flex items-center'>
      <CustomAutocomplete
        id={field?.id ?? ''}
        options={options}
        defaultValue={d[fieldName]}
        getValue={(value: any) => {
          onChangeTableFieldValue(d.Index, value, fieldName)

          const currentRowObj: any = hasLineItemFieldErrors && hasLineItemFieldErrors.find((item: any) => item.Index === d.Index)

          if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
            const updatedArray: any =
              hasLineItemFieldErrors &&
              hasLineItemFieldErrors.map((itemErrors: any) => {
                if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                  return { ...currentRowObj, [fieldName]: false }
                }
                return itemErrors
              })
            setHasLineItemFieldErrors(updatedArray)
          }
        }}
        error={currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
        getError={(err: boolean) => {
          const currentRowObj: any =
            hasLineItemFieldLibraryErrors && hasLineItemFieldLibraryErrors.find((item: any) => item.Index === d.Index)

          if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
            const updatedArray: any =
              hasLineItemFieldLibraryErrors &&
              hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                  return { ...currentRowObj, [fieldName]: err }
                }
                return itemErrors
              })
            setHasLineItemFieldLibraryErrors(updatedArray)
          }
        }}
        validate={field.IsRequired}
        errorMessage=""
        autoComplete={field.autoComplete ? 'on' : 'off'}
        disabled={field.isDisabled}
      />
      {/* <Select
        search
        id={field?.id ?? ''}
        options={options}
        errorClass='!-mt-4'
        validate={field.IsRequired}
        defaultValue={d[fieldName]}
        getValue={(value) => {
          onChangeTableFieldValue(d.Index, value, fieldName)

          const currentRowObj: any = hasLineItemFieldErrors && hasLineItemFieldErrors.find((item: any) => item.Index === d.Index)

          if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
            const updatedArray: any =
              hasLineItemFieldErrors &&
              hasLineItemFieldErrors.map((itemErrors: any) => {
                if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                  return { ...currentRowObj, [fieldName]: false }
                }
                return itemErrors
              })
            setHasLineItemFieldErrors(updatedArray)
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
                  return { ...currentRowObj, [fieldName]: err }
                }
                return itemErrors
              })
            setHasLineItemFieldLibraryErrors(updatedArray)
          }
        }}
        hasError={currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
        autoComplete={field.autoComplete ? 'on' : 'off'}
        disabled={field.isDisabled}
        className='bg-white'
      /> */}
    </div>
  )
}

export default CustomSelectField