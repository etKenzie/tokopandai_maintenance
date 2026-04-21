'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanOverview from '../../../components/shared/LoanOverview';

const LoanOverviewPage = () => {
  return (
    <LoanOverview
      title="Loan Overview"
      description="Overview of loan data and analytics"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedLoanOverview() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanOverviewPage />
    </ProtectedRoute>
  );
}
