import PlusCircleIcon from '@/assets/Icons/PlusCircleIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { useAppDispatch } from '@/store/configureStore'
import { ruleGetById, saveRule } from '@/store/features/automation/automationSlice'
import { companyAssignUser, getManageConfiguration, saveManageConfiguration } from '@/store/features/company/companySlice'
import { locationGetDropdownList } from '@/store/features/master/dimensionSlice'
import { vendorGetDropdownList } from '@/store/features/vendor/vendorSlice'
import { Accordion, Button, CheckBox, Close, CompanyList, DataTable, Datepicker, Radio, Select, Switch, Text, Textarea, Toast, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useState } from 'react'

import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getPaymentMethods } from '@/store/features/billsToPay/billsToPaySlice'
import { useSession } from 'next-auth/react'
import ChevronDown from '@/components/Common/Dropdown/Icons/ChevronDown'
import InfoIcon from '@/assets/Icons/infoIcon'
import { formatDate, utcFormatDate } from '@/components/Common/Functions/FormatDate'

interface DrawerProps {
  onOpen: boolean
  onClose: (value: string) => void
  EditCompanyId: number
  AccountingTool: number
}

const ManageConfigurationDrawer: React.FC<DrawerProps> = ({ onOpen, onClose, EditCompanyId, AccountingTool }) => {
  const dispatch = useAppDispatch()

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const deleteDocumentHistoryOptions = [
    { label: '30', value: '30' },
    { label: '60', value: '60' },
    { label: '90', value: '90' },
    { label: '180', value: '180' },
  ]

  const syncOptions = [
    { label: 'Periodic Sync', value: '1' },
    { label: 'Smart Sync', value: '2' },
  ]

  const HourlyOptions = [
    { label: 'Hour', value: '1' },
    { label: 'Two Hour', value: '2' },
    { label: 'Four Hour', value: '4' },
    { label: 'Eight Hour', value: '8' },
    { label: 'Twelve Hour', value: '12' },
  ]

  const DaysOptions = [
    { label: 'Daily', value: '1' },
    { label: 'Two Days', value: '2' },
    { label: 'Three Days', value: '3' },
    { label: 'Four Days', value: '4' },
    { label: 'Five Days', value: '5' },
  ]

  const MonthOptions = [
    { label: 'First Day of the Month', value: '1' },
    { label: '15th Day of the Month', value: '2' },
    { label: 'Last Day of the Month', value: '3' },
    { label: 'Custom', value: '4' },
  ]

  const initialExpandSection = {
    addTat: false,
    deleteDocumentHistory: false,
    purchaseOrder: false,
    permission: false,
    sync: false,
    indexing: false,
    ocr: false,
  }

  const [expandedSection, setExpandedSection] = useState(initialExpandSection);
  const [addTat, setAddTat] = useState<string>('')

  const [deleteDocumentHistory, setDeleteDocumentHistory] = useState<string>('30')
  const [syncTypeValue, setSyncTypeValue] = useState<string>('1')
  const [hourlySyncValue, setHourlySyncValue] = useState<string>('1')
  const [inDaysSyncValue, setInDaysSyncValue] = useState<string>('1')
  const [monthlySyncValue, setMonthlySyncValue] = useState<string>('1')

  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [chartPeriodDate, setChartPeriodDate] = useState<string>('')

  const [isPurchaseOrderEnable, setIsPurchaseOrderEnable] = useState<boolean>(false)
  const [isIndexingEnable, setIsIndexingEnable] = useState<boolean>(false)
  const [isOCREnable, setIsOCREnable] = useState<boolean>(false)

  const [isHourlySelected, setIsHourlySelected] = useState<boolean>(true)
  const [isInDaysSelected, setIsInDaysSelected] = useState<boolean>(false)
  const [isWeeklySelected, setIsWeeklySelected] = useState<boolean>(false)
  const [isMonthlySelected, setIsMonthlySelected] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const subHeaders: any = [
    {
      header: 'MODULE',
      accessor: 'module',
      sortable: false,
      colalign: 'left',
      colStyle: '!pl-[25px] !tracking-[0.02em]',
    },
    {
      header: '',
      accessor: 'checkBox',
      sortable: false,
      colalign: 'center',
      colStyle: '!tracking-[0.02em]',
    }
  ]

  const subHeaders2: any = [
    {
      header: 'MODULE',
      accessor: 'module',
      sortable: false,
      colalign: 'left',
      colStyle: '!tracking-[0.02em]',
    },
    {
      header: '',
      accessor: 'checkBox',
      sortable: false,
      colalign: 'center',
      colStyle: '!tracking-[0.02em]',
    }
  ]

  const dataForTable1 = [
    {
      module: <label className='ml-[17px]'>Dashboard</label>,
      checkBox: <CheckBox id={"1"} checked={true}
      />,
    },
    {
      module: <label className='ml-[17px]'>Bills</label>,
      checkBox: <CheckBox id={"2"} checked={false}
      />,
    },
    {
      module: <label className='ml-[17px]'>Approvals</label>,
      checkBox: <CheckBox id={"3"} checked={false}
      />,
    },
    {
      module: <label className='ml-[17px]'>Vendor</label>,
      checkBox: <CheckBox id={"4"} checked={false}
      />,
    },
  ]

  const dataForTable2 = [
    {
      module: "Purchase Order",
      checkBox: <CheckBox id={"5"} checked={false}
      />,
    },
    {
      module: "Payments",
      checkBox: <CheckBox id={"6"} checked={false}
      />,
    },
    {
      module: "Reports",
      checkBox: <CheckBox id={"7"} checked={false}
      />,
    },
  ]

  const initialData = () => {
    setExpandedSection(initialExpandSection)

    setAddTat('')
    setIsPurchaseOrderEnable(false)

    setIsLoading(false)

    setDeleteDocumentHistory('30')
    setSyncTypeValue('')
    setHourlySyncValue('')
    setInDaysSyncValue('')
    setMonthlySyncValue('')
  }

  const clearAllData = async (type: string) => {
    await initialData()
    onClose(type)
  }

  const handleRowExpand = (section: any) => {
    setExpandedSection((prevState: any) => ({
      ...prevState,
      [section]: !prevState[section]
    }));
  };

  const purchaseOrderToggle = (actionName: string) => {
    switch (actionName) {
      case 'purchaseOrder':
        setIsPurchaseOrderEnable(!isPurchaseOrderEnable)
        break
      case 'indexing':
        setIsIndexingEnable(!isIndexingEnable)
        break
      case 'ocr':
        setIsOCREnable(!isOCREnable)
        break
      default:
        break
    }
  }

  const handleRadioSelection = (label: string) => {
    setIsHourlySelected(label === 'hourly')
    setIsInDaysSelected(label === 'inDays')
    setIsMonthlySelected(label === 'monthly')
    setIsWeeklySelected(label === 'weekly')
  }

  const handleValueSelection = (value: string) => {
    if (isHourlySelected) {
      setHourlySyncValue(value)
    } else if (isInDaysSelected) {
      setInDaysSyncValue(value)
    } else if (isMonthlySelected) {
      setMonthlySyncValue(value)
    }
  }

  const getCompanyListById = () => {
    const params = {
      CompanyId: EditCompanyId ?? 0,
    }
    performApiAction(dispatch, getManageConfiguration, params, (responseData: any) => {
      const { IsOCR, IsIndexing, IsLineItem, DeleteFilesInDays, Tat, Sync } = responseData
      setAddTat(Tat + "" ?? "0")
      setDeleteDocumentHistory(DeleteFilesInDays + "" ?? "30")

      const syncData = JSON.parse(Sync);
      const { SyncType, SyncMethod, SyncData } = syncData;
      setSyncTypeValue(SyncType ?? "1")

      const syncSelectionState: any = {
        "1": { isHourly: true, isMonthly: false, isWeekly: false, isInDays: false },
        "2": { isHourly: false, isMonthly: false, isWeekly: false, isInDays: true },
        "3": { isHourly: false, isMonthly: false, isWeekly: true, isInDays: false },
        "4": { isHourly: false, isMonthly: true, isWeekly: false, isInDays: false }
      };
      const { isHourly, isMonthly, isWeekly, isInDays } = syncSelectionState[SyncMethod] || {};

      if (SyncMethod == "1") {
        setHourlySyncValue(SyncData)
      } else if (SyncMethod == "2") {
        setInDaysSyncValue(SyncData)
      }
      else if (SyncMethod == "3") {
        const arrDays = SyncData.split(",").map(Number);
        setSelectedDays(arrDays)
      } else {
        const hasT000000InSyncData = (syncData: string): boolean => {
          return syncData.includes("T00:00:00");
        }
        const hasSpecificTimeFormat = hasT000000InSyncData(SyncData);

        if (hasSpecificTimeFormat) {
          setChartPeriodDate(formatDate(SyncData));
          setMonthlySyncValue("4")
        } else {
          setMonthlySyncValue(SyncData)
        }
      }

      setIsHourlySelected(isHourly);
      setIsMonthlySelected(isMonthly);
      setIsWeeklySelected(isWeekly);
      setIsInDaysSelected(isInDays);
    })
  }

  useEffect(() => {
    if (onOpen && EditCompanyId > 0) {
      getCompanyListById()
    }
  }, [onOpen, EditCompanyId])

  const handleSubmit = () => {
    setIsLoading(true)

    let syncData: any = "1";
    let syncMethod = "1";

    if (syncTypeValue === "1") { // Periodic Sync
      if (isHourlySelected) {
        syncMethod = "1"
        syncData = hourlySyncValue;
      } else if (isInDaysSelected) {
        syncMethod = "2"
        syncData = inDaysSyncValue;
      } else if (isWeeklySelected) {
        syncMethod = "3"
        syncData = "7"; // Weekly
        syncData = selectedDays.sort().join(','); // Comma-separated string of selected days
      } else if (isMonthlySelected) {
        syncMethod = "4"
        syncData = "30"; // Monthly
        if (monthlySyncValue === "4" && chartPeriodDate) {
          // If custom date is selected, use the date
          syncData = utcFormatDate(chartPeriodDate)
        } else {
          syncData = monthlySyncValue;
        }
      }
    } else { // Smart Sync
      syncMethod = "0"; // Indicating real-time sync
    }

    const syncParam = JSON.stringify({
      SyncType: syncTypeValue,
      SyncMethod: syncMethod,
      SyncData: syncData
    });

    const params = {
      CompanyId: EditCompanyId ?? 0,
      IsOCR: false,
      IsIndexing: false,
      IsLineItem: false,
      DeleteFilesInDays: Number(deleteDocumentHistory) ?? 30,
      Tat: Number(addTat) ?? 0,
      Sync: syncParam
    }
    performApiAction(dispatch, saveManageConfiguration, params, (response: any) => {
      Toast.success('Details Updated!')
      setIsLoading(false)
      clearAllData('Save')
    }, () => {
      setIsLoading(false)
    })
  }

  const mapDays = days.map((day: string, index: number) => (
    <div key={index + day}
      className={`flex text-base font-proxima laptop:h-[45px] laptopMd:h-[45px] lg:h-[45px] xl:h-[45px] hd:h-[52px] 2xl:h-[52px] 3xl:h-[52px] laptop:w-[45px] laptopMd:w-[45px] lg:w-[45px] xl:w-[45px] hd:w-[52px] 2xl:w-[52px] 3xl:w-[52px] cursor-pointer items-center justify-center rounded-md border-[1px] border-lightSilver ${selectedDays.includes(index)
        ? 'bg-primary text-white'
        : ''
        }`}
      onClick={() => handleDayClick(index)}
    >
      {day}
    </div>
  ))

  const handleDayClick = (index: number) => {
    const updatedSelection = [...selectedDays]
    const selectedIndex = updatedSelection.indexOf(index)
    if (selectedIndex === -1) {
      updatedSelection.push(index)
    } else {
      updatedSelection.splice(selectedIndex, 1)
    }
    setSelectedDays(updatedSelection)
  }


  const handleInputChange = (value: any) => {
    const pattern = /^([0-9]{0,2})$/;
    if (pattern.test(value)) {
      setAddTat(value)
    }
  }

  return (
    <div className={`fixed right-0 top-0 z-10 flex h-screen flex-col justify-between overflow-y-auto bg-white shadow max-[440px]:w-11/12 xsm:w-4/5 sm:w-4/5 md:w-[62%] lg:w-[62%] xl:w-[62%] hd:w-[950px] 2xl:w-[950px] 3xl:w-[950px] ${onOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
      <div className='sticky top-0 z-[11] flex items-center justify-between border-b border-lightSilver bg-white px-5'>
        <label className='laptop:py-5 laptopMd:py-5 lg:py-5 xl:py-5 hd:py-[23px] 2xl:py-[23px] 3xl:py-[23px] font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>
          Manage Configuration
        </label>
        <div className='pt-2.5' onClick={() => clearAllData("")}>
          <Close variant='medium' />
        </div>
      </div>

      <div className='flex-1 overflow-auto custom-scroll'>
        {/* Add TAT */}
        <div className='border-b border-slatyGrey'>
          <div className={`w-full flex h-[54px] ${expandedSection.addTat ? "bg-whiteSmoke" : "bg-white"}`}>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.addTat ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('addTat')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>ADD TAT</div>
          </div>
          <div className={`${expandedSection.addTat ? "flex-1 w-[300px] ml-[32px]" : "hidden"} p-5`}>
            <Text
              label='Add TAT'
              id='addTat'
              name='addTat'
              placeholder='Enter No. of Hours'
              value={addTat}
              getValue={(value) => handleInputChange(value)}
              getError={() => { }}
            />
            <label htmlFor="addTat" className='text-sm font-proxima text-slatyGrey tracking-[0.02em]'>Value should not be in decimal format</label>
          </div>
        </div>

        {/* Delete Document History */}
        <div className='border-b border-slatyGrey'>
          <div className={`w-full flex h-[54px] ${expandedSection.deleteDocumentHistory ? "bg-whiteSmoke" : "bg-white"}`}>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.deleteDocumentHistory ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('deleteDocumentHistory')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>DELETE DOCUMENT HISTORY</div>
          </div>
          <div className={`${expandedSection.deleteDocumentHistory ? "flex w-[300px] ml-[32px] gap-5" : "hidden"} p-5`}>
            <div className='w-[100px]'>
              <Select
                id='deleteDocumentHistory'
                name='deleteDocumentHistory'
                defaultValue={deleteDocumentHistory}
                search
                placeholder={30}
                options={deleteDocumentHistoryOptions}
                getValue={(value) => {
                  setDeleteDocumentHistory(value)
                }}
                getError={() => { }}
              />
            </div>
            <label htmlFor="addTat" className='text-base font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>Days</label>
          </div>
        </div>

        {/* Purchase Order */}
        {/* <div className='border-b border-slatyGrey'>
          <div className='w-full flex h-[54px]'>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.purchaseOrder ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('purchaseOrder')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>PURCHASE ORDER</div>
          </div>
          <div className={`${expandedSection.purchaseOrder ? "flex w-[300px] ml-[32px] gap-5" : "hidden"} p-5`}>
            <label htmlFor="purchaseOrder" className='text-base font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>Purchase Order</label>
            <div className='flex justify-center items-center' onClick={() => purchaseOrderToggle('purchaseOrder')}>
              <Switch checked={isPurchaseOrderEnable} />
            </div>
          </div>
        </div> */}

        {/* Permission */}
        {/* <div className='border-b border-slatyGrey'>
          <div className='w-full flex h-[54px]'>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.permission ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('permission')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>PERMISSION</div>
          </div>
          <div className={`${expandedSection.permission ? "flex w-full" : "hidden"}`}>
            <div className='w-1/2 configurationMain'>
              <DataTable
                columns={subHeaders}
                data={dataForTable1 ?? []}
                expandable
                getExpandableData={() => { }}
                sticky
                getRowId={() => { }}
              />
            </div>
            <div className='w-1/2 configurationMain'>
              <DataTable
                columns={subHeaders2}
                data={dataForTable2 ?? []}
                expandable
                getExpandableData={() => { }}
                sticky
                getRowId={() => { }}
              />
            </div>
          </div>
        </div> */}

        {/* Sync */}
        <div className={`${AccountingTool === 4 ? "hidden" : "block"} border-b border-slatyGrey`}>
          <div className={`w-full flex h-[54px] ${expandedSection.sync ? "bg-whiteSmoke" : "bg-white"}`}>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.sync ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('sync')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>SYNC</div>
          </div>
          <div className={`${expandedSection.sync ? "flex-1 ml-[32px]" : "hidden"} p-5`}>
            <label htmlFor="sync" className='text-sm font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>How would you like to sync the data from and to the accounting tool?</label>
            <div className='w-[180px] mt-2.5'>
              <Select
                id='syncOption'
                name='syncOption'
                defaultValue={syncTypeValue}
                search
                placeholder={"Periodic Sync"}
                options={syncOptions}
                getValue={(value) => {
                  setSyncTypeValue(value)
                }}
                getError={() => { }}
              />
            </div>
            <div className={`${syncTypeValue == '1' ? "block" : "hidden"} w-[429px] flex mt-5 gap-10 ml-[-11px]`}>
              <Radio
                className='text-sm text-darkCharcoal font-proxima'
                checked={isHourlySelected}
                onChange={() => handleRadioSelection('hourly')}
                id='hourly'
                label='Hourly'
              />
              <Radio
                className='text-sm text-darkCharcoal font-proxima'
                checked={isInDaysSelected}
                onChange={() => handleRadioSelection('inDays')}
                id='inDays'
                label='In Days'
              />
              <Radio
                className='text-sm text-darkCharcoal font-proxima'
                checked={isWeeklySelected}
                onChange={() => handleRadioSelection('weekly')}
                id='weekly'
                label='Weekly'
              />
              <Radio
                className='text-sm text-darkCharcoal font-proxima'
                checked={isMonthlySelected}
                onChange={() => handleRadioSelection('monthly')}
                id='monthly'
                label='Monthly'
              />
            </div>
            {syncTypeValue == '1'
              ? isWeeklySelected
                ? <div className='mt-2.5'>
                  <label htmlFor="sync" className='text-xs font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>Sync Data in Every</label>
                  <div className='w-full flex gap-2 mt-2.5'>{mapDays}</div>
                </div>
                : <div className='flex mt-2.5 gap-5'>
                  <div className='w-[200px]'>
                    <label htmlFor="sync" className='text-xs font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>Sync Data in Every</label>
                    <Select
                      className='!mt-2.5'
                      id='syncFrequencyOption'
                      name='syncFrequencyOption'
                      defaultValue={isHourlySelected ? hourlySyncValue : isInDaysSelected ? inDaysSyncValue : monthlySyncValue}
                      search
                      options={isHourlySelected ? HourlyOptions : isInDaysSelected ? DaysOptions : MonthOptions}
                      getValue={(value) => handleValueSelection(value)}
                      getError={() => { }}
                    />
                  </div>
                  <div className={`${isMonthlySelected && monthlySyncValue == "4" ? "block" : "hidden"} mt-1 w-[230px] customDatePickerYearExpandWidth`}>
                    <Datepicker
                      id='customDate'
                      label='Date'
                      value={chartPeriodDate}
                      startYear={1995}
                      endYear={2050}
                      disabled={monthlySyncValue == "4" ? false : true}
                      getValue={(value: any) => {
                        if (monthlySyncValue == "4" && value) {
                          setChartPeriodDate(value);
                        }
                      }}
                      getError={() => { }}
                    />
                  </div>
                </div>
              : <div className='flex gap-2 items-center mt-2'>
                <InfoIcon bgColor={"#6E6D7A"} /> <label className='mt-0.5 text-sm font-proxima tracking-[0.02em] text-slatyGrey'>Smart Sync allows for real-time data syncing between the Accounting tool and our system</label>
              </div>}
          </div>
        </div>

        {/* Indexing */}
        {/* <div className='border-b border-slatyGrey'>
          <div className='w-full flex h-[54px]'>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.indexing ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('indexing')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>INDEXING</div>
          </div>
          <div className={`${expandedSection.indexing ? "flex w-[300px] ml-[32px] gap-5" : "hidden"} p-5`}>
            <label htmlFor="indexing" className='text-base font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>indexing</label>
            <div className='flex justify-center items-center' onClick={() => purchaseOrderToggle('indexing')}>
              <Switch checked={isIndexingEnable} />
            </div>
          </div>
        </div> */}

        {/* OCR */}
        {/* <div className='border-b border-slatyGrey mb-5'>
          <div className='w-full flex h-[54px]'>
            <div className={`cursor-pointer w-[54px] h-full flex items-center justify-center text-[1.6rem] transition-transform text-black ${expandedSection.ocr ? 'duration-400 rotate-180' : 'duration-200'}`}
              onClick={() => handleRowExpand('ocr')}>
              <ChevronDown />
            </div>
            <div className='h-full w-full flex items-center font-proxima text-sm font-bold text-darkCharcoal tracking-[0.02em]'>OCR</div>
          </div>
          <div className={`${expandedSection.ocr ? "flex w-[300px] ml-[32px] gap-5" : "hidden"} p-5`}>
            <label htmlFor="ocr" className='text-base font-medium font-proxima text-darkCharcoal tracking-[0.02em]'>OCR</label>
            <div className='flex justify-center items-center' onClick={() => purchaseOrderToggle('ocr')}>
              <Switch checked={isOCREnable} />
            </div>
          </div>
        </div> */}
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
            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] ${isLoading ? "animate-spin laptop:mx-[7.5px] laptopMd:mx-[7.5px] lg:mx-[7.5px] xl:mx-[7.5px] hd:mx-[9px] 2xl:mx-[9px] 3xl:mx-[9px]" : "!py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]"}`}>
              {isLoading ? <SpinnerIcon bgColor='#FFF' /> : "SAVE"}
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ManageConfigurationDrawer