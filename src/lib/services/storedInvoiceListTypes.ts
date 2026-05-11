import type { CashPickupInvoiceRow } from "./cashPickupInvoiceTypes";

/** Row from list API proxied to `{NEXT_PUBLIC_API_URL}/invoices`. */
export type StoredInvoiceListRow = CashPickupInvoiceRow;

export interface StoredInvoicesListResponse {
  status: string;
  data: StoredInvoiceListRow[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
