/**
 * Mirrors juraganbeku_monitoring InvoicePreviewModal company-specific rules.
 * Pickup API line items → invoice table rows + grand total.
 */

export interface PickupInvoiceLine {
  kode_gerai: string;
  outlet?: string;
  total_amount: number;
  invoice_id: string;
  nama_gerai: string;
  va_number: string;
  sales_date: string;
  pickup_date: string;
}

export interface InvoiceTableData {
  headers: string[];
  rows: string[][];
}

const JIWA_THRESHOLD = 1_000_000_000;
const JIWA_CHARGE_HIGH = 3_000_000;
const JIWA_CHARGE_LOW = 2_500_000;
const DARMI_PER_PICKUP = 40_000;
const JABARANO_THRESHOLD = 100_000_000;
const JABARANO_FEE_LOW = 1_000_000;
const JABARANO_FEE_HIGH = 1_500_000;

function roscikRatePerPickup(pickupCount: number): number {
  if (pickupCount > 20) return 30_000;
  if (pickupCount > 10) return 35_000;
  return 40_000;
}

export function buildInvoiceTableAndTotal(
  companySlug: string,
  invoices: PickupInvoiceLine[]
): { tableData: InvoiceTableData; totalAmount: number } {
  const slug = companySlug.toLowerCase();

  if (slug === "janji_jiwa") {
    const geraiMap = new Map<
      string,
      { kode_gerai: string; nama_gerai: string; pickup_total: number; total_amount: number }
    >();

    for (const invoice of invoices) {
      const { kode_gerai, nama_gerai, total_amount } = invoice;
      const existing = geraiMap.get(kode_gerai);
      if (existing) {
        existing.pickup_total += total_amount;
      } else {
        geraiMap.set(kode_gerai, {
          kode_gerai,
          nama_gerai,
          pickup_total: total_amount,
          total_amount: 0,
        });
      }
    }

    const rows: string[][] = [];
    let totalAmount = 0;
    geraiMap.forEach((gerai) => {
      gerai.total_amount = gerai.pickup_total > JIWA_THRESHOLD ? JIWA_CHARGE_HIGH : JIWA_CHARGE_LOW;
      totalAmount += gerai.total_amount;
      rows.push([
        gerai.kode_gerai,
        gerai.nama_gerai,
        `Rp ${gerai.pickup_total.toLocaleString("id-ID")}`,
        `Rp ${gerai.total_amount.toLocaleString("id-ID")}`,
      ]);
    });

    return {
      tableData: {
        headers: ["Kode Gerai", "Nama Gerai", "Pickup Total", "Total Amount"],
        rows,
      },
      totalAmount,
    };
  }

  if (slug === "mbok_darmi") {
    const geraiMap = new Map<string, { kode_gerai: string; nama_gerai: string; pickup_count: number }>();

    for (const invoice of invoices) {
      const { kode_gerai, nama_gerai } = invoice;
      const existing = geraiMap.get(kode_gerai);
      if (existing) {
        existing.pickup_count += 1;
      } else {
        geraiMap.set(kode_gerai, { kode_gerai, nama_gerai, pickup_count: 1 });
      }
    }

    const rows: string[][] = [];
    let totalAmount = 0;
    geraiMap.forEach((gerai) => {
      const lineTotal = gerai.pickup_count * DARMI_PER_PICKUP;
      totalAmount += lineTotal;
      rows.push([
        gerai.kode_gerai,
        gerai.nama_gerai,
        gerai.pickup_count.toString(),
        `Rp ${DARMI_PER_PICKUP.toLocaleString("id-ID")}`,
        `Rp ${lineTotal.toLocaleString("id-ID")}`,
      ]);
    });

    return {
      tableData: {
        headers: ["Kode Gerai", "Nama Gerai", "Pick Up/Month", "Amount", "Total Amount"],
        rows,
      },
      totalAmount,
    };
  }

  if (slug === "roscik") {
    const geraiMap = new Map<string, { kode_gerai: string; nama_gerai: string; pickup_count: number }>();

    for (const invoice of invoices) {
      const { kode_gerai, nama_gerai } = invoice;
      const existing = geraiMap.get(kode_gerai);
      if (existing) {
        existing.pickup_count += 1;
      } else {
        geraiMap.set(kode_gerai, { kode_gerai, nama_gerai, pickup_count: 1 });
      }
    }

    const rows: string[][] = [];
    let totalAmount = 0;
    geraiMap.forEach((gerai) => {
      const rate = roscikRatePerPickup(gerai.pickup_count);
      const lineTotal = gerai.pickup_count * rate;
      totalAmount += lineTotal;
      rows.push([
        gerai.kode_gerai,
        gerai.nama_gerai,
        gerai.pickup_count.toString(),
        `Rp ${rate.toLocaleString("id-ID")}`,
        `Rp ${lineTotal.toLocaleString("id-ID")}`,
      ]);
    });

    return {
      tableData: {
        headers: ["Kode Gerai", "Nama Gerai", "Pick Up/Month", "Amount", "Total Amount"],
        rows,
      },
      totalAmount,
    };
  }

  if (slug === "hangry") {
    const rows = invoices.map((invoice) => [
      invoice.kode_gerai,
      invoice.nama_gerai,
      invoice.invoice_id,
      `Rp ${invoice.total_amount.toLocaleString("id-ID")}`,
      invoice.sales_date,
      invoice.pickup_date,
    ]);
    const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
    return {
      tableData: {
        headers: ["Kode Gerai", "Nama Gerai", "Invoice ID", "Total Amount", "Sales Date", "Pickup Date"],
        rows,
      },
      totalAmount,
    };
  }

  if (slug === "jabarno" || slug === "jabarano") {
    const geraiMap = new Map<
      string,
      { kode_gerai: string; nama_gerai: string; total_invoice: number; fee: number }
    >();

    for (const invoice of invoices) {
      const kodeGerai = String(invoice.kode_gerai ?? "").trim() || "UNKNOWN";
      const namaGerai =
        String(invoice.nama_gerai ?? invoice.outlet ?? "").trim() || "Unknown Outlet";
      const existing = geraiMap.get(kodeGerai);
      if (existing) {
        existing.total_invoice += Number(invoice.total_amount) || 0;
      } else {
        geraiMap.set(kodeGerai, {
          kode_gerai: kodeGerai,
          nama_gerai: namaGerai,
          total_invoice: Number(invoice.total_amount) || 0,
          fee: 0,
        });
      }
    }

    const rows: string[][] = [];
    let totalAmount = 0;
    geraiMap.forEach((gerai) => {
      gerai.fee = gerai.total_invoice < JABARANO_THRESHOLD ? JABARANO_FEE_LOW : JABARANO_FEE_HIGH;
      totalAmount += gerai.fee;
      rows.push([
        gerai.kode_gerai,
        gerai.nama_gerai,
        `Rp ${gerai.total_invoice.toLocaleString("id-ID")}`,
        `Rp ${gerai.fee.toLocaleString("id-ID")}`,
      ]);
    });

    return {
      tableData: {
        headers: ["Kode Gerai", "Nama Gerai", "Total Invoice", "Fee Given"],
        rows,
      },
      totalAmount,
    };
  }

  if (slug === "haus") {
    const rows = invoices.map((invoice) => [
      invoice.kode_gerai,
      invoice.nama_gerai,
      invoice.va_number,
      `Rp ${invoice.total_amount.toLocaleString("id-ID")}`,
      invoice.sales_date,
    ]);
    const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
    return {
      tableData: {
        headers: ["Kode Gerai", "Nama Gerai", "VA Number", "Total Amount", "Sales Date"],
        rows,
      },
      totalAmount,
    };
  }

  const rows = invoices.map((invoice) => [
    invoice.kode_gerai,
    invoice.nama_gerai,
    invoice.invoice_id,
    `Rp ${invoice.total_amount.toLocaleString("id-ID")}`,
    invoice.sales_date,
  ]);
  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  return {
    tableData: {
      headers: ["Kode Gerai", "Nama Gerai", "Invoice ID", "Total Amount", "Sales Date"],
      rows,
    },
    totalAmount,
  };
}
