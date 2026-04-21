'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ExternalPayrollDashboard from '../../components/external_payroll/ExternalPayrollDashboard';

const ExternalPayrollPage = () => {
  return (
    <ExternalPayrollDashboard
      title="External Payroll"
      description="View external payroll metrics and analytics"
      requiredRoles={getPageRoles('PAYROLL_DASHBOARD')}
    />
  );
};

export default function ProtectedExternalPayroll() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('PAYROLL_DASHBOARD')}>
      <ExternalPayrollPage />
    </ProtectedRoute>
  );
}
