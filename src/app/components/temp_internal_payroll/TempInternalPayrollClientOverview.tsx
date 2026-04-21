'use client';

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  fetchClientInvoiceTable,
  fetchClientOutstandingTable,
  fetchClientOverdueTable,
  fetchProjectFilterOptions,
  fetchSourcedToFilterOptions,
  firstDayOfCalendarMonth,
  lastDayOfCalendarMonth,
  TempInternalPayrollClientRankingRow,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import ClientRankingTable from './ClientRankingTable';

const EMPLOYER_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'PT Valdo International' },
  { value: '2', label: 'PT Valdo Sumber Daya Mandiri' },
  { value: '94', label: 'PT Toko Pandai' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'BPO Bundling' },
  { value: '2', label: 'People' },
  { value: '3', label: 'Infra & Technology' },
  { value: '4', label: 'AkuMaju' },
];

const CUSTOMER_SEGMENT_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Non BFSI Logistic' },
  { value: '2', label: 'Non BFSI F&B' },
  { value: '3', label: 'BFSI Bank' },
  { value: '4', label: 'Non BFSI Others' },
  { value: '5', label: 'Non BFSI Distribution' },
  { value: '6', label: 'Non BFSI E-commerce' },
  { value: '7', label: 'BFSI Insurance' },
  { value: '8', label: 'BFSI Multi Finance' },
  { value: '9', label: 'BFSI Others' },
];


const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function TempInternalPayrollClientOverview() {
  const [byInvoice, setByInvoice] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOutstanding, setByOutstanding] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOverdue, setByOverdue] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [outstandingLoading, setOutstandingLoading] = useState(false);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [employer, setEmployer] = useState('0');
  const [productType, setProductType] = useState('0');
  const [customerSegment, setCustomerSegment] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');
  const [sourcedToOptions, setSourcedToOptions] = useState<Array<{ value: string; label: string }>>([
    { value: '0', label: 'All' },
  ]);
  const [projectOptions, setProjectOptions] = useState<Array<{ value: string; label: string }>>([
    { value: '0', label: 'All' },
  ]);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchOutstanding, setSearchOutstanding] = useState('');
  const [searchOverdue, setSearchOverdue] = useState('');
  const [debouncedSearchInvoice, setDebouncedSearchInvoice] = useState('');
  const [debouncedSearchOutstanding, setDebouncedSearchOutstanding] = useState('');
  const [debouncedSearchOverdue, setDebouncedSearchOverdue] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchInvoice(searchInvoice.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInvoice]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchOutstanding(searchOutstanding.trim()), 350);
    return () => clearTimeout(t);
  }, [searchOutstanding]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchOverdue(searchOverdue.trim()), 350);
    return () => clearTimeout(t);
  }, [searchOverdue]);

  useEffect(() => {
    let cancelled = false;
    fetchSourcedToFilterOptions({ employer })
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map((x) => ({ value: x.id_sourced_to, label: x.name }));
        setSourcedToOptions([{ value: '0', label: 'All' }, ...mapped]);
      })
      .catch(() => {
        if (!cancelled) setSourcedToOptions([{ value: '0', label: 'All' }]);
      });
    return () => {
      cancelled = true;
    };
  }, [employer]);

  useEffect(() => {
    let cancelled = false;
    fetchProjectFilterOptions({ employer, sourced_to: sourcedTo || '0' })
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map((x) => ({ value: x.id_project, label: x.name }));
        setProjectOptions([{ value: '0', label: 'All' }, ...mapped]);
      })
      .catch(() => {
        if (!cancelled) setProjectOptions([{ value: '0', label: 'All' }]);
      });
    return () => {
      cancelled = true;
    };
  }, [employer, sourcedTo]);

  useEffect(() => {
    const d = new Date();
    setMonth((d.getMonth() + 1).toString().padStart(2, '0'));
    setYear(d.getFullYear().toString());
  }, []);

  const clientFilters = {
    start_date: month && year ? firstDayOfCalendarMonth(month, year) : '',
    end_date: month && year ? lastDayOfCalendarMonth(month, year) : '',
    employer,
    product_type: productType,
    customer_segment: customerSegment,
    sourced_to: sourcedTo || '0',
    project: project || '0',
  };

  useEffect(() => {
    if (!month || !year) return;
    let cancelled = false;
    setInvoiceLoading(true);
    fetchClientInvoiceTable(clientFilters, debouncedSearchInvoice)
      .then((rows) => {
        if (!cancelled) setByInvoice(rows);
      })
      .catch(() => {
        if (!cancelled) setByInvoice([]);
      })
      .finally(() => {
        if (!cancelled) setInvoiceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, employer, productType, customerSegment, sourcedTo, project, debouncedSearchInvoice]);

  useEffect(() => {
    if (!month || !year) return;
    let cancelled = false;
    setOutstandingLoading(true);
    fetchClientOutstandingTable(clientFilters, debouncedSearchOutstanding)
      .then((rows) => {
        if (!cancelled) setByOutstanding(rows);
      })
      .catch(() => {
        if (!cancelled) setByOutstanding([]);
      })
      .finally(() => {
        if (!cancelled) setOutstandingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, employer, productType, customerSegment, sourcedTo, project, debouncedSearchOutstanding]);

  useEffect(() => {
    if (!month || !year) return;
    let cancelled = false;
    setOverdueLoading(true);
    fetchClientOverdueTable(clientFilters, debouncedSearchOverdue)
      .then((rows) => {
        if (!cancelled) setByOverdue(rows);
      })
      .catch(() => {
        if (!cancelled) setByOverdue([]);
      })
      .finally(() => {
        if (!cancelled) setOverdueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, employer, productType, customerSegment, sourcedTo, project, debouncedSearchOverdue]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    const name = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: num, label: name };
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  return (
    <PageContainer title="Client" description="Clients ranked by invoice metrics">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Client
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Clients ranked by Invoice, Outstanding Invoice, and Overdue Invoice.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e: SelectChangeEvent<string>) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e: SelectChangeEvent<string>) => setYear(e.target.value)}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employer</InputLabel>
              <Select value={employer} label="Employer" onChange={(e: SelectChangeEvent<string>) => setEmployer(e.target.value)}>
                {EMPLOYER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select value={productType} label="Product Type" onChange={(e: SelectChangeEvent<string>) => setProductType(e.target.value)}>
                {PRODUCT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Customer Segment</InputLabel>
              <Select value={customerSegment} label="Customer Segment" onChange={(e: SelectChangeEvent<string>) => setCustomerSegment(e.target.value)}>
                {CUSTOMER_SEGMENT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sourced To</InputLabel>
              <Select value={sourcedTo} label="Sourced To" onChange={(e: SelectChangeEvent<string>) => setSourcedTo(e.target.value)}>
                {sourcedToOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Project</InputLabel>
              <Select value={project} label="Project" onChange={(e: SelectChangeEvent<string>) => setProject(e.target.value)}>
                {projectOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {month && year ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <ClientRankingTable
                data={byInvoice}
                loading={invoiceLoading}
                error={null}
                title="Invoice"
                sortBy="total_invoice"
                displayFieldLabel="Total Invoice"
                formatValue={formatCurrency}
                searchValue={searchInvoice}
                onSearchChange={setSearchInvoice}
                showDetailColumns
              />
            </Box>
            <ClientRankingTable
              data={byOutstanding}
              loading={outstandingLoading}
              error={null}
              title="Outstanding Invoice"
              sortBy="outstanding_invoice"
              displayFieldLabel="Outstanding Invoice"
              formatValue={formatCurrency}
              searchValue={searchOutstanding}
              onSearchChange={setSearchOutstanding}
              showDetailColumns
            />
            <ClientRankingTable
              data={byOverdue}
              loading={overdueLoading}
              error={null}
              title="Overdue Invoice"
              sortBy="overdue_invoice"
              displayFieldLabel="Overdue Invoice"
              formatValue={formatCurrency}
              searchValue={searchOverdue}
              onSearchChange={setSearchOverdue}
              showDetailColumns
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
              border: '2px dashed #e0e0e0',
              borderRadius: 2,
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
}
