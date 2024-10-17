import ChartExpandIcon from '@/assets/Icons/chart/ChartExpandIcon';
import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon';
import { utcFormatDate } from '@/components/Common/Functions/FormatDate';
import { performApiAction } from '@/components/Common/Functions/PerformApiAction';
import { useAppDispatch, useAppSelector } from '@/store/configureStore';
import { getPayAfterDueDateVsPaidBeforeDueDateByMonth } from '@/store/features/dashboard/dashboardSlice';
import { setFilterFields } from '@/store/features/paymentstatus/paymentStatusSlice';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader, Typography } from 'pq-ap-lib';
import React, { useEffect, useState } from 'react';
import ChartTypeDropdown from '../modal/ChartType';
import DashboardFilter from '../modal/DashboardFilter';
import ExpandModal from '../modal/ExpandModal';

const PaidAfterVsPaidBeforeDueDate: React.FC<any> = ({ LocationOption }) => {
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const filterFields = useAppSelector((state: any) => state.dashboard.filterFields["PaymentApprovedVsPaidBeforeDueDate"]);

  const [isExpandChartOpen, setIsExpandChartOpen] = useState<boolean>(false)
  const [chartData, setChartData] = useState<any>([])
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [chartType, setChartType] = useState<string>('spline');
  const [isStacked, setIsStacked] = useState<boolean>(false);
  const [isMonthWise, setIsMonthWise] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getPaymentApprovedDashboard = (newFilterFields: any) => {
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
    performApiAction(dispatch, getPayAfterDueDateVsPaidBeforeDueDateByMonth, params, (responseData: any) => {
      setChartData(responseData)
      setIsLoading(false)
    }, () => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (CompanyId) {
      getPaymentApprovedDashboard(filterFields)
    }
  }, [CompanyId])

  const getChartOptions = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let categories = [];
    let paymentApproved = [];
    let paidBeforeDueDate = [];

    if (filterFields?.StartDate && filterFields?.EndDate) {
      const startDate = new Date(filterFields.StartDate);
      const endDate = new Date(filterFields.EndDate);

      if (isMonthWise) {
        // Group data by month
        const monthData: any = {};
        chartData.forEach((item: any) => {
          const key = `${item.Year}-${item.Month}`;
          if (!monthData[key]) {
            monthData[key] = { PaidAfterDueDateCount: 0, PaidBeforeDueDateCount: 0 };
          }
          monthData[key].PaidAfterDueDateCount += item.PaidAfterDueDateCount;
          monthData[key].PaidBeforeDueDateCount += item.PaidBeforeDueDateCount;
        });

        const sortedKeys = Object.keys(monthData).sort();
        sortedKeys.forEach(key => {
          const [year, month] = key.split('-');
          if (monthData[key].PaidAfterDueDateCount > 0 || monthData[key].PaidBeforeDueDateCount > 0) {
            categories.push(`${monthNames[parseInt(month) - 1]} ${year}`);
            paymentApproved.push(monthData[key].PaidAfterDueDateCount);
            paidBeforeDueDate.push(monthData[key].PaidBeforeDueDateCount);
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

          const matchingData = chartData.find((item: any) => (
            item.Year == year &&
            item.Month == (month + 1) &&
            item.Day == day
          ));

          paymentApproved.push(matchingData ? matchingData.PaidAfterDueDateCount : 0);
          paidBeforeDueDate.push(matchingData ? matchingData.PaidBeforeDueDateCount : 0);

          // Increment the date by one day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    } else {
      const year = chartData.length > 0 ? chartData[0].Year : new Date().getFullYear().toString();
      categories = monthNames.map(month => `${month} ${year.substring(2)}`);
      paymentApproved = Array(12).fill(0);
      paidBeforeDueDate = Array(12).fill(0);

      chartData.forEach((item: any) => {
        const monthIndex = parseInt(item.Month, 10) - 1;
        paymentApproved[monthIndex] = item.PaidAfterDueDateCount;
        paidBeforeDueDate[monthIndex] = item.PaidBeforeDueDateCount;
      });
    }

    return {
      chart: {
        type: chartType,
        spacingTop: 10,
      },
      title: {
        text: null,
      },
      tooltip: {
        shared: true
      },
      colors: ['#00FFFF', '#FF69B4'],
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
                if (this.series.name === 'Paid Before Due Date') {
                  router.push('/payments/status');
                  dispatch(setFilterFields({
                    LocationIds: [],
                    VendorIds: [],
                    PaymentMethod: [],
                    StartDate: filterFields.StartDate,
                    EndDate: filterFields.EndDate
                  }))
                } else if (this.series.name === 'Payment Approved') {
                  // router.push(`/approvals?approvalId=2`);
                }
              }
            }
          },
        }
      },
      xAxis: {
        categories: categories,
        crosshair: true,
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
          name: 'Payment Approved',
          data: paymentApproved
        },
        {
          name: 'Paid Before Due Date',
          data: paidBeforeDueDate
        }
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
        itemDistance: 20
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

  const handleChartTypeChange = (newType: string, newLabel: string) => {
    setChartType(newType);
    setIsStacked(newLabel === 'Stacked Column');
  };

  const onSuccessApply = (newFilterFields: any) => {
    getPaymentApprovedDashboard(newFilterFields)
  }

  return (
    <div className='shadow-md border border-lightSilver rounded'>
      <div className='h-[91px]'>
        <div className='laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5 flex justify-between border-lightSilver w-full border-b-2 chart_header'>
          <div className="header items-center flex">
            <Typography type='h5' className='title !text-base hd:!text-lg 2xl:!text-lg 3xl:!text-lg font-proxima font-semibold tracking-[0.02em] text-darkCharcoal'>
              Paid After VS Paid Before Due Date
            </Typography>
          </div>
          <div className='flex justify-center items-center'>
            <div className='bar_change cursor-pointer relative'>
              {/* <ChartChangeIcon /> */}
              <ChartTypeDropdown onChartSelect={handleChartTypeChange} chartLabel="Column" ChartType="PostedBillsByMonth" />
            </div>
            <div className='filter_change cursor-pointer ml-[15px] relative' onClick={handleFilterOpen}><ChartFilterIcon />
              {/* Filter Modal */}
              <DashboardFilter isFilterOpen={isFilterOpen} locationOption={LocationOption} onClose={handleFilterClose} ChartType="PaymentApprovedVsPaidBeforeDueDate" onSuccessApply={onSuccessApply} />
            </div>
            <div className='expand_screen cursor-pointer ml-[15px]'
              onClick={() => setIsExpandChartOpen(true)}><ChartExpandIcon /></div>
          </div>
        </div>
      </div>
      <div className='main_chart w-full'>
        {isLoading
          ? <div className='h-[400px] w-full flex justify-center'>
            <Loader size='md' />
          </div>
          : <HighchartsReact highcharts={Highcharts} options={getChartOptions()} />}
      </div>
      <ExpandModal
        onOpen={isExpandChartOpen}
        onClose={() => setIsExpandChartOpen(false)}
        modalTitle='Payment Approved vs. Paid Before Due Date'
        modalContent={
          <div className='w-full relative laptopMd:pt-0 lg:pt-0 xl:pt-0 hd:pt-[100px] 2xl:pt-[100px] 3xl:pt-[100px]'>
            <HighchartsReact highcharts={Highcharts} options={getChartOptions()} />
          </div>
        }
      />
    </div>
  )
}

export default PaidAfterVsPaidBeforeDueDate