import AreaChartIcon from '@/assets/Icons/chart/AreaChartIcon'
import AreaSplineChartIcon from '@/assets/Icons/chart/AreaSplineChartIcon'
import ChartChangeIcon from '@/assets/Icons/chart/ChartChangeIcon'
import ColumnChartIcon from '@/assets/Icons/chart/ColumnChartIcon'
import LineChartIcon from '@/assets/Icons/chart/LineChartIcon'
import SplineChartIcon from '@/assets/Icons/chart/SplineChartIcon'
import StackedColumnChartIcon from '@/assets/Icons/chart/StackedColumnChartIcon'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import { Tooltip } from 'pq-ap-lib'
import React, { useState } from 'react'
import PieChartIcon from '@/assets/Icons/chart/PieChartIcon';

const ChartTypeDropdown: React.FC<any> = ({ onChartSelect, chartLabel, ChartType }) => {
    const [selectedChartLabel, setSelectedChartLabel] = useState<string>(chartLabel);
    const [isChartDropdownOpen, setIsChartDropdownOpen] = useState<boolean>(false)

    const chartTypes = [
        { value: 'column', label: 'Column', icon: <ColumnChartIcon /> },
        { value: 'line', label: 'Line', icon: <LineChartIcon /> },
        { value: 'spline', label: 'Spline', icon: <SplineChartIcon /> },
        { value: 'area', label: 'Area', icon: <AreaChartIcon /> },
        { value: 'areaspline', label: 'Area Spline', icon: <AreaSplineChartIcon /> }
    ];


    if (ChartType !== "PostedBillsByMonth") {
        chartTypes.push(
            { value: 'column', label: 'Stacked Column', icon: <StackedColumnChartIcon /> }
        );
    }

    if (ChartType == "BillApprovalStatus") {
        chartTypes.push(
            { value: 'pie', label: 'Pie', icon: <PieChartIcon /> }
        );
    }

    const handleDropdownToggle = () => {
        setIsChartDropdownOpen(!isChartDropdownOpen)
    }

    return (
        <Dropdown>
            <MenuButton
                className={`!m-0 flex !items-center !rounded-[0.5px] !h-9 !w-9 !border-none  !outline-black !bg-transparent !p-0 `}
                onClick={() => { handleDropdownToggle() }}>
                <ChartChangeIcon />
            </MenuButton>
            <Menu placement="bottom-start" className="!z-[6] !w-[240px] !p-2">
                <div className="grid grid-cols-4 gap-2">
                    {chartTypes.map((type) => (
                        <MenuItem
                            key={type.value + type.label}
                            className={`flex items-center justify-center !outline-black !p-2 ${selectedChartLabel == type.label ? "!bg-whiteSmoke" : ""
                                }`}
                            onClick={() => {
                                onChartSelect(type.value, type.label)
                                setSelectedChartLabel(type.label)
                            }}
                        >
                            <Tooltip position='bottom' content={type.label} className='!m-0 !px-0 !py-1.5 !z-[4]'>
                                <span className='text-sm font-medium text-[#212529]'>{type.icon}</span>
                            </Tooltip>
                        </MenuItem>
                    ))}
                </div>
            </Menu>
        </Dropdown>
    )
}

export default ChartTypeDropdown