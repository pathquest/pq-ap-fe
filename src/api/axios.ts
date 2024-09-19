import { BillDetailsProps, getPaymentMethodsProps } from '@/models/billsToPay'

import { auth } from '@/auth'
import {
  BillAnalysisProps,
  GetBillAnalysisColumnMappingOptions,
  SaveBillAnalysisColumnMappingOptions,
} from '@/models/BillAnalysis'
import {
  ActivityListOptions,
  ActivityNotificationOptions,
  ActivityWatcherListOptions,
  SaveActivityListOptions,
  SaveWatcherListOptions,
  UpdateResloved,
} from '@/models/activity'
import {
  ApAgingDetailsProps,
  GetApAgingDetailsColumnMappingOptions,
  SaveApAgingDetailsColumnMappingOptions,
} from '@/models/apAgingDetails'
import { ApAgingSummaryProps } from '@/models/apAgingSummary'
import { ApAgingSummaryDrawerProps } from '@/models/apAgingSummaryDrawer'
import {
  ApTermDropdownOptions,
  ApTermGetListOptions,
  SaveTermOptions,
  TermByIdOptions,
  UpdateTermStatusOptions,
} from '@/models/aptermMaster'
import {
  ForgotPasswordOptions,
  GenerateOtpOptions,
  ReauthenticationProps,
  SetPasswordOptions,
  SignInOptions,
  SignUpOptions,
  SocialSignInOptions,
  ValidateOtpOptions,
} from '@/models/auth'
import { AutomationGetRuleListOptions, RuleActiveInactiveOptions, RuleByIdOptions, SaveRuleOptions } from '@/models/automation'
import {
  BillApprovals,
  GetBillApprovalLists,
  GetPaymentApprovalLists,
  PaymentApprovals,
  PaymentReAssigns,
  ReAssigns,
  Vendordropdown,
} from '@/models/billApproval'
import {
  AssignDocumentToUserOptionsProps,
  AssigneeOptionsProps,
  DeleteDocumentOptionsProps,
  DeleteDocumentOverviewOptionsProps,
  DocumentGetListOptions,
  DocumentGetOverviewListOptions,
  GetColumnMappingListOptionsProps,
  GetDocumentByIdOptionsProps,
  MergeDocumentOptionsProps,
  RemoveDocumentOptionsProps,
  SplitDocumentOptions,
  UserListOptionsProps,
  VendorListOptions,
} from '@/models/billPosting'
import {
  BillDetailsPayload,
  MarkaspaidProps,
  MoveBillToPayProps,
  PaymentColumnMappingProps,
  PaymentGetListProps,
  PaymentPayload,
  SaveColumnMappingProps,
  VendorAgingDaysDrpdwn,
  VendorAgingListProps,
  VendorCreditListProps,
} from '@/models/billsToPay'
import { GetFieldMappingOptionsProps } from '@/models/common'
import {
  AssignUserCompany,
  CompanyDataById,
  CompanyGetListOptions,
  CompanyIdDropDown,
  ConncetSageCompany,
  ConncetSageUser,
  PerformActions,
  QbConncet,
  ReconncetSageCompany,
  SaveCompany,
  XeroConncet,
} from '@/models/company'
import { CurrencyDropdownOptions, CurrencyGetListOptions } from '@/models/currencyMaster'
import {
  ClassByIdOptions,
  ClassGetListOptions,
  DepartmentByIdOptions,
  DepartmentGetListOptions,
  DimensionRemoveOptions,
  LocationByIdOptions,
  LocationGetDropdownListOptions,
  LocationGetListOptions,
  LocationListDropdownOptions,
  ProjectByIdOptions,
  ProjectGetListOptions,
  SaveClassOptions,
  SaveDepartmentOptions,
  SaveLocationOptions,
  SaveProjectOptions,
  UpdateMasterProps,
} from '@/models/dimensionMaster'
import { FavoriteStarOption } from '@/models/favoriteStar'
import { GetFieldMappings, SaveFieldMappings } from '@/models/fieldMapping'
import { HandleHistoryDocumentRetryProps, HistoryGetListProps, LinkBillToExistingBillProps } from '@/models/files'
import { ProfileFormFieldsProps } from '@/models/formFields'
import {
  GLAccountByIdOptions,
  GLAccountDropdownOptions,
  GLAccountGetListOptions,
  SaveGLAccountOptions,
  UpdateGLAccountStatusOptions,
} from '@/models/glAccountMaster'
import { GetSearchHistoryOptions, SaveSearchHistoryOptions, SearchResultOptions } from '@/models/global'
import { GetEmailTemplate, ReadDeleteAllNotificationProps, SaveNotificationMatrix, SaveSummaryData, UpdateSummaryStatus } from '@/models/notification'
import { ApproveRejectCheckOptions, DeactivateBankAccountOptions, GetAllBankAccountOptions, SaveBuyerBankOption, SaveCheckMicroDepositOptions, SavePaymentMethodOptions, UpdateBuyerBankOptions, UpdatePaymentMethodOptions } from '@/models/paymentSetup'
import { GetPaymentStatusColumnMappingOptions, PaymentStatusListOptions, SavePaymentStatusColumnMappingOptions, SetCancelPaymentOptions } from '@/models/paymentStatus'
import { GLAccountOptions, ProductServiceGetListOptions } from '@/models/product&ServiceMaster'
import {
  PermissionListOptions,
  RoleGetIdOptions,
  RoleGetListOptions,
  RoleListOptions,
  RoleRemoveOptions,
  SavePermissionOptions,
  SaveRoleOptions,
} from '@/models/role'
import { GetUnpaidBillsColumnMappingOptions, SaveUnpaidBillsColumnMappingOptions, UnpainBillsProps } from '@/models/unpaidBills'
import {
  AssignCompanyToUser,
  CityListOptions,
  GetUserImage,
  SaveManageRight,
  StateListOptions,
  TimezoneListOptions,
  UploadUserImage,
  UserDataOptions,
  UserDelete,
  UserGetCompanyDropdown,
  UserGetListOptions,
  UserGetManageRights,
  UserSaveDataOptions,
  UserUpdateStatusOptions,
} from '@/models/user'
import {
  SaveVendorOptions,
  VendorDropdownListOptions,
  VendorGetByIdOptions,
  VendorGetDropdownListOptions,
  VendorGetListOptions,
  VendorUpdateStatusOptions,
} from '@/models/vendor'
import { VendorAgingGroupByProps } from '@/models/vendorAgingGroupBy'
import { VendorAgingSummaryProps } from '@/models/vendorAgingSummary'
import { GetVendorBalanceDetailColumnMappingOptions, VendorBalanceDetailProps } from '@/models/vendorBalanceDetail'
import { VendorBalanceSummaryProps } from '@/models/vendorBalanceSummary'
import axios, { AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { dashboardOptions, InsightsOptions, vendorWiseMonthlyPaymentOptions } from '@/models/dashboard'
import { ssoUrl } from './server/common'

const API_SSO = process.env.API_SSO
const API_PROFILE = process.env.API_PROFILE
const API_MANAGE = process.env.API_MANAGE
const API_MASTER = process.env.API_MASTER
const API_FILEUPLOAD = process.env.API_FILEUPLOAD
const API_BILLS = process.env.API_BILLS
const API_BILLSTOPAY = process.env.API_BILLSTOPAY
const API_ACTIVTY = process.env.API_ACTIVITY
const API_NOTIFICATION = process.env.API_NOTIFICATION
const API_GLOBAL = process.env.API_GLOBAL
const API_REPORTS = process.env.API_REPORTS
const API_DASHBOARD = process.env.API_DASHBOARD

const API_CLOUD = process.env.API_CLOUD
const API_REALTIMENOTIFICATION = process.env.REALTIME_NOTIFICATION

const responseBody = (response: AxiosResponse) => response.data
let cachedSession = null;
let sessionPromise: any = null;

const fetchSession = async () => {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      try {
        if (typeof getSession === 'function') {
          cachedSession = await getSession();
        } else {
          cachedSession = await auth();
        }
        return cachedSession;
      } finally {
        sessionPromise = null;
      }
    })();
  }
  return sessionPromise;
};

export const invalidateSessionCache = () => {
  cachedSession = null;
};

axios.interceptors.request.use(
  async (config) => {
    const session = await fetchSession();

    if (session && 'user' in session) {
      config.headers.Authorization = `bearer ${session.user.access_token}`;
      config.headers.CompanyId = session.user.CompanyId;
    }
    return config;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // window.location.href = '/signin';
      return Promise.reject('Unauthorized');
    }
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status === 401) {
      cachedSession = null; // Clear cached session on 401 error

      let session: any;

      if (typeof getSession === 'function') {
        session = await getSession();
      } else {
        session = await auth();
      }

      // if (!session) {
      //   return redirect(`${ssoUrl}/signin`);
      // }

      cachedSession = session; // Cache the new session

      // Retry the request with the new session
      return axios(error.config);
    }

    return Promise.reject(error);
  }
);

const requests = {
  get: (url: string, params?: URLSearchParams) => axios.get(url, { params }).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  postForm: (url: string, data: FormData) =>
    axios
      .post(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
  putForm: (url: string, data: FormData) =>
    axios
      .put(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
}

const Dashboard = {
  getSummary: (data: dashboardOptions) => requests.post(`${API_DASHBOARD}/dashboard/summary`, data),
  getInsights: (data: InsightsOptions) => requests.post(`${API_DASHBOARD}/dashboard/getinsights`, data),
  getVendorWiseMonthlyPayment: (data: vendorWiseMonthlyPaymentOptions) => requests.post(`${API_DASHBOARD}/dashboard/getallvendor`, data),
  getBillApprovalStatus: (data: dashboardOptions) => requests.post(`${API_DASHBOARD}/dashboard/billapproval`, data),
  getPostedBillsByMonth: (data: dashboardOptions) => requests.post(`${API_DASHBOARD}/dashboard/getpostedbillsbymonth`, data),
  getProcessedVsPaymentNotApproved: (data: dashboardOptions) => requests.post(`${API_DASHBOARD}/dashboard/getprocessvsnotapprovebymonth`, data),
  getPayAfterDueDateVsPaidBeforeDueDateByMonth: (data: dashboardOptions) => requests.post(`${API_DASHBOARD}/dashboard/getpayafterduedatevspaidbeforeduedatebymonth`, data),
  getOnTimeProcessingVsMissedProcessingBills: (data: dashboardOptions) => requests.post(`${API_DASHBOARD}/dashboard/getontimeprocessingvsmisstimeprocessing`, data),
}

const Auth = {
  login: (data: SignInOptions) => requests.post(`${API_SSO}/auth/token`, data),
  register: (data: SignUpOptions) => requests.post(`${API_SSO}/auth/register`, data),
  socialLogin: (data: SocialSignInOptions) => requests.post(`${API_SSO}/auth/social-login`, data),
  forgotPassword: (data: ForgotPasswordOptions) => requests.post(`${API_SSO}/auth/forgotpassword`, data),
  getQboConnectUrl: () => requests.get(`${API_SSO}/auth/getqboconnecturl`),
  generateOtp: (data: GenerateOtpOptions) => requests.post(`${API_SSO}/auth/generateotp`, data),
  validateOtp: (data: ValidateOtpOptions) => requests.post(`${API_SSO}/auth/validateotp`, data),
  setPassword: (data: SetPasswordOptions) => requests.post(`${API_SSO}/auth/setpassword`, data),
  reauthentication: (data: ReauthenticationProps) => requests.post(`${API_SSO}/auth/reauthentication`, data),
}

const Profile = {
  getUserProfile: () => requests.get(`${API_PROFILE}/user/getuserprofile`),
  getCountries: () => requests.get(`${API_PROFILE}/country/list`),
  getStates: (id: number) => requests.get(`${API_PROFILE}/state/list?countryId=${id}`),
  getCities: (id: number) => requests.get(`${API_PROFILE}/city/list?stateId=${id}`),
  getTimeZone: (id: number) => requests.get(`${API_PROFILE}/timezone/list?countryId=${id}`),
  saveUserProfile: (data: ProfileFormFieldsProps) => requests.post(`${API_PROFILE}/user/saveuserprofile`, data),
  getUserConfig: () => requests.get(`${API_MANAGE}/user/getuserconfig`),
  uploadUserImage: (data: UploadUserImage) => requests.post(`${API_PROFILE}/user/upload/image`, data),
  getUserImage: (data: GetUserImage) => requests.get(`${API_PROFILE}/user/getuserimage?fileName=${data.fileName}`),
}

// Manage Company
const Company = {
  companyGetList: (data: CompanyGetListOptions) => requests.post(`${API_MANAGE}/company/getlist`, data),
  saveCompany: (data: SaveCompany) => requests.post(`${API_MANAGE}/company/save`, data),
  companyGetById: (data: CompanyDataById) => requests.get(`${API_MANAGE}/company/getbyid?companyId=${data.Id}`),
  redirectQb: () => requests.get(`${API_MANAGE}/settings/getconfigbyid?configId=3`),
  conncetQb: (data: QbConncet) => requests.post(`${API_MANAGE}/company/connectqbocompany`, data),
  redirectXero: () => requests.get(`${API_MANAGE}/settings/getconfigbyid?configId=4`),
  conncetXero: (data: XeroConncet) => requests.post(`${API_MANAGE}/company/connectxerocompany`, data),
  sageUserConnect: (data: ConncetSageUser) => requests.post(`${API_MANAGE}/company/getclientlist`, data),
  sageCompanyConnect: (data: ConncetSageCompany) => requests.post(`${API_MANAGE}/company/getentitylist`, data),
  sageCompanyReconnect: (data: ReconncetSageCompany) => requests.post(`${API_MANAGE}/company/connectintacctcompany`, data),
  performCompanyActions: (data: PerformActions) => requests.post(`${API_MANAGE}/company/action`, data),
  // country,state and city api we take it from user

  // below api use in manage user
  // Also use in manage company filter api
  companyListDropdown: () => requests.get(`${API_MANAGE}/company/getdropdown`),
  manageCompanyAssignUser: (data: CompanyIdDropDown) => requests.post(`${API_MANAGE}/user/getdropdownbycompany`, data),
  companyAssignUser: (data: CompanyIdDropDown) => requests.post(`${API_MANAGE}/user/GetDropDownForRule`, data),
  filterAccounting: () => requests.get(`${API_MANAGE}/settings/getaccountingtooldropdown`),
  AssignUserToCompany: (data: AssignUserCompany) => requests.post(`${API_MANAGE}/company/assignusertocompany`, data),
  uploadCompanyImage: (data: UploadUserImage) => requests.post(`${API_MANAGE}/company/upload/image`, data),
  getCompanyImage: (data: GetUserImage) => requests.get(`${API_MANAGE}/company/getcompanyimage?fileName=${data.fileName}`),
}

// Manage User
const User = {
  userGetList: (data: UserGetListOptions) => requests.post(`${API_MANAGE}/user/getlist`, data),
  userUpdateStatus: (data: UserUpdateStatusOptions) => requests.post(`${API_MANAGE}/user/updatestatus`, data),
  countryListDropdown: () => requests.get(`${API_PROFILE}/country/list`),
  timezoneListDropdown: (data: TimezoneListOptions) => requests.get(`${API_PROFILE}/timezone/list?countryId=${data.CountryId}`),
  stateListDropdown: (data: StateListOptions) => requests.get(`${API_PROFILE}/state/list?countryId=${data.CountryId}`),
  cityListDropdown: (data: CityListOptions) => requests.get(`${API_PROFILE}/city/list?stateId=${data.StateId}`),
  userGetDataById: (data: UserDataOptions) => requests.get(`${API_MANAGE}/user/getbyid?userId=${data.UserId}`),
  userSaveData: (data: UserSaveDataOptions) => requests.post(`${API_MANAGE}/user/save`, data),
  userGetManageRights: (data: UserGetManageRights) => requests.post(`${API_MANAGE}/role/getusercompanypermissions`, data),
  userListDropdown: () => requests.get(`${API_MANAGE}/user/getdropdown`),
  getAssignUsertoCompany: (data: UserGetCompanyDropdown) => requests.post(`${API_MANAGE}/company/getdropdownbyuser`, data),
  assignCompanyToUser: (data: AssignCompanyToUser) => requests.post(`${API_MANAGE}/user/assigncompanytouser`, data),
  SaveManageRight: (data: SaveManageRight) => requests.post(`${API_MANAGE}/role/saveusercompanypermissions`, data),
  uploadUserImage: (data: UploadUserImage) => requests.post(`${API_PROFILE}/user/upload/image`, data),
  getUserImage: (data: GetUserImage) => requests.get(`${API_PROFILE}/user/getuserimage?fileName=${data.fileName}`),
  deleteUser: (data: UserDelete) => requests.post(`${API_MANAGE}/user/delete`, data),
}

// Manage Roles
const Role = {
  roleListDropdown: (data: RoleListOptions) => requests.post(`${API_MANAGE}/role/getdropdown`, data),
  roleGetList: (data: RoleGetListOptions) => requests.post(`${API_MANAGE}/role/getrolesbycompany`, data),
  permissionGetList: (data: PermissionListOptions) => requests.post(`${API_MANAGE}/role/getrolepermissions`, data),
  roleRemove: (data: RoleRemoveOptions) => requests.post(`${API_MANAGE}/role/deleterole`, data),
  savePermission: (data: SavePermissionOptions) => requests.post(`${API_MANAGE}/role/saverolepermission`, data),
  saveRole: (data: SaveRoleOptions) => requests.post(`${API_MANAGE}/role/createrole`, data),
  roleGetById: (data: RoleGetIdOptions) => requests.post(`${API_MANAGE}/role/getbyid`, data),
}

const FileUpload = {
  userGetList: (data: UserGetListOptions) => requests.post(`${API_MANAGE}/user/getlist`, data),
}

// Master Dimension
const Dimension = {
  syncDimensionMaster: (tab: string) => requests.get(`${API_MASTER}/${tab}/sync`),
  updateDimensionMaster: (data: UpdateMasterProps, tab: string) => requests.post(`${API_MASTER}/${tab}/updatestatus`, data),
  //No Accounting Tool
  importDimensionData: (data: any, tab: string) => requests.postForm(`${API_MASTER}/${tab}/import`, data),

  classGetList: (data: ClassGetListOptions) => requests.post(`${API_MASTER}/class/getlist`, data),
  saveClass: (data: SaveClassOptions) => requests.post(`${API_MASTER}/class/save`, data),
  classGetById: (data: ClassByIdOptions) => requests.post(`${API_MASTER}/class/getbyid`, data),
  classRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/class/delete`, data),

  locationListDropdown: (data: LocationListDropdownOptions) => requests.post(`${API_MASTER}/location/getdropdown`, data),
  locationGetDropdownList: (data: LocationGetDropdownListOptions) =>
    requests.post(`${API_MANAGE}/settings/automation/getlocationdropdown`, data),
  locationGetList: (data: LocationGetListOptions) => requests.post(`${API_MASTER}/location/getlist`, data),
  saveLocation: (data: SaveLocationOptions) => requests.post(`${API_MASTER}/location/save`, data),
  locationGetById: (data: LocationByIdOptions) => requests.post(`${API_MASTER}/location/getbyid`, data),
  locationRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/location/delete`, data),

  departmentGetList: (data: DepartmentGetListOptions) => requests.post(`${API_MASTER}/department/getlist`, data),
  departmentGetById: (data: DepartmentByIdOptions) => requests.post(`${API_MASTER}/department/getbyid`, data),
  saveDepartment: (data: SaveDepartmentOptions) => requests.post(`${API_MASTER}/department/save`, data),
  departmentRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/department/delete`, data),

  projectGetList: (data: ProjectGetListOptions) => requests.post(`${API_MASTER}/project/getlist`, data),
  projectGetById: (data: ProjectByIdOptions) => requests.post(`${API_MASTER}/project/getbyid`, data),
  saveProject: (data: SaveProjectOptions) => requests.post(`${API_MASTER}/project/save`, data),
  projectRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/project/delete`, data),
}

// Master GL Account
const GLAccount = {
  syncGLAccountMaster: () => requests.get(`${API_MASTER}/account/sync`),
  glAccountGetList: (data: GLAccountGetListOptions) => requests.post(`${API_MASTER}/account/getlist`, data),
  GLAccountDropdown: (data: GLAccountDropdownOptions) => requests.post(`${API_MASTER}/account/getdropdown`, data),
  GLAccountDropdownWithType: (data: GLAccountDropdownOptions) => requests.post(`${API_MASTER}/account/getaccountwithtype`, data),

  //No Accounting Tool
  importGLAccountData: (data: any) => requests.postForm(`${API_MASTER}/account/import`, data),
  saveGLAccount: (data: SaveGLAccountOptions) => requests.post(`${API_MASTER}/account/save`, data),
  glAccountGetById: (data: GLAccountByIdOptions) => requests.post(`${API_MASTER}/account/getbyid`, data),
  updateAccountStatus: (data: UpdateGLAccountStatusOptions) => requests.post(`${API_MASTER}/account/updatestatus`, data),
}

// Master Product & Service
const ProductService = {
  syncProductServiceMaster: () => requests.get(`${API_MASTER}/productandservice/sync`),
  productServiceGetList: (data: ProductServiceGetListOptions) => requests.post(`${API_MASTER}/productandservice/getlist`, data),
  glAccountList: (data: GLAccountOptions) => requests.post(`${API_MASTER}/productandservice/getdropdown`, data),
}

// Master Currency
const Currency = {
  syncCurrencyMaster: () => requests.get(`${API_MASTER}/currency/sync`),
  currencyGetList: (data: CurrencyGetListOptions) => requests.post(`${API_MASTER}/currency/getlist`, data),
  currencyDropdown: (data: CurrencyDropdownOptions) => requests.post(`${API_MASTER}/currency/getdropdown`, data),
}

// AP Term Currency
const ApTerm = {
  syncApTermMaster: () => requests.get(`${API_MASTER}/term/sync`),
  aptermGetList: (data: ApTermGetListOptions) => requests.post(`${API_MASTER}/term/getlist`, data),
  aptermDropdown: (data: ApTermDropdownOptions) => requests.post(`${API_MASTER}/term/getdropdown`, data),

  //No Accounting Tool
  importApTermData: (data: any) => requests.postForm(`${API_MASTER}/term/import`, data),
  saveTerm: (data: SaveTermOptions) => requests.post(`${API_MASTER}/term/save`, data),
  termGetById: (data: TermByIdOptions) => requests.post(`${API_MASTER}/term/getbyid`, data),
  updateTermStatus: (data: UpdateTermStatusOptions) => requests.post(`${API_MASTER}/term/updatestatus`, data),
}

// Notification
const Notification = {
  getNotificationMatrix: () => requests.get(`${API_NOTIFICATION}/notification/getmatrix`),
  getEmailTemplate: (data: GetEmailTemplate) => requests.post(`${API_NOTIFICATION}/notification/gettemplate`, data),
  getSlugDropdown: (data: { Id: number }) => requests.post(`${API_NOTIFICATION}/notification/getslugdropdown`, data),
  saveEmailTemplate: (data: GetEmailTemplate) => requests.post(`${API_NOTIFICATION}/notification/savetemplate`, data),
  saveNotificationMatrix: (data: SaveNotificationMatrix) => requests.post(`${API_NOTIFICATION}/notification/savematrix`, data),
  updateSummaryStatus: (data: UpdateSummaryStatus) =>
    requests.post(`${API_NOTIFICATION}/notification/updatesummarytypestatus`, data),
  getSummaryData: () => requests.get(`${API_NOTIFICATION}/notification/getsummarytype`),
  saveSummaryData: (data: SaveSummaryData) => requests.post(`${API_NOTIFICATION}/notification/savesummarytype`, data),
  getNotificationList: () => requests.get(`${API_NOTIFICATION}/notification/getportalnotification`),
  readAllNotifications: (data: ReadDeleteAllNotificationProps) =>
    requests.post(`${API_NOTIFICATION}/notification/markasread`, data),
  deleteAllNotifications: (data: ReadDeleteAllNotificationProps) => requests.post(`${API_NOTIFICATION}/notification/clear`, data),
  resetEmailTemplate: (data: { id: number }) => requests.post(`${API_NOTIFICATION}/notification/resetemailtemplate`, data),
}

// Bill Posting
const Bill = {
  documentGetList: (data: DocumentGetListOptions) => requests.post(`${API_FILEUPLOAD}/document/getlist`, data),
  documentBillsOverviewList: (data: DocumentGetOverviewListOptions) => requests.post(`${API_FILEUPLOAD}/billsoverview/getlist`, data),
  documentGetStatusList: () => requests.get(`${API_FILEUPLOAD}/document/getstatusdropdown`),
  getVendorList: (data: VendorListOptions) => requests.post(`${API_FILEUPLOAD}/vendor/getlist`, data),
  getProcessList: () => requests.get(`${API_MANAGE}/settings/getprocessdropdown`),
  getLocationList: (data: any) => requests.post(`${API_MASTER}/location/getdropdown`, data),
  getUserList: (data: UserListOptionsProps) => requests.post(`${API_MANAGE}/user/getlist`, data),
  removeDocument: (data: RemoveDocumentOptionsProps) => requests.post(`${API_FILEUPLOAD}/document/delete`, data),
  deleteDocument: (data: DeleteDocumentOptionsProps) => requests.post(`${API_FILEUPLOAD}/document/updateStatus`, data),
  deleteOverviewDocument: (data: DeleteDocumentOverviewOptionsProps) => requests.post(`${API_FILEUPLOAD}/accountpayable/delete`, data),
  getAssigneeList: (data: AssigneeOptionsProps) => requests.post(`${API_MANAGE}/user/getdropdownbycompany`, data),
  assignDocumentsToUser: (data: AssignDocumentToUserOptionsProps) =>
    requests.post(`${API_FILEUPLOAD}/document/updateassignuser`, data),
  getfieldmappings: (data: GetFieldMappingOptionsProps) => requests.post(`${API_MANAGE}/settings/getfieldmappings`, data),
  documentDetailById: (data: GetDocumentByIdOptionsProps) => requests.post(`${API_FILEUPLOAD}/document/getdetails`, data),
  mergeDocuments: (data: MergeDocumentOptionsProps) => requests.post(`${API_FILEUPLOAD}/document/mergepdf`, data),
  splitDocuments: (data: SplitDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/splitpdf`, data),
  getocrDocument: () => requests.get(`${API_FILEUPLOAD}/indexing/getocrDocument`),
  accountPayableSave: (data: any) => requests.post(`${API_FILEUPLOAD}/accountpayable/save`, data),
  getColumnMappingList: (data: GetColumnMappingListOptionsProps) =>
    requests.post(`${API_FILEUPLOAD}/document/getcolumnmappinglist`, data),
  getColumnMappingOverviewList: (data: GetColumnMappingListOptionsProps) =>
    requests.post(`${API_FILEUPLOAD}/billsoverview/getcolumnmappinglist `, data),
  getColumnMappingBillsOverview: (data: GetColumnMappingListOptionsProps) =>
    requests.post(`${API_FILEUPLOAD}/document/getColumnMappingBillsOverview`, data),
  saveColumnMappingList: (data: any) => requests.post(`${API_FILEUPLOAD}/document/savecolumnmapping`, data),
  uploadAttachment: (data: any) => requests.postForm(`${API_FILEUPLOAD}/document/uploadattachments`, data),
  processTypeChangeByDocumentId: (data: any) => requests.post(`${API_FILEUPLOAD}/document/updateProcess`, data),
  vendorDropdown: (data: any) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
  termDropdown: (data: VendorListOptions) => requests.post(`${API_MASTER}/term/getdropdown`, data),
  deletelineItem: (data: any) => requests.post(`${API_FILEUPLOAD}/document/deletelineitem`, data),
  getGLAccountDropdown: (data: any) => requests.post(`${API_MASTER}/account/getdropdown`, data),
  getClassDropdown: (data: any) => requests.post(`${API_MASTER}/class/getdropdown`, data),
  getProductServiceDropdown: (data: any) => requests.post(`${API_MASTER}/productandservice/getdropdown`, data),
  getCustomerDropdown: (data: any) => requests.post(`${API_MASTER}/customer/getdropdown`, data),
  getProjectDropdown: (data: any) => requests.post(`${API_MASTER}/project/getdropdown`, data),
  getDepartmentDropdown: (data: any) => requests.post(`${API_MASTER}/department/getdropdown`, data),
  saveOverviewColumnMapping: (data: any) => requests.post(`${API_FILEUPLOAD}/billsoverview/savecolumnmapping`, data),
}

//Field Mapping
const FieldMapping = {
  // Get ProcessType Api From BillPosting
  getFieldMappingData: (data: GetFieldMappings) => requests.post(`${API_MANAGE}/settings/getfieldmappings`, data),
  saveFieldMappingData: (data: SaveFieldMappings) => requests.post(`${API_MANAGE}/settings/savefieldmappings`, data),
  getMappedWithOptions: (data: { ProcessType: number }) => requests.post(`${API_MANAGE}/settings/getacctoolfielddropdown`, data),
}

const BillApproval = {
  getBillApprovalList: (data: GetBillApprovalLists) => requests.post(`${API_BILLS}/billapproval/getlist`, data),
  billsApproval: (data: BillApprovals) => requests.post(`${API_BILLS}/billapproval/set`, data),
  billReAssign: (data: ReAssigns) => requests.post(`${API_BILLS}/billapproval/reassign`, data),
  vendorList: (data: Vendordropdown) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),

  getPaymentApprovalList: (data: GetPaymentApprovalLists) => requests.post(`${API_BILLSTOPAY}/paymentapproval/getlist`, data),
  paymentsApproval: (data: PaymentApprovals) => requests.post(`${API_BILLSTOPAY}/paymentapproval/setapproval`, data),
  paymentReAssign: (data: PaymentReAssigns) => requests.post(`${API_BILLSTOPAY}/paymentapproval/reassign`, data),
}

// Bills-To-Pay
const BillsToPay = {
  getStatusList: () => requests.get(`${API_BILLSTOPAY}/payment/getstatusdropdown`),
  getAgingFilterDropdown: () => requests.get(`${API_BILLSTOPAY}/payment/getagingfilterdropdown`),
  getPaymentMethods: () => requests.get(`${API_BILLSTOPAY}/payment/getpaymentmethoddropdown`),
  getPaymentMethodsbyVendor: (data: getPaymentMethodsProps) =>
    requests.post(`${API_BILLSTOPAY}/payment/paymentmethodbyvendordropdown`, data),
  getLocationDropDownList: (data: any) => requests.post(`${API_MASTER}/location/getdropdown`, data),
  getBankAccountDrpdwnList: () => requests.get(`${API_BILLSTOPAY}/payment/getbankaccountdropdown`),
  paymentGetList: (data: PaymentGetListProps) => requests.post(`${API_BILLSTOPAY}/payment/getlist`, data),
  getPaymentColumnMapping: (data: PaymentColumnMappingProps) =>
    requests.post(`${API_BILLSTOPAY}/payment/getcolumnmappinglist`, data),
  savePaymentColumnMapping: (data: SaveColumnMappingProps) => requests.post(`${API_BILLSTOPAY}/payment/savecolumnmapping`, data),
  markAsPaidBill: (data: MarkaspaidProps) => requests.post(`${API_BILLSTOPAY}/payment/markaspaid`, data),
  getVendorAginglist: (data: VendorAgingListProps) => requests.post(`${API_BILLSTOPAY}/payment/getvendoraginglist`, data),
  getVendorAgingDaysDrpdwn: (data: VendorAgingDaysDrpdwn) =>
    requests.post(`${API_BILLSTOPAY}/payment/getvendoragingdaysdrpdwn`, data),
  getVendorCreditList: (data: VendorCreditListProps) => requests.post(`${API_BILLSTOPAY}/payment/getvendorcredit`, data),
  moveBillToPay: (data: MoveBillToPayProps) => requests.post(`${API_BILLSTOPAY}/payment/onholdaction`, data),
  getautomaticvendorcredit: (data: BillDetailsPayload) =>
    requests.post(`${API_BILLSTOPAY}/payment/getautomaticvendorcredit`, data),
  sendForPay: (data: PaymentPayload) => requests.post(`${API_BILLSTOPAY}/payment/sentforpayment`, data),
  BillDetails: (data: BillDetailsProps) => requests.post(`${API_BILLSTOPAY}/payment/getdetialforpartialpayment`, data),
}

// Payment Status
const PaymentStatus = {
  paymentStatusGetList: (data: PaymentStatusListOptions) => requests.post(`${API_BILLSTOPAY}/paymentstatus/getlist`, data),
  getPaymentStatusColumnMapping: (data: GetPaymentStatusColumnMappingOptions) =>
    requests.post(`${API_BILLSTOPAY}/Paymentstatus/getcolumnmappinglist`, data),
  savePaymentStatusColumnMapping: (data: SavePaymentStatusColumnMappingOptions) =>
    requests.post(`${API_BILLSTOPAY}/Paymentstatus/savecolumnmapping`, data),
  paymentStatusDropdown: () => requests.get(`${API_BILLSTOPAY}/payment/getallstatusdropdown`),
  setCancelPayment: (data: SetCancelPaymentOptions) => requests.post(`${API_BILLSTOPAY}/cpx/cancelpayment`, data),
}

// Payment Setup
const PaymentSetup = {
  companyKYC: () => requests.get(`${API_BILLSTOPAY}/cpx/companykyc`),
  syncBankAccount: () => requests.get(`${API_BILLSTOPAY}/payment/paymentmethodsync`),
  buyerBankList: () => requests.get(`${API_BILLSTOPAY}/cpx/getbuyerbankaccounts`),
  getKYCStatus: () => requests.get(`${API_BILLSTOPAY}/cpx/getkycstatus`),
  getBuyerBankById: (data: UpdateBuyerBankOptions) => requests.post(`${API_BILLSTOPAY}/cpx/getbuyerbankbyid`, data),
  saveBuyerBank: (data: SaveBuyerBankOption) => requests.post(`${API_BILLSTOPAY}/cpx/savebuyerbankaccount`, data),
  deactivateBankAccount: (data: DeactivateBankAccountOptions) => requests.post(`${API_BILLSTOPAY}/cpx/deactivatebuyerbank`, data),
  paymentMethodList: () => requests.get(`${API_BILLSTOPAY}/cpx/getpaymentmethods`),
  getPaymentMethodById: (data: UpdatePaymentMethodOptions) => requests.post(`${API_BILLSTOPAY}/cpx/getpaymentmethodbyid`, data),
  savePaymentMethod: (data: SavePaymentMethodOptions) => requests.post(`${API_BILLSTOPAY}/cpx/savepaymentmethod`, data),
  activateBankAccount: (data: DeactivateBankAccountOptions) => requests.post(`${API_BILLSTOPAY}/cpx/activatebuyerbank`, data),
  getBankAccountDropdown: (data: GetAllBankAccountOptions) => requests.post(`${API_BILLSTOPAY}/cpx/getbuyerbankdropdown`, data),
  saveCheckPaymentMethod: (data: any) => requests.postForm(`${API_BILLSTOPAY}/cpx/addcheckpaymentmethod`, data),
  saveCheckMicroDeposit: (data: SaveCheckMicroDepositOptions) =>
    requests.post(`${API_BILLSTOPAY}/cpx/addcheckmicrodeposit`, data),
  approveRejectCheck: (data: ApproveRejectCheckOptions) => requests.post(`${API_BILLSTOPAY}/cpx/approverejectcheck`, data),
}

//Workflow Automation
const Automation = {
  automationGetRuleList: (data: AutomationGetRuleListOptions) => requests.post(`${API_MANAGE}/settings/automation/getRule`, data),
  ruleActiveInactive: (data: RuleActiveInactiveOptions) =>
    requests.post(`${API_MANAGE}/settings/automation/activeInActiveRule`, data),
  ruleGetById: (data: RuleByIdOptions) => requests.post(`${API_MANAGE}/settings/automation/getRuleById`, data),
  saveRule: (data: SaveRuleOptions) => requests.post(`${API_MANAGE}/settings/automation/saveRule`, data),
}

//Vendor
const Vendor = {
  accountClassification: () => requests.get(`${API_MASTER}/vendor/getaccountclassificationdropdown`),
  vendorGetList: (data: VendorGetListOptions) => requests.post(`${API_MASTER}/vendor/getlist`, data),
  vendorUpdateStatus: (data: VendorUpdateStatusOptions) => requests.post(`${API_MASTER}/vendor/updatestatus`, data),
  syncVendor: () => requests.get(`${API_MASTER}/vendor/sync`),
  saveVendor: (data: SaveVendorOptions) => requests.post(`${API_MASTER}/vendor/save`, data),
  vendorGetById: (data: VendorGetByIdOptions) => requests.post(`${API_MASTER}/vendor/getbyid`, data),
  importVendorData: (data: any) => requests.postForm(`${API_MASTER}/vendor/import`, data),

  vendorDropdownList: (data: VendorDropdownListOptions) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
  vendorGetDropdownList: (data: VendorGetDropdownListOptions) =>
    requests.post(`${API_MANAGE}/settings/automation/getvendordropdown`, data),
}

//Activity
const Activity = {
  getActivityList: (data: ActivityListOptions) => requests.post(`${API_ACTIVTY}/activity/getlist`, data),
  getWatcherList: (data: ActivityWatcherListOptions) => requests.post(`${API_ACTIVTY}/activity/getwatcherlist`, data),
  saveActivityList: (data: SaveActivityListOptions) => requests.post(`${API_ACTIVTY}/activity/save`, data),
  saveWatcherList: (data: SaveWatcherListOptions) => requests.post(`${API_ACTIVTY}/activity/savewatchers`, data),
  updateResolved: (data: UpdateResloved) => requests.post(`${API_ACTIVTY}/activity/updateisresolved`, data),
  storeNotification: (data: ActivityNotificationOptions) =>
    requests.post(`${API_REALTIMENOTIFICATION}/notifications/store`, data),
}

// Reports
const Reports = {
  // Reports Header List API
  getHeaderList: () => requests.get(`${API_REPORTS}/report/getreportheader`),
  getFavoriteStar: (data: FavoriteStarOption) => requests.post(`${API_REPORTS}/report/setreportfav`, data),
  // AP Aging Detail Reports API
  apAgingDetail: (data: ApAgingDetailsProps) => requests.post(`${API_REPORTS}/Reports/getapagingdetail`, data),
  getApAgingDetailsColumnMapping: (data: GetApAgingDetailsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveApAgingDetailsColumnMapping: (data: SaveApAgingDetailsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // AP Aging Summary Reports API
  apAgingSummary: (data: ApAgingSummaryProps) => requests.post(`${API_REPORTS}/reports/getapagingsummary`, data),
  apAgingSummaryDrawer: (data: ApAgingSummaryDrawerProps) =>
    requests.post(`${API_REPORTS}/reports/getapagingdetaildaywise`, data),

  // Unpaid Bills Reports API
  unpaidBills: (data: UnpainBillsProps) => requests.post(`${API_REPORTS}/reports/getunpaidbill`, data),
  getUnpaidBillsColumnMapping: (data: GetUnpaidBillsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveUnpaidBillsColumnMapping: (data: SaveUnpaidBillsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // Vendor Balance Detail Reports API
  vendorBalanceDetail: (data: VendorBalanceDetailProps) => requests.post(`${API_REPORTS}/reports/getvendorbaldetail`, data),
  billPayments: (data: any) => requests.post(`${API_REPORTS}/reports/getbillPayments`, data),
  getVendorBalanceDetailColumnMapping: (data: GetVendorBalanceDetailColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),

  // Vendor Balance Summary Reports API
  vendorBalanceSummary: (data: VendorBalanceSummaryProps) => requests.post(`${API_REPORTS}/reports/getvendorbalsummary`, data),

  // Bill Analysis Reports API
  billAnalysis: (data: BillAnalysisProps) => requests.post(`${API_REPORTS}/reports/getbillanalysissum`, data),
  billAnalysisDetail: (data: any) => requests.post(`${API_REPORTS}/reports/getbillanalysisdetail`, data),
  getBillAnalysisColumnMapping: (data: GetBillAnalysisColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveBillAnalysisColumnMapping: (data: SaveBillAnalysisColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // Vendor Aging Reports API
  vendorAgingGroupBy: (data: VendorAgingGroupByProps) => requests.post(`${API_REPORTS}/reports/getvendoraginggroupby`, data),
  vendorAgingSummary: (data: VendorAgingSummaryProps) => requests.post(`${API_REPORTS}/reports/getvendoragingsummary`, data),
}

const Global = {
  getSearchHistory: (data: GetSearchHistoryOptions) => requests.post(`${API_GLOBAL}/global/gethistory`, data),
  saveSearchHistory: (data: SaveSearchHistoryOptions) => requests.post(`${API_GLOBAL}/global/savehistory`, data),
  getSearchResult: (data: SearchResultOptions) => requests.post(`${API_GLOBAL}/global/search`, data),
}

const Files = {
  historyGetList: (data: HistoryGetListProps) => requests.post(`${API_FILEUPLOAD}/documenthistory/getlist`, data),
  getBillNumbersList: () => requests.get(`${API_FILEUPLOAD}/documenthistory/getbillnumberdropdown`),
  linkBillToExistingBill: (data: LinkBillToExistingBillProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/addattachments`, data),
  handleHistoryDocumentRetry: (data: HandleHistoryDocumentRetryProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/sendforocr`, data),
}

const APIs = {
  /* BILL POSTING */
  vendorDropdown: (data: any) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
  vendorGLTermDropdown: (data: any) => requests.post(`${API_MASTER}/vendor/getvendortermgldrpdwn`, data),
  termDropdown: (data: any) => requests.post(`${API_MASTER}/term/getdropdown`, data),
  accountDropdown: (data: any) => requests.post(`${API_MASTER}/account/getdropdown`, data),

  classDropdown: (data: any) => requests.post(`${API_MASTER}/class/getdropdown`, data),
  productServiceDropdown: (data: any) => requests.post(`${API_MASTER}/productandservice/getdropdown`, data),
  customerDropdown: (data: any) => requests.post(`${API_MASTER}/customer/getdropdown`, data),
  projectDropdown: (data: any) => requests.post(`${API_MASTER}/project/getdropdown`, data),
  departmentDropdown: (data: any) => requests.post(`${API_MASTER}/department/getdropdown`, data),
  locationDropdown: (data: any) => requests.post(`${API_MASTER}/location/getdropdown`, data),

  processDropdown: () => requests.get(`${API_MANAGE}/settings/getprocessdropdown`),
  statusDropdown: () => requests.get(`${API_FILEUPLOAD}/document/getstatusdropdown`),
  userDropdown: (data: any) => requests.post(`${API_MANAGE}/user/getdropdownbycompany`, data),

  getFieldMappings: (data: GetFieldMappingOptionsProps) => requests.post(`${API_MANAGE}/settings/getfieldmappings`, data),
  getDocumentDetails: (data: GetDocumentByIdOptionsProps) => requests.post(`${API_FILEUPLOAD}/document/getdetails`, data),

  deleteLineItem: (data: any) => requests.post(`${API_FILEUPLOAD}/document/deletelineitem`, data),
  saveColumnMappingList: (data: any) => requests.post(`${API_FILEUPLOAD}/document/savecolumnmapping`, data),

  documentGetList: (data: DocumentGetListOptions) => requests.post(`${API_FILEUPLOAD}/document/getlist`, data),

  mergeDocuments: (data: MergeDocumentOptionsProps) => requests.post(`${API_FILEUPLOAD}/document/mergepdf`, data),
  splitDocuments: (data: SplitDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/splitpdf`, data),
  getocrDocument: () => requests.get(`${API_FILEUPLOAD}/indexing/getocrDocument`),

  getDuplicateList: (data: any) => requests.post(`${API_FILEUPLOAD}/document/getduplicatelist`, data),

  /* FILE HISTORY */
  getUserByCompanyDropdown: (data: CompanyIdDropDown) => requests.post(`${API_MANAGE}/user/GetDropDownForRule`, data),
  historyGetList: (data: HistoryGetListProps) => requests.post(`${API_FILEUPLOAD}/documenthistory/getlist`, data),
  getBillNumberDropdown: () => requests.get(`${API_FILEUPLOAD}/documenthistory/getbillnumberdropdown`),
  linkBillToExistingBill: (data: LinkBillToExistingBillProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/addattachments`, data),
  handleFileHistoryRetry: (data: HandleHistoryDocumentRetryProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/sendforocr`, data),
  accountPayableSave: (data: any) => requests.post(`${API_FILEUPLOAD}/accountpayable/save`, data),
  uploadAttachment: (data: any) => requests.postForm(`${API_FILEUPLOAD}/document/uploadattachments`, data),
  getDocumentHistoryDetails: (data: GetDocumentByIdOptionsProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/getdetails`, data),

  /* FILE UPLOAD */
  uploadDocument: (data: any) => requests.postForm(`${API_FILEUPLOAD}/document/upload`, data),

  /* PROFILE */
  getUserProfile: () => requests.get(`${API_PROFILE}/user/getuserprofile`),
  getUserConfig: () => requests.get(`${API_MANAGE}/user/getuserconfig`),
  qboLogin: (url: string) => requests.get(`${API_SSO}/auth${url}`),
  getProducts: () => requests.get(`${API_PROFILE}/product/getproducts`),
  getIndustryTypes: () => requests.get(`${API_PROFILE}/organization/getindustrytypes`),
  getUserProducts: (data: any) => requests.post(`${API_PROFILE}/product/mapuserproducts`, data),
  organizationSave: (data: any) => requests.post(`${API_PROFILE}/organization/save`, data),

  /* AUTH */
  updatePassword: (data: any) => requests.post(`${API_PROFILE}/auth/updatepassword`, data),

  favoriteByUser: (data: any) => requests.post(`${API_MANAGE}/user/setfavoritebyuser`, data),

  /* SSO */
  getQboConnectUrl: () => requests.get(`${API_SSO}/auth/getqboconnecturl`),
  login: (data: SignInOptions) => requests.post(`${API_SSO}/auth/token`, data),
  generateOtp: (data: GenerateOtpOptions) => requests.post(`${API_SSO}/auth/generateotp`, data),
  register: (data: SignUpOptions) => requests.post(`${API_SSO}/auth/register`, data),
  setPassword: (data: SetPasswordOptions) => requests.post(`${API_SSO}/auth/setpassword`, data),
  forgotPassword: (data: ForgotPasswordOptions) => requests.post(`${API_SSO}/auth/forgotpassword`, data),
  socialLogin: (data: SocialSignInOptions) => requests.post(`${API_SSO}/auth/social-login`, data),

  /* CLOUD */
  getConnectorList: (params: any) => requests.get(`${API_CLOUD}/cloud/getconnectorlist`, params),

  /* NOTIFICATION */
  notificationUploadImage: (data: any) => requests.post(`${API_NOTIFICATION}/notification/uploadimage`, data),
}

const accountantDashboard = {
  companyDropdownbyOrg: (data: any) => requests.post(`${API_MANAGE}/company/getcompanydropdownbyorg`, data),
  billingInfoList: (data: any) => requests.post(`${API_DASHBOARD}/dashboard/getbillinginfolist`, data),
  accountingDashboardList: (data: any) => requests.post(`${API_DASHBOARD}/dashboard/getaccountingdashboard`, data),
  organizationDropdown: () => requests.get(`${API_MANAGE}/organization/getorganizationdropdown`),
}

const agent = {
  Auth,
  ApTerm,
  Company,
  Dimension,
  Dashboard,
  GLAccount,
  Currency,
  FileUpload,
  ProductService,
  PaymentStatus,
  PaymentSetup,
  Profile,
  Role,
  User,
  Bill,
  FieldMapping,
  BillsToPay,
  Automation,
  Vendor,
  BillApproval,
  Activity,
  Notification,
  Global,
  Reports,
  Files,
  APIs,
  accountantDashboard,
}

export default agent