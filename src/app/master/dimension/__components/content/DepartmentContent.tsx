import Actions from '@/components/Common/DatatableActions/DatatableActions'
import DrawerOverlay from '@/components/Common/DrawerOverlay'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch } from '@/store/configureStore'
import { departmentGetList, updateDimensionMaster } from '@/store/features/master/dimensionSlice'
import { useSession } from 'next-auth/react'
import { DataTable, Loader, Switch, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import DepartmentContent from '../drawer/DepartmentDrawer'

interface DepartmentListProps {
  name: string
  status: boolean
}

interface DepartmentProps {
  onDrawerOpen: boolean
  onDrawerClose: () => void
  isSync: boolean
  searchValue: string
}

const Department: React.FC<DepartmentProps> = ({ onDrawerOpen, onDrawerClose, isSync, searchValue }) => {
  // For Dynamic Company Id & AccountingTool
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const accountingTool = session?.user?.AccountingTool
  const dispatch = useAppDispatch()

  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [departmentList, setDepartmentList] = useState<DepartmentListProps[]>([])
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
    accountingTool === 1 && {
      header: 'DEPARTMENT ID',
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

  //Department List API
  const getDepartmentList = async (pageIndex?: number) => {
    setIsLoading(true)
    if (pageIndex === 1) {
      setDepartmentList([])
      setItemsLoaded(0)
    }

    try {
      const params = {
        FilterObj: {
          DepartmentCode: '',
          Title: searchValue,
          Status: null,
          GlobalFilter: '',
        },
        CompanyId: CompanyId,
        Index: pageIndex || nextPageIndex,
        PageSize: lazyRows,
      }
      const { payload, meta } = await dispatch(departmentGetList(params))
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
            updatedData = [...departmentList, ...newList]
          }

          setDepartmentList(updatedData)
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
    getDepartmentList(1)
  }, [refreshTable, CompanyId, isSync, searchValue])

  //For Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && shouldLoadMore && (itemsLoaded % lazyRows === 0) && apiDataCount > 0) {
          getDepartmentList()
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
    setDepartmentList([])
    const params = {
      data: {
        CompanyId: CompanyId,
        Id: Id,
        RecordNo: RecordNo,
        Status: !Status,
        Name: Name
      },
      tab: 'department',
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
  const departmentListData = departmentList && departmentList?.map(
    (e: any) =>
      new Object({
        id: <Typography className={`!pl-3 ${e?.Status ? '' : 'opacity-50'}`}>{e?.DepartmentCode}</Typography>,
        name: <Typography className={`${e?.Status ? '' : 'opacity-50'}`}>{e?.Title}</Typography>,
        status: <div onClick={() => handleStatusUpdate(e?.Id, e?.RecordNo, e?.Status, e?.Name)}><Switch checked={e?.Status ? true : false} /></div>,
        action: <div className={`${e?.Status ? '' : 'opacity-50 pointer-events-none'}`}><Actions id={e?.Id} optionalData={e?.RecordNo} actions={['Edit']} actionRowId={() => { }} handleClick={handleMenuChange} /></div>,
      })
  )

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
        <div className={`${departmentList.length !== 0 && 'h-0'}`}>
          <DataTable
            columns={columns}
            data={departmentList.length > 0 ? departmentListData : []}
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
        <DataLoadingStatus isLoading={isLoading} data={departmentList} />
      </div>

      <DepartmentContent onOpen={isOpenDrawer} onClose={(value) => handleDrawerClose(value)} EditId={Id} />
      <DrawerOverlay isOpen={isOpenDrawer} onClose={undefined} />
    </>
  )
}

export default Department