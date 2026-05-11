"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import type { Company } from "./pdf/types/InvoicePDFTypes";
import { buildInvoiceTableAndTotal, type PickupInvoiceLine } from "./invoiceCalculations";

/** Fields passed to the parent when creating a stored invoice (matches POST body shape after mapping). */
export interface CreateInvoiceConfirmPayload {
  start_date: string;
  end_date: string;
  due_date: string;
  date: string;
  invoice_no: string;
  table_data: {
    headers: string[];
    rows: string[][];
  };
  total_amount_rupiah: number;
  notes: string | null;
}

export interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (invoiceData: CreateInvoiceConfirmPayload) => Promise<void>;
  invoices: PickupInvoiceLine[];
  company: Company;
  startDate?: string;
  endDate?: string;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  open,
  onClose,
  onConfirm,
  invoices,
  company,
  startDate,
  endDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDueDate, setSelectedDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [invoiceNo, setInvoiceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { tableData, totalAmount } = useMemo(
    () => buildInvoiceTableAndTotal(company.slug, invoices),
    [invoices, company.slug]
  );

  const handleClose = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setInvoiceNo("");
    setNotes("");
    setError(null);
    setSubmitting(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!startDate || !endDate || !selectedDate || !selectedDueDate || !invoiceNo) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm({
        start_date: startDate,
        end_date: endDate,
        due_date: selectedDueDate,
        date: selectedDate,
        invoice_no: invoiceNo,
        table_data: tableData,
        total_amount_rupiah: totalAmount,
        notes: notes.trim() ? notes.trim() : null,
      });
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Create invoice — {company.name}</DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="textSecondary">
            Preview from {invoices.length} pickup line{invoices.length !== 1 ? "s" : ""} ({startDate} → {endDate}).
            The table below is saved as <code>table_data</code> when you create the invoice.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            mb: 3,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          }}
        >
          <TextField
            fullWidth
            type="date"
            label="Invoice date"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            disabled={submitting}
          />
          <TextField
            fullWidth
            type="date"
            label="Due date"
            InputLabelProps={{ shrink: true }}
            value={selectedDueDate}
            onChange={(e) => setSelectedDueDate(e.target.value)}
            required
            disabled={submitting}
          />
          <TextField
            fullWidth
            label="Invoice number"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="e.g., INV-JJ-2026-001"
            required
            disabled={submitting}
          />
          <TextField
            fullWidth
            label="Total amount"
            value={`Rp ${totalAmount.toLocaleString("id-ID")}`}
            InputProps={{ readOnly: true }}
          />
        </Box>

        <TextField
          fullWidth
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional note"
          multiline
          minRows={2}
          sx={{ mb: 3 }}
          disabled={submitting}
        />

        <Typography variant="h6" mb={2}>
          Table data (saved)
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {tableData.headers.map((header, index) => (
                  <TableCell key={index} sx={{ fontWeight: "bold", backgroundColor: "grey.100" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            {tableData.rows.length} row{tableData.rows.length !== 1 ? "s" : ""} · Rp {totalAmount.toLocaleString("id-ID")}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          variant="contained"
          disabled={submitting || !selectedDate || !selectedDueDate || !invoiceNo}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting ? "Saving…" : "Create invoice"}
        </Button>
      </DialogActions>
      {error && (
        <Alert severity="error" sx={{ m: 2, mt: 0 }}>
          {error}
        </Alert>
      )}
    </Dialog>
  );
};

export default InvoicePreviewModal;
