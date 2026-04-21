'use client';

import {
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent
} from '@mui/material';

export interface ExternalPayrollMonthYearFilterValues {
  month: string;
  year: string;
  status_kontrak?: string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA, empty for all
}

interface ExternalPayrollMonthYearFiltersProps {
  filters: ExternalPayrollMonthYearFilterValues;
  onFiltersChange: (filters: ExternalPayrollMonthYearFilterValues) => void;
}

const ExternalPayrollMonthYearFilters = ({ filters, onFiltersChange }: ExternalPayrollMonthYearFiltersProps) => {
  // Generate month options (01-12)
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: monthNum, label: monthName };
  });

  // Generate year options (current year - 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleFilterChange = (field: keyof ExternalPayrollMonthYearFilterValues) => (
    event: SelectChangeEvent<string>
  ) => {
    const newFilters = { ...filters, [field]: event.target.value };
    onFiltersChange(newFilters);
  };

  return (
    <Grid container spacing={2}>
      {/* Month Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

      {/* Contract Status Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

export default ExternalPayrollMonthYearFilters;

