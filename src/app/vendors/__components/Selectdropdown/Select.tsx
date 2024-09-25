import React, { useEffect, useRef, useState } from "react";
import { EditIconDropdown } from "./icons/EditIconDropdown";
import { DeleteIconDropdown } from "./icons/DeleteIconDropdown";
import ChevronDown from "./icons/ChevronDown";
import styles from "./selectdropdown.module.scss";
import { Avatar, Text, Button } from "pq-ap-lib";

interface Option {
  value: any;
  label: string;
  JsxElement?: any;
  isEnable?: any;
  liClass?: any;
  active?: boolean;
}

interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  options: Option[];
  type?: string;
  label?: string;
  className?: string;
  search?: boolean;
  validate?: boolean;
  defaultValue?: any;
  placeholder?: any;
  value?: any;
  avatar?: boolean;
  avatarName?: string;
  avatarImgUrl?: string;
  errorMessage?: string;
  hasError?: boolean;
  getValue: (value: any) => void;
  getError: (arg1: boolean) => void;
  supportingText?: string;
  errorClass?: string;
  addDynamicForm?: boolean;
  addDynamicForm_Label?: string;
  addDynamicForm_Placeholder?: string;
  addDynamicForm_Icons_Edit?: any;
  addDynamicForm_Icons_Delete?: any;
  addDynamicForm_MaxLength?: number;
  onChangeText?: (value: any, label: any) => void;
  onClickButton?: (value: any) => void;
  onDeleteButton?: (value: any) => void;
  disabled?: boolean;
  noborder?: boolean;
  hideIcon?: boolean;
  openTop?: boolean;
  isNone?: boolean;
  heightClass?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  options,
  getValue,
  type,
  label,
  className,
  placeholder = "Please select",
  search = false,
  validate,
  defaultValue,
  value,
  errorMessage = "This is a required field.",
  supportingText,
  hasError,
  getError,
  avatar,
  avatarName,
  avatarImgUrl,
  errorClass,
  addDynamicForm,
  addDynamicForm_Label,
  addDynamicForm_Placeholder,
  addDynamicForm_MaxLength,
  onClickButton,
  onChangeText,
  onDeleteButton,
  addDynamicForm_Icons_Edit,
  addDynamicForm_Icons_Delete,
  disabled,
  hideIcon,
  noborder,
  openTop = false,
  isNone = false,
  heightClass = 'max-h-60'
}) => {
  const updatedOptions = isNone
    ? [{ value: null, label: "None" }, ...options]
    : options;
  const [inputValue, setInputValue] = useState("");
  const [inputLabel, setInputLabel] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    defaultValue
      ? updatedOptions.find((option: any) => option.value === defaultValue) ?? null
      : null
  );
  const [editing, setEditing] = useState(false);
  const [textName, setTextName] = useState("");
  const [textValue, setTextValue] = useState("");
  const [textNameError, setTextNameError] = useState(false);
  const [textNameHasError, setTextNameHasError] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [inputFocusedIndex, setInputFocusedIndex] = useState<number>(0);
  const [accumulatedSearch, setAccumulatedSearch] = useState("");

  const filteredOptions = updatedOptions.filter((option: any) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    if (validate) {
      setErrMsg(errorMessage);
      hasError && setError(hasError);
      hasError && getError(false);

      if (defaultValue !== "" && defaultValue !== null && defaultValue !== 0) {
        setInputValue(defaultValue);
      } else {
        setInputValue("");
      }
    }
  }, [errorMessage, hasError, validate, defaultValue]);

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      const isdropdownClick = event.target.closest(".bottomAnimation");
      const selectDropdownRef =
        selectRef.current && selectRef.current.contains(event.target as Node);
      if (!selectDropdownRef && !isdropdownClick) {
        setIsOpen(false);
        setEditing(false);
      }
    };

    const handleMouseDown = (event: any) => {
      setTimeout(() => {
        handleOutsideClick(event);
      }, 0);
    };
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchValue("")
      setAccumulatedSearch("")
    }
  }, [isOpen])

  //   useEffect(() => {
  //     const handleOutsideClick = (event: any) => {
  //       const isdropdownClick = event.target.closest(".bottomAnimation");
  //       const selectDropdownRef = selectRef.current && selectRef.current.contains(event.target as Node)
  //       if (
  //         !selectDropdownRef &&
  //         !isdropdownClick
  //       ) {
  //         setIsOpen(false);
  //         setEditing(false);
  //       }
  //     };
  //     window.addEventListener("click", handleOutsideClick);
  //     return () => {
  //         window.removeEventListener("click", handleOutsideClick);
  //     };
  // }, []);

  const handleToggleOpen = () => {
    if (disabled) {
      return;
    }
    setIsOpen((prevOpen) => !prevOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue); // Update search input value
    setAccumulatedSearch(inputValue);

    if (validate && inputValue === "") {
      setError(true);
      setErrMsg("Please select a valid option.");
    } else {
      setError(false);
      setErrMsg("");
    }
  };

  const handleSelect = (value: any) => {
    if (value === null) {
      setSelectedOption(null);
      setInputValue("");
      setSearchValue("");
      setAccumulatedSearch("")
      setIsOpen(false);
      getValue(null);
      getError(true);
      setFocusedIndex(-1);
      setInputFocusedIndex(-1)
    } else {
      const selected = updatedOptions.find((option: any) => option.value === value);
      setSelectedOption(selected || null);
      setInputValue("");
      setSearchValue("");
      setAccumulatedSearch("")
      setIsOpen(false);
      getValue(value);
      getError(true);
      setFocusedIndex(-1);
      setInputFocusedIndex(-1)
    }
  };

  const handleBlur = () => {
    if (validate) {
      if (inputValue === "") {
        setError(true);
        setErrMsg("Please select a valid option.");
        getError(false);
      } else {
        setError(false);
        setErrMsg("");
        getError(true);
      }
    }
  };

  const handleSubmit = () => {
    textName.trim().length <= 0 && setTextNameHasError(true);
    inputLabel.trim().length <= 0 && setTextNameHasError(false);

    setErrMsg("");
    setError(false);

    if (
      textNameError &&
      (textName.trim().length > 0 || inputLabel !== "") &&
      onClickButton
    ) {
      onClickButton(editing);
      cleartextData();
    }
  };

  const cleartextData = () => {
    setInputLabel("");
    setTextValue("");
    setTextName("");
  };

  const handleDeleteValue = (value: any) => {
    if (onDeleteButton) {
      onDeleteButton(value);
    }
  };

  useEffect(() => {
    setIsOpen(editing);
  }, [editing]);

  const handleListItemKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, value: string, index: number) => {
    if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName == "LI") {
      handleSelect(value);
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowDown" && index < updatedOptions.length - 1) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    }
    else if (e.key === "Tab") {
      if (e.shiftKey) {
        // e.preventDefault();
        setIsOpen(false)
        setInputFocusedIndex(0)
        setFocusedIndex(-1);
      } else {
        setIsOpen(false)
        setFocusedIndex(-1);
      }
    }
    else if (e.key === "Escape") {
      setFocusedIndex(0);
      setIsOpen(false);
    } else if (e.key === " ") {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (focusedIndex !== -1 && options.length > 0) {
      const optionsElements = Array.from(
        selectRef.current!.querySelectorAll("li") ?? []
      );
      if (optionsElements[focusedIndex]) {
        optionsElements[focusedIndex].focus();
      }

    }
  }, [focusedIndex]);

  const handleKeyDown = (e: any) => {
    if (e.key === "ArrowUp" && options.length > 0) {
      e.preventDefault();
      setFocusedIndex(focusedIndex - 1);
    } else if (e.key === "ArrowDown" && options.length > 0) {
      e.preventDefault();
      setFocusedIndex(focusedIndex + 1);
    } else if (e.key === "Escape") {
      setFocusedIndex(0);
      setIsOpen(false);
    } else if (e.key === " ") {
      e.preventDefault();
    }
  };

  let newOptions: any = [];
  if (!!updatedOptions && updatedOptions.length > 0) {
    newOptions = [...newOptions, ...updatedOptions];
  }

  let newFilteredOptions: any = [];
  if (!!filteredOptions && filteredOptions.length > 0) {
    newFilteredOptions = [...newFilteredOptions, ...filteredOptions];
  }

  // let searchVal = "";
  const handleKeyEnter = (e: any) => {
    if (disabled) return;

    if ((e.key === "Enter" || (e.key === "ArrowDown" && focusedIndex == -1))) {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    }
    else if (/^[a-zA-Z0-9\s\-@&#._]$/.test(e.key) || e.key === " ") {
      e.preventDefault();
      // If the key is an alphanumeric character
      setIsOpen(true);
      const newSearchValue = accumulatedSearch + e.key;
      setAccumulatedSearch(newSearchValue);
      setSearchValue(newSearchValue);
    } else if (e.key === "Backspace") {
      const newSearchValue = accumulatedSearch.slice(0, -1);
      setAccumulatedSearch(newSearchValue);
      setSearchValue(newSearchValue);
    }
    else if (e.key === "Escape") {
      setFocusedIndex(0);
      setIsOpen(false);
      // setEditing(false);
      // selectRef.current?.focus();
    }
  }

  return (
    <>
      <div
        className={`${styles.customScrollbar
          } relative font-medium w-full flex-row outline-none
        ${noborder ? "" : "border-b"}
           ${disabled
            ? "border-lightSilver"
            : isOpen
              ? "border-primary"
              : inputValue
                ? "border-lightSilver"
                : error
                  ? "border-defaultRed"
                  : `border-lightSilver ${noborder ? "" : "after:block"
                  } absolute after:border-b after:mb-[-1px] after:border-primary after:scale-x-0 after:origin-left after:transition after:ease-in-out after:duration-1000 hover:after:scale-x-100`
          }
          ${className}`}
        ref={selectRef}
        onBlur={handleBlur}
      >
        {label && (
          <label
            className={`text-[12px] font-normal w-full ${isOpen
              ? "text-primary"
              : inputValue
                ? "text-slatyGrey"
                : error
                  ? "text-defaultRed"
                  : "text-slatyGrey"
              } ${disabled && "text-slatyGrey"}`}
            htmlFor={id}
            tabIndex={-1}
          >
            {label}

            {validate && (
              <span
                className={`${disabled ? "text-lightSilver" : "text-defaultRed"
                  }`}
              >
                &nbsp;*
              </span>
            )}
          </label>
        )}

        <div
          className={`focus:border-b focus:mb-[-1px] focus:border-primary outline-none flex flex-row items-center relative ${label ? "mt-[8px]" : ""
            } mb-0 w-full`}
          tabIndex={inputFocusedIndex}
          onKeyDown={handleKeyEnter}>
          <input
            id={id}
            onBlur={handleBlur}
            onClick={handleToggleOpen}
            // onChange={handleInputChange}
            readOnly={!search || !isOpen}
            disabled={disabled}
            placeholder={placeholder || "Please select"}
            tabIndex={search ? 0 : -1}
            value={
              search && isOpen
                ? searchValue // If in search mode and input is open, use searchValue
                : defaultValue !== null && defaultValue !== undefined
                  ? newOptions.find((option: any) => option.value === defaultValue)
                    ?.label ?? placeholder
                  : selectedOption
                    ? selectedOption.label
                    : defaultValue
                      ? newOptions.find((option: any) => option.value === defaultValue)
                        ?.label ?? ""
                      : inputValue && inputValue.length > 25
                        ? inputValue.substring(0, 20) + "..."
                        : inputValue
            }
            autoComplete="off"
            className={`flex-grow text-[14px] font-normal w-full outline-none bg-white
             ${disabled
                ? "text-slatyGrey cursor-default"
                : isOpen
                  ? "text-primary cursor-pointer placeholder-primary"
                  : selectedOption
                    ? "text-darkCharcoal placeholder-darkCharcoal"
                    : error
                      ? "placeholder:text-defaultRed text-defaultRed"
                      : defaultValue
                        ? "text-darkCharcoal placeholder-darkCharcoal cursor-pointer"
                        : "text-slatyGrey opacity-70 cursor-pointer"
              }`}
            style={{ background: "transparent" }}
            onKeyDown={(e) => handleKeyDown(e)}
          />
          {!hideIcon && (
            <div
              tabIndex={-1}
              onClick={handleToggleOpen}
              className={`text-[1.5rem] transition-transform ${disabled
                ? "text-slatyGrey cursor-default"
                : "text-darkCharcoal cursor-pointer"
                } ${error && " text-defaultRed"} ${isOpen ? "rotate-180 text-primary duration-400" : "duration-200"
                }`}
            >
              <ChevronDown />
            </div>
          )}
        </div>
        <ul
          className={`absolute !z-10 w-full bg-pureWhite mt-[${noborder ? 13 : 1
            }px] overflow-y-auto shadow-md transition-transform ${isOpen
              ? `${heightClass ? heightClass : "max-h-60"} translate-y-0 transition-opacity opacity-100 duration-500`
              : "max-h-0 translate-y-10 transition-opacity opacity-0 duration-500"
            } ${isOpen ? "ease-out" : ""} ${openTop ? "bottom-full" : "top-full"
            }`}
        >
          {newFilteredOptions.length === 0 ? (
            <span className="p-[10px] outline-none focus:bg-whiteSmoke text-[15px] hover:bg-whiteSmoke font-medium cursor-pointer flex flex-row items-center space-x-2 ">
              No matching data found.
            </span>
          ) : (
            <>
              {!!filteredOptions && filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className={`${option.value == selectedOption?.value
                    ? "bg-whiteSmoke"
                    : ""
                    } px-[10px] ${option.active ? "active" : ""
                    } py-[10px] outline-none focus:bg-whiteSmoke relative group/item text-[14px] hover:bg-whiteSmoke font-normal cursor-pointer flex flex-row items-center ${addDynamicForm ||
                      addDynamicForm_Icons_Edit ||
                      addDynamicForm_Icons_Delete
                      ? "justify-between"
                      : ""
                    } ${option && option.liClass
                      ? option.value === selectedOption?.value &&
                      `${option.liClass}`
                      : ""
                    }
                 ${option && option.isEnable !== false
                      ? ""
                      : "pointer-events-none opacity-60"
                    }
                 `}
                  onClick={() => {
                    if (option.value !== inputValue) {
                      handleSelect(option.value);
                    }
                  }}
                  onKeyDown={(e) =>
                    handleListItemKeyDown(e, option.value, index)
                  }
                  tabIndex={isOpen ? index : -1}
                  ref={(el) => {
                    if (index === focusedIndex) {
                      el?.focus();
                    }
                  }}
                >
                  {avatar && (
                    <div className="mr-2 flex-shrink-0 items-center text-[1.5rem] text-darkCharcoal">
                      <Avatar
                        variant="x-small"
                        name={avatarName}
                        imageUrl={avatarImgUrl}
                      />
                    </div>
                  )}
                  {option.label}&nbsp;{option.JsxElement}
                  {(addDynamicForm || addDynamicForm_Icons_Edit || addDynamicForm_Icons_Delete) && (
                    <a className="group/edit invisible hover:bg-slate-100 group-hover/item:visible">
                      <div className="flex flex-row right-0 mr-2 justify-end items-end">
                        {addDynamicForm_Icons_Edit && (
                          <div
                            className="p-[2px]"
                            onClick={(event) => {
                              event.stopPropagation();
                              setTextValue(option.value);
                              setInputLabel(option.label);
                              onChangeText && onChangeText(option.value, option.label);
                              setEditing(true);
                            }}
                          >
                            <EditIconDropdown />
                          </div>
                        )}

                        {addDynamicForm_Icons_Delete && (
                          <div
                            className="p-[2px]"
                            onClick={(event) => {
                              event.stopPropagation();
                              onChangeText && onChangeText(option.value, option.label);
                              handleDeleteValue(option.value);
                            }}
                          >
                            <DeleteIconDropdown />
                          </div>
                        )}
                      </div>
                    </a>
                  )}
                </li>
              ))}
            </>
          )}
          {(addDynamicForm || editing) && (
            <li className="w-full z-50 bg-pureWhite">
              <div className="bg-gray-100 flex flex-row items-center justify-between ">
                <div className="m-2 w-full">
                  <Text
                    // noSpecialChar
                    validate
                    label={addDynamicForm_Label}
                    placeholder={addDynamicForm_Placeholder}
                    className="w-full"
                    value={editing ? inputLabel : textName}
                    maxChar={addDynamicForm_MaxLength}
                    getValue={(e) => {
                      if (editing) {
                        setIsOpen(true);
                        setInputLabel(e);
                        onChangeText && onChangeText(textValue, e);
                      } else {
                        setTextName(e);
                        onChangeText && onChangeText(textValue, e);
                      }
                    }}
                    hasError={textNameHasError}
                    getError={(e) => setTextNameError(e)}
                  />
                </div>

                <div className="ml-3 mr-2">
                  <Button
                    type="button"
                    variant="btn-primary"
                    className="rounded-[4px] !h-auto"
                    onClick={handleSubmit}
                  >
                    {editing ? "Save" : "ADD"}
                  </Button>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>

      {!error && supportingText && (
        <span
          tabIndex={-1}
          className="text-slatyGrey text-[12px] sm:text-[14px] -mt-[20px]"
        >
          {supportingText}
        </span>
      )}

      {error && !inputValue && !disabled && (
        <span
          tabIndex={-1}
          className={`text-defaultRed text-[12px] sm:text-[14px] ${errorClass}`}>
          {errMsg}
        </span>
      )}
    </>
  );
};

export { Select };