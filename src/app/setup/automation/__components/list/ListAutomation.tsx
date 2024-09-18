'use client'

import ApprovalDrawer from '@/app/setup/automation/__components/ApprovalDrawer'
import { Actions } from '@/app/setup/automation/__components/DataTableActions'
import RuleDrawer from '@/app/setup/automation/__components/RuleDrawer'
import ChevronDownIcon from '@/assets/Icons/ChevronDownIcon'
import LineIcon from '@/assets/Icons/LineIcon'
import PlusIcon from '@/assets/Icons/PlusIcon'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch } from '@/store/configureStore'
import { automationGetRuleList, ruleActiveInactive } from '@/store/features/automation/automationSlice'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { companyAssignUser } from '@/store/features/company/companySlice'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { vendorDropdownList, vendorGetDropdownList } from '@/store/features/vendor/vendorSlice'
import { Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy'
import { useSession } from 'next-auth/react'
import { Button, DataTable, Select, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useMemo, useRef, useState } from 'react'

const ListAutomation: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const dispatch = useAppDispatch()

  const automationOptions = [
    { label: 'All Automation Rules', value: 'AllAutomationRules' },
    { label: 'Workflow', value: 'WorkFlow', isEnable: true },
    { label: 'Bill Approval', value: 'BillApproval', isEnable: true },
    { label: 'Payment Approval', value: 'PaymentApproval', isEnable: true },
    { label: 'Purchase Order Approval', value: 'PurchaseOrderApproval', isEnable: false }
  ]

  const divRef = useRef<HTMLDivElement>(null);
  const [automationRuleOptions, setAutomationRuleOptions] = useState<any>(automationOptions)
  const [isOpenRuleDrawer, setIsOpenRuleDrawer] = useState<boolean>(false)
  const [isOpenApprovalDrawer, setIsOpenApprovalDrawer] = useState<boolean>(false)
  const [isULOptionOpen, setIsULOptionOpen] = useState<boolean>(false)
  const [isDefaultCompany, setIsDefaultCompany] = useState<boolean>(false)
  const [workflowEditRuleId, setWorkflowEditRuleId] = useState<number | null>(0)
  const [isCompanyDefault, setIsCompanyDefault] = useState<boolean>(false)
  const [approvalEditRuleId, setApprovalEditRuleId] = useState<number | null>(0)
  const [removeRuleId, setRemoveRuleId] = useState<number | null>(0)
  const [ruleStatus, setRuleStatus] = useState<number>(0)
  const [automationRule, setAutomationRule] = useState<string>(automationRuleOptions[0].value)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [automationList, setAutomationList] = useState<any>([])
  const [processType, setProcessType] = useState<string>('')
  const [vendorOptions, setVendorOption] = useState<any>([])
  const [allVendorOption, setAllVendorOption] = useState<any>([])
  const [userOptions, setUserOption] = useState([])
  const [locationOptions, setLocationOption] = useState([])
  const [paymentMethodOptions, setPaymentMethodOption] = useState<any>([])
  const [listOption, setListOption] = useState<any>([])
  const [workflowDataCount, setWorkflowDataCount] = useState<number>(0)

  const columns: any = [
    {
      header: 'RULE NAME',
      accessor: 'ruleName',
      sortable: false,
      colStyle: '!pl-5 !w-[5%] !tracking-[0.02em]',
    },
    {
      header: automationRule == "AllAutomationRules" ? 'PROCESS' : "RULE TYPE",
      accessor: 'process',
      sortable: false,
      colStyle: '!w-[5%] !tracking-[0.02em]',
    },
    {
      header: 'DESCRIPTION',
      accessor: 'description',
      sortable: false,
      colStyle: '!w-[20%] !tracking-[0.02em]',
    },
    {
      header: '',
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[1%]',
      colalign: "right"
    }
  ]

  const handleMenuChange = (actionName: string, id: number, optionalData: any, defaultCompany: any) => {
    switch (actionName) {
      case 'Edit':
        switch (optionalData) {
          case "WorkFlow":
            setIsCompanyDefault(defaultCompany)
            setWorkflowEditRuleId(id)
            setIsOpenRuleDrawer(true);
            setProcessType("WorkFlow");
            break
          case "BillApproval":
            setProcessType("BillApproval");
            if (defaultCompany) {
              setIsCompanyDefault(defaultCompany)
              setWorkflowEditRuleId(id)
              setIsOpenRuleDrawer(true);
            }
            else {
              setApprovalEditRuleId(id);
              setIsOpenApprovalDrawer(true);
            }
            break
          case "PaymentApproval":
            setProcessType("PaymentApproval");
            if (defaultCompany) {
              setIsCompanyDefault(defaultCompany)
              setWorkflowEditRuleId(id)
              setIsOpenRuleDrawer(true);
            }
            else {
              setApprovalEditRuleId(id);
              setIsOpenApprovalDrawer(true);
            }
            break
          default:
            break
        }
        break
      case 'Active':
        setIsDefaultCompany(defaultCompany)
        setRemoveRuleId(id)
        setRuleStatus(1)
        setIsStatusModalOpen(true)
        break
      case 'Inactive':
        setIsDefaultCompany(defaultCompany)
        setRemoveRuleId(id)
        setRuleStatus(0)
        setIsStatusModalOpen(true)
        break
      case 'Remove':
        setIsDefaultCompany(defaultCompany)
        setRemoveRuleId(id)
        setRuleStatus(0)
        setIsRemoveModalOpen(true)
        break
      default:
        break
    }
  }

  //Rule List API
  const getAutomationRuleList = () => {
    setIsLoading(true);
    const params = {
      CompanyId: CompanyId,
      PageNumber: 1,
      PageSize: 1000
    }
    performApiAction(dispatch, automationGetRuleList, params, (responseData: any) => {
      setAutomationList(responseData.RuleList)
      setIsLoading(false)
    });
  };

  useEffect(() => {
    getAutomationRuleList();
  }, [refreshTable, CompanyId]);

  //Rule Status(Active/Inactive) API
  const ruleStatusUpdate = () => {
    setIsLoading(true);
    setAutomationList([])
    const params = {
      RuleId: removeRuleId,
      ActiveInActive: ruleStatus === 0 ? false : true,
      CompanyId: CompanyId
    }
    modalClose()
    performApiAction(dispatch, ruleActiveInactive, params, () => {
      Toast.success(`Rule ${ruleStatus === 0 ? isDefaultCompany ? "Inactivated" : "removed" : "activated"} successfully.`)
      setRefreshTable(!refreshTable)
    });
  };

  // Filter Datatable Data
  const FilteredData = useMemo(() => {
    if (automationRule === 'AllAutomationRules') {
      return automationList;
    }
    return automationList.filter((item: any) =>
      item.ProcessType == automationRule.replace(/ /g, "")
    );

  }, [automationList, automationRule]);

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
  const getVendorDropdownList = () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, vendorDropdownList, params, (responseData: any) => {
      setVendorOption(responseData);
    });
  };

  //Vendor Dropdown Filter List API
  const getAllVendorGetDropdownList = () => {
    const params = {
      RuleId: workflowEditRuleId || 0,
      ProcessType: "WorkFlow",
      CompanyId: CompanyId,
    };
    performApiAction(dispatch, vendorGetDropdownList, params, (responseData: any) => {
      setRefreshTable(true)
      if (responseData.every((item: any) => item.IsUsed === true)) {
        setAllVendorOption([]);
      } else {
        setAllVendorOption(responseData);
      }
    });
  };

  useEffect(() => {
    setAutomationRuleOptions((prevOptions: any) => {
      return prevOptions.map((option: any) => {
        if (option.value === "WorkFlow") {
          return {
            ...option,
            isEnable: allVendorOption.length !== 0
          };
        }
        return option;
      });
    });
  }, [allVendorOption]);

  //Location Dropdown List API
  const getLocationDropdownList = () => {
    const params = {
      CompanyId: CompanyId,
    }
    performApiAction(dispatch, locationListDropdown, params, (responseData: any) => {
      setLocationOption(responseData);
    });
  };

  //Payment Method Dropdown List API
  const getPaymentMethodDropdownList = () => {
    performApiAction(dispatch, getPaymentMethods, null, (responseData: any) => {
      setPaymentMethodOption(responseData);
    });
  };

  useEffect(() => {
    getVendorDropdownList()
    getLocationDropdownList()
    getPaymentMethodDropdownList()
    getUserDropdownList()
  }, [])

  useEffect(() => {
    getAllVendorGetDropdownList()
  }, [automationRule, refreshTable])

  const automationListData = automationList && FilteredData?.map((e: any) => {
    const descriptionWords = e?.Description.split(/\s+/)

    // Parse the RuleDetail JSON string
    const ruleDetail = JSON.parse(e?.RuleDetail || '{}')

    const getPreviousWord = (value: any) => {
      switch (value) {
        case "approvalVendor":
          const vendorCondition = ruleDetail?.Conditions?.find((condition: any) => condition.Field === 'Vendor')
          const vendorValue = vendorCondition ? vendorCondition.Value.split(",").slice(1) : ''
          let vendorList = vendorCondition.Value == "-1" ? vendorOptions.map((option: any) => option.label).slice(1) : vendorOptions.filter((option: any) => vendorValue.includes(option.value)).map((option: any) => option.label);
          setListOption(vendorList)
          break;
        case "approvalLocation":
          const locationCondition = ruleDetail?.Conditions?.find((condition: any) => condition.Field === 'Location')
          const locationValue = locationCondition ? locationCondition.Value.split(",").slice(1) : ''
          let locationList = locationCondition.Value == "-1" ? locationOptions.map((option: any) => option.label).slice(1) : locationOptions.filter((option: any) => locationValue.includes(option.value)).map((option: any) => option.label);
          setListOption(locationList)
          break;
        case "approvalPaymentMethod":
          const paymentMethodCondition = ruleDetail?.Conditions?.find((condition: any) => condition.Field === 'Payment Method')
          const paymentMethodValue = paymentMethodCondition ? paymentMethodCondition.Value.split(",").slice(1) : ''
          let paymentMethodList = paymentMethodOptions.filter((option: any) => paymentMethodValue.includes(option.value)).map((option: any) => option.label);
          setListOption(paymentMethodList)
          break;
        case "workflowUser":
          const userValue = ruleDetail?.User.split(",").slice(1)
          let userList = userOptions.filter((option: any) => userValue.includes(option.value)).map((option: any) => option.label);
          setListOption(userList)
          break;
        case "workflowVendor":
          if (ruleDetail?.Vendor == "-1") {
            const allVendorValues: any = vendorOptions.map((option: any) => option.label).slice(1);
            setListOption(allVendorValues);
          } else {
            const workflowVendorValue = ruleDetail?.Vendor.split(",").slice(1)
            let workflowVendorList = vendorOptions.filter((option: any) => workflowVendorValue.includes(option.value)).map((option: any) => option.label);
            setListOption(workflowVendorList)
          }
          break;
        default:
          break;
      }
    }

    return new Object({
      ruleName: <Typography className={`!pl-3 ${e?.IsActive ? '' : 'opacity-[50%]'} !tracking-[0.02em]`}>{e?.RuleName}</Typography>,
      process: <Typography className={`${e?.IsActive ? '' : 'opacity-[50%]'} !tracking-[0.02em]`}> {e?.ProcessType == "WorkFlow" ? "Workflow" : e?.ProcessType.replace(/([A-Z])/g, ' $1')}</Typography>,
      description: <Typography className={`${e?.IsActive ? '' : 'opacity-[50%]'} !tracking-[0.02em]`}>
        {descriptionWords.map((word: any, index: any) => {
          if (/^\+\d+/.test(word)) {
            const previousWord = index > 0 ? descriptionWords[index - 1] : null;

            return (
              <Dropdown key={word + index}>
                <MenuButton className={`!max-h-0 !min-h-0 !border-none !px-0 !outline-none ${e?.IsActive ? '' : 'pointer-events-none'}`}>
                  <span className='pr-1 text-primary' onClick={() => getPreviousWord(previousWord)}> {`${word}`}</span>
                </MenuButton>
                <Menu className='!w-[250px] !max-h-64 !text-sm  !border-none !px-0 vertical-scroll custom-scroll-filter !outline-none' style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)' }}>
                  {listOption.map((value: any) => (
                    <MenuItem key={value + index + word} className='!cursor-default !pointer-events-none'>{value}</MenuItem>
                  ))}
                </Menu>
              </Dropdown>
            );
          } else {
            // Remove the words
            const wordsToRemove = ["approvalVendor", "approvalLocation", "approvalPaymentMethod", "workflowVendor", "workflowUser"];
            const pattern = new RegExp("\\b(" + wordsToRemove.join("|") + ")\\b", "gi");
            const modifiedString = word.replace(pattern, "");

            //Color the words
            const combinedPattern = /\b(?:approvalLocation|approvalVendor|approvalPaymentMethod|workflowVendor|workflowUser)\b(.*?)(?:approvalLocation|approvalVendor|approvalPaymentMethod|workflowVendor|workflowUser)/g;
            const matches = e?.Description.match(combinedPattern) || [];
            const matchesString = matches && matches.length > 0 ? matches.join(" ") : '';
            const isMatch = matchesString.split(" ").some((match: any) => modifiedString.includes(match.trim()));
            const hasMatches = matches && matches.length > 0;

            if (hasMatches && isMatch && !['vendor', 'is', 'not', ',', '.', 'whose', 'location', 'methods', 'are'].includes(word)) {
              return (
                <span className={`${matches.includes(word) ? "" : "text-primary font-semibold"}`} key={modifiedString + index}>{modifiedString} </span>
              );
            } else {
              return (
                <span key={modifiedString + index}>{modifiedString} </span>
              );
            }
          }
        })}
      </Typography>,
      action: <Actions
        id={e?.RuleId}
        optionalData={e?.ProcessType}
        defaultCompany={e?.IsCompanyDefault}
        actions={
          !e?.IsCompanyDefault
            ? ['Edit', 'Remove']
            : e?.IsActive
              ? ['Edit', 'Inactive']
              : ['Active']
        }
        handleClick={handleMenuChange}
      />,
    })
  })

  useEffect(() => {
    const workflowCount = automationList.filter((list: any) => !list.IsCompanyDefault && list.ProcessType == "workflow").length
    setWorkflowDataCount(workflowCount)
  }, [automationList])

  const handleToggleChange = () => {
    switch (automationRule) {
      case 'AllAutomationRules':
        setIsULOptionOpen(!isULOptionOpen);
        break
      case 'WorkFlow':
        setIsOpenRuleDrawer(!isOpenRuleDrawer);
        setProcessType("WorkFlow");
        break
      case 'BillApproval':
        setIsOpenApprovalDrawer(!isOpenApprovalDrawer);
        setProcessType("BillApproval");
        break
      case 'PaymentApproval':
        setIsOpenApprovalDrawer(!isOpenApprovalDrawer);
        setProcessType("PaymentApproval");
        break
      case 'PurchaseOrderApproval':
        setIsOpenApprovalDrawer(!isOpenApprovalDrawer);
        setProcessType("PurchaseOrderApproval");
        break
      default:
        break
    }
  }

  // Dropdown Item Selection
  const handleSelectedOptionOpen = (option: any) => {
    switch (option) {
      case 'Workflow':
        setIsOpenRuleDrawer(!isOpenRuleDrawer);
        setProcessType("WorkFlow");
        break
      case 'Bill Approval':
        setIsOpenApprovalDrawer(!isOpenApprovalDrawer);
        setProcessType("BillApproval");
        break
      case 'Payment Approval':
        setIsOpenApprovalDrawer(!isOpenApprovalDrawer);
        setProcessType("PaymentApproval");
        break
      case 'Purchase Order Approval':
        setIsOpenApprovalDrawer(!isOpenApprovalDrawer);
        setProcessType("PurchaseOrderApproval");
        break
      default:
        break
    }
  }

  const modalClose = () => {
    setIsStatusModalOpen(false);
    setIsRemoveModalOpen(false);
    setRemoveRuleId(0)
    setRuleStatus(0)
    setIsDefaultCompany(false)
  }

  // Clicked outside the UL
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setIsULOptionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDrawerClose = (type: string) => {
    setIsOpenRuleDrawer(false);
    setIsOpenApprovalDrawer(false);
    setRuleStatus(0);
    setProcessType('');
    setWorkflowEditRuleId(0);
    setApprovalEditRuleId(0);
    setRemoveRuleId(0);
    setIsCompanyDefault(false);

    if (type === "Save") {
      setRefreshTable(!refreshTable)
    }
  }

  return (
    <Wrapper masterSettings={true}>
      {/* NavBar  */}
      <div className='sticky  top-0 z-[6] flex !h-[66px] items-center justify-between bg-whiteSmoke px-5'>
        <div className='flex place-content-center !w-[250px]'>
          <Select
            id='automationRule'
            options={automationOptions}
            defaultValue={automationRule}
            noborder
            getValue={(value: any) => {
              setAutomationRule(value)
            }}
            getError={() => { }}
          />
        </div>
        <div ref={divRef} className='flex relative items-center'>
          <Button className={`rounded-full !px-5 !h-9 ${allVendorOption.length === 0 && automationRule == "WorkFlow" ? "pointer-events-none" : ""}`} variant={`${allVendorOption.length === 0 && automationRule == "WorkFlow" ? "btn" : "btn-primary"}`} onClick={() => handleToggleChange()} >
            <div className='flex gap-2'>
              <span className='flex items-center'> <PlusIcon color={'white'} /></span>
              <label className={`flex items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base !font-semibold tracking-wide cursor-pointer ${allVendorOption.length === 0 && automationRule == "WorkFlow" ? "opacity-50" : "opacity-100"} ${automationRule !== 'AllAutomationRules' && '!pr-2'} items-center justify-center text-center`}> CREATE RULE
                {automationRule === 'AllAutomationRules' && (
                  <>
                    <span className='ml-5 mr-4 py-1 h-full bg-pureWhite !w-[1px]' />
                    <span className={`transition-transform ${isULOptionOpen ? "rotate-180 duration-400" : "duration-200"}`}>
                      <ChevronDownIcon />
                    </span>
                  </>)}</label>
            </div>
          </Button>

          {/* Automation Process Option Modal */}
          {automationRule === 'AllAutomationRules' && (
            <ul className={`absolute overflow-y-auto transition-transform end-0 border border-lightSilver top-10 z-[10] mt-[1px] w-[250px] rounded-md bg-white shadow-lg
            ${isULOptionOpen ? 'max-h-[500px] translate-y-0 opacity-100 transition-opacity duration-300' : 'max-h-0 translate-y-10 opacity-0 transition-opacity duration-300'} ease-out`}>
              {automationRuleOptions.slice(1).map((option: any, index: number) => (
                <li onClick={() => handleSelectedOptionOpen(option.label)} key={option.label + index} className={`h-[44px] py-[10px] px-[15px] hover:bg-whiteSmoke cursor-pointer rounded-md ${option.isEnable ? "" : "pointer-events-none opacity-70"}`}>
                  <Typography type='h6'>{option.label}</Typography>
                </li>
              ))}
            </ul>)}
        </div>
      </div>

      {/* DataTable */}
      <div className='h-[calc(100vh-145px)] approvalMain overflow-auto custom-scroll max-[425px]:mx-1'>
        <div className={`${FilteredData.length === 0 ? 'h-11' : 'h-auto'}`}>
          <DataTable
            columns={columns}
            data={automationList.length > 0 ? automationListData : []}
            hoverEffect={true}
            sticky
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={FilteredData} />
      </div>

      {/* Sync Modal */}
      <ConfirmationModal
        title='Status'
        content={`Are you sure you want to ${ruleStatus === 0 ? "Inactive" : "Active"} this company rule?`}
        isModalOpen={isStatusModalOpen}
        modalClose={modalClose}
        handleSubmit={ruleStatusUpdate}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {/* Remove Modal */}
      <ConfirmationModal
        title='Remove'
        content={`Are you sure you want to remove this vendor rule?`}
        isModalOpen={isRemoveModalOpen}
        modalClose={modalClose}
        handleSubmit={ruleStatusUpdate}
        colorVariantNo='btn-outline-error'
        colorVariantYes='btn-error'
      />

      {/* Rule Drawer */}
      <RuleDrawer ruleProcessType={processType} EditId={workflowEditRuleId ? workflowEditRuleId : 0} onOpen={isOpenRuleDrawer} isCompanyDefault={isCompanyDefault} onClose={(value) => handleDrawerClose(value)} listCount={workflowDataCount} userOptions={userOptions} />

      {/* Rule Drawer */}
      <ApprovalDrawer ruleProcessType={processType == "" ? "" : processType} EditId={approvalEditRuleId ? approvalEditRuleId : 0} onOpen={isOpenApprovalDrawer} onClose={(value) => handleDrawerClose(value)} automationListData={automationList} />

      {/* Drawer Overlay */}
      <DrawerOverlay isOpen={isOpenRuleDrawer || isOpenApprovalDrawer} onClose={undefined} />

    </Wrapper>
  )
}

export default ListAutomation