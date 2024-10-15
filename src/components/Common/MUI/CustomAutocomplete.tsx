import React from 'react';
import { Autocomplete, Box, TextField, styled } from '@mui/material';
import ArrowDropDown from '@/components/Common/Dropdown/Icons/ChevronDown'

interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    options: any[];
    label?: string;
    defaultValue?: any;
    getValue: (value: any) => void;
    getError: (arg1: boolean) => void;
    disabled?: boolean;
    error?: any
    validate?: boolean;
    errorMessage?: any
}

const CustomAutocomplete: React.FC<SelectProps> = ({
    id,
    label,
    options,
    defaultValue,
    getValue,
    getError,
    disabled,
    error,
    errorMessage,
    validate
}) => {
    return (
        <Autocomplete
            // disablePortal
            id={id}
            options={options}
            value={
                options.find(
                    (i: any) => i.value == defaultValue
                ) || null
            }
            onChange={(e, value: any) => {
                if (value) {
                    getValue(value.value)
                    getError(false);
                }
            }}
            disabled={disabled}
            popupIcon={<ArrowDropDown />}
            clearIcon={<></>}
            sx={{
                '& .MuiAutocomplete-input': {
                    fontFamily: '"Proxima Nova", sans-serif',
                    fontSize: '14px',
                    color: '#333333',
                },
                '& .MuiAutocomplete-inputRoot': {
                    paddingTop: label ? "12px" : '5px',
                },
                width: "100%",
                height: "45px",
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    placeholder='Please select'
                    label={
                        label ? <span style={{
                            fontFamily: '"Proxima Nova", sans-serif',
                            fontSize: '14px',
                            color: error ? "#DC3545" : '#6E6D7A',
                        }}>
                            {label}
                            {validate && <span style={{ color: '#DC3545', fontSize: '22px' }}>&nbsp;*</span>}
                        </span > : ""}
                    InputLabelProps={{
                        shrink: true,
                        sx: {
                            transform: 'translate(0, -1.5px) scale(1)',
                            transformOrigin: 'top left',
                        }
                    }}
                    error={error}
                    onBlur={() => {
                        if (defaultValue > 0) {
                            getError(false);
                        }
                    }}
                    helperText={
                        error && errorMessage != ""
                            ? <span style={{ fontFamily: '"Proxima Nova", sans-serif', color: '#DC3545', fontSize: '14px' }
                            } > This is a required field.</span >
                            : ""
                    }
                    sx={{
                        '& .MuiInput-underline:before': {
                            borderBottomColor: '#D8D8D8',
                            borderBottomWidth: '1px',
                        },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                            borderBottomColor: '#02B89D',
                            borderBottomWidth: '1px',
                        },
                        '& .MuiInput-underline:after': {
                            borderBottomColor: '#02B89D',
                            borderBottomWidth: '1px',
                        },
                        '& .MuiFormHelperText-root': {
                            fontFamily: '"Proxima Nova", sans-serif',
                            fontSize: '12px',
                        },
                    }}
                />
            )}
        />
    );
};

export default CustomAutocomplete;