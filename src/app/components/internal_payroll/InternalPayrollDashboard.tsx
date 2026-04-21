'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
    fetchTotalBPSJTK,
    fetchTotalDepartmentCount,
    fetchTotalKesehatan,
    fetchTotalPayrollDisbursed,
    fetchTotalPayrollHeadcount,
    fetchTotalPensiun,
    TotalBPSJTKResponse,
    TotalDepartmentCountResponse,
    TotalKesehatanResponse,
    TotalPayrollDisbursedResponse,
    TotalPayrollHeadcountResponse,
    TotalPensiunResponse
} from '../../api/internal_payroll/InternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import SummaryTiles from '../shared/SummaryTiles';
import InternalPayrollFilters, { InternalPayrollFilterValues } from './InternalPayrollFilters';
import InternalPayrollMonthlyChart from './InternalPayrollMonthlyChart';

interface InternalPayrollDashboardProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const InternalPayrollDashboard: React.FC<InternalPayrollDashboardProps> = ({
  title,
  description,
  requiredRoles
}) => {
  // Check access for allowed roles
  const accessCheck = useCheckRoles(requiredRoles);

  const [totalPayrollDisbursedData, setTotalPayrollDisbursedData] =
    useState<TotalPayrollDisbursedResponse | null>(null);
  const [totalPayrollDisbursedLoading, setTotalPayrollDisbursedLoading] = useState(false);
  const [totalPayrollHeadcountData, setTotalPayrollHeadcountData] =
    useState<TotalPayrollHeadcountResponse | null>(null);
  const [totalPayrollHeadcountLoading, setTotalPayrollHeadcountLoading] = useState(false);
  const [totalDepartmentCountData, setTotalDepartmentCountData] =
    useState<TotalDepartmentCountResponse | null>(null);
  const [totalDepartmentCountLoading, setTotalDepartmentCountLoading] = useState(false);
  const [totalBPSJTKData, setTotalBPSJTKData] =
    useState<TotalBPSJTKResponse | null>(null);
  const [totalBPSJTKLoading, setTotalBPSJTKLoading] = useState(false);
  const [totalKesehatanData, setTotalKesehatanData] =
    useState<TotalKesehatanResponse | null>(null);
  const [totalKesehatanLoading, setTotalKesehatanLoading] = useState(false);
  const [totalPensiunData, setTotalPensiunData] =
    useState<TotalPensiunResponse | null>(null);
  const [totalPensiunLoading, setTotalPensiunLoading] = useState(false);

  // Initialize filters with empty values to avoid hydration mismatch
  const [filters, setFilters] = useState<InternalPayrollFilterValues>({
    month: '',
    year: '',
    department: '',
    dept_code: '',
    status_kontrak: '',
    valdo_inc: ''
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

  const fetchTotalPayrollDisbursedData = useCallback(
    async (currentFilters: InternalPayrollFilterValues) => {
      setTotalPayrollDisbursedLoading(true);
      try {
        // Only fetch if we have month and year (required)
        if (currentFilters.month && currentFilters.year) {
          const params: any = {
            month: currentFilters.month,
            year: currentFilters.year,
          };
          
          // Only add dept_id if a specific department is selected (not "All Departments")
          if (currentFilters.department) {
            params.dept_id = parseInt(currentFilters.department);
          }
          
          // Add status_kontrak if provided
          if (currentFilters.status_kontrak) {
            params.status_kontrak = parseInt(currentFilters.status_kontrak);
          }
          
          // Add valdo_inc if provided
          if (currentFilters.valdo_inc) {
            params.valdo_inc = parseInt(currentFilters.valdo_inc);
          }

          if (currentFilters.dept_code) {
            params.dept_code = parseInt(currentFilters.dept_code);
          }

          const response = await fetchTotalPayrollDisbursed(params);
          setTotalPayrollDisbursedData(response);
        } else {
          setTotalPayrollDisbursedData(null);
        }
      } catch (err) {
        console.error('Failed to fetch total payroll disbursed data:', err);
        setTotalPayrollDisbursedData(null);
      } finally {
        setTotalPayrollDisbursedLoading(false);
      }
    },
    []
  );

  const fetchTotalPayrollHeadcountData = useCallback(
    async (currentFilters: InternalPayrollFilterValues) => {
      setTotalPayrollHeadcountLoading(true);
      try {
        // Only fetch if we have month and year (required)
        if (currentFilters.month && currentFilters.year) {
          const params: any = {
            month: currentFilters.month,
            year: currentFilters.year,
          };
          
          if (currentFilters.department) {
            params.dept_id = parseInt(currentFilters.department);
          }
          
          if (currentFilters.status_kontrak) {
            params.status_kontrak = parseInt(currentFilters.status_kontrak);
          }
          
          // Add valdo_inc if provided
          if (currentFilters.valdo_inc) {
            params.valdo_inc = parseInt(currentFilters.valdo_inc);
          }

          if (currentFilters.dept_code) {
            params.dept_code = parseInt(currentFilters.dept_code);
          }

          const response = await fetchTotalPayrollHeadcount(params);
          setTotalPayrollHeadcountData(response);
        } else {
          setTotalPayrollHeadcountData(null);
        }
      } catch (err) {
        console.error('Failed to fetch total payroll headcount data:', err);
        setTotalPayrollHeadcountData(null);
      } finally {
        setTotalPayrollHeadcountLoading(false);
      }
    },
    []
  );

  const fetchTotalDepartmentCountData = useCallback(
    async (currentFilters: InternalPayrollFilterValues) => {
      setTotalDepartmentCountLoading(true);
      try {
        // Only fetch if we have month and year (required) and NO specific department is selected
        // This endpoint doesn't support dept_id, so we show N/A when a department is selected
        if (currentFilters.month && currentFilters.year && !currentFilters.department) {
          const params: any = {
            month: currentFilters.month,
            year: currentFilters.year,
          };

          if (currentFilters.dept_code) {
            params.dept_code = parseInt(currentFilters.dept_code);
          }

          const response = await fetchTotalDepartmentCount(params);
          setTotalDepartmentCountData(response);
        } else {
          setTotalDepartmentCountData(null);
        }
      } catch (err) {
        console.error('Failed to fetch total department count data:', err);
        setTotalDepartmentCountData(null);
      } finally {
        setTotalDepartmentCountLoading(false);
      }
    },
    []
  );

  const fetchBPSJTKKesehatanPensiunData = useCallback(
    async (currentFilters: InternalPayrollFilterValues) => {
      if (!currentFilters.month || !currentFilters.year) return;

      setTotalBPSJTKLoading(true);
      setTotalKesehatanLoading(true);
      setTotalPensiunLoading(true);
      
      try {
        const params: any = {
          month: currentFilters.month,
          year: currentFilters.year,
        };
        
        // Only add dept_id if a specific department is selected (not "All Departments")
        if (currentFilters.department) {
          params.dept_id = parseInt(currentFilters.department);
        }
        
        // Add status_kontrak if provided
        if (currentFilters.status_kontrak) {
          params.status_kontrak = parseInt(currentFilters.status_kontrak);
        }
        
        // Add valdo_inc if provided
        if (currentFilters.valdo_inc) {
          params.valdo_inc = parseInt(currentFilters.valdo_inc);
        }

        if (currentFilters.dept_code) {
          params.dept_code = parseInt(currentFilters.dept_code);
        }

        // Fetch all three in parallel
        const [bpsjtkResponse, kesehatanResponse, pensiunResponse] = await Promise.all([
          fetchTotalBPSJTK(params),
          fetchTotalKesehatan(params),
          fetchTotalPensiun(params),
        ]);

        setTotalBPSJTKData(bpsjtkResponse);
        setTotalKesehatanData(kesehatanResponse);
        setTotalPensiunData(pensiunResponse);
      } catch (err) {
        console.error('Failed to fetch BPSJTK/Kesehatan/Pensiun data:', err);
        setTotalBPSJTKData(null);
        setTotalKesehatanData(null);
        setTotalPensiunData(null);
      } finally {
        setTotalBPSJTKLoading(false);
        setTotalKesehatanLoading(false);
        setTotalPensiunLoading(false);
      }
    },
    []
  );

  const handleFiltersChange = useCallback(
    (newFilters: InternalPayrollFilterValues) => {
      console.log('Filters changed:', newFilters);
      setFilters(newFilters);
      fetchTotalPayrollDisbursedData(newFilters);
      fetchTotalPayrollHeadcountData(newFilters);
      fetchTotalDepartmentCountData(newFilters);
      fetchBPSJTKKesehatanPensiunData(newFilters);
    },
    [fetchTotalPayrollDisbursedData, fetchTotalPayrollHeadcountData, fetchTotalDepartmentCountData, fetchBPSJTKKesehatanPensiunData]
  );

  // Initial data fetch when component mounts and filters are initialized
  useEffect(() => {
    // Only fetch data if month and year are set (after initialization)
    if (filters.month && filters.year) {
      fetchTotalPayrollDisbursedData(filters);
      fetchTotalPayrollHeadcountData(filters);
      fetchTotalDepartmentCountData(filters);
      fetchBPSJTKKesehatanPensiunData(filters);
    }
  }, [filters.month, filters.year, filters.department, filters.dept_code, filters.status_kontrak, filters.valdo_inc, fetchTotalPayrollDisbursedData, fetchTotalPayrollHeadcountData, fetchTotalDepartmentCountData, fetchBPSJTKKesehatanPensiunData]); // Depend on month, year, department, dept_code, status_kontrak, and valdo_inc

  // Create summary tiles
  const createSummaryTiles = () => {
    const tiles = [];

    // Payroll Disbursed Tile
    tiles.push({
      title: 'Total Payroll Disbursed',
      value: totalPayrollDisbursedData?.total_payroll_disbursed || 0,
      isCurrency: true,
      isLoading: totalPayrollDisbursedLoading
    });

    // Total Headcount Tile
    tiles.push({
      title: 'Total Headcount',
      value: totalPayrollHeadcountData?.total_headcount || 0,
      isCurrency: false,
      isLoading: totalPayrollHeadcountLoading
    });

    // PKWTT Headcount Tile
    tiles.push({
      title: 'PKWTT Headcount',
      value: totalPayrollHeadcountData?.pkwtt_headcount || 0,
      isCurrency: false,
      isLoading: totalPayrollHeadcountLoading
    });

    // PKWT Headcount Tile
    tiles.push({
      title: 'PKWT Headcount',
      value: totalPayrollHeadcountData?.pkwt_headcount || 0,
      isCurrency: false,
      isLoading: totalPayrollHeadcountLoading
    });

    // Mitra Headcount Tile
    tiles.push({
      title: 'Mitra Headcount',
      value: totalPayrollHeadcountData?.mitra_headcount || 0,
      isCurrency: false,
      isLoading: totalPayrollHeadcountLoading
    });

    // Total Department Count Tile
    // Show N/A if a specific department is selected (since this endpoint doesn't support dept_id)
    if (filters.department) {
      tiles.push({
        title: 'Total Department Count',
        value: 'N/A',
        isCurrency: false,
        isLoading: false
      });
    } else {
      tiles.push({
        title: 'Total Department Count',
        value: totalDepartmentCountData?.total_department_count || 0,
        isCurrency: false,
        isLoading: totalDepartmentCountLoading
      });
    }

    return tiles;
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

        {/* Filters */}
        <Box mb={3}>
          <InternalPayrollFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </Box>

        {/* Summary Tiles */}
        {(filters.month && filters.year) ? (
          <>
            <Box mb={3}>
              <SummaryTiles tiles={createSummaryTiles()} md={4} />
            </Box>

            {/* Monthly Chart */}
            <Box mb={3}>
              <InternalPayrollMonthlyChart
                filters={{
                  month: filters.month,
                  year: filters.year,
                  department: filters.department,
                  dept_code: filters.dept_code,
                  status_kontrak: filters.status_kontrak,
                  valdo_inc: filters.valdo_inc
                }}
              />
            </Box>

            {/* BPSJTK, Kesehatan, Pensiun Summary */}
            <Box mb={3}>
              <SummaryTiles 
                tiles={[
                  {
                    title: 'Total BPJSTK Company',
                    value: totalBPSJTKData?.total_bpsjtk || 0,
                    isCurrency: true,
                    isLoading: totalBPSJTKLoading
                  },
                  {
                    title: 'Total BPJS Kesehatan Company',
                    value: totalKesehatanData?.total_kesehatan || 0,
                    isCurrency: true,
                    isLoading: totalKesehatanLoading
                  },
                  {
                    title: 'Total BPJS Pensiun Company',
                    value: totalPensiunData?.total_pensiun || 0,
                    isCurrency: true,
                    isLoading: totalPensiunLoading
                  }
                ]} 
                md={4} 
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
              Please select month and year to view data
            </Typography>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default InternalPayrollDashboard;
