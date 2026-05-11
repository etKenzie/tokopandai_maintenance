-- Cash pickup invoices (MySQL 8.0.13+)
-- Run while connected to database `service_tokopandai`.
-- Requires: JSON columns, DEFAULT (UUID()) for id (8.0.13+).
-- If UUID default is rejected, use: id CHAR(36) NOT NULL PRIMARY KEY and set UUID in app on INSERT.
--
-- PDF shape matches ExtendedInvoiceData + company slug in the app.

CREATE TABLE IF NOT EXISTS cash_pickup_invoices (
  id CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'UUID string from UUID()',
  company_slug VARCHAR(128) NOT NULL COMMENT 'e.g. janji_jiwa; drives PDF template',
  company_name VARCHAR(255) NOT NULL,
  company_snapshot JSON NULL COMMENT 'Optional: { id, name, slug, db_name, desc }',
  invoice_no VARCHAR(128) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  table_data JSON NOT NULL COMMENT '{ headers: string[], rows: string[][] }',
  source_lines JSON NULL COMMENT 'Optional pickup API line snapshot',
  calculation_version INT NOT NULL DEFAULT 1,
  total_amount_rupiah BIGINT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_cash_pickup_company_invoice_no (company_slug, invoice_no),
  KEY idx_cash_pickup_company_slug (company_slug),
  KEY idx_cash_pickup_period (company_slug, period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores PDF payload; edit table_data to change output retroactively';
