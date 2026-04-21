'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { CoverageUtilizationResponse, fetchCoverageUtilization, fetchLoanPurpose, fetchRepaymentRisk, LoanPurposeResponse, RepaymentRiskResponse } from '../../api/loan/LoanSlice';
import PageContainer from '../container/PageContainer';
import CoverageUtilizationChart from '../kasbon/CoverageUtilizationChart';
import KasbonFilters, { KasbonFilterValues } from '../kasbon/KasbonFilters';
import LoanPurposeChart from '../kasbon/LoanPurposeChart';
import RepaymentRiskChart from '../kasbon/RepaymentRiskChart';
import RepaymentRiskSummary from '../kasbon/RepaymentRiskSummary';
import UserCoverageUtilizationSummary from '../kasbon/UserCoverageUtilizationSummary';

interface LoanDashboardProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const LoanDashboard: React.FC<LoanDashboardProps> = ({ 
  title, 
  description, 
  requiredRoles 
}) => {
  // Check access for allowed roles
  const accessCheck = useCheckRoles(requiredRoles);
  
  // Log access check result for debugging
  console.log(`${title} Access Check:`, accessCheck);

  // Loan type state - mandatory selection, default to kasbon
  const [loanType, setLoanType] = useState<'kasbon' | 'extradana' | 'aku_cicil' | ''>('kasbon');

  const [coverageUtilizationData, setCoverageUtilizationData] = useState<CoverageUtilizationResponse | null>(null);
  const [coverageUtilizationLoading, setCoverageUtilizationLoading] = useState(false);
  const [repaymentRiskData, setRepaymentRiskData] = useState<RepaymentRiskResponse | null>(null);
  const [repaymentRiskLoading, setRepaymentRiskLoading] = useState(false);
  const [loanPurposeData, setLoanPurposeData] = useState<LoanPurposeResponse | null>(null);
  const [loanPurposeLoading, setLoanPurposeLoading] = useState(false);
  
  // Initialize filters with empty values to avoid hydration mismatch
  const [filters, setFilters] = useState<KasbonFilterValues>({
    month: '',
    year: '',
    employer: '',
    placement: '',
    project: ''
  });

  // Set initial date values in useEffect to avoid hydration issues
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();
    
    setFilters(prev => ({
      ...prev,
      month: currentMonth,
      year: currentYear
    }));
  }, []);

  const fetchLoanPurposeData = useCallback(async (currentFilters: KasbonFilterValues) => {
    setLoanPurposeLoading(true);
    try {
      // Only fetch loan purpose if we have month, year, and loan type (required)
      if (currentFilters.month && currentFilters.year && loanType) {
        const response = await fetchLoanPurpose({
          employer: currentFilters.employer || undefined,
          sourced_to: currentFilters.placement || undefined,
          project: currentFilters.project || undefined,
          month: currentFilters.month,
          year: currentFilters.year,
          loan_type: loanType,
        });
        setLoanPurposeData(response);
      } else {
        setLoanPurposeData(null);
      }
    } catch (err) {
      console.error('Failed to fetch loan purpose data:', err);
      setLoanPurposeData(null);
    } finally {
      setLoanPurposeLoading(false);
    }
  }, [loanType]);

  const fetchCoverageUtilizationData = useCallback(async (currentFilters: KasbonFilterValues) => {
    setCoverageUtilizationLoading(true);
    try {
      // Only fetch coverage utilization if we have month, year, and loan type (required)
      if (currentFilters.month && currentFilters.year && loanType) {
        const response = await fetchCoverageUtilization({
          employer: currentFilters.employer || undefined,
          sourced_to: currentFilters.placement || undefined,
          project: currentFilters.project || undefined,
          month: currentFilters.month,
          year: currentFilters.year,
          loan_type: loanType
        });
        setCoverageUtilizationData(response);
      } else {
        setCoverageUtilizationData(null);
      }
    } catch (err) {
      console.error('Failed to fetch coverage utilization data:', err);
      setCoverageUtilizationData(null);
    } finally {
      setCoverageUtilizationLoading(false);
    }
  }, [loanType]);

  const fetchRepaymentRiskData = useCallback(async (currentFilters: KasbonFilterValues) => {
    setRepaymentRiskLoading(true);
    try {
      // Only fetch repayment risk if we have month, year, and loan type (required)
      if (currentFilters.month && currentFilters.year && loanType) {
        const response = await fetchRepaymentRisk({
          employer: currentFilters.employer || undefined,
          sourced_to: currentFilters.placement || undefined,
          project: currentFilters.project || undefined,
          month: currentFilters.month,
          year: currentFilters.year,
          loan_type: loanType
        });
        setRepaymentRiskData(response);
      } else {
        setRepaymentRiskData(null);
      }
    } catch (err) {
      console.error('Failed to fetch repayment risk data:', err);
      setRepaymentRiskData(null);
    } finally {
      setRepaymentRiskLoading(false);
    }
  }, [loanType]);

  const handleFiltersChange = useCallback((newFilters: KasbonFilterValues) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    fetchLoanPurposeData(newFilters);
    fetchCoverageUtilizationData(newFilters);
    fetchRepaymentRiskData(newFilters);
  }, [fetchLoanPurposeData, fetchCoverageUtilizationData, fetchRepaymentRiskData]);

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    const newLoanType = event.target.value as 'kasbon' | 'extradana' | 'aku_cicil';
    setLoanType(newLoanType);
    // Clear data when loan type changes
    setCoverageUtilizationData(null);
    setRepaymentRiskData(null);
    setLoanPurposeData(null);
  };

  // Initial data fetch when component mounts and filters are initialized
  useEffect(() => {
    // Only fetch data if month, year, and loan type are set (after initialization)
    if (filters.month && filters.year && loanType) {
      fetchLoanPurposeData(filters);
      fetchCoverageUtilizationData(filters);
      fetchRepaymentRiskData(filters);
    }
  }, [filters.month, filters.year, loanType]); // Depend on month, year, and loan type

  return (
    <PageContainer title={title} description={description}>
      <Box>
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h3" fontWeight="bold" mb={1}>
            {title}
          </Typography>
        </Box>

        {/* Loan Type Selector */}
        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel>Loan Type *</InputLabel>
            <Select
              value={loanType}
              label="Loan Type *"
              onChange={handleLoanTypeChange}
              required
            >
              <MenuItem value="kasbon">Kasbon</MenuItem>
              <MenuItem value="extradana">Extradana</MenuItem>
              <MenuItem value="aku_cicil">Aku Cicil</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Filters - Only show when loan type is selected */}
        {loanType && (
          <Box mb={3}>
            <KasbonFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Box>
        )}

        {/* Content - Only show when loan type is selected */}
        {loanType ? (
          <>
            {/* User Coverage and Utilization Summary */}
            <Box mb={3}>
              <UserCoverageUtilizationSummary
                coverageUtilizationData={coverageUtilizationData}
                isLoading={coverageUtilizationLoading}
              />
            </Box>

            {/* Coverage Utilization Chart */}
            <Box mb={3}>
              <CoverageUtilizationChart 
                filters={{
                  employer: filters.employer,
                  placement: filters.placement,
                  project: filters.project,
                  month: filters.month,
                  year: filters.year,
                  loanType: loanType
                }}
              />
            </Box>

            {/* Loan Purpose Chart */}
            <Box mb={3}>
              {loanPurposeLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <CircularProgress />
                </Box>
              ) : loanPurposeData ? (
                <LoanPurposeChart
                  filters={{
                    employer: filters.employer,
                    placement: filters.placement,
                    project: filters.project,
                    month: filters.month,
                    year: filters.year,
                    loanType: loanType
                  }}
                />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <Typography variant="body1" color="textSecondary">
                    No data available
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Repayment Risk Summary */}
            <Box mb={3}>
              <RepaymentRiskSummary
                repaymentRiskData={repaymentRiskData}
                isLoading={repaymentRiskLoading}
              />
            </Box>

            {/* Repayment Risk Chart */}
            <Box mb={3}>
              <RepaymentRiskChart 
                filters={{
                  employer: filters.employer,
                  placement: filters.placement,
                  project: filters.project,
                  month: filters.month,
                  year: filters.year,
                  loanType: loanType
                }}
              />
            </Box>
          </>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '300px',
              border: '2px dashed #e0e0e0',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Please select a loan type to view data
            </Typography>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default LoanDashboard;
