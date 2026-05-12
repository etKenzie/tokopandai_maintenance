"use client";

import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import InvoiceClientTotalsChart from "@/app/components/cash-pickup/invoice/InvoiceClientTotalsChart";
import { pdfService } from "@/app/components/cash-pickup/invoice/pdf/PDFService";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";
import type { Company } from "@/app/components/cash-pickup/invoice/pdf/types/InvoicePDFTypes";
import { rowToCompany, rowToExtendedInvoiceData } from "@/lib/services/cashPickupInvoiceTypes";
import type { StoredInvoiceListRow, StoredInvoicesListResponse } from "@/lib/services/storedInvoiceListTypes";
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  FormControl,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { getCookie } from "cookies-next";
import NextLink from "next/link";
import React, { useCallback, useEffect, useState } from "react";

const defaultPeriodStart = "2026-04-01";
const defaultPeriodEnd = "2026-04-30";

function formatIdr(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

type RowBusy = { id: string; op: "pdf" } | null;

function authHeader(): HeadersInit {
  const token = getCookie("token");
  return token ? { Authorization: `Bearer ${String(token)}` } : {};
}

function isCompanyShape(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && typeof (x as Record<string, unknown>).slug === "string";
}

/** Same response as `GET {{API_2}}/api/pickup/all-gerai`. */
function parseAllGerai(json: unknown): Company[] {
  if (!json || typeof json !== "object") return [];
  const root = json as Record<string, unknown>;
  const data = root.data;
  if (!Array.isArray(data)) return [];
  return data.filter(isCompanyShape).map((o) => ({
    id: Number(o.id) || 0,
    name: String(o.name ?? ""),
    slug: String(o.slug),
    db_name: String(o.db_name ?? ""),
    desc: String(o.desc ?? o.name ?? ""),
  }));
}

function normalizeTableForEdit(data: { headers?: string[] | null; rows?: string[][] | null }): { headers: string[]; rows: string[][] } {
  let headers = [...(data.headers ?? [])].map((h) => (h == null ? "" : String(h)));
  let rows = [...(data.rows ?? [])].map((r) => (Array.isArray(r) ? r.map((c) => (c == null ? "" : String(c))) : []));
  if (headers.length === 0 && rows.length > 0) {
    const n = Math.max(1, ...rows.map((r) => r.length));
    headers = Array.from({ length: n }, (_, i) => `Column ${i + 1}`);
  }
  if (headers.length === 0) {
    headers = ["Col 1", "Col 2"];
    rows = [["", ""]];
  }
  rows = rows.map((r) => {
    const cells = [...r];
    while (cells.length < headers.length) cells.push("");
    return cells.slice(0, headers.length);
  });
  if (rows.length === 0) {
    rows = [Array(headers.length).fill("")];
  }
  return { headers, rows };
}

function buildTableDataForPatch(headers: string[], rows: string[][]) {
  const h = headers.map((x) => x.trim());
  const r = rows.map((row) => {
    const cells = [...row];
    while (cells.length < h.length) cells.push("");
    return cells.slice(0, h.length).map((c) => String(c));
  });
  return { headers: h, rows: r };
}

const CHART_FETCH_LIMIT = 100;
const CHART_MAX_PAGES = 300;

/** Paginates through invoices for the period and sums `total_amount_rupiah` per client. */
async function fetchTotalsByClientForPeriod(
  periodStart: string,
  periodEnd: string,
  companySlug: string
): Promise<{ label: string; total: number }[]> {
  const token = getCookie("token");
  const headers: HeadersInit = token ? { Authorization: `Bearer ${String(token)}` } : {};
  const slug = companySlug.trim();
  const totals = new Map<string, { label: string; total: number }>();
  let pageNum = 1;

  while (pageNum <= CHART_MAX_PAGES) {
    const qs = new URLSearchParams({
      period_start: periodStart,
      period_end: periodEnd,
      page: String(pageNum),
      limit: String(CHART_FETCH_LIMIT),
    });
    if (slug) qs.set("company_slug", slug);

    const res = await logMaintenanceFetch(`/api/invoices?${qs.toString()}`, {
      method: "GET",
      credentials: "include",
      headers,
    });
    const json = (await res.json()) as StoredInvoicesListResponse & { error?: string; message?: string };
    if (!res.ok || json.status !== "success" || !Array.isArray(json.data)) {
      break;
    }
    const batch = json.data;
    if (batch.length === 0) break;

    for (const row of batch) {
      const key = row.company_slug || row.company_name;
      const amt = Number(row.total_amount_rupiah);
      const safeAmt = Number.isFinite(amt) ? amt : 0;
      const label = (row.company_name || key).trim() || key;
      const prev = totals.get(key);
      if (prev) {
        prev.total += safeAmt;
      } else {
        totals.set(key, { label, total: safeAmt });
      }
    }

    const totalPages = json.metadata?.totalPages;
    if (typeof totalPages === "number" && totalPages > 0 && pageNum >= totalPages) break;
    if (batch.length < CHART_FETCH_LIMIT) break;
    pageNum += 1;
  }

  return [...totals.values()].sort((a, b) => b.total - a.total);
}

export default function InvoiceListPage() {
  /** Optional; empty string = all clients (omit `company_slug` on list GET). */
  const [clientSlug, setClientSlug] = useState("");
  const [clients, setClients] = useState<Company[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState(defaultPeriodStart);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriodEnd);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<StoredInvoicesListResponse | null>(null);

  const [rowBusy, setRowBusy] = useState<RowBusy>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoredInvoiceListRow | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [editingRow, setEditingRow] = useState<StoredInvoiceListRow | null>(null);
  const [editInvoiceNo, setEditInvoiceNo] = useState("");
  const [editInvoiceDate, setEditInvoiceDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPeriodStart, setEditPeriodStart] = useState("");
  const [editPeriodEnd, setEditPeriodEnd] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState("");
  const [editCalcVersion, setEditCalcVersion] = useState("1");
  const [editTableHeaders, setEditTableHeaders] = useState<string[]>([]);
  const [editTableRows, setEditTableRows] = useState<string[][]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const [chartPoints, setChartPoints] = useState<{ label: string; total: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const token = getCookie("token");
      const res = await logMaintenanceFetch("/api/pickup/all-gerai", {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${String(token)}` } : {},
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`all-gerai (${res.status})${t ? `: ${t.slice(0, 120)}` : ""}`);
      }
      const json: unknown = await res.json();
      setClients(parseAllGerai(json));
    } catch (e) {
      console.error(e);
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getCookie("token");
      const qs = new URLSearchParams({
        period_start: periodStart,
        period_end: periodEnd,
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      const slug = clientSlug.trim();
      if (slug) qs.set("company_slug", slug);
      const res = await logMaintenanceFetch(`/api/invoices?${qs.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = (await res.json()) as StoredInvoicesListResponse & { error?: string; message?: string };
      if (!res.ok) {
        const msg = json.error || json.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      if (json.status !== "success") {
        throw new Error(json.status ? `Unexpected status: ${json.status}` : "Invalid response");
      }
      setPayload(json);
    } catch (e) {
      console.error(e);
      setPayload(null);
      setError(e instanceof Error ? e.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [clientSlug, periodEnd, periodStart, page, rowsPerPage]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChartLoading(true);
      try {
        const pts = await fetchTotalsByClientForPeriod(periodStart, periodEnd, clientSlug);
        if (!cancelled) setChartPoints(pts);
      } catch (e) {
        console.error(e);
        if (!cancelled) setChartPoints([]);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [periodStart, periodEnd, clientSlug]);

  const rows = payload?.data ?? [];
  const total = payload?.metadata?.total ?? 0;

  const handleDownloadPdf = async (row: StoredInvoiceListRow) => {
    setRowBusy({ id: row.id, op: "pdf" });
    try {
      await pdfService.generateInvoicePDF(rowToExtendedInvoiceData(row), rowToCompany(row));
      setSnack({ open: true, message: `PDF generated for ${row.invoice_no}`, severity: "success" });
    } catch (e) {
      setSnack({
        open: true,
        message: e instanceof Error ? e.message : "PDF failed",
        severity: "error",
      });
    } finally {
      setRowBusy(null);
    }
  };

  const openEdit = (row: StoredInvoiceListRow) => {
    setEditingRow(row);
    setEditInvoiceNo(row.invoice_no);
    setEditInvoiceDate(row.invoice_date);
    setEditDueDate(row.due_date);
    setEditPeriodStart(row.period_start);
    setEditPeriodEnd(row.period_end);
    setEditNotes(row.notes ?? "");
    setEditTotalAmount(row.total_amount_rupiah != null ? String(row.total_amount_rupiah) : "");
    setEditCalcVersion(String(row.calculation_version ?? 1));
    const normalized = normalizeTableForEdit(row.table_data ?? { headers: [], rows: [] });
    setEditTableHeaders(normalized.headers);
    setEditTableRows(normalized.rows);
    setEditError(null);
  };

  const closeEdit = () => {
    setEditingRow(null);
    setEditError(null);
    setEditSaving(false);
  };

  const updateEditHeader = (index: number, value: string) => {
    setEditTableHeaders((prev) => prev.map((h, i) => (i === index ? value : h)));
  };

  const updateEditCell = (rowIndex: number, colIndex: number, value: string) => {
    setEditTableRows((prev) =>
      prev.map((row, ri) => (ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row))
    );
  };

  const addEditColumn = () => {
    setEditTableHeaders((prev) => [...prev, `Column ${prev.length + 1}`]);
    setEditTableRows((prev) => prev.map((row) => [...row, ""]));
  };

  const removeEditColumn = (colIndex: number) => {
    if (editTableHeaders.length <= 1) return;
    setEditTableHeaders((prev) => prev.filter((_, i) => i !== colIndex));
    setEditTableRows((prev) => prev.map((row) => row.filter((_, i) => i !== colIndex)));
  };

  const addEditRow = () => {
    setEditTableRows((prev) => [...prev, Array(editTableHeaders.length).fill("")]);
  };

  const removeEditRow = (rowIndex: number) => {
    if (editTableRows.length <= 1) return;
    setEditTableRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    if (editTableHeaders.length === 0) {
      setEditError("Add at least one column.");
      return;
    }
    const table_data = buildTableDataForPatch(editTableHeaders, editTableRows);

    setEditSaving(true);
    setEditError(null);
    try {
      const body = {
        company_slug: editingRow.company_slug,
        company_name: editingRow.company_name,
        company_snapshot: editingRow.company_snapshot,
        invoice_no: editInvoiceNo.trim(),
        invoice_date: editInvoiceDate,
        due_date: editDueDate,
        period_start: editPeriodStart,
        period_end: editPeriodEnd,
        table_data,
        source_lines: editingRow.source_lines,
        calculation_version: Number(editCalcVersion) || 1,
        total_amount_rupiah: editTotalAmount === "" ? null : Number(editTotalAmount),
        notes: editNotes.trim() ? editNotes.trim() : null,
        ...(editingRow.type != null && editingRow.type !== "" ? { type: editingRow.type } : {}),
      };

      const res = await logMaintenanceFetch(`/api/invoices/${encodeURIComponent(editingRow.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.message || json.error || `PATCH failed (${res.status})`);
      }
      setSnack({ open: true, message: `Updated ${editInvoiceNo}`, severity: "success" });
      closeEdit();
      void fetchInvoices();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const res = await logMaintenanceFetch(`/api/invoices/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.message || json.error || `DELETE failed (${res.status})`);
      }
      setSnack({ open: true, message: `Deleted ${deleteTarget.invoice_no}`, severity: "success" });
      setDeleteTarget(null);
      void fetchInvoices();
    } catch (e) {
      setSnack({
        open: true,
        message: e instanceof Error ? e.message : "Delete failed",
        severity: "error",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <PageContainer title="Main" description="Stored invoices">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Main
        </Typography>
        <MuiLink component={NextLink} href="/invoice/cash-pickup" underline="hover">
          Cash pickup
        </MuiLink>
      </Box>

      <Box sx={{ mb: 3 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Totals by client
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sum of invoice totals for the selected period
              {clientSlug.trim() ? " (current client filter)." : " (all clients)."}
            </Typography>
            <InvoiceClientTotalsChart points={chartPoints} loading={chartLoading} />
          </CardContent>
        </BlankCard>
      </Box>

      <BlankCard>
        <CardContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 240 }} disabled={clientsLoading}>
              <InputLabel id="invoice-list-client">Client</InputLabel>
              <Select
                labelId="invoice-list-client"
                label="Client"
                value={clientSlug}
                onChange={(e) => {
                  setClientSlug(String(e.target.value));
                  setPage(0);
                }}
              >
                <MenuItem value="">
                  <em>All clients</em>
                </MenuItem>
                {clients.map((c) => (
                  <MenuItem key={c.slug} value={c.slug}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {clientsLoading ? <CircularProgress size={24} sx={{ alignSelf: "center" }} /> : null}
            <TextField
              label="Period start"
              type="date"
              size="small"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Period end"
              type="date"
              size="small"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <Button variant="contained" onClick={() => void fetchInvoices()} disabled={loading}>
              Refresh
            </Button>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <TableContainer sx={{ position: "relative", minHeight: 120 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
                <CircularProgress size={36} />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice no.</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Invoice date</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography color="text.secondary">No rows for this filter.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => {
                      const pdfBusy = rowBusy?.id === row.id && rowBusy.op === "pdf";
                      const deleteRowBusy = deleteSubmitting && deleteTarget?.id === row.id;
                      const anyRowBusy = rowBusy !== null || deleteSubmitting;
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.invoice_no}</TableCell>
                          <TableCell>
                            {row.type ? <Chip size="small" label={row.type} variant="outlined" /> : "—"}
                          </TableCell>
                          <TableCell>{row.company_name}</TableCell>
                          <TableCell>{row.invoice_date}</TableCell>
                          <TableCell>{row.due_date}</TableCell>
                          <TableCell>
                            {row.period_start} → {row.period_end}
                          </TableCell>
                          <TableCell align="right">{formatIdr(row.total_amount_rupiah)}</TableCell>
                          <TableCell>{row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="Download PDF">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => void handleDownloadPdf(row)}
                                    disabled={anyRowBusy}
                                    color="primary"
                                  >
                                    {pdfBusy ? <CircularProgress size={20} /> : <PictureAsPdfIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => openEdit(row)}
                                  disabled={anyRowBusy || editingRow !== null}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteTarget(row)}
                                    disabled={anyRowBusy || editingRow !== null}
                                    color="error"
                                  >
                                    {deleteRowBusy ? <CircularProgress size={20} /> : <DeleteOutlineIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </CardContent>
      </BlankCard>

      <Dialog open={editingRow !== null} onClose={editSaving ? undefined : closeEdit} maxWidth="lg" fullWidth>
        <DialogTitle>Edit invoice {editingRow?.invoice_no}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {editError ? (
            <Alert severity="error" onClose={() => setEditError(null)}>
              {editError}
            </Alert>
          ) : null}
          <TextField label="Invoice no." value={editInvoiceNo} onChange={(e) => setEditInvoiceNo(e.target.value)} fullWidth disabled={editSaving} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Invoice date" type="date" value={editInvoiceDate} onChange={(e) => setEditInvoiceDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth disabled={editSaving} />
            <TextField label="Due date" type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth disabled={editSaving} />
            <TextField label="Period start" type="date" value={editPeriodStart} onChange={(e) => setEditPeriodStart(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth disabled={editSaving} />
            <TextField label="Period end" type="date" value={editPeriodEnd} onChange={(e) => setEditPeriodEnd(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth disabled={editSaving} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Total (rupiah)" value={editTotalAmount} onChange={(e) => setEditTotalAmount(e.target.value)} fullWidth disabled={editSaving} />
            <TextField label="Calculation version" value={editCalcVersion} onChange={(e) => setEditCalcVersion(e.target.value)} fullWidth disabled={editSaving} />
          </Box>
          <TextField label="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} fullWidth multiline minRows={2} disabled={editSaving} />

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Table data (PATCH)
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addEditColumn} disabled={editSaving}>
                Add column
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {editTableHeaders.map((header, colIndex) => (
                      <TableCell key={`h-${colIndex}`} sx={{ verticalAlign: "top", minWidth: 140, backgroundColor: "action.hover" }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`Header ${colIndex + 1}`}
                          value={header}
                          onChange={(e) => updateEditHeader(colIndex, e.target.value)}
                          disabled={editSaving}
                        />
                        <Button size="small" color="error" disabled={editSaving || editTableHeaders.length <= 1} onClick={() => removeEditColumn(colIndex)} sx={{ mt: 0.5 }}>
                          Remove column
                        </Button>
                      </TableCell>
                    ))}
                    <TableCell padding="none" sx={{ width: 48, backgroundColor: "action.hover" }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editTableRows.map((dataRow, rowIndex) => (
                    <TableRow key={`r-${rowIndex}`}>
                      {editTableHeaders.map((_, colIndex) => (
                        <TableCell key={`c-${rowIndex}-${colIndex}`}>
                          <TextField
                            fullWidth
                            size="small"
                            value={dataRow[colIndex] ?? ""}
                            onChange={(e) => updateEditCell(rowIndex, colIndex, e.target.value)}
                            disabled={editSaving}
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <IconButton size="small" color="error" disabled={editSaving || editTableRows.length <= 1} onClick={() => removeEditRow(rowIndex)} aria-label="Remove row">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button sx={{ mt: 1 }} size="small" startIcon={<AddIcon />} onClick={addEditRow} disabled={editSaving}>
              Add row
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={editSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()} disabled={editSaving}>
            {editSaving ? <CircularProgress size={22} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteTarget !== null} onClose={deleteSubmitting ? undefined : () => setDeleteTarget(null)}>
        <DialogTitle>Delete invoice?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete <strong>{deleteTarget?.invoice_no}</strong> ({deleteTarget?.company_name}).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteSubmitting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleConfirmDelete()} disabled={deleteSubmitting}>
            {deleteSubmitting ? <CircularProgress size={22} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
