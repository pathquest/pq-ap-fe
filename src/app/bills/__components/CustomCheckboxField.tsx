import { booleanToString } from '@/utils';
import { CheckBox } from 'pq-ap-lib';

const CustomCheckBox = ({
    d,
    field,
    fieldName,
    isSubmitClick,
    onChangeTableFieldValue,
    hasLineItemFieldLibraryErrors,
    generateLinetItemFieldsErrorObj,
    setHasLineItemFieldLibraryErrors,
}: any) => {
    let isInvalid;

    if (!d[fieldName]) {
        if (isSubmitClick) {
            isInvalid = field.IsRequired;
        } else {
            isInvalid = false;
        }
    } else {
        isInvalid = false;
    }

    const fieldClassName = field.Name === '1099' ? `Form${field.Name}` : field.Name;

    return (
        <CheckBox
            id={`${d?.Index}-${field.Name}` ?? ''}
            label={`${field.Label}` ?? ''}
            onChange={(e) => {
                e.stopPropagation();
                onChangeTableFieldValue(d.Index, e.target.checked, fieldName);

                const currentRowObj = hasLineItemFieldLibraryErrors.find((item: any) => item.Index === d.Index);

                if (currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                    const updatedArray = hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                        if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                            return { ...currentRowObj, [fieldName]: e.target.checked ? true : false };
                        }
                        return itemErrors;
                    });
                    setHasLineItemFieldLibraryErrors(updatedArray);
                }
            }}
            className={`text-[#333333] ${fieldClassName}`}
            variant='small'
            invalid={isInvalid}
            checked={d[fieldName]}
            disabled={field.isDisabled}
        />
    );
};

export default CustomCheckBox;
