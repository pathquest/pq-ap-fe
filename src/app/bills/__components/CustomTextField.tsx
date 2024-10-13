import Editable from '@/components/Common/Editable'
import { Text } from 'pq-ap-lib'

const CustomTextField = ({
  fieldName,
  d,
  field,
  currentRowHasLineItemFieldErrorsObj,
  isDisabled,
  hoveredRow,
  inputRef,
  onChangeTableFieldValue,
  hasLineItemFieldErrors,
  setHasLineItemFieldErrors,
  hasLineItemFieldLibraryErrors,
  setHasLineItemFieldLibraryErrors,
  generateLinetItemFieldsErrorObj,
}: any) => {
  let displayValue;

  if (fieldName === 'amount') {
    if (d?.amount === 0 || d?.amount === null || d?.amount === '') {
      displayValue = `$${0}`;
    } else {
      displayValue = `$${d?.amount}`;
    }
  } else if ((fieldName === 'rate' && d.rate) || (fieldName === 'taxamount' && d.taxamount) || (fieldName === 'total' && d.total)) {
    if ((fieldName === 'rate' || fieldName === 'taxamount' || fieldName === 'total') && isNaN(d[fieldName])) {
      displayValue = `$${0}`;
    } else {
      displayValue = `$${d[fieldName]}`;
    }
  } else {
    displayValue = d[fieldName];
  }

  return (
    <Editable
      text={displayValue}
      placeholder={`Enter ${field.Label}`}
      type='input'
      childRef={inputRef}
      // ${isDisabled ? 'bg-lightGray w-full opacity-75 pointer-events-none' : ''}
      borderClassName={`w-full
                ${currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]
          ? '!text-[#DC3545] border-none'
          : ''
        }
                ${hoveredRow?.Index === d.Index ? 'cursor-pointer w-full border-b border-solid border-[#b6b6bc]' : ''}
                ${fieldName === 'qty' || fieldName === 'rate' || fieldName === 'amount' ? 'text-right' : ''}
            `}
    >
      <span className='textError'>
        <Text
          validate={field.IsRequired}
          inputRef={inputRef}
          type={
            fieldName === 'qty' || fieldName === 'rate' || fieldName === 'amount' || fieldName === 'markup' ? 'number' : 'text'
          }
          value={d[fieldName]}
          // tabIndex={0}
          getValue={(value) => {
            onChangeTableFieldValue(d.Index, fieldName === 'amount' ? parseFloat(value) : value, fieldName)

            const currentRowObj = hasLineItemFieldErrors && hasLineItemFieldErrors.find((item: any) => item.Index === d.Index)

            if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
              const updatedArray =
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
          getError={(err) => {
            const currentRowObj =
              hasLineItemFieldLibraryErrors && hasLineItemFieldLibraryErrors.find((item: any) => item.Index === d.Index)

            if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
              const updatedArray =
                hasLineItemFieldLibraryErrors &&
                hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                  if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                    return {
                      ...currentRowObj,
                      [fieldName]: err,
                      // amount: (currentRowObj.qty || err) && (currentRowObj.rate || err) ? true : false,
                      // taxamount: currentRowObj.taxrate || err ? true : false,
                      // total: (currentRowObj.qty || err) && (currentRowObj.rate || err) ? true : false,
                    }
                  }
                  return itemErrors
                })
              setHasLineItemFieldLibraryErrors(updatedArray)
            }
          }}
          // disabled={isDisabled}
          hasError={currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
          style={{
            textAlign: fieldName === 'qty' || fieldName === 'rate' || fieldName === 'amount' ? 'right' : 'left',
          }}
          maxLength={fieldName === 'amount' ? 15 : 150}
          className={`!pt-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${fieldName === 'qty' || fieldName === 'unitprice' ? 'text-right' : ''
            }`}
        />
      </span>
    </Editable>
  )
}

export default CustomTextField
