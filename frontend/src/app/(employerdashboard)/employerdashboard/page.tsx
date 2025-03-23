// app/user-dashboard/page.tsx

import ProtectRoute from '@/protected/ProtectRoute';
import { SignOutButton } from '@clerk/nextjs';

const EmployerDashboard = () => {
  return (
      <div>
        <h1>Welcome to the Employer Dashboard</h1>
        <SignOutButton/>
        {/* Your User Dashboard content */}
      </div>
    
  );
};

export default EmployerDashboard;