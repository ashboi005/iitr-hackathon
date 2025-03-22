"use client"; // Ensure this is at the very top to specify that this file should be client-side

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import next/navigation for routing and search params
import FreelancerApplicationForm from "@/components/FreelancerApplicationForm"; // Import your component

const GigDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // Get the gig ID from the URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [gigDetails, setGigDetails] = useState<any>(null);

  // Fetch gig details based on gig ID
  useEffect(() => {
    if (id) {
      fetch(`${apiUrl}/Prod/gigs/${id}`)
        .then((response) => response.json())
        .then((data) => setGigDetails(data))
        .catch((error) => console.error("Error fetching gig details:", error));
    }
  }, [id]);

  if (!gigDetails) return <div>Loading...</div>; // Show loading state while fetching gig details

  return (
    <div>
      <h1 className="text-2xl font-bold">{gigDetails.title}</h1>
      <p>{gigDetails.description}</p>
      <p><strong>Skills Needed:</strong> {gigDetails.skills_needed.join(", ")}</p>
      <p><strong>Project Deadline:</strong> {new Date(gigDetails.project_deadline).toLocaleString()}</p>

      {/* Pass the gigId to the FreelancerApplicationForm component */}
      <FreelancerApplicationForm gigId={gigDetails.id} />
    </div>
  );
};

export default GigDetailsPage;
