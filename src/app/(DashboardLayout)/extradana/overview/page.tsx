'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanOverview from '../../../components/shared/LoanOverview';

const ExtradanaOverview = () => {
  return (
    <LoanOverview
      title="Extradana Overview"
      description="Overview of extradana data and analytics"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedExtradanaOverview() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <ExtradanaOverview />
    </ProtectedRoute>
  );
}
