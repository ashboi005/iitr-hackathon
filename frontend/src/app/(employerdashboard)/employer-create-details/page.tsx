"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { EmployerProfileDialog } from "@/components/EmployerProfile";

interface UserDetails {
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
}


interface EmployerDetails {
  worksNeeded?: string[];
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE
export default function EmployerCreateDetailPage() {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [employerDetails, setEmployerDetails] = useState<EmployerDetails | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch existing user details
        const userRes = await fetch(`${API_BASE}/user-details/basic/${user?.id}`);
        if (userRes.ok) {
          setUserDetails(await userRes.json());
        }

        // Fetch existing employer details
        const employerRes = await fetch(`${API_BASE}/user-details/employer/${user?.id}`);
        if (employerRes.ok) {
          setEmployerDetails(await employerRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleEmployerSave = async (basicData: any, employerData: any) => {
    try {
      // Convert empty strings to null for basic data
      const processedBasicData = {
        phone: basicData.phone || null,
        address: basicData.address || null,
        bio: basicData.bio || null,
        profilePicture: basicData.profilePicture || null
      };
  
      const userResponse = await fetch(`${API_BASE}/user-details/basic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...processedBasicData,
          clerkId: user?.id
        })
      });
  
      if (!userResponse.ok) throw new Error('Failed to save user details');
  
      const employerResponse = await fetch(`${API_BASE}/user-details/employer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksNeeded: employerData.worksNeeded,
          clerkId: user?.id
        })
      });
  
      if (!employerResponse.ok) throw new Error('Failed to save employer details');
  
      setUserDetails(processedBasicData);
      setEmployerDetails(employerData);
      
      // No return value needed
    } catch (error) {
      console.error('Save failed:', error);
      // Consider adding error handling (e.g., toast notifications) here
    }
  };
  

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Employer Profile Setup</h1>
      <EmployerProfileDialog
        userDetails={userDetails}
        employerDetails={employerDetails}
        onSave={handleEmployerSave}
      />
    </div>
  );
}