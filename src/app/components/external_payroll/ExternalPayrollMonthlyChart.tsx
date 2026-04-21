'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ExternalPayrollMonthlyResponse,
  fetchExternalPayrollMonthly
} from '../../api/external_payroll/ExternalPayrollSlice';
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ExternalPayrollMonthlyChartProps {
  filters: {
    month: string;
    year: string;
    status_kontrak?: string;
  };
}

type ChartType = 'disbursed' | 'headcount';

const ExternalPayrollMonthlyChart = ({ filters }: ExternalPayrollMonthlyChartProps) => {
  const [chartData, setChartData] = useState<ExternalPayrollMonthlyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('disbursed');
  const [startMonthYear, setStartMonthYear] = useState<string>('');
  const [endMonthYear, setEndMonthYear] = useState<string>('');
  const theme = useTheme();

  // Generate month-year options (Month YYYY format like "March 2025")
  const generateMonthYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options: { value: string; label: string }[] = [];
    
    // Generate for current year and previous year
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = currentYear - yearOffset;
      for (let month = 1; month <= 12; month++) {
        const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
        const monthNum = month.toString().padStart(2, '0');
        const value = `${monthNum}-${year}`;
        const label = `${monthName} ${year}`;
        options.push({ value, label });
      }
    }
    
    return options.reverse(); // Most recent first
  };

  const monthYearOptions = generateMonthYearOptions();

  // Initialize date range based on filters
  useEffect(() => {
    if (filters.month && filters.year) {
      const selectedMonth = parseInt(filters.month);
      const selectedYear = parseInt(filters.year);

      // Calculate default date range: 6 months back from selected month
      let defaultStartMonth = selectedMonth - 6;
      let defaultStartYear = selectedYear;
      
      // Handle year boundary
      if (defaultStartMonth <= 0) {
        defaultStartMonth = 12 + defaultStartMonth;
        defaultStartYear = selectedYear - 1;
      }

      // Ensure start_month is at least 1
      if (defaultStartMonth < 1) {
        defaultStartMonth = 1;
        defaultStartYear = selectedYear - 1;
      }

      const defaultStartValue = `${defaultStartMonth.toString().padStart(2, '0')}-${defaultStartYear}`;
      const endValue = `${filters.month}-${filters.year}`;

      // Only set if not already set (to preserve user's manual selection)
      if (!startMonthYear && !endMonthYear) {
        setStartMonthYear(defaultStartValue);
        setEndMonthYear(endValue);
      } else {
        // Update end month/year if filter changed
        const currentEndValue = `${filters.month}-${filters.year}`;
        if (endMonthYear !== currentEndValue) {
          setEndMonthYear(currentEndValue);
          // Recalculate start if end changed from filter
          setStartMonthYear(defaultStartValue);
        }
      }
    }
  }, [filters.month, filters.year]);

  const fetchChartData = useCallback(async () => {
    if (!startMonthYear || !endMonthYear) return;

    setLoading(true);
    try {
      // startMonthYear and endMonthYear are already in "MM-YYYY" format
      const params: any = {
        start_month: startMonthYear,
        end_month: endMonthYear,
      };
      
      // Add status_kontrak if provided
      if (filters.status_kontrak) {
        params.status_kontrak = parseInt(filters.status_kontrak);
      }

      const response = await fetchExternalPayrollMonthly(params);
      setChartData(response);
    } catch (err) {
      console.error('Failed to fetch monthly chart data:', err);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [startMonthYear, endMonthYear, filters.status_kontrak]);

  useEffect(() => {
    if (startMonthYear && endMonthYear) {
      fetchChartData();
    }
  }, [startMonthYear, endMonthYear, filters.status_kontrak, fetchChartData]);

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType);
  };

  const handleStartMonthYearChange = (event: SelectChangeEvent<string>) => {
    setStartMonthYear(event.target.value);
  };

  const handleEndMonthYearChange = (event: SelectChangeEvent<string>) => {
    setEndMonthYear(event.target.value);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!chartData?.summaries) return { categories: [], series: [] };

    // Sort months chronologically (Month Year format like "August 2025")
    const months = Object.keys(chartData.summaries).sort((a, b) => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');

      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;

      const monthIndexA = monthNames.indexOf(monthA);
      const monthIndexB = monthNames.indexOf(monthB);

      return monthIndexA - monthIndexB;
    });

    const categories = months;

    let series: any[] = [];

    if (chartType === 'disbursed') {
      series = [
        {
          name: 'Total Disbursed',
          data: months.map(month => chartData.summaries[month].total_disbursed)
        }
      ];
    } else if (chartType === 'headcount') {
      series = [
        {
          name: 'Total Headcount',
          data: months.map(month => chartData.summaries[month].total_headcount)
        },
        {
          name: 'PKWTT Headcount',
          data: months.map(month => chartData.summaries[month].pkwtt_headcount)
        },
        {
          name: 'PKWT Headcount',
          data: months.map(month => chartData.summaries[month].pkwt_headcount)
        },
        {
          name: 'Mitra Headcount',
          data: months.map(month => chartData.summaries[month].mitra_headcount)
        }
      ];
    }

    return {
      categories,
      series
    };
  };

  const chartDataConfig = prepareChartData();

  const chartOptions: any = useMemo(() => ({
    chart: {
      type: 'line',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: chartType === 'disbursed' 
      ? [theme.palette.primary.main]
      : [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main
        ],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: chartType === 'headcount' ? 'bottom' : 'top',
      horizontalAlign: chartType === 'headcount' ? 'center' : 'right',
      floating: false,
      fontSize: '12px',
      offsetX: 0,
      offsetY: chartType === 'headcount' ? 0 : -10,
      itemMargin: {
        horizontal: chartType === 'headcount' ? 10 : 5,
        vertical: chartType === 'headcount' ? 5 : 0,
      },
      labels: {
        colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
      },
    },
    grid: {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: chartDataConfig.categories,
      labels: {
        style: {
          colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        },
        formatter: (value: number) => {
          if (chartType === 'disbursed') {
            // Format as currency
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          } else {
            // Format as number
            return value.toLocaleString('en-US');
          }
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: (value: number) => {
          if (chartType === 'disbursed') {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          } else {
            return value.toLocaleString('en-US');
          }
        },
      },
    },
  }), [chartType, chartDataConfig.categories, theme.palette.mode, theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main]);

  return (
    <Card>
      <CardContent>
        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ margin: 0 }}>
            Monthly Trends
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={handleChartTypeChange}
              >
                <MenuItem value="disbursed">Total Disbursed</MenuItem>
                <MenuItem value="headcount">Headcount</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Start Month</InputLabel>
              <Select
                value={startMonthYear}
                label="Start Month"
                onChange={handleStartMonthYearChange}
              >
                {monthYearOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>End Month</InputLabel>
              <Select
                value={endMonthYear}
                label="End Month"
                onChange={handleEndMonthYearChange}
              >
                {monthYearOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ height: chartType === 'headcount' ? 480 : 400, position: 'relative', minHeight: chartType === 'headcount' ? 480 : 400, overflow: 'visible', pb: chartType === 'headcount' ? 3 : 0 }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : chartData?.summaries && Object.keys(chartData.summaries).length > 0 ? (
            <ReactApexChart
              key={`chart-${chartType}`}
              options={chartOptions}
              series={chartDataConfig.series}
              type="line"
              height={chartType === 'headcount' ? 380 : 350}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <Typography color="textSecondary">No data available for the selected date range</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(ExternalPayrollMonthlyChart);

