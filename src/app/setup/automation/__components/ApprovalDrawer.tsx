import PlusCircleIcon from '@/assets/Icons/PlusCircleIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { useAppDispatch } from '@/store/configureStore'
import { ruleGetById, saveRule } from '@/store/features/automation/automationSlice'
import { companyAssignUser } from '@/store/features/company/companySlice'
import { locationGetDropdownList } from '@/store/features/master/dimensionSlice'
import { vendorGetDropdownList } from '@/store/features/vendor/vendorSlice'
import { Button, Close, CompanyList, Select, Text, Textarea, Toast, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditId: number
  ruleProcessType: string
  automationListData?: any
}

const ApprovalDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId, ruleProcessType, automationListData }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

  // For Payment Approval Options
  let fieldOptions = [
    { label: 'Vendor', value: 'Vendor' },
    { label: 'Location', value: 'Location' },
    { label: 'Amount', value: 'Amount' },
    { label: 'Due Date', value: 'Due Date' },
    { label: 'Payment Method', value: 'Payment Method' }
  ];

  const operatorOptions = [
    { label: 'Is', value: 'Is' },
    { label: 'Is Not', value: 'Is Not' },
  ]

  const conditionOptions = [
    { label: 'And', value: 'And' },
    { label: 'Or', value: 'Or' },
  ]

  const amountOptions = [
    { label: '=', value: '=' },
    { label: '!=', value: '!=' },
    { label: '>', value: '>' },
    { label: '<', value: '<' },
    { label: '>=', value: '>=' },
    { label: '<=', value: '<=' },
  ]

  const dueDateOptions: any = [{ label: 'exceeds', value: 'exceeds' }]

  let fieldObject = { id: Date.now(), condition: '', field: '', operator: '', values: [], optionalValueOptions: [], optionalOperator: [] }
  let fieldObjectError = { id: fieldObject.id, condition: false, field: false, operator: false, values: false, optionalValueOptions: false, optionalOperator: false }

  let stageObject = { id: Date.now(), condition: '', approver1: '', approver2: '', showApprover2: false }
  let stageObjectError = { id: stageObject.id, condition: false, approver1: false, approver2: false, showApprover2: false }

  const vendorValues: any = [];
  const vendorLabels: any = [];

  const locationValues: any = [];
  const locationLabels: any = [];

  const paymentMethodValues: any = [];
  const paymentMethodLabels: any = [];

  const approvalValues: any = [];

  const [processType, setProcessType] = useState<string>('')

  const [ruleName, setRuleName] = useState<string>('')
  const [ruleNameError, setRuleNameError] = useState<boolean>(false)

  const [billFilterOptions, setBillFilterOption] = useState<any>([])
  const [vendorOptions, setVendorOption] = useState<any>([])
  const [userOptions, setUserOption] = useState([])
  const [locationOptions, setLocationOption] = useState([])
  const [paymentMethodOptions, setPaymentMethodOption] = useState<any>([])

  const [fields, setFields] = useState<{ id: number; condition: string; field: string; operator: string; values: any; optionalValueOptions: any, optionalOperator: any }[]>([fieldObject])
  const [fieldAddedId, setFieldAddedId] = useState<number>(fieldObject.id)
  const [fieldsError, setFieldsError] = useState<{ id: number; condition: boolean; field: boolean; operator: boolean; values: boolean; optionalValueOptions: boolean, optionalOperator: boolean }[]>([fieldObjectError])

  const [stage, setStage] = useState<{ id: number; condition: string; approver1: string; approver2: string; showApprover2: boolean }[]>([stageObject])
  const [stageError, setStageError] = useState<{ id: number; condition: boolean; approver1: boolean; approver2: boolean; showApprover2: boolean }[]>([stageObjectError])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('')
  const [completeDescription, setCompleteDescription] = useState<string>('')

  const [isVendorRefresh, setIsVendorRefresh] = useState<boolean>(false)
  const [vendorDataCount, setVendorDataCount] = useState<number>(0)
  const [locationDataCount, setLocationDataCount] = useState<number>(0)

  //For Bill Approval Options
  useEffect(() => {
    if (ruleProcessType === "BillApproval") {
      fieldOptions = fieldOptions.filter(option =>
        option.label !== 'Due Date' && option.label !== 'Payment Method'
      );
      setBillFilterOption(fieldOptions)
    }
    else {
      setBillFilterOption(fieldOptions)
    }
  }, [onOpen, ruleProcessType])

  useEffect(() => {
    const vendorCount = automationListData.filter((record: any) => {
      return (
        !record.IsCompanyDefault &&
        record.ProcessType === ruleProcessType &&
        record.RuleDetail.includes("\"Field\":\"Vendor\"")
      );
    }).length;

    setVendorDataCount(vendorCount)
    const locationCount = automationListData.filter((record: any) => {
      return (
        !record.IsCompanyDefault &&
        record.ProcessType === ruleProcessType &&
        record.RuleDetail.includes("\"Field\":\"Location\"")
      );
    }).length;
    setLocationDataCount(locationCount)
  }, [onOpen, ruleProcessType])

  const setErrorTrue = () => {
    setRuleNameError(true)
  }

  const initialData = () => {
    setRuleName('')
    setRuleNameError(false)

    setDescription('')
    setCompleteDescription('')

    setIsLoading(false)
    setFields([])
    setFieldsError([])
    setFieldAddedId(fieldObject.id)

    setVendorOption([])
    setLocationOption([])
    setPaymentMethodOption([])
    setUserOption([])

    setFields([fieldObject])
    setFieldsError([fieldObjectError])

    setStage([stageObject])
    setStageError([stageObjectError])

    setProcessType('')

    setIsVendorRefresh(false)
    setIsVendorRefresh(false)
  }

  const clearAllData = async (type: string) => {
    setRuleName('')
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  //Rule Get Data API
  const getAutomationRuleDataById = async () => {
    const params = {
      RuleId: EditId,
      CompanyId: CompanyId
    }
    performApiAction(dispatch, ruleGetById, params, (responseData: any) => {
      if (responseData) {
        const { RuleName, RuleDetail, ProcessType, Description } = responseData
        setRuleName(RuleName || '')
        setProcessType(ProcessType || "")
        const wordsToRemove = ["approvalVendor", "approvalLocation", "approvalPaymentMethod"];
        const pattern = new RegExp("\\b(" + wordsToRemove.join("|") + ")\\b", "gi");
        const modifiedString = Description.replace(pattern, "");
        setCompleteDescription(Description)
        setDescription(modifiedString)

        const { Conditions, Assignee } = JSON.parse(RuleDetail);

        const newUpdatedField = Conditions.reduce((acc: any, value: any, index: any) => {
          const prevValue = Conditions[index - 1];
          const newOperators = value.Field === "Amount" ? amountOptions : value.Field === "Due Date" ? dueDateOptions : operatorOptions
          const newValueOptions = value.Field === "Vendor" ? vendorOptions.filter((item: any) => !item.IsUsed) : value.Field === "Location" ? locationOptions.filter((item: any) => !item.IsUsed) : value.Field === "Payment Method" ? paymentMethodOptions : []
          setFieldAddedId(Date.now() + index);
          handleFieldOptionsChange(Date.now(), value.Field)

          const newItem = {
            id: Date.now() + index,
            condition: prevValue ? prevValue.NextOperator || "" : "",
            field: value.Field,
            operator: value.Operator,
            values: value.Field == "Vendor" ? value.Value == "-1" ? (
              vendorOptions.map((option: any) => option.value)
            )
              : value.Value.split(',').map((value: any) => value.trim())
              : value.Field == "Location" ? value.Value == "-1" ? (
                locationOptions.map((option: any) => option.value)
              )
                : value.Value.split(',').map((value: any) => value.trim())
                : value.Value.split(',').map((value: any) => value.trim()),
            optionalOperator: newOperators,
            optionalValueOptions: newValueOptions
          };
          acc.push(newItem);
          return acc;
        }, []);

        setFields(newUpdatedField);

        // Stage/Approver Data set
        const newAssignee = Assignee?.map((value: any, index: any) => {
          return {
            id: index,
            condition: value.Operator == undefined ? "" : value.Operator,
            approver1: value.User1,
            approver2: value.Operator == undefined ? "" : value.User2,
            showApprover2: value.Operator == undefined ? false : true
          }
        })
        setStage(newAssignee)
      }
    })
  }

  //User Dropdown List API
  const getUserDropdownList = () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, companyAssignUser, params, (responseData: any) => {
      const modifiedData = responseData.map((item: any) => ({
        label: item.label,
        value: item.value,
        isEnable: true
      }));
      setUserOption(modifiedData);
    });
  };

  //Vendor Dropdown List API
  const getAutomationVendorDropdownList = () => {
    const params = {
      RuleId: EditId || 0,
      CompanyId: CompanyId,
      ProcessType: ruleProcessType,
    };
    performApiAction(dispatch, vendorGetDropdownList, params, (responseData: any) => {
      setVendorOption(responseData);
    });
  };

  //Location Dropdown List API
  const getAutomationLocationDropdownList = () => {
    const params: any = {
      RuleId: EditId || 0,
      CompanyId: CompanyId,
      ProcessType: ruleProcessType
    }
    performApiAction(dispatch, locationGetDropdownList, params, (responseData: any) => {
      setLocationOption(responseData);
    });
  };

  //Payment Method Dropdown List API
  const getPaymentMethodDropdownList = () => {
    performApiAction(dispatch, getPaymentMethods, null, (responseData: any) => {
      setPaymentMethodOption(responseData);
    });
  };

  const handleInputChange = (value: any, name: string) => {
    if (name == 'ruleName') {
      /^[a-zA-Z0-9 ]*$/.test(value) && setRuleName(value)
    }
  }

  useEffect(() => {
    setIsVendorRefresh(true)
    getUserDropdownList()
    getAutomationVendorDropdownList()
    getAutomationLocationDropdownList()
    getPaymentMethodDropdownList()
  }, [onOpen])

  useEffect(() => {
    if (EditId > 0 && isVendorRefresh === true) {
      getAutomationRuleDataById()
    }
  }, [EditId, isVendorRefresh])

  //Additional Conditions
  const addField = (isEnableCheck: boolean) => {
    if (isEnableCheck) {
      const id = Date.now()
      setFieldAddedId(id)

      setFields((prevFields: any) => [
        ...prevFields,
        { id, condition: '', field: '', operator: '', values: [], optionalValueOptions: [], optionalOperator: [] },
      ])
      setFieldsError((prevErrorFields: any) => [
        ...prevErrorFields,
        { id, condition: false, field: false, operator: false, values: false, optionalValueOptions: '', optionalOperator: '' },
      ])
    } else {
      Toast.error("You’ve reached the maximum limit. You cannot add more")
    }
  }

  // Disabled Vendor Option if All Vendor Selected
  useEffect(() => {
    setBillFilterOption((prevOptions: any) =>
      prevOptions.map((option: any) => ({
        ...option,
        isEnable: option.label === 'Vendor'
          ? !vendorOptions.every((item: any) => item.IsUsed === true)
          : option.label === 'Location'
            ? !locationOptions.every((item: any) => item.IsUsed === true)
            : option.isEnable
      }))
    );
  }, [onOpen]);

  // Options filter based on previous value
  const handleFieldOptionsChange = (id: number, value: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
      (field.id === id ? {
        ...field,
        values: [],
      } : field)))
    setBillFilterOption((prevOptions: any) =>
      prevOptions.map((option: any) => ({
        ...option,
        isEnable: value === option.label ? false : option.isEnable
      }))
    );
    switch (value) {
      case 'Vendor':
        setIsVendorRefresh(true)
        setFields((prevFields) =>
          prevFields.map((field) =>
          (field.id === id ? {
            ...field,
            operator: '',
            optionalValueOptions: vendorOptions.filter((item: any) => !item.IsUsed),
            optionalOperator: operatorOptions
          } : field)))
        break
      case 'Location':
        setIsVendorRefresh(true)
        setFields((prevFields) =>
          prevFields.map((field) =>
          (field.id === id ? {
            ...field,
            operator: '',
            optionalValueOptions: locationOptions.filter((item: any) => !item.IsUsed),
            optionalOperator: operatorOptions
          } : field)))
        break
      case 'Payment Method':
        setIsVendorRefresh(true)
        setFields((prevFields) =>
          prevFields.map((field) =>
          (field.id === id ? {
            ...field,
            operator: '',
            optionalValueOptions: paymentMethodOptions,
            optionalOperator: operatorOptions
          } : field)))
        break
      case 'Amount':
        setIsVendorRefresh(true)
        setFields((prevFields) =>
          prevFields.map((field) =>
          (field.id === id ? {
            ...field,
            operator: '',
            optionalValueOptions: [],
            optionalOperator: amountOptions
          } : field)))
        break
      case 'Due Date':
        setIsVendorRefresh(true)
        setFields((prevFields) =>
          prevFields.map((field) =>
          (field.id === id ? {
            ...field,
            operator: 'exceeds',
            optionalValueOptions: [],
            optionalOperator: dueDateOptions
          } : field)))
        break
      default:
        break
    }
  }

  //Remove Condition
  const removeField = (fieldIdToRemove: number) => {
    const updatedFieldsArray = fields.filter((field) => field.id !== fieldIdToRemove)
    setFields((prev) => prev.filter((field) => field.id !== fieldIdToRemove))
    setBillFilterOption((prevOptions: any) =>
      prevOptions.map((option: any) => ({
        ...option,
        isEnable: option.label === fields.find(field => field.id === fieldIdToRemove)?.field ? true : option.isEnable
      }))
    );
    setFieldAddedId(updatedFieldsArray[updatedFieldsArray.length - 1].id)
  }

  //Additional Approval
  const addApproval = (id: number) => {
    setStage((prevFields) => prevFields.map((field) => (field.id === id ? { ...field, showApprover2: true } : field)))
  }

  //Remove Approval
  const removeApprovalField = (id: number) => {
    setStage((prevFields) => prevFields.map((field) => (field.id === id ? { ...field, condition: "", approver2: "", showApprover2: false } : field)))
  }

  //Additional Stage
  const addStage = () => {
    const id = Date.now()
    setStage((prevStages) => [...prevStages, { ...stageObject, id: id }])
  }

  //Remove Stage
  const removeStage = (fieldIdToRemove: any) => {
    setStage((prev) => prev.filter((stageId) => stageId !== fieldIdToRemove))
  }

  // Description generator
  const handleDescription = () => {
    stage.forEach((item, index) => {
      item.approver1 !== "" && approvalValues.push({ stage: index + 1, value: item.approver1 });
      item.approver2 !== "" && approvalValues.push({ stage: index + 1, value: item.approver2 });
    });

    setUserOption((prevOptions: any) =>
      prevOptions.map((option: any) => ({
        ...option,
        isEnable: !approvalValues.map((item: any) => item.value).includes(option.value)
      }))
    );

    let fieldName = ""
    let fieldAmount;
    let amountOperator = "";
    let vendorOperator = "";
    let locationOperator = "";
    let paymentMethodOperator = "";
    fields.forEach(item => {
      if (item.field === "Vendor") {
        vendorValues.push(...item.values);
        vendorOperator = item.operator
      }
      if (item.field === "Location") {
        locationValues.push(...item.values);
        locationOperator = item.operator
      }
      if (item.field === "Payment Method") {
        paymentMethodValues.push(...item.values);
        paymentMethodOperator = item.operator
      }
      if (item.field === "Amount") {
        fieldName = "Amount"
        fieldAmount = item.values
        amountOperator = item.operator
      }
    });

    vendorValues.map((itemValue: string) => {
      const selectedValue: any = vendorOptions.find((value: any) => value.value === itemValue)
      if (selectedValue) {
        vendorLabels.push(selectedValue?.label)
      }
    })
    locationValues.map((itemValue: string) => {
      const selectedValue: any = locationOptions.find((value: any) => value.value === itemValue)
      if (selectedValue) {
        locationLabels.push(selectedValue?.label)
      }
    })
    paymentMethodValues.map((itemValue: string) => {
      const selectedValue: any = paymentMethodOptions.find((value: any) => value.value === itemValue)
      if (selectedValue) {
        paymentMethodLabels.push(selectedValue?.label)
      }
    })

    let descAmountOperator = ""
    switch (amountOperator) {
      case '=':
        descAmountOperator = "equal to"
        break
      case '!=':
        descAmountOperator = "not equal to"
        break
      case '>=':
        descAmountOperator = "greater than or equal to"
        break
      case '<=':
        descAmountOperator = "less than or equal to"
        break
      case '>':
        descAmountOperator = "greater than"
        break
      case '<':
        descAmountOperator = "less than"
        break
      default:
        break
    }

    const operatorsMap: any = {
      'Is': (values: any) => values.length === 1 ? " is" : "s are",
      'Is Not': (values: any) => values.length === 1 ? " is not" : "s are not"
    };

    const getOperatorDescription = (operator: any, values: any) => {
      return operatorsMap[operator] ? operatorsMap[operator](values) : "";
    };

    let descVendorOperator = getOperatorDescription(vendorOperator, vendorValues);
    let descLocationOperator = getOperatorDescription(locationOperator, locationValues);
    let descPaymentMethodOperator = getOperatorDescription(paymentMethodOperator, paymentMethodValues);

    const vendorLabel = vendorLabels.length > 0 ? vendorLabels.length === 1 ? `whose vendor${descVendorOperator} approvalVendor ` + vendorLabels + " approvalVendor" : `whose vendor${descVendorOperator} approvalVendor ` + vendorLabels[0] + " approvalVendor +" + (vendorLabels.length - 1) + ' more' : ""
    const locationLabel = locationLabels.length > 0 ? locationLabels.length === 1 ? `, whose location${descLocationOperator} approvalLocation ` + locationLabels + " approvalLocation" : `, whose location${descLocationOperator} approvalLocation ` + locationLabels[0] + " approvalLocation +" + (locationLabels.length - 1) + ' more' : ""
    const amountLabel = fieldName == "Amount" ? ` and whose amount is ${descAmountOperator} $${Number(fieldAmount).toFixed(2)}` : ""
    const paymentMethodLabel = paymentMethodLabels.length > 0 ? paymentMethodLabels.length === 1 ? ` and whose payment method${descPaymentMethodOperator} approvalPaymentMethod ` + paymentMethodLabels + " approvalPaymentMethod" : ` and whose payment method${descPaymentMethodOperator} approvalPaymentMethod ` + paymentMethodLabels[0] + " approvalPaymentMethod +" + (paymentMethodLabels.length - 1) + ' more' : ""

    let stage1Values = approvalValues.filter((item: any) => item.stage === 1).map((item: any) => item.value);
    let stage2Values = approvalValues.filter((item: any) => item.stage === 2).map((item: any) => item.value);

    let approverLabel = "";
    let userLabel: any = ""
    if (stage1Values.length > 0) {
      approverLabel = approverLabel + stage1Values.slice(0, 2).map((value: any, index: any) => {
        userLabel = userOptions.find((user: any) => user.value === value)
        return index === 0 ? `${userLabel?.label}` : `and ${userLabel?.label}`
      }).join(' ') + ' for stage 1';
    }

    if (stage2Values.length > 0) {
      approverLabel = approverLabel + stage2Values.slice(0, 2).map((value: any, index: any) => {
        userLabel = userOptions.find((user: any) => user.value === value)
        return index === 0 ? ` and ${userLabel?.label}` : `and ${userLabel?.label}`
      }
      ).join(' ') + ' for stage 2';
    }

    let commonDescription = `The ${ruleName} states that invoices ${vendorLabel}${locationLabel}${amountLabel}${paymentMethodLabel} has been assigned to ${approverLabel}`
    const wordsToRemove = ["approvalVendor", "approvalLocation", "approvalPaymentMethod"];
    const pattern = new RegExp("\\b(" + wordsToRemove.join("|") + ")\\b", "gi");

    if (vendorLabels.length == 0 && locationLabels.length > 0) {
      commonDescription = commonDescription.replace(", whose", " of");
    }
    if (fieldName === "Amount" && (locationLabels.length == 0) && (vendorLabels.length == 0)) {
      commonDescription = commonDescription.replace("and ", "");
    }
    if (paymentMethodLabels.length > 0 && (locationLabels.length == 0) && (vendorLabels.length == 0)) {
      commonDescription = commonDescription.replace(" and", "");
    }

    const modifiedString = commonDescription.replace(pattern, "");
    setCompleteDescription(commonDescription)
    setDescription(modifiedString)
  }

  useEffect(() => {
    handleDescription()
  }, [ruleName, onOpen, fields, stage])

  // Data Object Generator
  const generateDataObject = () => {
    const conditions: any = [];
    const assignee: any = [];

    fields.forEach((field: any, index) => {
      const nextOperator = (fields.length !== index + 1) ? fields[index + 1].condition : undefined;
      const condition: any = {
        Field: field.field,
        Operator: field.operator,
        Value: typeof field.values === "string" ?
          field.values :
          field.field == "Vendor"
            ? ((vendorDataCount == 0 || vendorDataCount == 1) && field.values.length === vendorOptions.length
              ? "-1"
              : (field.values.length === vendorOptions.length
                ? "-1"
                : (field.values?.join(',') ?? '')
              )
            )
            : field.field == "Location"
              ? ((locationDataCount == 0 || locationDataCount == 1) && field.values.length === locationOptions.length
                ? "-1"
                : (field.values.length === locationOptions.length
                  ? "-1"
                  : (field.values?.join(',') ?? '')
                )
              )
              : (field.values?.join(',') ?? ''),
        ...(nextOperator && { NextOperator: nextOperator })
      };
      conditions.push(condition);
    });

    stage.forEach(stage => {
      let assign: any = {
        User1: stage.approver1
      };

      if (stage.approver2) {
        assign.Operator = stage.condition;
        assign.User2 = stage.approver2;
      }

      assignee.push(assign);
    });

    return {
      Conditions: conditions,
      Assignee: assignee
    };
  }

  // Handle Save API
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    ruleName.trim().length <= 0 && setRuleNameError(true)

    const updatedFieldsError: any = fields?.map((field, index) => ({
      id: field.id,
      condition: index > 0 ? field.condition.trim().length <= 0 : false,
      field: field.field.trim().length <= 0,
      operator: field.operator.trim().length <= 0,
      values: field.field === "Due Date" ? false : field.values.length <= 0,
    }))
    setFieldsError(updatedFieldsError)

    const hasFieldsError = updatedFieldsError.some((errorObj: any) => {
      return Object.values(errorObj).some(value => value === true);
    });

    const updatedStageError: any = stage?.map((field) => ({
      id: field.id,
      condition: field.showApprover2 ? field.condition.trim().length <= 0 : false,
      approver1: field.approver1.trim().length <= 0,
      approver2: field.showApprover2 ? field.approver2.trim().length <= 0 : false,
    }))
    setStageError(updatedStageError)

    const hasStageError = updatedStageError.some((errorObj: any) => {
      return Object.values(errorObj).some(value => value === true);
    });

    if (ruleName.trim().length > 0 && !hasFieldsError && !hasStageError) {
      setIsLoading(true)
      const dataObject = generateDataObject();
      const ruleJsonString = JSON.stringify(dataObject, (_, value) =>
        typeof value === "string" ? value.replace(/\\/g, '\\') : value
      );
      const params: any = {
        RuleId: EditId || 0,
        CompanyId: CompanyId,
        RuleName: ruleName,
        ProcessType: processType || ruleProcessType,
        RuleDetail: ruleJsonString,
        Description: completeDescription
      }
      performApiAction(dispatch, saveRule, params, () => {
        Toast.success(`${EditId ? 'Details Updated!' : 'Rule Added!'}`)
        setRuleName('')
        setDescription('')
        clearAllData("Save")
        initialData()
      }, () => {
        setIsLoading(false)
      });
    }
  }

  return (
    <>
      <div className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 xsm:w-4/5 sm:w-4/5 md:w-[62%] lg:w-[62%] xl:w-[62%] hd:w-[807px] 2xl:w-[807px] 3xl:w-[807px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}>
        <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
          <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
            {EditId ? 'Edit' : 'Add'} Rule For {ruleProcessType.replace(/([A-Z])/g, ' $1')}
          </label>
          <div className='pt-2.5' onClick={() => clearAllData("")}>
            <Close variant='medium' />
          </div>
        </div>
        <div className='p-5 mb-12 flex-1 overflow-auto'>
          {/* Rule Name */}
          <div className='mb-5 flex-1'>
            <Text
              label='Rule Name'
              id='ruleName'
              name='ruleName'
              placeholder='Please Enter Rule Name'
              validate
              maxLength={50}
              hasError={ruleNameError}
              value={ruleName}
              getValue={(value: any) => handleInputChange(value, 'ruleName')}
              getError={() => { }}
            />
          </div>

          <Typography type='label' className='!text-base !font-bold font-proxima tracking-[0.02em] !text-darkCharcoal'>
            Condition
          </Typography>

          {/* Conditions */}
          {fields.map((field, index) => {
            const firstValuesCheck = field?.field != '' && field?.operator != '' && (field?.field == "Due Date" ? true : field?.values.length != 0)
            const allValuesCheck = field?.condition != '' && field?.field != '' && field?.operator != '' && (field?.field == "Due Date" ? true : field?.values.length != 0)
            const allEnable = billFilterOptions.every((option: any) => option.isEnable === false);

            return (
              <div key={field.id} className='mt-[15px] flex'>
                <div className='flex w-full gap-5'>
                  {index > 0 && <div className='w-full'>
                    <Select
                      id={`condition-${field?.id}`}
                      label='Condition'
                      options={conditionOptions}
                      defaultValue={field?.condition}
                      validate
                      search
                      getValue={(value) => {
                        setFields((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, condition: value } : f)))
                      }}
                      getError={(error: any) => {
                        setFieldsError((prevFields) =>
                          prevFields.map((f) => (f.id === field.id ? { ...f, condition: !error } : f))
                        )
                      }}
                      hasError={fieldsError.find((f) => f.id === field.id)?.condition}
                    />
                  </div>}
                  <div className='w-full'>
                    <Select
                      id={`field-${field.id}`}
                      label='Field'
                      options={billFilterOptions || []}
                      defaultValue={field.field}
                      validate
                      search
                      getValue={(value) => {
                        setBillFilterOption((prevOptions: any) =>
                          prevOptions.map((option: any) => ({
                            ...option,
                            isEnable: field.field === option.label ? true : option.isEnable
                          }))
                        );

                        setFields((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, field: value } : f)))
                        handleFieldOptionsChange(field.id, value)
                      }}
                      getError={(error: any) => {
                        setFieldsError((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, field: !error } : f)))
                      }}
                      hasError={fieldsError.find((f) => f.id === field.id)?.field}
                    />
                  </div>
                </div>
                <div className='!mx-5 w-full'>
                  <Select
                    id={`operator-${field.id}`}
                    label='Operator'
                    options={field.optionalOperator || []}
                    defaultValue={field.operator}
                    validate
                    search
                    getValue={(value) => {
                      setFields((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, operator: value } : f)))
                    }}
                    getError={(error: any) => {
                      setFieldsError((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, operator: !error } : f)))
                    }}
                    hasError={fieldsError.find((f) => f.id === field.id)?.operator}
                  />
                </div>
                <div className='w-full'>
                  {
                    field.field === 'Amount' || field.field === 'Due Date' ? (<div className={`${field.field === 'Due Date' ? "hidden" : "relative"}`}>
                      <span className={`absolute z-[5] text-sm top-[33px] ${fieldsError.find((f) => f.id === field.id)?.values && field.values.length == 0 ? 'text-red-500' : " text-black opacity-80"}`}>$</span>
                      <Text
                        id={`amountValue-${field.id}`}
                        label='Value'
                        name={`amountValue-${field.id}`}
                        className={'!pl-2.5'}
                        placeholder={'Please Enter Amount Value'}
                        validate
                        value={field.values}
                        maxLength={12}
                        getValue={(value) => {
                          if (/^\d*\.?\d*$/.test(value)) {
                            if (value == ".") {
                              return
                            } else {
                              setFields((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, values: value } : f)))
                            }
                          }
                        }}
                        getError={(error: any) => {
                          setFieldsError((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, values: !error } : f)))
                        }}
                        hasError={fieldsError.find((f) => f.id === field.id)?.values}
                      />
                    </div>) : (
                      <CompanyList
                        id={`value-${field.id}`}
                        showAvatar={5}
                        label='Value'
                        variant='user'
                        validate
                        avatarSize='x-small'
                        options={field?.optionalValueOptions.map((i: any) => ({ ...i, isEnable: true })) || []}
                        values={field.values}
                        getValue={(value) => {
                          setFields((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, values: value } : f)))
                          setFieldsError((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, values: false } : f)))
                        }}
                        getError={(error: any) => {
                          setFieldsError((prevFields) => prevFields.map((f) => (f.id === field.id ? { ...f, values: !error } : f)))
                        }}
                        hasError={fieldsError.find((f) => f.id === field.id)?.values}
                      />
                    )}
                </div>
                {index === 0 && fields.length === 1 ? <div
                  className={`px-[14px] flex cursor-pointer items-center overflow-visible ${firstValuesCheck && fieldAddedId == field.id ? '' : 'pointer-events-none'
                    }`} onClick={() => addField(true)} >
                  <Tooltip content={`Add`} position='bottom' className='!p-[6px] !z-[6]'>
                    <PlusCircleIcon
                      bgColor={firstValuesCheck && fieldAddedId === field.id ? '#02B89D' : '#6E6D7A'}
                      variant='add'
                      size='large'
                    />
                  </Tooltip>
                </div> : index > 0 ?
                  <div
                    className={`ml-[5px] h-fit mt-[8px] flex cursor-pointer items-center overflow-visible ${allValuesCheck && fieldAddedId == field.id ? '' : 'pointer-events-none'
                      }`} onClick={() => addField(!allEnable)} >
                    {!allEnable ? <Tooltip content={`Add`} position='bottom' className='!p-[6px] !z-1'>
                      <PlusCircleIcon
                        bgColor={allValuesCheck && fieldAddedId === field.id && !allEnable ? '#02B89D' : '#6E6D7A'}
                        variant='add'
                        size='small'
                      />
                    </Tooltip> : <div className='!p-[6px] !z-1'>
                      <PlusCircleIcon
                        bgColor={allValuesCheck && fieldAddedId === field.id && !allEnable ? '#02B89D' : '#6E6D7A'}
                        variant='add'
                        size='small'
                      />
                    </div>}
                  </div> : <div className='mx-[38px]'></div>}
                <Typography className='py-2'>
                  <div className={`${index > 0 ? "flex" : "hidden"} tooltip_text z-[1] cursor-pointer items-center overflow-visible `} onClick={() => removeField(field.id)}>
                    <Tooltip content={`Remove`} position='bottom' className='!p-[6px] !z-1'>
                      <PlusCircleIcon bgColor={'#B02A37'} variant='remove' size='small' />
                    </Tooltip>
                  </div>
                </Typography>
              </div>
            )
          })}

          {/* Additional Stage */}
          {stage.map((stageId, index) => {
            return (
              <div key={stageId.id}>
                {/* Stage 1 */}
                <div className='mt-[30px] flex gap-2'>
                  <Typography type='label' className='!text-base !font-bold font-proxima tracking-[0.02em] text-darkCharcoal'>
                    Stage {index + 1}{' '}
                  </Typography>
                  {stage.length === 1 ? (
                    <div className={`cursor-pointer ${stageId.approver1 != '' ? '' : 'pointer-events-none'}`} onClick={addStage}>
                      <Tooltip content={`Add`} position='bottom' className=' !z-[6] !px-0 !pb-2 !pt-0'>
                        <PlusCircleIcon bgColor={stageId.approver1 != '' ? '#02B89D' : '#6E6D7A'} variant='add' size='small' />
                      </Tooltip>
                    </div>
                  ) : (
                    stage.length > 1 && index > 0 && (
                      <div className='cursor-pointer' onClick={() => removeStage(stageId)}>
                        <Tooltip content={`Remove`} position='bottom' className=' !z-[6] !px-0 !pb-2 !pt-0'>
                          <PlusCircleIcon bgColor={'#B02A37'} variant='remove' size='small' />
                        </Tooltip>
                      </div>
                    )
                  )}
                </div>

                <div className='mt-[15px] flex'>
                  <div className='w-full'>
                    <Select
                      id={`approval1-${stageId.id}`}
                      label='Approver 1'
                      options={userOptions || []}
                      validate
                      search
                      defaultValue={stageId.approver1}
                      getValue={(value: any) => {
                        setStage((prevFields) =>
                          prevFields.map((field) => (field.id === stageId.id ? { ...field, approver1: value } : field))
                        );
                      }}
                      getError={(error: any) => {
                        setStageError((prevFields) =>
                          prevFields.map((f) => (f.id === stageId.id ? { ...f, approver1: !error } : f))
                        )
                      }}
                      hasError={stageError.find((f) => f.id === stageId.id)?.approver1}
                    />
                  </div>
                  {stageId.showApprover2 === false ? (
                    <div
                      className={`${stageId.approver1 != '' ? '' : 'pointer-events-none'}`}
                      onClick={() => addApproval(stageId.id)}
                    >
                      <Tooltip content={`Add`} position='bottom' className=' !z-[6] !px-[20px] !py-[6px]'>
                        <PlusCircleIcon bgColor={stageId.approver1 != '' ? '#02B89D' : '#6E6D7A'} variant='add' size='large' />
                      </Tooltip>
                    </div>
                  ) : (
                    <div className='mx-[38px]'></div>
                  )}
                </div>

                {stageId.showApprover2 && (
                  <div className='mt-5 flex'>
                    <div className='flex w-full gap-5'>
                      <div>
                        <Select
                          id={`condition-${stageId.id}`}
                          label='Condition'
                          options={conditionOptions}
                          defaultValue={stageId.condition}
                          validate
                          search
                          getValue={(value) =>
                            setStage((prevFields) =>
                              prevFields.map((field) => (field.id === stageId.id ? { ...field, condition: value } : field))
                            )
                          }
                          getError={(error: any) =>
                            setStageError((prevFields) =>
                              prevFields.map((f) => (f.id === stageId.id ? { ...f, condition: !error } : f))
                            )
                          }
                          hasError={stageError.find((f) => f.id === stageId.id)?.condition}
                        />
                      </div>
                      <div className='w-full'>
                        <Select
                          id={`approval2-${stageId.id}`}
                          label='Approver 2'
                          options={userOptions}
                          defaultValue={stageId.approver2}
                          validate
                          search
                          getValue={(value: any) => {
                            setStage((prevFields) =>
                              prevFields.map((field) => (field.id === stageId.id ? { ...field, approver2: value } : field))
                            );
                          }}
                          getError={(error: any) =>
                            setStageError((prevFields) =>
                              prevFields.map((f) => (f.id === stageId.id ? { ...f, approver2: !error } : f))
                            )
                          }
                          hasError={stageError.find((f) => f.id === stageId.id)?.approver2}
                        />
                      </div>
                    </div>

                    <div onClick={() => removeApprovalField(stageId.id)}>
                      <Tooltip content={`Remove`} position='bottom' className=' !z-[6] !px-[20px] !py-[6px]'>
                        <PlusCircleIcon bgColor={'#B02A37'} variant='remove' size='large' />
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Description */}
          <div className='mt-5 flex-1'>
            <Textarea
              label='Description'
              id='description'
              name='description'
              placeholder='Description'
              value={ruleName === "" ? "" : description}
              autoFocus={ruleName === "" ? false : true}
              rows={4}
              readOnly
              getValue={() => { }}
              getError={() => { }}
            />
          </div>
        </div>

        <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
          <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
            <Button onClick={() => clearAllData("")} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
              <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
            </Button>
            <Button
              type='submit'
              onClick={handleSubmit}
              className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
              variant='btn-primary'>
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin laptop:mx-[6.5px] laptopMd:mx-[6.5px] lg:mx-[6.5px] xl:mx-[6.5px] hd:mx-[9px] 2xl:mx-[9px] 3xl:mx-[9px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
              </label>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ApprovalDrawer