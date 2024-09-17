import React, { useCallback, useEffect, useRef, useState } from 'react'
import ChevronRightIcon from '@/assets/Icons/practice_dashboard/ChevronRightIcon'
import SortIcon from '@/assets/Icons/practice_dashboard/SortIcon'

interface AComponentProps {
  children: string
}

interface BComponentProps {
  children: string
}

interface ExpandableStyle {
  columns?: string
  rows?: string
}

interface Column {
  header: any
  accessor: string
  sortable: boolean
  colType?: 'number' | 'string' | 'boolean' | 'date'
  colStyle?: string
  rowStyle?: string
  colalign?: 'left' | 'center' | 'right'
  group?: string // Added for column grouping
  hideGroupLabel?: boolean
}

interface DataTableProps {
  columns: Column[]
  stickyPostion?: string
  data: any[]
  align?: 'left' | 'center' | 'right'
  expandable?: boolean
  getExpandableData: any
  getRowId?: any
  isExpanded?: boolean
  expandableStyle?: ExpandableStyle
  sticky?: boolean
  hoverEffect?: boolean
  noHeader?: boolean
  userClass?: string
  isTableLayoutFixed?: boolean
  isRowDisabled?: boolean
  lazyLoadRows?: any
  isHeaderTextBreak?: boolean
}

const DataTableDashboard = ({
  columns,
  data,
  align = 'left',
  stickyPostion,
  expandable,
  isExpanded = false,
  expandableStyle,
  getExpandableData,
  getRowId,
  sticky,
  hoverEffect,
  noHeader,
  userClass,
  isTableLayoutFixed,
  isRowDisabled = false,
  lazyLoadRows,
  isHeaderTextBreak = false,
}: DataTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null)
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: '' })
  const [expandedRows, setExpandedRows] = useState<any>(new Set())
  const [sortedRowIndices, setSortedRowIndices] = useState<any>({})
  const [visibleRows, setVisibleRows] = useState<any>(lazyLoadRows)

  const lastRowRef = useRef<HTMLTableRowElement>(null)

  const [totalItems, setTotalItems] = useState(data.length)

  const lazyLoadNext = (numRows: number) => {
    setVisibleRows((prev: any) => Math.min(prev + numRows, totalItems))
  }

  useEffect(() => {
    setTotalItems(data.length)
  }, [data])

  const lazyLoadBuffer = useCallback(() => {
    if (lastRowRef.current) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          lazyLoadNext(lazyLoadRows)
        }
      })
      observer.observe(lastRowRef.current)
      return () => observer.disconnect()
    }
  }, [lazyLoadRows])

  useEffect(() => {
    const cleanupObserver = lazyLoadBuffer()
    return cleanupObserver
  }, [lazyLoadBuffer])

  useEffect(() => {
    window.addEventListener('scroll', lazyLoadBuffer)
    return () => {
      window.removeEventListener('scroll', lazyLoadBuffer)
    }
  }, [])

  const handleSort = (columnKey: string) => {
    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const handleRowToggle = (rowIndex: any) => {
    getExpandableData(data[rowIndex])
    const isRowExpanded = expandedRows.has(rowIndex)
    const newExpandedRows = new Set(expandedRows)

    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex)
    } else {
      newExpandedRows.clear()
      newExpandedRows.add(rowIndex)
    }

    setExpandedRows(newExpandedRows)
  }

  const handleGetIdClick = (rowIndex: any) => {
    getExpandableData(data[rowIndex])
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data

    const sorted = [...data].sort((a, b) => {
      let aValue = a[sortConfig.key] ?? ''
      let bValue = b[sortConfig.key] ?? ''

      if (aValue == null) aValue = ''
      if (bValue == null) bValue = ''

      if (React.isValidElement(aValue) && React.isValidElement(bValue)) {
        const aProps = aValue.props as AComponentProps
        const bProps = bValue.props as BComponentProps
        const aPropValue = aProps.children
        const bPropValue = bProps.children

        if (typeof aPropValue === 'string' && typeof bPropValue === 'string') {
          return sortConfig.direction === 'asc' ? aPropValue.localeCompare(bPropValue) : bPropValue.localeCompare(aPropValue)
        } else if (typeof aPropValue === 'number' && typeof bPropValue === 'number') {
          return sortConfig.direction === 'asc' ? aPropValue - bPropValue : bPropValue - aPropValue
        } else {
          return 0 // If children are not both strings or both numbers
        }
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      } else {
        return 0 // If values are not both strings or both numbers
      }
    })

    return sorted
  }, [data, sortConfig])

  useEffect(() => {
    const newSortedRowIndices: any = {}
    sortedData?.forEach((row, index: any) => {
      newSortedRowIndices[index] = index
    })
    setSortedRowIndices(newSortedRowIndices)
  }, [sortedData])

  const handleGetIdHover = (itemKey: any) => {
    const currentIndex = sortedRowIndices[itemKey]
    if (currentIndex !== undefined) {
      getRowId(sortedData[currentIndex])
    } else {
      getRowId(null)
    }
  }

  const getAlignment = (align?: string) => {
    switch (align) {
      case 'left':
        return 'start'
      case 'center':
        return 'center'
      case 'right':
        return 'end'
      default:
        return 'start'
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (tableRef?.current && !tableRef?.current.contains(event?.target as Node)) {
        setExpandedRows(new Set())
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  return (
    <table ref={tableRef} className={`w-full ${!!isTableLayoutFixed ? 'table-fixed' : ''}`}>
      <thead className={`${sticky} `}>
        <tr className='w-full border-t border-t-black'>
          {expandable && <th className={`w-8 ${expandableStyle?.columns}`}></th>}
          {/* Render grouped headers */}
          {Array.from(new Set(columns.map((col) => col.group))).map((group, index) => {
            const temp = columns.find((col) => col.group === group)
            return temp?.hideGroupLabel ? (
              <th
                rowSpan={temp?.hideGroupLabel ? 2 : 1}
                className={`${temp?.colStyle} h-12 ${columns.length === index ? '' : 'border-l'}
              p-2 font-proxima text-sm font-bold  ${!isHeaderTextBreak ? 'whitespace-nowrap' : ''} ${
                temp?.sortable ? 'cursor-pointer' : 'cursor-default'
              }`}
                key={index}
                onClick={() => temp?.sortable && handleSort(temp?.accessor)}
              >
                {temp?.sortable ? (
                  <span
                    className={`flex items-center font-proxima justify-${getAlignment(temp?.colalign)} gap-2 ${
                      !!isHeaderTextBreak ? 'break-all' : ''
                    }`}
                  >
                    {temp?.header}
                    <SortIcon order={sortConfig?.key === temp?.accessor && sortConfig?.direction} />
                  </span>
                ) : (
                  <span
                    className={`flex items-center font-proxima justify-${getAlignment(temp?.colalign)} ${
                      !!isHeaderTextBreak ? 'break-all' : ''
                    }`}
                  >
                    {temp?.header}
                  </span>
                )}
              </th>
            ) : (
              <th
                rowSpan={temp?.hideGroupLabel ? 2 : 1}
                className={`${temp?.colStyle} ${
                  Array.from(new Set(columns.map((col) => col.group))).length === index ? '' : 'border-l'
                } ${temp?.hideGroupLabel ? '' : 'border-b'} h-12 p-2 font-proxima font-bold  ${
                  !isHeaderTextBreak ? 'whitespace-nowrap' : ''
                } ${temp?.sortable ? 'cursor-pointer' : 'cursor-default'}`}
                colSpan={columns.filter((col) => col.group === group).length}
                key={index}
              >
                {temp?.hideGroupLabel ? '' : group}
              </th>
            )
          })}
        </tr>
        <tr className={`w-full border-b border-b-black`}>
          {/* Render individual headers */}
          {expandable && <th className={`w-8 ${expandableStyle?.columns}`}></th>}
          {columns
            .filter((col) => col.hideGroupLabel === false)
            .map((column, colIndex) => (
              <th
                className={`${column?.colStyle} h-12 ${columns.length === colIndex ? '' : 'border-l'}
              p-2 font-proxima text-sm font-bold  ${!isHeaderTextBreak ? 'whitespace-nowrap' : ''} ${
                column?.sortable ? 'cursor-pointer' : 'cursor-default'
              }`}
                key={colIndex}
                onClick={() => column?.sortable && handleSort(column?.accessor)}
              >
                {column?.sortable ? (
                  <span
                    className={`flex items-center font-proxima justify-${getAlignment(column?.colalign)} gap-2 ${
                      !!isHeaderTextBreak ? 'break-all' : ''
                    }`}
                  >
                    {column?.header}
                    <SortIcon order={sortConfig?.key === column?.accessor && sortConfig?.direction} />
                  </span>
                ) : (
                  <span
                    className={`flex items-center font-proxima justify-${getAlignment(column?.colalign)} ${
                      !!isHeaderTextBreak ? 'break-all' : ''
                    }`}
                  >
                    {column?.header}
                  </span>
                )}
              </th>
            ))}
        </tr>
      </thead>
      <tbody>
        {sortedData?.slice(0, totalItems)?.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <tr
              key={row}
              className={`${hoverEffect ? 'hover:bg-whiteSmoke' : ''} ${
                isRowDisabled && sortedData?.length !== rowIndex + 1 ? `row-disabled` : ''
              }`}
              onMouseEnter={() => {
                setSortedRowIndices({ ...sortedRowIndices, [rowIndex]: rowIndex })
                handleGetIdHover(rowIndex)
              }}
              onMouseLeave={() => {
                setSortedRowIndices({ ...sortedRowIndices, [rowIndex]: undefined })
                handleGetIdHover(undefined)
              }}
              onClick={!getRowId && getExpandableData ? () => handleGetIdClick(rowIndex) : undefined}
            >
              {/* Render expandable column if enabled */}
              {expandable &&
                (row?.details ? (
                  <td
                    className={`${expandableStyle?.rows} h-12 font-proxima text-[14px] ${
                      expandedRows.has(rowIndex) ? 'border-none' : 'border-b'
                    }  cursor-pointer border-[#ccc]`}
                    onClick={() => handleRowToggle(rowIndex)}
                  >
                    <div
                      className={`flex items-center justify-center p-4 transition-transform ${
                        expandedRows.has(rowIndex) || isExpanded ? '-rotate-90 duration-300' : 'rotate-90 duration-200'
                      }`}
                    >
                      <ChevronRightIcon />
                    </div>
                  </td>
                ) : (
                  <td
                    className={`w-8 ${expandableStyle?.rows} h-12 pl-2 font-proxima text-[14px] ${
                      expandedRows.has(rowIndex) ? 'border-none' : 'border-b'
                    } ${noHeader && 'border-t'} cursor-pointer border-[#ccc]`}
                  ></td>
                ))}
              {/* Render data cells */}
              {columns?.map((column, colIndex) => (
                <React.Fragment key={colIndex}>
                  {/* Render colSpan for grouped columns */}
                  {column.group && colIndex === 0 && (
                    <td colSpan={columns.filter((col) => col.group === column.group).length}>
                      {/* Render group-specific content if needed */}
                    </td>
                  )}
                  <td
                    key={colIndex}
                    className={`${row?.style} ${
                      noHeader && column?.colStyle
                    } ${column?.rowStyle} h-12 px-1 py-1 font-proxima text-[14px] ${
                      expandedRows.has(rowIndex) ? 'border-none' : 'border-b'
                    } break-all border-[#ccc] ${noHeader && 'border-t'}`}
                  >
                    <span
                      className={`flex items-center break-normal p-1 font-proxima text-[14px] justify-${getAlignment(
                        column?.colalign
                      )}`}
                    >
                      {row[column?.accessor]}
                    </span>
                  </td>
                </React.Fragment>
              ))}
            </tr>
            {/* Render expanded row content if expanded */}
            {(expandedRows.has(rowIndex) || isExpanded) && (
              <tr>
                <td className='font-proxima text-[14px]' colSpan={columns?.length + 1}>
                  {row?.details ? (
                    row?.details
                  ) : (
                    <div className={`m-3 font-proxima text-[14px] ${expandableStyle?.rows}`}>No data to display</div>
                  )}
                </td>
              </tr>
            )}
            {/* Set ref to last row for lazy loading */}
            {rowIndex === sortedData.length - 1 && <tr ref={lastRowRef}></tr>}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

export default DataTableDashboard