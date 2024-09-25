'use client'

import SyncIcon from '@/assets/Icons/SyncIcon'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import ConfirmationModal from '@/components/Common/Modals/ConfirmationModal'
import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { currencyGetList, syncCurrencyMaster } from '@/store/features/paymentsetting/currencySlice'
import { useSession } from 'next-auth/react'
import { DataTable, Loader, SearchBar, Toast, Tooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'

interface CurrencyList {
  name: string
  Code: string
  Description: string
}

const ListCurrency: React.FC = () => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isCurrencySync = hasSpecificPermission(processPermissionsMatrix, "Settings", "Masters", "Currency", "Sync");

  const dispatch = useAppDispatch()
  const [currencyList, setCurrencyList] = useState<CurrencyList[]>([])
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
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
      header: 'ID',
      accessor: 'id',
      sortable: true,
      colStyle: '!w-[8%] !tracking-[0.02em] !pl-5',
    },
    {
      header: 'CODE',
      accessor: 'code',
      sortable: false,
      colStyle: '!w-[20%] !tracking-[0.02em]',
    },
    {
      header: 'DESCRIPTION',
      accessor: 'description',
      sortable: false,
    }
  ]

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
    if (!isSyncModalOpen) {
      setLoaderCounter(0)
    }
    else {
      setLoaderCounter(1)
    }
    setShouldLoadMore(true)
    setCheckLoader(true)
  };

  //Currency List API
  const getCurrencyList = async (pageIndex?: number) => {
    setIsLoading(true)
    if (pageIndex === 1) {
      setCurrencyList([])
      setItemsLoaded(0)
    }

    try {
      const params = {
        CompanyId: CompanyId,
        Index: pageIndex || nextPageIndex,
        PageSize: lazyRows,
        Search: searchValue,
        FilterObj: {
          Code: '',
          Description: ''
        }
      }

      const { payload, meta } = await dispatch(currencyGetList(params))
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
            updatedData = [...currencyList, ...newList]
          }

          setCurrencyList(updatedData)
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
      handleFinallyBlock();
    }
  }

  useEffect(() => {
    getCurrencyList(1)
  }, [searchValue, CompanyId])

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getCurrencyList()
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
    performApiAction(dispatch, syncCurrencyMaster, null, (responseData: any) => {
      if (responseData.ResponseStatus === 'Success') {
        setIsSyncing(false)
        getCurrencyList(1)
        Toast.success(`Currency Synced!`)
      }
      else {
        setIsSyncing(false)
        Toast.error('Error', `${responseData.ErrorData.Error}`)
      }
    }, () => {
      // ErrorData
      setIsSyncing(false)
    })
  }

  //DataTable Data
  const currencyListData = currencyList && currencyList?.map((e: CurrencyList, index: number) =>
    new Object({
      id: <Typography className="!pl-3">{index + 1}</Typography>,
      code: e?.Code,
      description: e?.Description
    })
  )

  const modalClose = () => {
    setIsSyncModalOpen(false)
  }

  return (
    <Wrapper masterSettings={true}>
      {/* Navbar */}
      {/* Navbar */}
      <div className='sticky top-0 z-[6] flex !h-[66px] items-center justify-between bg-whiteSmoke px-5'>
        <div className='flex items-center'>
          <label className='font-proxima flex cursor-pointer items-center laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Currency</label>
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
          {isCurrencySync && <Tooltip content={`Sync Currency`} position='left' className='!z-[6] flex h-8 w-9 justify-center items-center'>
            <div className={`${isSyncing && 'animate-spin'}`} onClick={() => setIsSyncModalOpen(true)}>
              <SyncIcon />
            </div>
          </Tooltip>}
        </div>
      </div>

      {/* DataTable */}
      <div className='h-[calc(100vh-145px)] overflow-auto custom-scroll max-[425px]:mx-1'>
        <div className={`${currencyList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={currencyList.length > 0 ? currencyListData : []}
            hoverEffect={true}
            sticky
            getExpandableData={() => { }}
            lazyLoadRows={lazyRows}
            getRowId={() => { }}
          />
          {isLoading && loaderCounter === 1 && checkLoader && (
            <Loader size='sm' helperText />
          )}
          <div ref={tableBottomRef} />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={currencyList} />
      </div>

      {/* Sync Modal */}
      <ConfirmationModal
        title='Sync'
        content={`Are you sure you want to sync Currency ?`}
        isModalOpen={isSyncModalOpen}
        modalClose={modalClose}
        handleSubmit={handleSync}
        colorVariantNo='btn-outline-primary'
        colorVariantYes='btn-primary'
      />
    </Wrapper>
  )
}

export default ListCurrency