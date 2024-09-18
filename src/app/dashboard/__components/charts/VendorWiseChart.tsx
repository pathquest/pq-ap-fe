import ChartChangeIcon from '@/assets/Icons/chart/ChartChangeIcon'
import ChartExpandIcon from '@/assets/Icons/chart/ChartExpandIcon'
import ChartFilterIcon from '@/assets/Icons/chart/ChartFilterIcon'
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official"
import React, { useState } from 'react'
import ExpandModal from '../modal/ExpandModal';

const Chart_topVendors = () => {
    const [stackedOpen, setStackedOpen] = useState(false)
    const bar_Race = {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['Geotech Environ...', 'Agriculture & ...', 'Blue Sky', 'Aloha Plus', 'ABM Parking', 'Acme Pscific Re...', 'Aloha Air Cargo', 'Surveyors Suppl...', 'American Expres...', 'SGS North Ameri...'],
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }

        },
        series: [

            {
                name: '91+',
            },
            {
                name: '61-90',
            },
            {
                name: '31-60',
                data: [5, 3, 4, 7, 2, 5, 1, 2, 6, 2]
            },
            {
                name: '0-30',
                colors: ['#CF815F'],
                data: [5, 3, 4, 7, 2, 5, 1, 2, 6, 2]
            },


        ]
    }

    return (
        <>
            <div className='mx-3 shadow-lg border border-gray-200 rounded '>
                <div className='h-[91px] '>
                    <div className='flex justify-between w-full  chart_header'>
                        <div className=" p-3 header items-center flex">
                            <span className='text-[18px] font-semibold items-center'> Top 10 Vendors
                            </span>
                        </div>
                        <div className='flex justify-center items-center m-4'>
                            <div className='bar_change cursor-pointer'><ChartChangeIcon /></div>
                            <div className='filter_change cursor-pointer ml-4'><ChartFilterIcon /></div>
                            <div className='expand_screen cursor-pointer ml-4 mr-2'
                                onClick={() => {
                                    setStackedOpen(true)
                                }
                                }
                            ><ChartExpandIcon /></div>
                        </div>
                    </div>
                </div>
                <div className='main_chart w-full'>
                    <HighchartsReact highcharts={Highcharts} options={bar_Race} />
                </div>
            </div>

            <ExpandModal
                onOpen={stackedOpen}
                onClose={() => setStackedOpen(false)}
                modalTitle='Top 10 Vendors'
                modalContent={
                    <>
                        <div className='w-full relative top-[100px] min-h-[100vh] '>
                            <HighchartsReact highcharts={Highcharts} options={bar_Race} />
                        </div>
                    </>
                }
            />
        </>
    )
}

export default Chart_topVendors