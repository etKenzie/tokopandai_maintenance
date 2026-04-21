'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchTempInternalPayrollPaidUnpaid,
  TempInternalPayrollPaidUnpaidResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TempInternalPayrollPaidUnpaidChartProps {
  filters: {
    start_date: string;
    end_date: string;
    employer?: string;
    productType?: string;
    customerSegment?: string;
    sourcedTo?: string;
    project?: string;
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TempInternalPayrollPaidUnpaidChart = ({ filters }: TempInternalPayrollPaidUnpaidChartProps) => {
  const [chartData, setChartData] = useState<TempInternalPayrollPaidUnpaidResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchChartData = useCallback(async () => {
    if (!filters.start_date || !filters.end_date) return;
    setLoading(true);
    try {
      const response = await fetchTempInternalPayrollPaidUnpaid({
        start_date: filters.start_date,
        end_date: filters.end_date,
        employer: filters.employer,
        product_type: filters.productType,
        customer_segment: filters.customerSegment,
        sourced_to: filters.sourcedTo ?? '0',
        project: filters.project ?? '0',
      });
      setChartData(response);
    } catch {
      setChartData({ status: 'ok', summaries: {} });
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
    fetchChartData();
  }, [fetchChartData]);

  const prepareChartData = () => {
    if (!chartData?.summaries) return { categories: [], series: [] };
    const months = Object.keys(chartData.summaries).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      return MONTH_NAMES.indexOf(monthA) - MONTH_NAMES.indexOf(monthB);
    });
    const categories = months;
    // Paid first (bottom), Unpaid second (top) — stacked vertically
    const series = [
      { name: 'Paid', data: months.map((m) => chartData.summaries[m].paid) },
      { name: 'Unpaid', data: months.map((m) => chartData.summaries[m].unpaid) },
    ];
    return { categories, series };
  };

  const chartDataConfig = prepareChartData();

  const chartOptions: any = useMemo(
    () => ({
      chart: {
        type: 'bar',
        stacked: true,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '65%',
          stacked: true,
          borderRadius: 0,
        },
      },
      colors: [theme.palette.success.main, theme.palette.error.main], // Paid (bottom), Unpaid (top)
      stroke: { show: true, width: 1, colors: ['transparent'] },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        labels: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
      },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: chartDataConfig.categories,
        labels: { style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' } },
        axisBorder: { show: false },
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
    [
      chartDataConfig.categories,
      theme.palette.mode,
      theme.palette.success.main,
      theme.palette.error.main,
    ]
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ margin: 0 }}>
            Invoice Trends — Paid vs Unpaid
          </Typography>
        </Box>
        <Box sx={{ height: 400, position: 'relative', minHeight: 400, overflow: 'visible' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={24} />
            </Box>
          ) : chartData?.summaries && Object.keys(chartData.summaries).length > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={chartDataConfig.series}
              type="bar"
              height={350}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">No data for the selected period</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(TempInternalPayrollPaidUnpaidChart);
