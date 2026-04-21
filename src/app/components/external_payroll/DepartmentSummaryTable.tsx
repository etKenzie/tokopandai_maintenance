'use client';

import { Download as DownloadIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { DepartmentSummary, fetchDepartmentSummary } from '../../api/external_payroll/ExternalPayrollSlice';

type Order = 'asc' | 'desc';
type SortableField = keyof DepartmentSummary;

interface HeadCell {
  id: SortableField;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'dept_id', label: 'Dept ID', numeric: true },
  { id: 'department_name', label: 'Department', numeric: false },
  { id: 'cost_owner', label: 'Cost Owner', numeric: false },
  { id: 'total_headcount', label: 'Total Headcount', numeric: true },
  { id: 'pkwtt_headcount', label: 'PKWTT', numeric: true },
  { id: 'pkwt_headcount', label: 'PKWT', numeric: true },
  { id: 'mitra_headcount', label: 'Mitra', numeric: true },
  { id: 'distribution_ratio', label: 'Distribution Ratio', numeric: true },
  { id: 'total_disbursed', label: 'Total Disbursed', numeric: true },
];

interface DepartmentSummaryTableProps {
  filters: {
    month: string;
    year: string;
    status_kontrak?: string;
  };
  title?: string;
}

const DepartmentSummaryTable = ({
  filters,
  title = 'Department Summary'
}: DepartmentSummaryTableProps) => {
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<SortableField>('total_disbursed');
  const [order, setOrder] = useState<Order>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDepartmentData = async () => {
    if (!filters.month || !filters.year) return;

    setLoading(true);
    setError(null);
    try {
      const params: any = {
        month: filters.month,
        year: filters.year,
      };
      
      if (filters.status_kontrak) {
        params.status_kontrak = parseInt(filters.status_kontrak);
      }
      
      const response = await fetchDepartmentSummary(params);

      setDepartments(response.departments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch department summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.month && filters.year) {
      fetchDepartmentData();
    }
  }, [filters.month, filters.year, filters.status_kontrak]);

  const handleRequestSort = (property: SortableField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const searchFields = (dept: DepartmentSummary, query: string): boolean => {
    if (!query) return true;

    let deptName = dept.dept_id === 0 ? 'Valdo' : (dept.department_name || `Department ${dept.dept_id}`);
    // Remove "Internal - " prefix if present
    if (deptName.startsWith('Internal - ')) {
      deptName = deptName.substring(11);
    }
    const searchableFields = [
      dept.dept_id.toString(),
      deptName,
      dept.cost_owner,
      dept.total_headcount.toString(),
      dept.pkwtt_headcount.toString(),
      dept.pkwt_headcount.toString(),
      dept.mitra_headcount.toString(),
      dept.distribution_ratio.toString(),
      dept.total_disbursed.toString(),
    ];

    const lowerQuery = query.toLowerCase();
    return searchableFields.some((field) =>
      field.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredDepartments = departments.filter((dept) => {
    if (searchQuery) {
      return searchFields(dept, searchQuery);
    }
    return true;
  });

  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    let aValue: any = a[orderBy];
    let bValue: any = b[orderBy];

    if (orderBy === 'dept_id' || orderBy === 'total_headcount' || orderBy === 'pkwtt_headcount' || 
        orderBy === 'pkwt_headcount' || orderBy === 'mitra_headcount' || orderBy === 'distribution_ratio' || 
        orderBy === 'total_disbursed') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    }
  });

  const totalHeadcount = filteredDepartments.reduce((sum, d) => sum + d.total_headcount, 0);
  const totalDisbursed = filteredDepartments.reduce((sum, d) => sum + d.total_disbursed, 0);

  const prepareDataForExport = (departments: DepartmentSummary[]) => {
    return departments.map((d) => {
      let deptName = d.dept_id === 0 ? 'Valdo' : (d.department_name || `Department ${d.dept_id}`);
      // Remove "Internal - " prefix if present
      if (deptName.startsWith('Internal - ')) {
        deptName = deptName.substring(11);
      }
      return {
        'Dept ID': d.dept_id,
        'Department': deptName,
        'Cost Owner': d.cost_owner,
        'Total Headcount': d.total_headcount,
        'PKWTT Headcount': d.pkwtt_headcount,
        'PKWT Headcount': d.pkwt_headcount,
        'Mitra Headcount': d.mitra_headcount,
        'Distribution Ratio': `${(d.distribution_ratio * 100).toFixed(2)}%`,
        'Total Disbursed': d.total_disbursed,
      };
    });
  };

  const handleExcelExport = () => {
    if (!departments.length) return;

    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') return;

    const data = prepareDataForExport(filteredDepartments);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = [
      { wch: 10 }, // Dept ID
      { wch: 35 }, // Department
      { wch: 25 }, // Cost Owner
      { wch: 15 }, // Total Headcount
      { wch: 12 }, // PKWTT
      { wch: 12 }, // PKWT
      { wch: 12 }, // Mitra
      { wch: 18 }, // Distribution Ratio
      { wch: 18 }, // Total Disbursed
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Department Summary');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `department-summary-${filters.month}-${filters.year}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (ratio: number) => {
    return `${(ratio * 100).toFixed(2)}%`;
  };

  const getDepartmentName = (dept: DepartmentSummary) => {
    if (dept.dept_id === 0) {
      return 'Valdo';
    }
    const deptName = dept.department_name || `Department ${dept.dept_id}`;
    // Remove "Internal - " prefix if present
    return deptName.startsWith('Internal - ') ? deptName.substring(11) : deptName;
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDepartmentData}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExcelExport}
              disabled={filteredDepartments.length === 0}
            >
              Export Excel
            </Button>
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box mb={3} sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          <Box sx={{ textAlign: 'center', minWidth: '200px' }}>
            <Typography variant="h3" color="primary" fontWeight="bold" mb={1}>
              {formatCurrency(totalDisbursed)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Disbursed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '200px' }}>
            <Typography variant="h3" color="secondary" fontWeight="bold" mb={1}>
              {totalHeadcount}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Headcount
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '200px' }}>
            <Typography variant="h3" color="info.main" fontWeight="bold" mb={1}>
              {filteredDepartments.length}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Departments
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : sortedDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No department data found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedDepartments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={`${row.dept_id}-${index}`} hover>
                      <TableCell align="right">{row.dept_id}</TableCell>
                      <TableCell>{getDepartmentName(row)}</TableCell>
                      <TableCell>{row.cost_owner}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {row.total_headcount}
                      </TableCell>
                      <TableCell align="right">{row.pkwtt_headcount}</TableCell>
                      <TableCell align="right">{row.pkwt_headcount}</TableCell>
                      <TableCell align="right">{row.mitra_headcount}</TableCell>
                      <TableCell align="right">{formatPercentage(row.distribution_ratio)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatCurrency(row.total_disbursed)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredDepartments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default DepartmentSummaryTable;
