'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchTempInternalPayrollReceivableRisk,
  RECEIVABLE_RISK_BUCKETS,
  TempInternalPayrollReceivableRiskResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TempInternalPayrollReceivableRiskChartProps {
  filters: {
    start_date?: string;
    end_date?: string;
    employer?: string;
    productType?: string;
    customerSegment?: string;
    sourcedTo?: string;
    project?: string;
  };
}

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TempInternalPayrollReceivableRiskChart = ({ filters }: TempInternalPayrollReceivableRiskChartProps) => {
  const [chartData, setChartData] = useState<TempInternalPayrollReceivableRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchData = useCallback(async () => {
    const t = todayYmd();
    const start_date = (filters.start_date ?? '').trim() || t;
    const end_date = (filters.end_date ?? '').trim() || t;
    setLoading(true);
    try {
      const response = await fetchTempInternalPayrollReceivableRisk({
        start_date,
        end_date,
        employer: filters.employer,
        product_type: filters.productType,
        customer_segment: filters.customerSegment,
        sourced_to: filters.sourcedTo ?? '0',
        project: filters.project ?? '0',
      });
      setChartData(response);
    } catch {
      setChartData({
        status: 'ok',
        start_date,
        end_date,
        buckets: Object.fromEntries(RECEIVABLE_RISK_BUCKETS.map((k) => [k, 0])),
      });
    } finally {
      setLoading(false);
    }
  }, [
    filters.start_date,
    filters.end_date,
    filters.employer,
    filters.productType,
    filters.customerSegment,
    filters.sourcedTo,
    filters.project,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = [...RECEIVABLE_RISK_BUCKETS];
  const categoryLabels = categories.map((k) => (k === 'current' ? 'Current' : k));
  const seriesData = chartData?.buckets
    ? categories.map((key) => chartData.buckets[key] ?? 0)
    : categories.map(() => 0);

  const chartOptions: any = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '65%',
          borderRadius: 0,
        },
      },
      colors: [theme.palette.primary.main],
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: categoryLabels,
        labels: { style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' } },
        axisBorder: { show: false },
        title: { text: 'Aging (Current / Days overdue)' },
      },
      yaxis: {
        labels: {
          style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
          formatter: (value: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
        },
      },
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (value: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
        },
      },
    }),
    [theme.palette.mode, theme.palette.primary.main]
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Accounts receivable
        </Typography>
        <Box sx={{ height: 380, position: 'relative', minHeight: 380 }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'Total Invoice', data: seriesData }]}
              type="bar"
              height={320}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(TempInternalPayrollReceivableRiskChart);
