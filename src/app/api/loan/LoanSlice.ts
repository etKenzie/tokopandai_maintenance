// Types for the API response
export interface Karyawan {
  id_karyawan: number;
  status: string;
  loan_kasbon_eligible: number;
  klient: string;
}

export interface KaryawanResponse {
  status: string;
  count: number;
  results: Karyawan[];
}

// Types for Loan Filters API
export interface LoanFilters {
  employers: string[];
  placements: string[];
  projects: string[];
}

export interface LoanFiltersResponse {
  status: string;
  filters: LoanFilters;
}


// Types for Loan Fees Monthly Query Parameters
export interface LoanFeesMonthlyParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  id_karyawan?: string;
  start_date?: string;
  end_date?: string;
}

// Types for Karyawan Overdue API
export interface KaryawanOverdue {
  id_karyawan: number;
  ktp: string;
  name: string;
  company: string;
  sourced_to: string;
  project: string;
  total_amount_owed: number;
  admin_fee: number;
  total_payment: number;
  repayment_date: string;
  days_overdue: number;
}

export interface KaryawanOverdueResponse {
  status: string;
  count: number;
  results: KaryawanOverdue[];
  message: string | null;
}

// Types for Karyawan Overdue Query Parameters
export interface KaryawanOverdueParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  id_karyawan?: string;
  month?: string;
  year?: string;
  loan_type?: string;
}


// Types for Coverage Utilization API
export interface CoverageUtilization {
  total_eligible_employees: number;
  total_loan_requests: number;
  penetration_rate: number;
  total_approved_requests: number;
  total_rejected_requests: number;
  approval_rate: number;
  total_new_borrowers: number;
  average_approval_time: number;
  total_disbursed_amount: number;
  average_disbursed_amount: number;
  message: string | null;
}

export interface CoverageUtilizationResponse {
  status: string;
  total_eligible_employees: number;
  total_active_employees: number;
  total_loan_requests: number;
  penetration_rate: number;
  eligible_rate: number;
  total_approved_requests: number;
  total_rejected_requests: number;
  approval_rate: number;
  total_new_borrowers: number;
  average_approval_time: number;
  total_disbursed_amount: number;
  average_disbursed_amount: number;
  message: string | null;
}

// Types for Coverage Utilization Query Parameters
export interface CoverageUtilizationParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  month?: string;
  year?: string;
  loan_type?: string;
}

// Types for Coverage Utilization Monthly API
export interface CoverageUtilizationMonthlyData {
  total_first_borrow: number;
  total_loan_requests: number;
  total_approved_requests: number;
  total_rejected_requests: number;
  penetration_rate: number;
  total_disbursed_amount: number;
}

export interface CoverageUtilizationMonthlyResponse {
  status: string;
  monthly_data: Record<string, CoverageUtilizationMonthlyData>;
  message: string | null;
}

// Types for Coverage Utilization Monthly Query Parameters
export interface CoverageUtilizationMonthlyParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  start_date?: string;
  end_date?: string;
  loan_type?: string;
}

// Types for Repayment Risk API
export interface RepaymentRisk {
  total_expected_repayment: number;
  total_loan_principal_collected: number;
  total_admin_fee_collected: number;
  total_unrecovered_repayment: number;
  total_unrecovered_loan_principal: number;
  total_unrecovered_admin_fee: number;
  repayment_recovery_rate: number;
  delinquencies_rate: number;
  admin_fee_profit: number;
  message: string | null;
}

export interface RepaymentRiskResponse {
  status: string;
  total_expected_repayment: number;
  total_loan_principal_collected: number;
  total_admin_fee_collected: number;
  total_unrecovered_repayment: number;
  total_unrecovered_loan_principal: number;
  total_unrecovered_admin_fee: number;
  repayment_recovery_rate: number;
  delinquencies_rate: number;
  admin_fee_profit: number;
  message: string | null;
}

// Types for Repayment Risk Query Parameters
export interface RepaymentRiskParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  month?: string;
  year?: string;
  loan_type?: string;
}

// Types for Repayment Risk Monthly API
export interface RepaymentRiskMonthlyData {
  repayment_recovery_rate: number;
  total_expected_repayment: number;
  total_loan_principal_collected: number;
  total_unrecovered_repayment: number;
  admin_fee_profit: number;
}

export interface RepaymentRiskMonthlyResponse {
  status: string;
  monthly_data: Record<string, RepaymentRiskMonthlyData>;
  message: string | null;
}

// Types for Repayment Risk Monthly Query Parameters
export interface RepaymentRiskMonthlyParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  start_date?: string;
  end_date?: string;
  loan_type?: string;
}

// Types for Loan Requests API
export interface LoanRequests {
  total_approved_requests: number;
  total_rejected_requests: number;
  approval_rate: number;
  average_approval_time: number;
  message: string | null;
}

export interface LoanRequestsResponse {
  status: string;
  total_approved_requests: number;
  total_rejected_requests: number;
  approval_rate: number;
  average_approval_time: number;
  message: string | null;
}

// Types for Loan Requests Query Parameters
export interface LoanRequestsParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  month?: string;
  year?: string;
}

// Types for Loan Disbursement API
export interface LoanDisbursement {
  total_disbursed_amount: number;
  average_disbursed_amount: number;
  message: string | null;
}

export interface LoanDisbursementResponse {
  status: string;
  total_disbursed_amount: number;
  average_disbursed_amount: number;
  message: string | null;
}

// Types for Loan Disbursement Query Parameters
export interface LoanDisbursementParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  month?: string;
  year?: string;
}

// Types for Loan Disbursement Monthly API
export interface LoanDisbursementMonthlyData {
  total_disbursed_amount: number;
  total_loans: number;
  average_disbursed_amount: number;
}

export interface LoanDisbursementMonthlyResponse {
  status: string;
  monthly_data: Record<string, LoanDisbursementMonthlyData>;
  message: string | null;
}

// Types for Loan Disbursement Monthly Query Parameters
export interface LoanDisbursementMonthlyParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  start_date?: string;
  end_date?: string;
}

// Types for Loan Purpose API
export interface LoanPurpose {
  purpose_id: number;
  purpose_name: string;
  total_count: number;
  total_amount: number;
}

export interface LoanPurposeResponse {
  status: string;
  count: number;
  results: LoanPurpose[];
  message: string | null;
}

// Types for Loan Purpose Query Parameters
export interface LoanPurposeParams {
  employer?: string;
  sourced_to?: string;
  project?: string;
  id_karyawan?: string;
  month?: string;
  year?: string;
  loan_type?: string;
}

// Types for Client Summary API
export interface ClientSummary {
  sourced_to: string;
  project: string;
  total_disbursement: number;
  total_requests: number;
  approved_requests: number;
  eligible_employees: number;
  active_employees: number;
  eligible_rate: number;
  penetration_rate: number;
  total_admin_fee_collected: number;
  total_unrecovered_payment: number;
  admin_fee_profit: number;
  delinquent_requests: number;
  delinquency_rate: number;
}

export interface ClientSummaryResponse {
  status: string;
  count: number;
  results: ClientSummary[];
}

export interface ClientSummaryParams {
  month?: string;
  year?: string;
  loan_type?: string;
}

// Get API URL from environment variable with validation
import { AM_API_URL } from '@/utils/config';


// API service functions
export const fetchKaryawan = async (clientId?: string): Promise<KaryawanResponse> => {
  const baseUrl = AM_API_URL;
  const url = clientId 
    ? `${baseUrl}/karyawan?klient=${clientId}`
    : `${baseUrl}/karyawan`;
  
  // Enhanced logging for debugging production issues
  console.log('🔗 API Request:', {
    endpoint: 'fetchKaryawan',
    baseUrl,
    fullUrl: url,
    clientId: clientId || 'none',
    timestamp: new Date().toISOString(),
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch karyawan data: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const fetchKaryawanByClient = async (clientId: string): Promise<KaryawanResponse> => {
  return fetchKaryawan(clientId);
};

// Fetch Loan Filters
export const fetchLoanFilters = async (employer?: string, placement?: string, loan_type?: string): Promise<LoanFiltersResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (employer) queryParams.append('employer', employer);
  if (placement) queryParams.append('placement', placement);
  if (loan_type) queryParams.append('loan_type', loan_type);
  
  const url = queryParams.toString() 
    ? `${baseUrl}/loan/filters?${queryParams.toString()}`
    : `${baseUrl}/loan/filters`;
  
  console.log('Fetching loan filters from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan filters: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};



// Fetch Karyawan Overdue
export const fetchKaryawanOverdue = async (params: KaryawanOverdueParams): Promise<KaryawanOverdueResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.id_karyawan) queryParams.append('id_karyawan', params.id_karyawan);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);
  
  const url = `${baseUrl}/loan/karyawan-overdue?${queryParams.toString()}`;
  
  console.log('Fetching karyawan overdue from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch karyawan overdue: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Coverage Utilization
export const fetchCoverageUtilization = async (params: CoverageUtilizationParams): Promise<CoverageUtilizationResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);
  
  const url = `${baseUrl}/loan/coverage-utilization?${queryParams.toString()}`;
  
  console.log('Fetching coverage utilization from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch coverage utilization: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Coverage Utilization Monthly
export const fetchCoverageUtilizationMonthly = async (params: CoverageUtilizationMonthlyParams): Promise<CoverageUtilizationMonthlyResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);
  
  const url = `${baseUrl}/loan/coverage-utilization-monthly?${queryParams.toString()}`;
  
  console.log('Fetching coverage utilization monthly from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch coverage utilization monthly: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Repayment Risk
export const fetchRepaymentRisk = async (params: RepaymentRiskParams): Promise<RepaymentRiskResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);
  
  const url = `${baseUrl}/loan/repayment-risk?${queryParams.toString()}`;
  
  console.log('Fetching repayment risk from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch repayment risk: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Repayment Risk Monthly
export const fetchRepaymentRiskMonthly = async (params: RepaymentRiskMonthlyParams): Promise<RepaymentRiskMonthlyResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);

  const url = `${baseUrl}/loan/repayment-risk-monthly?${queryParams.toString()}`;
  
  console.log('Fetching repayment risk monthly from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch repayment risk monthly: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Loan Requests
export const fetchLoanRequests = async (params: LoanRequestsParams): Promise<LoanRequestsResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  
  const url = `${baseUrl}/loan/requests?${queryParams.toString()}`;
  
  console.log('Fetching loan requests from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan requests: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Loan Disbursement
export const fetchLoanDisbursement = async (params: LoanDisbursementParams): Promise<LoanDisbursementResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  
  const url = `${baseUrl}/loan/disbursement?${queryParams.toString()}`;
  
  console.log('Fetching loan disbursement from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan disbursement: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Loan Disbursement Monthly
export const fetchLoanDisbursementMonthly = async (params: LoanDisbursementMonthlyParams): Promise<LoanDisbursementMonthlyResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const url = `${baseUrl}/loan/disbursement-monthly?${queryParams.toString()}`;
  
  console.log('Fetching loan disbursement monthly from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan disbursement monthly: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Loan Purpose
export const fetchLoanPurpose = async (params: LoanPurposeParams): Promise<LoanPurposeResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.employer) queryParams.append('employer', params.employer);
  if (params.sourced_to) queryParams.append('sourced_to', params.sourced_to);
  if (params.project) queryParams.append('project', params.project);
  if (params.id_karyawan) queryParams.append('id_karyawan', params.id_karyawan);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);
  
  const url = `${baseUrl}/loan/loan-purpose?${queryParams.toString()}`;
  
  console.log('Fetching loan purpose from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan purpose: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch Client Summary
export const fetchClientSummary = async (params: ClientSummaryParams): Promise<ClientSummaryResponse> => {
  const baseUrl = AM_API_URL;
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  if (params.loan_type) queryParams.append('loan_type', params.loan_type);
  
  const url = `${baseUrl}/loan/client-summary?${queryParams.toString()}`;
  
  console.log('Fetching client summary from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch client summary: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
