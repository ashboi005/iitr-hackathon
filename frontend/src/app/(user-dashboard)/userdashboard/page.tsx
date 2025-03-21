// app/user-dashboard/page.tsx

import ProtectRoute from '@/app/protected/ProtectRoute';

const UserDashboard = () => {
  return (
    <ProtectRoute allowedRoles={['user']}>
      <div>
        <h1>Welcome to the User Dashboard</h1>
        {/* Your User Dashboard content */}
      </div>
    </ProtectRoute>
  );
};

export default UserDashboard;
