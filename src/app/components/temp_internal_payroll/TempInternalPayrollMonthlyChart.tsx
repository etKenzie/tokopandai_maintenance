'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchTempInternalPayrollMonthly,
  TempInternalPayrollMonthlyResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TempInternalPayrollMonthlyChartProps {
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

const TempInternalPayrollMonthlyChart = ({ filters }: TempInternalPayrollMonthlyChartProps) => {
  const [chartData, setChartData] = useState<TempInternalPayrollMonthlyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchChartData = useCallback(async () => {
    if (!filters.start_date || !filters.end_date) return;
    setLoading(true);
    try {
      const response = await fetchTempInternalPayrollMonthly({
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
    const series = [
      { name: 'Nilai Invoice', data: months.map((m) => chartData.summaries[m].nilai_invoice) },
      { name: 'Jumlah Invoice', data: months.map((m) => chartData.summaries[m].jumlah_invoice) },
    ];
    return { categories, series };
  };

  const chartDataConfig = prepareChartData();

  const chartOptions: any = useMemo(
    () => ({
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      colors: [theme.palette.primary.main, theme.palette.secondary.main],
      stroke: { curve: 'smooth', width: 3 },
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
      yaxis: [
        {
          title: { text: 'Nilai Invoice', style: { color: theme.palette.primary.main } },
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
          axisTicks: { show: true },
          axisBorder: { show: true },
        },
        {
          opposite: true,
          title: { text: 'Jumlah Invoice', style: { color: theme.palette.secondary.main } },
          labels: {
            style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
            formatter: (value: number) => value.toLocaleString('en-US'),
          },
          axisTicks: { show: true },
          axisBorder: { show: true },
        },
      ],
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        // Single formatter: array form maps by *visible* row order after legend toggles, so the
        // remaining line can get the wrong formatter (currency vs count) or undefined values.
        y: {
          formatter: (
            value: number | null | undefined,
            opts: { seriesIndex: number; w?: { globals?: { seriesNames?: string[] } } }
          ) => {
            const num = Number(value);
            if (!Number.isFinite(num)) return '—';
            const name = opts.w?.globals?.seriesNames?.[opts.seriesIndex] ?? '';
            if (name === 'Jumlah Invoice' || (name === '' && opts.seriesIndex === 1)) {
              return num.toLocaleString('en-US');
            }
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(num);
          },
        },
      },
    }),
    [chartDataConfig.categories, theme.palette.mode, theme.palette.primary.main, theme.palette.secondary.main]
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ margin: 0 }}>
            Revenue trend
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
              type="line"
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

export default React.memo(TempInternalPayrollMonthlyChart);
