'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanNonPerformingList from '../../../components/shared/LoanNonPerformingList';

const ExtradanaNonPerformingList = () => {
  return (
    <LoanNonPerformingList
      title="Extradana Non-Performing List"
      description="List of extradana non-performing loans and overdue accounts"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedExtradanaNonPerformingList() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <ExtradanaNonPerformingList />
    </ProtectedRoute>
  );
}
