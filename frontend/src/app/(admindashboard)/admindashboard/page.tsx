// app/admin-dashboard/page.tsx

import ProtectRoute from "@/protected/ProtectRoute";

const AdminDashboard = () => {
  return (
    <ProtectRoute allowedRoles={['admin']}>
      <div>
        <h1>Welcome to the Admin Dashboard</h1>
        {/* Your Admin Dashboard content */}
      </div>
    </ProtectRoute>
  );
};

export default AdminDashboard;