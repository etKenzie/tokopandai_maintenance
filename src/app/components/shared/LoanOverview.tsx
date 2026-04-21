'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ClientSummary, fetchClientSummary } from '../../api/loan/LoanSlice';
import PageContainer from '../container/PageContainer';
import ClientDelinquencyTable from '../kasbon/ClientDelinquencyTable';
import ClientPenetrationTable from '../kasbon/ClientPenetrationTable';
import ClientSummaryTable from '../kasbon/ClientSummaryTable';
import KasbonOverviewFilters, { KasbonOverviewFilterValues } from '../kasbon/KasbonOverviewFilters';

interface LoanOverviewProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const LoanOverview: React.FC<LoanOverviewProps> = ({ 
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
  
  // Initialize filters with empty values to avoid hydration mismatch
  const [filters, setFilters] = useState<KasbonOverviewFilterValues>({
    month: '',
    year: ''
  });

  const [clientSummaryData, setClientSummaryData] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set initial date values in useEffect to avoid hydration issues
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();
    
    setFilters({
      month: currentMonth,
      year: currentYear
    });
  }, []);

  // Fetch client summary data
  useEffect(() => {
    const fetchData = async () => {
      if (!filters.month || !filters.year || !loanType) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchClientSummary({
          month: filters.month,
          year: filters.year,
          loan_type: loanType
        });
        
        setClientSummaryData(response.results || []);
      } catch (err) {
        console.error('Failed to fetch client summary data:', err);
        setError('Failed to load data');
        setClientSummaryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.month, filters.year, loanType]);

  const handleFiltersChange = (newFilters: KasbonOverviewFilterValues) => {
    console.log('Overview filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    const newLoanType = event.target.value as 'kasbon' | 'extradana' | 'aku_cicil';
    setLoanType(newLoanType);
    // Clear data when loan type changes
    setClientSummaryData([]);
    setError(null);
  };

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
            <KasbonOverviewFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Box>
        )}

        {/* Client Summary Tables - Only show when loan type is selected */}
        {loanType ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* First Row: Total Disbursement and Total Requests */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'stretch' }}>
            {/* Clients by Total Disbursement */}
            <ClientSummaryTable
              data={clientSummaryData}
              loading={loading}
              error={error}
              title="Clients by Total Disbursement"
              sortBy="total_disbursement"
              displayField="total_disbursement"
              displayFieldLabel="Total Disbursement"
              formatValue={(value: number) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)}
            />

            {/* Clients by Total Requests */}
            <ClientSummaryTable
              data={clientSummaryData}
              loading={loading}
              error={error}
              title="Clients by Total Requests"
              sortBy="total_requests"
              displayField="total_requests"
              displayFieldLabel="Total Requests"
              formatValue={(value: number) => value.toLocaleString()}
            />
          </Box>

          {/* Middle Row: Penetration Rate */}
          <ClientPenetrationTable
            data={clientSummaryData}
            loading={loading}
            error={error}
          />

          {/* Third Row: Highest Net Admin Fee and Highest Delinquency */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'stretch' }}>
            {/* Clients by Highest Net Admin Fee */}
            <ClientSummaryTable
              data={clientSummaryData}
              loading={loading}
              error={error}
              title="Clients by Highest Net Admin Fee"
              sortBy="admin_fee_profit"
              displayField="admin_fee_profit"
              displayFieldLabel="Net Admin Fee"
              formatValue={(value: number) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)}
            />

            {/* Clients by Highest Delinquency */}
            <ClientDelinquencyTable
              data={clientSummaryData}
              loading={loading}
              error={error}
            />
          </Box>
        </Box>
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

export default LoanOverview;
