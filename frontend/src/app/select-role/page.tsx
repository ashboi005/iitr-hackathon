import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

const RoleSelection = () => {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);

  const handleRoleSelection = async () => {
    if (!role) {
      alert("Please select a role.");
      return;
    }

    // Make API request to backend to update the user's role
    const response = await fetch('/api/updateRole', {
      method: 'POST',
      body: JSON.stringify({ role }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      alert("Role updated successfully.");
    } else {
      alert("Error updating role.");
    }
  };

  return (
    <div>
      <h1>Select Your Role</h1>
      <div>
        <label>
          <input
            type="radio"
            value="employer"
            checked={role === 'employer'}
            onChange={() => setRole('employer')}
          />
          Employer
        </label>
        <label>
          <input
            type="radio"
            value="freelancer"
            checked={role === 'freelancer'}
            onChange={() => setRole('freelancer')}
          />
          Freelancer
        </label>
      </div>

      <button onClick={handleRoleSelection} disabled={!isSignedIn || !role}>
        Set Role
      </button>
    </div>
  );
};

export default RoleSelection;
