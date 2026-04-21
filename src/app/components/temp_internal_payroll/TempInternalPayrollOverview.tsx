'use client';

import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BpjsCompanyCostResult,
  fetchBpjsCompanyCost,
  fetchClientOutstandingTable,
  fetchClientOverdueTable,
  fetchProjectFilterOptions,
  fetchSourcedToFilterOptions,
  fetchTempInternalPayrollSummary,
  orderedInvoiceApiDateRange,
  TempInternalPayrollClientRankingRow,
  TempInternalPayrollSummaryResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import DashboardCard from '../shared/DashboardCard';
import ClientRankingTable from './ClientRankingTable';
import CollectionRateCard from './CollectionRateCard';
import TempInternalPayrollMonthlyChart from './TempInternalPayrollMonthlyChart';
import TempInternalPayrollPaidUnpaidChart from './TempInternalPayrollPaidUnpaidChart';
import TempInternalPayrollReceivableRiskChart from './TempInternalPayrollReceivableRiskChart';

const BPJS_EMPTY: BpjsCompanyCostResult = {
  total_bpjs_tk: 0,
  total_bpjs_kesehatan: 0,
  total_bpjs_pensiun: 0,
};

const PLACEHOLDER_SUMMARY: TempInternalPayrollSummaryResponse = {
  status: 'ok',
  total_nilai_invoice_released: 0,
  total_invoice_paid: 0,
  total_outstanding_invoice: 0,
  total_overview_invoice: 0,
  jumlah_invoice: 0,
  collection_rate: 0,
  average_days_to_payment: 0,
  on_time_payment_rate: 0,
  outstanding_invoice_count: 0,
  overdue_invoice_count: 0,
  total_management_fee_amount: 0,
  total_headcount: 0,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** IDR with up to 2 decimals (BPJS amounts from API may include cents). */
function formatCurrencyBpjs(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function payrollAvgPerEmployee(
  payroll: number | undefined,
  headcount: number | undefined
): string | null {
  const p = payroll ?? 0;
  const h = headcount ?? 0;
  if (h <= 0 || p <= 0) return null;
  return formatCurrency(p / h);
}

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

/** Row: month ~2/3, year ~1/3 — standard outlined fields like other filters (no nested border). */
const periodRowSx = {
  display: 'flex',
  gap: 2,
  alignItems: 'flex-start',
  width: '100%',
} as const;

const periodMonthFormSx = { flex: '2 1 0%', minWidth: 0 } as const;
const periodYearFormSx = { flex: '1 1 0%', minWidth: 0 } as const;

export default function TempInternalPayrollOverview() {
  const [summary, setSummary] = useState<TempInternalPayrollSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [byOutstanding, setByOutstanding] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOverdue, setByOverdue] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [outstandingLoading, setOutstandingLoading] = useState(false);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [searchOutstanding, setSearchOutstanding] = useState('');
  const [searchOverdue, setSearchOverdue] = useState('');
  const [debouncedSearchOutstanding, setDebouncedSearchOutstanding] = useState('');
  const [debouncedSearchOverdue, setDebouncedSearchOverdue] = useState('');
  const [bpjsCost, setBpjsCost] = useState<BpjsCompanyCostResult>(BPJS_EMPTY);
  const [bpjsLoading, setBpjsLoading] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
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

  const apiDateRange = useMemo(
    () =>
      startMonth && startYear && endMonth && endYear
        ? orderedInvoiceApiDateRange(startMonth, startYear, endMonth, endYear)
        : { start_date: '', end_date: '' },
    [startMonth, startYear, endMonth, endYear]
  );

  const clientFilters = useMemo(
    () => ({
      start_date: apiDateRange.start_date,
      end_date: apiDateRange.end_date,
      employer,
      product_type: productType,
      customer_segment: customerSegment,
      sourced_to: sourcedTo || '0',
      project: project || '0',
    }),
    [
      apiDateRange.start_date,
      apiDateRange.end_date,
      employer,
      productType,
      customerSegment,
      sourcedTo,
      project,
    ]
  );

  const loadSummary = useCallback(async () => {
    if (!apiDateRange.start_date || !apiDateRange.end_date) {
      setSummary(PLACEHOLDER_SUMMARY);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = {
        start_date: apiDateRange.start_date,
        end_date: apiDateRange.end_date,
        employer,
        product_type: productType,
        customer_segment: customerSegment,
        sourced_to: sourcedTo || '0',
        project: project || '0',
      };
      const data = await fetchTempInternalPayrollSummary(params);
      setSummary(data);
    } catch {
      setSummary(PLACEHOLDER_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [
    apiDateRange.start_date,
    apiDateRange.end_date,
    employer,
    productType,
    customerSegment,
    sourcedTo,
    project,
  ]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!clientFilters.start_date || !clientFilters.end_date) {
      setBpjsCost(BPJS_EMPTY);
      setBpjsLoading(false);
      return;
    }
    let cancelled = false;
    setBpjsLoading(true);
    fetchBpjsCompanyCost(clientFilters)
      .then((r) => {
        if (!cancelled) setBpjsCost(r);
      })
      .catch(() => {
        if (!cancelled) setBpjsCost(BPJS_EMPTY);
      })
      .finally(() => {
        if (!cancelled) setBpjsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientFilters]);

  useEffect(() => {
    if (!clientFilters.start_date || !clientFilters.end_date) return;
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
  }, [clientFilters, debouncedSearchOutstanding]);

  useEffect(() => {
    if (!clientFilters.start_date || !clientFilters.end_date) return;
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
  }, [clientFilters, debouncedSearchOverdue]);

  // Defaults: Jan → current month (same year), on client only (hydration-safe)
  useEffect(() => {
    const d = new Date();
    const cy = d.getFullYear().toString();
    const cm = (d.getMonth() + 1).toString().padStart(2, '0');
    if (!startMonth) setStartMonth('01');
    if (!startYear) setStartYear(cy);
    if (!endMonth) setEndMonth(cm);
    if (!endYear) setEndYear(cy);
  }, []);

  const data = summary ?? PLACEHOLDER_SUMMARY;

  const months = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    const name = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: num, label: name };
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleStartMonthChange = (e: SelectChangeEvent<string>) => setStartMonth(e.target.value);
  const handleStartYearChange = (e: SelectChangeEvent<string>) => setStartYear(e.target.value);
  const handleEndMonthChange = (e: SelectChangeEvent<string>) => setEndMonth(e.target.value);
  const handleEndYearChange = (e: SelectChangeEvent<string>) => setEndYear(e.target.value);
  const handleEmployerChange = (e: SelectChangeEvent<string>) => setEmployer(e.target.value);
  const handleProductTypeChange = (e: SelectChangeEvent<string>) => setProductType(e.target.value);
  const handleCustomerSegmentChange = (e: SelectChangeEvent<string>) => setCustomerSegment(e.target.value);

  const chartFilters = {
    start_date: apiDateRange.start_date,
    end_date: apiDateRange.end_date,
    employer,
    productType,
    customerSegment,
    sourcedTo,
    project,
  };

  const sectionTitleSx = { mb: 2, mt: 0, fontWeight: 600 } as const;
  const statGrid8 = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: { xs: '1fr', md: 'repeat(8, minmax(0, 1fr))' },
    alignItems: 'stretch',
  } as const;

  /** Grid cell: stretch cards to the row’s tallest item. */
  const statGridCellSx = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  } as const;

  const statCardStretchCardSx = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  } as const;

  const statCardStretchContentSx = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  } as const;

  const statCardInnerSx = {
    p: 2,
    minHeight: '96px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 0.75,
  } as const;

  const statCardTitleBlockSx = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  } as const;

  return (
    <PageContainer title="Invoice" description="Invoice summary and collection insights">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Invoice
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Invoice summary and collection rate.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={periodRowSx}>
              <FormControl size="small" fullWidth sx={periodMonthFormSx}>
                <InputLabel id="invoice-start-month-label">Start Month</InputLabel>
                <Select
                  labelId="invoice-start-month-label"
                  value={startMonth}
                  label="Start Month"
                  onChange={handleStartMonthChange}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={periodYearFormSx}>
                <InputLabel id="invoice-start-year-label">Start Year</InputLabel>
                <Select
                  labelId="invoice-start-year-label"
                  value={startYear}
                  label="Start Year"
                  onChange={handleStartYearChange}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={periodRowSx}>
              <FormControl size="small" fullWidth sx={periodMonthFormSx}>
                <InputLabel id="invoice-end-month-label">End Month</InputLabel>
                <Select
                  labelId="invoice-end-month-label"
                  value={endMonth}
                  label="End Month"
                  onChange={handleEndMonthChange}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={periodYearFormSx}>
                <InputLabel id="invoice-end-year-label">End Year</InputLabel>
                <Select
                  labelId="invoice-end-year-label"
                  value={endYear}
                  label="End Year"
                  onChange={handleEndYearChange}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employer</InputLabel>
              <Select value={employer} label="Employer" onChange={handleEmployerChange}>
                {EMPLOYER_OPTIONS.map((o) => (
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
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Segment</InputLabel>
              <Select value={customerSegment} label="Segment" onChange={handleCustomerSegmentChange}>
                {CUSTOMER_SEGMENT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select value={productType} label="Product Type" onChange={handleProductTypeChange}>
                {PRODUCT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 1 }}>
          Revenue &amp; Billing
        </Typography>

        <Box sx={statGrid8}>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatNumber(data.jumlah_invoice)}
                </Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Invoices released
                </Typography>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatCurrency(data.total_nilai_invoice_released)}
                </Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Total invoice amount
                </Typography>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatNumber(data.total_headcount ?? 0)}
                </Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Total headcount
                </Typography>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    formatCurrency(data.total_payroll_disbursed ?? 0)
                  )}
                </Box>
                <Box sx={statCardTitleBlockSx}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total payroll disbursed
                  </Typography>
                  {!loading && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Avg. per employee:{' '}
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {payrollAvgPerEmployee(data.total_payroll_disbursed, data.total_headcount) ?? '—'}
                      </Box>
                    </Typography>
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    formatCurrency(data.total_management_fee_amount ?? 0)
                  )}
                </Box>
                <Box sx={statCardTitleBlockSx}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total management fee
                  </Typography>
                  {!loading && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {data.management_rate_text?.trim() || '—'}
                      </Box>
                      {' '}Management Rate
                    </Typography>
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Box>
        </Box>

        <Box mt={3}>
          <TempInternalPayrollMonthlyChart filters={chartFilters} />
        </Box>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 4 }}>
          Collection
        </Typography>

        <Box sx={statGrid8}>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatCurrency(data.total_outstanding_invoice)}
                </Box>
                <Box sx={statCardTitleBlockSx}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total outstanding invoice
                  </Typography>
                  {!loading && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      From{' '}
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {formatNumber(data.outstanding_invoice_count ?? 0)}
                      </Box>
                      {' '}invoices
                    </Typography>
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatCurrency(data.total_invoice_paid)}
                </Box>
                <Box sx={statCardTitleBlockSx}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total invoice paid
                  </Typography>
                  {!loading && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {data.on_time_rate_text?.trim() || '—'}
                      </Box>
                      {' '}On time payment rate
                    </Typography>
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatCurrency(data.total_overview_invoice)}
                </Box>
                <Box sx={statCardTitleBlockSx}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total invoice overdue
                  </Typography>
                  {!loading && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      From{' '}
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {formatNumber(data.overdue_invoice_count ?? 0)}
                      </Box>
                      {' '}invoices
                    </Typography>
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' }, ...statGridCellSx }}>
            <CollectionRateCard
              title="Collection rate"
              value={data.collection_rate}
              isLoading={loading}
              cardSx={statCardStretchCardSx}
              contentSx={statCardStretchContentSx}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' }, ...statGridCellSx }}>
            <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
              <Box sx={statCardInnerSx}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                  {loading ? <CircularProgress size={24} /> : formatNumber(data.average_days_to_payment)}
                </Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Avg. days to pay
                </Typography>
              </Box>
            </DashboardCard>
          </Box>
        </Box>

        <Box mt={3}>
          <TempInternalPayrollPaidUnpaidChart filters={chartFilters} />
        </Box>

        <Box mt={3}>
          <TempInternalPayrollReceivableRiskChart filters={chartFilters} />
        </Box>

        <Box mt={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ClientRankingTable
            data={byOutstanding}
            loading={outstandingLoading}
            error={null}
            title="Outstanding Invoice"
            sortBy="outstanding_invoice"
            displayFieldLabel="Total Invoice"
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
            displayFieldLabel="Total Invoice"
            formatValue={formatCurrency}
            searchValue={searchOverdue}
            onSearchChange={setSearchOverdue}
            showDetailColumns
          />
        </Box>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 4 }}>
          BPJS Company Cost
        </Typography>
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={statGridCellSx}>
              <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
                <Box sx={statCardInnerSx}>
                  <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                    {bpjsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      formatCurrencyBpjs(bpjsCost.total_bpjs_tk)
                    )}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total BPJS TK
                  </Typography>
                </Box>
              </DashboardCard>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={statGridCellSx}>
              <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
                <Box sx={statCardInnerSx}>
                  <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                    {bpjsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      formatCurrencyBpjs(bpjsCost.total_bpjs_kesehatan)
                    )}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total BPJS Kesehatan
                  </Typography>
                </Box>
              </DashboardCard>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={statGridCellSx}>
              <DashboardCard cardSx={statCardStretchCardSx} contentSx={statCardStretchContentSx}>
                <Box sx={statCardInnerSx}>
                  <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                    {bpjsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      formatCurrencyBpjs(bpjsCost.total_bpjs_pensiun)
                    )}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Total BPJS Pensiun
                  </Typography>
                </Box>
              </DashboardCard>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
