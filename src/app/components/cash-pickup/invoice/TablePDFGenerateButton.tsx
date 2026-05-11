"use client";

import { Receipt as InvoiceIcon } from "@mui/icons-material";
import { Alert, Button, Snackbar, Tooltip } from "@mui/material";
import React, { useState } from "react";
import type { Company } from "./pdf/types/InvoicePDFTypes";
import InvoicePreviewModal, { type CreateInvoiceConfirmPayload } from "./InvoicePreviewModal";
import type { PickupInvoiceLine } from "./invoiceCalculations";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";
import { getCookie } from "cookies-next";

interface TablePDFGenerateButtonProps {
  invoices: PickupInvoiceLine[];
  company: Company;
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  startDate?: string;
  endDate?: string;
}

function buildCreateInvoiceBody(company: Company, data: CreateInvoiceConfirmPayload) {
  return {
    company_slug: company.slug,
    company_name: company.name,
    company_snapshot: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      db_name: company.db_name,
      desc: company.desc ?? "",
    },
    invoice_no: data.invoice_no,
    invoice_date: data.date,
    due_date: data.due_date,
    period_start: data.start_date,
    period_end: data.end_date,
    table_data: data.table_data,
    source_lines: null,
    calculation_version: 1,
    total_amount_rupiah: data.total_amount_rupiah,
    notes: data.notes,
  };
}

const TablePDFGenerateButton: React.FC<TablePDFGenerateButtonProps> = ({
  invoices,
  company,
  variant = "contained",
  size = "medium",
  disabled = false,
  showTooltip = true,
  tooltipText = "Review table data and create a stored invoice",
  startDate = "",
  endDate = "",
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const handleOpenModal = () => {
    if (invoices.length === 0) return;
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCreateInvoice = async (invoiceData: CreateInvoiceConfirmPayload) => {
    const token = getCookie("token");
    const body = buildCreateInvoiceBody(company, invoiceData);

    const res = await logMaintenanceFetch("/api/invoices", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${String(token)}` } : {}),
      },
      body: JSON.stringify(body),
    });

    let json: Record<string, unknown> = {};
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      const msg =
        (typeof json.message === "string" && json.message) ||
        (typeof json.error === "string" && json.error) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    setSnackbar({
      open: true,
      message: `Invoice created: ${invoiceData.invoice_no}`,
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      startIcon={<InvoiceIcon />}
      onClick={handleOpenModal}
      disabled={disabled || invoices.length === 0}
      sx={{ minWidth: "auto" }}
    >
      Create invoice
    </Button>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={tooltipText} arrow>
          {button}
        </Tooltip>
      ) : (
        button
      )}

      <InvoicePreviewModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleCreateInvoice}
        invoices={invoices}
        company={company}
        startDate={startDate}
        endDate={endDate}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TablePDFGenerateButton;
