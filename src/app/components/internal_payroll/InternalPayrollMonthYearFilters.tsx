'use client';

import {
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent
} from '@mui/material';
import { useEffect } from 'react';
import { INTERNAL_PAYROLL_DEPT_CODE_OPTIONS } from '../../api/internal_payroll/InternalPayrollSlice';

export interface InternalPayrollMonthYearFilterValues {
  month: string;
  year: string;
  dept_code?: string;
  status_kontrak?: string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA, empty for all
  valdo_inc?: string; // 1=VI, 2=VSDM, empty for all (internal payroll UI)
}

interface InternalPayrollMonthYearFiltersProps {
  filters: InternalPayrollMonthYearFilterValues;
  onFiltersChange: (filters: InternalPayrollMonthYearFilterValues) => void;
}

const InternalPayrollMonthYearFilters = ({ filters, onFiltersChange }: InternalPayrollMonthYearFiltersProps) => {
  // Generate month options (01-12)
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: monthNum, label: monthName };
  });

  // Generate year options (current year - 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleFilterChange = (field: keyof InternalPayrollMonthYearFilterValues) => (
    event: SelectChangeEvent<string>
  ) => {
    const newFilters = { ...filters, [field]: event.target.value };
    onFiltersChange(newFilters);
  };

  useEffect(() => {
    const v = filters.valdo_inc ?? '';
    if (v === '31' || v === '94') {
      onFiltersChange({ ...filters, valdo_inc: '' });
    }
  }, [filters, onFiltersChange]);

  useEffect(() => {
    if (filters.dept_code === '4') {
      onFiltersChange({ ...filters, dept_code: '' });
    }
  }, [filters, onFiltersChange]);

  return (
    <Grid container spacing={1} sx={{ flexWrap: { md: 'nowrap' } }}>
      {/* Month Filter — narrow */}
      <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink={!!filters.month}>Month</InputLabel>
          <Select
            value={filters.month}
            label="Month"
            onChange={handleFilterChange('month')}
          >
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Year Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink={!!filters.year}>Year</InputLabel>
          <Select
            value={filters.year}
            label="Year"
            onChange={handleFilterChange('year')}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Segment (td_karyawan.dept_code) */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink={!!filters.dept_code}>Segment</InputLabel>
          <Select
            value={filters.dept_code || ''}
            label="Segment"
            onChange={handleFilterChange('dept_code')}
          >
            <MenuItem value="">All</MenuItem>
            {INTERNAL_PAYROLL_DEPT_CODE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Valdo Inc Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink={!!filters.valdo_inc}>Valdo Inc</InputLabel>
          <Select
            value={filters.valdo_inc || ''}
            label="Valdo Inc"
            onChange={handleFilterChange('valdo_inc')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">VI</MenuItem>
            <MenuItem value="2">VSDM</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Contract Status Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 5 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink={!!filters.status_kontrak}>Contract</InputLabel>
          <Select
            value={filters.status_kontrak || ''}
            label="Contract"
            onChange={handleFilterChange('status_kontrak')}
          >
            <MenuItem value="">All Contracts</MenuItem>
            <MenuItem value="0">DW</MenuItem>
            <MenuItem value="1">PKWTT</MenuItem>
            <MenuItem value="2">PKWT</MenuItem>
            <MenuItem value="3">MITRA</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default InternalPayrollMonthYearFilters;
