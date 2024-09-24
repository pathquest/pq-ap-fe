import ChartExpandIcon from '@/assets/Icons/chart/ChartExpandIcon'
import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon'
import DataLoadingStatus from '@/components/Common/Functions/DataLoadingStatus'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { utcFormatDate } from '@/components/Common/Functions/FormatDate'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getVendorWiseMonthlyPayment } from '@/store/features/dashboard/dashboardSlice'
import { setFilterFields } from '@/store/features/vendor/vendorSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DataTable, Loader, Tooltip, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'
import DashboardFilter from '../modal/DashboardFilter'
import ExpandModal from '../modal/ExpandModal'

const VendorWiseMonthlyPayment: React.FC<any> = ({ LocationOption }) => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [isExpandChartOpen, setIsExpandChartOpen] = useState(false)
    const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
    const { data: session } = useSession()
    const CompanyId = Number(session?.user?.CompanyId)
    const [vendorList, setVendorList] = useState<any>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
    const filterFields = useAppSelector((state: any) => state.dashboard.filterFields["VendorWiseMonthlyPayment"]);

    const columns: any = [
        {
            header: "VENDOR ID",
            accessor: "VendorId",
            sortable: false,
            colalign: "left",
            colStyle: '!w-[120px] !tracking-[0.02em]'
        },
        {
            header: "VENDOR",
            accessor: "Vendor",
            sortable: false,
            colalign: "left",
            colStyle: '!w-[150px] !tracking-[0.02em]'
        },
        {
            header: "TOTAL",
            accessor: "Total",
            sortable: false,
            colalign: "right",
            colStyle: '!w-[140px] !tracking-[0.02em]'
        },
        {
            header: "0-30 days",
            accessor: "0To30",
            sortable: false,
            colalign: "right",
            colStyle: '!w-[140px] !tracking-[0.02em]'
        },
        {
            header: "31-60 days",
            accessor: "31To60",
            sortable: false,
            colalign: "right",
            colStyle: '!w-[140px] !tracking-[0.02em]'
        },
        {
            header: "61-90 days",
            accessor: "61To90",
            sortable: false,
            colalign: "right",
            colStyle: '!w-[140px] !tracking-[0.02em]'
        },
        {
            header: "91 + days",
            accessor: "91To",
            sortable: false,
            colalign: "right",
            colStyle: '!w-[140px] !tracking-[0.02em]'
        }
    ];

    const handleVendorClick = (id: string) => {
        router.push(`/vendors`);
        dispatch(setFilterFields({
            VendorIds: [id],
            PaymentMethod: [],
            StatusIds: [],
            MinPayables: '',
            MaxPayables: ''
        }))
    }

    const vendorListData = vendorList && vendorList?.map((d: any) =>
        new Object({
            ...d,
            Vendor: d?.VendorName && d?.VendorName.length > 16
                ? <Tooltip position='right' content={d?.VendorName} className='!m-0 !p-0 !z-[4]'>
                    <label
                        onClick={() => handleVendorClick(d?.VendorId)}
                        className="cursor-pointer text-sm w-full"
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                        {d?.VendorName}
                    </label>
                </Tooltip>
                : <label className="font-proxima text-sm cursor-pointer" onClick={() => handleVendorClick(d?.VendorId)}>{d?.VendorName}</label>,
            Total: (
                <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
                    ${formatCurrency(d.Total)}
                </label>
            ),
            "0To30": (
                <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
                    ${formatCurrency(d.FirstGroup)}
                </label>
            ),
            "31To60": (
                <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
                    ${formatCurrency(d.SecondGroup)}
                </label>
            ),
            "61To90": (
                <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
                    ${formatCurrency(d.ThirdGroup)}
                </label>
            ),
            "91To": (
                <label className='font-proxima text-sm !font-bold !tracking-[0.02em]'>
                    ${formatCurrency(d.LastGroup)}
                </label>
            )
        }))

    const getVendorAgingDashboard = (newFilterFields: any) => {
        setIsLoading(true);
        const params = {
            CompanyIds: [CompanyId],
            Age: 30,
            SortColumn: 'Total',
            SortOrder: true,
            PageNumber: 1,
            PageSize: 10,
            LocationIds: newFilterFields?.LocationIds.length != 0 ? newFilterFields?.LocationIds.map(Number) : null,
            StartDate: newFilterFields?.StartDate ? utcFormatDate(newFilterFields.StartDate) : null,
            EndDate: newFilterFields?.EndDate ? utcFormatDate(newFilterFields.EndDate) : null
        }
        performApiAction(dispatch, getVendorWiseMonthlyPayment, params, (responseData: any) => {
            setIsLoading(false)
            setVendorList(responseData)
        }, () => {
            setIsLoading(false)
        })
    }

    useEffect(() => {
        if (CompanyId) {
            setVendorList([])
            getVendorAgingDashboard(filterFields)
        }
    }, [CompanyId])

    const handleFilterOpen = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsFilterOpen(true)
    }

    const handleFilterClose = () => {
        setIsFilterOpen(false)
    }

    const onSuccessApply = (newFilterFields: any) => {
        getVendorAgingDashboard(newFilterFields)
    }

    return (<>
        <div className='h-full w-full overflow-auto'>
            <div className='bg-white h-[69px] flex justify-between items-center border-b border-lightSilver'>
                <div className='laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 flex justify-between  w-full  chart_header'>
                    <div className="header items-center flex">
                        <Typography type='h5' className='title !text-base hd:!text-lg 2xl:!text-lg 3xl:!text-lg font-proxima font-semibold tracking-[0.02em] text-darkCharcoal'>
                            Vendor-wise monthly payment
                        </Typography>
                    </div>
                    <div className='flex justify-center items-center'>
                        <div className='filter_change cursor-pointer ml-[15px] relative' onClick={handleFilterOpen}><ChartFilterIcon />
                            {/* Filter Modal */}
                            <DashboardFilter isFilterOpen={isFilterOpen} locationOption={LocationOption} onClose={handleFilterClose} ChartType="VendorWiseMonthlyPayment" onSuccessApply={onSuccessApply} />
                        </div>
                        <div className='expand_screen cursor-pointer ml-[15px]'
                            onClick={() => setIsExpandChartOpen(true)}><ChartExpandIcon /></div>
                    </div>
                </div>
            </div>
            <div className='laptopMd:h-[87.8%] lg:h-[87.8%] xl:h-[87.8%] hd:h-[90%] 2xl:h-[90%] 3xl:h-[90%] overflow-auto dashboardMain custom-scroll'>
                <div className={`${vendorList.length === 0 ? 'h-11' : 'h-auto'}`}>
                    <DataTable
                        columns={columns}
                        data={vendorListData.length > 0 ? vendorListData : []}
                        getRowId={() => { }}
                        hoverEffect
                        sticky
                        isTableLayoutFixed
                        getExpandableData={() => { }}
                    />
                </div>
                {vendorList.length === 0 ? isLoading ?
                    <div className='flex h-[calc(52vh-5px)] w-full items-center justify-center'>
                        <Loader size='md' helperText />
                    </div>
                    : <div className='flex h-[59px] sticky top-0 left-0 w-full font-proxima items-center justify-center border-b border-b-[#ccc]'>
                        No records available at the moment.
                    </div> : ""}
            </div>
        </div>
        <ExpandModal
            onOpen={isExpandChartOpen}
            onClose={() => setIsExpandChartOpen(false)}
            modalTitle='Vendor Wise Monthly Payment'
            modalContent={
                <div className='dashboardMain w-full laptopMd:h-[calc(98vh-145px)] lg:h-[calc(98vh-145px)] xl:h-[calc(98vh-145px)] hd:h-[calc(90vh-145px)] 2xl:h-[calc(90vh-145px)] 3xl:h-[calc(90vh-145px)] overflow-y-auto custom-scroll'>
                    <div className={`${vendorList.length === 0 ? 'h-11' : 'h-auto'}`}>
                        <DataTable
                            columns={columns}
                            data={vendorListData.length > 0 ? vendorListData : []}
                            getRowId={() => { }}
                            hoverEffect
                            sticky
                            isTableLayoutFixed
                            getExpandableData={() => { }}
                        />
                    </div>
                    <DataLoadingStatus isLoading={isLoading} data={vendorList} />
                </div>
            }
        />
    </>
    )
}

export default VendorWiseMonthlyPayment