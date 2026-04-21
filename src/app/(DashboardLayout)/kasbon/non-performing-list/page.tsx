'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanNonPerformingList from '../../../components/shared/LoanNonPerformingList';

const KasbonNonPerformingList = () => {
  return (
    <LoanNonPerformingList
      title="Kasbon Non-Performing List"
      description="List of kasbon non-performing loans and overdue accounts"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedKasbonNonPerformingList() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <KasbonNonPerformingList />
    </ProtectedRoute>
  );
}