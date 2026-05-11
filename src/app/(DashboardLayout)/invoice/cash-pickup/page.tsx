"use client";

import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import TablePDFGenerateButton from "@/app/components/cash-pickup/invoice/TablePDFGenerateButton";
import type { PickupInvoiceLine } from "@/app/components/cash-pickup/invoice/invoiceCalculations";
import type { Company } from "@/app/components/cash-pickup/invoice/pdf/types/InvoicePDFTypes";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";
import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { getCookie } from "cookies-next";
import NextLink from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

function authHeaders(token: string | undefined): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toPickupLine(raw: Record<string, unknown>): PickupInvoiceLine | null {
  const kode_gerai = String(raw.kode_gerai ?? raw.kode ?? "");
  if (!kode_gerai) return null;
  return {
    kode_gerai,
    outlet: raw.OUTLET != null ? String(raw.OUTLET) : raw.outlet != null ? String(raw.outlet) : "",
    nama_gerai: String(raw.nama_gerai ?? raw.nama ?? ""),
    total_amount: Number(raw.total_amount ?? raw.amount ?? 0),
    invoice_id: String(raw.invoice_id ?? raw.id ?? ""),
    va_number: raw.va_number != null && raw.va_number !== "" ? String(raw.va_number) : "",
    sales_date: String(raw.sales_date ?? raw.salesDate ?? ""),
    pickup_date: String(raw.pickup_date ?? raw.pickupDate ?? ""),
  };
}

function isCompanyShape(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && typeof (x as Record<string, unknown>).slug === "string";
}

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

function parsePickupInvoicesBody(json: unknown): { lines: PickupInvoiceLine[]; totalData: number } {
  if (!json || typeof json !== "object") return { lines: [], totalData: 0 };
  const root = json as Record<string, unknown>;
  if (typeof root.code === "number" && root.code !== 200) {
    throw new Error(String(root.message ?? `API code ${root.code}`));
  }
  const outer = root.data;
  if (!outer || typeof outer !== "object") return { lines: [], totalData: 0 };
  const pack = outer as Record<string, unknown>;
  const meta = pack.metadata;
  let totalData = 0;
  if (meta && typeof meta === "object" && "totalData" in meta) {
    totalData = Number((meta as Record<string, unknown>).totalData) || 0;
  }
  const rows = pack.data;
  if (!Array.isArray(rows)) return { lines: [], totalData };
  const lines = rows
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => toPickupLine(x))
    .filter((x): x is PickupInvoiceLine => x != null);
  return { lines, totalData };
}

async function fetchAllGerai(token: string | undefined): Promise<Company[]> {
  const res = await logMaintenanceFetch("/api/pickup/all-gerai", {
    method: "GET",
    credentials: "include",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`all-gerai failed (${res.status})${t ? `: ${t.slice(0, 200)}` : ""}`);
  }
  const json: unknown = await res.json();
  return parseAllGerai(json);
}

async function fetchPickupInvoices(
  slug: string,
  startDate: string,
  endDate: string,
  token: string | undefined
): Promise<{ lines: PickupInvoiceLine[]; totalData: number }> {
  const qs = new URLSearchParams({
    limit: "100000",
    page: "1",
    startDate,
    endDate,
  });
  const url = `/api/pickup/${encodeURIComponent(slug)}/invoices?${qs.toString()}`;
  const res = await logMaintenanceFetch(url, {
    method: "GET",
    credentials: "include",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`invoices failed (${res.status})${t ? `: ${t.slice(0, 200)}` : ""}`);
  }
  const json: unknown = await res.json();
  return parsePickupInvoicesBody(json);
}

function formatIdr(n: number) {
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("id-ID");
}

function formatIdrRp(n: number) {
  if (Number.isNaN(n)) return "—";
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/** First and last day of previous calendar month (local). */
function getPastMonthRange(): { start: string; end: string } {
  const pad = (x: number) => String(x).padStart(2, "0");
  const today = new Date();
  const lastPrev = new Date(today.getFullYear(), today.getMonth(), 0);
  const firstPrev = new Date(lastPrev.getFullYear(), lastPrev.getMonth(), 1);
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { start: fmt(firstPrev), end: fmt(lastPrev) };
}

const initialMonth = getPastMonthRange();

const headCellSx = {
  fontWeight: 700,
  fontSize: "0.95rem",
  py: 2.25,
  px: 2,
  lineHeight: 1.3,
  backgroundColor: "action.hover",
  borderBottom: 2,
  borderColor: "divider",
} as const;

const bodyCellSx = {
  py: 2,
  px: 2,
  fontSize: "0.9375rem",
  verticalAlign: "middle",
} as const;

export default function CashPickupPdfPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [geraiLoading, setGeraiLoading] = useState(true);
  /** True only after `/api/pickup/all-gerai` succeeds (see `filtersLocked` for company + date fields). */
  const [geraiReady, setGeraiReady] = useState(false);
  const [geraiError, setGeraiError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const [periodStart, setPeriodStart] = useState(initialMonth.start);
  const [periodEnd, setPeriodEnd] = useState(initialMonth.end);
  const [pickupLines, setPickupLines] = useState<PickupInvoiceLine[]>([]);
  const [totalData, setTotalData] = useState<number | null>(null);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);

  const totalAmountSum = useMemo(
    () => pickupLines.reduce((sum, row) => sum + (Number(row.total_amount) || 0), 0),
    [pickupLines]
  );

  /** Lock company + date filters while gerai loads, until gerai succeeds, or while pickup rows are fetching. */
  const filtersLocked =
    geraiLoading || !geraiReady || companies.length === 0 || pickupLoading;

  const loadGerai = useCallback(async () => {
    setGeraiReady(false);
    setGeraiLoading(true);
    setGeraiError(null);
    try {
      const token = getCookie("token");
      const list = await fetchAllGerai(token ? String(token) : undefined);
      setCompanies(list);
      setCompany((prev) => {
        if (prev && list.some((c) => c.slug === prev.slug)) return prev;
        return list[0] ?? null;
      });
      setGeraiReady(true);
    } catch (e) {
      setGeraiError(e instanceof Error ? e.message : "Failed to load gerai");
      setCompanies([]);
      setCompany(null);
      setGeraiReady(false);
    } finally {
      setGeraiLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGerai();
  }, [loadGerai]);

  const loadPickupInvoices = useCallback(async () => {
    if (!company) return;
    setPickupLoading(true);
    setPickupError(null);
    setTotalData(null);
    try {
      const token = getCookie("token");
      const { lines, totalData: td } = await fetchPickupInvoices(
        company.slug,
        periodStart,
        periodEnd,
        token ? String(token) : undefined
      );
      setPickupLines(lines);
      setTotalData(td);
    } catch (e) {
      setPickupLines([]);
      setPickupError(e instanceof Error ? e.message : "Failed to load pickup invoices");
    } finally {
      setPickupLoading(false);
    }
  }, [company, periodEnd, periodStart]);

  useEffect(() => {
    if (!geraiReady || !company) return;
    void loadPickupInvoices();
  }, [geraiReady, company, periodStart, periodEnd, loadPickupInvoices]);

  return (
    <PageContainer title="Cash pickup" description="Pickup invoices and PDF">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Cash pickup
        </Typography>
        <MuiLink component={NextLink} href="/invoice/list" underline="hover">
          Invoice list
        </MuiLink>
      </Box>

      <BlankCard>
        <CardContent>
          {geraiError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {geraiError}{" "}
              <Button size="small" onClick={() => void loadGerai()}>
                Retry
              </Button>
            </Alert>
          ) : null}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 220 }} disabled={filtersLocked}>
              <InputLabel id="company-select">Company</InputLabel>
              <Select
                labelId="company-select"
                label="Company"
                value={company?.slug ?? ""}
                onChange={(e) => {
                  const next = companies.find((c) => c.slug === e.target.value);
                  if (next) setCompany(next);
                }}
              >
                {companies.map((c) => (
                  <MenuItem key={c.slug} value={c.slug}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {geraiLoading ? <CircularProgress size={24} /> : null}
            <TextField
              label="Start date"
              type="date"
              size="small"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={filtersLocked}
            />
            <TextField
              label="End date"
              type="date"
              size="small"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={filtersLocked}
            />
            <Button variant="contained" onClick={() => void loadPickupInvoices()} disabled={filtersLocked || !company}>
              {pickupLoading ? <CircularProgress size={22} color="inherit" /> : "Refresh"}
            </Button>
            {company ? (
              <TablePDFGenerateButton
                invoices={pickupLines}
                company={company}
                startDate={periodStart}
                endDate={periodEnd}
                disabled={pickupLines.length === 0 || pickupLoading}
              />
            ) : null}
          </Box>

          {pickupError ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {pickupError}
            </Alert>
          ) : null}

          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
            <Paper
              variant="outlined"
              sx={{
                flex: "1 1 200px",
                px: 2.5,
                py: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Invoices
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2 }}>
                {pickupLoading ? "…" : pickupLines.length.toLocaleString("id-ID")}
              </Typography>
              {totalData != null && totalData !== pickupLines.length ? (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  API total: {totalData.toLocaleString("id-ID")}
                </Typography>
              ) : null}
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                flex: "1 1 200px",
                px: 2.5,
                py: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Total amount
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2, color: "primary.main" }}>
                {pickupLoading ? "…" : formatIdrRp(totalAmountSum)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Sum of loaded rows
              </Typography>
            </Paper>
          </Box>

          <TableContainer sx={{ maxHeight: 560, border: 1, borderColor: "divider", borderRadius: 2, boxShadow: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>Kode gerai</TableCell>
                  <TableCell sx={headCellSx}>Nama gerai</TableCell>
                  <TableCell sx={headCellSx}>Invoice ID</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Amount</TableCell>
                  <TableCell sx={headCellSx}>VA</TableCell>
                  <TableCell sx={headCellSx}>Sales</TableCell>
                  <TableCell sx={headCellSx}>Pickup</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pickupLines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ ...bodyCellSx, py: 5 }}>
                      <Typography color="text.secondary" align="center">
                        {pickupLoading ? "Loading…" : "No rows for this range."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pickupLines.map((row, index) => (
                    <TableRow
                      key={`pickup-${index}-${row.invoice_id}-${row.kode_gerai}-${row.sales_date}-${row.total_amount}`}
                      hover
                      sx={{ "&:nth-of-type(even)": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell sx={bodyCellSx}>{row.kode_gerai}</TableCell>
                      <TableCell sx={bodyCellSx}>{row.nama_gerai}</TableCell>
                      <TableCell sx={bodyCellSx}>{row.invoice_id}</TableCell>
                      <TableCell sx={{ ...bodyCellSx, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                        {formatIdr(row.total_amount)}
                      </TableCell>
                      <TableCell sx={bodyCellSx}>{row.va_number || "—"}</TableCell>
                      <TableCell sx={bodyCellSx}>{row.sales_date}</TableCell>
                      <TableCell sx={bodyCellSx}>{row.pickup_date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
}
