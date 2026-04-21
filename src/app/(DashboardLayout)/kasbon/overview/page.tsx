'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanOverview from '../../../components/shared/LoanOverview';

const KasbonOverview = () => {
  return (
    <LoanOverview
      title="Kasbon Overview"
      description="Overview of kasbon data and analytics"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedKasbonOverview() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <KasbonOverview />
    </ProtectedRoute>
  );
}