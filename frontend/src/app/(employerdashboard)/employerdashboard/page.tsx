// app/user-dashboard/page.tsx

import ProtectRoute from '@/protected/ProtectRoute';
import { SignOutButton } from '@clerk/nextjs';

const EmployerDashboard = () => {
  return (
    <ProtectRoute allowedRoles={['employer']}>
      <div>
        <h1>Welcome to the Employer Dashboard</h1>
        <SignOutButton/>
        {/* Your User Dashboard content */}
      </div>
    </ProtectRoute>
  );
};

export default EmployerDashboard;