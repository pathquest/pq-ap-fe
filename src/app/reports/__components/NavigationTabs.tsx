import MoreIcon from '@/assets/Icons/reports/MoreIcon'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getHeaderList, setSelectedIndex } from '@/store/features/reports/reportsSlice'
import { Typography } from 'pq-ap-lib'
import React, { useEffect, useRef, useState } from 'react'
import ReportStar from './icons/ReportStar'

interface NavigationBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  disabled?: boolean
  getValue: (arg: string) => void
  visibleTab: number
  variant?: string
  direction?: 'row' | 'row-reverse'
}

const NavigationTabs: React.FC<NavigationBarProps> = ({ className, getValue, variant, direction = 'row' }) => {
  const dispatch = useAppDispatch()
  const { selectedIndex } = useAppSelector((state) => state.reports)

  const selectRef = useRef<HTMLDivElement>(null)
  const parentDivRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [tabs, setTabs] = useState<any>([])
  const [currentTab, setCurrentTab] = useState<string>('')
  const [isfavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)

  const visibleTabs = 4

  useEffect(() => {
    if (tabs.length > 0) {
      setCurrentTab(tabs[selectedIndex]?.ReportCode)
    }
  }, [tabs])

  function compareIsFavorite(a: any, b: any) {
    return a.IsFavorite === b.IsFavorite ? 0 : a.IsFavorite ? -1 : 1
  }

  const getReportHeaderList = () => {
    setLoading(true)
    performApiAction(dispatch, getHeaderList, null, (responseData: any) => {
      const sortedTabs = responseData.ReportsHeader.sort(compareIsFavorite)
      setCurrentTab(responseData.ReportsHeader[0].ReportCode)
      setTabs(sortedTabs)
      setLoading(false)
    })
  }

  useEffect(() => {
    getReportHeaderList()
  }, [])

  useEffect(() => {
    getValue(currentTab + '')
  }, [currentTab])

  useEffect(() => {
    getReportHeaderList()
  }, [isfavorite])

  const handleTabClick = (ReportCode: string, index: number) => {
    setIsOpen(false)
    // Check if the clicked tab is already visible, then return

    setCurrentTab(ReportCode)
    if (tabs.slice(0, 3).some((tab: any) => tab?.ReportCode === ReportCode)) {
      dispatch(setSelectedIndex(index))
    } else {
      const updatedtabs = [...tabs]
      const temp = updatedtabs[3]
      const tabIndex = updatedtabs.findIndex((tab: any) => tab?.ReportCode === ReportCode)
      const tabToAdd = updatedtabs.find((tab: any) => tab?.ReportCode === ReportCode)
      updatedtabs[3] = tabToAdd
      updatedtabs[tabIndex] = temp
      dispatch(setSelectedIndex(3))
      setTabs(updatedtabs)
    }
  }

  const handleToggleOpen = () => {
    setIsOpen(!isOpen)
    setIsFavorite(false)
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFavorite(false)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  function calculateBorderClass(index: number, tabsLength: number, direction: string): string {
    return index > tabsLength - (direction === 'row-reverse' ? 5 : 2) ? 'border-none' : 'border-r-lightSilver'
  }

  const tabLabel = (index: number, label: any) => {
    return (
      <Typography
        className={`uppercase tracking-[0.02em] whitespace-nowrap border-r ${calculateBorderClass(index, tabs.length, direction)} cursor-pointer px-5 ${
          selectedIndex === index ? 'text-base font-semibold text-primary' : 'text-sm font-medium text-slatyGrey'
        }`}
        type='h6'
      >
        {label}
      </Typography>
    )
  }

  return (
    <>
      <div className={`${className} relative flex items-center py-[10px]`} ref={parentDivRef}>
        {tabs.map((tab: any, index: number) => {
          if (index < visibleTabs) {
            return (
              <div className=' ' onClick={() => handleTabClick(tab.ReportCode, index)} key={tab.ReportCode}>
                {variant === 'modal' ? (
                  <a href={`#${tab.ReportCode}`}>{tabLabel(index, tab.ReportName)}</a>
                ) : (
                  tabLabel(index, tab?.ReportName)
                )}
              </div>
            )
          }
          return null
        })}
        {tabs.length > 4 && (
          <div ref={selectRef} className='cursor-pointer '>
            <div onClick={handleToggleOpen} className='flex h-6 w-12  items-center justify-center'>
              <MoreIcon />
            </div>
            <div>
              <ul
                className={`custom-scroll-PDF absolute z-[1] overflow-y-auto rounded-md bg-pureWhite shadow-md transition-transform max-[694px]:right-0 max-[694px]:w-full min-[695px]:w-[294px] ${
                  isOpen
                    ? 'top-12 max-h-[320px] translate-y-0 opacity-100 transition-opacity duration-500 ease-out'
                    : 'max-h-0 translate-y-10 opacity-0 transition-opacity duration-500'
                }`}
              >
                {tabs.map((tab: any, index: number) => (
                  <div
                    className='flex cursor-pointer justify-between py-[10px] px-5 text-base font-normal hover:bg-whiteSmoke'
                    key={tab.ReportCode}
                  >
                    <li
                      key={tab?.ReportCode}
                      onClick={() => {
                        handleTabClick(tab.ReportCode, index)
                      }}
                      className=''
                    >
                      {variant === 'modal' ? (
                        <a href={`#${tab.ReportCode}`}>
                          <Typography type='h6' className='cursor-pointe'>
                            {tab?.ReportName}
                          </Typography>
                        </a>
                      ) : (
                        <Typography type='h6' className='cursor-pointer whitespace-nowrap'>
                          {tab?.ReportName}
                        </Typography>
                      )}
                    </li>
                    <ReportStar
                      isLoading={loading}
                      data={tab}
                      isStarClick={(value: any) => {
                        getReportHeaderList()
                        setIsFavorite(value)
                      }}
                      arrayData={tabs}
                    />
                  </div>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export { NavigationTabs }
