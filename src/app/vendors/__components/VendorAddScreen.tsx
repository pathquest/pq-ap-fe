import InfoIcon from '@/assets/Icons/infoIcon'
import BackArrow from '@/assets/Icons/payments/BackArrow'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { aptermDropdown } from '@/store/features/master/aptermSlice'
import { GLAccountDropdown } from '@/store/features/master/glAccountSlice'
import { cityListDropdown, countryListDropdown, stateListDropdown } from '@/store/features/user/userSlice'
import { accountClassification, saveVendor, vendorGetById } from '@/store/features/vendor/vendorSlice'
import { useSession } from 'next-auth/react'
import { BasicTooltip, Button, CheckBox, Email, Select, Text, Toast, Typography, Uploader } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface DrawerProps {
    isOpen: boolean
    onClose: (value: string) => void
    EditId: number
}

const tabs = [
    { id: 'generalDetails', label: 'GENERAL DETAILS' },
    { id: 'contactDetails', label: 'CONTACT DETAILS' },
    { id: 'paymentDetails', label: 'PAYMENT DETAILS' }
]

const accountTypeOptions = [
    { label: 'Savings', value: '1' },
    { label: 'Checking', value: '2' }
]

const titleOptions = [
    { label: 'Mr', value: 'mr' },
    { label: 'Mrs', value: 'mrs' }
]

const VendorAddScreen: React.FC<DrawerProps> = ({ isOpen, EditId, onClose }) => {
    // For Dynamic Company Id & AccountingTool
    const { data: session } = useSession()
    const CompanyId = Number(session?.user?.CompanyId)
    const accountingTool = session?.user?.AccountingTool
    const dispatch = useAppDispatch()

    const [selectedTab, setSelectedTab] = useState<string>('generalDetails')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [recordNumber, setRecordNumber] = useState<string>('')

    // General Details
    const [vendorCode, setVendorCode] = useState<string>('')
    const [vendorCodeError, setVendorCodeError] = useState<boolean>(false)

    const [vendorName, setVendorName] = useState<string>('')
    const [vendorNameError, setVendorNameError] = useState<boolean>(false)

    const [displayName, setDisplayName] = useState<string>('')
    const [displayNameError, setDisplayNameError] = useState<boolean>(false)

    const [nameOnCheck, setNameOnCheck] = useState<string>('')
    const [nameOnCheckError, setNameOnCheckError] = useState<boolean>(false)

    const [titleId, setTitleId] = useState<string>('')

    const [firstName, setFirstName] = useState<string>('')
    const [firstNameError, setFirstNameError] = useState<boolean>(false)

    const [middleName, setMiddleName] = useState<string>('')
    const [middleNameError, setMiddleNameError] = useState<boolean>(false)

    const [lastName, setLastName] = useState<string>('')
    const [lastNameError, setLastNameError] = useState<boolean>(false)

    const [supplierId, setSupplierId] = useState<string>('')
    const [selectedFile, setSelectedFile] = useState<any[]>([])

    const [billingAddress, setBillingAddress] = useState<string>('')
    const [billingState, setBillingState] = useState<any>([])
    const [billingCity, setBillingCity] = useState<any>([])
    const [billingCountryId, setBillingCountryId] = useState<string>('')
    const [billingStateId, setBillingStateId] = useState<string>('')
    const [billingCityId, setBillingCityId] = useState<string>('')
    const [billingPostalCode, setBillingPostalCode] = useState<string>('')

    const [isShippingCheck, setIsShippingCheck] = useState<boolean>(false)
    const [shippingAddress, setShippingAddress] = useState<string>('')
    const [shippingState, setShippingState] = useState<any>([])
    const [shippingCity, setShippingCity] = useState<any>([])
    const [shippingCountryId, setShippingCountryId] = useState<string>('')
    const [shippingStateId, setShippingStateId] = useState<string>('')
    const [shippingCityId, setShippingCityId] = useState<string>('')
    const [shippingPostalCode, setShippingPostalCode] = useState<string>('')

    // Contact Details
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [mobileNumber, setMobileNumber] = useState<string>('')
    const [fax, setFax] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [websiteUrl, setWebsiteUrl] = useState<string>('')

    // Payment Details
    const [termOption, setTermOption] = useState([])
    const [termId, setTermId] = useState<string>('')

    const [paymentMethodOption, setPaymentMethodOption] = useState([])
    const [paymentMethodId, setPaymentMethodId] = useState<any>('')

    const [accountClassificationOption, setAccountClassificationOption] = useState([])
    const [accountClassificationId, setAccountClassificationId] = useState<string>('')

    const [glAccountOption, setGlAccountOption] = useState([])
    const [glAccountId, setGlAccountId] = useState<string>('')

    const [isPaymentEnableCheck, setIsPaymentEnableCheck] = useState<boolean>(false)
    const [isAchCheck, setIsAchCheck] = useState<boolean>(false)
    const [isVcardCheck, setIsVcardCheck] = useState<boolean>(false)
    const [isCheckChecked, setIsCheckChecked] = useState<boolean>(false)

    const [accountNumber, setAccountNumber] = useState<string>('')
    const [accountNumberError, setAccountNumberError] = useState<boolean>(false)

    const [routingNumber, setRoutingNumber] = useState<string>('')
    const [routingNumberError, setRoutingNumberError] = useState<boolean>(false)

    const [accountType, setAccountType] = useState<string>('')
    const [accountTypeError, setAccountTypeError] = useState<boolean>(false)

    const [virtualCardEmail, setVirualCardEmail] = useState<string>('')
    const [virtualCardEmailError, setVirualCardEmailError] = useState<boolean>(false)

    const [isRequirePinCheck, setIsRequirePinCheck] = useState<boolean>(false)

    const [address, setAddress] = useState<string>('')
    const [addressError, setAddressError] = useState<boolean>(false)

    const [checkCountry, setCheckCountry] = useState([])
    const [checkCountryId, setCheckCountryId] = useState<number>(0)
    const [checkCountryError, setCheckCountryError] = useState<boolean>(false)

    const [checkState, setCheckState] = useState([])
    const [checkStateId, setCheckStateId] = useState<number>(0)
    const [checkStateError, setCheckStateError] = useState<boolean>(false)

    const [checkCity, setCheckCity] = useState([])
    const [checkCityId, setCheckCityId] = useState<number>(0)
    const [checkCityError, setCheckCityError] = useState<boolean>(false)

    const [postalCode, setPostalCode] = useState<string>('')
    const [postalCodeError, setPostalCodeError] = useState<boolean>(false)

    const [achVendorPaymentId, setAchVendorPaymentId] = useState<number>(0)
    const [vcnVendorPaymentId, setVcnVendorPaymentId] = useState<number>(0)
    const [checkVendorPaymentId, setCheckVendorPaymentId] = useState<number>(0)

    const setErrorTrue = () => {
        // General Details
        setVendorCodeError(true);
        setVendorNameError(true);
        setDisplayNameError(true);
        setNameOnCheckError(true);
        setFirstNameError(true);
        setLastNameError(true);
        setMiddleNameError(true);

        // Contact Details
        setAccountNumberError(true);
        setRoutingNumberError(true);
        setAccountTypeError(true);
        setVirualCardEmailError(true);
        setAddressError(true);
        setCheckCountryError(true);
        setCheckStateError(true);
        setCheckCityError(true);
        setPostalCodeError(true);
    };

    const initialData = () => {
        // General Details
        setVendorCode('');
        setVendorName('');
        setDisplayName('');
        setNameOnCheck('');
        setTitleId('');
        setFirstName('');
        setMiddleName('');
        setLastName('');

        setSupplierId('')
        setSelectedFile([]);

        setBillingAddress('');
        setBillingState([]);
        setBillingCity([]);
        setBillingCountryId('');
        setBillingStateId('');
        setBillingCityId('');
        setBillingPostalCode('');

        setIsShippingCheck(false);
        setShippingAddress('');
        setShippingCountryId('');
        setShippingState([]);
        setShippingStateId('');
        setShippingCity([]);
        setShippingCityId('');
        setShippingPostalCode('');

        // Contact Details
        setPhoneNumber('');
        setMobileNumber('');
        setFax('');
        setEmail('');
        setWebsiteUrl('');

        // Payment Details
        setTermOption([]);
        setTermId('');
        setPaymentMethodOption([]);
        setPaymentMethodId(0);
        setAccountClassificationOption([]);
        setAccountClassificationId('');
        setGlAccountOption([]);
        setGlAccountId('');
        setIsPaymentEnableCheck(false);
        setIsAchCheck(false);
        setIsVcardCheck(false);
        setIsCheckChecked(false);
        setAccountNumber('');
        setRoutingNumber('');
        setAccountType('');
        setVirualCardEmail('');
        setIsRequirePinCheck(false);
        setAddress('');
        setCheckCountry([]);
        setCheckCountryId(0);
        setCheckState([]);
        setCheckStateId(0);
        setCheckCity([]);
        setCheckCityId(0);
        setPostalCode('');
        setAchVendorPaymentId(0)
        setVcnVendorPaymentId(0)
        setCheckVendorPaymentId(0)
        setIsLoading(false)

        // Reset Error States
        setVendorCodeError(false);
        setVendorNameError(false);
        setDisplayNameError(false);
        setNameOnCheckError(false);
        setFirstNameError(false);
        setMiddleNameError(false);
        setLastNameError(false);
        setAccountNumberError(false);
        setRoutingNumberError(false);
        setAccountTypeError(false);
        setVirualCardEmailError(false);
        setAddressError(false);
        setCheckCountryError(false);
        setCheckStateError(false);
        setCheckCityError(false);
        setPostalCodeError(false);
    };

    const clearAllData = async (type: string) => {
        await setErrorTrue()
        await initialData()
        onClose(type)
    }

    //Country List API
    const getCountryList = () => {
        performApiAction(dispatch, countryListDropdown, null, (responseData: any) => {
            const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
            setCheckCountry(mappedList)
        })
    }

    //State List API
    const getStateList = async (countryId: number, addressType: string) => {
        const params = {
            CountryId: countryId,
        }
        performApiAction(dispatch, stateListDropdown, params, (responseData: any) => {
            const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))

            if (addressType === 'billing') {
                setBillingState(mappedList)
            } else if (addressType === 'shipping') {
                setShippingState(mappedList)
            } else if (addressType === 'check') {
                setCheckState(mappedList)
            }
        })
    }

    //City List API
    const getCityList = async (stateId: number, addressType: string) => {
        const params = {
            StateId: stateId,
        }
        performApiAction(dispatch, cityListDropdown, params, (responseData: any) => {
            const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))

            if (addressType === 'billing') {
                setBillingCity(mappedList)
            } else if (addressType === 'shipping') {
                setShippingCity(mappedList)
            } else if (addressType === 'check') {
                setCheckCity(mappedList)
            }
        })
    }

    //GL Account Dropdown List API
    const getGLAccountDropdown = () => {
        const params = {
            CompanyId: CompanyId
        }
        performApiAction(dispatch, GLAccountDropdown, params, (responseData: any) => {
            const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
            setGlAccountOption(mappedList)
        })
    }

    //Term Dropdown List API
    const getTermDropdown = () => {
        const params = {
            CompanyId: CompanyId,
        }
        performApiAction(dispatch, aptermDropdown, params, (responseData: any) => {
            const mappedList = responseData.map((item: any) => ({ value: String(item.Id), label: item.Name }))
            setTermOption(mappedList)
        })
    }

    //Vendor Get Data API
    const getVendorById = () => {
        const params = {
            CompanyId: CompanyId,
            Id: EditId
        }

        performApiAction(dispatch, vendorGetById, params, (responseData: any) => {
            const { RecordNo, VendorId, Name, Email, DisplayName, FirstName, LastName, PhoneNumber, CheckName, Mobile, AccountClassification, GLAccount, SupplierId, Country, State, City, Zip, Address, Attachment, Term, VendorPayments, PreferredPaymentMethod, PaymentEnablement } = responseData
            setRecordNumber(RecordNo || "")
            setVendorCode(VendorId || '');
            setVendorName(Name || '');
            setNameOnCheck(CheckName || "");
            setDisplayName(DisplayName || "");
            setFirstName(FirstName || '');
            setLastName(LastName || '');
            setSelectedFile(Attachment || []);
            setSupplierId(SupplierId || '')
            setBillingAddress(Address || '');
            setBillingCountryId(Country || '');
            setBillingStateId(State || '');
            setBillingCityId(City || '');
            setBillingPostalCode(Zip || '');

            // Contact Details
            setPhoneNumber(PhoneNumber || '');
            setMobileNumber(Mobile || '');
            setEmail(Email || '');

            // Payment Details
            setTermId(Term || '');
            setPaymentMethodId(PreferredPaymentMethod || '');
            setAccountClassificationId(AccountClassification || '');
            setGlAccountId(GLAccount || '');
            setIsPaymentEnableCheck(PaymentEnablement || false)

            // Virtual Card 5
            const virtualCard = VendorPayments.find((payment: any) => payment.PaymentMethodType === 5 && payment.Status === true);
            if (virtualCard) {
                const { Email, RequirePin, VendorPaymentId, Status } = virtualCard;
                setVirualCardEmail(Email || '');
                setIsRequirePinCheck(RequirePin || false);
                setVcnVendorPaymentId(VendorPaymentId || 0);
                setIsVcardCheck(Status || false);
            }

            // ACH 4
            const achPayment = VendorPayments.find((payment: any) => payment.PaymentMethodType === 4 && payment.Status === true);
            if (achPayment) {
                const { AccountingNumber, RoutingNumber, AccountingType, VendorPaymentId, Status } = achPayment;
                setAccountNumber(AccountingNumber || '');
                setRoutingNumber(RoutingNumber || '');
                setAccountType(AccountingType || '');
                setAchVendorPaymentId(VendorPaymentId || 0);
                setIsAchCheck(Status || false);
            }

            // Check 1
            const checkPayment = VendorPayments.find((payment: any) => payment.PaymentMethodType === 1 && payment.Status === true);
            if (checkPayment) {
                const { Check_Address, Check_City, Check_State, Check_Country, Check_PostalCode, VendorPaymentId } = checkPayment;
                setCheckVendorPaymentId(VendorPaymentId || 0);
                setAddress(Check_Address || '');
                setCheckCountryId(Check_Country || 0);
                setCheckStateId(Check_State || 0);
                setCheckCityId(Check_City || 0);
                setPostalCode(Check_PostalCode || '');
                setIsCheckChecked(checkPayment.Status || false);
            }
        })
    }

    // Account Classification Dropdown API
    const getAccountClassification = () => {
        performApiAction(dispatch, accountClassification, null, (responseData: any) => {
            const mappedList = responseData.map((item: any) => ({ ...item, value: String(item.value) }))
            setAccountClassificationOption(mappedList)
        })
    }

    // Payment Method Dropdown API
    const getAllPaymentMethods = () => {
        performApiAction(dispatch, getPaymentMethods, null, (responseData: any) => {
            const updatedPaymentMethods = responseData.map((method: any) => {
                if (method.value === "2" || method.value === "3") {
                    // Cash and Record Transfer
                    return { ...method, isEnable: true };
                } else {
                    // Check, ACH/Bank File, and Virtual Card
                    return { ...method, isEnable: false };
                }
            });
            setPaymentMethodOption(updatedPaymentMethods);
        });
    }

    useEffect(() => {
        if (isOpen) {
            getCountryList()
            getAccountClassification()
            getGLAccountDropdown()
            getTermDropdown()
            getAllPaymentMethods()
            if (EditId > 0) {
                getVendorById()
            }
        }
    }, [isOpen, EditId])

    useEffect(() => {
        const handleStateAndCityList = () => {
            if (Number(billingCountryId) > 0) {
                getStateList(Number(billingCountryId), "billing");
            }
            if (Number(billingStateId) > 0) {
                getCityList(Number(billingStateId), "billing");
            }
            if (Number(shippingCountryId) > 0) {
                getStateList(Number(shippingCountryId), "shipping");
            }
            if (Number(shippingStateId) > 0) {
                getCityList(Number(shippingStateId), "shipping");
            }
            if (checkCountryId > 0) {
                getStateList(checkCountryId, "check");
            }
            if (checkStateId > 0) {
                getCityList(checkStateId, "check");
            }
        };

        handleStateAndCityList();
    }, [billingCountryId, billingStateId, shippingCountryId, shippingStateId, checkCountryId, checkStateId]);

    const handleModalClose = (type: string) => {
        onClose(type)
    }

    const onFileUpload = (files: any) => {
        let totalFileSize = 0;
        const maxFileSize = 50 * 1024 * 1024; // 50 MB
        const validFiles = files.filter((file: any) => {
            const fileType = file.type;
            const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

            if (validTypes.includes(fileType) && file.size <= maxFileSize) {
                totalFileSize += file.size;
                return true;
            } else {
                if (!validTypes.includes(fileType)) {
                    Toast.error(`Invalid file type for ${file.name}. Only PDF, PNG, JPG, JPEG formats are allowed.`);
                } else if (file.size > maxFileSize) {
                    Toast.error(`File size exceeds the maximum limit of 50 MB for ${file.name}.`);
                }
                return false;
            }
        });

        if (validFiles.length > 0 && validFiles.length <= 5 && totalFileSize <= maxFileSize) {
            setSelectedFile([...validFiles]);
        } else if (totalFileSize > maxFileSize) {
            Toast.error(`Total file size exceeds the maximum limit of 50 MB.`);
        }
    };

    const handelShippingAddress = (e: any) => {
        if (e.target.checked) {
            setIsShippingCheck(true)
            setShippingAddress(billingAddress || "");
            setShippingCountryId(billingCountryId || '');
            setShippingState(billingState || []);
            setShippingStateId(billingStateId || '');
            setShippingCity(billingCity || []);
            setShippingCityId(billingCityId || '');
            setShippingPostalCode(billingPostalCode || '');
        } else {
            setIsShippingCheck(false)
            setShippingAddress('');
            setShippingCountryId('');
            setShippingState([]);
            setShippingStateId('');
            setShippingCity([]);
            setShippingCityId('');
            setShippingPostalCode('');
        }
    }

    const isGeneralDetailsValid = () => {
        const vendorCodeValid = vendorCode.trim().length > 0;
        const vendorNameValid = vendorName.trim().length > 0;
        const displayNameValid = displayName.trim().length > 2;
        const nameOnCheckValid = nameOnCheck.trim().length > 2;
        const firstNameValid = firstName.trim().length > 2;
        const middleNameValid = middleName !== "" ? middleName.trim().length > 2 : true;
        const lastNameValid = lastName.trim().length > 2;

        setVendorCodeError(!vendorCodeValid);
        setVendorNameError(!vendorNameValid);
        setDisplayNameError(!displayNameValid);
        setNameOnCheckError(!nameOnCheckValid);
        setFirstNameError(!firstNameValid);
        setMiddleNameError(!middleNameValid);
        setLastNameError(!lastNameValid);

        return (vendorCodeValid && vendorNameValid && displayNameValid && nameOnCheckValid && firstNameValid && lastNameValid && middleNameValid);
    };

    const handleNext = () => {
        if (selectedTab === "generalDetails") {
            if (isGeneralDetailsValid()) {
                setSelectedTab("contactDetails");
            }
        } else {
            setSelectedTab("paymentDetails");
        }
    };

    const handleTabClick = (tabId: string) => {
        if (selectedTab === "generalDetails") {
            if (isGeneralDetailsValid()) {
                setSelectedTab(tabId);
            }
        } else {
            setSelectedTab(tabId);
        }
    };

    const isAchValid = () => {
        const accountNumberValid = accountNumber.trim().length > 0;
        const routingNumberValid = routingNumber.trim().length > 0;
        const accountTypeValid = accountType.toString().trim().length > 0;

        setAccountNumberError(!accountNumberValid);
        setRoutingNumberError(!routingNumberValid);
        setAccountTypeError(!accountTypeValid);

        return accountNumberValid && routingNumberValid && accountTypeValid;
    };

    const isVcnValid = () => {
        const emailValid = virtualCardEmail.trim().length > 0;
        setVirualCardEmailError(!emailValid);
        return emailValid;
    };

    const isCheckValid = () => {
        const addressValid = address.trim().length > 0;
        const checkCountryValid = checkCountryId !== 0;
        const checkStateValid = checkStateId !== 0;
        const checkCityValid = checkCityId !== 0;
        const postalCodeValid = postalCode.trim().length > 0;

        setAddressError(!addressValid);
        setCheckCountryError(!checkCountryValid);
        setCheckStateError(!checkStateValid);
        setCheckCityError(!checkCityValid);
        setPostalCodeError(!postalCodeValid);

        return (addressValid && checkCountryValid && checkStateValid && checkCityValid && postalCodeValid);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setIsLoading(true)

        let isFormValid = true;

        if (isAchCheck && !isAchValid()) {
            isFormValid = false;
        }
        if (isVcardCheck && !isVcnValid()) {
            isFormValid = false;
        }
        if (isCheckChecked && !isCheckValid()) {
            isFormValid = false;
        }

        if (!isFormValid) {
            setIsLoading(false);
            return;
        }

        const vendorPaymentsData = [
            {
                VendorPaymentId: vcnVendorPaymentId ?? 0,
                Email: virtualCardEmail.trim() ?? "",
                RequirePin: isRequirePinCheck ?? false,
                PaymentMethodType: 5,
                Status: isVcardCheck
            },
            {
                VendorPaymentId: achVendorPaymentId ?? 0,
                AccountingNumber: accountNumber.trim() ?? "",
                AccountingType: Number(accountType) ?? 0,
                RoutingNumber: routingNumber.trim() ?? "",
                PaymentMethodType: 4,
                Status: isAchCheck
            },
            {
                VendorPaymentId: checkVendorPaymentId ?? 0,
                Check_Address: address.trim() ?? "",
                Check_City: Number(checkCityId) ?? 0,
                Check_State: Number(checkStateId) ?? 0,
                Check_Country: Number(checkCountryId) ?? 0,
                Check_PostalCode: postalCode.trim() ?? "",
                PaymentMethodType: 1,
                Status: isCheckChecked
            }
        ]

        const filteredVendorPayments = vendorPaymentsData.filter(payment => (payment.Status === true && payment.VendorPaymentId == 0) || payment.VendorPaymentId > 0);

        const params = {
            Id: EditId ?? 0,
            VendorId: vendorCode.trim() ?? "",
            RecordNo: recordNumber ?? "",
            CompanyId: CompanyId ?? 0,
            Name: vendorName.trim() ?? "",
            CheckName: nameOnCheck.trim() ?? "",
            DisplayName: displayName.trim() ?? "",
            FirstName: firstName.trim() ?? "",
            LastName: lastName.trim() ?? "",
            SupplierId: supplierId || "",
            Email: email.trim() ?? "",
            PhoneNumber: phoneNumber.trim() ?? "",
            AccountingTool: accountingTool ?? 0,
            Address: billingAddress.trim() ?? "",
            Country: Number(billingCountryId) ?? null,
            State: Number(billingStateId) ?? null,
            City: Number(billingCityId) ?? null,
            Zip: billingPostalCode.trim() ?? "",
            Notes: "",
            Attachment: null,
            Term: termId ?? null,
            AccountType: "",
            AccountClassification: accountClassificationId + "" ?? "",
            GLAccount: glAccountId + "" ?? "",
            PaymentMethod: "",
            CardNumber: "",
            ValidTill: "",
            CVV: "",
            PhoneCountryCode: "",
            PhoneAreaCode: "",
            Token: null,
            status: 1,
            PreferredPaymentMethod: Number(paymentMethodId) ?? 0,
            PaymentEnablement: isPaymentEnableCheck ?? false,
            VendorPayments: filteredVendorPayments
        }

        performApiAction(dispatch, saveVendor, params, (responseData: any) => {
            if (responseData.ResponseStatus === 'Success') {
                Toast.success(`Vendor ${EditId ? 'updated' : 'added'} successfully.`)
                clearAllData("Save")
                setIsLoading(false)
            }
            else {
                Toast.error('Error', `${responseData.ErrorData.Error}`)
                setIsLoading(false)
            }
        }, () => {
            // ErrorData
            setIsLoading(false)
        })
    }

    const handleAchChanged = (e: any) => {
        updatePaymentMethodOptions();
        if (e.target.checked) {
            setIsAchCheck(true)
        } else {
            setIsAchCheck(false)
            setAccountNumber('');
            setAccountNumberError(false)
            setRoutingNumber('');
            setRoutingNumberError(false)
            setAccountType('');
            setAccountTypeError(false)
        }
    }

    const handleVcnChanged = (e: any) => {
        updatePaymentMethodOptions();
        if (e.target.checked) {
            setIsVcardCheck(true)
        } else {
            setIsVcardCheck(false)
            setVirualCardEmail('');
            setVirualCardEmailError(false)
            setIsRequirePinCheck(false);
        }
    }

    const handleCheckChanged = (e: any) => {
        updatePaymentMethodOptions();
        if (e.target.checked) {
            setIsCheckChecked(true)
        } else {
            setIsCheckChecked(false)
            setAddress('');
            setCheckCountryId(0);
            setCheckStateId(0);
            setCheckCityId(0);
            setPostalCode('');
        }
    }

    const updatePaymentMethodOptions = () => {
        setPaymentMethodOption((prevOptions: any) =>
            prevOptions.map((option: any) => {
                if (option.value === "1") return { ...option, isEnable: isCheckChecked };
                if (option.value === "4") return { ...option, isEnable: isAchCheck };
                if (option.value === "5") return { ...option, isEnable: isVcardCheck };
                return option;
            })
        );
    };

    useEffect(() => {
        const currentMethod: any = paymentMethodOption.find((option: any) => option.value === paymentMethodId);
        if (currentMethod && !currentMethod.isEnable) {
            setPaymentMethodId(0);
        }
    }, [paymentMethodOption, paymentMethodId]);

    useEffect(() => {
        updatePaymentMethodOptions();
    }, [isCheckChecked, isAchCheck, isVcardCheck]);

    return (
        <div className={`w-full h-full`}>
            <div className='sticky top-0 z-[6] px-5 flex h-[66px] w-full items-center justify-between bg-whiteSmoke'>
                <div className='cursor-pointer flex items-center'>
                    <span onClick={() => handleModalClose("")}>
                        <BackArrow />
                    </span>
                    <div className='flex items-center justify-center ml-2.5'>
                        {tabs.map((tab, index) => (
                            <label
                                key={tab.id}
                                className={`tracking-[0.02em] whitespace-nowrap font-proxima px-5 ${tab.id == selectedTab ? 'pointer-events-none cursor-default text-primary text-base font-semibold' : 'text-slatyGrey text-sm cursor-pointer'} ${index !== tabs.length - 1 ? 'border-r border-lightSilver' : ''}`}
                                onClick={() => handleTabClick(tab.id)}>
                                {tab.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className='h-[calc(100vh-203px)] w-5/6 overflow-hidden'>
                {selectedTab === "generalDetails" &&
                    <div className='w-full h-full overflow-auto p-5'>
                        <div className='w-full grid grid-cols-3 gap-5'>
                            <Text
                                label='Vendor Code'
                                id='vendorCode'
                                name='vendorCode'
                                placeholder='Please enter vendor code'
                                validate
                                minChar={2}
                                disabled={EditId > 0}
                                maxLength={10}
                                hasError={vendorCodeError}
                                value={vendorCode}
                                getValue={(value) => {
                                    setVendorCode(value)
                                    setVendorCodeError(false)
                                }}
                                getError={() => { }}
                            />
                            <Text
                                label='Vendor Name'
                                id='vendorName'
                                name='vendorName'
                                placeholder='Please enter vendor name'
                                value={vendorName}
                                validate
                                minChar={3}
                                maxLength={50}
                                hasError={vendorNameError}
                                getValue={(value) => {
                                    setVendorName(value)
                                    setVendorNameError(false)
                                }}
                                getError={() => { }}
                            />
                            <Text
                                label='Display Name'
                                id='displayName'
                                name='displayName'
                                placeholder='Please enter display name'
                                value={displayName}
                                validate
                                minChar={3}
                                maxLength={50}
                                hasError={displayNameError}
                                getValue={(value) => {
                                    /^[a-zA-Z ]*$/.test(value) && setDisplayName(value)
                                    setDisplayNameError(false)
                                }}
                                getError={() => { }}
                            />
                            <Text
                                label='Name on Check'
                                id='nameOnCheck'
                                name='nameOnCheck'
                                placeholder='Please enter name on check'
                                value={nameOnCheck}
                                validate
                                minChar={3}
                                maxLength={50}
                                hasError={nameOnCheckError}
                                getValue={(value) => {
                                    /^[a-zA-Z ]*$/.test(value) && setNameOnCheck(value)
                                    setNameOnCheckError(false)
                                }}
                                getError={() => { }}
                            />
                            <div className='col-span-2'>
                                <Uploader variant="small" maxFileCount={5} multiSelect getValue={(value) => onFileUpload(value)} />
                            </div>
                        </div>
                        <div className='w-full mt-5'>
                            <Typography type='h5' className='!font-bold !text-darkCharcoal !tracking-[0.02em] mt-5 mb-[15px]'>
                                Vendor Full Name
                            </Typography>
                            <div className='w-full grid grid-cols-3 gap-5'>
                                <div className='flex gap-5'>
                                    <div className='!w-24' >
                                        <Select
                                            id='title'
                                            name='title'
                                            label='Title'
                                            placeholder={"Select"}
                                            options={titleOptions}
                                            defaultValue={titleId + ""}
                                            getValue={(value) => setTitleId(value)}
                                            getError={() => { }}
                                        />
                                    </div>
                                    <Text
                                        label='First Name'
                                        id='firstName'
                                        name='firstName'
                                        validate
                                        minChar={3}
                                        maxLength={25}
                                        hasError={firstNameError}
                                        placeholder='Please enter first name'
                                        value={firstName}
                                        getValue={(value) => {
                                            /^[a-zA-Z ]*$/.test(value) && setFirstName(value)
                                            setFirstNameError(false)
                                        }}
                                        getError={() => { }}
                                    />
                                </div>
                                <Text
                                    className='pt-[7px]'
                                    label='Middle Name'
                                    id='middleName'
                                    name='middleName'
                                    minChar={3}
                                    maxLength={25}
                                    placeholder='Please enter middle name'
                                    value={middleName}
                                    hasError={middleNameError}
                                    errorMessage='Please enter minimum 3 characters.'
                                    getValue={(value) => {
                                        /^[a-zA-Z ]*$/.test(value) && setMiddleName(value)
                                        value !== "" && setMiddleNameError(false)
                                    }}
                                    getError={() => { }}
                                />
                                <Text
                                    label='Last Name'
                                    id='lastName'
                                    name='lastName'
                                    validate
                                    minChar={3}
                                    maxLength={25}
                                    hasError={lastNameError}
                                    placeholder='Please enter last name'
                                    value={lastName}
                                    getValue={(value) => {
                                        /^[a-zA-Z ]*$/.test(value) && setLastName(value)
                                        setLastNameError(false)
                                    }}
                                    getError={() => { }}
                                />
                            </div>
                        </div>
                        <div className='w-full mt-5'>
                            <Typography type='h5' className='!font-bold !text-darkCharcoal !tracking-[0.02em] mt-5 mb-[15px]'>
                                Billing Address
                            </Typography>
                            <div className='w-full grid grid-cols-3 gap-5'>
                                <Text
                                    label='Address'
                                    id='billingAddress'
                                    name='billingAddress'
                                    placeholder='Please enter address'
                                    minChar={3}
                                    maxLength={100}
                                    value={billingAddress}
                                    getValue={(value) => { /^[a-zA-Z0-9.,\- ]*$/.test(value) && setBillingAddress(value) }}
                                    getError={() => { }}
                                />
                                <div>
                                    <Select
                                        id='billingCountry'
                                        name='billingCountry'
                                        label='Country'
                                        options={checkCountry}
                                        defaultValue={billingCountryId + ""}
                                        getValue={(value) => {
                                            setBillingCountryId(value)
                                        }}
                                        getError={() => { }}
                                    />
                                </div>
                                <div>
                                    <Select
                                        id='billingState'
                                        name='billingState'
                                        label='State'
                                        options={billingState}
                                        defaultValue={billingStateId + ""}
                                        getValue={(value) => {
                                            setBillingStateId(value)
                                        }}
                                        getError={() => { }}
                                    />
                                </div>
                                <div>
                                    <Select
                                        id='billingCity'
                                        name='billingCity'
                                        label='City'
                                        options={billingCity}
                                        defaultValue={billingCityId + ""}
                                        getValue={(value) => setBillingCityId(value)}
                                        getError={() => { }}
                                    />
                                </div>
                                <Text
                                    label='Postal Code'
                                    id='billingPostalCode'
                                    name='billingPostalCode'
                                    placeholder='Please enter postal code'
                                    minChar={5}
                                    maxLength={10}
                                    value={billingPostalCode}
                                    getValue={(value) => {
                                        /^[0-9 ]*$/.test(value) && setBillingPostalCode(value)
                                    }}
                                    getError={() => { }}
                                    className='!pt-[7px]'
                                />
                            </div>
                        </div>
                        <div className='w-full mt-5'>
                            <div className='flex items-center gap-10 mt-5 mb-[15px]'>
                                <Typography type='h5' className='!font-bold !text-darkCharcoal !tracking-[0.02em]'>
                                    Shipping Address
                                </Typography>
                                <CheckBox
                                    className='!font-proxima !text-darkCharcoal !text-sm !tracking-wide'
                                    id='sameAsBillingAddress'
                                    checked={isShippingCheck}
                                    onChange={handelShippingAddress}
                                    label='Same as Billing Address'
                                />
                            </div>
                            <div className={`${isShippingCheck ? "hidden" : "block"} w-full grid grid-cols-3 gap-5`}>
                                <Text
                                    label='Address'
                                    id='shippingAddress'
                                    name='shippingAddress'
                                    placeholder='Please enter address'
                                    minChar={3}
                                    maxLength={100}
                                    value={shippingAddress}
                                    getValue={(value) => { /^[a-zA-Z0-9.,\- ]*$/.test(value) && setShippingAddress(value) }}
                                    getError={() => { }}
                                />
                                <div>
                                    <Select
                                        id='shippingCountry'
                                        name='shippingCountry'
                                        label='Country'
                                        options={checkCountry}
                                        defaultValue={shippingCountryId + ""}
                                        getValue={(value) => {
                                            setShippingCountryId(value)
                                        }}
                                        getError={() => { }}
                                    />
                                </div>
                                <div>
                                    <Select
                                        id='shippingState'
                                        name='shippingState'
                                        label='State'
                                        options={shippingState}
                                        defaultValue={shippingStateId + ""}
                                        getValue={(value) => {
                                            setShippingStateId(value)
                                        }}
                                        getError={() => { }}
                                    />
                                </div>
                                <div>
                                    <Select
                                        id='shippingCity'
                                        name='shippingCity'
                                        label='City'
                                        options={shippingCity}
                                        defaultValue={shippingCityId + ""}
                                        getValue={(value) => setShippingCityId(value)}
                                        getError={() => { }}
                                    />
                                </div>
                                <Text
                                    label='Postal Code'
                                    id='shippingPostalCode'
                                    name='shippingPostalCode'
                                    placeholder='Please enter postal code'
                                    minChar={5}
                                    maxLength={10}
                                    value={shippingPostalCode}
                                    getValue={(value) => {
                                        /^[0-9 ]*$/.test(value) && setShippingPostalCode(value)
                                    }}
                                    getError={() => { }}
                                    className='!pt-[7px]'
                                />
                            </div>
                        </div>
                    </div>}

                {selectedTab === "contactDetails" &&
                    <div className='w-full overflow-auto p-5 grid grid-cols-3 gap-5'>
                        <Text
                            label='Phone Number'
                            id='phoneNumber'
                            name='phoneNumber'
                            placeholder='Please enter phone number'
                            value={phoneNumber}
                            minChar={7}
                            maxLength={15}
                            getValue={(value) => setPhoneNumber(value)}
                            getError={() => { }}
                        />
                        <Text
                            label='Mobile Number'
                            id='mobileNumber'
                            name='mobileNumber'
                            placeholder='Please enter mobile number'
                            value={mobileNumber}
                            minChar={7}
                            maxLength={15}
                            getValue={(value) => setMobileNumber(value)}
                            getError={() => { }}
                        />
                        <Text
                            label='Fax'
                            id='fax'
                            name='fax'
                            placeholder='Please enter fax'
                            value={fax}
                            minChar={5}
                            maxLength={8}
                            getValue={(value) => setFax(value)}
                            getError={() => { }}
                        />
                        <Email
                            label='Email Address'
                            id='email'
                            name='email'
                            type='email'
                            placeholder="Please enter email address"
                            value={email}
                            getValue={(value) => {
                                setEmail(value)
                            }}
                            getError={() => { }}
                            minChar={5}
                            maxLength={255}
                        />
                        <div className='col-span-2'>
                            <Text
                                label='Website URL'
                                id='websiteUrl'
                                name='websiteUrl'
                                placeholder='Please enter website url'
                                value={websiteUrl}
                                minChar={5}
                                maxLength={255}
                                getValue={(value) => setWebsiteUrl(value)}
                                getError={() => { }}
                            />
                        </div>
                        <Text
                            label='Primary Contact'
                            id='primaryContact'
                            name='primaryContact'
                            validate
                            disabled
                            placeholder='Same as vendor'
                            getValue={() => { }}
                            getError={() => { }}
                        />
                        <Text
                            label='Pay-to Contact'
                            id='paytoContact'
                            name='paytoContact'
                            validate
                            disabled
                            placeholder='Same as vendor'
                            getValue={() => { }}
                            getError={() => { }}
                        />
                        <Text
                            label='Return to Contact'
                            id='returnToContact'
                            name='returnToContact'
                            validate
                            disabled
                            placeholder='Same as vendor'
                            getValue={() => { }}
                            getError={() => { }}
                        />
                    </div>}

                {selectedTab === "paymentDetails" &&
                    <div className='w-full h-full overflow-auto p-5'>
                        <div className='w-full grid grid-cols-3 gap-5'>
                            <Select
                                id='termId'
                                label='Term'
                                options={termOption}
                                defaultValue={termId + ""}
                                getValue={(value) => setTermId(value)}
                                getError={() => { }}
                            />
                            <Select
                                id='preferrerdPaymentMethod'
                                label='Preferrerd Payment Method'
                                options={paymentMethodOption}
                                defaultValue={paymentMethodId + ""}
                                getValue={(value) => setPaymentMethodId(value)}
                                getError={() => { }}
                            />
                            <Select
                                id='accountClassification'
                                label='Account Classification'
                                options={accountClassificationOption}
                                defaultValue={accountClassificationId + ""}
                                getValue={(value) => setAccountClassificationId(value)}
                                getError={() => { }}
                            />
                            <Select
                                id='defaultGlAccount'
                                label='Default GL Account'
                                options={glAccountOption}
                                defaultValue={glAccountId + ""}
                                getValue={(value) => setGlAccountId(value)}
                                getError={() => { }}
                            />
                            <div className='flex justify-start items-center gap-2'>
                                <CheckBox
                                    className='!font-proxima !text-darkCharcoal !text-sm !tracking-wide'
                                    id='paymentEnablement'
                                    checked={isPaymentEnableCheck}
                                    onChange={(e) => setIsPaymentEnableCheck(e.target.checked)}
                                    label='Payment Enablement'
                                />
                                <BasicTooltip position='top' content={`"Kindly choose "payment enablement" so that PathQuest or a third party can communicate with the vendor for accepting payments by Virtual card or ACH+ payment method"`}>
                                    <InfoIcon />
                                </BasicTooltip>
                            </div>
                        </div>
                        <div className='w-full mt-[30px]'>
                            <Typography type='h5' className='!font-bold !text-darkCharcoal !tracking-[0.02em]'>
                                Payment Method Details
                            </Typography>
                            <div className='mt-[30px]'>
                                <CheckBox
                                    id='ach'
                                    className='!font-proxima !text-darkCharcoal !text-sm !tracking-wide !font-bold'
                                    checked={isAchCheck}
                                    onChange={handleAchChanged}
                                    label='ACH'
                                />
                                <div className={`${isAchCheck ? "" : "hidden"} mt-3 w-full grid grid-cols-3 gap-5`}>
                                    <Text
                                        label='Account Number'
                                        id='accountNumber'
                                        name='accountNumber'
                                        placeholder='Please Enter Account Number'
                                        validate
                                        minChar={4}
                                        maxLength={17}
                                        value={accountNumber}
                                        hasError={accountNumberError}
                                        getValue={(value) => {
                                            /^[0-9]*$/.test(value) && setAccountNumber(value)
                                            setAccountNumberError(false)
                                        }}
                                        getError={() => { }}
                                    />
                                    <Text
                                        label='Routing Number'
                                        id='routingNumber'
                                        name='routingNumber'
                                        placeholder='Please Enter Routing Number'
                                        validate
                                        minChar={9}
                                        maxLength={9}
                                        value={routingNumber}
                                        hasError={routingNumberError}
                                        getValue={(value) => {
                                            /^[0-9]*$/.test(value) && setRoutingNumber(value)
                                            setRoutingNumberError(false)
                                        }}
                                        getError={() => { }}
                                    />
                                    <div>
                                        <Select
                                            id='accountType'
                                            label='Account Type'
                                            validate
                                            options={accountTypeOptions}
                                            defaultValue={accountType + ""}
                                            hasError={accountTypeError}
                                            getValue={(value) => {
                                                setAccountType(value)
                                                setAccountTypeError(false)
                                            }}
                                            getError={() => { }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='my-[30px]'>
                                <CheckBox
                                    id='virtualCard'
                                    className='!font-proxima !text-darkCharcoal !text-sm !tracking-wide !font-bold'
                                    checked={isVcardCheck}
                                    onChange={handleVcnChanged}
                                    label='Virtual Card'
                                />
                                <div className={`${isVcardCheck ? "" : "hidden"} mt-3 w-full grid grid-cols-3 gap-5`}>
                                    <Email
                                        label='Email Address'
                                        id='email'
                                        name='email'
                                        type='email'
                                        validate
                                        placeholder="Please Enter Email Address"
                                        value={virtualCardEmail}
                                        getValue={(value) => setVirualCardEmail(value)}
                                        hasError={virtualCardEmailError}
                                        getError={() => { }}
                                        minLength={10}
                                        maxLength={100}
                                    />
                                    <div className='place-content-center'>
                                        <CheckBox
                                            id='requirePin'
                                            className='!font-proxima !text-darkCharcoal !text-sm !tracking-wide !font-bold'
                                            checked={isRequirePinCheck}
                                            onChange={(e) => setIsRequirePinCheck(e.target.checked)}
                                            label='Require Pin'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className=''>
                                <CheckBox
                                    id='check'
                                    className='!font-proxima !text-darkCharcoal !text-sm !tracking-wide !font-bold'
                                    checked={isCheckChecked}
                                    onChange={handleCheckChanged}
                                    label='Check'
                                />
                                <div className={`${isCheckChecked ? "" : "hidden"} mt-3 w-full grid grid-cols-3 gap-5`}>
                                    <Text
                                        label='Payable To'
                                        id='payableTo'
                                        name='payableTo'
                                        placeholder='Please Enter Name'
                                        value={nameOnCheck}
                                        disabled
                                        getValue={() => { }}
                                        getError={() => { }}
                                    />
                                    <Text
                                        label='Address'
                                        id='address'
                                        name='address'
                                        placeholder='Please Enter Address'
                                        maxLength={100}
                                        value={address}
                                        validate
                                        hasError={addressError}
                                        getValue={(value) => { /^[a-zA-Z0-9.,\- ]*$/.test(value) && setAddress(value) }}
                                        getError={() => { }}
                                    />
                                    <div>
                                        <Select
                                            id='checkCountry'
                                            name='checkCountry'
                                            label='Country'
                                            options={checkCountry}
                                            defaultValue={checkCountryId + ""}
                                            validate
                                            hasError={checkCountryError}
                                            getValue={(value) => {
                                                setCheckCountryId(value)
                                                setCheckCountryError(false)
                                            }}
                                            getError={() => { }}
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            id='checkState'
                                            name="checkState"
                                            label='State'
                                            options={checkState}
                                            defaultValue={checkStateId + ""}
                                            validate
                                            hasError={checkStateError}
                                            getValue={(value) => {
                                                setCheckStateId(value)
                                                setCheckStateError(false)
                                            }}
                                            getError={() => { }}
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            id='checkCity'
                                            name='checkCity'
                                            label='City'
                                            options={checkCity}
                                            defaultValue={checkCityId + ""}
                                            validate
                                            hasError={checkCityError}
                                            getValue={(value) => {
                                                setCheckCityId(value)
                                                setCheckCityError(false)
                                            }}
                                            getError={() => { }}
                                        />
                                    </div>
                                    <Text
                                        label='Postal Code'
                                        id='postalCode'
                                        name='postalCode'
                                        placeholder='Please Enter Postal Code'
                                        minChar={5}
                                        maxLength={10}
                                        value={postalCode}
                                        validate
                                        hasError={postalCodeError}
                                        getValue={(value) => {
                                            /^[0-9 ]*$/.test(value) && setPostalCode(value)
                                        }}
                                        getError={() => { }}
                                        className='!pt-[7px]'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            <div className='sticky bottom-0 flex h-[66px] w-full items-center justify-end border-t border-lightSilver bg-white'>
                <div className='my-[15px] mx-5 flex gap-5'>
                    <Button onClick={() => clearAllData("")} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
                        <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
                    </Button>

                    {selectedTab === "paymentDetails" ?
                        <Button
                            type='submit'
                            onClick={handleSubmit}
                            className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
                            variant='btn-primary'>
                            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                                {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
                            </label>
                        </Button>
                        : <Button
                            type='submit'
                            onClick={() => handleNext()}
                            className={`btn-sm !h-9 rounded-full`}
                            variant='btn-primary'>
                            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                                NEXT
                            </label>
                        </Button>}
                </div>
            </div>
        </div >
    )
}

export default VendorAddScreen