'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanDashboard from '../../../components/shared/LoanDashboard';

const KasbonDashboard = () => {
  return (
    <LoanDashboard
      title="Kasbon Dashboard"
      description="Manage kasbon data for employees"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedKasbonDashboard() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <KasbonDashboard />
    </ProtectedRoute>
  );
}