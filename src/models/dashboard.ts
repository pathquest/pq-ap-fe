export interface dashboardOptions {
    CompanyIds: number[];
    LocationIds: number[] | null;
    StartDate: string | null;
    EndDate: string | null;
}

export interface vendorWiseMonthlyPaymentOptions {
    CompanyIds: number[];
    Age: number;
    SortColumn: string;
    SortOrder: boolean;
    PageNumber: number;
    PageSize: number;
    LocationIds: number[] | null;
    StartDate: string | null;
    EndDate: string | null;
}

export interface InsightsOptions extends dashboardOptions {
    UserId: number;
}