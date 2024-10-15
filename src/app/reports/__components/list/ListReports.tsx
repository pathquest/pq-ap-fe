'use client'

import Wrapper from '@/components/Common/Wrapper'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import React, { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { NavigationTabs } from '../NavigationTabs'
import ApLedger from '../content/ApLedger'
import BillAnalysis from '../content/BillAnalysis'
import BillPayment from '../content/BillPayment'
import UnpaidBills from '../content/UnpaidBills'
import VendorBalanceDetail from '../content/VendorBalanceDetail'
import VendorBalanceSummary from '../content/VendorBalanceSummary'
import Download from '@/components/Common/Custom/Download'
import { vendorDropdownList } from '@/store/features/vendor/vendorSlice'
import { Toast } from 'pq-ap-lib'
import { locationListDropdown } from '@/store/features/master/dimensionSlice'
import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getLocationList, termDropdown, vendorDropdown } from '@/store/features/bills/billSlice'
import { useSession } from 'next-auth/react'
import { getModulePermissions } from '@/components/Common/Functions/ProcessPermission'
import { useRouter } from 'next/navigation'

const ListReports = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const CompanyId = Number(session?.user?.CompanyId)
  const AccountingTool = session?.user?.AccountingTool

  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isReportPermission = getModulePermissions(processPermissionsMatrix, "Reports") ?? {}

  const isAPLedgerView = isReportPermission["AP Ledger"]?.View ?? false;
  const isBillAnalysisView = isReportPermission["Bill Analysis"]?.View ?? false;
  const isBillPaymentsView = isReportPermission["Bill Payments"]?.View ?? false;
  const isUnpaidBillsView = isReportPermission["Unpaid Bills"]?.View ?? false;
  const isVendorAgingDetailedView = isReportPermission["Vendor Aging Detailed"]?.View ?? false;
  const isVendorAgingSummaryView = isReportPermission["Vendor Aging Summary"]?.View ?? false;

  const isAPLedgerImport = isReportPermission["AP Ledger"]?.Import ?? false;
  const isBillAnalysisImport = isReportPermission["Bill Analysis"]?.Import ?? false;
  const isBillPaymentsImport = isReportPermission["Bill Payments"]?.Import ?? false;
  const isUnpaidBillsImport = isReportPermission["Unpaid Bills"]?.Import ?? false;
  const isVendorAgingDetailedImport = isReportPermission["Vendor Aging Detailed"]?.Import ?? false;
  const isVendorAgingSummaryImport = isReportPermission["Vendor Aging Summary"]?.Import ?? false;

  const dropdownExportRef = useRef<HTMLDivElement>(null)
  const API_REPORTS = process.env.API_REPORTS

  const [visibleTab, setVisibleTab] = useState<number>(4)
  const [isOpenExport, setOpenExport] = useState<boolean>(false)
  const [reportsTabs, setReportsTabs] = useState<string>('APLedger')
  const isMobile = useMediaQuery({ query: '(max-width: 426px)' })
  const [vendorDetailedModalOpen, setVendorDetailedModalOpen] = useState(false)
  const [apLedgerParams, setAPLedgerParams] = useState<any>([])
  const [vendorBalanceDetailsParams, setVendorBalanceDetailsParams] = useState<any>([])
  const [vendorBalanceSummaryParams, setVendorBalanceSummaryParams] = useState<any>([])
  const [billAnalysisParams, setBillAnalysisParams] = useState<any>([])
  const [unpaidBillsParams, setUnpaidBillsParams] = useState<any>([])
  const [billPaymentParams, setBillPaymentParams] = useState<any>([])
  const [downloadUrl, setDownloadUrl] = useState<string>('')
  const [downloadParams, setDownloadParams] = useState<any>([])
  const [vendorOption, setVendorOption] = useState<any[]>([])
  const [locationOption, setLocationOption] = useState<any[]>([])
  const [termOption, setTermOption] = useState<any[]>([])
  const [isDetailsView, setIsDetailsView] = useState<boolean>(false)

  useEffect(() => {
    if (!isAPLedgerView && !isBillAnalysisView && !isBillPaymentsView && !isUnpaidBillsView && !isVendorAgingDetailedView && !isVendorAgingSummaryView) {
      router.push('/manage/companies');
    }
  }, [isAPLedgerView, isBillAnalysisView, isBillPaymentsView, isUnpaidBillsView, isVendorAgingDetailedView, isVendorAgingSummaryView]);

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownExportRef.current && !dropdownExportRef.current.contains(event.target as Node)) {
      setOpenExport(false)
    }
  }

  useEffect(() => {
    if (isOpenExport) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenExport])

  useEffect(() => {
    if (isMobile) {
      setVisibleTab(1)
    }
  }, [isMobile])

  const getDownloadPayload = (activeTab: string) => {
    switch (reportsTabs) {
      case 'APLedger':
        return { url: '/reports/getvendorbaldetail', params: { ...apLedgerParams, IsDownload: true, ExportType: 1 } }
      case 'VendorAgingDetailed':
        return {
          url: '/reports/getvendoraginggroupby',
          params: { ...vendorBalanceDetailsParams, IsDownload: true, ExportType: 1 },
        }
      case 'VendorAgingSummary':
        return {
          url: '/reports/getvendoragingsummary',
          params: { ...vendorBalanceSummaryParams, IsDownload: true, ExportType: 1 },
        }
      case 'BillAnalysis':
        return {
          url: isDetailsView ? '/reports/getbillanalysisdetail' : '/reports/getbillanalysissum',
          params: { ...billAnalysisParams, IsDownload: true, ExportType: 1 },
        }
      case 'UnpaidBills':
        return { url: '/reports/getunpaidbill', params: { ...unpaidBillsParams, IsDownload: true, ExportType: 1 } }
      case 'BillPayments':
        return { url: '/reports/getbillPayments', params: { ...billPaymentParams, IsDownload: true, ExportType: 1 } }
      default:
        return { url: '', params: {} }
    }
  }

  const getDateFile: any = (activeTab: string) => {
    switch (reportsTabs) {
      case 'APLedger':
        return { params: { Date: apLedgerParams.EndDate } }
      case 'VendorAgingDetailed':
        return { params: { Date: vendorBalanceDetailsParams.EndDate } }
      case 'VendorAgingSummary':
        return { params: { Date: vendorBalanceSummaryParams.EndDate } }
      case 'BillAnalysis':
        return { params: { Date: billAnalysisParams.EndDate } }
      case 'UnpaidBills':
        return { params: { Date: unpaidBillsParams.EndDate } }
      case 'BillPayments':
        return { params: { Date: billPaymentParams.EndDate } }
      default:
        return { params: {} }
    }
  }

  //Vendor Dropdown List API
  const getAllVendorOptions = () => {
    const params = {
      CompanyId: CompanyId,
      isActive: true,
    }
    performApiAction(dispatch, vendorDropdown, params, (responseData: any) => {
      setVendorOption(responseData)
    })
  }

  //Location Dropdown List API
  const getLocationDropdownList = async () => {
    const params: any = {
      CompanyId: CompanyId,
      IsActive: true,
    }
    performApiAction(dispatch, getLocationList, params, (responseData: any) => {
      setLocationOption(responseData)
    })
  }

  //Term Dropdown List API
  const getTermDropdownList = async () => {
    const params: any = {
      CompanyId: CompanyId,
      IsActive: true,
    }
    performApiAction(dispatch, termDropdown, params, (responseData: any) => {
      const newTermOptions = responseData?.map((item: any) => {
        return {
          label: item.Name,
          value: item.Id,
        }
      })
      setTermOption(newTermOptions)
    })
  }

  useEffect(() => {
    getAllVendorOptions()
    getLocationDropdownList()
    if (reportsTabs == 'BillAnalysis') {
      getTermDropdownList()
    }
  }, [CompanyId, reportsTabs])

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);

    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month}${day}${year}`;
  };

  return (
    <Wrapper>
      <div className='sticky top-0 z-[5] flex h-[50px] items-center justify-between bg-whiteSmoke'>
        <NavigationTabs
          visibleTab={visibleTab}
          key={AccountingTool}
          getValue={(reportCode: any) => {
            setReportsTabs(reportCode)
          }}
        />
        {!vendorDetailedModalOpen && (
          <span className='mr-5 flex justify-center items-center'>
            <Download
              url={`${API_REPORTS}${getDownloadPayload(reportsTabs)?.url}`}
              params={getDownloadPayload(reportsTabs)?.params}
              fileName={`${reportsTabs}_${formatDate(getDateFile(reportsTabs)?.params.Date)}`}
            />
          </span>
        )}
      </div>

      {/* Navbar */}
      {reportsTabs == 'APLedger' && (
        <ApLedger
          vendorOptions={vendorOption}
          locationOptions={locationOption}
          setAPLedgerParams={(params: any) => setAPLedgerParams(params)}
        />
      )}
      {reportsTabs == 'VendorAgingDetailed' && (
        <VendorBalanceDetail
          vendorOptions={vendorOption}
          locationOptions={locationOption}
          setVendorBalanceDetailsParams={(params: any) => setVendorBalanceDetailsParams(params)}
        />
      )}
      {reportsTabs == 'VendorAgingSummary' && (
        <VendorBalanceSummary
          getVendorDetailedModalOpen={(value: boolean) => setVendorDetailedModalOpen(value)}
          vendorOptions={vendorOption}
          locationOptions={locationOption}
          setVendorBalanceSummaryParams={(params: any) => setVendorBalanceSummaryParams(params)}
        />
      )}
      {reportsTabs == 'BillAnalysis' && (
        <BillAnalysis
          termOptions={termOption}
          vendorOptions={vendorOption}
          locationOptions={locationOption}
          setDetailsView={(value: boolean) => setIsDetailsView(value)}
          setBillAnalysisParams={(params: any) => setBillAnalysisParams(params)}
        />
      )}
      {reportsTabs == 'UnpaidBills' && (
        <UnpaidBills
          vendorOptions={vendorOption}
          locationOptions={locationOption}
          setUnpaidBillsParams={(params: any) => setUnpaidBillsParams(params)}
        />
      )}
      {reportsTabs == 'BillPayments' && (
        <BillPayment
          vendorOptions={vendorOption}
          locationOptions={locationOption}
          setBillPaymentParams={(params: any) => setBillPaymentParams(params)}
        />
      )}
    </Wrapper>
  )
}

export default ListReports
