/** td_karyawan.dept_code — sent as query param `dept_code` when filtering internal payroll */
export const INTERNAL_PAYROLL_DEPT_CODE_OPTIONS = [
  { value: '1', label: 'BFSI' },
  { value: '2', label: 'Non-BFSI' },
  { value: '3', label: 'Corporate' },
] as const;

function appendDeptCode(queryParams: URLSearchParams, dept_code?: number | string | null) {
  if (dept_code !== undefined && dept_code !== null && dept_code !== '') {
    queryParams.append('dept_code', dept_code.toString());
  }
}

// Types for Internal Payroll Filters API
export interface Department {
  dept_id: number;
  department_name: string | null;
}

export interface InternalPayrollFiltersResponse {
  status: string;
  departments: Department[];
}

// Types for External Payroll Filters Query Parameters
export interface InternalPayrollFiltersParams {
  month?: string;
  year?: string;
}

// Types for Total Payroll Disbursed API
export interface TotalPayrollDisbursedResponse {
  status: string;
  total_payroll_disbursed: number;
  month: number;
  year: number;
  dept_id: number | null;
  message: string | null;
}

export interface TotalPayrollDisbursedParams {
  month: string;
  year: string;
  dept_id?: number | string; // Can be 0 for all departments
  dept_code?: number | string; // td_karyawan.dept_code: 1 BFSI, 2 Non-BFSI, 3 Corporate (UI omits Outsource/4)
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
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
  dept_id: number | null;
  message: string | null;
}

export interface TotalPayrollHeadcountParams {
  month: string;
  year: string;
  dept_id?: number | string; // Optional, can be 0 for all departments
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
}

// Types for External Payroll Monthly API
export interface MonthlySummary {
  total_disbursed: number;
  total_headcount: number;
  pkwtt_headcount: number;
  pkwt_headcount: number;
  mitra_headcount: number;
}

export interface InternalPayrollMonthlyResponse {
  status: string;
  summaries: Record<string, MonthlySummary>; // Key is month name like "August 2025"
  start_month: number;
  end_month: number;
  year: number;
  dept_id: number | null;
  message: string | null;
}

export interface InternalPayrollMonthlyParams {
  start_month: string; // Format: "MM-YYYY" (e.g., "08-2025")
  end_month: string; // Format: "MM-YYYY" (e.g., "10-2025")
  dept_id?: number | string; // Optional, can be 0 for all departments
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
}

// Get API URL from environment variable with validation
import { AM_API_URL } from '@/utils/config';

// Fetch Internal Payroll Filters
export const fetchInternalPayrollFilters = async (
  params: InternalPayrollFiltersParams
): Promise<InternalPayrollFiltersResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  
  const url = queryParams.toString()
    ? `${baseUrl}/internal_payroll/filters?${queryParams.toString()}`
    : `${baseUrl}/internal_payroll/filters`;
  
  // Enhanced logging for debugging production issues
  console.log('🔗 API Request:', {
    endpoint: 'fetchInternalPayrollFilters',
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
    throw new Error(`Failed to fetch external payroll filters: ${response.status} ${response.statusText}`);
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
  
  // Only pass dept_id if provided (not when "All Departments" is selected)
  // dept_id=0 represents "Valdo" department, so we shouldn't pass it for "All"
  if (params.dept_id !== undefined && params.dept_id !== null && params.dept_id !== '') {
    queryParams.append('dept_id', params.dept_id.toString());
  }
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/total_payroll_disbursed?${queryParams.toString()}`;
  
  console.log('Fetching total payroll disbursed from:', url);
  
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
  
  // dept_id is optional for headcount endpoint
  if (params.dept_id !== undefined && params.dept_id !== null && params.dept_id !== '') {
    queryParams.append('dept_id', params.dept_id.toString());
  }
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/total_payroll_headcount?${queryParams.toString()}`;
  
  console.log('Fetching total payroll headcount from:', url);
  
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

// Fetch External Payroll Monthly
export const fetchInternalPayrollMonthly = async (
  params: InternalPayrollMonthlyParams
): Promise<InternalPayrollMonthlyResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  queryParams.append('start_month', params.start_month); // Format: "MM-YYYY"
  queryParams.append('end_month', params.end_month); // Format: "MM-YYYY"
  
  // dept_id is optional
  if (params.dept_id !== undefined && params.dept_id !== null && params.dept_id !== '') {
    queryParams.append('dept_id', params.dept_id.toString());
  }
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/monthly?${queryParams.toString()}`;
  
  console.log('Fetching external payroll monthly from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch external payroll monthly: ${response.status} ${response.statusText}`);
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
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
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
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/department_summary?${queryParams.toString()}`;
  
  console.log('Fetching department summary from:', url);
  
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
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
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
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/cost_owner_summary?${queryParams.toString()}`;
  
  console.log('Fetching cost owner summary from:', url);
  
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
  dept_code?: number | string;
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
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
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/total_department_count?${queryParams.toString()}`;
  
  console.log('Fetching total department count from:', url);
  
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
  dept_id: number | null;
  message: string | null;
}

export interface TotalBPSJTKParams {
  month: string;
  year: string;
  dept_id?: number | string; // Optional, can be 0 for all departments
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
}

// Types for Total Kesehatan API
export interface TotalKesehatanResponse {
  status: string;
  total_kesehatan: number;
  month: number;
  year: number;
  dept_id: number | null;
  message: string | null;
}

export interface TotalKesehatanParams {
  month: string;
  year: string;
  dept_id?: number | string; // Optional, can be 0 for all departments
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
}

// Types for Total Pensiun API
export interface TotalPensiunResponse {
  status: string;
  total_pensiun: number;
  month: number;
  year: number;
  dept_id: number | null;
  message: string | null;
}

export interface TotalPensiunParams {
  month: string;
  year: string;
  dept_id?: number | string; // Optional, can be 0 for all departments
  dept_code?: number | string;
  status_kontrak?: number | string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA
  valdo_inc?: number | string; // 1=VI, 2=VSDM, 31=VSI, 94=TOPAN
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
  
  // Only pass dept_id if provided (not when "All Departments" is selected)
  if (params.dept_id !== undefined && params.dept_id !== null && params.dept_id !== '') {
    queryParams.append('dept_id', params.dept_id.toString());
  }
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/total_bpsjtk?${queryParams.toString()}`;
  
  console.log('Fetching total BPSJTK from:', url);
  
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
  
  // Only pass dept_id if provided (not when "All Departments" is selected)
  if (params.dept_id !== undefined && params.dept_id !== null && params.dept_id !== '') {
    queryParams.append('dept_id', params.dept_id.toString());
  }
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/total_kesehatan?${queryParams.toString()}`;
  
  console.log('Fetching total kesehatan from:', url);
  
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
  
  // Only pass dept_id if provided (not when "All Departments" is selected)
  if (params.dept_id !== undefined && params.dept_id !== null && params.dept_id !== '') {
    queryParams.append('dept_id', params.dept_id.toString());
  }
  
  // Add status_kontrak if provided
  if (params.status_kontrak !== undefined && params.status_kontrak !== null && params.status_kontrak !== '') {
    queryParams.append('status_kontrak', params.status_kontrak.toString());
  }
  
  // Add valdo_inc if provided
  if (params.valdo_inc !== undefined && params.valdo_inc !== null && params.valdo_inc !== '') {
    queryParams.append('valdo_inc', params.valdo_inc.toString());
  }

  appendDeptCode(queryParams, params.dept_code);

  const url = `${baseUrl}/internal_payroll/total_pensiun?${queryParams.toString()}`;
  
  console.log('Fetching total pensiun from:', url);
  
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

