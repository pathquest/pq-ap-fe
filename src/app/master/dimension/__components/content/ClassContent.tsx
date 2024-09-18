import Actions from '@/components/Common/DatatableActions/DatatableActions'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { classGetList, updateDimensionMaster } from '@/store/features/master/dimensionSlice'
import { useSession } from 'next-auth/react'
import { DataTable, Loader, Switch, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import ClassDrawer from '../drawer/ClassDrawer'

interface ClassListProps {
  name: string
  status: boolean
}

interface ClassProps {
  onDrawerOpen: boolean
  onDrawerClose: () => void
  isSync: boolean
  searchValue: string
}

const Class: React.FC<ClassProps> = ({ onDrawerOpen, onDrawerClose, isSync, searchValue }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()

  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [classList, setClassList] = useState<ClassListProps[]>([])
  const [Id, setId] = useState<number>(0)
  const [refreshTable, setRefreshTable] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
    (accountingTool === 1 || accountingTool === 4) && {
      header: 'CLASS ID',
      accessor: 'id',
      colStyle: '!tracking-[0.02em] !pl-5',
      sortable: false,
    },
    {
      header: 'NAME',
      accessor: 'name',
      colStyle: '!tracking-[0.02em]',
      sortable: false,
    },
    {
      header: 'STATUS',
      accessor: 'status',
      colStyle: '!tracking-[0.02em]',
      sortable: false,
    },
    {
      header: '',
      accessor: 'action',
      sortable: false,
      colStyle: '!w-[6%]',
      colalign: "right"
    },
  ].filter(Boolean)

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

  //Class List API
  const getClassList = async (pageIndex?: number) => {
    setIsLoading(true)
    if (pageIndex === 1) {
      setClassList([])
      setItemsLoaded(0)
    }

    try {
      const params = {
        FilterObj: {
          ClassId: '',
          Name: searchValue,
          FullyQualifiedName: '',
          Status: '',
          GlobalFilter: '',
        },
        CompanyId: CompanyId,
        Index: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }

      const { payload, meta } = await dispatch(classGetList(params))
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
            updatedData = [...classList, ...newList]
          }

          setClassList(updatedData)
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
    getClassList(1)
  }, [refreshTable, CompanyId, isSync, searchValue])

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getClassList()
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

  //Status update API
  const handleStatusUpdate = async (Id: number, RecordNo: string, Status: boolean, Name: string) => {
    setIsLoading(true)
    setClassList([])
    const params = {
      data: {
        CompanyId: CompanyId,
        Id: Id,
        RecordNo: RecordNo,
        Status: !Status,
        Name: Name
      },
      tab: 'class',
    }
    performApiAction(dispatch, updateDimensionMaster, params, (responseData: any) => {
      const dataMessage = responseData.Message
      if (responseData.ResponseStatus === 'Success') {
        setIsLoading(false)
        setRefreshTable(!refreshTable)
        Toast.success(`Status updated successfully.`)
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

  const handleMenuChange = (actionName: string, id: number) => {
    if (actionName == 'Edit') {
      setId(Number(id))
      setIsOpenDrawer(!isOpenDrawer)
    }
  }

  //DataTable Data
  const classListData = classList && classList?.map((e: any) => ({
    id: <Typography className={`!pl-3 ${e?.Status ? '' : 'opacity-50'}`}>{e?.ClassCode}</Typography>,
    name: <Typography className={`${e?.Status ? '' : 'opacity-50'}`}>{e?.Name}</Typography>,
    status: <div onClick={() => handleStatusUpdate(e?.Id, e?.RecordNo, e?.Status, e?.Name)}><Switch checked={e?.Status ? true : false} /></div>,
    action: <div className={`${e?.Status ? '' : 'opacity-50 pointer-events-none'}`}><Actions id={e?.Id} optionalData={e?.RecordNo} actions={['Edit']} actionRowId={() => { }} handleClick={handleMenuChange} /></div>,
  }))

  const handleDrawerClose = (type: string) => {
    setIsOpenDrawer(false)
    setId(0)
    onDrawerClose()
    if (type === "Save") {
      setRefreshTable(!refreshTable)
      setShouldLoadMore(true)
    }
  }

  useEffect(() => {
    setIsOpenDrawer(onDrawerOpen)
  }, [onDrawerOpen])

  return (
    <>
      {/* DataTable */}
      <div className='h-[calc(100vh-145px)] overflow-auto custom-scroll max-[425px]:mx-1'>
        <div className={`${classList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={classList.length > 0 ? classListData : []}
            hoverEffect={true}
            sticky
            getRowId={() => { }}
            lazyLoadRows={lazyRows}
            getExpandableData={() => { }}
          />
          {isLoading && loaderCounter === 1 && checkLoader && (
            <Loader size='sm' helperText />
          )}
          <div ref={tableBottomRef} />
        </div>
        <DataLoadingStatus isLoading={isLoading} data={classList} />
      </div>

      <ClassDrawer onOpen={isOpenDrawer} onClose={(value) => handleDrawerClose(value)} EditId={Id} />
      <DrawerOverlay isOpen={isOpenDrawer} onClose={undefined} />
    </>
  )
}

export default Class