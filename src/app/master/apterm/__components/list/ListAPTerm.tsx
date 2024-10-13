'use client'

import PlusIcon from '@/assets/Icons/PlusIcon'
import SyncIcon from '@/assets/Icons/SyncIcon'
import Actions from '@/components/Common/DatatableActions/DatatableActions'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { aptermGetList, importApTermData, syncApTermMaster, updateTermStatus } from '@/store/features/master/aptermSlice'
import { Button, DataTable, Loader, SearchBar, Switch, Toast, Tooltip, Typography } from 'pq-ap-lib'
import APTerm from '../drawer/ApTermDrawer'

import DrawerOverlay from '@/components/Common/DrawerOverlay'
import React, { useEffect, useRef, useState } from 'react'

import ImportIcon from '@/assets/Icons/ImportIcon'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import ImportModal from '@/components/Common/Modals/ImportModal'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import { useRouter } from 'next/navigation'

const ListAPTerm: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()
  const router = useRouter();

  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isAPTermView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "AP Term", "View");
  const isAPTermSync = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "AP Term", "Sync");

  const [apTermList, setApTermList] = useState<any[]>([])
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [EditId, setEditId] = useState<number | null>()
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImport, setIsImport] = useState<boolean>(false)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState('')

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState(true)
  const [itemsLoaded, setItemsLoaded] = useState(0)
  const [loaderCounter, setLoaderCounter] = useState(0)
  const [apiDataCount, setApiDataCount] = useState(0)
  const [checkloader, setCheckLoader] = useState(true)
  let nextPageIndex: number = 1
  const lazyRows = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const columns: any = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: false,
      colStyle: '!tracking-[0.02em] !pl-5',

    },
    {
      header: 'Description',
      accessor: 'description',
      sortable: false,
      colStyle: '!tracking-[0.02em]',

    },
    {
      header: 'Due Days',
      accessor: 'dueDays',
      sortable: false,
      colStyle: '!tracking-[0.02em]',

    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: false,
    },
    {
      header: '',
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[6%]',
      colalign: "right",
    },
  ].filter(Boolean)

  useEffect(() => {
    if (!isAPTermView) {
      router.push('/manage/companies');
    }
  }, [isAPTermView]);

  useEffect(() => {
    setSearchValue('')
  }, [CompanyId])

  const getNewList = (responseData: any) => {
    return responseData?.List || []
  }

  const getNewTotalCount = (responseData: any) => {
    return responseData?.TotalCount || 0
  }

  const handleErrorResponse = (dataMessage: any) => {
    Toast.error('Error', `${!dataMessage ? 'Something went wrong!' : dataMessage}`);
  };

  const handleStatusErrorResponse = (payload: any) => {
    Toast.error(`${payload?.status} : ${payload?.statusText}`);
  };

  const handleFinallyBlock = () => {
    setIsLoading(false)
    if (!isOpenDrawer) {
      setLoaderCounter(0)
    }
    else {
      setLoaderCounter(1)
    }
    setShouldLoadMore(true)
    setCheckLoader(true)
  };

  //APTerm List API
  const getApTermList = async (pageIndex?: number) => {
    setIsLoading(true)
    if (pageIndex === 1) {
      setApTermList([])
      setItemsLoaded(0)
    }
    try {
      const params = {
        CompanyId: CompanyId,
        Index: pageIndex || nextPageIndex,
        PageSize: lazyRows,
        Search: searchValue
      }
      const { payload, meta } = await dispatch(aptermGetList(params))
      const dataMessage = payload?.Message

      if (meta?.requestStatus === 'fulfilled') {
        if (payload?.ResponseStatus === 'Success') {
          const responseData = payload?.ResponseData
          const newList = getNewList(responseData)
          const newTotalCount = getNewTotalCount(responseData)
          setApiDataCount(newTotalCount)

          let updatedData = []
          if (pageIndex === 1) {
            updatedData = [...newList]
            setIsLoading(false)
            setShouldLoadMore(true)
          } else {
            updatedData = [...apTermList, ...newList]
          }

          setApTermList(updatedData)
          setItemsLoaded(updatedData.length)
          setIsLoading(false)

          if (itemsLoaded >= newTotalCount) {
            setShouldLoadMore(false);
          }
        } else {
          handleErrorResponse(dataMessage);
        }
      } else {
        handleStatusErrorResponse(payload);
      }
    } catch (error) {
      console.error(error)
    } finally {
      handleFinallyBlock()
    }
  }

  useEffect(() => {
    getApTermList(1)
  }, [refreshTable, searchValue, CompanyId])

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getApTermList()
        }
      },
      { threshold: 0 }
    )

    if (tableBottomRef.current) {
      observer.observe(tableBottomRef.current)
      nextPageIndex = Math.ceil(itemsLoaded / lazyRows) + 1
    }

    return () => {
      observer.disconnect()
    }
  }, [isLoading, shouldLoadMore, itemsLoaded, tableBottomRef])

  //Sync API
  const handleSync = async () => {
    setIsSyncing(true)
    modalClose()
    performApiAction(dispatch, syncApTermMaster, null, (responseData: any) => {
      const dataMessage = responseData.Message
      if (responseData.ResponseStatus === 'Success') {
        setIsSyncing(false)
        getApTermList(1)
        Toast.success('Term Synced!')
      }
      else {
        setIsSyncing(false)
        Toast.error('Error', `${dataMessage}`)
      }
    })
  }

  //Import API
  const handleImport = async () => {
    if (!selectedFile) {
      Toast.error('Error', 'Please select a CSV or Excel file for importing data.')
    } else {
      setIsImport(true)
      const params = {
        Files: selectedFile,
      }
      try {
        modalClose()
        const { payload, meta } = await dispatch(importApTermData(params))
        const dataMessage = payload?.Message

        if (meta?.requestStatus === 'fulfilled') {
          if (payload?.ResponseStatus === 'Success') {
            handleSuccessfulImport(payload);
          }
          else if (payload?.ResponseStatus === 'Warning') {
            handleWarningImport(payload);
          }
          else {
            setIsImport(false);
            setSelectedFile(null);
            handleErrorResponse(dataMessage);
          }
        } else {
          handleStatusErrorResponse(payload);
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleSuccessfulImport = (payload: any) => {
    if (payload?.ResponseData.SuccessCount > 0) {
      Toast.success(`${payload?.ResponseData.SuccessCount} Record Imported!`)
    }
    getApTermList(1)
    setIsImport(false);
    setSelectedFile(null);
  };

  const handleWarningImport = (payload: any) => {
    if (payload?.ResponseData.SuccessCount > 0) {
      Toast.success(`${payload?.ResponseData.SuccessCount} Record Imported!`)
    }
    payload?.ResponseData.InSufficientData.map((data: any) => {
      Toast.warning(`${data.ErrorMessage}`)
    })
    getApTermList(1)
    setIsImport(false);
    setSelectedFile(null);
  };

  const handleMenuChange = (actionName: string, id: number) => {
    if (actionName == 'Edit') {
      setEditId(id)
      setIsOpenDrawer(!isOpenDrawer)
    }
  }

  //Status update API
  const handleStatusUpdate = async (Id: number, RecordNo: string, Status: boolean) => {
    setIsLoading(true)
    setApTermList([])
    const params = {
      CompanyId: CompanyId,
      Id: Id,
      RecordNo: RecordNo,
      Status: !Status,
    }
    performApiAction(dispatch, updateTermStatus, params, (responseData: any) => {
      const dataMessage = responseData.Message
      if (responseData.ResponseStatus === 'Success') {
        setIsLoading(false)
        getApTermList(1)
        Toast.success(`Status Updated!`)
      } else {
        setIsLoading(false)
        getApTermList(1)
        Toast.error('Error', `${dataMessage}`)
      }
    }, () => {
      // ErrorData
      setIsLoading(false)
      setRefreshTable(!refreshTable)
    })

  }

  //DataTable Data
  const aptermListData = apTermList && apTermList?.map(
    (e: any) =>
      new Object({
        name: <Typography className={`!pl-3 ${e?.Status ? '' : 'opacity-50'}`}>{e?.Name}</Typography>,
        description: <Typography className={`${e?.Status ? '' : 'opacity-50'}`}>{e?.Description}</Typography>,
        dueDays: <Typography className={`${e?.Status ? '' : 'opacity-50'}`}>{e?.DueDays}</Typography>,
        status: <div className={`${accountingTool != 4 && "pointer-events-none opacity-50"}`} onClick={() => handleStatusUpdate(e?.Id, e?.RecordNo, e?.Status)}><Switch checked={e?.Status ? true : false} /></div>,
        action: <div className={`${e?.Status && accountingTool == 4 ? '' : 'opacity-50 pointer-events-none'}`}><Actions id={e?.Id} optionalData={e?.RecordNo} actions={['Edit']} actionRowId={() => { }} handleClick={handleMenuChange} /></div>,
      })
  )


  const handleToggleChange = () => {
    setIsOpenDrawer(true)
  }

  const handleDrawerClose = (type: string) => {
    if (type === "Save") {
      setIsOpenDrawer(false)
      setShouldLoadMore(true)
      setRefreshTable(!refreshTable)
      setEditId(0)
    }
    else {
      setIsOpenDrawer(false)
      setEditId(0)
    }
  }

  const modalClose = () => {
    setIsSyncModalOpen(false)
    setIsImportModalOpen(false)
  }

  return (
    <Wrapper masterSettings={true}>
      {/* Navbar */}
      <div className='sticky top-0 z-[6] flex !h-[50px] items-center justify-between bg-whiteSmoke px-5'>
        <div className='flex items-center'>
          <label className='font-proxima flex items-center text-base font-bold tracking-[0.02em] text-darkCharcoal'>AP Term</label>
        </div>
        <div className='flex items-center gap-5'>
          <div className='flex h-6 items-center justify-center -mr-3'>
            <SearchBar
              key={CompanyId}
              variant='animated'
              number={1}
              getValue={(value) => {
                setSearchValue(value)
              }}
            />
          </div>
          {(accountingTool !== 4 && isAPTermSync) && <Tooltip content={`Sync AP Term`} position='left' className='!z-[6] flex h-8 w-9 justify-center items-center'>
            <div className={`${isSyncing && 'animate-spin'}`} onClick={() => setIsSyncModalOpen(true)}>
              <SyncIcon />
            </div>
          </Tooltip>}
          {accountingTool == 4 && <> <Tooltip content={`Import`} position='bottom' className='!z-[6] flex h-8 w-9 justify-center items-center'>
            <div className="overflow-hidden">
              <div className={`${isImport && 'animate-spin-y'}`} onClick={() => setIsImportModalOpen(true)}>
                <ImportIcon />
              </div>
            </div>
          </Tooltip>
            <Button className='rounded-full !h-9 laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]' variant='btn-primary' onClick={handleToggleChange}>
              <div className='flex justify-center items-center font-bold'>
                <span className='mr-[8px]'>
                  <PlusIcon color={'#FFF'} />
                </span>
                <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>CREATE NEW</label>
              </div>
            </Button></>}
        </div>
      </div>

      {/* DataTable */}
      <div className='h-[calc(100vh-112px)] overflow-auto custom-scroll max-[425px]:mx-1'>
        <div className={`${apTermList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={apTermList.length > 0 ? aptermListData : []}
            hoverEffect={true}
            sticky
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
          {isLoading && loaderCounter === 1 && checkloader && (
            <Loader size='sm' helperText />
          )}
          <div ref={tableBottomRef} />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={apTermList} />
      </div>

      {/* Sync Modal */}
      <ConfirmationModal
        title='Sync'
        content={`Are you sure you want to sync AP Term?`}
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
        sampleFile="aptermSampleData"
        getValue={(value: any) => setSelectedFile(value)}
      />}

      <APTerm onOpen={isOpenDrawer} onClose={(value: string) => handleDrawerClose(value)} EditId={typeof EditId === 'number' ? EditId : 0} />
      <DrawerOverlay isOpen={isOpenDrawer} onClose={undefined} />
    </Wrapper>
  )
}

export default ListAPTerm
