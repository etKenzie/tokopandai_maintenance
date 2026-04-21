'use client';

import { Download as DownloadIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import * as XLSX from 'xlsx';
import { ClientSummary } from '../../api/loan/LoanSlice';

interface ClientDelinquencyTableProps {
  data: ClientSummary[];
  loading: boolean;
  error: string | null;
}

const ClientDelinquencyTable = ({
  data,
  loading,
  error
}: ClientDelinquencyTableProps) => {


  // Filter out clients with 0 delinquency rate and 0 unrecovered payment, then sort by total_unrecovered_payment in descending order
  const sortedData = [...data]
    .filter(client => client.delinquency_rate > 0 || client.total_unrecovered_payment > 0)
    .sort((a, b) => {
      return b.total_unrecovered_payment - a.total_unrecovered_payment;
    });



  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const prepareDataForExport = (data: ClientSummary[]) => {
    return data.map((item, index) => ({
      'Rank': index + 1,
      'Sourced To': item.sourced_to,
      'Project': item.project,
      'Delinquent Requests': item.delinquent_requests,
      'Delinquency Rate': formatPercentage(item.delinquency_rate),
      'Total Unrecovered Payment': formatCurrency(item.total_unrecovered_payment),
    }));
  };

  const handleExcelExport = () => {
    if (!data.length) return;

    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') return;

    const exportData = prepareDataForExport(sortedData);
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 8 },  // Rank
      { wch: 35 }, // Sourced To
      { wch: 25 }, // Project
      { wch: 20 }, // Delinquent Requests
      { wch: 18 }, // Delinquency Rate
      { wch: 25 }, // Total Unrecovered Payment
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ClientDelinquency');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-by-highest-delinquency.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Clients by Highest Delinquency</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExcelExport}
          disabled={sortedData.length === 0}
          size="small"
        >
          Export Excel
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ height: '350px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sourced To</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Delinquent Requests</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Delinquency Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Unrecovered Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData
                .map((row, index) => (
                  <TableRow key={`${row.sourced_to}-${row.project}`} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>{row.sourced_to}</TableCell>
                    <TableCell>{row.project}</TableCell>
                                         <TableCell align="right" sx={{ 
                       fontWeight: row.delinquency_rate > 0.002 ? 'bold' : 'normal',
                       color: row.delinquency_rate > 0.002 ? 'error.main' : 'inherit'
                     }}>
                       {row.delinquent_requests}
                     </TableCell>
                     <TableCell align="right" sx={{ 
                       fontWeight: row.delinquency_rate > 0.002 ? 'bold' : 'normal',
                       color: row.delinquency_rate > 0.002 ? 'error.main' : 'inherit'
                     }}>
                       {formatPercentage(row.delinquency_rate)}
                     </TableCell>
                     <TableCell align="right" sx={{ 
                       fontWeight: row.delinquency_rate > 0.002 ? 'bold' : 'normal',
                       color: row.delinquency_rate > 0.002 ? 'error.main' : 'inherit'
                     }}>
                       {formatCurrency(row.total_unrecovered_payment)}
                     </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClientDelinquencyTable;
