'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanDashboard from '../../../components/shared/LoanDashboard';

const ExtradanaDashboard = () => {
  return (
    <LoanDashboard
      title="Extradana Dashboard"
      description="Manage extradana data for employees"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedExtradanaDashboard() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <ExtradanaDashboard />
    </ProtectedRoute>
  );
}
