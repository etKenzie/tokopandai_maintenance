'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import TempInternalPayrollOverview from '../../components/temp_internal_payroll/TempInternalPayrollOverview';

const InvoicePage = () => {
  return <TempInternalPayrollOverview />;
};

export default function ProtectedInvoicePage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <InvoicePage />
    </ProtectedRoute>
  );
}
