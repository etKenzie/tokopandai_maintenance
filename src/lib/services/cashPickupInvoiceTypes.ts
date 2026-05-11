import type { Company } from "@/app/components/cash-pickup/invoice/pdf/types/InvoicePDFTypes";
import type { ExtendedInvoiceData } from "@/app/components/cash-pickup/invoice/pdf/types/InvoicePDFTypes";
import type { PickupInvoiceLine } from "@/app/components/cash-pickup/invoice/invoiceCalculations";

/**
 * Row shape for MySQL table `cash_pickup_invoices` (DDL: database/mysql/cash_pickup_invoices.sql).
 * Not PostgreSQL — persist through your `service_tokopandai` MySQL API, not Supabase.
 *
 * `table_data` is the source of truth for PDF output; edit to change retroactively.
 */
export interface CashPickupInvoiceRow {
  id: string;
  company_slug: string;
  company_name: string;
  /** e.g. `cash_pickup` from `GET /api/invoices`. */
  type?: string | null;
  company_snapshot: Company | null;
  invoice_no: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  table_data: ExtendedInvoiceData["table_data"];
  source_lines: PickupInvoiceLine[] | null;
  calculation_version: number;
  total_amount_rupiah: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Build PDF inputs from a stored row (after optional edits to table_data). */
export function rowToExtendedInvoiceData(row: CashPickupInvoiceRow): ExtendedInvoiceData {
  return {
    start_date: row.period_start,
    end_date: row.period_end,
    due_date: row.due_date,
    date: row.invoice_date,
    invoice_no: row.invoice_no,
    table_data: row.table_data,
  };
}

/** Prefer snapshot; else minimal Company for PDF factory. */
export function rowToCompany(row: CashPickupInvoiceRow): Company {
  if (row.company_snapshot) {
    return row.company_snapshot;
  }
  return {
    id: 0,
    name: row.company_name,
    slug: row.company_slug,
    db_name: "",
    desc: row.company_name,
  };
}
