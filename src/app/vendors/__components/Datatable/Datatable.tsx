import React, { useCallback, useEffect, useRef, useState } from "react";
import ChevronRight from "./icons/ChevronRight";
import SortIcon from "./icons/SortIcon";

interface AComponentProps {
  children: string;
}

interface BComponentProps {
  children: string;
}

interface ExpandableStyle {
  columns?: string;
  rows?: string;
}

interface Column {
  header: any;
  accessor: string;
  sortable: boolean;
  colType?: "number" | "string" | "boolean" | "date";
  colStyle?: string;
  rowStyle?: string;
  colalign?: "left" | "center" | "right";
  group?: number; // Added for column grouping
  groupLabel?: any;
  hideGroupLabel?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  align?: "left" | "center" | "right";
  expandable?: boolean;
  getExpandableData: any;
  getRowId?: any;
  isExpanded?: boolean;
  expandableStyle?: ExpandableStyle;
  sticky?: boolean;
  hoverEffect?: boolean;
  noHeader?: boolean;
  userClass?: string;
  isTableLayoutFixed?: boolean;
  isRowDisabled?: boolean;
  lazyLoadRows?: any;
  isHeaderTextBreak?: boolean;
  columnGrouping?: boolean;
  expandOneOnly?: boolean;
  zIndex?: number;
}

const DataTable = ({
  columns,
  data,
  align = "left",
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
  columnGrouping = false,
  expandOneOnly = true,
  zIndex = 5,
}: DataTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [sortConfig, setSortConfig] = useState<any>({
    key: columns[0]?.accessor || null,
    direction: "asc",
  });
  const [expandedRows, setExpandedRows] = useState<any>(new Set());
  const [sortedRowIndices, setSortedRowIndices] = useState<any>({});
  const [visibleRows, setVisibleRows] = useState<any>(lazyLoadRows);

  const lastRowRef = useRef<HTMLTableRowElement>(null);

  const [totalItems, setTotalItems] = useState(data.length);

  const lazyLoadNext = (numRows: number) => {
    setVisibleRows((prev: any) => Math.min(prev + numRows, totalItems));
  };

  const lazyLoadBuffer = useCallback(() => {
    if (lastRowRef.current) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          lazyLoadNext(lazyLoadRows);
        }
      });
      observer.observe(lastRowRef.current);
      return () => observer.disconnect();
    }
  }, [lazyLoadRows]);

  const handleSort = (columnKey: string) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const handleRowToggle = (rowIndex: any) => {
    getExpandableData(data[rowIndex]);
    const isRowExpanded = expandedRows.has(rowIndex); // unused code
    const newExpandedRows = new Set(expandedRows);

    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      if (expandOneOnly === true) {
        newExpandedRows.clear();
        newExpandedRows.add(rowIndex);
      }
      newExpandedRows.add(rowIndex);
    }

    setExpandedRows(newExpandedRows);
  };

  const handleGetIdClick = (rowIndex: any) => {
    getExpandableData(data[rowIndex]);
  };

  const handleGetIdHover = (itemKey: any) => {
    const currentIndex = sortedRowIndices[itemKey];
    if (currentIndex !== undefined) {
      getRowId(sortedData[currentIndex]);
    } else {
      getRowId(null);
    }
  };

  const getAlignment = (align?: string) => {
    switch (align) {
      case "left":
        return "start";
      case "center":
        return "center";
      case "right":
        return "end";
      default:
        return "start";
    }
  };

  useEffect(() => {
    if (isExpanded === true) {
      const initialExpandedRows = new Set(expandedRows);

      data.forEach((item: any, index: number) => {
        initialExpandedRows.add(index);
      });
      setExpandedRows(initialExpandedRows);
    }
  }, [data]);

  // useEffect(() => {
  //   const handleOutsideClick = (event: MouseEvent) => {
  //     if (
  //       tableRef?.current &&
  //       !tableRef?.current.contains(event?.target as Node)
  //     ) {
  //       setExpandedRows(new Set());
  //     }
  //   };
  //   document.addEventListener("click", handleOutsideClick);
  //   return () => {
  //     document.removeEventListener("click", handleOutsideClick);
  //   };
  // }, []);

  useEffect(() => {
    window.addEventListener("scroll", lazyLoadBuffer);
    return () => {
      window.removeEventListener("scroll", lazyLoadBuffer);
    };
  }, []);

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      let aValue = a[sortConfig.key] ?? "";
      let bValue = b[sortConfig.key] ?? "";

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (React.isValidElement(aValue) && React.isValidElement(bValue)) {
        const aProps = aValue.props as AComponentProps;
        const bProps = bValue.props as BComponentProps;
        const aPropValue = aProps.children;
        const bPropValue = bProps.children;

        if (typeof aPropValue === "string" && typeof bPropValue === "string") {
          return sortConfig.direction === "asc"
            ? aPropValue.localeCompare(bPropValue)
            : bPropValue.localeCompare(aPropValue);
        } else if (
          typeof aPropValue === "number" &&
          typeof bPropValue === "number"
        ) {
          return sortConfig.direction === "asc"
            ? aPropValue - bPropValue
            : bPropValue - aPropValue;
        } else {
          return 0; // If children are not both strings or both numbers
        }
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      } else {
        return 0; // If values are not both strings or both numbers
      }
    });

    return sorted;
  }, [data, sortConfig]);

  useEffect(() => {
    const newSortedRowIndices: any = {};
    sortedData?.forEach((row, index: any) => {
      newSortedRowIndices[index] = index;
    });
    setSortedRowIndices(newSortedRowIndices);
  }, [sortedData]);

  useEffect(() => {
    setTotalItems(data.length);
  }, [data]);

  useEffect(() => {
    const cleanupObserver = lazyLoadBuffer();
    return cleanupObserver;
  }, [lazyLoadBuffer]);

  useEffect(() => {
    if (columnGrouping) {
      columns.sort((a: any, b: any) => {
        if (a.group < b.group) return -1;
        if (a.group > b.group) return 1;
        return 0;
      });
    }
  }, [columns]);


  return (
    <table ref={tableRef}
      className={`w-full border-separate border-spacing-0 ${!!isTableLayoutFixed ? "table-fixed" : ""}`}>
      <thead
        style={
          sticky
            ? {
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: zIndex,
            }
            : {}
        }
      >
        {columnGrouping && (
          <tr className="w-full">
            {expandable && (
              <th
                style={
                  sticky
                    ? {
                      position: "sticky",
                      top: 0,
                      backgroundColor: "white",
                      zIndex: zIndex,
                    }
                    : {}
                }
                rowSpan={2}
                className={`h-[40px] w-8 border-y border-y-pureBlack ${expandableStyle?.columns}`}
              ></th>
            )}
            {Array.from(new Set(columns.map((col) => col.group))).map(
              (group, index) => {
                const temp = columns.find((col) => col.group === group);
                return temp?.hideGroupLabel ? (
                  columns
                    .filter((col) => col.group === group)
                    .map((colItem, colIndex) => (
                      <th
                        style={
                          sticky
                            ? {
                              position: "sticky",
                              top: 0,
                              backgroundColor: "white",
                              zIndex: zIndex,
                            }
                            : {}
                        }
                        rowSpan={colItem?.hideGroupLabel ? 2 : 1}
                        className={`border-y border-y-pureBlack min-w-[100px] ${colItem?.colStyle
                          } h-[40px] ${columns.length === index ? "" : "border-l"}
            p-2 font-proxima text-sm font-bold  ${!isHeaderTextBreak ? "whitespace-nowrap" : ""
                          } ${colItem?.sortable ? "cursor-pointer" : "cursor-default"}`}
                        key={index}
                        onClick={() =>
                          colItem?.sortable && handleSort(colItem?.accessor)
                        }
                      >
                        {colItem?.sortable ? (
                          <span
                            className={`flex items-center font-proxima justify-${getAlignment(
                              colItem?.colalign
                            )} gap-2 ${!!isHeaderTextBreak ? "break-all" : ""}`}
                          >
                            {colItem?.header}
                            <SortIcon
                              order={
                                sortConfig?.key === colItem?.accessor &&
                                sortConfig?.direction
                              }
                            />
                          </span>
                        ) : (
                          <span
                            className={`flex items-center font-proxima justify-${getAlignment(
                              colItem?.colalign
                            )} ${!!isHeaderTextBreak ? "break-all" : ""}`}
                          >
                            {colItem?.header}
                          </span>
                        )}
                      </th>
                    ))
                ) : (
                  <th
                    style={
                      sticky
                        ? {
                          position: "sticky",
                          top: 0,
                          backgroundColor: "white",
                          zIndex: zIndex,
                        }
                        : {}
                    }
                    rowSpan={temp?.hideGroupLabel ? 2 : 1}
                    className={`border-t border-t-pureBlack ${temp?.colStyle} ${Array.from(new Set(columns.map((col) => col.group)))
                      .length === index
                      ? ""
                      : `border-l`
                      } ${temp?.hideGroupLabel ? "" : "border-b"
                      } h-[40px] p-2 font-proxima font-bold ${!isHeaderTextBreak ? "whitespace-nowrap" : ""
                      } ${temp?.sortable ? "cursor-pointer" : "cursor-default"}`}
                    colSpan={
                      columns.filter((col) => col.group === group).length
                    }
                    key={index}
                  >
                    {temp?.hideGroupLabel
                      ? ""
                      : !!temp?.groupLabel
                        ? temp.groupLabel
                        : group}
                  </th>
                );
              }
            )}
          </tr>
        )}
        <tr className={`h-[40px] w-full border-t border-b border-b-pureBlack border-t-pureBlack ${noHeader ? "hidden" : ""}`}>
          {expandable && !columnGrouping && (
            <th
              style={
                sticky
                  ? {
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: zIndex,
                  }
                  : {}
              }
              className={`w-8 border-t border-t-pureBlack border-y border-y-pureBlack ${expandableStyle?.columns}`}
            ></th>
          )}
          {(columnGrouping
            ? columns.filter((col) => col.hideGroupLabel === false)
            : columns
          ).map((column, colIndex) => (
            <th
              style={
                sticky
                  ? {
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: zIndex,
                  }
                  : {}
              }
              className={`${columnGrouping ? "" : "border-t border-t-pureBlack"
                } border-b border-b-black min-w-[100px] !h-[40px] ${column?.colStyle}
              ${columns.length === colIndex
                  ? ""
                  : columnGrouping
                    ? "border-l"
                    : ""
                }
              p-2 font-proxima text-sm font-bold  ${!isHeaderTextBreak ? "whitespace-nowrap" : ""
                } ${column?.sortable ? "cursor-pointer" : "cursor-default"}`}
              key={colIndex}
              onClick={() => column?.sortable && handleSort(column?.accessor)}
            >
              {column?.sortable ? (
                <span
                  className={`flex text-ellipsis break-all items-center font-proxima justify-${getAlignment(
                    column?.colalign
                  )} gap-2 ${!!isHeaderTextBreak ? "break-all" : ""}`}
                >
                  {column?.header}
                  <SortIcon
                    order={
                      sortConfig?.key === column?.accessor &&
                      sortConfig?.direction
                    }
                  />
                </span>
              ) : (
                <span
                  className={`flex items-center font-proxima justify-${getAlignment(
                    column?.colalign
                  )} ${!!isHeaderTextBreak ? "break-all" : ""}`}
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
              className={`h-[45px] ${hoverEffect ? "hover:bg-whiteSmoke" : ""} `}
              onMouseEnter={() => {
                setSortedRowIndices({
                  ...sortedRowIndices,
                  [rowIndex]: rowIndex,
                });
                handleGetIdHover(rowIndex);
              }}
              onMouseLeave={() => {
                setSortedRowIndices({
                  ...sortedRowIndices,
                  [rowIndex]: undefined,
                });
                handleGetIdHover(undefined);
              }}
              onClick={
                !getRowId && getExpandableData
                  ? () => handleGetIdClick(rowIndex)
                  : undefined
              }
            >
              {/* Render expandable column if enabled */}
              {expandable &&
                (row?.details ? (
                  <td
                    className={`${expandableStyle?.rows
                      } font-proxima text-sm ${expandedRows.has(rowIndex) ? "border-none" : "border-b"
                      }  cursor-pointer border-[#ccc]`}
                    onClick={() => handleRowToggle(rowIndex)}
                  >
                    <div
                      className={`flex items-center justify-center ${isTableLayoutFixed ? "" : "p-4"
                        } transition-transform ${expandedRows.has(rowIndex)
                          ? "-rotate-90 duration-300"
                          : "rotate-90 duration-200"
                        }`}
                    >
                      <ChevronRight />
                    </div>
                  </td>
                ) : (
                  <td
                    className={`w-8 ${expandableStyle?.rows
                      } h-[45px] pl-2 font-proxima text-sm ${expandedRows.has(rowIndex) ? "border-none" : "border-b"
                      } ${noHeader ? "border-t" : ""} cursor-pointer border-[#ccc]`}
                  ></td>
                ))}
              {/* Render data cells */}
              {columns?.map((column, colIndex) => (
                <React.Fragment key={colIndex}>
                  <td
                    key={colIndex}
                    className={`${row?.style} ${noHeader ? column.colStyle : ""} ${column.rowStyle
                      } h-[45px] font-proxima text-sm ${expandedRows.has(rowIndex) ? "border-none" : "border-b"
                      } break-all border-[#ccc] ${noHeader ? "border-t" : ""}`}
                  >
                    <span className={`flex items-center break-normal ${column?.colalign == "center" ? "" : column?.colalign == "right" ? "pr-2" : "pl-2"} tracking-[0.02em] font-proxima text-sm justify-${getAlignment(column?.colalign)}`}>
                      {row[column?.accessor]}
                    </span>
                  </td>
                </React.Fragment>
              ))}
            </tr>
            {/* Render expanded row content if expanded */}
            {(expandedRows.has(rowIndex)) && (
              <tr>
                <td
                  className="font-proxima text-sm"
                  colSpan={columns?.length + 1}
                >
                  {row?.details ? (
                    row?.details
                  ) : (
                    <div
                      className={`m-3 font-proxima text-sm ${expandableStyle?.rows}`}
                    >
                      No data to display
                    </div>
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
  );
};

export default DataTable;