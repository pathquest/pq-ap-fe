'use client'

import { Button, CheckBox, DataTable, Loader, Radio, Select, Switch, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { lazy, useEffect, useState } from 'react'

// import Extra components
import VisibilityIcon from '@/assets/Icons/notification/VisibilityIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { ModuleData, MonthOptions, TableColumn, TransformedTriggerData, days } from '@/data/notification'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getNotificationMatrix, getSummaryData, saveNotificationMatrix, saveSummaryData, updateSummaryStatus } from '@/store/features/notification/notificationSlice'
import { useSession } from 'next-auth/react'
import ViewEmailPreview from '../ViewEmailPreview'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'

// import Icons
const DoubleArrowDown = lazy(() => import('@/assets/Icons/notification/DoubleArrowDown'))
const EditIcon = lazy(() => import('@/assets/Icons/notification/EditIcon'))
const SpinnerIcon = lazy(() => import('@/assets/Icons/spinnerIcon'))

const Wrapper = lazy(() => import('@/components/Common/Wrapper'))
const TextEditor = lazy(() => import('@/app/setup/notification/__components/TextEditor'))

const columns: TableColumn[] = [
  {
    header: 'MODULE',
    accessor: 'module',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[22%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]', // !w-[22%] max-[439px]
  },
  {
    header: 'TRIGGER',
    accessor: 'trigger',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[33%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]', //!w-[33%] max-[439px]
  },
  {
    header: 'EMAIL',
    accessor: 'email',
    sortable: false,
    colalign: 'center',
    colStyle: '!w-[9%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]',
  },
  {
    header: 'PORTAL',
    accessor: 'portal',
    sortable: false,
    colalign: 'center',
    colStyle: '!w-[9%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]',
  },
  {
    header: 'MOBILE',
    accessor: 'mobile',
    sortable: false,
    colalign: 'center',
    colStyle: '!w-[9%] max-[439px]:!text-xs xsm:!text-sm !tracking-[0.02em]',
  },
  {
    header: '',
    accessor: 'action',
    sortable: false,
    colalign: 'center',
    colStyle: '!w-[15%]',
  },
]

const expandColumns: TableColumn[] = [
  {
    header: '',
    accessor: 'arrowspace',
    sortable: false,
    colalign: 'left',
    colStyle: '!w-[40px]',
  },
  ...columns,
]

const ListNotification: React.FC = () => {
  const dispatch = useAppDispatch()

  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isNotificationEdit = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "Notification", "Edit");

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFooterLoader, setIsFooterLoader] = useState<boolean>(false)
  const [isLoadingBtn, setIsLoadingBtn] = useState<boolean>(false)
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isToggle, setIsToggle] = useState<boolean>(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [isViewTemplate, setIsViewTemplate] = useState<boolean>(false)
  const [editId, setEditId] = useState<number>(3)
  const [viewTemplateId, setViewTemplateId] = useState<number>(3)
  const [selectedFormat, setSelectedFormat] = useState<number>(1)
  const [selectDayofWeek, setSelectdayofWeek] = useState<number>(1)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [monthValue, setMonthValue] = useState<string>('1')
  const [data, setData] = useState<ModuleData[]>([])

  // Fetch List Of Triggeres in Datatable Api
  const getListOfTriggers = async () => {
    setIsLoading(true)
    setIsDisabled(false)
    performApiAction(
      dispatch,
      getNotificationMatrix,
      null,
      (responseData: any) => {
        // SuccessData
        setData(responseData)
        setIsLoading(false)
      },
      () => {
        // ErrorData
        setIsLoading(false)
      }
    )
  }

  // save List Of Triggeres in Datatable Api
  const saveListOfTriggers = async () => {
    setIsDisabled(false)
    const allTriggers: TransformedTriggerData[] = []
    data?.forEach((module) => {
      const triggers = module.Triggers
      triggers.forEach((trigger) => {
        const { MatrixId, Email, Portal, Mobile } = trigger
        allTriggers.push({ MatrixId, Email, Portal, Mobile })
      })
    })

    const params = {
      UserNotificationList: allTriggers,
    }

    performApiAction(dispatch, saveNotificationMatrix, params, () => {
      // SuccessData
      setIsEdit(false)
      Toast.success('Triggers have been saved successfully')
    })
  }

  // Update Summary Status Api
  const updateNotifiactionSummaryStatus = async () => {
    const params = {
      Status: !isToggle,
    }

    performApiAction(dispatch, updateSummaryStatus, params, () => { })
  }

  const setSummaryValues = (
    SummaryType: number,
    Value: string,
    defaultDays: number[],
    defaultDayOfWeek: number,
    defaultMonthValue: string
  ) => {
    if (SummaryType === 1) {
      setSelectedDays(Value.split(',').map(Number))
      setSelectdayofWeek(defaultDayOfWeek)
      setMonthValue(defaultMonthValue)
    } else if (SummaryType === 2) {
      setSelectedDays(defaultDays)
      setSelectdayofWeek(Number(Value))
      setMonthValue(defaultMonthValue)
    } else if (SummaryType === 3) {
      setSelectedDays(defaultDays)
      setSelectdayofWeek(defaultDayOfWeek)
      setMonthValue(Value)
    }
  }

  // Get Summary Data Api
  const getNotifiactionSummaryData = async () => {
    setIsFooterLoader(true)
    performApiAction(dispatch, getSummaryData, null, (responseData: any) => {
      // SuccessData
      if (responseData === null) {
        setSelectedFormat(1)
        setSelectedDays([1, 2, 3, 4, 5])
        setSelectdayofWeek(1)
        setMonthValue('1')
        setIsFooterLoader(false)
      }
      if (responseData) {
        const { SummaryDetails, Status } = responseData
        if (SummaryDetails) {
          const { SummaryType, Value } = SummaryDetails
          setSelectedFormat(SummaryType)
          setIsToggle(Status)
          setIsFooterLoader(false)
          const defaultDays = [1, 2, 3, 4, 5]
          const defaultDayOfWeek = 1
          const defaultMonthValue = '1'
          setSummaryValues(SummaryType, Value, defaultDays, defaultDayOfWeek, defaultMonthValue)
        }
      }
    })
  }

  // Save Summary Data Api
  const saveNotifiactionSummaryData = async () => {
    setIsLoadingBtn(true)
    const params = {
      SummaryType: selectedFormat,
      Value:
        selectedFormat === 3 ? monthValue.toString() : selectedFormat === 2 ? selectDayofWeek.toString() : selectedDays.join(','),
    }

    performApiAction(
      dispatch,
      saveSummaryData,
      params,
      () => {
        // SuccessData
        setIsLoadingBtn(false)
        setIsExpanded(false)
      },
      () => {
        // ErrorData
        setIsLoadingBtn(false)
      }
    )
  }

  useEffect(() => {
    getListOfTriggers()
    getNotifiactionSummaryData()
  }, [CompanyId])

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev)
    if (!isExpanded) {
      getNotifiactionSummaryData()
    }
  }

  const handleToggle = () => {
    setIsToggle(!isToggle)
    updateNotifiactionSummaryStatus()
  }

  const handleEditEmail = (id: number) => {
    setIsEdit(!isEdit)
    setEditId(id)
  }

  const handleReset = () => {
    getListOfTriggers()
    setIsDisabled(false)
    setIsExpanded(false)
  }

  const handleMonthDropdown = (value: string) => {
    setMonthValue(value)
    setIsDisabled(false)
  }

  const handleSaveBtn = () => {
    if (selectedFormat === 1 && selectedDays.length < 2) {
      Toast.error('Please select at least 2 days in order to save')
    } else {
      saveNotifiactionSummaryData()
    }
  }

  const handleModuleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>, moduleId: number, fieldName: string) => {
    setIsDisabled(true)
    const newData = data?.map((module) => {
      if (module.ModuleId === moduleId) {
        const updatedTriggers = module.Triggers.map((trigger) => {
          if (!trigger[`${fieldName}Disable` as keyof typeof trigger]) {
            return {
              ...trigger,
              [fieldName]: event.target.checked,
            }
          }
          return trigger
        })
        return {
          ...module,
          Triggers: updatedTriggers,
        }
      }
      return module
    })
    setData(newData)
  }

  const handleCheckBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    moduleId: number,
    matrixId: number,
    fieldName: string
  ) => {
    setIsDisabled(true)
    const newData = data?.map((module) => {
      if (module.ModuleId === moduleId) {
        const updatedTriggers = module.Triggers.map((trigger) => {
          if (trigger.MatrixId === matrixId && !trigger[`${fieldName}Disable` as keyof typeof trigger]) {
            return {
              ...trigger,
              [fieldName]: event.target.checked,
            }
          }
          return trigger
        })
        return {
          ...module,
          Triggers: updatedTriggers,
        }
      }
      return module
    })
    setData(newData)
  }

  const createNestedCheckBox = (e: any, nestedData: any, type: any) => (
    <CheckBox
      disabled={nestedData[`${type}Disable`]}
      onChange={(event) => handleCheckBoxChange(event, e.ModuleId, nestedData.MatrixId, type)}
      id={`${e.ModuleId}-${nestedData.MatrixId}-${type.toLowerCase()}`}
      checked={nestedData[type]}
    />
  )

  const listOfData = data?.map((e) => {
    const moduleCheckBoxId = `${e.ModuleId}-module`

    const createTriggerCheckBox = (type: any) => {
      const enabledTriggers = e.Triggers.filter((trigger: any) => !trigger[`${type}Disable`])
      const allEnabledTriggersChecked = enabledTriggers.every((trigger: any) => trigger[type])
      const someEnabledTriggersChecked = enabledTriggers.some((trigger: any) => trigger[type])
      const allTriggersDisabled = e.Triggers.every((trigger: any) => trigger[`${type}Disable`])

      return (
        <CheckBox
          id={`${moduleCheckBoxId}-${type.toLowerCase()}`}
          checked={allEnabledTriggersChecked}
          intermediate={someEnabledTriggersChecked && !allEnabledTriggersChecked}
          onChange={(event: any) => handleModuleCheckBoxChange(event, e.ModuleId, type)}
          disabled={allTriggersDisabled}
        />
      )
    }

    return {
      module: <label className='!font-semibold'>{e?.ModuleName}</label>,
      email: createTriggerCheckBox('Email'),
      portal: createTriggerCheckBox('Portal'),
      mobile: createTriggerCheckBox('Mobile'),
      details: (
        <div className='w-full'>
          <DataTable
            sticky
            noHeader
            getExpandableData={() => { }}
            getRowId={() => { }}
            columns={expandColumns}
            data={
              e.Triggers?.length > 0
                ? e.Triggers.map((nestedData) => ({
                  ...nestedData,
                  arrowspace: <span className='p-3'></span>,
                  trigger: nestedData.TriggerName,
                  email: createNestedCheckBox(e, nestedData, 'Email'),
                  portal: createNestedCheckBox(e, nestedData, 'Portal'),
                  mobile: createNestedCheckBox(e, nestedData, 'Mobile'),
                  action: (
                    <div className='tooltip_text h-10 cursor-pointer'>
                      {nestedData.Email && !nestedData.EmailDisable && (
                        <div className='flex items-center justify-center gap-2'>
                          <span className={`flex justify-center items-center h-full ${isNotificationEdit ? "flex" : "hidden"}`} onClick={() => handleEditEmail(nestedData.MatrixId)}>
                            <Tooltip position='bottom' content='Edit Email' className='!px-0'>
                              <EditIcon />
                            </Tooltip>
                          </span>

                          <span className='flex justify-center items-center h-full' onClick={() => { setViewTemplateId(nestedData.MatrixId); setIsViewTemplate(true) }}>
                            <Tooltip position='left' content='View Template' className='!pr-0'>
                              <VisibilityIcon />
                            </Tooltip>
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                }))
                : []
            }
          />
        </div>
      ),
    }
  })

  const mapDays = days.map((day: string, index: number) => (
    <div
      key={index + day}
      className={`flex text-base font-proxima px-[15px] py-[11px] laptop:h-[45px] laptopMd:h-[45px] lg:h-[45px] xl:h-[45px] hd:h-[52px] 2xl:h-[52px] 3xl:h-[52px] laptop:w-[45px] laptopMd:w-[45px] lg:w-[45px] xl:w-[45px] hd:w-[52px] 2xl:w-[52px] 3xl:w-[52px] cursor-pointer items-center justify-center rounded-md border-[1px] border-lightSilver ${selectedFormat === 1 && selectedDays.includes(index)
        ? 'bg-primary text-white'
        : selectedFormat !== 1 && selectDayofWeek === index
          ? 'bg-primary text-white'
          : ''
        }`}
      onClick={() => handleDayClick(index)}
    >
      {day}
    </div>
  ))

  const handleDayClick = (index: number) => {
    if (selectedFormat === 1) {
      // For multi-select
      const updatedSelection = [...selectedDays]
      const selectedIndex = updatedSelection.indexOf(index)
      if (selectedIndex === -1) {
        // If the item is not already selected, add it to the selection
        updatedSelection.push(index)
      } else {
        // If the item is already selected, remove it from the selection
        updatedSelection.splice(selectedIndex, 1)
      }
      setSelectedDays(updatedSelection)
    } else {
      // For single-select
      setSelectdayofWeek(index)
    }
  }

  return (
    <Wrapper masterSettings={true}>
      <div className='h-full'>
        {isEdit ? (
          <TextEditor setIsEdit={setIsEdit} matrixId={editId} />
        ) : (
          <>
            {/* Navbar component */}
            <div className='sticky top-0 z-[6] flex h-[66px] items-center justify-between bg-whiteSmoke px-5'>
              <div className='flex items-center'>
                <label className='font-proxima flex cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Notification</label>
              </div>
              <div className='flex items-center justify-center gap-5'>
                <Button
                  onClick={handleReset}
                  variant={`${!isDisabled ? 'btn-outline' : 'btn-outline-primary'}`}
                  className={`${!isDisabled && 'pointer-events-none'} !bg-transparent btn-sm !h-9 rounded-full`}
                >
                  <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">RESET CHANGES</label>
                </Button>
                <Button
                  type='submit'
                  onClick={saveListOfTriggers}
                  className={`${!isDisabled && 'pointer-events-none'} btn-sm !h-9 rounded-full`}
                  variant={`${!isDisabled ? 'btn' : 'btn-primary'}`}
                >
                  <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                    SAVE
                  </label>
                </Button>
              </div>
            </div>
            {/* Data Table */}
            <div
              className={`approvalMain ${isExpanded ? 'h-[calc(100vh-380px)]' : 'h-[calc(100vh-130px)]'
                } overflow-auto duration-700 ease-in-out max-[425px]:mx-1`}
            >
              <div className={`${data?.length !== 0 && 'h-0'}`}>
                <DataTable
                  columns={columns}
                  data={listOfData ? listOfData : []}
                  hoverEffect={true}
                  sticky
                  expandable
                  isExpanded
                  expandOneOnly={false}
                  getExpandableData={() => ''}
                  getRowId={() => { }}
                />
              </div>
              {data?.length === 0 ? (
                isLoading ? (
                  <div className='flex h-full w-full items-center justify-center'>
                    <Loader size='md' helperText />
                  </div>
                ) : (
                  <div className='flex h-[59px] w-auto items-center justify-center border-b border-b-[#ccc] font-medium'>
                    No records available at the moment.
                  </div>
                )
              ) : (
                ''
              )}
            </div>

            {/* Footer component */}
            {/* <div
              className={`sticky bottom-0 z-[6] flex flex-col px-5 duration-700 ease-in-out ${isExpanded ? 'h-[240px]' : 'h-[74px]'
                } items-start border-t border-lightSilver  `}
              style={{
                boxShadow: "0px -8px 20px 0px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div className='flex w-full items-center justify-between py-5'>
                <div className='flex'>
                  <Typography className='mr-10 flex items-center justify-center text-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
                    How would you like to receive the summary email of items?
                  </Typography>
                  <div className='flex items-center justify-center' onClick={handleToggle}>
                    <Switch checked={isToggle ? true : false} />
                  </div>
                </div>
                <div
                  className={`flex cursor-pointer items-center justify-between ${!isExpanded ? 'rotate-180' : ''}`}
                  onClick={handleToggleExpand}
                >
                  <DoubleArrowDown />
                </div>
              </div>
              {isExpanded &&
                (isFooterLoader ? (
                  <div className='flex h-full w-full items-center justify-center'>
                    <Loader size='sm' helperText />
                  </div>
                ) : (
                  <div className={`${!isToggle ? 'pointer-events-none opacity-70' : ''}`}>
                    <div className='flex'>
                      {['daily', 'weekly', 'monthly'].map((format, index) => (
                        <Radio
                          key={format}
                          id={format}
                          label={format.charAt(0).toUpperCase() + format.slice(1)}
                          name='format'
                          defaultChecked={selectedFormat === index + 1}
                          className='text-[14px]'
                          onChange={() => setSelectedFormat(index + 1)}
                        />
                      ))}
                    </div>
                    <div className='mt-6 h-20'>
                      {selectedFormat === 1 || selectedFormat === 2 ? (
                        <div className='flex gap-2'>{mapDays}</div>
                      ) : selectedFormat === 3 ? (
                        <div className='!w-[363px]'>
                          <Typography type='label' className='text-darkCharcoal'>
                            Select Frequency
                          </Typography>
                          <Select
                            className='!w-[220px]'
                            id='monthly-select-freqency'
                            defaultValue={monthValue}
                            options={MonthOptions}
                            getValue={handleMonthDropdown}
                            getError={() => { }}
                            openTop
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className='bottom-0 mb-[18px] flex h-8 items-center justify-start gap-5'>
                      <Button onClick={() => setIsExpanded(false)} className='btn-sm !h-9 rounded-full' variant='btn-outline-primary'>
                        <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
                      </Button>
                      <Button
                        type='submit'
                        onClick={handleSaveBtn}
                        className={`btn-sm !h-9 rounded-full ${isLoadingBtn && 'pointer-events-none opacity-80'}`}
                        variant={isToggle ? 'btn-primary' : 'btn'}>
                        <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoadingBtn ? "animate-spin mx-[9px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
                          {isLoadingBtn ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
                        </label>
                      </Button>
                    </div>
                  </div>
                ))}
            </div> */}
          </>
        )}
      </div>
      {isViewTemplate && (
        <ViewEmailPreview matrixId={viewTemplateId} isViewOpen={isViewTemplate} onViewClose={() => setIsViewTemplate(false)} />
      )}
    </Wrapper>
  )
}

export default ListNotification
