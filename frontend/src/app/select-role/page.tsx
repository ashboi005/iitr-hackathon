'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const RoleSelection = () => {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter(); // ✅ useRouter instead of redirect

  const handleRoleSelection = async (selectedRole: string) => {
    setRole(selectedRole);

    try {
      // ✅ Update user's role via API
      const response = await fetch('/api/updateRole', {
        method: 'POST',
        body: JSON.stringify({ role: selectedRole }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Only navigate after the role is updated
        router.push('/redirect');
      } else {
        alert("Error updating role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1>Select Your Role</h1>
      <div>
        <button onClick={() => handleRoleSelection('employer')} disabled={!isSignedIn}>
          Employer
        </button>
        <button onClick={() => handleRoleSelection('freelancer')} disabled={!isSignedIn}>
          Freelancer
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
