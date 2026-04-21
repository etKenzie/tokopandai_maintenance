'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanNonPerformingList from '../../../components/shared/LoanNonPerformingList';

const LoanNonPerformingListPage = () => {
  return (
    <LoanNonPerformingList
      title="Loan Non-Performing List"
      description="List of non-performing loans and overdue accounts"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedLoanNonPerformingList() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanNonPerformingListPage />
    </ProtectedRoute>
  );
}

