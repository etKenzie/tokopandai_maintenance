// Types for External Payroll Filters API
export interface Department {
  dept_id: number;
  department_name: string | null;
}

export interface ExternalPayrollFiltersResponse {
  status: string;
  departments: Department[];
}

// Types for Internal Payroll Filters Query Parameters
export interface ExternalPayrollFiltersParams {
  month?: string;
  year?: string;
}

// Types for Total Payroll Disbursed API
export interface TotalPayrollDisbursedResponse {
  status: string;
  total_payroll_disbursed: number;
  month: number;
  year: number;
  message: string | null;
}

export interface TotalPayrollDisbursedParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Types for Total Payroll Headcount API
export interface TotalPayrollHeadcountResponse {
  status: string;
  total_headcount: number;
  pkwtt_headcount: number;
  pkwt_headcount: number;
  mitra_headcount: number;
  month: number;
  year: number;
  message: string | null;
}

export interface TotalPayrollHeadcountParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Types for Internal Payroll Monthly API
export interface MonthlySummary {
  total_disbursed: number;
  total_headcount: number;
  pkwtt_headcount: number;
  pkwt_headcount: number;
  mitra_headcount: number;
}

export interface ExternalPayrollMonthlyResponse {
  status: string;
  summaries: Record<string, MonthlySummary>; // Key is month name like "August 2025"
  start_month: number;
  end_month: number;
  year: number;
  message: string | null;
}

export interface ExternalPayrollMonthlyParams {
  start_month: string; // Format: "MM-YYYY" (e.g., "08-2025")
  end_month: string; // Format: "MM-YYYY" (e.g., "10-2025")
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Get API URL from environment variable with validation
import { AM_API_URL } from '@/utils/config';

// Fetch External Payroll Filters
export const fetchExternalPayrollFilters = async (
  params: ExternalPayrollFiltersParams
): Promise<ExternalPayrollFiltersResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  
  const url = queryParams.toString()
    ? `${baseUrl}/external_payroll/filters?${queryParams.toString()}`
    : `${baseUrl}/external_payroll/filters`;
  
  // Enhanced logging for debugging production issues
  console.log('🔗 API Request:', {
    endpoint: 'fetchExternalPayrollFilters',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch internal payroll filters: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Total Payroll Disbursed
export const fetchTotalPayrollDisbursed = async (
  params: TotalPayrollDisbursedParams
): Promise<TotalPayrollDisbursedResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/total_payroll_disbursed?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchTotalPayrollDisbursed',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch total payroll disbursed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Total Payroll Headcount
export const fetchTotalPayrollHeadcount = async (
  params: TotalPayrollHeadcountParams
): Promise<TotalPayrollHeadcountResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/total_payroll_headcount?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchTotalPayrollHeadcount',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch total payroll headcount: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Internal Payroll Monthly
export const fetchExternalPayrollMonthly = async (
  params: ExternalPayrollMonthlyParams
): Promise<ExternalPayrollMonthlyResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('start_month', params.start_month); // Format: "MM-YYYY"
  queryParams.append('end_month', params.end_month); // Format: "MM-YYYY"
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/monthly?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchExternalPayrollMonthly',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch internal payroll monthly: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Types for Department Summary API
export interface DepartmentSummary {
  dept_id: number;
  department_name: string | null;
  cost_owner: string;
  total_headcount: number;
  pkwtt_headcount: number;
  pkwt_headcount: number;
  mitra_headcount: number;
  distribution_ratio: number;
  total_disbursed: number;
}

export interface DepartmentSummaryResponse {
  status: string;
  departments: DepartmentSummary[];
  month: number;
  year: number;
  count: number;
  message: string | null;
}

export interface DepartmentSummaryParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Fetch Department Summary
export const fetchDepartmentSummary = async (
  params: DepartmentSummaryParams
): Promise<DepartmentSummaryResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/department_summary?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchDepartmentSummary',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch department summary: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Types for Cost Owner Summary API
export interface CostOwnerSummary {
  cost_owner: string;
  total_headcount: number;
  pkwtt_headcount: number;
  pkwt_headcount: number;
  mitra_headcount: number;
  distribution_ratio: number;
  total_disbursed: number;
}

export interface CostOwnerSummaryResponse {
  status: string;
  cost_owners: CostOwnerSummary[];
  month: number;
  year: number;
  count: number;
  message: string | null;
}

export interface CostOwnerSummaryParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Fetch Cost Owner Summary
export const fetchCostOwnerSummary = async (
  params: CostOwnerSummaryParams
): Promise<CostOwnerSummaryResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/cost_owner_summary?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchCostOwnerSummary',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cost owner summary: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Types for Total Department Count API
export interface TotalDepartmentCountResponse {
  status: string;
  total_department_count: number;
  month: number;
  year: number;
  message: string | null;
}

export interface TotalDepartmentCountParams {
  month: string;
  year: string;
}

// Fetch Total Department Count
export const fetchTotalDepartmentCount = async (
  params: TotalDepartmentCountParams
): Promise<TotalDepartmentCountResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  const url = `${baseUrl}/external_payroll/total_department_count?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchTotalDepartmentCount',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch total department count: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Types for Total BPSJTK API
export interface TotalBPSJTKResponse {
  status: string;
  total_bpsjtk: number;
  month: number;
  year: number;
  message: string | null;
}

export interface TotalBPSJTKParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Types for Total Kesehatan API
export interface TotalKesehatanResponse {
  status: string;
  total_kesehatan: number;
  month: number;
  year: number;
  message: string | null;
}

export interface TotalKesehatanParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Types for Total Pensiun API
export interface TotalPensiunResponse {
  status: string;
  total_pensiun: number;
  month: number;
  year: number;
  message: string | null;
}

export interface TotalPensiunParams {
  month: string;
  year: string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
}

// Fetch Total BPSJTK
export const fetchTotalBPSJTK = async (
  params: TotalBPSJTKParams
): Promise<TotalBPSJTKResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/total_bpsjtk?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchTotalBPSJTK',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch total BPSJTK: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Total Kesehatan
export const fetchTotalKesehatan = async (
  params: TotalKesehatanParams
): Promise<TotalKesehatanResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/total_kesehatan?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchTotalKesehatan',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch total kesehatan: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Total Pensiun
export const fetchTotalPensiun = async (
  params: TotalPensiunParams
): Promise<TotalPensiunResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  const url = `${baseUrl}/external_payroll/total_pensiun?${queryParams.toString()}`;
  
  console.log('🔗 API Request:', {
    endpoint: 'fetchTotalPensiun',
    baseUrl,
    fullUrl: url,
    params: params,
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch total pensiun: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
