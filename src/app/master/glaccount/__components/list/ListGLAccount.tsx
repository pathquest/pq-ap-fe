'use client'

import ImportIcon from "@/assets/Icons/ImportIcon";
import PlusIcon from "@/assets/Icons/PlusIcon";
import SyncIcon from '@/assets/Icons/SyncIcon';
import Actions from "@/components/Common/DatatableActions/DatatableActions";
import DrawerOverlay from "@/components/Common/DrawerOverlay";
import DataLoadingStatus from "@/components/Common/Functions/DataLoadingStatus";
import { performApiAction } from "@/components/Common/Functions/PerformApiAction";
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal';
import ImportModal from '@/components/Common/Modals/ImportModal';
import Wrapper from '@/components/Common/Wrapper';
import { useAppDispatch, useAppSelector } from '@/store/configureStore';
import { glAccountGetList, importGLAccountData, syncGLAccountMaster, updateAccountStatus } from '@/store/features/master/glAccountSlice';
import { useSession } from "next-auth/react";
import { Badge, Button, DataTable, Loader, SearchBar, Switch, Toast, Tooltip, Typography } from 'pq-ap-lib';
import React, { useEffect, useRef, useState } from 'react';
import GLAccount from "../drawer/GLAccountDrawer";
import { hasSpecificPermission } from "@/components/Common/Functions/ProcessPermission";
import { useRouter } from "next/navigation";

interface AccountListProps {
  name: string
  status: any
  action: any
}

const ListGLAccount: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = Number(session?.user?.AccountingTool)
  const dispatch = useAppDispatch()
  const router = useRouter();
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isGLAccountSync = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "GL Account", "Sync");
  const isGLAccountView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "GL Account", "View");

  const [accountList, setAccountList] = useState<AccountListProps[]>([])
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [isImport, setIsImport] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [EditId, setEditId] = useState<number | null>()
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState('')

  //For Lazy Loading
  const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(true)
  const [itemsLoaded, setItemsLoaded] = useState<number>(0)
  const [loaderCounter, setLoaderCounter] = useState<number>(0)
  const [apiDataCount, setApiDataCount] = useState<number>(0)
  const [checkLoader, setCheckLoader] = useState<boolean>(true)
  let nextPageIndex: number = 1
  const lazyRows: number = 70
  const tableBottomRef = useRef<HTMLDivElement>(null)

  const columns: any = [
    {
      header: 'Account Number',
      accessor: 'accountId',
      colStyle: '!tracking-[0.02em] !pl-5',
      sortable: false,
    },
    {
      header: 'Account Name',
      accessor: 'name',
      colStyle: '!tracking-[0.02em]',
      sortable: false,
    },
    {
      header: 'Account Type',
      accessor: 'accountType',
      colStyle: '!tracking-[0.02em]',
      sortable: false,
    },
    accountingTool !== 4 && {
      header: 'Closing Type',
      accessor: 'closingType',
      colStyle: '!tracking-[0.02em]',
      sortable: false,
    },
    accountingTool !== 4 && {
      header: 'Normal Balance',
      accessor: 'normalBalance',
      colStyle: '!tracking-[0.02em]',
      sortable: false,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: false,
      colalign: 'center',
      colStyle: '!w-[10%]',
    },
    accountingTool === 4 && {
      header: '',
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[6%]',
      colalign: "right",
    },
  ].filter(Boolean)

  useEffect(() => {
    if (!isGLAccountView) {
      router.push('/manage/companies');
    }
  }, [isGLAccountView]);

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
    } else {
      setLoaderCounter(1)
    }
    setShouldLoadMore(true)
    setCheckLoader(true)
  };

  //GL Account List API
  const getAccountList = async (pageIndex?: number) => {
    setIsLoading(true)
    if (pageIndex === 1) {
      setAccountList([])
      setItemsLoaded(0)
    }
    try {
      const params = {
        FilterObj: {
          AccountNo: '',
          Name: searchValue,
          FullyQualifiedName: '',
          AccountType: '',
          ClosingType: '',
          NormalBalance: '',
          CurrentBalance: '',
          Status: '',
          GlobalFilter: '',
        },
        CompanyId: CompanyId,
        Index: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }
      const { payload, meta } = await dispatch(glAccountGetList(params))
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
            updatedData = [...accountList, ...newList]
          }

          setAccountList(updatedData)
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
    getAccountList(1);
  }, [refreshTable, searchValue, CompanyId]);

  // For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getAccountList();
        }
      },
      { threshold: 0 }
    );

    if (tableBottomRef.current) {
      observer.observe(tableBottomRef.current);
      nextPageIndex = Math.ceil(itemsLoaded / lazyRows) + 1;
    }

    return () => {
      observer.disconnect();
    };
  }, [isLoading, shouldLoadMore, itemsLoaded, tableBottomRef.current]);

  //Sync API
  const handleSync = async () => {
    setIsSyncing(true)
    modalClose()
    performApiAction(dispatch, syncGLAccountMaster, null, (responseData: any) => {
      const dataMessage = responseData.Message
      if (responseData.ResponseStatus === 'Success') {
        setIsSyncing(false)
        setRefreshTable(!refreshTable)
        Toast.success('GL Account Synced!')
      }
      else {
        setIsSyncing(false)
        Toast.error('Error', `${dataMessage}`)
      }
    }, () => {
      // ErrorData
      setIsSyncing(false)
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
        Files: selectedFile,
      }

      performApiAction(dispatch, importGLAccountData, params, (responseData: any) => {
        if (responseData.SuccessCount > 0) {
          Toast.success(`${responseData.SuccessCount} Record Imported!`)
        }
        setRefreshTable(!refreshTable)
        setIsImport(false);
        setSelectedFile(null);
      }, () => {
        // ErrorData
        setIsImport(false);
        setSelectedFile(null);
      }, (WarningData: any) => {
        if (WarningData.SuccessCount > 0) {
          Toast.success(`${WarningData.SuccessCount} Record Imported!`)
        }
        WarningData.InSufficientData.map((data: any) => {
          Toast.warning(`${data.ErrorMessage}`)
        })
        setRefreshTable(!refreshTable)
        setIsImport(false);
        setSelectedFile(null);
      })
    }
  }

  const handleMenuChange = (actionName: string, id: number) => {
    if (actionName == 'Edit') {
      setEditId(id)
      setIsOpenDrawer(!isOpenDrawer)
    }
  }

  //Status update API
  const handleStatusUpdate = async (Id: number, RecordNo: string, Status: boolean) => {
    setIsLoading(true)
    setAccountList([])
    const params = {
      CompanyId: CompanyId,
      Id: Id,
      RecordNo: RecordNo,
      Status: !Status,
    }
    performApiAction(dispatch, updateAccountStatus, params, (responseData: any) => {
      const dataMessage = responseData.Message
      if (responseData.ResponseStatus === 'Success') {
        setIsLoading(false)
        setRefreshTable(!refreshTable)
        Toast.success(`Status Updated!`)
      } else {
        setIsLoading(false)
        setRefreshTable(!refreshTable)
        Toast.error('Error', `${dataMessage}`)
      }
    }, () => {
      // ErrorData
      setIsLoading(false)
      setRefreshTable(!refreshTable)
    })
  }

  const getClassName = (status: boolean, accountingTool: number) => {
    return status ? '' : (accountingTool === 4 ? 'opacity-50' : '');
  };

  //DataTable Data
  const accountListData = accountList && accountList?.map((e: any) =>
    new Object({
      accountId: <Typography className={`!pl-3 ${e?.Status ? '' : (accountingTool === 4 ? 'opacity-50' : '')}`}>{e?.AccountCode}</Typography>,
      name: <Typography className={getClassName(e?.Status, accountingTool)}>{e?.Name}</Typography>,
      accountNo: <Typography className={getClassName(e?.Status, accountingTool)}>{e?.ClosingAccountNo}</Typography>,
      accountType: <Typography className={getClassName(e?.Status, accountingTool)}>{e?.AccountType}</Typography>,
      closingType: <Typography className={getClassName(e?.Status, accountingTool)}>{e?.ClosingType}</Typography>,
      normalBalance: <Typography className={getClassName(e?.Status, accountingTool)}>{e?.NormalBalance}</Typography>,
      status: accountingTool === 4
        ? <div onClick={() => handleStatusUpdate(e?.Id, e?.RecordNo, e?.Status)}><Switch checked={e?.Status ? true : false} /></div>
        : <Badge variant='dot' badgetype={e.Status ? 'primary' : 'error'} />,
      action: <div className={`${e?.Status ? '' : 'opacity-50 pointer-events-none'}`}><Actions id={e?.Id} optionalData={e?.RecordNo} actions={['Edit']} actionRowId={() => { }} handleClick={handleMenuChange} /></div>,
    })
  )

  const modalClose = () => {
    setIsSyncModalOpen(false)
    setIsImportModalOpen(false)
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

  const handleToggleChange = () => {
    setIsOpenDrawer(true)
  }

  return (
    <Wrapper masterSettings={true}>
      {/* Navbar */}
      <div className='sticky top-0 z-[6] flex !h-[50px] items-center justify-between bg-whiteSmoke px-5'>
        <div className='flex items-center'>
          <label className='font-proxima flex items-center text-base font-bold tracking-[0.02em] text-darkCharcoal'>GL Account</label>
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
          {(accountingTool !== 4 && isGLAccountSync) && <Tooltip content={`Sync GL Account`} position='left' className='!z-[6] flex h-8 w-9 justify-center items-center'>
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
            <Button className='rounded-full !h-[36px] laptop:px-6 laptopMd:px-6 lg:px-6 xl:px-6 hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px]' variant='btn-primary' onClick={handleToggleChange}>
              <div className='flex justify-center items-center font-bold'>
                <span className='mr-[8px]'>
                  <PlusIcon color={'#FFF'} />
                </span>
                <label className='flex font-proxima cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold lg:font-semibold xl:font-semibold hd:font-semibold 2xl:font-semibold 3xl:font-semibold tracking-[0.02em]'>CREATE NEW</label>
              </div>
            </Button>
          </>}
        </div>
      </div>

      {/* DataTable */}
      <div className='h-[calc(100vh-112px)] overflow-auto custom-scroll max-[425px]:mx-1'>
        <div className={`${accountList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={accountList.length > 0 ? accountListData : []}
            hoverEffect={true}
            sticky
            lazyLoadRows={lazyRows}
            getExpandableData={() => { }}
            getRowId={() => { }}
          />
          {isLoading && loaderCounter === 1 && checkLoader && (
            <Loader size='sm' helperText />
          )}
          <div ref={tableBottomRef} />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={accountList} />
      </div>

      {/* Sync Modal */}
      <ConfirmationModal
        title='Sync'
        content={`Are you sure you want to sync GL Account ?`}
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
        sampleFile="glaccountSampleData"
        getValue={(value: any) => setSelectedFile(value)}
      />}

      <GLAccount onOpen={isOpenDrawer} onClose={(value: string) => handleDrawerClose(value)} EditId={typeof EditId === 'number' ? EditId : 0} />
      <DrawerOverlay isOpen={isOpenDrawer} onClose={undefined} />
    </Wrapper>
  )
}

export default ListGLAccount