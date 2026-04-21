'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PageContainer from '../container/PageContainer';
import KaryawanOverdueTable from '../kasbon/KaryawanOverdueTable';
import KasbonFilters, { KasbonFilterValues } from '../kasbon/KasbonFilters';

interface LoanNonPerformingListProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const LoanNonPerformingList: React.FC<LoanNonPerformingListProps> = ({ 
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
    
    setFilters({
      month: currentMonth,
      year: currentYear,
      employer: '',
      placement: '',
      project: ''
    });
  }, []);

  const handleFiltersChange = (newFilters: KasbonFilterValues) => {
    console.log('Non-performing list filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    const newLoanType = event.target.value as 'kasbon' | 'extradana' | 'aku_cicil';
    setLoanType(newLoanType);
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
            <KasbonFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Box>
        )}

        {/* Karyawan Overdue Table - Only show when loan type is selected */}
        {loanType ? (
          <Box mb={3}>
            <KaryawanOverdueTable
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

export default LoanNonPerformingList;
