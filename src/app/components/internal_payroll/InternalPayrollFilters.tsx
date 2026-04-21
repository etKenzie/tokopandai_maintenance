'use client';

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Department,
  fetchInternalPayrollFilters,
  INTERNAL_PAYROLL_DEPT_CODE_OPTIONS,
} from '../../api/internal_payroll/InternalPayrollSlice';

export interface InternalPayrollFilterValues {
  month: string;
  year: string;
  department: string; // org unit dept_id from API, empty for all
  dept_code: string; // td_karyawan.dept_code: 1–3 in UI, empty for all
  status_kontrak: string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA, empty for all
  valdo_inc: string; // 1=VI, 2=VSDM, empty for all (internal payroll UI)
}

interface InternalPayrollFiltersProps {
  filters: InternalPayrollFilterValues;
  onFiltersChange: (filters: InternalPayrollFilterValues) => void;
}

const InternalPayrollFilters = ({ filters, onFiltersChange }: InternalPayrollFiltersProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to display department name in all capital letters
  const getDepartmentDisplayName = (dept: Department): string => {
    if (dept.dept_id === 0) {
      return 'VALDO';
    }
    // Display department name in all capital letters
    const deptName = dept.department_name || `Department ${dept.dept_id}`;
    return deptName.toUpperCase();
  };

  // Generate month options (01-12)
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: monthNum, label: monthName };
  });

  // Generate year options (current year - 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const fetchDepartmentFilters = async () => {
    setLoading(true);
    try {
      const response = await fetchInternalPayrollFilters({
        month: filters.month || undefined,
        year: filters.year || undefined,
      });
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to fetch department filters:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDepartmentFilters();
  }, []);

  // Refetch departments when month or year changes
  useEffect(() => {
    if (filters.month && filters.year) {
      fetchDepartmentFilters();
    }
  }, [filters.month, filters.year]);

  // Valdo Inc UI only allows VI/VSDM; clear legacy VSI/TOPAN if present
  useEffect(() => {
    if (filters.valdo_inc === '31' || filters.valdo_inc === '94') {
      onFiltersChange({ ...filters, valdo_inc: '' });
    }
  }, [filters, onFiltersChange]);

  // Segment UI omits Outsource (4); clear if present
  useEffect(() => {
    if (filters.dept_code === '4') {
      onFiltersChange({ ...filters, dept_code: '' });
    }
  }, [filters, onFiltersChange]);

  const handleFilterChange = (field: keyof InternalPayrollFilterValues) => (
    event: SelectChangeEvent<string>
  ) => {
    const newFilters = { ...filters, [field]: event.target.value };
    console.log('Filter changed in InternalPayrollFilters:', field, 'to', event.target.value);
    console.log('New filters:', newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Grid container spacing={1} sx={{ flexWrap: { md: 'nowrap' } }}>
      {/* Month Filter — narrow columns (1.5/12 each) */}
      <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Month</InputLabel>
          <Select
            value={filters.month}
            label="Month"
            onChange={handleFilterChange('month')}
            disabled={loading}
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
          <InputLabel>Year</InputLabel>
          <Select
            value={filters.year}
            label="Year"
            onChange={handleFilterChange('year')}
            disabled={loading}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Segment (td_karyawan.dept_code) — static options, not blocked by department list load */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Segment</InputLabel>
          <Select
            value={filters.dept_code}
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
          <InputLabel>Valdo Inc</InputLabel>
          <Select
            value={filters.valdo_inc}
            label="Valdo Inc"
            onChange={handleFilterChange('valdo_inc')}
            disabled={loading}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">VI</MenuItem>
            <MenuItem value="2">VSDM</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Department (dept_id from payroll filters API) */}
      <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Department</InputLabel>
          <Select
            value={filters.department}
            label="Department"
            onChange={handleFilterChange('department')}
            disabled={loading}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.dept_id} value={dept.dept_id.toString()}>
                {getDepartmentDisplayName(dept)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Contract Status Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Contract</InputLabel>
          <Select
            value={filters.status_kontrak}
            label="Contract"
            onChange={handleFilterChange('status_kontrak')}
            disabled={loading}
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

export default InternalPayrollFilters;
