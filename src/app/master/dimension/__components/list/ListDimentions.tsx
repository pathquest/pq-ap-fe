'use client'
import ImportIcon from '@/assets/Icons/ImportIcon'
import PlusIcon from '@/assets/Icons/PlusIcon'
import SyncIcon from '@/assets/Icons/SyncIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import ImportModal from '@/components/Common/Modals/ImportModal'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch } from '@/store/configureStore'
import { importDimensionData, syncDimensionMaster } from '@/store/features/master/dimensionSlice'
import { useSession } from 'next-auth/react'
import { Button, NavigationBar, SearchBar, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import Class from '../content/ClassContent'
import Department from '../content/DepartmentContent'
import Location from '../content/LocationContent'
import Project from '../content/ProjectContent'

const ListDimentions: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()

  const [tab, setTab] = useState<string>('class')
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false)
  const isMobile = useMediaQuery({ query: '(max-width: 426px)' })
  const [visibleTab, setVisibleTab] = useState<number>(4)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [isSync, setIsSync] = useState<boolean>(false)
  const [accountingToolChanged, setAccountingToolChanged] = useState<boolean>(false);
  const [isImport, setIsImport] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchValue, setSearchValue] = useState<string>('')

  const tabs = [
    { id: 'class', label: 'CLASS' },
    { id: 'location', label: 'LOCATION' },
    accountingTool === 1 && { id: 'department', label: 'DEPARTMENT' },
    accountingTool === 1 && { id: 'project', label: 'PROJECT' },
  ].filter(Boolean)

  useEffect(() => {
    setSearchValue('')
  }, [tab])

  useEffect(() => {
    if (isMobile) {
      setVisibleTab(1)
    }
  }, [isMobile])

  useEffect(() => {
    setAccountingToolChanged((prev) => !prev);
  }, [accountingTool])

  //Sync API
  const handleSync = async () => {
    setIsSyncing(true)
    modalClose()
    const params = {
      tab: tab,
    }
    performApiAction(dispatch, syncDimensionMaster, params, (responseData: any) => {
      const dataMessage = responseData.Message
      if (responseData.ResponseStatus === 'Success') {
        setIsSyncing(false)
        setIsSync(!isSync)
        Toast.success(`${tab} sync successfully`)
      }
      else {
        setIsSyncing(false)
        setIsSync(!isSync)
        Toast.error('Error', `${dataMessage}`)
      }
    }, () => {
      // ErrorData
      setIsSyncing(false)
      setIsSync(!isSync)
    })
  }

  //Import API
  const handleImport = async () => {
    if (!selectedFile) {
      Toast.error('Error', 'Please select a CSV or Excel file for importing data.')
    } else {
      setIsImport(true)
      modalClose()
      const params = {
        data: { Files: selectedFile },
        tab: tab
      }

      performApiAction(dispatch, importDimensionData, params, (responseData: any) => {
        if (responseData.SuccessCount > 0) {
          Toast.success(`${responseData.SuccessCount} record imported successfully`)
        }
        setIsSync(!isSync)
        setIsImport(false);
        setSelectedFile(null);
      }, () => {
        // ErrorData
        setIsImport(false);
        setSelectedFile(null);
      }, (WarningData: any) => {
        if (WarningData.SuccessCount > 0) {
          Toast.success(`${WarningData.SuccessCount} record imported successfully`)
        }
        WarningData.InSufficientData.map((data: any) => {
          Toast.warning(`${data.ErrorMessage}`)
        })
        setIsSync(!isSync)
        setIsImport(false);
        setSelectedFile(null);
      })
    }
  }

  const handleToggleChange = () => {
    setIsOpenDrawer(true)
  }
  const handleDrawerClose = () => {
    setIsOpenDrawer(false)
  }
  const modalClose = () => {
    setIsSyncModalOpen(false)
    setIsImportModalOpen(false)
  }

  return (
    <Wrapper masterSettings={true}>
      <div className='sticky top-0 z-[6] flex h-[66px] w-full items-center justify-between bg-whiteSmoke'>
        <NavigationBar
          key={String(accountingToolChanged)}
          tabs={tabs}
          visibleTab={visibleTab}
          getValue={(value) => setTab(value)}
        />

        <div className='flex items-center gap-5 px-5'>
          <div className='flex h-6 items-center justify-center -mr-3'>
            <SearchBar
              key={tab}
              number={1}
              variant='animated'
              getValue={(value) => {
                setSearchValue(value)
              }}
            />
          </div>
          {accountingTool !== 4 && <Tooltip content={`Sync ${tab}`} position='bottom' className='!z-[6] flex h-8 w-9 justify-center items-center'>
            <div className={`${isSyncing && 'animate-spin'}`} onClick={() => setIsSyncModalOpen(true)}>
              <SyncIcon />
            </div>
          </Tooltip>}
          {accountingTool == 4 && <Tooltip content={`Import`} position='bottom' className='!z-[6] flex h-8 w-9 justify-center items-center'>
            <div className="overflow-hidden">
              <div className={`${isImport && 'animate-spin-y'}`} onClick={() => setIsImportModalOpen(true)}>
                <ImportIcon />
              </div>
            </div>
          </Tooltip>}
          <Button className='rounded-full !h-9 laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]' variant='btn-primary' onClick={handleToggleChange}>
            <div className='flex justify-center items-center font-bold'>
              <span className='mr-[8px]'>
                <PlusIcon color={'#FFF'} />
              </span>
              <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>CREATE NEW</label>
            </div>
          </Button>
        </div>
      </div>

      {/* Sync Modal */}
      <ConfirmationModal
        title='Sync'
        content={`Are you sure you want to sync ${tab} ?`}
        isModalOpen={isSyncModalOpen}
        modalClose={modalClose}
        handleSubmit={handleSync}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />

      {/* Import Modal */}
      {isImportModalOpen && <ImportModal
        isModalOpen={isImportModalOpen}
        modalClose={modalClose}
        handleSubmit={handleImport}
        sampleFile={`${tab}SampleData`}
        getValue={(value) => setSelectedFile(value)}
      />}

      {/* Datatable content */}
      {tab === 'class' && <Class onDrawerOpen={isOpenDrawer} onDrawerClose={handleDrawerClose} isSync={isSync} searchValue={tab === 'class' ? searchValue : ''} />}
      {tab === 'location' && <Location onDrawerOpen={isOpenDrawer} onDrawerClose={handleDrawerClose} isSync={isSync} searchValue={tab === 'location' ? searchValue : ''} />}
      {tab === 'department' && <Department onDrawerOpen={isOpenDrawer} onDrawerClose={handleDrawerClose} isSync={isSync} searchValue={tab === 'department' ? searchValue : ''} />}
      {tab === 'project' && <Project onDrawerOpen={isOpenDrawer} onDrawerClose={handleDrawerClose} isSync={isSync} searchValue={tab === 'project' ? searchValue : ''} />}
    </Wrapper>
  )
}

export default ListDimentions