'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanDashboard from '../../../components/shared/LoanDashboard';

const LoanClientPerformancePage = () => {
  return (
    <LoanDashboard
      title="Loan Client Performance"
      description="Manage loan data for employees"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedLoanClientPerformance() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanClientPerformancePage />
    </ProtectedRoute>
  );
}

