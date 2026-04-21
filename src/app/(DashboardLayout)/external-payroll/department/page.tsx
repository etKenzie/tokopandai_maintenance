'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PageContainer from '../../../components/container/PageContainer';
import DepartmentSummaryTable from '../../../components/external_payroll/DepartmentSummaryTable';
import ExternalPayrollMonthYearFilters, { ExternalPayrollMonthYearFilterValues } from '../../../components/external_payroll/ExternalPayrollMonthYearFilters';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const ExternalPayrollDepartmentPage = () => {
  // Initialize filters with empty values to avoid hydration mismatch
  const [filters, setFilters] = useState<ExternalPayrollMonthYearFilterValues>({
    month: '',
    year: '',
    status_kontrak: '',
  });

  // Set initial date values in useEffect to avoid hydration issues
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    setFilters({
      month: currentMonth,
      year: currentYear,
    });
  }, []);

  const handleFiltersChange = (newFilters: ExternalPayrollMonthYearFilterValues) => {
    setFilters(newFilters);
  };

  return (
    <PageContainer title="Department Summary" description="View department payroll summary and analytics">
      <Box>
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h3" fontWeight="bold" mb={1}>
            Department Summary
          </Typography>
        </Box>

        {/* Filters */}
        <Box mb={3}>
          <ExternalPayrollMonthYearFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Box>

        {/* Department Summary Table */}
        {(filters.month && filters.year) ? (
          <Box mb={3}>
            <DepartmentSummaryTable
              filters={{
                month: filters.month,
                year: filters.year,
                status_kontrak: filters.status_kontrak,
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
              Please select month and year to view data
            </Typography>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default function ProtectedExternalPayrollDepartment() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('PAYROLL_DASHBOARD')}>
      <ExternalPayrollDepartmentPage />
    </ProtectedRoute>
  );
}
