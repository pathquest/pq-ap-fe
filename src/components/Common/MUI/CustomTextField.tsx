import React, { LegacyRef, useEffect, useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    inputRef?: LegacyRef<HTMLInputElement>;
    label?: string;
    className?: string;
    id?: string;
    name?: string;
    value?: string | number;
    validate?: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    supportingText?: string;
    disabled?: boolean;
    getValue: (arg1: string) => void;
    getError: (arg1: boolean) => void;
    hasError?: boolean;
    minChar?: number;
    maxChar?: number;
    errorMessage?: string;
    noNumeric?: boolean;
    noborder?: boolean;
    noSpecialChar?: boolean;
    noText?: boolean;
    noSpecialCharRegex?: any;
    rangeBetween?: number[];
}

const TextField: React.FC<InputProps> = ({
    inputRef,
    label,
    className,
    id,
    name,
    value,
    validate,
    onBlur,
    onChange,
    supportingText,
    disabled,
    getValue,
    getError,
    hasError = false,
    minChar,
    maxChar,
    noText,
    noNumeric,
    noborder,
    noSpecialChar,
    noSpecialCharRegex,
    errorMessage = 'This is a required field!',
    rangeBetween,
    ...props
}) => {
    const [err, setErr] = useState<boolean>(false);
    const [focus, setFocus] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>(errorMessage);

    useEffect(() => {
        setFocus(hasError);
        setErr(hasError || false);
        setErrMsg(errorMessage);
    }, [hasError, errorMessage]);

    const validateInput = (inputValue: string) => {
        if (disabled) {
            return;
        }
        if (inputValue.length === 0) {
            setErr(true);
            getError(false);
            setErrMsg("This is a required field!");
        } else if (rangeBetween) {
            if (parseInt(inputValue) < rangeBetween[0] || parseInt(inputValue) > rangeBetween[1]) {
                setErr(true);
                getError(false);
                setErrMsg(`Value should be between ${rangeBetween[0]}-${rangeBetween[1]} digit `);
            }
        } else if (minChar && inputValue.length < minChar) {
            setErr(true);
            getError(false);
            setErrMsg(`Please enter minimum ${minChar} characters.`);
        } else if (maxChar && inputValue.length > maxChar) {
            setErr(true);
            getError(false);
            setErrMsg(`You can enter maximum ${maxChar} characters.`);
        } else if (noNumeric && /\d/.test(inputValue)) {
            setErr(true);
            getError(false);
            setErrMsg(`Numeric characters are not allowed.`);
        } else if (noSpecialCharRegex && noSpecialCharRegex.test(inputValue)) {
            setErr(true);
            getError(false);
            setErrMsg(`Special characters are not allowed.`);
        } else if (noSpecialChar && /[^a-zA-Z0-9\s]/.test(inputValue)) {
            setErr(true);
            getError(false);
            setErrMsg(`Special characters are not allowed.`);
        } else if (noText && /[a-zA-Z]/.test(inputValue)) {
            setErr(true);
            getError(false);
            setErrMsg(`Alphabets are not allowed.`);
        } else {
            setErr(false);
            getError(true);
            setErrMsg("");
        }
    };

    const handleFocus = () => {
        if (disabled) {
            return;
        }
        setFocus(true);
    };

    const handleInputChange = (e: any) => {
        if (e.key === "Tab") {
            getValue(e.target.value);
        }

        if (onChange) {
            onChange(e);
        }
        if (err) {
            setErr(false);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        getValue(e.target.value);
        if (onBlur) {
            onBlur(e);
        }
        if (validate) {
            validateInput(e.target.value);
        }
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Tab') {
            getValue(e.target.value);
            handleBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
        }
    };

    return (
        <div className="flex flex-col w-full text-[14px]">
            {label && (
                <span className="flex py-[4.5px]">
                    <label
                        className={`text-[12px] ${err
                            ? "text-defaultRed"
                            : focus
                                ? "text-primary"
                                : "text-slatyGrey"
                            }`}
                    >
                        {label}
                    </label>
                    {validate && (
                        <span
                            className={`${disabled ? "text-slatyGrey" : "text-defaultRed"}`}
                        >
                            &nbsp;*
                        </span>
                    )}
                </span>
            )}

            <div
                className={`${label ? "mt-[0.5px]" : ""} ${!err
                    ? `flex w-full relative before:absolute before:bottom-0 before:left-0 before:block before:w-0 before:h-px ${noborder ? '' : 'before:bg-primary'}  before:transition-width before:duration-[800ms] before:ease-in ${!disabled && "hover:before:w-full"
                    }`
                    : "w-full"
                    }`}
            >
                <input
                    type="text"
                    className={`${className} placeholder:text-[14px] text-[14px] ${err && "text-defaultRed placeholder:text-defaultRed "} py-1 ${noborder ? '' : 'border-b'} outline-none transition duration-600 w-full h-full ${disabled ? "text-slatyGrey" : "text-darkCharcoal"
                        } ${err
                            ? "border-b-defaultRed"
                            : focus
                                ? "border-b-primary"
                                : "border-b-lightSilver"
                        }`}
                    ref={inputRef}
                    id={id}
                    name={name}
                    value={value}
                    disabled={disabled}
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    {...props}
                />
            </div>
            {!err && supportingText && (
                <span className="text-slatyGrey text-[12px] sm:text-[14px]">
                    {supportingText}
                </span>
            )}
            {err && (
                <span className="text-defaultRed text-[12px] sm:text-[14px]">
                    {errMsg}
                </span>
            )}
        </div>
    );
};

export default TextField;