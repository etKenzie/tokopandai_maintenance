'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchTotalBPSJTK,
  fetchTotalKesehatan,
  fetchTotalPayrollDisbursed,
  fetchTotalPayrollHeadcount,
  fetchTotalPensiun,
  TotalBPSJTKResponse,
  TotalKesehatanResponse,
  TotalPayrollDisbursedResponse,
  TotalPayrollHeadcountResponse,
  TotalPensiunResponse
} from '../../api/external_payroll/ExternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import SummaryTiles from '../shared/SummaryTiles';
import ExternalPayrollFilters, { ExternalPayrollFilterValues } from './ExternalPayrollFilters';
import ExternalPayrollMonthlyChart from './ExternalPayrollMonthlyChart';

interface ExternalPayrollDashboardProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const ExternalPayrollDashboard: React.FC<ExternalPayrollDashboardProps> = ({
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
  const [filters, setFilters] = useState<ExternalPayrollFilterValues>({
    month: '',
    year: '',
    status_kontrak: ''
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
    async (currentFilters: ExternalPayrollFilterValues) => {
      setTotalPayrollDisbursedLoading(true);
      try {
        // Only fetch if we have month and year (required)
        if (currentFilters.month && currentFilters.year) {
          const params: any = {
            month: currentFilters.month,
            year: currentFilters.year,
          };
          
          // Add status_kontrak if provided
          if (currentFilters.status_kontrak) {
            params.status_kontrak = parseInt(currentFilters.status_kontrak);
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
    async (currentFilters: ExternalPayrollFilterValues) => {
      setTotalPayrollHeadcountLoading(true);
      try {
        // Only fetch if we have month and year (required)
        if (currentFilters.month && currentFilters.year) {
          const params: any = {
            month: currentFilters.month,
            year: currentFilters.year,
          };
          
          if (currentFilters.status_kontrak) {
            params.status_kontrak = parseInt(currentFilters.status_kontrak);
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

  const fetchBPSJTKKesehatanPensiunData = useCallback(
    async (currentFilters: ExternalPayrollFilterValues) => {
      if (!currentFilters.month || !currentFilters.year) return;

      setTotalBPSJTKLoading(true);
      setTotalKesehatanLoading(true);
      setTotalPensiunLoading(true);
      
      try {
        const params: any = {
          month: currentFilters.month,
          year: currentFilters.year,
        };
        
        // Add status_kontrak if provided
        if (currentFilters.status_kontrak) {
          params.status_kontrak = parseInt(currentFilters.status_kontrak);
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
    (newFilters: ExternalPayrollFilterValues) => {
      console.log('Filters changed:', newFilters);
      setFilters(newFilters);
      fetchTotalPayrollDisbursedData(newFilters);
      fetchTotalPayrollHeadcountData(newFilters);
      fetchBPSJTKKesehatanPensiunData(newFilters);
    },
    [fetchTotalPayrollDisbursedData, fetchTotalPayrollHeadcountData, fetchBPSJTKKesehatanPensiunData]
  );

  // Initial data fetch when component mounts and filters are initialized
  useEffect(() => {
    // Only fetch data if month and year are set (after initialization)
    if (filters.month && filters.year) {
      fetchTotalPayrollDisbursedData(filters);
      fetchTotalPayrollHeadcountData(filters);
      fetchBPSJTKKesehatanPensiunData(filters);
    }
  }, [filters.month, filters.year, filters.status_kontrak, fetchTotalPayrollDisbursedData, fetchTotalPayrollHeadcountData, fetchBPSJTKKesehatanPensiunData]);

  // Create summary tiles
  const createSummaryTiles = () => {
    const tiles = [];

    // Payroll Disbursed Tile - Full width first row
    tiles.push({
      title: 'Total Payroll Disbursed',
      value: totalPayrollDisbursedData?.total_payroll_disbursed || 0,
      isCurrency: true,
      isLoading: totalPayrollDisbursedLoading,
      mdSize: 6
    });

    // Total Headcount Tile - Full width first row
    tiles.push({
      title: 'Total Headcount',
      value: totalPayrollHeadcountData?.total_headcount || 0,
      isCurrency: false,
      isLoading: totalPayrollHeadcountLoading,
      mdSize: 6
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
          <ExternalPayrollFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </Box>

        {/* Summary Tiles */}
        {(filters.month && filters.year) ? (
          <>
            <Box mb={3}>
              <SummaryTiles tiles={createSummaryTiles()} md={4} />
            </Box>

            {/* Monthly Chart */}
            <Box mb={3}>
              <ExternalPayrollMonthlyChart
                filters={{
                  month: filters.month,
                  year: filters.year,
                  status_kontrak: filters.status_kontrak
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

export default ExternalPayrollDashboard;

