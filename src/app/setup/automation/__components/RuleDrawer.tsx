import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import { useAppDispatch } from '@/store/configureStore'
import { ruleGetById, saveRule } from '@/store/features/automation/automationSlice'
import { vendorGetDropdownList } from '@/store/features/vendor/vendorSlice'
import { useSession } from 'next-auth/react'
import { Button, Close, CompanyList, Radio, Text, Textarea, Toast, BasicTooltip, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditId: number
  ruleProcessType: string
  listCount?: any
  userOptions: any
  isCompanyDefault: boolean
}


const RuleDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditId, ruleProcessType, listCount, userOptions, isCompanyDefault }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const CompanyName = session?.user?.CompanyName

  const dispatch = useAppDispatch()

  const [isChangeField, setIsChangeField] = useState(false);

  const [ruleName, setRuleName] = useState<string>('')
  const [ruleNameError, setRuleNameError] = useState<boolean>(false)

  const [userList, setUserList] = useState<any>([])
  const [userOptionError, setUserOptionError] = useState<boolean>(false)

  const [vendorOptions, setVendorOptions] = useState([])
  const [vendorList, setVendorList] = useState<any>([])
  const [vendorError, setVendorError] = useState<boolean>(false)

  const [description, setDescription] = useState<string>('')
  const [processType, setProcessType] = useState<string>('')
  // const [isCompanyDefault, setIsCompanyDefault] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false)

  const [initialUserList, setInitialUserList] = useState([]);
  const [initialVendorList, setInitialVendorList] = useState<any>([]);

  const [allVendorValues, setAllVendorValues] = useState<any>([]);
  const [completeDescription, setCompleteDescription] = useState<string>('')


  const setErrorTrue = () => {
    setRuleNameError(true)
    setVendorError(true)
    setUserOptionError(true)
  }

  const initialData = () => {
    setRuleName('')
    setRuleNameError(false)

    setVendorOptions([])
    setVendorList([])
    setVendorError(false)

    setDescription('')
    setCompleteDescription('')

    setUserList([])
    setUserOptionError(false)

    setIsLoading(false)
    // setIsCompanyDefault(false)
    setProcessType('')

    setIsChangeField(false)
    setInitialUserList([])
    setInitialVendorList([])

    setAllVendorValues([])
  }

  const clearAllData = async (type: string) => {
    await setErrorTrue()
    await initialData()
    onClose(type)
  }

  //Rule Get Data API
  const getAutomationRuleDataById = () => {
    const params = {
      RuleId: EditId,
      CompanyId: CompanyId
    }
    performApiAction(dispatch, ruleGetById, params, (responseData: any) => {
      if (responseData) {
        const { IsCompanyDefault, RuleName, RuleDetail, ProcessType, Description } = responseData
        setRuleName(RuleName || '')
        setProcessType(ProcessType || "")
        // setIsCompanyDefault(IsCompanyDefault)

        const wordsToRemove = ["workflowUser", "workflowVendor"];
        const pattern = new RegExp("\\b(" + wordsToRemove.join("|") + ")\\b", "gi");
        const modifiedString = Description.replace(pattern, "");
        setCompleteDescription(Description)
        setDescription(modifiedString)

        const { User, Vendor } = JSON.parse(RuleDetail);
        const userRuleList = User.split(",").map(String);
        setUserList(userRuleList)
        setInitialUserList(userRuleList)
        setAllVendorValues(Vendor)
      }
    });
  };

  useEffect(() => {
    if (!isCompanyDefault) {
      if (allVendorValues == "-1") {
        const allVendorValues: any = vendorOptions.map((option: any) => option.value);
        setVendorList(allVendorValues);
        setInitialVendorList(allVendorValues);
      } else {
        const vendorRuleList = Array.isArray(allVendorValues) ? allVendorValues.map(String) : typeof allVendorValues === 'string' ? allVendorValues.split(",").map(String) : [];
        setVendorList(vendorRuleList)
        setInitialVendorList(vendorRuleList)
      }
    }
  }, [allVendorValues]);

  //Vendor Dropdown List API
  const getAutomationVendorDropdownList = () => {
    const params = {
      RuleId: EditId || 0,
      CompanyId: CompanyId,
      ProcessType: processType || ruleProcessType,
    };
    performApiAction(dispatch, vendorGetDropdownList, params, (responseData: any) => {
      setVendorOptions(responseData);
    });
  };

  const handleInputChange = (value: any, name: string) => {
    const pattern = /^[a-zA-Z0-9 ]*$/
    if (pattern.test(value)) {
      name === 'ruleName' && setRuleName(value)
    }
  }

  const handleFieldChange = () => {
    setIsChangeField(true);
  }

  const handleUserSelect = (value: any) => {
    setUserList(value)
  }

  const handleVendorSelect = (value: any) => {
    setVendorList(value)
  }

  useEffect(() => {
    isCompanyDefault == false && getAutomationVendorDropdownList()
    if (EditId > 0) {
      getAutomationRuleDataById()
    }
  }, [onOpen, EditId,isCompanyDefault])

  // Description
  const handleDescription = () => {
    const userLabels: any = [];
    const vendorLabels: any = [];

    vendorList.map((vendorId: string) => {
      const selectedVendor: any = vendorOptions.find((vendor: any) => vendor.value === vendorId);
      if (selectedVendor) {
        vendorLabels.push(selectedVendor?.label);
      }
    });
    userList.map((userId: string) => {
      const selectedUser: any = userOptions.find((user: any) => user.value === userId);
      if (selectedUser) {
        userLabels.push(selectedUser?.label);
      }
    });
    const selectedUsers = userLabels.join(', ');
    const selectedVendors = vendorLabels.join(', ');
    const userLabel = userLabels.length > 0 ? userLabels.length === 1 ? selectedUsers + " workflowUser" : userLabels[0] + " workflowUser +" + (userLabels.length - 1) + " others" : selectedUsers
    const vendorLabel = vendorLabels.length > 0 ? vendorLabels.length === 1 ? selectedVendors + " workflowVendor" : vendorLabels[0] + " workflowVendor +" + (vendorLabels.length - 1) + " others" : selectedVendors
    const vendorDescription = `The ${ruleName} rule states that all invoices of workflowVendor ${vendorLabel} will be assigned to workflowUser ${userLabel}`
    const companyDescription = `This ${ruleName} rule states that all invoices for ${CompanyName} will be assigned to workflowUser ${userLabel} If no rules are available or any rule fails`
    const descriptionData = isCompanyDefault ? companyDescription : vendorDescription;

    const wordsToRemove = ["workflowUser", "workflowVendor"];
    const pattern = new RegExp("\\b(" + wordsToRemove.join("|") + ")\\b", "gi");
    const modifiedString = descriptionData.replace(pattern, "");
    setCompleteDescription(descriptionData)
    setDescription(modifiedString)
  }

  useEffect(() => {
    handleDescription();
  }, [ruleName, userList, vendorList, onOpen, vendorOptions, userOptions]);

  const modalClose = () => {
    setIsConfirmationModalOpen(false)
  }

  //Save Data API
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    ruleName.trim().length <= 0 && setRuleNameError(true)
    userList.length <= 0 && setUserOptionError(true)
    !isCompanyDefault && vendorList.length <= 0 && setVendorError(true)
    if (ruleName.trim().length > 0 && userList.length > 0 && (!isCompanyDefault ? vendorList.length > 0 : true)
    ) {
      setIsLoading(true)
      const selectedUsersList = userList.join(',');
      let selectedVendorList: any;

      if ((listCount === 0 || listCount === 1) && vendorList.length === vendorOptions.length) {
        selectedVendorList = "-1";
      } else if (vendorList.length === vendorOptions.length) {
        selectedVendorList = "-1";
      } else {
        selectedVendorList = vendorList.join(',');
      }

      const dataObject: any = {
        User: selectedUsersList,
      };
      if (isCompanyDefault === false) {
        dataObject.Vendor = selectedVendorList;
      }

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
        Toast.success(`Rule ${EditId ? 'updated' : 'added'} successfully.`)
        setRuleName('')
        setDescription('')
        clearAllData("Save")
      }, () => {
        setIsLoading(false)
      });
    }
  }

  const handleCloseConfirm = () => {
    if (isChangeField) {
      setIsConfirmationModalOpen(true)
    } else {
      clearAllData("")
    }
  }

  useEffect(() => {
    if (userList.length > 0 || initialUserList.length > 0) {
      const isUserSame =
        initialUserList.length === userList.length &&
        initialUserList.every(user => userList.includes(user));
      !isUserSame && handleFieldChange();
    }
    if (vendorList.length > 0 || initialVendorList.length > 0) {
      const isVendorSame =
        initialVendorList.length === vendorList.length &&
        initialVendorList.every((vendor: any) => vendorList.includes(vendor));
      !isVendorSame && handleFieldChange();
    }
  }, [userList, vendorList])

  const handleModalConfirm = () => {
    setIsConfirmationModalOpen(false)
    clearAllData("")
  }

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 sm:w-2/4 lg:w-2/6 xl:w-2/6 hd:w-[418px] 2xl:w-[418px] 3xl:w-[418px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out`}
      >
        <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
          <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
            {EditId ? 'Edit' : 'Add'} Rule
          </label>
          <div className='pt-2.5' onClick={handleCloseConfirm}>
            <Close variant='medium' />
          </div>
        </div>
        <div className='p-5 mb-12 mt-2 flex-1'>
          <div className='flex w-full overflow-visible gap-2.5'>
            <div className='flex items-center -ml-2.5 '>
              <Radio
                id='company'
                value="Company"
                name='Company'
                checked
                readOnly
                disabled={isCompanyDefault === false ? true : false}
              />

              {isCompanyDefault === false ?
                <BasicTooltip content={`Company rule already exist.`} position='right' className='!p-0 !m-0 !z-[1]' >
                  <Typography type='h6' className={`!mt-[3px] hover:text-primary ${isCompanyDefault === false ? "pointer-events-none opacity-60" : ""}`}>Company</Typography>
                </BasicTooltip>
                : <Typography type='h6' className={`mt-[1px] hover:text-primary cursor-pointer`}>Company</Typography>}
            </div>
            <div className='flex items-center'>
              <Radio
                id='vendor'
                value="Vendor"
                name='Vendor'
                checked
                readOnly
                disabled={isCompanyDefault === true ? true : false}
              />
              {isCompanyDefault === true ?
                <BasicTooltip content={`Company rule can't be changed to vendor.`} position='top' className='!p-0 !m-0 !z-[11]' >
                  <Typography type='h6' className={`mt-[2px] hover:text-primary ${isCompanyDefault === true ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>Vendor</Typography>
                </BasicTooltip>
                : <Typography type='h6' className={`mt-[2px] hover:text-primary cursor-pointer`}>Vendor</Typography>}
            </div>
          </div>
          <div className='laptop:mt-4 laptopMd:mt-4 lg:mt-4 xl:mt-4 hd:mt-5 2xl:mt-5 3xl:mt-5 flex-1'>
            <Text
              label='Rule Name'
              id='ruleName'
              name='ruleName'
              placeholder="Please Enter Rule Name"
              validate
              maxLength={50}
              onChange={handleFieldChange}
              hasError={ruleNameError}
              value={ruleName}
              getValue={(value: any) => {
                handleInputChange(value, 'ruleName')
              }}
              getError={() => { }}
            />
          </div>

          <div className={`laptop:mt-4 laptopMd:mt-4 lg:mt-4 xl:mt-4 hd:mt-5 2xl:mt-5 3xl:mt-5 ${isCompanyDefault === false ? "flex-1" : "hidden"}`}>
            <CompanyList
              id='selectVendor'
              showAvatar={5}
              label='Select Vendor'
              variant='user'
              validate
              avatarSize='x-small'
              options={allVendorValues == "-1" ? vendorOptions : vendorOptions.filter((item: any) => !item.IsUsed).map((i: any) => ({ ...i, isEnable: true }))}
              values={vendorList}
              getValue={(value: any) => {
                handleVendorSelect(value)
                setVendorError(false)
              }}
              getError={() => { }}
              hasError={vendorError}
            />
          </div>
          <div className='laptop:mt-4 laptopMd:mt-4 lg:mt-4 xl:mt-4 hd:mt-5 2xl:mt-5 3xl:mt-5 flex-1'>
            <CompanyList
              id='selectUser'
              showAvatar={5}
              label='Select User'
              variant='user'
              validate
              avatarSize='x-small'
              options={userOptions}
              values={userList}
              getValue={(value: any) => {
                handleUserSelect(value)
                setUserOptionError(false)
              }}
              getError={() => { }}
              hasError={userOptionError}
            />
          </div>
          <div className='laptop:mt-4 laptopMd:mt-4 lg:mt-4 xl:mt-4 hd:mt-5 2xl:mt-5 3xl:mt-5 flex-1'>
            <Textarea
              label='Description'
              id='description'
              name='description'
              placeholder="Description"
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
            <Button onClick={handleCloseConfirm} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
              <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
            </Button>
            <Button
              type='submit'
              onClick={handleSubmit}
              className={`btn-sm !h-9 rounded-full ${isLoading && 'pointer-events-none opacity-80'}`}
              variant='btn-primary'>
              <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin mx-[10px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
              </label>
            </Button>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        title='Save Automation'
        content={`Are you sure you want to leave without saving?`}
        isModalOpen={isConfirmationModalOpen}
        modalClose={modalClose}
        handleSubmit={handleModalConfirm}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />
    </>
  )
}

export default RuleDrawer