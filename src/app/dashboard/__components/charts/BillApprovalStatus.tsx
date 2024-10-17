import ChartExpandIcon from '@/assets/Icons/chart/ChartExpandIcon';
import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon';
import { utcFormatDate } from '@/components/Common/Functions/FormatDate';
import { performApiAction } from '@/components/Common/Functions/PerformApiAction';
import { useAppDispatch, useAppSelector } from '@/store/configureStore';
import { setBillApprovalFilterFields } from '@/store/features/billApproval/approvalSlice';
import { getBillApprovalStatus } from '@/store/features/dashboard/dashboardSlice';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ChartTypeDropdown from '../modal/ChartType';
import DashboardFilter from '../modal/DashboardFilter';
import ExpandModal from '../modal/ExpandModal';
import { Loader, Typography } from 'pq-ap-lib';

const BillApprovalStatus: React.FC<any> = ({ LocationOption }) => {
    const { data: session } = useSession()
    const CompanyId = Number(session?.user?.CompanyId)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const filterFields = useAppSelector((state: any) => state.dashboard.filterFields["BillApprovalStatus"]);

    const [isExpandChartOpen, setIsExpandChartOpen] = useState<boolean>(false)
    const [chartData, setChartData] = useState<any>([])
    const [pieChartDataCount, setPieChartDataCount] = useState<any>({
        BillApprovalPending: 0,
        BillApproved: 0,
        BillRejected: 0
    })
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
    const [chartType, setChartType] = useState<string>('pie')
    const [chartLabel, setChartLabel] = useState<string>('Pie')
    const [isStacked, setIsStacked] = useState<boolean>(false);
    const [isMonthWise, setIsMonthWise] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const getBillApprovalDashboard = (newFilterFields: any) => {
        const startDate = new Date(newFilterFields?.StartDate);
        const endDate = new Date(newFilterFields?.EndDate);
        const dayDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        const isMonthWiseData = dayDifference > 31;
        setIsMonthWise(isMonthWiseData);
        setIsLoading(true)

        const params = {
            IsMonthWise: isMonthWiseData,
            CompanyIds: [CompanyId],
            LocationIds: newFilterFields?.LocationIds.length != 0 ? newFilterFields?.LocationIds.map(Number) : null,
            StartDate: newFilterFields?.StartDate ? utcFormatDate(newFilterFields.StartDate) : null,
            EndDate: newFilterFields?.EndDate ? utcFormatDate(newFilterFields.EndDate) : null
        }
        performApiAction(dispatch, getBillApprovalStatus, params, (responseData: any) => {
            const totalBillApprovalPending = responseData.reduce((sum: any, obj: any) => sum + obj.BillApprovalPending, 0);
            const totalBillApproved = responseData.reduce((sum: any, obj: any) => sum + obj.BillApproved, 0);
            const totalBillRejected = responseData.reduce((sum: any, obj: any) => sum + obj.BillRejected, 0);
            setPieChartDataCount({
                BillApprovalPending: totalBillApprovalPending,
                BillApproved: totalBillApproved,
                BillRejected: totalBillRejected
            });
            const totalBills = totalBillApprovalPending + totalBillApproved + totalBillRejected;
            setChartData(responseData);
            setIsLoading(false)
        }, () => {
            setIsLoading(false)
        })
    }

    useEffect(() => {
        if (CompanyId) {
            getBillApprovalDashboard(filterFields);
        }
    }, [CompanyId]);

    const handleChartRedirect = (seriesName: string) => {
        const statusMap: any = {
            "Pending": '0',
            "Approved": '1',
            "Rejected": '2'
        };

        const approvalStatusId = statusMap[seriesName] || '0';
        dispatch(setBillApprovalFilterFields({
            VendorIds: [],
            ApprovalStatusIds: [approvalStatusId],
            BillNumber: '',
            MinAmount: '',
            MaxAmount: '',
            BillStartDate: filterFields.StartDate,
            BillEndDate: filterFields.EndDate,
            StartDueDate: '',
            EndDueDate: '',
            Assignee: '1',
            LocationIds: filterFields?.LocationIds.length != 0 ? filterFields?.LocationIds.map(Number) : []
        }));
        router.push(`/approvals?approvalId=1`);
    }

    const getColumnChartOptions = () => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let categories = [];
        let billApprovalPending = [];
        let billApproved = [];
        let billRejected = [];

        if (filterFields?.StartDate && filterFields?.EndDate) {
            const startDate = new Date(filterFields.StartDate);
            const endDate = new Date(filterFields.EndDate);

            if (isMonthWise) {
                // Group data by month
                const monthData: any = {};
                chartData.forEach((item: any) => {
                    const key = `${item.Year}-${item.Month}`;
                    if (!monthData[key]) {
                        monthData[key] = { BillApprovalPending: 0, BillApproved: 0, BillRejected: 0 };
                    }
                    monthData[key].BillApprovalPending += item.BillApprovalPending;
                    monthData[key].BillApproved += item.BillApproved;
                    monthData[key].BillRejected += item.BillRejected;
                });

                const sortedKeys = Object.keys(monthData).sort();
                sortedKeys.forEach(key => {
                    const [year, month] = key.split('-');
                    if (monthData[key].BillApprovalPending > 0 || monthData[key].BillApproved > 0 || monthData[key].BillRejected > 0) {
                        categories.push(`${monthNames[parseInt(month) - 1]} ${year}`);
                        billApprovalPending.push(monthData[key].BillApprovalPending);
                        billApproved.push(monthData[key].BillApproved);
                        billRejected.push(monthData[key].BillRejected);
                    }
                });
            } else {
                // Display data by day
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const day = currentDate.getDate();
                    const dayName = dayNames[currentDate.getDay()];

                    let categoryLabel;
                    if (filterFields.Period === "This Week" || filterFields.Period === "Last Week") {
                        categoryLabel = dayName;
                    } else if (filterFields.Period === "This Month" || filterFields.Period === "Last Month") {
                        categoryLabel = day.toString();
                    } else {
                        categoryLabel = `${monthNames[month]} ${day}`;
                    }
                    categories.push(categoryLabel);

                    const matchingData = chartData.find((item: any) =>
                        item.Year == year &&
                        item.Month == (month + 1) &&
                        item.Day == day
                    );

                    billApprovalPending.push(matchingData ? matchingData.BillApprovalPending : 0);
                    billApproved.push(matchingData ? matchingData.BillApproved : 0);
                    billRejected.push(matchingData ? matchingData.BillRejected : 0);

                    // Increment the date by one day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
        } else {
            const year = chartData.length > 0 ? chartData[0].Year : new Date().getFullYear().toString();
            categories = monthNames.map(month => `${month} ${year.substring(2)}`);
            billApprovalPending = Array(12).fill(0);
            billApproved = Array(12).fill(0);
            billRejected = Array(12).fill(0);

            chartData.forEach((item: any) => {
                const monthIndex = parseInt(item.Month, 10) - 1;
                billApprovalPending[monthIndex] = item.BillApprovalPending;
                billApproved[monthIndex] = item.BillApproved;
                billRejected[monthIndex] = item.BillRejected;
            });
        }

        return {
            chart: {
                type: chartType,
                spacingTop: 10,
                scrollablePlotArea: {
                    minWidth: 1000,
                    scrollPositionX: 1
                }
            },
            title: {
                text: null,
            },
            subtitle: {
                text: null,
            },
            tooltip: {
                valueSuffix: ' Bills'
            },
            colors: ['#005EB5', '#53BB77', '#CF815F'],
            plotOptions: {
                column: {
                    pointWidth: 20,
                    pointPadding: 0,
                    borderWidth: 0
                },
                series: {
                    pointWidth: 40,
                    stacking: isStacked ? 'normal' : undefined,
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function (this: Highcharts.Point) {
                                handleChartRedirect(this.series.name)
                            }
                        }
                    },
                }
            },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    step: 1
                },
                scrollbar: {
                    enabled: true,
                },
            },
            yAxis: [{
                title: {
                    text: 'Number of Bills'
                },
                labels: {
                    format: '{value}'
                },
                gridLineColor: '#E0E0E0',
                gridLineDashStyle: 'Dash',
                scrollbar: {
                    enabled: true,
                },
            }],
            series: [
                {
                    name: 'Pending',
                    color: '#005EB5',
                    data: billApprovalPending
                },
                {
                    name: 'Approved',
                    color: '#53BB77',
                    data: billApproved
                },
                {
                    name: 'Rejected',
                    color: '#CF815F',
                    data: billRejected
                },
            ],
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
                itemStyle: {
                    fontWeight: 'normal'
                },
                symbolRadius: 0,
                symbolWidth: 10,
                symbolHeight: 10,
                itemDistance: 20,
            },
            credits: {
                enabled: false,
            },
        };
    }

    const getPieChartOptions = (isExpanded: boolean) => {
        const totalBills = pieChartDataCount.BillApprovalPending + pieChartDataCount.BillApproved + pieChartDataCount.BillRejected;
        return {
            chart: {
                type: "pie",
                spacingTop: 0,
                spacingBottom: 10,
                width: isExpanded ? 500 : null,
                height: isExpanded ? 400 : null,
                events: {
                    render: function (this: any) {

                        const chart = this;
                        const series = chart.series[0];
                        let centerLabel = chart.customLabel;

                        if (!centerLabel) {
                            centerLabel = chart.customLabel = chart.renderer.label(
                                '',
                                0,
                                0,
                                undefined,
                                undefined,
                                undefined,
                                true
                            ).add();
                        }

                        const x = series.center[0] + chart.plotLeft;
                        const y = series.center[1] + chart.plotTop;
                        centerLabel.attr({
                            text: `<div style="text-align: center; margin-top:${isExpanded ? '-30px' : '-10px'}; margin-left:${isExpanded ? '-56px' : '-42px'}; font-size: ${isExpanded ? '25px' : '18px'};">Total Bills:<br><span style="font-weight: bold; font-size: ${isExpanded ? '28px' : '22px'}">${totalBills}</span></div>`,
                            x: x,
                            y: y - 10,
                            'text-anchor': 'middle'
                        });

                        // Adjust font size based on chart size
                        const fontSize = isExpanded ? '30px' : '18px';
                        centerLabel.css({ fontSize: fontSize });
                    }
                }
            },
            title: {
                text: null,
            },
            tooltip: {
                headerFormat: "",
                pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b><br/>' +
                    'Count: <b>{point.y}</b><br/>' +
                    'Percentage: <b>{point.percentage:.2f}%</b>',
                positioner: function (
                    this: any,
                    labelWidth: number,
                    labelHeight: number,
                    point: Highcharts.Point
                ): Highcharts.PositionObject {
                    const chart = this.chart;
                    const plotLeft = chart.plotLeft;
                    const plotTop = chart.plotTop;
                    const plotWidth = chart.plotWidth;
                    const plotHeight = chart.plotHeight;

                    let x = point.plotX + plotLeft;
                    let y = point.plotY + plotTop;

                    // Adjust position to avoid center overlap
                    if (x < plotWidth / 2) {
                        x = Math.max(plotLeft, x - labelWidth - 10);
                    } else {
                        x = Math.min(plotLeft + plotWidth - labelWidth, x + 10);
                    }

                    if (y < plotHeight / 2) {
                        y = Math.max(plotTop, y - labelHeight - 10);
                    } else {
                        y = Math.min(plotTop + plotHeight - labelHeight, y + 10);
                    }

                    return { x, y };
                },
                style: {
                    zIndex: 20
                }
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    size: isExpanded ? '80%' : '60%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y} Bills',
                        distance: 30,
                        filter: {
                            property: 'percentage',
                            operator: '>',
                            value: 5
                        },
                        style: {
                            fontWeight: 'bold',
                            color: 'black',
                            fontSize: isExpanded ? "16px" : '14px',
                            textOutline: 'none'
                        },
                        connectorWidth: 1,
                        connectorColor: 'black',
                        allowOverlap: false,
                        wrap: true,
                        width: 80
                    },
                    showInLegend: true,
                    center: ['50%', '50%']
                }
            },
            series: [{
                name: 'Bills',
                colorByPoint: true,
                data: [
                    {
                        name: 'Pending',
                        y: pieChartDataCount.BillApprovalPending ?? 0,
                        color: '#005EB5'
                    },
                    {
                        name: 'Approved',
                        y: pieChartDataCount.BillApproved ?? 0,
                        color: '#53BB77'
                    },
                    {
                        name: 'Rejected',
                        y: pieChartDataCount.BillRejected ?? 0,
                        color: '#CF815F'
                    }
                ],
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (this: Highcharts.Point) {
                            handleChartRedirect(this.name)
                        }
                    }
                },
            }],
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
                itemStyle: {
                    fontWeight: 'normal'
                },
                symbolRadius: 0,
                symbolWidth: 10,
                symbolHeight: 10,
                itemDistance: 20
            },
            accessibility: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
        };

    }

    const handleFilterOpen = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsFilterOpen(true)
    }

    const handleFilterClose = () => {
        setIsFilterOpen(false)
    }

    const handleChartTypeChange = (type: string, label: string) => {
        setChartType(type);
        setChartLabel(label)
        setIsStacked(label === 'Stacked Column');
    };

    const onSuccessApply = (newFilterFields: any) => {
        getBillApprovalDashboard(newFilterFields)
    }

    return (
        <div className='h-full w-full overflow-visible'>
            <div className='bg-white h-[70px] border-b border-lightSilver flex justify-between items-center'>
                <div className='laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 flex justify-between w-full chart_header'>
                    <div className="header items-center flex">
                        <Typography type='h5' className='title !text-base hd:!text-lg 2xl:!text-lg 3xl:!text-lg font-proxima font-semibold tracking-[0.02em] text-darkCharcoal'>
                            Bill approval status
                        </Typography>
                    </div>
                    <div className='flex justify-center items-center'>
                        <div className='bar_change cursor-pointer relative'>
                            {/* <ChartChangeIcon /> */}
                            <ChartTypeDropdown onChartSelect={handleChartTypeChange} chartLabel="Column" ChartType="BillApprovalStatus" />
                        </div>
                        <div className='filter_change cursor-pointer ml-[15px] relative' onClick={handleFilterOpen}><ChartFilterIcon />
                            {/* Filter Modal */}
                            <DashboardFilter isFilterOpen={isFilterOpen} locationOption={LocationOption} onClose={handleFilterClose} ChartType="BillApprovalStatus" onSuccessApply={onSuccessApply} />
                        </div>
                        <div className='expand_screen cursor-pointer ml-[15px]'
                            onClick={() => setIsExpandChartOpen(true)}><ChartExpandIcon /></div>
                    </div>
                </div>
            </div>
            <div key={chartType} className='place-content-center md:h-[75vh] laptop:h-[75vh] laptopMd:h-[75vh] lg:h-[75vh] xl:h-[75vh] hd:h-[80vh] 2xl:h-[66vh] overflow-x-auto overflow-y-hidden custom-scroll chartScrollbar'>
                {isLoading
                    ? <div className='h-full w-full flex justify-center'>
                        <Loader size='md'/>
                    </div>
                    : <HighchartsReact highcharts={Highcharts} options={chartType == 'pie' ? getPieChartOptions(false) : getColumnChartOptions()} />}
            </div>

            {isExpandChartOpen && <ExpandModal
                onOpen={isExpandChartOpen}
                onClose={() => setIsExpandChartOpen(false)}
                modalTitle='Bill Approval Status'
                modalContent={
                    <div className={`w-full relative laptopMd:pt-0 lg:pt-0 xl:pt-0 hd:pt-[100px] 2xl:pt-[100px] 3xl:pt-[100px] ${isExpandChartOpen && chartType == 'pie' ? "flex justify-center" : ""}`}>
                        <HighchartsReact highcharts={Highcharts} options={chartType == 'pie' ? getPieChartOptions(true) : getColumnChartOptions()} />
                    </div>
                }
            />}
        </div>
    )
}

export default BillApprovalStatus