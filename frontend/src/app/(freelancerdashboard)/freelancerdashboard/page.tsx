// app/user-dashboard/page.tsx

import ProtectRoute from '@/protected/ProtectRoute';
import { SignOutButton } from '@clerk/nextjs';

const FreelancerDashboard = () => {
  return (
    <ProtectRoute allowedRoles={['Freelancer']}>
      <div>
        <h1>Welcome to the  Frelancer Dashboard</h1>
        <SignOutButton/>
        {/* Your User Dashboard content */}
      </div>
    </ProtectRoute>
  );
};

export default FreelancerDashboard;